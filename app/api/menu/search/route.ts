import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import slugify from "slugify"
import { toTitleCase } from "@/lib/utils"

const CACHE_TTL = 45
const PAGE_SIZE = 12

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() ?? ""
  const cursor = url.searchParams.get("cursor")
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? String(PAGE_SIZE), 10),
    50,
  )

  if (!q || q.length < 1) {
    return NextResponse.json({ dishes: [], kitchens: [], nextCursor: null })
  }

  const cacheKey = cursor
    ? null
    : `menu:search:${q.toLowerCase().replace(/\s+/g, "_")}`

  if (cacheKey) {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      })
    }
  }

  const search = q.toLowerCase()

  const kitchenQuery = {
    where: {
      status: { in: ["APPROVED", "ACTIVE"] as const },
      OR: [
        {
          kitchenAlias: {
            displayName: { contains: search, mode: "insensitive" },
          },
        },
        {
          menus: {
            some: {
              isActive: true,
              menuItems: {
                some: {
                  isAvailable: true,
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      avgRating: true,
      totalReviews: true,
      kitchenAlias: { select: { displayName: true, imageUrl: true } },
      kitchenCategories: {
        select: { category: { select: { name: true } } },
      },
      operatingHours: true,
      estimatedPrepTime: true,
      kitchenAddress: {
        select: { latitude: true, longitude: true },
      },
    },
    orderBy: { avgRating: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  } satisfies Parameters<typeof prisma.kitchenPartner.findMany>[0]

  const [dishes, kitchenRows] = await Promise.all([
    !cursor
      ? prisma.menuItem.findMany({
          where: {
            isAvailable: true,
            menu: { isActive: true },
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              {
                menu: {
                  kitchenPartner: {
                    kitchenAlias: {
                      displayName: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            compareAtPrice: true,
            foodType: true,
            timeSlot: true,
            menu: {
              select: {
                kitchenPartner: {
                  select: {
                    id: true,
                    slug: true,
                    kitchenAlias: { select: { displayName: true, imageUrl: true } },
                  },
                },
              },
            },
            photos: {
              take: 1,
              orderBy: { sortOrder: "asc" },
              select: { imageUrl: true },
            },
          },
          take: 10,
          orderBy: { name: "asc" },
        })
      : [],
    prisma.kitchenPartner.findMany(kitchenQuery),
  ])

  const hasMore = kitchenRows.length > limit
  const pagedKitchens = hasMore ? kitchenRows.slice(0, limit) : kitchenRows
  const nextCursor =
    hasMore && pagedKitchens.length > 0
      ? pagedKitchens[pagedKitchens.length - 1].id
      : null

  const kitchenIds = pagedKitchens.map((k) => k.id)
  const kitchenMenuItems = kitchenIds.length > 0
    ? await prisma.menuItem.findMany({
        where: {
          isAvailable: true,
          menu: {
            isActive: true,
            kitchenPartnerId: { in: kitchenIds },
          },
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          menu: { select: { kitchenPartnerId: true } },
          photos: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { imageUrl: true },
          },
        },
        orderBy: { name: "asc" },
      })
    : []

  const itemsByKitchen = new Map<string, { id: string; slug?: string; name: string; price: number; imageUrl: string | null }[]>()
  for (const mi of kitchenMenuItems) {
    const kid = mi.menu.kitchenPartnerId
    if (!itemsByKitchen.has(kid)) itemsByKitchen.set(kid, [])
    const arr = itemsByKitchen.get(kid)!
    if (arr.length < 4) {
      arr.push({
        id: mi.id,
        slug: mi.slug ?? undefined,
        name: mi.name,
        price: Number(mi.price),
        imageUrl: mi.photos[0]?.imageUrl ?? null,
      })
    }
  }

  const result = {
    dishes: !cursor
      ? dishes.map((item) => ({
          id: item.id,
          slug: item.slug || slugify(item.name, { lower: true, strict: true }),
          name: item.name,
          price: Number(item.price),
          compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
          foodType: item.foodType,
          timeSlot: item.timeSlot,
          kitchenName: toTitleCase(item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? ""),
          kitchenId: item.menu?.kitchenPartner?.id ?? null,
          kitchenSlug: item.menu?.kitchenPartner?.slug ?? undefined,
          imageUrl: item.photos[0]?.imageUrl ?? null,
        }))
      : [],
    kitchens: pagedKitchens.map((k) => {
      const kitchenItems = itemsByKitchen.get(k.id) ?? []
      const displayName = toTitleCase(k.kitchenAlias?.displayName ?? k.slug)
      return {
        id: k.id,
        slug: k.slug || slugify(displayName, { lower: true, strict: true }),
        displayName,
        avgRating: Number(k.avgRating),
        totalReviews: k.totalReviews,
        cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
        imageUrl: kitchenItems[0]?.imageUrl ?? k.kitchenAlias?.imageUrl ?? null,
        profileImage: k.kitchenAlias?.imageUrl ?? null,
        items: kitchenItems,
        operatingHours: k.operatingHours as Record<string, { open: string; close: string }> | null,
        estimatedPrepTime: k.estimatedPrepTime,
        lat: k.kitchenAddress?.latitude ?? null,
        lng: k.kitchenAddress?.longitude ?? null,
      }
    }),
  }

  const payload = { ...result, nextCursor }

  if (cacheKey) {
    await redis.set(cacheKey, payload, { ex: CACHE_TTL })
  }

  return NextResponse.json(payload, {
    headers: {
      "X-Cache": "MISS",
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  })
}
