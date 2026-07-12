"use server"

import prisma from "@/lib/prisma"

export interface ValidateCouponInput {
  code: string
  userId: string
  subtotal: number
  kitchenPartnerId?: string
}

export interface CouponResult {
  valid: boolean
  discountAmount: number
  couponId?: string
  discountType?: "FLAT" | "PERCENTAGE"
  description?: string
  error?: string
}

export async function validateCoupon(input: ValidateCouponInput): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: input.code },
  })

  if (!coupon) {
    return { valid: false, discountAmount: 0, error: "Invalid coupon code" }
  }

  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, error: "This coupon is no longer active" }
  }

  const now = new Date()
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { valid: false, discountAmount: 0, error: "This coupon has expired" }
  }

  if (coupon.minOrderValue && input.subtotal < Number(coupon.minOrderValue)) {
    return {
      valid: false,
      discountAmount: 0,
      error: `Minimum order value of ₹${coupon.minOrderValue} required`,
    }
  }

  if (coupon.scope === "KITCHEN_SPECIFIC") {
    if (!input.kitchenPartnerId || coupon.kitchenPartnerId !== input.kitchenPartnerId) {
      return { valid: false, discountAmount: 0, error: "This coupon is not valid for your order" }
    }
  }

  if (coupon.usageLimitTotal) {
    const redemptionCount = await prisma.couponRedemption.count({
      where: { couponId: coupon.id },
    })
    if (redemptionCount >= coupon.usageLimitTotal) {
      return { valid: false, discountAmount: 0, error: "This coupon has reached its usage limit" }
    }
  }

  if (coupon.usageLimitPerUser) {
    const userRedemptionCount = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId: input.userId },
    })
    if (userRedemptionCount >= coupon.usageLimitPerUser) {
      return { valid: false, discountAmount: 0, error: "You have already used this coupon" }
    }
  }

  let discountAmount = 0
  if (coupon.discountType === "FLAT") {
    discountAmount = Number(coupon.discountValue)
  } else {
    discountAmount = Math.round((input.subtotal * Number(coupon.discountValue)) / 100 * 100) / 100
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount)
    }
  }

  if (discountAmount > input.subtotal) {
    discountAmount = input.subtotal
  }

  return {
    valid: true,
    discountAmount,
    couponId: coupon.id,
    discountType: coupon.discountType,
    description: coupon.description ?? undefined,
  }
}

export async function recordCouponRedemption(
  couponId: string,
  userId: string,
  orderId: string,
  discountAmount: number,
) {
  await prisma.couponRedemption.create({
    data: {
      couponId,
      userId,
      orderId,
      discountAmount,
    },
  })
}
