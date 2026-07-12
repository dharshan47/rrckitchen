import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() ?? ""

  if (!q || q.length < 1) {
    return NextResponse.json({ dishes: [], kitchens: [] })
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
        status: "APPROVED",
        kitchenAlias: {
          displayName: { contains: search, mode: "insensitive" },
        },
      },
      select: {
        id: true,
        avgRating: true,
        totalReviews: true,
        kitchenAlias: { select: { displayName: true } },
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
        },
        select: {
          id: true,
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

  const itemsByKitchen = new Map<string, { id: string; name: string; price: number; imageUrl: string | null }[]>()
  for (const mi of kitchenMenuItems) {
    const kid = mi.menu.kitchenPartnerId
    if (!itemsByKitchen.has(kid)) itemsByKitchen.set(kid, [])
    const arr = itemsByKitchen.get(kid)!
    if (arr.length < 4) {
      arr.push({
        id: mi.id,
        name: mi.name,
        price: Number(mi.price),
        imageUrl: mi.photos[0]?.imageUrl ?? null,
      })
    }
  }

  return NextResponse.json({
    dishes: dishes.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen",
      kitchenId: item.menu?.kitchenPartner?.id ?? null,
      imageUrl: item.photos[0]?.imageUrl ?? null,
    })),
    kitchens: kitchenRows.map((k) => ({
      id: k.id,
      displayName: k.kitchenAlias?.displayName ?? "Unknown Kitchen",
      avgRating: Number(k.avgRating),
      totalReviews: k.totalReviews,
      items: itemsByKitchen.get(k.id) ?? [],
    })),
  })
}
