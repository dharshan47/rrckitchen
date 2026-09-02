"use server"

import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { toTitleCase } from "@/lib/utils"
import { PartnerStatus } from "@/lib/generated/prisma/client"

export interface NearbyKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null
  coverImageUrl: string | null
  cuisineTags: string[]
  distanceKm: number | null | undefined
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
    const redisRaw = redis as unknown as { geosearch: (key: string, center: { type: "FROMLONLAT"; coordinate: { lon: number; lat: number } }, shape: { type: "BYRADIUS"; radius: number; radiusType: string }, order: string) => Promise<unknown[]> }
    const geoResults = await redisRaw.geosearch(
      "kitchens:geo",
      { type: "FROMLONLAT", coordinate: { lon: longitude, lat: latitude } },
      { type: "BYRADIUS", radius: maxDistanceKm, radiusType: "KM" },
      "ASC",
    )
    nearbyKitchenIds = Array.isArray(geoResults)
      ? geoResults.map((r: unknown) => String((r as { member: string }).member))
      : []
  } catch {
    const allAddresses = await prisma.kitchenAddress.findMany({
      include: { kitchenPartner: { select: { id: true, status: true } } },
    })
    nearbyKitchenIds = allAddresses
      .filter(
        (a) =>
          a.kitchenPartner.status === PartnerStatus.ACTIVE ||
          a.kitchenPartner.status === PartnerStatus.APPROVED,
      )
      .map((a) => a.kitchenPartner.id)
  }

  if (nearbyKitchenIds.length === 0) return []

  const kitchens = await prisma.kitchenPartner.findMany({
    where: {
      id: { in: nearbyKitchenIds },
      status: { in: [PartnerStatus.APPROVED, PartnerStatus.ACTIVE] },
    },
    include: {
      kitchenAlias: true,
      kitchenCategories: { include: { category: true } },
      kitchenAddress: true,
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
    const address = kitchen.kitchenAddress
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

      return {
        id: k.id,
        slug: k.slug,
        displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
        avgRating,
        totalReviews: k._count.reviews,
        coverImageUrl: k.kitchenAlias?.coverImageUrl ?? null,
        imageUrl: k.kitchenAlias?.imageUrl ?? null,
        cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
        distanceKm: kitchenDistances.get(k.id),
      }
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
}
