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
  address: string
  lat: number
  lng: number
  phoneNumber: string | null
  imageUrl: string | null
  coverImageUrl: string | null
  description: string | null
  deliveryFee: number
  minOrder: number
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
    name: toTitleCase(kitchen.kitchenAlias?.displayName ?? ""),
    slug: kitchen.slug,
    avgRating: Number(kitchen.avgRating),
    totalReviews: kitchen.totalReviews,
    isActive: kitchen.status === "ACTIVE",
    address: kitchen.kitchenAddress
      ? `${kitchen.kitchenAddress.lineOne}${kitchen.kitchenAddress.doorNo ? ", " + kitchen.kitchenAddress.doorNo : ""}, ${kitchen.kitchenAddress.pincode}`
      : "",
    lat: kitchen.kitchenAddress?.latitude ?? 0,
    lng: kitchen.kitchenAddress?.longitude ?? 0,
    phoneNumber: kitchen.kitchenKyc?.phoneNumber ?? null,
    imageUrl: null,
    coverImageUrl: null,
    description: null,
    deliveryFee: 0,
    minOrder: 0,
    estimatedPrepTime: null,
  }
}

export interface MenuItemWithStock {
  id: string
  name: string
  price: number
  description: string | null
  foodType: string
  timeSlot: string
  isAvailable: boolean
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null
  menuId: string
  compareAtPrice: number | null
  availableStock: number
  menu: {
    id: string
    name: string
    kitchenPartnerId: string
  }
}

export async function getMenuItemsByKitchen(kitchenId: string): Promise<MenuItemWithStock[]> {
  const [items, stockEntries] = await Promise.all([
    prisma.menuItem.findMany({
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
    }),
    prisma.menuItemDailyStock.findMany({
      where: {
        menuItem: {
          menu: { kitchenPartnerId: kitchenId },
        },
      },
    }),
  ])

  const stockMap = new Map<string, { totalQuantity: number; reservedQuantity: number; soldQuantity: number }>()
  for (const stock of stockEntries) {
    stockMap.set(stock.menuItemId, {
      totalQuantity: stock.totalQuantity,
      reservedQuantity: stock.reservedQuantity,
      soldQuantity: stock.soldQuantity,
    })
  }

  return items.map((item) => {
    const stock = stockMap.get(item.id)
    const availableStock = stock ? stock.totalQuantity - stock.reservedQuantity - stock.soldQuantity : 0

    return {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      description: item.description,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      isAvailable: item.isAvailable,
      avgRating: null,
      totalReviews: 0,
      imageUrl: item.photos?.[0]?.imageUrl ?? null,
      menuId: item.menuId,
      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
      availableStock,
      menu: {
        id: item.menu.id,
        name: item.menu.name,
        kitchenPartnerId: item.menu.kitchenPartnerId,
      },
    }
  })
}
