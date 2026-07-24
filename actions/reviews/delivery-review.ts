"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

const RECENCY_WEIGHT = 0.15

export async function createDeliveryReview(data: {
  orderId: string
  deliveryPartnerId: string
  rating: number
  speedRating?: number
  behaviorHygiene?: boolean
  safetyContactless?: boolean
  comment?: string
}) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" }
  }

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: { userId: true, deliveryReview: { select: { id: true } } },
  })

  if (!order) return { success: false, error: "Order not found" }
  if (order.userId !== session.user.id) return { success: false, error: "Unauthorized" }
  if (order.deliveryReview) return { success: false, error: "Already reviewed" }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.deliveryReview.create({
        data: {
          orderId: data.orderId,
          userId: session.user.id,
          deliveryPartnerId: data.deliveryPartnerId,
          rating: data.rating,
          speedRating: data.speedRating ?? null,
          behaviorHygiene: data.behaviorHygiene ?? null,
          safetyContactless: data.safetyContactless ?? null,
          comment: data.comment ?? null,
        },
      })

      const partner = await tx.deliveryPartner.findUniqueOrThrow({
        where: { id: data.deliveryPartnerId },
        select: { avgRating: true },
      })

      const newAvg = partner.avgRating
        ? Number(partner.avgRating) * (1 - RECENCY_WEIGHT) + data.rating * RECENCY_WEIGHT
        : data.rating

      await tx.deliveryPartner.update({
        where: { id: data.deliveryPartnerId },
        data: {
          avgRating: newAvg,
          totalReviews: { increment: 1 },
        },
      })
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to submit review" }
  }
}

export async function getDeliveryPartnerRating(deliveryPartnerId: string) {
  const reviews = await prisma.deliveryReview.findMany({
    where: { deliveryPartnerId },
    select: { rating: true },
  })

  if (reviews.length === 0) return { average: 0, count: 0 }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return { average: Math.round(average * 10) / 10, count: reviews.length }
}
