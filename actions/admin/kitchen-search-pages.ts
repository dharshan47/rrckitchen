"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"
import { toTitleCase } from "@/lib/utils"

export interface AdminKitchenSearchRow {
  id: string
  keyword: string
  isActive: boolean
  kitchensCount: number
  menuItemsCount: number
  version: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
}

export interface AdminKitchenSearchChip {
  id: string
  label: string
  isEnabled: boolean
  sortOrder: number
}

export interface AdminKitchenSearchFilter {
  id: string
  name: string
  options: string[]
  isEnabled: boolean
  sortOrder: number
}

export interface AdminKitchenSearchMenuCategory {
  id: string
  name: string
  sortOrder: number
}

export interface AdminKitchenSearchRecommendedItem {
  id: string
  name: string
  sortOrder: number
}

export interface AdminKitchenSearchDetail {
  id: string
  keyword: string
  isActive: boolean
  desktopBannerUrl: string
  mobileBannerUrl: string
  searchTitle: string
  badgeText: string
  description: string
  showHero: boolean
  defaultSort: string
  showRatings: boolean
  showDeliveryTime: boolean
  showDistance: boolean
  showPureVegBadge: boolean
  showHygienicBadge: boolean
  showKitchenStory: boolean
  showInternalNotes: boolean
  showKitchenTiming: boolean
  showFreshIngredients: boolean
  showPackaging: boolean
  showSupportLocalWomen: boolean
  kitchensCount: number
  menuItemsCount: number
  version: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
  chips: AdminKitchenSearchChip[]
  filters: AdminKitchenSearchFilter[]
  menuCategories: AdminKitchenSearchMenuCategory[]
  recommendedItems: AdminKitchenSearchRecommendedItem[]
}

export interface AdminKitchenSearchSaveInput {
  isActive: boolean
  desktopBannerUrl: string
  mobileBannerUrl: string
  searchTitle: string
  badgeText: string
  description: string
  showHero: boolean
  defaultSort: string
  showRatings: boolean
  showDeliveryTime: boolean
  showDistance: boolean
  showPureVegBadge: boolean
  showHygienicBadge: boolean
  showKitchenStory: boolean
  showInternalNotes: boolean
  showKitchenTiming: boolean
  showFreshIngredients: boolean
  showPackaging: boolean
  showSupportLocalWomen: boolean
  chips: { label: string; isEnabled: boolean }[]
  filters: { name: string; options: string[]; isEnabled: boolean }[]
  menuCategories: { name: string }[]
  recommendedItems: { name: string }[]
}

export interface AdminKitchenSearchPreviewKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number
  totalReviews: number
  imageUrl: string | null
  cuisineTags: string[]
  estimatedPrepTime: number | null
}

export interface AdminKitchenSearchPreviewMenuItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
  foodType: string
  kitchenName: string
}

export interface AdminKitchenSearchPreview {
  keyword: string
  kitchens: AdminKitchenSearchPreviewKitchen[]
  menuItems: AdminKitchenSearchPreviewMenuItem[]
  kitchenCount: number
  menuItemCount: number
}

const DEFAULT_CHIPS = [
  "All Biryani",
  "Veg Biryani",
  "Chicken Biryani",
  "Mutton Biryani",
  "Egg Biryani",
  "Hyderabadi Biryani",
  "Chettinad",
  "Family Pack",
  "Combo",
]

const DEFAULT_FILTERS = [
  { name: "Meal Type", options: ["Breakfast", "Lunch", "Evening Snacks", "Dinner"] },
  { name: "Cuisine", options: ["Hyderabadi", "Chettinad", "Lucknowi", "Kolkata"] },
  { name: "Price", options: ["Under ₹100", "₹100 - ₹200", "₹200 - ₹300", "₹300+"] },
  { name: "Rating", options: ["4.5 & above", "4.0 & above", "3.5 & above"] },
  { name: "Delivery Time", options: ["25 mins or less", "25 - 40 mins", "40 - 60 mins", "More than 60 mins"] },
  { name: "Spice Level", options: ["Mild", "Medium", "Hot"] },
  { name: "Veg / Non Veg", options: ["Pure Veg", "Veg", "Non Veg"] },
  { name: "Portion Size", options: ["Single", "Half", "Full", "Family Pack"] },
]

const DEFAULT_MENU_CATEGORIES = [
  "Chicken Biryani",
  "Mutton Biryani",
  "Veg Biryani",
  "Egg Biryani",
  "Paneer Biryani",
  "Family Packs",
  "Combos",
]

const DEFAULT_RECOMMENDED = [
  "Chicken 65",
  "Mutton Chukka",
  "Boiled Egg",
  "Extra Gravy",
  "Raita",
  "Pepsi",
  "Coke",
]

function slugifyName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

async function keywordStats(keyword: string): Promise<{ kitchens: number; items: number }> {
  const matchesKeyword = { contains: keyword, mode: "insensitive" as const }

  const [kitchens, items] = await Promise.all([
    prisma.kitchenPartner.count({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        OR: [
          { kitchenAlias: { displayName: matchesKeyword } },
          { kitchenCategories: { some: { category: { name: matchesKeyword } } } },
          { menus: { some: { menuItems: { some: { name: matchesKeyword, isAvailable: true } } } } },
        ],
      },
    }),
    prisma.menuItem.count({
      where: { isAvailable: true, name: matchesKeyword },
    }),
  ])

  return { kitchens, items }
}

export async function getKitchenSearchPageContents(): Promise<AdminKitchenSearchRow[]> {
  await requirePermission("MANAGE_CMS")

  const contents = await prisma.kitchenSearchPageContent.findMany({
    orderBy: { updatedAt: "desc" },
  })

  const rows = await Promise.all(
    contents.map(async (c) => {
      const stats = await keywordStats(c.keyword)
      return {
        id: c.id,
        keyword: c.keyword,
        isActive: c.isActive,
        kitchensCount: stats.kitchens,
        menuItemsCount: stats.items,
        version: c.version,
        updatedBy: c.updatedBy,
        updatedAt: c.updatedAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
      }
    })
  )

  return rows
}

export async function getKitchenSearchPageContent(id: string): Promise<AdminKitchenSearchDetail | null> {
  await requirePermission("MANAGE_CMS")

  const content = await prisma.kitchenSearchPageContent.findUnique({
    where: { id },
    include: {
      chips: { orderBy: { sortOrder: "asc" } },
      filters: { orderBy: { sortOrder: "asc" } },
      menuCategories: { orderBy: { sortOrder: "asc" } },
      recommendedItems: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!content) return null

  return {
    id: content.id,
    keyword: content.keyword,
    isActive: content.isActive,
    desktopBannerUrl: content.desktopBannerUrl,
    mobileBannerUrl: content.mobileBannerUrl,
    searchTitle: content.searchTitle,
    badgeText: content.badgeText,
    description: content.description,
    showHero: content.showHero,
    defaultSort: content.defaultSort,
    showRatings: content.showRatings,
    showDeliveryTime: content.showDeliveryTime,
    showDistance: content.showDistance,
    showPureVegBadge: content.showPureVegBadge,
    showHygienicBadge: content.showHygienicBadge,
    showKitchenStory: content.showKitchenStory,
    showInternalNotes: content.showInternalNotes,
    showKitchenTiming: content.showKitchenTiming,
    showFreshIngredients: content.showFreshIngredients,
    showPackaging: content.showPackaging,
    showSupportLocalWomen: content.showSupportLocalWomen,
    kitchensCount: content.kitchensCount,
    menuItemsCount: content.menuItemsCount,
    version: content.version,
    updatedBy: content.updatedBy,
    updatedAt: content.updatedAt.toISOString(),
    createdAt: content.createdAt.toISOString(),
    chips: content.chips.map((chip) => ({ id: chip.id, label: chip.label, isEnabled: chip.isEnabled, sortOrder: chip.sortOrder })),
    filters: content.filters.map((f) => ({ id: f.id, name: f.name, options: [...f.options], isEnabled: f.isEnabled, sortOrder: f.sortOrder })),
    menuCategories: content.menuCategories.map((m) => ({ id: m.id, name: m.name, sortOrder: m.sortOrder })),
    recommendedItems: content.recommendedItems.map((r) => ({ id: r.id, name: r.name, sortOrder: r.sortOrder })),
  }
}

export async function createKitchenSearchPageContent(input: { keyword: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")
  const keyword = input.keyword.trim().toLowerCase()

  if (!keyword) return { success: false, error: "Keyword is required" }
  if (keyword.length > 50) return { success: false, error: "Keyword must be under 50 characters" }

  const existing = await prisma.kitchenSearchPageContent.findUnique({ where: { keyword } })
  if (existing) return { success: false, error: `A configuration for "${keyword}" already exists` }

  const stats = await keywordStats(keyword)

  const content = await prisma.kitchenSearchPageContent.create({
    data: {
      keyword,
      isActive: true,
      searchTitle: `Best ${toTitleCase(keyword)} near you`,
      badgeText: `${stats.kitchens}+ Kitchens`,
      description: `Explore the best ${keyword} from verified home kitchens near you.`,
      kitchensCount: stats.kitchens,
      menuItemsCount: stats.items,
      version: 1,
      updatedBy: session.user.name ?? "Admin",
      chips: { create: DEFAULT_CHIPS.map((label, i) => ({ label, isEnabled: true, sortOrder: i })) },
      filters: { create: DEFAULT_FILTERS.map((f, i) => ({ name: f.name, options: f.options, isEnabled: true, sortOrder: i })) },
      menuCategories: { create: DEFAULT_MENU_CATEGORIES.map((name, i) => ({ name, sortOrder: i })) },
      recommendedItems: { create: DEFAULT_RECOMMENDED.map((name, i) => ({ name, sortOrder: i })) },
    },
  })

  return { success: true, id: content.id }
}

export async function saveKitchenSearchPageContent(id: string, input: AdminKitchenSearchSaveInput): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.kitchenSearchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search configuration not found" }

  const stats = await keywordStats(existing.keyword)

  await prisma.$transaction(async (tx) => {
    await tx.kitchenSearchPageContent.update({
      where: { id },
      data: {
        isActive: input.isActive,
        desktopBannerUrl: input.desktopBannerUrl,
        mobileBannerUrl: input.mobileBannerUrl,
        searchTitle: input.searchTitle,
        badgeText: input.badgeText,
        description: input.description,
        showHero: input.showHero,
        defaultSort: input.defaultSort,
        showRatings: input.showRatings,
        showDeliveryTime: input.showDeliveryTime,
        showDistance: input.showDistance,
        showPureVegBadge: input.showPureVegBadge,
        showHygienicBadge: input.showHygienicBadge,
        showKitchenStory: input.showKitchenStory,
        showInternalNotes: input.showInternalNotes,
        showKitchenTiming: input.showKitchenTiming,
        showFreshIngredients: input.showFreshIngredients,
        showPackaging: input.showPackaging,
        showSupportLocalWomen: input.showSupportLocalWomen,
        kitchensCount: stats.kitchens,
        menuItemsCount: stats.items,
        version: { increment: 1 },
        updatedBy: session.user.name ?? "Admin",
      },
    })

    await tx.kitchenSearchChip.deleteMany({ where: { kitchenSearchPageContentId: id } })
    await tx.kitchenSearchChip.createMany({
      data: input.chips.map((chip, i) => ({ kitchenSearchPageContentId: id, label: chip.label, isEnabled: chip.isEnabled, sortOrder: i })),
    })

    await tx.kitchenSearchFilter.deleteMany({ where: { kitchenSearchPageContentId: id } })
    await tx.kitchenSearchFilter.createMany({
      data: input.filters.map((f, i) => ({ kitchenSearchPageContentId: id, name: f.name, options: f.options, isEnabled: f.isEnabled, sortOrder: i })),
    })

    await tx.kitchenSearchMenuCategory.deleteMany({ where: { kitchenSearchPageContentId: id } })
    await tx.kitchenSearchMenuCategory.createMany({
      data: input.menuCategories.map((m, i) => ({ kitchenSearchPageContentId: id, name: m.name, sortOrder: i })),
    })

    await tx.kitchenSearchRecommendedItem.deleteMany({ where: { kitchenSearchPageContentId: id } })
    await tx.kitchenSearchRecommendedItem.createMany({
      data: input.recommendedItems.map((r, i) => ({ kitchenSearchPageContentId: id, name: r.name, sortOrder: i })),
    })
  })

  return { success: true }
}

export async function deleteKitchenSearchPageContent(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.kitchenSearchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search configuration not found" }

  await prisma.kitchenSearchPageContent.delete({ where: { id } })

  return { success: true }
}

export async function toggleKitchenSearchPageContent(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.kitchenSearchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search configuration not found" }

  await prisma.kitchenSearchPageContent.update({
    where: { id },
    data: { isActive, updatedBy: session.user.name ?? "Admin" },
  })

  return { success: true }
}

export async function getKitchenSearchPreview(keyword: string): Promise<AdminKitchenSearchPreview | null> {
  await requirePermission("MANAGE_CMS")

  const clean = keyword.trim().toLowerCase()
  if (!clean) return null

  const matchesKeyword = { contains: clean, mode: "insensitive" as const }

  const [kitchens, menuItems] = await Promise.all([
    prisma.kitchenPartner.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        OR: [
          { kitchenAlias: { displayName: matchesKeyword } },
          { kitchenCategories: { some: { category: { name: matchesKeyword } } } },
          { menus: { some: { menuItems: { some: { name: matchesKeyword, isAvailable: true } } } } },
        ],
      },
      take: 12,
      orderBy: [{ avgRating: "desc" }, { totalReviews: "desc" }],
      select: {
        id: true,
        slug: true,
        avgRating: true,
        totalReviews: true,
        estimatedPrepTime: true,
        kitchenAlias: { select: { displayName: true, imageUrl: true } },
        kitchenCategories: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true, name: matchesKeyword },
      take: 24,
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        foodType: true,
        photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
        menu: { select: { kitchenPartner: { select: { kitchenAlias: { select: { displayName: true } } } } } },
      },
    }),
  ])

  return {
    keyword: clean,
    kitchenCount: kitchens.length,
    menuItemCount: menuItems.length,
    kitchens: kitchens.map((k) => ({
      id: k.id,
      slug: k.slug || slugifyName(toTitleCase(k.kitchenAlias?.displayName ?? k.slug)),
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating: Number(k.avgRating),
      totalReviews: k.totalReviews,
      imageUrl: k.kitchenAlias?.imageUrl ?? null,
      cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
      estimatedPrepTime: k.estimatedPrepTime ?? null,
    })),
    menuItems: menuItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      imageUrl: i.photos[0]?.imageUrl ?? null,
      foodType: i.foodType,
      kitchenName: toTitleCase(i.menu.kitchenPartner.kitchenAlias?.displayName ?? "Home Kitchen"),
    })),
  }
}
