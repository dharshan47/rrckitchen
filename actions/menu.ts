import { addDays, startOfDay } from "date-fns";
import prisma from "@/lib/prisma";
import { FoodType, TimeSlot } from "@/lib/generated/prisma/enums";

interface MenuFilterOptions {
  query?: string;
  foodType?: string;
  timeSlot?: string;
}

export async function getTomorrowMenu({ query, foodType, timeSlot }: MenuFilterOptions = {}) {
  const tomorrow = startOfDay(addDays(new Date(), 1));
  const search = query?.trim().toLowerCase();

  return prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      AND: [
        {
          menu: {
            isActive: true,
            kitchenPartner: {
              kitchenAvailability: {
                some: {
                  serviceDate: tomorrow,
                  isAvailable: true,
                },
              },
            },
          },
        },
        search
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
          : {},
      ],
      foodType: foodType && foodType !== "ALL" ? foodType as FoodType : undefined,
      timeSlot: timeSlot && timeSlot !== "ALL" ? timeSlot as TimeSlot : undefined,
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
    },
    orderBy: [
      { timeSlot: "asc" },
      { foodType: "asc" },
      { name: "asc" },
    ],
  });
}
