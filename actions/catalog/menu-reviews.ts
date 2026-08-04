"use server"

import prisma from "@/lib/prisma"

export interface MenuItemReviewRow {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    name: string | null
    image: string | null
  }
}

export interface MenuItemReviewsPage {
  reviews: MenuItemReviewRow[]
  nextCursor: string | null
}

/** Cursor-paginated reviews for a single menu item (newest first). */
export async function getMenuItemReviews(
  menuItemId: string,
  cursor?: string | null,
  limit = 10
): Promise<MenuItemReviewsPage> {
  if (!menuItemId) return { reviews: [], nextCursor: null }

  const rows = await prisma.menuItemReview.findMany({
    where: { menuItemId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true, image: true } },
    },
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null

  return {
    reviews: page.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: {
        name: r.user.name,
        image: r.user.image,
      },
    })),
    nextCursor,
  }
}
