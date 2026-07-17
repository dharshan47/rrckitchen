import prisma from "@/lib/prisma";
import { cached } from "@/lib/server-cache";
import { cacheLife } from "next/cache";

export interface HomePageData {
  topRatedKitchens: Array<{
    id: string;
    slug: string;
    displayName: string;
    avgRating: number | null;
    totalReviews: number;
    imageUrl: string | null;
  }>;
  newKitchens: Array<{
    id: string;
    slug: string;
    displayName: string;
    createdAt: string;
    imageUrl: string | null;
  }>;
  recentOrderKitchens: Array<{
    id: string;
    slug: string;
    displayName: string;
    imageUrl: string | null;
  }>;
}

export async function getKitchenData() {
  return cached("getKitchenData", 30_000, () => _getKitchenData());
}

async function _getKitchenData() {
  'use cache';
  cacheLife('hours');
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [topRated, newKitchensData] = await Promise.all([
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      include: {
        kitchenAlias: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] }, createdAt: { gte: thirtyDaysAgo } },
      include: { kitchenAlias: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const topRatedKitchens = topRated
    .map((k) => {
      const avgRating =
        k.reviews.length > 0
          ? k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length
          : null;
      return {
        id: k.id,
        slug: k.slug,
        displayName: k.kitchenAlias?.displayName ?? "Home Kitchen",
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: k._count.reviews,
        imageUrl: null,
      };
    })
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 6);

  const newKitchens = newKitchensData.map((k) => ({
    id: k.id,
    slug: k.slug,
    displayName: k.kitchenAlias?.displayName ?? "New Kitchen",
    createdAt: k.createdAt.toISOString(),
    imageUrl: null,
  }));

  return { topRatedKitchens, newKitchens };
}

export async function getRecentOrderKitchens(userId?: string) {
  if (!userId) return [];

  const recentOrders = await prisma.order.findMany({
    where: { userId, payment: { status: "SUCCESS" } },
    include: {
      orderItems: {
        include: { kitchenPartner: { include: { kitchenAlias: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    distinct: ["id"],
  });

  const seen = new Set<string>();
  const kitchens: Array<{ id: string; slug: string; displayName: string; imageUrl: string | null }> = [];
  for (const order of recentOrders) {
    const kp = order.orderItems[0]?.kitchenPartner;
    if (kp && !seen.has(kp.id)) {
      seen.add(kp.id);
      kitchens.push({
        id: kp.id,
        slug: kp.slug,
        displayName: kp.kitchenAlias?.displayName ?? "Home Kitchen",
        imageUrl: null,
      });
    }
  }
  return kitchens;
}

export async function getAllKitchensWithItems() {
  return cached("getAllKitchensWithItems", 30_000, () => _getAllKitchensWithItems());
}

async function _getAllKitchensWithItems() {
  'use cache';
  cacheLife('hours');
  const kitchens = await prisma.kitchenPartner.findMany({
    where: { status: { in: ["APPROVED", "ACTIVE"] } },
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

  return kitchens.map((k) => {
    const avgRating =
      k.reviews.length > 0
        ? Math.round((k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length) * 10) / 10
        : null;

    const allItems = k.menus.flatMap((m) => m.menuItems);
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;
    const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
    const cuisineTags = k.kitchenCategories.map((kc) => kc.category.name);

    return {
      id: k.id,
      slug: k.slug,
      displayName: k.kitchenAlias?.displayName ?? "Home Kitchen",
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
}

export async function getKitchenDetail(kitchenSlug: string) {
  return cached(`getKitchenDetail:${kitchenSlug}`, 30_000, () => _getKitchenDetail(kitchenSlug));
}

async function _getKitchenDetail(kitchenSlug: string) {
  'use cache';
  cacheLife('hours');
  const kitchen = await prisma.kitchenPartner.findFirst({
    where: { slug: kitchenSlug, status: { in: ["APPROVED", "ACTIVE"] } },
    include: {
      kitchenAlias: true,
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: {
              photos: { orderBy: { sortOrder: "asc" } },
              _count: { select: { orderItems: true } },
            },
            orderBy: { name: "asc" },
          },
        },
      },
      kitchenCategories: { include: { category: true } },
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
  });

  if (!kitchen) return null;

  const avgRating =
    kitchen.reviews.length > 0
      ? Math.round((kitchen.reviews.reduce((s, r) => s + r.rating, 0) / kitchen.reviews.length) * 10) / 10
      : null;

  const allItems = kitchen.menus.flatMap((m) => m.menuItems);
  const firstPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;

  const sortedByOrders = [...allItems].sort((a, b) => b._count.orderItems - a._count.orderItems);
  const bestsellerThreshold = sortedByOrders.length > 0 ? sortedByOrders[0]._count.orderItems : 0;
  const isBestseller = (orderCount: number) => orderCount > 0 && orderCount >= bestsellerThreshold * 0.6;

  const cuisineTags = kitchen.kitchenCategories.map((kc) => kc.category.name);

  return {
    id: kitchen.id,
    slug: kitchen.slug,
    displayName: kitchen.kitchenAlias?.displayName ?? "Home Kitchen",
    avgRating,
    totalReviews: kitchen._count.reviews,
    imageUrl: firstPhoto,
    cuisineTags,
      items: allItems.map((i) => ({
      id: i.id,
      slug: i.slug ?? undefined,
      name: i.name,
      description: i.description,
      price: Number(i.price),
      compareAtPrice: i.compareAtPrice ? Number(i.compareAtPrice) : null,
      foodType: i.foodType,
      timeSlot: i.timeSlot,
      imageUrl: i.photos[0]?.imageUrl ?? null,
      photos: i.photos.map((p) => ({ imageUrl: p.imageUrl, sortOrder: p.sortOrder })),
      kitchenName: kitchen.kitchenAlias?.displayName ?? "Home Kitchen",
      orderCount: i._count.orderItems,
      isBestseller: isBestseller(i._count.orderItems),
    })),
  };
}

export async function getKitchensByCategory(categoryName: string) {
  return cached(`getKitchensByCategory:${categoryName}`, 30_000, () => _getKitchensByCategory(categoryName));
}

async function _getKitchensByCategory(categoryName: string) {
  const kitchens = await prisma.kitchenPartner.findMany({
    where: {
      status: { in: ["APPROVED", "ACTIVE"] },
      OR: [
        {
          kitchenCategories: {
            some: {
              category: { name: { equals: categoryName, mode: "insensitive" } },
            },
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
                    { name: { contains: categoryName, mode: "insensitive" } },
                    { description: { contains: categoryName, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        },
      ],
    },
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

  return kitchens.map((k) => {
    const avgRating =
      k.reviews.length > 0
        ? Math.round((k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length) * 10) / 10
        : null;

    const allItems = k.menus.flatMap((m) => m.menuItems);
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null;
    const cuisineTags = k.kitchenCategories.map((kc) => kc.category.name);

  return {
      id: k.id,
      slug: k.slug,
      displayName: k.kitchenAlias?.displayName ?? "Home Kitchen",
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
      timeSlots: [...new Set(allItems.map((i) => i.timeSlot))],
    };
  });
}

export async function getHomePageData(userId?: string): Promise<HomePageData> {
  const [kitchenData, recentOrderKitchens] = await Promise.all([
    getKitchenData(),
    getRecentOrderKitchens(userId),
  ]);
  return { ...kitchenData, recentOrderKitchens };
}
