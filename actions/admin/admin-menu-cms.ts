"use server"

import { v2 as cloudinary } from "cloudinary"
import prisma from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"
import { clearCache } from "@/lib/server-cache"
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id"
import { updateTag } from "next/cache"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/** Invalidate every cache layer that feeds the customer-facing menu pages. */
function invalidateMenuCache() {
  clearCache()
  try {
    updateTag("menu-items")
  } catch {
    // updateTag is unavailable outside Server Actions — skip
  }
}

export interface AdminKitchenMenuOverviewRow {
  id: string
  slug: string
  kitchenName: string
  logoUrl: string | null
  tags: string[]
  locationArea: string
  locationCity: string
  totalMenuItems: number
  activeItems: number
  inactiveItems: number
  avgRating: number
  reviewCount: number
  totalOrders: number
  status: "Active" | "Inactive"
  lastUpdatedAt: string | null
}

export interface AdminMenuStats {
  totalKitchens: number
  activeKitchens: number
  totalMenuItems: number
  activeItems: number
  inactiveItems: number
}

export interface AdminMenuItemPhotoDraft {
  id?: string
  imageUrl: string
  cloudinaryPublicId?: string | null
  sortOrder: number
}

export interface AdminMenuItemHighlight {
  title: string
  description: string
  enabled: boolean
}

export interface AdminMenuItemEditorRow {
  id: string
  publicCode: string | null
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  foodType: "VEG" | "NONVEG"
  timeSlot: "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER"
  isAvailable: boolean
  availableFor: "TODAY" | "TOMORROW" | "BOTH"
  categoryId: string | null
  categoryName: string | null
  cuisine: string | null
  bestseller: boolean
  highlights: AdminMenuItemHighlight[]
  aboutTitle: string | null
  aboutDescription: string | null
  serves: number | null
  portionSize: string | null
  shelfLife: string | null
  allergens: string | null
  metaTitle: string | null
  metaDescription: string | null
  deliveryTimeMin: number | null
  deliveryTimeMax: number | null
  deliveryFee: number | null
  freeDelivery: boolean
  packagingType: string | null
  relatedItemIds: string[]
  relatedItems: { id: string; name: string }[]
  avgRating: number
  totalReviews: number
  orderCount: number
  photos: AdminMenuItemPhotoDraft[]
  kitchenId: string
  kitchenName: string
  kitchenSlug: string
  createdAt: string
  updatedAt: string
}

export interface SaveAdminMenuItemData {
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  foodType: "VEG" | "NONVEG"
  timeSlot: "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER"
  isAvailable: boolean
  availableFor: "TODAY" | "TOMORROW" | "BOTH"
  categoryId: string | null
  cuisine: string | null
  bestseller: boolean
  highlights: AdminMenuItemHighlight[]
  aboutTitle: string | null
  aboutDescription: string | null
  serves: number | null
  portionSize: string | null
  shelfLife: string | null
  allergens: string | null
  metaTitle: string | null
  metaDescription: string | null
  deliveryTimeMin: number | null
  deliveryTimeMax: number | null
  deliveryFee: number | null
  freeDelivery: boolean
  packagingType: string | null
  relatedItemIds: string[]
  photos: AdminMenuItemPhotoDraft[]
  removedPhotoIds: string[]
}

export interface AdminMenuEditorOptions {
  categories: { id: string; name: string }[]
  kitchens: { id: string; name: string; slug: string; status: string }[]
  menuItems: { id: string; name: string; kitchenName: string; isAvailable: boolean }[]
}

function formatHighlights(value: unknown): AdminMenuItemHighlight[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((h): h is Record<string, unknown> => typeof h === "object" && h !== null)
    .map((h) => ({
      title: String(h.title ?? ""),
      description: String(h.description ?? ""),
      enabled: h.enabled !== false,
    }))
}

/** Screen 1 — Kitchen list with menu statistics for the Menu Detail Management dashboard. */
export async function getAdminKitchenMenuOverview(): Promise<{
  rows: AdminKitchenMenuOverviewRow[]
  stats: AdminMenuStats
}> {
  try { await requireAdmin() } catch { return { rows: [], stats: emptyStats() } }

  const partners = await prisma.kitchenPartner.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      kitchenAlias: { select: { displayName: true, imageUrl: true } },
      kitchenAddress: { select: { area: true, pincode: true } },
      kitchenCategories: { select: { category: { select: { name: true } } } },
      menus: {
        select: {
          menuItems: {
            select: { isAvailable: true, updatedAt: true },
          },
        },
      },
      _count: { select: { orderItems: true, reviews: true } },
    },
  })

  let totalMenuItems = 0
  let activeItems = 0
  let inactiveItems = 0
  let activeKitchens = 0

  const rows: AdminKitchenMenuOverviewRow[] = partners.map((p) => {
    const items = p.menus.flatMap((m) => m.menuItems)
    const total = items.length
    const active = items.filter((i) => i.isAvailable).length
    const inactive = total - active
    const lastUpdated = items.reduce<string | null>(
      (max, i) =>
        max === null || i.updatedAt.getTime() > new Date(max).getTime() ? i.updatedAt.toISOString() : max,
      null
    )
    const isActive = p.status === "ACTIVE" || p.status === "APPROVED"
    if (isActive) activeKitchens += 1
    totalMenuItems += total
    activeItems += active
    inactiveItems += inactive

    return {
      id: p.id,
      slug: p.slug,
      kitchenName: p.kitchenAlias?.displayName ?? p.slug,
      logoUrl: p.kitchenAlias?.imageUrl ?? null,
      tags: p.kitchenCategories.map((kc) => kc.category.name),
      locationArea: p.kitchenAddress?.area ?? p.kitchenAddress?.pincode ?? "",
      locationCity: p.kitchenAddress?.pincode ?? "",
      totalMenuItems: total,
      activeItems: active,
      inactiveItems: inactive,
      avgRating: Number(p.avgRating),
      reviewCount: p._count.reviews,
      totalOrders: p._count.orderItems,
      status: isActive ? "Active" : "Inactive",
      lastUpdatedAt: lastUpdated,
    }
  })

  return {
    rows,
    stats: {
      totalKitchens: partners.length,
      activeKitchens,
      totalMenuItems,
      activeItems,
      inactiveItems,
    },
  }
}

function emptyStats(): AdminMenuStats {
  return { totalKitchens: 0, activeKitchens: 0, totalMenuItems: 0, activeItems: 0, inactiveItems: 0 }
}

/** Screen 2 — Full editor payload for every menu item of one kitchen. */
export async function getAdminMenuItemsByKitchen(kitchenId: string): Promise<AdminMenuItemEditorRow[]> {
  try { await requireAdmin() } catch { return [] }

  const items = await prisma.menuItem.findMany({
    where: { deletedAt: null, menu: { kitchenPartnerId: kitchenId } },
    orderBy: [{ isAvailable: "desc" }, { name: "asc" }],
    include: {
      category: { select: { id: true, name: true } },
      menu: {
        select: {
          kitchenPartner: {
            select: {
              id: true,
              slug: true,
              kitchenAlias: { select: { displayName: true } },
            },
          },
        },
      },
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
  })

  const relatedIds = [...new Set(items.flatMap((i) => i.relatedItemIds ?? []))]
  const relatedLookup = new Map<string, string>()
  if (relatedIds.length) {
    const related = await prisma.menuItem.findMany({
      where: { id: { in: relatedIds } },
      select: { id: true, name: true },
    })
    for (const r of related) relatedLookup.set(r.id, r.name)
  }

  return items.map((item) => ({
    id: item.id,
    publicCode: item.publicCode,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    isAvailable: item.isAvailable,
    availableFor: item.availableFor,
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? null,
    cuisine: item.cuisine,
    bestseller: item.bestseller,
    highlights: formatHighlights(item.highlights),
    aboutTitle: item.aboutTitle,
    aboutDescription: item.aboutDescription,
    serves: item.serves,
    portionSize: item.portionSize,
    shelfLife: item.shelfLife,
    allergens: item.allergens,
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    deliveryTimeMin: item.deliveryTimeMin,
    deliveryTimeMax: item.deliveryTimeMax,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : null,
    freeDelivery: item.freeDelivery,
    packagingType: item.packagingType,
    relatedItemIds: item.relatedItemIds ?? [],
    relatedItems: (item.relatedItemIds ?? []).map((id) => ({ id, name: relatedLookup.get(id) ?? "Unknown item" })),
    avgRating: Number(item.avgRating),
    totalReviews: item.totalReviews,
    orderCount: item._count.orderItems,
    photos: item.photos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      cloudinaryPublicId: p.cloudinaryPublicId,
      sortOrder: p.sortOrder,
    })),
    kitchenId: item.menu.kitchenPartner.id,
    kitchenName: item.menu.kitchenPartner.kitchenAlias?.displayName ?? item.menu.kitchenPartner.slug,
    kitchenSlug: item.menu.kitchenPartner.slug,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }))
}

/** Options for editor selects — categories, kitchens and every menu item (for "You May Also Like"). */
export async function getAdminMenuEditorOptions(): Promise<AdminMenuEditorOptions> {
  try { await requireAdmin() } catch { return { categories: [], kitchens: [], menuItems: [] } }

  const [categories, partners, menuItems] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.kitchenPartner.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        status: true,
        kitchenAlias: { select: { displayName: true } },
      },
    }),
    prisma.menuItem.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        menu: { select: { kitchenPartner: { select: { kitchenAlias: { select: { displayName: true } } } } } },
      },
    }),
  ])

  return {
    categories,
    kitchens: partners.map((p) => ({
      id: p.id,
      name: p.kitchenAlias?.displayName ?? p.slug,
      slug: p.slug,
      status: p.status,
    })),
    menuItems: menuItems.map((m) => ({
      id: m.id,
      name: m.name,
      isAvailable: m.isAvailable,
      kitchenName: m.menu.kitchenPartner.kitchenAlias?.displayName ?? "",
    })),
  }
}

/** Save All Changes — persists every editable field plus the photo gallery diff. */
export async function saveAdminMenuItem(id: string, data: SaveAdminMenuItemData) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.menuItem.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          foodType: data.foodType,
          timeSlot: data.timeSlot,
          isAvailable: data.isAvailable,
          availableFor: data.availableFor,
          categoryId: data.categoryId,
          cuisine: data.cuisine,
          bestseller: data.bestseller,
          highlights: data.highlights as unknown as Prisma.InputJsonValue,
          aboutTitle: data.aboutTitle,
          aboutDescription: data.aboutDescription,
          serves: data.serves,
          portionSize: data.portionSize,
          shelfLife: data.shelfLife,
          allergens: data.allergens,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          deliveryTimeMin: data.deliveryTimeMin,
          deliveryTimeMax: data.deliveryTimeMax,
          deliveryFee: data.deliveryFee,
          freeDelivery: data.freeDelivery,
          packagingType: data.packagingType,
          relatedItemIds: data.relatedItemIds,
        },
      })

      // ---- Photo gallery diff ----
      const removed = new Set(data.removedPhotoIds)
      const existing = await tx.menuItemPhoto.findMany({ where: { menuItemId: id } })
      const deleteIds = new Set(
        existing.filter((p) => !data.photos.some((d) => d.id === p.id) || removed.has(p.id)).map((p) => p.id)
      )
      for (const p of existing.filter((p) => deleteIds.has(p.id))) {
        if (p.cloudinaryPublicId) {
          try { await cloudinary.uploader.destroy(p.cloudinaryPublicId) } catch { /* keep going */ }
        }
        await tx.menuItemPhoto.delete({ where: { id: p.id } })
      }

      for (const [index, photo] of data.photos.entries()) {
        if (photo.id) {
          await tx.menuItemPhoto.update({
            where: { id: photo.id },
            data: { sortOrder: index, imageUrl: photo.imageUrl },
          })
        } else {
          await tx.menuItemPhoto.create({
            data: {
              menuItemId: id,
              imageUrl: photo.imageUrl,
              cloudinaryPublicId: photo.cloudinaryPublicId ?? null,
              sortOrder: index,
            },
          })
        }
      }
    })

    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "UPDATE_MENU_ITEM",
      targetType: "MenuItem",
      targetId: id,
      metadata: { name: data.name, price: data.price, isAvailable: data.isAvailable },
    })

    invalidateMenuCache()
    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to save menu item:", error)
    return { success: false, error: "Failed to save menu item" }
  }
}

/** Quick availability toggle from the editor sidebar. */
export async function toggleAdminMenuItemAvailability(id: string, isAvailable: boolean) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.menuItem.update({ where: { id }, data: { isAvailable } })
    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "UPDATE_MENU_ITEM",
      targetType: "MenuItem",
      targetId: id,
      metadata: { isAvailable },
    })
    invalidateMenuCache()
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update availability" }
  }
}

/** Create a new menu item inside the kitchen's default menu. */
export async function createAdminMenuItem(
  kitchenId: string,
  data: { name: string; price: number; description?: string }
) {
  let adminSession
  try { const result = await requirePermission("MANAGE_CATALOG"); adminSession = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  if (!data.name.trim() || data.price < 0) {
    return { success: false, error: "Name is required and price must be valid" }
  }

  try {
    const menu =
      (await prisma.menu.findFirst({ where: { kitchenPartnerId: kitchenId }, orderBy: { createdAt: "asc" } })) ??
      (await prisma.menu.create({
        data: { kitchenPartnerId: kitchenId, name: "Default Menu" },
      }))

    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({
        data: {
          publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.MENU_ITEM),
          menuId: menu.id,
          name: data.name.trim(),
          description: data.description ?? null,
          price: data.price,
          foodType: "VEG",
          timeSlot: "LUNCH",
          isAvailable: true,
          availableFor: "BOTH",
        },
      })
      return created
    })

    await logAdminAction({
      actorUserId: adminSession.user.id,
      action: "ADD_MENU_ITEM",
      targetType: "MenuItem",
      targetId: item.id,
      metadata: { name: item.name },
    })

    invalidateMenuCache()
    return { success: true, id: item.id }
  } catch (error) {
    console.error("[Admin] Failed to create menu item:", error)
    return { success: false, error: "Failed to create menu item" }
  }
}
