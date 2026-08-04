"use server"

import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function getAllCoupons() {
  try { await requireAdmin() } catch { return [] }

  const coupons = await prisma.coupon.findMany({
    include: {
      kitchenPartner: {
        select: {
          kitchenAlias: { select: { displayName: true } },
        },
      },
      _count: { select: { redemptions: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
    scope: c.scope,
    kitchenPartnerId: c.kitchenPartnerId,
    kitchenName: c.kitchenPartner?.kitchenAlias?.displayName,
    validFrom: c.validFrom.toISOString(),
    validTo: c.validTo.toISOString(),
    usageLimitTotal: c.usageLimitTotal,
    usageLimitPerUser: c.usageLimitPerUser,
    isActive: c.isActive,
    redemptionCount: c._count.redemptions,
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function getSimpleKitchenPartners() {
  try { await requireAdmin() } catch { return [] }

  const partners = await prisma.kitchenPartner.findMany({
    where: {
      user: {
        userRoles: {
          none: { role: { name: "ADMIN" } },
        },
      },
    },
    select: {
      id: true,
      kitchenAlias: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return partners.map((p) => ({
    id: p.id,
    name: p.kitchenAlias?.displayName,
  }))
}

export async function createCoupon(data: {
  code: string
  description?: string | null
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  scope: "PLATFORM" | "KITCHEN_SPECIFIC"
  kitchenPartnerId?: string | null
  validFrom: string
  validTo: string
  usageLimitTotal?: number | null
  usageLimitPerUser?: number | null
  isActive: boolean
}) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } })
    if (existing) return { success: false, error: "A coupon with this code already exists" }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description ?? null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount ?? null,
        minOrderValue: data.minOrderValue ?? null,
        scope: data.scope,
        kitchenPartnerId: data.scope === "KITCHEN_SPECIFIC" ? data.kitchenPartnerId : null,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        usageLimitTotal: data.usageLimitTotal ?? null,
        usageLimitPerUser: data.usageLimitPerUser ?? 1,
        isActive: data.isActive,
      },
    })

    return { success: true, id: coupon.id }
  } catch (error) {
    console.error("createCoupon error:", error)
    return { success: false, error: "Failed to create coupon" }
  }
}

export async function updateCoupon(
  id: string,
  data: {
    code?: string
    description?: string | null
    discountType?: "FLAT" | "PERCENTAGE"
    discountValue?: number
    maxDiscount?: number | null
    minOrderValue?: number | null
    scope?: "PLATFORM" | "KITCHEN_SPECIFIC"
    kitchenPartnerId?: string | null
    validFrom?: string
    validTo?: string
    usageLimitTotal?: number | null
    usageLimitPerUser?: number | null
    isActive?: boolean
  },
) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    if (data.code) {
      const existing = await prisma.coupon.findFirst({
        where: { code: data.code.toUpperCase(), id: { not: id } },
      })
      if (existing) return { success: false, error: "A coupon with this code already exists" }
    }

    const updateData: Record<string, unknown> = {}
    if (data.code !== undefined) updateData.code = data.code.toUpperCase()
    if (data.description !== undefined) updateData.description = data.description
    if (data.discountType !== undefined) updateData.discountType = data.discountType
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue
    if (data.scope !== undefined) {
      updateData.scope = data.scope
      if (data.scope === "PLATFORM") updateData.kitchenPartnerId = null
    }
    if (data.kitchenPartnerId !== undefined) updateData.kitchenPartnerId = data.kitchenPartnerId
    if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom)
    if (data.validTo !== undefined) updateData.validTo = new Date(data.validTo)
    if (data.usageLimitTotal !== undefined) updateData.usageLimitTotal = data.usageLimitTotal
    if (data.usageLimitPerUser !== undefined) updateData.usageLimitPerUser = data.usageLimitPerUser
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await prisma.coupon.update({ where: { id }, data: updateData })

    return { success: true }
  } catch (error) {
    console.error("updateCoupon error:", error)
    return { success: false, error: "Failed to update coupon" }
  }
}

export async function deleteCoupon(id: string) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    await prisma.coupon.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error("deleteCoupon error:", error)
    return { success: false, error: "Failed to delete coupon" }
  }
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    await prisma.coupon.update({ where: { id }, data: { isActive } })
    return { success: true }
  } catch (error) {
    console.error("toggleCouponActive error:", error)
    return { success: false, error: "Failed to update coupon status" }
  }
}
