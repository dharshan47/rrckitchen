import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
  try {
    const trending = await prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      take: 8,
      include: {
        kitchenAlias: true,
        _count: {
          select: { orderItems: true },
        },
        menus: {
          where: { isActive: true },
          include: {
            menuItems: {
              where: { isAvailable: true },
              include: {
                photos: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
              orderBy: { name: "asc" },
            },
          },
        },
      },
      orderBy: {
        orderItems: { _count: "desc" },
      },
    });

    const serialized = trending.map((k) => {
      const allItems = k.menus.flatMap((m) => m.menuItems);
      const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;
      const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];

      return {
        id: k.id,
        slug: k.slug,
        displayName: k.kitchenAlias?.displayName ?? "Home Kitchen",
        imageUrl: firstItemPhoto,
        totalOrders: k._count.orderItems,
        itemCount: allItems.length,
        timeSlots,
      };
    });

    return NextResponse.json({ data: serialized }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Failed to fetch trending kitchens:", error);
    return NextResponse.json(
      { error: "Failed to load trending kitchens." },
      { status: 500 },
    );
  }
}
