"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getAvailableLoyaltyCoupons() {
  return prisma.loyaltyCoupon.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: "asc" },
  })
}

export async function getAllLoyaltyCoupons() {
  const coupons = await prisma.loyaltyCoupon.findMany({
    orderBy: { createdAt: "desc" },
  })
  return coupons.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
    pointsCost: c.pointsCost,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    purchaseCount: 0,
  }))
}

export async function purchaseCouponWithPoints(loyaltyCouponId: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const loyaltyCoupon = await prisma.loyaltyCoupon.findUnique({
    where: { id: loyaltyCouponId },
  })
  if (!loyaltyCoupon || !loyaltyCoupon.isActive) {
    throw new Error("Coupon not available")
  }

  const pointsRecord = await prisma.loyaltyPoints.findUnique({
    where: { userId: session.user.id },
  })
  if (!pointsRecord || pointsRecord.points < loyaltyCoupon.pointsCost) {
    throw new Error("Insufficient loyalty points")
  }

  const couponCode = `LOYALTY-${session.user.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  await prisma.$transaction(async (tx) => {
    await tx.loyaltyPoints.update({
      where: { userId: session.user.id },
      data: { points: { decrement: loyaltyCoupon.pointsCost } },
    })

    await tx.loyaltyTransaction.create({
      data: {
        userId: session.user.id,
        points: -loyaltyCoupon.pointsCost,
        type: "REDEEMED",
        reference: `coupon-${loyaltyCoupon.id}`,
        description: `Purchased "${loyaltyCoupon.name}" coupon for ${loyaltyCoupon.pointsCost} points`,
      },
    })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const purchase = await tx.loyaltyCouponPurchase.create({
      data: {
        userId: session.user.id,
        loyaltyCouponId: loyaltyCoupon.id,
        couponCode,
        discountType: loyaltyCoupon.discountType,
        discountValue: loyaltyCoupon.discountValue,
        maxDiscount: loyaltyCoupon.maxDiscount,
        minOrderValue: loyaltyCoupon.minOrderValue,
        expiresAt,
      },
    })

    return purchase
  })

  return { couponCode, discountType: loyaltyCoupon.discountType, discountValue: Number(loyaltyCoupon.discountValue) }
}

export async function getUserPurchasedCoupons() {
  const session = await getSession()
  if (!session?.user?.id) return []

  return prisma.loyaltyCouponPurchase.findMany({
    where: { userId: session.user.id },
    include: { loyaltyCoupon: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getLoyaltyCouponById(id: string) {
  return prisma.loyaltyCoupon.findUnique({ where: { id } })
}

export async function createLoyaltyCoupon(data: {
  name: string
  description?: string
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  pointsCost: number
}) {
  return prisma.loyaltyCoupon.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscount: data.maxDiscount ?? null,
      minOrderValue: data.minOrderValue ?? null,
      pointsCost: data.pointsCost,
    },
  })
}

export async function updateLoyaltyCoupon(
  id: string,
  data: {
    name?: string
    description?: string | null
    discountType?: "FLAT" | "PERCENTAGE"
    discountValue?: number
    maxDiscount?: number | null
    minOrderValue?: number | null
    pointsCost?: number
    isActive?: boolean
  },
) {
  return prisma.loyaltyCoupon.update({ where: { id }, data })
}

export async function deleteLoyaltyCoupon(id: string) {
  return prisma.loyaltyCoupon.delete({ where: { id } })
}

export async function toggleLoyaltyCouponActive(id: string, isActive: boolean) {
  return prisma.loyaltyCoupon.update({ where: { id }, data: { isActive } })
}