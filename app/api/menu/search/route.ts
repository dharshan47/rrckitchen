import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import slugify from "slugify"

const CACHE_TTL = 45

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() ?? ""

  if (!q || q.length < 1) {
    return NextResponse.json({ dishes: [], kitchens: [] })
  }

  const cacheKey = `menu:search:${q.toLowerCase().replace(/\s+/g, "_")}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    })
  }

  const search = q.toLowerCase()

  const [dishes, kitchenRows] = await Promise.all([
    prisma.menuItem.findMany({
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
                kitchenAlias: { select: { displayName: true } },
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
    }),
    prisma.kitchenPartner.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
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
        kitchenAlias: { select: { displayName: true } },
        kitchenCategories: {
          select: { category: { select: { name: true } } },
        },
      },
      take: 5,
      orderBy: { avgRating: "desc" },
    }),
  ])

  const kitchenIds = kitchenRows.map((k) => k.id)
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
    dishes: dishes.map((item) => ({
      id: item.id,
        slug: item.slug || slugify(item.name, { lower: true, strict: true }),
      name: item.name,
      price: Number(item.price),
      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "",
      kitchenId: item.menu?.kitchenPartner?.id ?? null,
      kitchenSlug: item.menu?.kitchenPartner?.slug ?? undefined,
      imageUrl: item.photos[0]?.imageUrl ?? null,
    })),
    kitchens: kitchenRows.map((k) => {
      const kitchenItems = itemsByKitchen.get(k.id) ?? []
      const displayName = k.kitchenAlias?.displayName ?? ""
      return {
        id: k.id,
        slug: k.slug || slugify(displayName, { lower: true, strict: true }),
        displayName,
        avgRating: Number(k.avgRating),
        totalReviews: k.totalReviews,
        cuisineTags: k.kitchenCategories.map((kc) => kc.category.name),
        imageUrl: kitchenItems[0]?.imageUrl ?? null,
        items: kitchenItems,
      }
    }),
  }

  await redis.set(cacheKey, result, { ex: CACHE_TTL })

  return NextResponse.json(result, {
    headers: {
      "X-Cache": "MISS",
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  })
}
