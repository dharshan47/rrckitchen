"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getRrcKitchenReview() {
  const session = await getSession()
  if (!session?.user) return null

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!kitchenPartner) return null

  const review = await prisma.rrcKitchenReview.findUnique({
    where: { kitchenPartnerId: kitchenPartner.id },
  })
  if (!review) return null

  return {
    id: review.id,
    rating: review.rating,
    recommendation: review.recommendation,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }
}

export async function submitRrcKitchenReview(data: {
  rating: number
  recommendation?: boolean | null
  comment?: string | null
}) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  const rating = Math.round(data.rating)
  if (!rating || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a rating between 1 and 5" }
  }

  const review = await prisma.rrcKitchenReview.upsert({
    where: { kitchenPartnerId: kitchenPartner.id },
    update: {
      rating,
      recommendation: data.recommendation ?? null,
      comment: data.comment?.trim() || null,
    },
    create: {
      kitchenPartnerId: kitchenPartner.id,
      rating,
      recommendation: data.recommendation ?? null,
      comment: data.comment?.trim() || null,
    },
  })

  return { success: true, id: review.id }
}

export async function getKitchenTestimonials() {
  const testimonials = await prisma.rrcKitchenReview.findMany({
    where: {
      comment: { not: "" },
      kitchenPartner: { status: { in: ["APPROVED", "ACTIVE"] } },
    },
    include: {
      kitchenPartner: {
        include: {
          kitchenAlias: { select: { displayName: true, imageUrl: true } },
          user: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
    take: 6,
  })

  return testimonials.map((t) => ({
    id: t.id,
    name: t.kitchenPartner.kitchenAlias?.displayName ?? t.kitchenPartner.user?.name ?? "Home Chef Partner",
    role: "Home Chef",
    text: t.comment,
    image: t.kitchenPartner.kitchenAlias?.imageUrl ?? t.kitchenPartner.user?.image ?? "/kitchen/profile.webp",
    rating: t.rating,
    updatedAt: t.updatedAt.toISOString(),
  }))
}
