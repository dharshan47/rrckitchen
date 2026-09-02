import prisma from "@/lib/prisma";
import { cached } from "@/lib/server-cache";
import { cacheLife } from "next/cache";
import { toTitleCase } from "@/lib/utils";
import { queryKitchenDetail } from "@/lib/kitchen-detail";

export interface HomePageData {
  topRatedKitchens: Array<{
    id: string;
    slug: string;
    displayName: string;
    avgRating: number | null;
    totalReviews: number;
    imageUrl: string | null;
    coverImageUrl: string | null;
    cuisineTags: string[];
    timeSlots: string[];
    estimatedPrepTime: number | null;
  }>;
  newKitchens: Array<{
    id: string;
    slug: string;
    displayName: string;
    createdAt: string;
    imageUrl: string | null;
    cuisineTags: string[];
    timeSlots: string[];
    estimatedPrepTime: number | null;
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
        kitchenCategories: { include: { category: true } },
        menus: {
          where: { isActive: true },
          include: {
            menuItems: {
              where: { isAvailable: true },
              include: { photos: { take: 1 } },
              take: 20,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] }, createdAt: { gte: thirtyDaysAgo } },
      include: {
        kitchenAlias: true,
        kitchenCategories: { include: { category: true } },
        menus: {
          where: { isActive: true },
          include: {
            menuItems: {
              where: { isAvailable: true },
              include: { photos: { take: 1 } },
              take: 20,
            },
          },
        },
      },
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
      const allItems = k.menus.flatMap((m) => m.menuItems);
      const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
      const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));
      return {
        id: k.id,
        slug: k.slug,
        displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: k._count.reviews,
        imageUrl: k.kitchenAlias?.imageUrl ?? null,
        coverImageUrl: k.kitchenAlias?.coverImageUrl ?? null,
        cuisineTags,
        timeSlots,
        estimatedPrepTime: k.estimatedPrepTime,
      };
    })
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 6);

  const newKitchens = newKitchensData.map((k) => {
    const allItems = k.menus.flatMap((m) => m.menuItems);
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl;
    const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
    const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));
    return {
      id: k.id,
      slug: k.slug,
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      createdAt: k.createdAt.toISOString(),
      imageUrl: firstItemPhoto ?? null,
      cuisineTags,
      timeSlots,
      estimatedPrepTime: k.estimatedPrepTime,
    };
  });

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
  const kitchens: Array<{ id: string; slug: string; displayName: string; imageUrl: string | null; coverImageUrl: string | null }> = [];
  for (const order of recentOrders) {
    const kp = order.orderItems[0]?.kitchenPartner;
    if (kp && !seen.has(kp.id)) {
      seen.add(kp.id);
      kitchens.push({
        id: kp.id,
        slug: kp.slug,
        displayName: toTitleCase(kp.kitchenAlias?.displayName ?? kp.slug),
        imageUrl: kp.kitchenAlias?.imageUrl ?? null,
        coverImageUrl: kp.kitchenAlias?.coverImageUrl ?? null,
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
            select: {
              id: true,
              name: true,
              price: true,
              compareAtPrice: true,
              foodType: true,
              timeSlot: true,
              avgRating: true,
              totalReviews: true,
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
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl;
    const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
    const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));

    return {
      id: k.id,
      slug: k.slug,
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
        imageUrl: i.photos[0]?.imageUrl,
        avgRating: i.avgRating ? Number(i.avgRating) : null,
        totalReviews: i.totalReviews,
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
  return queryKitchenDetail(kitchenSlug);
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
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl;
    const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));

  return {
      id: k.id,
      slug: k.slug,
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating,
      totalReviews: k._count.reviews,
      imageUrl: firstItemPhoto ?? null,
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

export interface RelatedKitchen {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  coverImageUrl: string | null;
  cuisineTags: string[];
  timeSlots: string[];
  estimatedPrepTime: number | null;
}

export async function getRelatedKitchens(excludeKitchenId: string, cuisineTags: string[]) {
  return cached(`getRelatedKitchens:${excludeKitchenId}`, 60_000, () => _getRelatedKitchens(excludeKitchenId, cuisineTags));
}

async function _getRelatedKitchens(excludeKitchenId: string, cuisineTags: string[]) {
  if (!cuisineTags.length) return [];

  const kitchens = await prisma.kitchenPartner.findMany({
    where: {
      id: { not: excludeKitchenId },
      status: { in: ["APPROVED", "ACTIVE"] },
      kitchenCategories: {
        some: {
          category: { name: { in: cuisineTags, mode: "insensitive" } },
        },
      },
    },
    take: 8,
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
    const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))];
    const tags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name));

    return {
      id: k.id,
      slug: k.slug,
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating,
      totalReviews: k._count.reviews,
      imageUrl: k.kitchenAlias?.imageUrl ?? null,
      coverImageUrl: k.kitchenAlias?.coverImageUrl ?? null,
      cuisineTags: tags,
      timeSlots,
      estimatedPrepTime: k.estimatedPrepTime,
    } satisfies RelatedKitchen;
  });
}

export async function getHomePageData(userId?: string): Promise<HomePageData> {
  const [kitchenData, recentOrderKitchens] = await Promise.all([
    getKitchenData(),
    getRecentOrderKitchens(userId),
  ]);
  return { ...kitchenData, recentOrderKitchens };
}
