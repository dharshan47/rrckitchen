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
    photos: item.photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl })),
    menuName: item.menu.name,
    kitchenName: item.menu.kitchenPartner.kitchenAlias?.displayName ?? "Unknown Kitchen",
    createdAt: item.createdAt,
  }))
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
