"use server"

import { v2 as cloudinary } from "cloudinary"
import prisma from "@/lib/prisma"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function getAllMenuItems() {
  try { await requireAdmin() } catch { return [] }

  const items = await prisma.menuItem.findMany({
    where: { deletedAt: null },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          kitchenPartner: {
            select: {
              id: true,
              kitchenAlias: { select: { displayName: true } },
            },
          },
        },
      },
      photos: { select: { id: true, imageUrl: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    availableFor: item.availableFor,
    avgRating: Number(item.avgRating),
    totalReviews: item.totalReviews,
    orderCount: item._count?.orderItems ?? 0,
    photos: item.photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl })),
    menuId: item.menuId,
    menuName: item.menu.name,
    cuisine: item.cuisine,
    kitchenName: item.menu.kitchenPartner.kitchenAlias?.displayName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
}

/**
 * Lists active kitchens with their menus for the admin create / move flows.
 */
export async function getAdminKitchensWithMenus() {
  try { await requirePermission("MANAGE_CATALOG") } catch { return [] }

  const kitchens = await prisma.kitchenPartner.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      kitchenAlias: { select: { displayName: true } },
      menus: {
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return kitchens.map((k) => ({
    id: k.id,
    name: k.kitchenAlias?.displayName ?? "Unnamed Kitchen",
    menus: k.menus,
  }))
}

export async function createMenuItem(data: {
  menuId: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number | null
  foodType?: string
  timeSlot?: string
  isAvailable?: boolean
  availableFor?: "TODAY" | "TOMORROW" | "BOTH"
  cuisine?: string
}) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const menu = await prisma.menu.findUnique({ where: { id: data.menuId } })
    if (!menu) return { success: false, error: "Selected menu not found" }

    const item = await prisma.menuItem.create({
      data: {
        menuId: data.menuId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        foodType: (data.foodType as "VEG" | "NONVEG") ?? "VEG",
        timeSlot: (data.timeSlot as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER") ?? "LUNCH",
        isAvailable: data.isAvailable ?? true,
        availableFor: data.availableFor ?? "BOTH",
        cuisine: data.cuisine?.trim() || null,
      },
    })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "CREATE_MENU_ITEM",
      targetType: "MenuItem",
      targetId: item.id,
      metadata: { name: item.name, menuId: data.menuId },
    })
    return { success: true, item: { id: item.id } }
  } catch {
    return { success: false, error: "Failed to create menu item" }
  }
}

export async function updateMenuItem(
  id: string,
  data: {
    name?: string
    description?: string
    price?: number
    compareAtPrice?: number | null
    foodType?: string
    timeSlot?: string
    isAvailable?: boolean
    availableFor?: "TODAY" | "TOMORROW" | "BOTH"
    menuId?: string
    cuisine?: string | null
  }
) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
        ...(data.foodType !== undefined && { foodType: data.foodType as "VEG" | "NONVEG" }),
        ...(data.timeSlot !== undefined && { timeSlot: data.timeSlot as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER" }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.availableFor !== undefined && { availableFor: data.availableFor }),
        ...(data.menuId !== undefined && { menuId: data.menuId }),
        ...(data.cuisine !== undefined && { cuisine: data.cuisine }),
      },
    })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "UPDATE_MENU_ITEM",
      targetType: "MenuItem",
      targetId: id,
      metadata: data,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update menu item" }
  }
}

export async function addMenuItemPhoto(menuItemId: string, imageUrl: string, cloudinaryPublicId?: string) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const photo = await prisma.menuItemPhoto.create({
      data: { menuItemId, imageUrl, cloudinaryPublicId: cloudinaryPublicId ?? null },
    })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "ADD_MENU_ITEM_PHOTO",
      targetType: "MenuItemPhoto",
      targetId: photo.id,
      metadata: { menuItemId },
    })
    return { success: true, photo: { id: photo.id, imageUrl: photo.imageUrl } }
  } catch {
    return { success: false, error: "Failed to add photo" }
  }
}

export async function deleteMenuItemPhoto(photoId: string) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const photo = await prisma.menuItemPhoto.findUnique({ where: { id: photoId } })
    if (!photo) return { success: false, error: "Photo not found" }

    if (photo.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryPublicId)
      } catch {
        // Cloudinary delete failed, continue with DB deletion
      }
    }

    await prisma.menuItemPhoto.delete({ where: { id: photoId } })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "DELETE_MENU_ITEM_PHOTO",
      targetType: "MenuItemPhoto",
      targetId: photoId,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete photo" }
  }
}

export async function deleteMenuItem(id: string) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "DELETE_MENU_ITEM",
      targetType: "MenuItem",
      targetId: id,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete menu item" }
  }
}
