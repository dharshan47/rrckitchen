"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"
import { toTitleCase } from "@/lib/utils"

export interface AdminSearchPageRow {
  id: string
  keyword: string
  isActive: boolean
  bannerImageUrl: string
  filtersCount: number
  badgesCount: number
  infoItemsCount: number
  kitchensCount: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
}

export interface AdminSearchPageFilter {
  id: string
  name: string
  options: string[]
  isEnabled: boolean
  sortOrder: number
}

export interface AdminSearchPageBadge {
  id: string
  name: string
  position: string
  isEnabled: boolean
  sortOrder: number
}

export interface AdminSearchPageInfoItem {
  id: string
  icon: string
  title: string
  subtitle: string
  color: string
  isEnabled: boolean
  sortOrder: number
}

export interface AdminSearchPageDetail {
  id: string
  keyword: string
  isActive: boolean
  bannerImageUrl: string
  heading: string
  subHeading: string
  cardsPerPage: number
  defaultSort: string
  showRatings: boolean
  kitchensCount: number
  version: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
  backgroundColor: string
  metaTitle: string
  metaDescription: string
  keywords: string
  showKitchens: boolean
  showKitchensLimit: string
  showDishes: boolean
  showDishesLimit: string
  showCategories: boolean
  showCategoriesLimit: string
  autoSuggest: boolean
  recentSearches: boolean
  showKitchenBadges: boolean
  showDistance: boolean
  filters: AdminSearchPageFilter[]
  badges: AdminSearchPageBadge[]
  infoItems: AdminSearchPageInfoItem[]
  kitchenCards: AdminSearchPageKitchenCard[]
}

export interface AdminSearchPageKitchenCard {
  id: string
  kitchenPartnerId: string
  imageUrl: string | null
  badge: string | null
  sortOrder: number
}

export interface AdminSearchPageSaveInput {
  bannerImageUrl: string
  heading: string
  subHeading: string
  isActive: boolean
  cardsPerPage: number
  defaultSort: string
  showRatings: boolean
  backgroundColor: string
  metaTitle: string
  metaDescription: string
  keywords: string
  showKitchens: boolean
  showKitchensLimit: string
  showDishes: boolean
  showDishesLimit: string
  showCategories: boolean
  showCategoriesLimit: string
  autoSuggest: boolean
  recentSearches: boolean
  showKitchenBadges: boolean
  showDistance: boolean
  filters: { name: string; options: string[]; isEnabled: boolean }[]
  badges: { name: string; position?: string; isEnabled: boolean }[]
  infoItems: { icon: string; title: string; subtitle: string; color: string; isEnabled: boolean }[]
  kitchenCards: { kitchenPartnerId: string; imageUrl: string | null; badge: string | null }[]
}

const DEFAULT_FILTERS = [
  { name: "Meal Type", options: ["Lunch", "Dinner", "Snacks", "Breakfast", "Evening Snacks"] },
  { name: "Cuisine", options: ["South Indian", "North Indian", "Hyderabadi", "Lucknowi", "Kolkata"] },
  { name: "Delivery Time", options: ["25 mins or less", "25 - 40 mins", "40 - 60 mins", "More than 60 mins"] },
  { name: "Rating", options: ["4.5 & above", "4.0 & above", "3.5 & above", "3.0 & above"] },
  { name: "Price Range", options: ["Under ₹100", "₹100 - ₹200", "₹200 - ₹300", "₹300+"] },
]

const DEFAULT_BADGES = ["Bestseller", "Top Rated", "New", "Pure Veg"]

const DEFAULT_INFO_ITEMS = [
  { icon: "Heart", title: "100% Homemade", subtitle: "Made with love & care", color: "text-orange-500" },
  { icon: "ShieldCheck", title: "Hygienic & Safe", subtitle: "Verified home kitchens", color: "text-emerald-500" },
  { icon: "Clock", title: "Pre-book & Save Time", subtitle: "Order in advance", color: "text-blue-500" },
  { icon: "Leaf", title: "Fresh Ingredients", subtitle: "Sourced daily", color: "text-green-500" },
  { icon: "Users", title: "Support Local Women", subtitle: "Empowering homemakers", color: "text-orange-500" },
]

async function activeKitchensCount(): Promise<number> {
  return prisma.kitchenPartner.count({
    where: { status: { in: ["ACTIVE", "APPROVED"] } },
  })
}

export interface AdminSearchKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number
  totalReviews: number
  imageUrl: string | null
  profileImage: string | null
  cuisineTags: string[]
  estimatedPrepTime: number | null
  operatingHours: Record<string, { open: string; close: string }> | null
  lat: number | null
  lng: number | null
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
}

export async function getSearchPageKitchens(limit = 12): Promise<AdminSearchKitchen[]> {
  await requirePermission("MANAGE_CMS")

  const kitchens = await prisma.kitchenPartner.findMany({
    where: { status: { in: ["APPROVED", "ACTIVE"] } },
    take: limit,
    orderBy: { avgRating: "desc" },
    select: {
      id: true,
      slug: true,
      avgRating: true,
      totalReviews: true,
      estimatedPrepTime: true,
      operatingHours: true,
      kitchenAlias: { select: { displayName: true, imageUrl: true } },
      kitchenCategories: { select: { category: { select: { name: true } } } },
      kitchenAddress: { select: { latitude: true, longitude: true } },
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  })

  return kitchens.map((k) => {
    const allItems = k.menus.flatMap((m) => m.menuItems)
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null
    return {
      id: k.id,
      slug: k.slug || slugifyName(toTitleCase(k.kitchenAlias?.displayName ?? k.slug)),
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating: Number(k.avgRating),
      totalReviews: k.totalReviews,
      imageUrl: k.kitchenAlias?.imageUrl ?? firstItemPhoto,
      profileImage: k.kitchenAlias?.imageUrl ?? null,
      cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
      estimatedPrepTime: k.estimatedPrepTime ?? null,
      operatingHours: k.operatingHours as Record<string, { open: string; close: string }> | null,
      lat: k.kitchenAddress?.latitude ?? null,
      lng: k.kitchenAddress?.longitude ?? null,
      items: allItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        imageUrl: i.photos[0]?.imageUrl ?? null,
      })),
    }
  })
}

function slugifyName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export async function getSearchPageContents(): Promise<AdminSearchPageRow[]> {
  await requirePermission("MANAGE_CMS")

  const contents = await prisma.searchPageContent.findMany({
    include: {
      _count: { select: { filters: true, badges: true, infoItems: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return contents.map((c) => ({
    id: c.id,
    keyword: c.keyword,
    isActive: c.isActive,
    bannerImageUrl: c.bannerImageUrl,
    filtersCount: c._count.filters,
    badgesCount: c._count.badges,
    infoItemsCount: c._count.infoItems,
    kitchensCount: c.kitchensCount,
    updatedBy: c.updatedBy,
    updatedAt: c.updatedAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function getSearchPageContent(id: string): Promise<AdminSearchPageDetail | null> {
  await requirePermission("MANAGE_CMS")

  const content = await prisma.searchPageContent.findUnique({
    where: { id },
    include: {
      filters: { orderBy: { sortOrder: "asc" } },
      badges: { orderBy: { sortOrder: "asc" } },
      infoItems: { orderBy: { sortOrder: "asc" } },
      kitchenCards: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!content) return null

  return {
    id: content.id,
    keyword: content.keyword,
    isActive: content.isActive,
    bannerImageUrl: content.bannerImageUrl,
    heading: content.heading,
    subHeading: content.subHeading,
    cardsPerPage: content.cardsPerPage,
    defaultSort: content.defaultSort,
    showRatings: content.showRatings,
    kitchensCount: content.kitchensCount,
    version: content.version,
    updatedBy: content.updatedBy,
    updatedAt: content.updatedAt.toISOString(),
    createdAt: content.createdAt.toISOString(),
    backgroundColor: content.backgroundColor,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    keywords: content.keywords,
    showKitchens: content.showKitchens,
    showKitchensLimit: content.showKitchensLimit,
    showDishes: content.showDishes,
    showDishesLimit: content.showDishesLimit,
    showCategories: content.showCategories,
    showCategoriesLimit: content.showCategoriesLimit,
    autoSuggest: content.autoSuggest,
    recentSearches: content.recentSearches,
    showKitchenBadges: content.showKitchenBadges,
    showDistance: content.showDistance,
    filters: content.filters.map((f) => ({
      id: f.id,
      name: f.name,
      options: f.options,
      isEnabled: f.isEnabled,
      sortOrder: f.sortOrder,
    })),
    badges: content.badges.map((b) => ({
      id: b.id,
      name: b.name,
      position: b.position ?? "left",
      isEnabled: b.isEnabled,
      sortOrder: b.sortOrder,
    })),
    infoItems: content.infoItems.map((i) => ({
      id: i.id,
      icon: i.icon,
      title: i.title,
      subtitle: i.subtitle,
      color: i.color,
      isEnabled: i.isEnabled,
      sortOrder: i.sortOrder,
    })),
    kitchenCards: content.kitchenCards.map((c) => ({
      id: c.id,
      kitchenPartnerId: c.kitchenPartnerId,
      imageUrl: c.imageUrl,
      badge: c.badge,
      sortOrder: c.sortOrder,
    })),
  }
}

export async function createSearchPageContent(input: { keyword: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")
  const keyword = input.keyword.trim().toLowerCase()

  if (!keyword) return { success: false, error: "Keyword is required" }

  const existing = await prisma.searchPageContent.findUnique({ where: { keyword } })
  if (existing) return { success: false, error: `A search page for "${keyword}" already exists` }

  const kitchens = await activeKitchensCount()

  const content = await prisma.searchPageContent.create({
    data: {
      keyword,
      isActive: true,
      bannerImageUrl: "",
      heading: `Search Results for "${keyword}"`,
      subHeading: `We found ${kitchens} kitchens serving delicious ${keyword} near you.`,
      cardsPerPage: 12,
      defaultSort: "Relevance",
      showRatings: true,
      kitchensCount: kitchens,
      version: 1,
      updatedBy: session.user.name ?? "Admin",
      backgroundColor: "#F0FDF4",
      metaTitle: `Best ${toTitleCase(keyword)} Near You | RRC Kitchen`,
      metaDescription: `Find the best ${keyword} near you. Order from ${kitchens}+ home kitchens offering delicious ${keyword} with fast delivery.`,
      keywords: `${keyword}, south indian, breakfast, home food`,
      showKitchens: true,
      showKitchensLimit: "32 kitchens",
      showDishes: true,
      showDishesLimit: "16 dishes",
      showCategories: true,
      showCategoriesLimit: "15 categories",
      autoSuggest: true,
      recentSearches: true,
      showKitchenBadges: true,
      showDistance: true,
      filters: {
        create: DEFAULT_FILTERS.map((f, i) => ({ name: f.name, options: f.options, isEnabled: true, sortOrder: i })),
      },
      badges: {
        create: DEFAULT_BADGES.map((name, i) => ({ name, position: "left", isEnabled: true, sortOrder: i })),
      },
      infoItems: {
        create: DEFAULT_INFO_ITEMS.map((item, i) => ({ ...item, isEnabled: true, sortOrder: i })),
      },
    },
  })

  return { success: true, id: content.id }
}

export async function saveSearchPageContent(id: string, input: AdminSearchPageSaveInput): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.searchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search content not found" }

  await prisma.$transaction(async (tx) => {
    await tx.searchPageContent.update({
      where: { id },
      data: {
        bannerImageUrl: input.bannerImageUrl,
        heading: input.heading,
        subHeading: input.subHeading,
        isActive: input.isActive,
        cardsPerPage: input.cardsPerPage,
        defaultSort: input.defaultSort,
        showRatings: input.showRatings,
        backgroundColor: input.backgroundColor,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        keywords: input.keywords,
        showKitchens: input.showKitchens,
        showKitchensLimit: input.showKitchensLimit,
        showDishes: input.showDishes,
        showDishesLimit: input.showDishesLimit,
        showCategories: input.showCategories,
        showCategoriesLimit: input.showCategoriesLimit,
        autoSuggest: input.autoSuggest,
        recentSearches: input.recentSearches,
        showKitchenBadges: input.showKitchenBadges,
        showDistance: input.showDistance,
        version: { increment: 1 },
        updatedBy: session.user.name ?? "Admin",
      },
    })

    await tx.searchPageFilter.deleteMany({ where: { searchPageContentId: id } })
    await tx.searchPageFilter.createMany({
      data: input.filters.map((f, i) => ({
        searchPageContentId: id,
        name: f.name,
        options: f.options,
        isEnabled: f.isEnabled,
        sortOrder: i,
      })),
    })

    await tx.searchPageBadge.deleteMany({ where: { searchPageContentId: id } })
    await tx.searchPageBadge.createMany({
      data: input.badges.map((b, i) => ({
        searchPageContentId: id,
        name: b.name,
        position: b.position ?? "left",
        isEnabled: b.isEnabled,
        sortOrder: i,
      })),
    })

    await tx.searchPageInfoItem.deleteMany({ where: { searchPageContentId: id } })
    await tx.searchPageInfoItem.createMany({
      data: input.infoItems.map((item, i) => ({
        searchPageContentId: id,
        icon: item.icon,
        title: item.title,
        subtitle: item.subtitle,
        color: item.color,
        isEnabled: item.isEnabled,
        sortOrder: i,
      })),
    })

    await tx.searchPageKitchenCard.deleteMany({ where: { searchPageContentId: id } })
    await tx.searchPageKitchenCard.createMany({
      data: input.kitchenCards.map((c, i) => ({
        searchPageContentId: id,
        kitchenPartnerId: c.kitchenPartnerId,
        imageUrl: c.imageUrl,
        badge: c.badge,
        sortOrder: i,
      })),
    })
  })

  return { success: true }
}

export async function saveSearchPageKitchenCard(
  contentId: string,
  kitchenPartnerId: string,
  patch: { imageUrl?: string | null; badge?: string | null },
): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.searchPageContent.findUnique({ where: { id: contentId } })
  if (!existing) return { success: false, error: "Search content not found" }

  const card = await prisma.searchPageKitchenCard.findFirst({
    where: { searchPageContentId: contentId, kitchenPartnerId },
  })

  await prisma.$transaction(async (tx) => {
    if (card) {
      await tx.searchPageKitchenCard.update({
        where: { id: card.id },
        data: {
          imageUrl: patch.imageUrl === undefined ? card.imageUrl : patch.imageUrl,
          badge: patch.badge === undefined ? card.badge : (patch.badge?.trim() ? patch.badge : null),
        },
      })
    } else {
      await tx.searchPageKitchenCard.create({
        data: {
          searchPageContentId: contentId,
          kitchenPartnerId,
          imageUrl: patch.imageUrl ?? null,
          badge: patch.badge?.trim() ? patch.badge : null,
        },
      })
    }

    await tx.searchPageContent.update({
      where: { id: contentId },
      data: { version: { increment: 1 }, updatedBy: session.user.name ?? "Admin" },
    })
  })

  return { success: true }
}

export async function deleteSearchPageContent(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.searchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search content not found" }

  await prisma.searchPageContent.delete({ where: { id } })

  return { success: true }
}

export async function toggleSearchPageContent(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.searchPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Search content not found" }

  await prisma.searchPageContent.update({
    where: { id },
    data: { isActive, updatedBy: session.user.name ?? "Admin" },
  })

  return { success: true }
}
