import prisma from "@/lib/prisma";
import { AvailableFor, FoodType, TimeSlot } from "@/lib/generated/prisma/enums";
import { cached } from "@/lib/server-cache";
import { cacheLife, cacheTag } from "next/cache";

interface MenuFilterOptions {
  query?: string;
  foodType?: string;
  timeSlot?: string;
  bestseller?: boolean;
}

export async function getTomorrowMenu({ query, foodType, timeSlot, bestseller }: MenuFilterOptions = {}) {
  const cacheKey = `getTomorrowMenu:${query ?? ""}:${foodType ?? "ALL"}:${timeSlot ?? "ALL"}:bs${!!bestseller}`;
  return cached(cacheKey, 15_000, () => _getTomorrowMenu({ query, foodType, timeSlot, bestseller }));
}

async function _getTomorrowMenu({ query, foodType, timeSlot, bestseller }: MenuFilterOptions = {}) {
  'use cache';
  cacheLife('hours');
  cacheTag('menu-items');
  const search = query?.trim().toLowerCase();

  const searchCondition = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          {
            menu: {
              kitchenPartner: {
                kitchenAlias: {
                  displayName: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
        ],
      }
    : {};

  const where = {
    isAvailable: true,
    availableFor: { in: ["TOMORROW", "BOTH"] satisfies AvailableFor[] },
    menu: {
      isActive: true,
    },
    ...searchCondition,
    foodType: foodType && foodType !== "ALL" ? foodType as FoodType : undefined,
    timeSlot: timeSlot && timeSlot !== "ALL" ? timeSlot as TimeSlot : undefined,
  };

  if (bestseller) {
    const items = await prisma.menuItem.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        compareAtPrice: true,
        foodType: true,
        timeSlot: true,
        isAvailable: true,
        menuId: true,
        avgRating: true,
        totalReviews: true,
        menu: {
          select: {
            kitchenPartner: {
              select: {
                kitchenAlias: {
                  select: { displayName: true },
                },
              },
            },
          },
        },
        photos: {
          select: { imageUrl: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [
        { orderItems: { _count: "desc" } },
        { timeSlot: "asc" },
      ],
      take: 30,
    });

    return items;
  }

  return prisma.menuItem.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      compareAtPrice: true,
      foodType: true,
      timeSlot: true,
      isAvailable: true,
      menuId: true,
      avgRating: true,
      totalReviews: true,
      menu: {
        select: {
          kitchenPartner: {
            select: {
              kitchenAlias: {
                select: { displayName: true },
              },
            },
          },
        },
      },
      photos: {
        select: { imageUrl: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [
      { timeSlot: "asc" },
      { foodType: "asc" },
      { name: "asc" },
    ],
  });
}

export async function getMenuItemById(id: string) {
  return cached(`getMenuItemById:${id}`, 30_000, () => _getMenuItemById(id));
}

async function fetchRelatedItems(ids: string[]) {
  if (!ids.length) return [];
  return prisma.menuItem.findMany({
    where: { id: { in: ids }, isAvailable: true, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      avgRating: true,
      photos: { take: 1, select: { imageUrl: true } },
    },
  });
}

export async function getMenuItemBySlug(slug: string) {
  return cached(`getMenuItemBySlug:${slug}`, 30_000, () => _getMenuItemBySlug(slug));
}

async function _getMenuItemBySlug(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('menu-items');
  let item = await prisma.menuItem.findFirst({
    where: {
      slug,
      isAvailable: true,
      menu: { isActive: true },
    },
    include: {
      menu: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true, _count: { select: { reviews: true, orderItems: true } } } },
        },
      },
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!item) {
    item = await prisma.menuItem.findFirst({
      where: {
        id: slug,
        isAvailable: true,
        menu: { isActive: true },
      },
      include: {
        menu: {
          include: {
            kitchenPartner: { include: { kitchenAlias: true, _count: { select: { reviews: true, orderItems: true } } } },
          },
        },
        photos: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orderItems: true } },
      },
    });
  }

  if (!item) return null;

  const [relatedItems] = await Promise.all([fetchRelatedItems(item.relatedItemIds ?? [])]);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    avgRating: item.avgRating ? Number(item.avgRating) : null,
    totalReviews: item.totalReviews,
    orderCount: item._count.orderItems,
    bestseller: item.bestseller,
    cuisine: item.cuisine,
    highlights: Array.isArray(item.highlights)
      ? (item.highlights as unknown as { title: string; description: string; enabled: boolean }[])
      : [],
    aboutTitle: item.aboutTitle,
    aboutDescription: item.aboutDescription,
    serves: item.serves,
    portionSize: item.portionSize,
    shelfLife: item.shelfLife,
    allergens: item.allergens,
    deliveryTimeMin: item.deliveryTimeMin,
    deliveryTimeMax: item.deliveryTimeMax,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : null,
    freeDelivery: item.freeDelivery,
    packagingType: item.packagingType,
    menu: item.menu
      ? {
          kitchenPartner: item.menu.kitchenPartner
            ? {
                kitchenAlias: item.menu.kitchenPartner.kitchenAlias
                  ? { displayName: item.menu.kitchenPartner.kitchenAlias.displayName }
                  : null,
              }
            : null,
        }
      : null,
    kitchen: item.menu?.kitchenPartner
      ? {
          name: item.menu.kitchenPartner.kitchenAlias?.displayName ?? item.menu.kitchenPartner.slug,
          slug: item.menu.kitchenPartner.slug,
          imageUrl: item.menu.kitchenPartner.kitchenAlias?.imageUrl ?? null,
          avgRating: item.menu.kitchenPartner.avgRating ? Number(item.menu.kitchenPartner.avgRating) : null,
          totalReviews: item.menu.kitchenPartner.totalReviews,
          orderCount: item.menu.kitchenPartner._count.orderItems,
        }
      : null,
    photos: item.photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl, sortOrder: p.sortOrder })),
    relatedItems: relatedItems.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      avgRating: r.avgRating ? Number(r.avgRating) : null,
      imageUrl: r.photos[0]?.imageUrl ?? null,
    })),
  };
}

export async function getMenuItemByIdentifier(kitchenSlug: string, shortId: string) {
  return cached(`getMenuItemByIdentifier:${kitchenSlug}:${shortId}`, 30_000, () => _getMenuItemByIdentifier(kitchenSlug, shortId));
}

async function _getMenuItemByIdentifier(kitchenSlug: string, shortId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('menu-items');
  const item = await prisma.menuItem.findFirst({
    where: {
      id: { startsWith: shortId },
      isAvailable: true,
      menu: {
        isActive: true,
        kitchenPartner: {
          slug: kitchenSlug,
          status: { in: ["APPROVED", "ACTIVE"] },
        },
      },
    },
    include: {
      menu: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true, _count: { select: { reviews: true, orderItems: true } } } },
        },
      },
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!item) return null;

  const [relatedItems] = await Promise.all([fetchRelatedItems(item.relatedItemIds ?? [])]);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    avgRating: item.avgRating ? Number(item.avgRating) : null,
    totalReviews: item.totalReviews,
    orderCount: item._count.orderItems,
    bestseller: item.bestseller,
    cuisine: item.cuisine,
    highlights: Array.isArray(item.highlights)
      ? (item.highlights as unknown as { title: string; description: string; enabled: boolean }[])
      : [],
    aboutTitle: item.aboutTitle,
    aboutDescription: item.aboutDescription,
    serves: item.serves,
    portionSize: item.portionSize,
    shelfLife: item.shelfLife,
    allergens: item.allergens,
    deliveryTimeMin: item.deliveryTimeMin,
    deliveryTimeMax: item.deliveryTimeMax,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : null,
    freeDelivery: item.freeDelivery,
    packagingType: item.packagingType,
    menu: item.menu
      ? {
          kitchenPartner: item.menu.kitchenPartner
            ? {
                kitchenAlias: item.menu.kitchenPartner.kitchenAlias
                  ? { displayName: item.menu.kitchenPartner.kitchenAlias.displayName }
                  : null,
              }
            : null,
        }
      : null,
    kitchen: item.menu?.kitchenPartner
      ? {
          name: item.menu.kitchenPartner.kitchenAlias?.displayName ?? item.menu.kitchenPartner.slug,
          slug: item.menu.kitchenPartner.slug,
          imageUrl: item.menu.kitchenPartner.kitchenAlias?.imageUrl ?? null,
          avgRating: item.menu.kitchenPartner.avgRating ? Number(item.menu.kitchenPartner.avgRating) : null,
          totalReviews: item.menu.kitchenPartner.totalReviews,
          orderCount: item.menu.kitchenPartner._count.orderItems,
        }
      : null,
    photos: item.photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl, sortOrder: p.sortOrder })),
    relatedItems: relatedItems.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      avgRating: r.avgRating ? Number(r.avgRating) : null,
      imageUrl: r.photos[0]?.imageUrl ?? null,
    })),
  };
}

async function _getMenuItemById(id: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('menu-items');
  const item = await prisma.menuItem.findFirst({
    where: {
      id,
      isAvailable: true,
      menu: {
        isActive: true,
      },
    },
    include: {
      menu: {
        include: {
          kitchenPartner: {
            include: {
              kitchenAlias: true,
              _count: { select: { reviews: true, orderItems: true } },
            },
          },
        },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { orderItems: true },
      },
    },
  });

  if (!item) return null;

  const [relatedItems] = await Promise.all([fetchRelatedItems(item.relatedItemIds ?? [])]);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    avgRating: item.avgRating ? Number(item.avgRating) : null,
    totalReviews: item.totalReviews,
    orderCount: item._count.orderItems,
    bestseller: item.bestseller,
    cuisine: item.cuisine,
    highlights: Array.isArray(item.highlights)
      ? (item.highlights as unknown as { title: string; description: string; enabled: boolean }[])
      : [],
    aboutTitle: item.aboutTitle,
    aboutDescription: item.aboutDescription,
    serves: item.serves,
    portionSize: item.portionSize,
    shelfLife: item.shelfLife,
    allergens: item.allergens,
    deliveryTimeMin: item.deliveryTimeMin,
    deliveryTimeMax: item.deliveryTimeMax,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : null,
    freeDelivery: item.freeDelivery,
    packagingType: item.packagingType,
    menu: item.menu
      ? {
          kitchenPartner: item.menu.kitchenPartner
            ? {
                kitchenAlias: item.menu.kitchenPartner.kitchenAlias
                  ? { displayName: item.menu.kitchenPartner.kitchenAlias.displayName }
                  : null,
              }
            : null,
        }
      : null,
    kitchen: item.menu?.kitchenPartner
      ? {
          name: item.menu.kitchenPartner.kitchenAlias?.displayName ?? item.menu.kitchenPartner.slug,
          slug: item.menu.kitchenPartner.slug,
          imageUrl: item.menu.kitchenPartner.kitchenAlias?.imageUrl ?? null,
          avgRating: item.menu.kitchenPartner.avgRating ? Number(item.menu.kitchenPartner.avgRating) : null,
          totalReviews: item.menu.kitchenPartner.totalReviews,
          orderCount: item.menu.kitchenPartner._count.orderItems,
        }
      : null,
    photos: item.photos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    })),
    relatedItems: relatedItems.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      avgRating: r.avgRating ? Number(r.avgRating) : null,
      imageUrl: r.photos[0]?.imageUrl ?? null,
    })),
  };
}
