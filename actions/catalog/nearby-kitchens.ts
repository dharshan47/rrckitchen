"use server"

import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"

export interface NearbyKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null
  cuisineTags: string[]
  distanceKm: number | null
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getNearbyKitchens(
  latitude: number,
  longitude: number,
  maxDistanceKm = 15,
): Promise<NearbyKitchen[]> {
  let nearbyKitchenIds: string[] = []

  try {
    const redisRaw = redis as unknown as { geosearch: (key: string, center: { longitude: number; latitude: number }, radius: { radius: number; unit: string }) => Promise<unknown[]> }
    const geoResults = await redisRaw.geosearch(
      "kitchens:geo",
      { longitude, latitude },
      { radius: maxDistanceKm, unit: "km" },
    )
    nearbyKitchenIds = Array.isArray(geoResults)
      ? geoResults.map((r: unknown) => String((r as { member: string }).member))
      : []
  } catch {
    const allAddresses = await prisma.kitchenAddress.findMany({
      include: { kitchenPartner: { select: { id: true, status: true } } },
    })
    nearbyKitchenIds = allAddresses
      .filter((a) => a.kitchenPartner.status === "ACTIVE" || a.kitchenPartner.status === "APPROVED")
      .map((a) => a.kitchenPartner.id)
  }

  if (nearbyKitchenIds.length === 0) return []

  const kitchens = await prisma.kitchenPartner.findMany({
    where: {
      id: { in: nearbyKitchenIds },
      status: { in: ["APPROVED", "ACTIVE"] },
    },
    include: {
      kitchenAlias: true,
      kitchenCategories: { include: { category: true } },
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
            take: 1,
          },
        },
        take: 1,
      },
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
  })

  const kitchenDistances = new Map<string, number | null>()
  for (const kitchen of kitchens) {
    const address = await prisma.kitchenAddress.findFirst({
      where: { kitchenPartnerId: kitchen.id },
    })
    if (address) {
      const dist = haversineDistance(latitude, longitude, address.latitude, address.longitude)
      kitchenDistances.set(kitchen.id, Math.round(dist * 10) / 10)
    } else {
      kitchenDistances.set(kitchen.id, null)
    }
  }

  return kitchens
    .map((k) => {
      const avgRating =
        k.reviews.length > 0
          ? Math.round((k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length) * 10) / 10
          : null

      const firstItemPhoto = k.menus[0]?.menuItems[0]?.photos[0]?.imageUrl ?? null

      return {
        id: k.id,
        slug: k.slug,
        displayName: k.kitchenAlias?.displayName ?? "",
        avgRating,
        totalReviews: k._count.reviews,
        imageUrl: firstItemPhoto,
        cuisineTags: k.kitchenCategories.map((kc) => kc.category.name),
        distanceKm: kitchenDistances.get(k.id) ?? null,
      }
    })
    .sort((a, b) => {
      if (a.distanceKm === null) return 1
      if (b.distanceKm === null) return -1
      return a.distanceKm - b.distanceKm
    })
}
