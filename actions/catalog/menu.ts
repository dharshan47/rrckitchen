import prisma from "@/lib/prisma";
import { FoodType, TimeSlot } from "@/lib/generated/prisma/enums";

interface MenuFilterOptions {
  query?: string;
  foodType?: string;
  timeSlot?: string;
}

export async function getTomorrowMenu({ query, foodType, timeSlot }: MenuFilterOptions = {}) {
  const search = query?.trim().toLowerCase();

  return prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      menu: {
        isActive: true,
      },
      ...(search
        ? {
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
          }
        : {}),
      foodType: foodType && foodType !== "ALL" ? foodType as FoodType : undefined,
      timeSlot: timeSlot && timeSlot !== "ALL" ? timeSlot as TimeSlot : undefined,
    },
    include: {
      menu: {
        include: {
          kitchenPartner: {
            select: {
              kitchenAlias: true,
              avgRating: true,
              totalReviews: true,
            },
          },
        },
      },
      photos: {
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

  const avgRating = item.menu?.kitchenPartnerId
    ? await prisma.review.aggregate({
        where: { kitchenPartnerId: item.menu.kitchenPartnerId },
        _avg: { rating: true },
      })
    : null;

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    avgRating: avgRating?._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
    totalReviews: item._count.orderItems,
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
