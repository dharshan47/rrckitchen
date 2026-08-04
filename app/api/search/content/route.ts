import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"

const CACHE_TTL = 60

export interface PublicSearchPageContent {
  id: string
  keyword: string
  bannerImageUrl: string
  heading: string
  subHeading: string
  cardsPerPage: number
  defaultSort: string
  showRatings: boolean
  kitchensCount: number
  filters: { id: string; name: string; options: string[] }[]
  badges: { id: string; name: string }[]
  infoItems: { id: string; icon: string; title: string; subtitle: string; color: string }[]
}

async function loadContent(keyword: string): Promise<PublicSearchPageContent | null> {
  const match = await prisma.searchPageContent.findFirst({
    where: { keyword, isActive: true },
    include: {
      filters: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      badges: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      infoItems: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
    },
  })

  if (match) {
    return {
      id: match.id,
      keyword: match.keyword,
      bannerImageUrl: match.bannerImageUrl,
      heading: match.heading,
      subHeading: match.subHeading,
      cardsPerPage: match.cardsPerPage,
      defaultSort: match.defaultSort,
      showRatings: match.showRatings,
      kitchensCount: match.kitchensCount,
      filters: match.filters.map((f) => ({ id: f.id, name: f.name, options: f.options })),
      badges: match.badges.map((b) => ({ id: b.id, name: b.name })),
      infoItems: match.infoItems.map((i) => ({
        id: i.id,
        icon: i.icon,
        title: i.title,
        subtitle: i.subtitle,
        color: i.color,
      })),
    }
  }

  const fallback = await prisma.searchPageContent.findFirst({
    where: { keyword: "default", isActive: true },
    include: {
      filters: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      badges: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      infoItems: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
    },
  })

  if (fallback) {
    return {
      id: fallback.id,
      keyword: fallback.keyword,
      bannerImageUrl: fallback.bannerImageUrl,
      heading: fallback.heading,
      subHeading: fallback.subHeading,
      cardsPerPage: fallback.cardsPerPage,
      defaultSort: fallback.defaultSort,
      showRatings: fallback.showRatings,
      kitchensCount: fallback.kitchensCount,
      filters: fallback.filters.map((f) => ({ id: f.id, name: f.name, options: f.options })),
      badges: fallback.badges.map((b) => ({ id: b.id, name: b.name })),
      infoItems: fallback.infoItems.map((i) => ({
        id: i.id,
        icon: i.icon,
        title: i.title,
        subtitle: i.subtitle,
        color: i.color,
      })),
    }
  }

  return null
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const keyword = (url.searchParams.get("keyword") ?? "").trim().toLowerCase().replace(/\s+/g, "-")

    const cacheKey = keyword ? `search:content:${keyword}` : null
    if (cacheKey) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
        })
      }
    }

    const content = await loadContent(keyword)

    const payload = { content }

    if (cacheKey && content) {
      await redis.set(cacheKey, payload, { ex: CACHE_TTL })
    }

    return NextResponse.json(payload, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    console.error("Failed to fetch search page content:", error)
    return NextResponse.json(
      { error: "Failed to load search page content" },
      { status: 500 },
    )
  }
}
