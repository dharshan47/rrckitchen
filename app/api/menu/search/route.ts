import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() ?? ""

  if (!q || q.length < 1) {
    return NextResponse.json({ items: [], kitchens: [] })
  }

  const search = q.toLowerCase()

  const [items, kitchens] = await Promise.all([
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
        kitchenAlias: { select: { displayName: true } },
      },
      take: 5,
      orderBy: { avgRating: "desc" },
    }),
  ])

  return NextResponse.json({
    items: items.map((item) => ({
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
    kitchens: kitchens.map((k) => ({
      id: k.id,
      displayName: k.kitchenAlias?.displayName ?? "Unknown Kitchen",
    })),
  })
}
