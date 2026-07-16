import prisma from "@/lib/prisma";
import { FoodType, TimeSlot } from "@/lib/generated/prisma/enums";
import { cached } from "@/lib/server-cache";
import { cacheLife } from "next/cache";

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
        menu: {
          select: {
            kitchenPartner: {
              select: {
                kitchenAlias: {
                  select: { displayName: true },
                },
                avgRating: true,
                totalReviews: true,
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
      menu: {
        select: {
          kitchenPartner: {
            select: {
              kitchenAlias: {
                select: { displayName: true },
              },
              avgRating: true,
              totalReviews: true,
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

export async function getMenuItemBySlug(slug: string) {
  return cached(`getMenuItemBySlug:${slug}`, 30_000, () => _getMenuItemBySlug(slug));
}

async function _getMenuItemBySlug(slug: string) {
  'use cache';
  cacheLife('hours');
  const item = await prisma.menuItem.findFirst({
    where: {
      slug,
      isAvailable: true,
      menu: { isActive: true },
    },
    include: {
      menu: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true } },
        },
      },
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!item) return null;

  const kitchenPartnerId = item.menu?.kitchenPartnerId;
  const avgRating = kitchenPartnerId
    ? await prisma.review.aggregate({ where: { kitchenPartnerId }, _avg: { rating: true } })
    : null;
  const totalReviews = kitchenPartnerId
    ? await prisma.review.count({ where: { kitchenPartnerId } })
    : 0;

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
    avgRating: avgRating?._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
    totalReviews,
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
    photos: item.photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl, sortOrder: p.sortOrder })),
  };
}

async function _getMenuItemById(id: string) {
  'use cache';
  cacheLife('hours');
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

  const kitchenPartnerId = item.menu?.kitchenPartnerId;
  const avgRating = kitchenPartnerId
    ? await prisma.review.aggregate({
        where: { kitchenPartnerId },
        _avg: { rating: true },
      })
    : null;
  const totalReviews = kitchenPartnerId
    ? await prisma.review.count({
        where: { kitchenPartnerId },
      })
    : 0;

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
    avgRating: avgRating?._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
    totalReviews,
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
    photos: item.photos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    })),
  };
}
