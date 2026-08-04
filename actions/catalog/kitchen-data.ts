"use server"

import prisma from "@/lib/prisma"
import { toTitleCase } from "@/lib/utils"

export interface KitchenBySlugResult {
  id: string
  name: string
  slug: string
  avgRating: number | null
  totalReviews: number
  isActive: boolean
  address: string | undefined
  lat: number | null | undefined
  lng: number | null | undefined
  phoneNumber: string | null | undefined
  imageUrl: string | null | undefined
  description: string | null | undefined
  estimatedPrepTime: number | null
}

export async function getKitchenBySlug(slug: string): Promise<KitchenBySlugResult | null> {
  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { slug },
    include: {
      kitchenAlias: true,
      kitchenAddress: true,
      kitchenKyc: {
        select: { phoneNumber: true },
      },
    },
  })

  if (!kitchen) return null

  return {
    id: kitchen.id,
    name: toTitleCase(kitchen.kitchenAlias?.displayName ?? kitchen.slug),
    slug: kitchen.slug,
    avgRating: Number(kitchen.avgRating),
    totalReviews: kitchen.totalReviews,
    isActive: kitchen.status === "ACTIVE",
    address: kitchen.kitchenAddress
      ? `${kitchen.kitchenAddress.lineOne}${kitchen.kitchenAddress.doorNo ? ", " + kitchen.kitchenAddress.doorNo : ""}, ${kitchen.kitchenAddress.pincode}`
      : undefined,
    lat: kitchen.kitchenAddress?.latitude,
    lng: kitchen.kitchenAddress?.longitude,
    phoneNumber: kitchen.kitchenKyc?.phoneNumber,
    imageUrl: kitchen.kitchenAlias?.imageUrl,
    description: kitchen.kitchenAlias?.description,
    estimatedPrepTime: kitchen.estimatedPrepTime,
  }
}

export interface MenuItemInfo {
  id: string
  name: string
  price: number
  description: string | null
  foodType: string
  timeSlot: string
  isAvailable: boolean
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null | undefined
  menuId: string
  compareAtPrice: number | null
  menu: {
    id: string
    name: string
    kitchenPartnerId: string
  }
}

export async function getMenuItemsByKitchen(kitchenId: string): Promise<MenuItemInfo[]> {
  const items = await prisma.menuItem.findMany({
    where: {
      menu: { kitchenPartnerId: kitchenId },
    },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          kitchenPartnerId: true,
        },
      },
      photos: {
        take: 1,
        select: { imageUrl: true },
      },
    },
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    description: item.description,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    avgRating: item.avgRating ? Number(item.avgRating) : null,
    totalReviews: item.totalReviews,
    imageUrl: item.photos?.[0]?.imageUrl,
    menuId: item.menuId,
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    menu: {
      id: item.menu.id,
      name: item.menu.name,
      kitchenPartnerId: item.menu.kitchenPartnerId,
    },
  }))
}
