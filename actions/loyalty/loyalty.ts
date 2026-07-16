"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

const POINTS_PER_RUPEE = 1
const REDEMPTION_RATE = 100

function computeTier(lifetimePoints: number): string {
  if (lifetimePoints >= 5000) return "GOLD"
  if (lifetimePoints >= 2000) return "SILVER"
  return "BRONZE"
}

export async function awardPoints(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, totalAmount: true },
  })
  if (!order) throw new Error("Order not found")

  const pointsEarned = Math.floor(Number(order.totalAmount) * POINTS_PER_RUPEE)

  await prisma.$transaction(async (tx) => {
    const current = await tx.loyaltyPoints.findUnique({ where: { userId: order.userId } })
    if (!current) {
      await tx.loyaltyPoints.create({
        data: {
          userId: order.userId,
          points: pointsEarned,
          lifetimePoints: pointsEarned,
          tier: computeTier(pointsEarned),
        },
      })
    } else {
      const newLifetime = current.lifetimePoints + pointsEarned
      await tx.loyaltyPoints.update({
        where: { userId: order.userId },
        data: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
          tier: computeTier(newLifetime),
        },
      })
    }
    await tx.loyaltyTransaction.create({
      data: {
        userId: order.userId,
        points: pointsEarned,
        type: "EARNED",
        reference: orderId,
        description: `Earned ${pointsEarned} points from order`,
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
