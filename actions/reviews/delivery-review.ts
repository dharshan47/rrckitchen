"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function createDeliveryReview(data: {
  orderId: string
  deliveryPartnerId: string
  rating: number
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

  const partner = await prisma.deliveryPartner.findUnique({
    where: { id: data.deliveryPartnerId },
    select: { id: true },
  })
  if (!partner) return { success: false, error: "Delivery partner not found" }

  try {
    await prisma.deliveryReview.create({
      data: {
        orderId: data.orderId,
        userId: session.user.id,
        deliveryPartnerId: data.deliveryPartnerId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
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
