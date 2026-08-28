"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"
import { toTitleCase } from "@/lib/utils"

export interface AdminCategoryOption {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

export interface AdminCategoryPageRow {
  id: string
  categoryId: string
  categoryName: string
  slug: string
  isActive: boolean
  desktopBannerUrl: string
  heroLayout: string
  featuresCount: number
  offersCount: number
  faqsCount: number
  version: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
}

export interface AdminCategoryPageFeature {
  id: string
  icon: string
  title: string
  subtitle: string
  color: string
  isEnabled: boolean
  sortOrder: number
}

export interface AdminCategoryPageOffer {
  id: string
  title: string
  subtitle: string
  badge: string
  isEnabled: boolean
  sortOrder: number
}

export interface AdminCategoryPageFaq {
  id: string
  question: string
  answer: string
  sortOrder: number
}

export interface AdminCategoryPageDetail {
  id: string
  categoryId: string
  categoryName: string
  slug: string
  isActive: boolean
  heroLayout: string
  desktopBannerUrl: string
  mobileBannerUrl: string
  iconUrl: string
  title: string
  badgeText: string
  description: string
  showHero: boolean
  defaultSort: string
  showRatings: boolean
  cardsPerPage: number
  metaTitle: string
  metaDescription: string
  keywords: string[]
  canonicalUrl: string
  featuredKitchenIds: string[]
  featuredMenuIds: string[]
  version: number
  updatedBy: string | null
  updatedAt: string
  createdAt: string
  fallbackKitchenImageUrl: string
  filterConfig: any
  sortOptionsConfig: any
  features: AdminCategoryPageFeature[]
  offers: AdminCategoryPageOffer[]
  faqs: AdminCategoryPageFaq[]
}

export interface AdminCategoryPageSaveInput {
  isActive: boolean
  heroLayout: string
  desktopBannerUrl: string
  mobileBannerUrl: string
  iconUrl: string
  title: string
  badgeText: string
  description: string
  showHero: boolean
  defaultSort: string
  showRatings: boolean
  cardsPerPage: number
  metaTitle: string
  metaDescription: string
  keywords: string[]
  canonicalUrl: string
  featuredKitchenIds: string[]
  featuredMenuIds: string[]
  fallbackKitchenImageUrl: string
  filterConfig: any
  sortOptionsConfig: any
  features: { icon: string; title: string; subtitle: string; color: string; isEnabled: boolean }[]
  offers: { title: string; subtitle: string; badge: string; isEnabled: boolean }[]
  faqs: { question: string; answer: string }[]
}

export interface AdminCategoryPreviewKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null
  profileImage: string | null
  cuisineTags: string[]
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
}

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const DEFAULT_FEATURES = [
  { icon: "ChefHat", title: "100% Homemade", subtitle: "Made with love & care", color: "text-orange-500" },
  { icon: "ShieldCheck", title: "Hygienic & Safe", subtitle: "Verified home kitchens", color: "text-emerald-500" },
  { icon: "Leaf", title: "Fresh Ingredients", subtitle: "Sourced daily", color: "text-green-500" },
  { icon: "Heart", title: "Made with Love", subtitle: "By home chefs", color: "text-pink-500" },
  { icon: "Users", title: "Support Local Women", subtitle: "Empowering homemakers", color: "text-orange-500" },
  { icon: "Clock", title: "Pre-book & Save Time", subtitle: "Order in advance", color: "text-blue-500" },
]

const DEFAULT_OFFERS = [
  { title: "Today's Offer", subtitle: "Flat 20% off on first order", badge: "20% OFF" },
  { title: "Weekend Deal", subtitle: "Free delivery on weekends", badge: "FREE DELIVERY" },
  { title: "Festival Sale", subtitle: "Special combos at best prices", badge: "FESTIVAL" },
]

export async function getCategoryOptions(): Promise<AdminCategoryOption[]> {
  await requirePermission("MANAGE_CMS")

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  })

  return categories.map((c) => ({
    id: c.id,
    name: toTitleCase(c.name),
    slug: categorySlug(c.name),
    imageUrl: c.imageUrl,
  }))
}

export async function getCategoryPageContents(): Promise<AdminCategoryPageRow[]> {
  await requirePermission("MANAGE_CMS")

  const contents = await prisma.categoryPageContent.findMany({
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { features: true, offers: true, faqs: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return contents.map((c) => ({
    id: c.id,
    categoryId: c.categoryId,
    categoryName: toTitleCase(c.category.name),
    slug: categorySlug(c.category.name),
    isActive: c.isActive,
    desktopBannerUrl: c.desktopBannerUrl,
    heroLayout: c.heroLayout,
    featuresCount: c._count.features,
    offersCount: c._count.offers,
    faqsCount: c._count.faqs,
    version: c.version,
    updatedBy: c.updatedBy,
    updatedAt: c.updatedAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function getCategoryPageContent(id: string): Promise<AdminCategoryPageDetail | null> {
  await requirePermission("MANAGE_CMS")

  const content = await prisma.categoryPageContent.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      features: { orderBy: { sortOrder: "asc" } },
      offers: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!content) return null

  return {
    id: content.id,
    categoryId: content.categoryId,
    categoryName: toTitleCase(content.category.name),
    slug: categorySlug(content.category.name),
    isActive: content.isActive,
    heroLayout: content.heroLayout,
    desktopBannerUrl: content.desktopBannerUrl,
    mobileBannerUrl: content.mobileBannerUrl,
    iconUrl: content.iconUrl,
    title: content.title,
    badgeText: content.badgeText,
    description: content.description,
    showHero: content.showHero,
    defaultSort: content.defaultSort,
    showRatings: content.showRatings,
    cardsPerPage: content.cardsPerPage,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    keywords: [...content.keywords],
    canonicalUrl: content.canonicalUrl,
    featuredKitchenIds: [...content.featuredKitchenIds],
    featuredMenuIds: [...content.featuredMenuIds],
    version: content.version,
    updatedBy: content.updatedBy,
    updatedAt: content.updatedAt.toISOString(),
    createdAt: content.createdAt.toISOString(),
    fallbackKitchenImageUrl: content.fallbackKitchenImageUrl,
    filterConfig: content.filterConfig ?? [],
    sortOptionsConfig: content.sortOptionsConfig ?? [],
    features: content.features.map((f) => ({
      id: f.id,
      icon: f.icon,
      title: f.title,
      subtitle: f.subtitle,
      color: f.color,
      isEnabled: f.isEnabled,
      sortOrder: f.sortOrder,
    })),
    offers: content.offers.map((o) => ({
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      badge: o.badge,
      isEnabled: o.isEnabled,
      sortOrder: o.sortOrder,
    })),
    faqs: content.faqs.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      sortOrder: q.sortOrder,
    })),
  }
}

export async function createCategoryPageContent(input: {
  categoryId: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } })
  if (!category) return { success: false, error: "Category not found" }

  const existing = await prisma.categoryPageContent.findUnique({ where: { categoryId: input.categoryId } })
  if (existing) return { success: false, error: `A page for "${category.name}" already exists` }

  const title = toTitleCase(category.name)

  const content = await prisma.categoryPageContent.create({
    data: {
      categoryId: category.id,
      isActive: true,
      heroLayout: "LEFT_TEXT",
      title,
      description: category.description ?? `Discover authentic homemade ${title.toLowerCase()} dishes from verified home chefs.`,
      badgeText: "",
      metaTitle: `${title} Kitchens | RRC Kitchen`,
      metaDescription: `Browse verified home kitchens preparing ${title.toLowerCase()} cuisine. Order fresh homemade ${title.toLowerCase()} near you.`,
      keywords: [title.toLowerCase()],
      defaultSort: "Popularity",
      showRatings: true,
      cardsPerPage: 12,
      version: 1,
      updatedBy: session.user.name ?? "Admin",
      fallbackKitchenImageUrl: "",
      filterConfig: [],
      sortOptionsConfig: [],
      features: {
        create: DEFAULT_FEATURES.map((f, i) => ({ ...f, isEnabled: true, sortOrder: i })),
      },
      offers: {
        create: DEFAULT_OFFERS.map((o, i) => ({ ...o, isEnabled: true, sortOrder: i })),
      },
    },
  })

  return { success: true, id: content.id }
}

export async function saveCategoryPageContent(
  id: string,
  input: AdminCategoryPageSaveInput
): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.categoryPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Category content not found" }

  await prisma.$transaction(async (tx) => {
    await tx.categoryPageContent.update({
      where: { id },
      data: {
        isActive: input.isActive,
        heroLayout: input.heroLayout,
        desktopBannerUrl: input.desktopBannerUrl,
        mobileBannerUrl: input.mobileBannerUrl,
        iconUrl: input.iconUrl,
        title: input.title,
        badgeText: input.badgeText,
        description: input.description,
        showHero: input.showHero,
        defaultSort: input.defaultSort,
        showRatings: input.showRatings,
        cardsPerPage: input.cardsPerPage,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        keywords: input.keywords,
        canonicalUrl: input.canonicalUrl,
        featuredKitchenIds: input.featuredKitchenIds,
        featuredMenuIds: input.featuredMenuIds,
        fallbackKitchenImageUrl: input.fallbackKitchenImageUrl,
        filterConfig: input.filterConfig,
        sortOptionsConfig: input.sortOptionsConfig,
        version: { increment: 1 },
        updatedBy: session.user.name ?? "Admin",
      },
    })

    await tx.categoryPageFeature.deleteMany({ where: { categoryPageContentId: id } })
    await tx.categoryPageFeature.createMany({
      data: input.features.map((f, i) => ({
        categoryPageContentId: id,
        icon: f.icon,
        title: f.title,
        subtitle: f.subtitle,
        color: f.color,
        isEnabled: f.isEnabled,
        sortOrder: i,
      })),
    })

    await tx.categoryPageOffer.deleteMany({ where: { categoryPageContentId: id } })
    await tx.categoryPageOffer.createMany({
      data: input.offers.map((o, i) => ({
        categoryPageContentId: id,
        title: o.title,
        subtitle: o.subtitle,
        badge: o.badge,
        isEnabled: o.isEnabled,
        sortOrder: i,
      })),
    })

    await tx.categoryPageFaq.deleteMany({ where: { categoryPageContentId: id } })
    await tx.categoryPageFaq.createMany({
      data: input.faqs.map((q, i) => ({
        categoryPageContentId: id,
        question: q.question,
        answer: q.answer,
        sortOrder: i,
      })),
    })
  })

  return { success: true }
}

export async function deleteCategoryPageContent(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.categoryPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Category content not found" }

  await prisma.categoryPageContent.delete({ where: { id } })

  return { success: true }
}

export async function toggleCategoryPageContent(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const { session } = await requirePermission("MANAGE_CMS")

  const existing = await prisma.categoryPageContent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Category content not found" }

  await prisma.categoryPageContent.update({
    where: { id },
    data: { isActive, updatedBy: session.user.name ?? "Admin" },
  })

  return { success: true }
}

export async function getCategoryPreviewKitchens(categoryName: string): Promise<AdminCategoryPreviewKitchen[]> {
  await requirePermission("MANAGE_CMS")

  const kitchens = await prisma.kitchenPartner.findMany({
    where: {
      status: { in: ["APPROVED", "ACTIVE"] },
      OR: [
        {
          kitchenCategories: {
            some: { category: { name: { equals: categoryName, mode: "insensitive" } } },
          },
        },
        {
          menus: {
            some: {
              isActive: true,
              menuItems: {
                some: {
                  isAvailable: true,
                  OR: [
                    { name: { contains: categoryName, mode: "insensitive" } },
                    { description: { contains: categoryName, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        },
      ],
    },
    take: 12,
    orderBy: [{ avgRating: "desc" }, { totalReviews: "desc" }],
    include: {
      kitchenAlias: { select: { displayName: true, imageUrl: true } },
      kitchenCategories: { select: { category: { select: { name: true } } } },
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
            orderBy: { name: "asc" },
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
      slug: k.slug || categorySlug(toTitleCase(k.kitchenAlias?.displayName ?? k.slug)),
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating: k.avgRating ? Number(k.avgRating) : null,
      totalReviews: k.totalReviews,
      imageUrl: k.kitchenAlias?.imageUrl ?? firstItemPhoto,
      profileImage: k.kitchenAlias?.imageUrl ?? null,
      cuisineTags: k.kitchenCategories.map((kc) => toTitleCase(kc.category.name)),
      items: allItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        imageUrl: i.photos[0]?.imageUrl ?? null,
      })),
    }
  })
}
