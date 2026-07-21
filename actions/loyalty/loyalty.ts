"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

const POINTS_PER_RUPEE = 1
const REDEMPTION_RATE = 100

const BONUS_ABOVE_500 = 50
const BONUS_ABOVE_1500 = 150
const BONUS_MULTI_ITEM = 30

export async function computeTier(lifetimePoints: number): Promise<string> {
  if (lifetimePoints >= 5000) return "GOLD"
  if (lifetimePoints >= 2000) return "SILVER"
  return "BRONZE"
}

export async function awardPoints(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      totalAmount: true,
      orderItems: { select: { quantity: true } },
    },
  })
  if (!order) throw new Error("Order not found")

  const totalAmount = Number(order.totalAmount)
  let pointsEarned = Math.floor(totalAmount * POINTS_PER_RUPEE)

  const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const bonuses: string[] = []

  if (totalAmount >= 1500) {
    pointsEarned += BONUS_ABOVE_1500
    bonuses.push(`₹1500+ order bonus: +${BONUS_ABOVE_1500}`)
  } else if (totalAmount >= 500) {
    pointsEarned += BONUS_ABOVE_500
    bonuses.push(`₹500+ order bonus: +${BONUS_ABOVE_500}`)
  }

  if (totalItems > 2) {
    pointsEarned += BONUS_MULTI_ITEM
    bonuses.push(`Multi-item bonus (${totalItems} items): +${BONUS_MULTI_ITEM}`)
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.loyaltyPoints.findUnique({ where: { userId: order.userId } })
    if (!current) {
      await tx.loyaltyPoints.create({
        data: {
          userId: order.userId,
          points: pointsEarned,
          lifetimePoints: pointsEarned,
          tier: await computeTier(pointsEarned),
        },
      })
    } else {
      const newLifetime = current.lifetimePoints + pointsEarned
      await tx.loyaltyPoints.update({
        where: { userId: order.userId },
        data: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
          tier: await computeTier(newLifetime),
        },
      })
    }
    const desc = bonuses.length > 0
      ? `Earned ${pointsEarned} points from order (${bonuses.join(", ")})`
      : `Earned ${pointsEarned} points from order`
    await tx.loyaltyTransaction.create({
      data: {
        userId: order.userId,
        points: pointsEarned,
        type: "EARNED",
        reference: orderId,
        description: desc,
      },
    })
  })

  return { pointsEarned }
}

export async function redeemPoints(orderId: string, pointsToRedeem: number) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const pointsRecord = await prisma.loyaltyPoints.findUnique({ where: { userId: session.user.id } })
  if (!pointsRecord || pointsRecord.points < pointsToRedeem) {
    throw new Error("Insufficient loyalty points")
  }

  const discountAmount = Math.floor(pointsToRedeem / REDEMPTION_RATE)

  await prisma.$transaction(async (tx) => {
    await tx.loyaltyPoints.update({
      where: { userId: session.user.id },
      data: { points: { decrement: pointsToRedeem } },
    })
    await tx.loyaltyTransaction.create({
      data: {
        userId: session.user.id,
        points: -pointsToRedeem,
        type: "REDEEMED",
        reference: orderId,
        description: `Redeemed ${pointsToRedeem} points for ₹${discountAmount} discount`,
      },
    })
  })

  return { discountAmount, pointsUsed: pointsToRedeem }
}

export async function getLoyaltyHistory() {
  const session = await getSession()
  if (!session?.user?.id) return []

  return prisma.loyaltyTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getLoyaltySummary() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const points = await prisma.loyaltyPoints.findUnique({
    where: { userId: session.user.id },
  })
  return points
}