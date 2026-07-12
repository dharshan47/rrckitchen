"use server"

import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function getAllPaymentOffers() {
  try { await requireAdmin() } catch { return [] }

  const offers = await prisma.paymentOffer.findMany({
    orderBy: { createdAt: "desc" },
  })

  return offers.map((o) => ({
    id: o.id,
    name: o.name,
    description: o.description,
    offerType: o.offerType,
    discountType: o.discountType,
    discountValue: Number(o.discountValue),
    maxDiscount: o.maxDiscount ? Number(o.maxDiscount) : null,
    minOrderValue: o.minOrderValue ? Number(o.minOrderValue) : null,
    validFrom: o.validFrom.toISOString(),
    validTo: o.validTo.toISOString(),
    isActive: o.isActive,
    createdAt: o.createdAt.toISOString(),
  }))
}

export async function createPaymentOffer(data: {
  name: string
  description?: string | null
  offerType: "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL"
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  validFrom: string
  validTo: string
  isActive: boolean
}) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    const offer = await prisma.paymentOffer.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        offerType: data.offerType,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount ?? null,
        minOrderValue: data.minOrderValue ?? null,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        isActive: data.isActive,
      },
    })

    return { success: true, id: offer.id }
  } catch (error) {
    console.error("createPaymentOffer error:", error)
    return { success: false, error: "Failed to create payment offer" }
  }
}

export async function updatePaymentOffer(
  id: string,
  data: {
    name?: string
    description?: string | null
    offerType?: "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL"
    discountType?: "FLAT" | "PERCENTAGE"
    discountValue?: number
    maxDiscount?: number | null
    minOrderValue?: number | null
    validFrom?: string
    validTo?: string
    isActive?: boolean
  },
) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.offerType !== undefined) updateData.offerType = data.offerType
    if (data.discountType !== undefined) updateData.discountType = data.discountType
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue
    if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom)
    if (data.validTo !== undefined) updateData.validTo = new Date(data.validTo)
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await prisma.paymentOffer.update({ where: { id }, data: updateData })

    return { success: true }
  } catch (error) {
    console.error("updatePaymentOffer error:", error)
    return { success: false, error: "Failed to update payment offer" }
  }
}

export async function deletePaymentOffer(id: string) {
  try { await requireAdmin() } catch { return { success: false, error: "Unauthorized" } }

  try {
    await prisma.paymentOffer.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error("deletePaymentOffer error:", error)
    return { success: false, error: "Failed to delete payment offer" }
  }
}
