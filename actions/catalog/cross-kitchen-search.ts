/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"

export interface CrossKitchenSearchInput {
  query: string
  latitude: number
  longitude: number
  maxDistanceKm?: number
  timeSlot?: string
  foodType?: string
  limit?: number
  offset?: number
}

export interface CrossKitchenResult {
  items: Array<{
    id: string
    name: string
    description: string | null
    price: number
    foodType: string
    timeSlot: string
    kitchenName: string
    kitchenId: string
    distanceKm: number | null
    avgRating: number | null
    imageUrl: string | null
  }>
  total: number
}

export async function searchAcrossKitchens(input: CrossKitchenSearchInput): Promise<CrossKitchenResult> {
  const { query, latitude, longitude, maxDistanceKm = 10, timeSlot, foodType, limit = 20, offset = 0 } = input

  let nearbyKitchenIds: string[] = []

  try {
    const redisRaw = redis as any
    const geoResults = await redisRaw.geosearch(
      "kitchens:geo",
      { type: "FROMLONLAT", coordinate: { lon: longitude, lat: latitude } },
      { type: "BYRADIUS", radius: maxDistanceKm, radiusType: "KM" },
      "ASC",
    )
    nearbyKitchenIds = Array.isArray(geoResults) ? geoResults.map((r: any) => String(r.member)) : []
  } catch {
    const allAddresses = await prisma.kitchenAddress.findMany({
      include: { kitchenPartner: { select: { id: true, status: true } } },
    })

    nearbyKitchenIds = allAddresses
      .filter((a) => a.kitchenPartner.status === "ACTIVE" || a.kitchenPartner.status === "APPROVED")
      .map((a) => a.kitchenPartner.id)
  }

  if (nearbyKitchenIds.length === 0) {
    return { items: [], total: 0 }
  }

  const where: Record<string, unknown> = {
    menu: { kitchenPartnerId: { in: nearbyKitchenIds } },
    deletedAt: null,
    isAvailable: true,
  }

  if (query.trim()) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  if (timeSlot) {
    where.timeSlot = timeSlot
  }

  if (foodType) {
    where.foodType = foodType
  }

  const [menuItems, total] = await Promise.all([
    prisma.menuItem.findMany({
      where: where as any,
      include: {
        menu: {
          include: {
            kitchenPartner: {
              include: { kitchenAlias: true },
            },
          },
        },
        photos: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ menu: { kitchenPartner: { reviews: { _count: "desc" } } } }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.menuItem.count({ where: where as any }),
  ])

  const kitchenIds = [...new Set(menuItems.map((item) => item.menu.kitchenPartnerId))]

  const [addresses, ratingRows] = await Promise.all([
    prisma.kitchenAddress.findMany({
      where: { kitchenPartnerId: { in: kitchenIds } },
    }),
    prisma.review.groupBy({
      by: ["kitchenPartnerId"],
      where: { kitchenPartnerId: { in: kitchenIds } },
      _avg: { rating: true },
    }),
  ])

  const addressByKitchen = new Map(addresses.map((a) => [a.kitchenPartnerId, a]))
  const ratingByKitchen = new Map(ratingRows.map((r) => [r.kitchenPartnerId, r._avg.rating]))

  const kitchenDistances = new Map<string, number | null>()
  for (const item of menuItems) {
    if (!kitchenDistances.has(item.menu.kitchenPartnerId)) {
      const address = addressByKitchen.get(item.menu.kitchenPartnerId)
      if (address) {
        kitchenDistances.set(
          item.menu.kitchenPartnerId,
          Math.round(haversineDistance(latitude, longitude, address.latitude, address.longitude) * 10) / 10,
        )
      } else {
        kitchenDistances.set(item.menu.kitchenPartnerId, null)
      }
    }
  }

  const items = menuItems.map((item) => {
    const avgRating = ratingByKitchen.get(item.menu.kitchenPartnerId)

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName: item.menu.kitchenPartner.kitchenAlias?.displayName ?? "",
      kitchenId: item.menu.kitchenPartnerId,
      distanceKm: kitchenDistances.get(item.menu.kitchenPartnerId) ?? null,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      imageUrl: item.photos[0]?.imageUrl ?? null,
    }
  })

  return { items, total }
}

export async function indexKitchenInRedis(kitchenPartnerId: string) {
  const address = await prisma.kitchenAddress.findUnique({
    where: { kitchenPartnerId },
  })

  if (!address) return

  await (redis as any).geoadd("kitchens:geo", { longitude: address.longitude, latitude: address.latitude, member: kitchenPartnerId })
}

export async function removeKitchenFromRedis(kitchenPartnerId: string) {
  await (redis as any).zrem("kitchens:geo", kitchenPartnerId)
}

export async function reindexAllKitchens() {
  const addresses = await prisma.kitchenAddress.findMany({
    where: {
      kitchenPartner: {
        status: { in: ["APPROVED", "ACTIVE"] },
      },
    },
  })

  for (const addr of addresses) {
    await (redis as any).geoadd("kitchens:geo", { longitude: addr.longitude, latitude: addr.latitude, member: addr.kitchenPartnerId })
  }

  return { count: addresses.length }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
