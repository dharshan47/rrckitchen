"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"
import { toTitleCase } from "@/lib/utils"

export type CravingsPriority = "HIGH" | "MEDIUM" | "LOW"

export interface CravingsRuleRow {
  id: string
  name: string
  triggerItemId: string
  triggerItemName: string
  triggerItemImage: string | null
  kitchenId: string
  kitchenName: string
  priority: CravingsPriority
  isActive: boolean
  itemsCount: number
  triggerOrderCount: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
}

export interface CravingsRuleItemDetail {
  id: string
  menuItemId: string
  name: string
  price: number
  compareAtPrice: number | null
  foodType: "VEG" | "NONVEG"
  kitchenName: string
  imageUrl: string | null
  isBestseller: boolean
  popularity: "High" | "Medium" | "Low"
  sortOrder: number
}

export interface CravingsRuleDetail {
  id: string
  name: string
  triggerItemId: string
  triggerItemName: string
  triggerItemImage: string | null
  kitchenId: string
  kitchenName: string
  title: string
  message: string
  priority: CravingsPriority
  isActive: boolean
  updatedBy: string | null
  updatedAt: string
  createdAt: string
  items: CravingsRuleItemDetail[]
}

export interface CravingsMenuItem {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  foodType: "VEG" | "NONVEG"
  timeSlot: string
  kitchenId: string
  kitchenName: string
  imageUrl: string | null
  isBestseller: boolean
  orderCount: number
  avgRating: number
  isAvailable: boolean
}

export interface CravingsRuleSaveInput {
  name: string
  triggerItemId: string
  kitchenId: string
  title: string
  message: string
  priority: CravingsPriority
  isActive: boolean
  itemIds: string[]
}

export interface CravingsRecommendationItem {
  id: string
  menuItemId: string
  name: string
  price: number
  compareAtPrice: number | null
  foodType: "VEG" | "NONVEG"
  kitchenName: string
  kitchenId: string
  timeSlot: string
  imageUrl: string | null
  isBestseller: boolean
}

export interface CravingsRecommendation {
  title: string
  message: string
  triggerItemName: string
  items: CravingsRecommendationItem[]
}

function popularityLabel(orderCount: number, isBestseller: boolean): "High" | "Medium" | "Low" {
  if (isBestseller || orderCount >= 50) return "High"
  if (orderCount >= 10) return "Medium"
  return "Low"
}

export async function getAllCravingsRules(): Promise<CravingsRuleRow[]> {
  await requirePermission("MANAGE_CMS")

  const rules = await prisma.cravingsRule.findMany({
    include: {
      triggerItem: {
        select: {
          name: true,
          photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
          orderItems: { select: { id: true } },
        },
      },
      kitchen: {
        select: { kitchenAlias: { select: { displayName: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  })

  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    triggerItemId: r.triggerItemId,
    triggerItemName: r.triggerItem.name,
    triggerItemImage: r.triggerItem.photos[0]?.imageUrl ?? null,
    kitchenId: r.kitchenId,
    kitchenName: toTitleCase(r.kitchen.kitchenAlias?.displayName ?? "Kitchen"),
    priority: r.priority as CravingsPriority,
    isActive: r.isActive,
    itemsCount: r._count.items,
    triggerOrderCount: r.triggerItem.orderItems.length,
    updatedBy: r.updatedBy,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function getCravingsRule(id: string): Promise<CravingsRuleDetail | null> {
  await requirePermission("MANAGE_CMS")

  const rule = await prisma.cravingsRule.findUnique({
    where: { id },
    include: {
      triggerItem: {
        select: {
          name: true,
          photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
        },
      },
      kitchen: {
        select: { kitchenAlias: { select: { displayName: true } } },
      },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItem: {
            include: {
              photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
              menu: {
                select: {
                  kitchenPartner: {
                    select: { kitchenAlias: { select: { displayName: true } } },
                  },
                },
              },
              _count: { select: { orderItems: true } },
            },
          },
        },
      },
    },
  })

  if (!rule) return null

  return {
    id: rule.id,
    name: rule.name,
    triggerItemId: rule.triggerItemId,
    triggerItemName: rule.triggerItem.name,
    triggerItemImage: rule.triggerItem.photos[0]?.imageUrl ?? null,
    kitchenId: rule.kitchenId,
    kitchenName: toTitleCase(rule.kitchen.kitchenAlias?.displayName ?? "Kitchen"),
    title: rule.title,
    message: rule.message,
    priority: rule.priority as CravingsPriority,
    isActive: rule.isActive,
    updatedBy: rule.updatedBy,
    updatedAt: rule.updatedAt.toISOString(),
    createdAt: rule.createdAt.toISOString(),
    items: rule.items.map((item, index) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      price: Number(item.menuItem.price),
      compareAtPrice: item.menuItem.compareAtPrice ? Number(item.menuItem.compareAtPrice) : null,
      foodType: item.menuItem.foodType,
      kitchenName: toTitleCase(item.menuItem.menu.kitchenPartner.kitchenAlias?.displayName ?? "Kitchen"),
      imageUrl: item.menuItem.photos[0]?.imageUrl ?? null,
      isBestseller: item.menuItem.bestseller,
      popularity: popularityLabel(item.menuItem._count.orderItems, item.menuItem.bestseller),
      sortOrder: item.sortOrder || index,
    })),
  }
}

export async function getCravingsMenuItems(limit = 300): Promise<CravingsMenuItem[]> {
  await requirePermission("MANAGE_CMS")

  const items = await prisma.menuItem.findMany({
    where: { deletedAt: null, isAvailable: true },
    take: limit,
    orderBy: [{ bestseller: "desc" }, { avgRating: "desc" }],
    include: {
      photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
      menu: {
        select: {
          kitchenPartner: {
            select: { id: true, kitchenAlias: { select: { displayName: true } } },
          },
        },
      },
      _count: { select: { orderItems: true } },
    },
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    kitchenId: item.menu.kitchenPartner.id,
    kitchenName: toTitleCase(item.menu.kitchenPartner.kitchenAlias?.displayName ?? "Kitchen"),
    imageUrl: item.photos[0]?.imageUrl ?? null,
    isBestseller: item.bestseller,
    orderCount: item._count.orderItems,
    avgRating: Number(item.avgRating),
    isAvailable: item.isAvailable,
  }))
}

async function getAdminName(): Promise<string | null> {
  try {
    const { session } = await requirePermission("MANAGE_CMS")
    return session.user.name ?? null
  } catch {
    return null
  }
}

export async function createCravingsRule(
  input: CravingsRuleSaveInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const name = input.name.trim()
  if (!name) return { success: false, error: "Rule name is required" }
  if (!input.triggerItemId) return { success: false, error: "Trigger item is required" }
  if (input.itemIds.length === 0) return { success: false, error: "Select at least one recommended item" }

  const triggerItem = await prisma.menuItem.findUnique({ where: { id: input.triggerItemId } })
  if (!triggerItem) return { success: false, error: "Trigger item not found" }

  const duplicate = await prisma.cravingsRule.findFirst({
    where: { triggerItemId: input.triggerItemId },
  })
  if (duplicate) {
    return { success: false, error: `A rule for "${triggerItem.name}" already exists` }
  }

  const adminName = await getAdminName()

  const rule = await prisma.cravingsRule.create({
    data: {
      name,
      triggerItemId: input.triggerItemId,
      kitchenId: input.kitchenId,
      title: input.title || "Complete Your Meal 🍽️",
      message: input.message || "Customers usually order these together.",
      priority: input.priority,
      isActive: input.isActive,
      updatedBy: adminName,
      items: {
        create: input.itemIds.map((menuItemId, index) => ({ menuItemId, sortOrder: index })),
      },
    },
  })

  return { success: true, id: rule.id }
}

export async function updateCravingsRule(
  id: string,
  input: CravingsRuleSaveInput
): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.cravingsRule.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Rule not found" }

  const name = input.name.trim()
  if (!name) return { success: false, error: "Rule name is required" }
  if (!input.triggerItemId) return { success: false, error: "Trigger item is required" }

  const duplicate = await prisma.cravingsRule.findFirst({
    where: { triggerItemId: input.triggerItemId, id: { not: id } },
  })
  if (duplicate) return { success: false, error: `A rule for this trigger item already exists` }

  const adminName = await getAdminName()

  await prisma.$transaction(async (tx) => {
    await tx.cravingsRule.update({
      where: { id },
      data: {
        name,
        triggerItemId: input.triggerItemId,
        kitchenId: input.kitchenId,
        title: input.title || "Complete Your Meal 🍽️",
        message: input.message || "Customers usually order these together.",
        priority: input.priority,
        isActive: input.isActive,
        updatedBy: adminName,
      },
    })

    await tx.cravingsRuleItem.deleteMany({ where: { ruleId: id } })
    if (input.itemIds.length > 0) {
      await tx.cravingsRuleItem.createMany({
        data: input.itemIds.map((menuItemId, index) => ({
          ruleId: id,
          menuItemId,
          sortOrder: index,
        })),
      })
    }
  })

  return { success: true }
}

export async function deleteCravingsRule(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.cravingsRule.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Rule not found" }

  await prisma.cravingsRule.delete({ where: { id } })
  return { success: true }
}

export async function toggleCravingsRule(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.cravingsRule.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Rule not found" }

  await prisma.cravingsRule.update({ where: { id }, data: { isActive } })
  return { success: true }
}

/**
 * Customer-facing lookup. Given the menu item ids currently in the cart,
 * returns the highest-priority matching cravings rule (active only) with
 * its recommended items. Called from add-to-cart-popup.
 */
export async function getCravingsRecommendations(
  triggerItemIds: string[]
): Promise<CravingsRecommendation | null> {
  const ids = (triggerItemIds ?? []).filter(Boolean)
  if (ids.length === 0) return null

  const rule = await prisma.cravingsRule.findFirst({
    where: {
      isActive: true,
      triggerItemId: { in: ids },
    },
    include: {
      triggerItem: { select: { name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItem: {
            include: {
              photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
              menu: {
                select: {
                  kitchenPartner: {
                    select: { id: true, kitchenAlias: { select: { displayName: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { priority: "asc" },
  })

  if (!rule || rule.items.length === 0) return null

  const items: CravingsRecommendationItem[] = rule.items
    .filter((entry) => !ids.includes(entry.menuItemId))
    .map((entry) => ({
      id: entry.menuItemId,
      menuItemId: entry.menuItemId,
      name: entry.menuItem.name,
      price: Number(entry.menuItem.price),
      compareAtPrice: entry.menuItem.compareAtPrice ? Number(entry.menuItem.compareAtPrice) : null,
      foodType: entry.menuItem.foodType,
      kitchenName: toTitleCase(entry.menuItem.menu.kitchenPartner.kitchenAlias?.displayName ?? "Kitchen"),
      kitchenId: entry.menuItem.menu.kitchenPartner.id,
      timeSlot: entry.menuItem.timeSlot,
      imageUrl: entry.menuItem.photos[0]?.imageUrl ?? null,
      isBestseller: entry.menuItem.bestseller,
    }))

  return {
    title: rule.title,
    message: rule.message,
    triggerItemName: rule.triggerItem.name,
    items,
  }
}
