"use server"

import prisma from "@/lib/prisma"
import { toTitleCase } from "@/lib/utils"

export interface PublicCategoryFeature {
  icon: string
  title: string
  subtitle: string
  color: string
  isEnabled: boolean
}

export interface PublicCategoryOffer {
  title: string
  subtitle: string
  badge: string
  isEnabled: boolean
}

export interface PublicCategoryFaq {
  question: string
  answer: string
}

export interface PublicCategoryContent {
  id: string
  title: string
  badgeText: string
  description: string
  heroLayout: string
  showHero: boolean
  desktopBannerUrl: string
  mobileBannerUrl: string
  iconUrl: string
  defaultSort: string
  showRatings: boolean
  cardsPerPage: number
  metaTitle: string
  metaDescription: string
  keywords: string[]
  features: PublicCategoryFeature[]
  offers: PublicCategoryOffer[]
  faqs: PublicCategoryFaq[]
}

export interface PublicCategoryKitchen {
  id: string
  slug: string
  displayName: string
  avgRating: number | null
  totalReviews: number
  imageUrl: string | null
  customOfferText: string | null
  cuisineTags: string[]
  items: {
    id: string
    name: string
    price: number
    compareAtPrice: number | null
    foodType: string
    timeSlot: string
    imageUrl: string | null
  }[]
  timeSlots: string[]
  lat: number | null
  lng: number | null
  estimatedPrepTime: number | null
  operatingHours: Record<string, { open: string; close: string }> | null
}

export interface PublicCategoryFacetOption {
  value: string
  label: string
  count: number
}

export interface PublicCategoryFacets {
  mealTypes: PublicCategoryFacetOption[]
  foodTypes: PublicCategoryFacetOption[]
  deliveryTimes: PublicCategoryFacetOption[]
  ratings: PublicCategoryFacetOption[]
  cuisines: PublicCategoryFacetOption[]
}

export interface PublicCategoryBundle {
  slug: string
  categoryName: string
  totalCount: number
  content: PublicCategoryContent | null
  kitchens: PublicCategoryKitchen[]
  facets: PublicCategoryFacets
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

const MEAL_TYPE_LABELS: Record<string, string> = {
  MORNING: "Breakfast",
  LUNCH: "Lunch",
  EVENINGSNACKS: "Evening Snacks",
  DINNER: "Dinner",
}

const DELIVERY_TIME_BUCKETS: { value: string; label: string; test: (mins: number | null) => boolean }[] = [
  { value: "25", label: "25 mins or less", test: (m) => m !== null && m <= 25 },
  { value: "25-40", label: "25 – 40 mins", test: (m) => m !== null && m > 25 && m <= 40 },
  { value: "40-60", label: "40 – 60 mins", test: (m) => m !== null && m > 40 && m <= 60 },
  { value: "60+", label: "More than 60 mins", test: (m) => m !== null && m > 60 },
]

const RATING_BUCKETS = [4.5, 4.0, 3.5]

function facetCounts<T>(items: T[], key: (item: T) => string | null): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) {
    const k = key(item)
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return counts
}

export async function getCategoryPageBundle(slug: string): Promise<PublicCategoryBundle> {
  const categoryName = slug.replace(/-/g, " ")

  const category = await prisma.category.findFirst({
    where: { name: { equals: categoryName, mode: "insensitive" }, isActive: true },
    include: { categoryPageContent: { include: { features: { orderBy: { sortOrder: "asc" } }, offers: { orderBy: { sortOrder: "asc" } }, faqs: { orderBy: { sortOrder: "asc" } } } } },
  })

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
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      kitchenAlias: true,
      kitchenAddress: { select: { latitude: true, longitude: true } },
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
            orderBy: { name: "asc" },
          },
        },
      },
      kitchenCategories: { include: { category: true } },
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
  })

  const serialized: PublicCategoryKitchen[] = kitchens.map((k) => {
    const avgRating =
      k.reviews.length > 0
        ? Math.round((k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length) * 10) / 10
        : null

    const allItems = k.menus.flatMap((m) => m.menuItems)
    const firstItemPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl ?? null
    const timeSlots = [...new Set(allItems.map((i) => i.timeSlot))]
    const cuisineTags = k.kitchenCategories.map((kc) => toTitleCase(kc.category.name))

    return {
      id: k.id,
      slug: k.slug || categorySlug(toTitleCase(k.kitchenAlias?.displayName ?? k.slug)),
      displayName: toTitleCase(k.kitchenAlias?.displayName ?? k.slug),
      avgRating,
      totalReviews: k._count.reviews,
      imageUrl: k.kitchenAlias?.imageUrl ?? firstItemPhoto,
      customOfferText: k.kitchenAlias?.customOfferText ?? null,
      cuisineTags,
      items: allItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        compareAtPrice: i.compareAtPrice ? Number(i.compareAtPrice) : null,
        foodType: i.foodType,
        timeSlot: i.timeSlot,
        imageUrl: i.photos[0]?.imageUrl ?? null,
      })),
      timeSlots,
      lat: k.kitchenAddress?.latitude ?? null,
      lng: k.kitchenAddress?.longitude ?? null,
      estimatedPrepTime: k.estimatedPrepTime,
      operatingHours: k.operatingHours as Record<string, { open: string; close: string }> | null,
    }
  })

  // ---- Derive real filter facets from the actual kitchen/menu data ----
  const mealTypeCounts = facetCounts(serialized, (k) => {
    const slots = k.timeSlots.map((s) => MEAL_TYPE_LABELS[s]).filter(Boolean)
    return slots.length > 0 ? slots[0] : null
  })
  const foodTypeCounts = facetCounts(serialized, (k) => {
    const hasNonVeg = k.items.some((i) => i.foodType === "NONVEG")
    const hasVeg = k.items.some((i) => i.foodType === "VEG")
    if (hasVeg && !hasNonVeg) return "Pure Veg"
    if (hasVeg) return "Veg"
    if (hasNonVeg) return "Non Veg"
    return null
  })
  const deliveryCounts = facetCounts(serialized, (k) => {
    for (const bucket of DELIVERY_TIME_BUCKETS) {
      if (bucket.test(k.estimatedPrepTime)) return bucket.value
    }
    return null
  })
  const ratingCounts = facetCounts(serialized, (k) => {
    if (k.avgRating === null) return null
    for (const r of RATING_BUCKETS) {
      if (k.avgRating >= r) return String(r)
    }
    return null
  })
  const cuisineCounts = facetCounts(serialized, (k) => {
    const counts = new Map<string, number>()
    for (const tag of k.cuisineTags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    let best: string | null = null
    let bestCount = 0
    for (const [tag, c] of counts) {
      if (c > bestCount) {
        best = tag
        bestCount = c
      }
    }
    return best
  })

  const facets: PublicCategoryFacets = {
    mealTypes: [...mealTypeCounts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
    foodTypes: [...foodTypeCounts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
    deliveryTimes: DELIVERY_TIME_BUCKETS.map((b) => ({
      value: b.value,
      label: b.label,
      count: deliveryCounts.get(b.value) ?? 0,
    })).filter((o) => o.count > 0),
    ratings: RATING_BUCKETS.map((r) => ({
      value: String(r),
      label: `${r} & above`,
      count: ratingCounts.get(String(r)) ?? 0,
    })).filter((o) => o.count > 0),
    cuisines: [...cuisineCounts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
  }

  const cms = category?.categoryPageContent ?? null

  const content: PublicCategoryContent | null = cms && category
    ? {
        id: cms.id,
        title: cms.title || toTitleCase(category.name),
        badgeText: cms.badgeText,
        description: cms.description,
        heroLayout: cms.heroLayout,
        showHero: cms.showHero,
        desktopBannerUrl: cms.desktopBannerUrl,
        mobileBannerUrl: cms.mobileBannerUrl,
        iconUrl: cms.iconUrl,
        defaultSort: cms.defaultSort,
        showRatings: cms.showRatings,
        cardsPerPage: cms.cardsPerPage,
        metaTitle: cms.metaTitle,
        metaDescription: cms.metaDescription,
        keywords: [...cms.keywords],
        features: cms.features.map((f) => ({
          icon: f.icon,
          title: f.title,
          subtitle: f.subtitle,
          color: f.color,
          isEnabled: f.isEnabled,
        })),
        offers: cms.offers.map((o) => ({
          title: o.title,
          subtitle: o.subtitle,
          badge: o.badge,
          isEnabled: o.isEnabled,
        })),
        faqs: cms.faqs.map((q) => ({ question: q.question, answer: q.answer })),
      }
    : null

  return {
    slug,
    categoryName: category ? toTitleCase(category.name) : toTitleCase(categoryName),
    totalCount: serialized.length,
    content,
    kitchens: serialized,
    facets,
  }
}
