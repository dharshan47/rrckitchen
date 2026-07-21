import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { toTitleCase } from "@/lib/utils";


const PAGE_SIZE = 15;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const category = url.searchParams.get("category");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") ?? String(PAGE_SIZE), 10),
      50,
    );

    const kitchens = await prisma.kitchenPartner.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        ...(category
          ? {
              kitchenCategories: {
                some: {
                  category: { name: { equals: category, mode: "insensitive" } },
                },
              },
            }
          : {}),
      },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        kitchenAlias: true,
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
        kitchenCategories: { include: { category: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = kitchens.length > limit;
    const items = hasMore ? kitchens.slice(0, limit) : kitchens;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    const serialized = items.map((k) => {
      const avgRating =
        k.reviews.length > 0
          ? Math.round(
              (k.reviews.reduce((s, r) => s + r.rating, 0) /
                k.reviews.length) *
                10,
            ) / 10
          : null;

      const allItems = k.menus.flatMap((m) => m.menuItems);
      const firstItemPhoto =
        allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;
      const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
      const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));

      return {
        id: k.id,
        slug: k.slug || slugify(k.kitchenAlias?.displayName ?? k.id, { lower: true, strict: true }),
        displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
        avgRating,
        totalReviews: k._count.reviews,
        imageUrl: firstItemPhoto,
        cuisineTags,
        items: allItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          compareAtPrice: i.compareAtPrice ? Number(i.compareAtPrice) : null,
          foodType: i.foodType,
          timeSlot: i.timeSlot,
          imageUrl: i.photos[0]?.imageUrl ?? null,
        })),
        timeSlots,
      };
    });

    return NextResponse.json({ data: serialized, nextCursor }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Failed to fetch explore kitchens:", error);
    return NextResponse.json(
      { error: "Failed to load kitchens. Please try again later." },
      { status: 500 },
    );
  }
}
