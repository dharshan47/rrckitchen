import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import slugify from "slugify";
import { toTitleCase } from "@/lib/utils";

const PAGE_SIZE = 15;
const CACHE_TTL = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const category = url.searchParams.get("category");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") ?? String(PAGE_SIZE), 10),
      50,
    );

    const cacheKey = `kitchen:explore:${category ?? "all"}:${cursor ?? "start"}:${limit}`;
    const cached = await redis.get<{
      data: unknown[];
      nextCursor: string | null;
    }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

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
      select: {
        id: true,
        slug: true,
        avgRating: true,
        totalReviews: true,
        estimatedPrepTime: true,
        operatingHours: true,
        kitchenAlias: {
          select: {
            displayName: true,
            imageUrl: true,
            coverImageUrl: true,
            customOfferText: true,
          },
        },
        kitchenAddress: {
          select: {
            latitude: true,
            longitude: true,
            area: true,
            landmark: true,
            lineOne: true,
            pincode: true,
          },
        },
        menus: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            menuItems: {
              where: { isAvailable: true },
              select: {
                id: true,
                name: true,
                price: true,
                compareAtPrice: true,
                foodType: true,
                timeSlot: true,
                photos: {
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                  select: { imageUrl: true },
                },
              },
              orderBy: { name: "asc" },
            },
          },
        },
        kitchenCategories: {
          select: { category: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = kitchens.length > limit;
    const items = hasMore ? kitchens.slice(0, limit) : kitchens;
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    const serialized = items.map((k) => {
      const avgRating = k.avgRating ? Number(k.avgRating) : null;

      const allItems = k.menus.flatMap((m) => m.menuItems);
      const firstItemPhoto =
        allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;
      const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
      const cuisineTags = k.kitchenCategories.map((kc) =>
        toTitleCase(kc.category.name),
      );

      return {
        id: k.id,
        slug:
          k.slug ||
          slugify(k.kitchenAlias?.displayName ?? k.id, {
            lower: true,
            strict: true,
          }),
        displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
        profileImage: k.kitchenAlias?.imageUrl ?? null,
        avgRating,
        totalReviews: k.totalReviews,
        imageUrl:
          k.kitchenAlias?.coverImageUrl ??
          k.kitchenAlias?.imageUrl ??
          firstItemPhoto,
        customOfferText: k.kitchenAlias?.customOfferText ?? null,
        cuisineTags,
        locality:
          [
            k.kitchenAddress?.area,
            k.kitchenAddress?.landmark,
            k.kitchenAddress?.lineOne,
          ]
            .filter(Boolean)
            .join(", ") || null,
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
        lat: k.kitchenAddress?.latitude ?? null,
        lng: k.kitchenAddress?.longitude ?? null,
        estimatedPrepTime: k.estimatedPrepTime,
        operatingHours: k.operatingHours as Record<
          string,
          { open: string; close: string }
        > | null,
      };
    });

    const payload = { data: serialized, nextCursor };
    await redis.set(cacheKey, payload, { ex: CACHE_TTL });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
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
