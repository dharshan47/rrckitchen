import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { toTitleCase } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

    const items = await prisma.kitchenWishlist.findMany({
      where: { userId: session.user.id },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        kitchenPartnerId: true,
        createdAt: true,
        kitchenPartner: {
          select: {
            id: true,
            slug: true,
            status: true,
            operatingHours: true,
            estimatedPrepTime: true,
            kitchenAlias: { select: { displayName: true, imageUrl: true } },
            kitchenAddress: {
              select: { lineOne: true, pincode: true, latitude: true, longitude: true },
            },
            kitchenKyc: { select: { phoneNumber: true } },
            kitchenCategories: {
              select: { category: { select: { name: true } } },
            },
            menus: {
              where: { isActive: true },
              select: {
                menuItems: {
                  where: { isAvailable: true },
                  select: {
                    photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
                  },
                  take: 1,
                },
              },
              take: 1,
            },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = items.length > limit;
    const result = (hasMore ? items.slice(0, limit) : items).map((w) => {
      const k = w.kitchenPartner;
      const avgRating =
        k.reviews.length > 0
          ? Math.round((k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length) * 10) / 10
          : null;
      return {
        ...w,
        kitchenPartner: {
          id: k.id,
          slug: k.slug,
          status: k.status,
          operatingHours: k.operatingHours,
          estimatedPrepTime: k.estimatedPrepTime,
          kitchenAlias: k.kitchenAlias,
          kitchenAddress: k.kitchenAddress,
          kitchenKyc: k.kitchenKyc,
          cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
          avgRating,
          totalReviews: k._count.reviews,
          imageUrl:
            k.kitchenAlias?.imageUrl ?? k.menus[0]?.menuItems[0]?.photos[0]?.imageUrl ?? null,
          lat: k.kitchenAddress?.latitude ?? null,
          lng: k.kitchenAddress?.longitude ?? null,
          user: k.user,
        },
      };
    });
    const nextCursor = hasMore && result.length > 0 ? result[result.length - 1].id : null;

    return NextResponse.json({ items: result, nextCursor });
  } catch (error) {
    console.error("[KitchenWishlist] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kitchenPartnerId } = await req.json();
    if (!kitchenPartnerId) {
      return NextResponse.json({ error: "kitchenPartnerId is required" }, { status: 400 });
    }

    const existing = await prisma.kitchenWishlist.findUnique({
      where: { userId_kitchenPartnerId: { userId: session.user.id, kitchenPartnerId } },
    });

    if (existing) {
      await prisma.kitchenWishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false, removed: true });
    }

    await prisma.kitchenWishlist.create({
      data: { userId: session.user.id, kitchenPartnerId },
    });

    return NextResponse.json({ added: true, removed: false });
  } catch (error) {
    console.error("[KitchenWishlist] POST failed:", error);
    return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitchenPartnerId = searchParams.get("kitchenPartnerId");

    if (!kitchenPartnerId) {
      return NextResponse.json({ error: "kitchenPartnerId is required" }, { status: 400 });
    }

    const item = await prisma.kitchenWishlist.findUnique({
      where: { userId_kitchenPartnerId: { userId: session.user.id, kitchenPartnerId } },
    });

    if (item) {
      await prisma.kitchenWishlist.delete({ where: { id: item.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[KitchenWishlist] DELETE failed:", error);
    return NextResponse.json({ error: "Failed to remove wishlist item" }, { status: 500 });
  }
}
