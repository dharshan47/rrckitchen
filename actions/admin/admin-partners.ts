"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"
import { getAblyRest } from "@/lib/ably/server"

export async function getAdminKitchenPartners() {
  try { await requireAdmin() } catch { return [] }

  const partners = await prisma.kitchenPartner.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      user: {
        userRoles: {
          none: {
            role: {
              name: "ADMIN",
            },
          },
        },
      },
    },
    include: {
      kitchenAlias: true,
      kitchenKyc: true,
      kitchenAddress: true,
      kitchenCategories: { include: { category: true } },
      user: { select: { name: true, phoneNumber: true, email: true } },
      _count: { select: { orderItems: true, menus: true } },
      orderItems: { select: { unitPrice: true, quantity: true } },
    },
  })

  return partners.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.kitchenAlias?.displayName ?? p.user?.name,
    phoneNumber: p.user?.phoneNumber,
    email: p.user?.email,
    imageUrl: p.kitchenAlias?.imageUrl,
    customOfferText: p.kitchenAlias?.customOfferText,
    displayName: p.kitchenAlias?.displayName ?? p.user?.name,
    status: p.status,
    orders: p._count.orderItems,
    menuCount: p._count.menus,
    revenue: p.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0),
    estimatedPrepTime: p.estimatedPrepTime,
    address: p.kitchenAddress,
    cuisines: p.kitchenCategories.map((kc) => ({ id: kc.category.id, name: kc.category.name })),
    kyc: p.kitchenKyc
      ? {
          bankName: p.kitchenKyc.bankName,
          bankAccountNumber: p.kitchenKyc.bankAccountNumber,
          ifscCode: p.kitchenKyc.ifscCode,
          accountHolderName: p.kitchenKyc.accountHolderName,
          upiId: p.kitchenKyc.upiId,
          gpayNumber: p.kitchenKyc.gpayNumber,
          phoneNumber: p.kitchenKyc.phoneNumber,
          aadhaarVerified: p.kitchenKyc.aadhaarVerified,
        }
      : null,
    createdAt: p.createdAt,
  }))
}

export async function getAdminDeliveryPartners() {
  try { await requireAdmin() } catch { return [] }

  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
      kyc: true,
      _count: { select: { kitchenAssignments: true } },
    },
  })

  return partners.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user?.name ?? "",
    phoneNumber: p.user?.phoneNumber ?? null,
    email: p.user?.email ?? null,
    status: p.status,
    orders: p._count.kitchenAssignments,
    avgRating: Number(p.avgRating),
    totalReviews: p.totalReviews,
    isOnline: p.isOnline,
    kyc: p.kyc
      ? {
          bankName: p.kyc.bankName,
          bankAccountNumber: p.kyc.bankAccountNumber,
          ifscCode: p.kyc.ifscCode,
          accountHolderName: p.kyc.accountHolderName,
          upiId: p.kyc.upiId,
          googlePayNumber: p.kyc.googlePayNumber,
          phonePeNumber: p.kyc.phonePeNumber,
          verifiedAt: p.kyc.verifiedAt,
        }
      : null,
    createdAt: p.createdAt,
  }))
}

export async function updateKitchenPartnerStatus(id: string, status: string) {
  let session
  try { const result = await requirePermission("APPROVE_KYC"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  const validStatuses = ["PENDINGAPPROVAL", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"]
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  try {
    await prisma.kitchenPartner.update({
      where: { id },
      data: {
        status: status as import("@/lib/generated/prisma/client").PartnerStatus,
        ...(status === "APPROVED" || status === "ACTIVE" ? { approvedAt: new Date() } : {}),
      },
    })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_KITCHEN_PARTNER_STATUS",
      targetType: "KitchenPartner",
      targetId: id,
      metadata: { status },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update status" }
  }
}

export async function updateKitchenCuisines(kitchenId: string, categoryIds: string[]) {
  let session
  try { const result = await requirePermission("MANAGE_CMS"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.kitchenCategory.deleteMany({ where: { kitchenPartnerId: kitchenId } })

      if (categoryIds.length > 0) {
        await tx.kitchenCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            kitchenPartnerId: kitchenId,
            categoryId,
          })),
        })
      }
    })

    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_KITCHEN_CUISINES",
      targetType: "KitchenPartner",
      targetId: kitchenId,
      metadata: { categoryIds },
    })

    await publishKitchenUpdate(kitchenId, "cuisines-updated", { categoryIds })

    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to update kitchen cuisines:", error)
    return { success: false, error: "Failed to update cuisines" }
  }
}

async function publishKitchenUpdate(kitchenId: string, event: string, data: Record<string, unknown>) {
  try {
    const ably = getAblyRest()
    const channel = ably.channels.get(`kitchen:${kitchenId}`)
    await channel.publish(event, data)
  } catch {
    // Ably not configured — skip real-time publish
  }
}

export async function updateKitchenDetails(
  kitchenId: string,
  details: {
    estimatedPrepTime?: number | null
    lineOne?: string
    doorNo?: string
    area?: string
    landmark?: string
    pincode?: string
    latitude?: number
    longitude?: number
    displayName?: string
    operatingHours?: Record<string, { open: string; close: string }> | null
  },
) {
  let session
  try { const result = await requirePermission("MANAGE_CMS"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const { estimatedPrepTime, displayName, operatingHours, ...addressFields } = details

    if (estimatedPrepTime !== undefined || operatingHours !== undefined) {
      await prisma.kitchenPartner.update({
        where: { id: kitchenId },
        data: {
          ...(estimatedPrepTime !== undefined ? { estimatedPrepTime } : {}),
          ...(operatingHours !== undefined ? { operatingHours: operatingHours as object } : {}),
        },
      })
    }

    if (displayName) {
      await prisma.kitchenAlias.update({
        where: { kitchenPartnerId: kitchenId },
        data: { displayName },
      })
    }

    const hasAddressFields = Object.values(addressFields).some((v) => v !== undefined)
    if (hasAddressFields) {
      const addressData: Prisma.KitchenAddressUncheckedUpdateInput = {}
      if (addressFields.lineOne !== undefined) addressData.lineOne = addressFields.lineOne
      if (addressFields.doorNo !== undefined) addressData.doorNo = addressFields.doorNo
      if (addressFields.area !== undefined) addressData.area = addressFields.area
      if (addressFields.landmark !== undefined) addressData.landmark = addressFields.landmark
      if (addressFields.pincode !== undefined) addressData.pincode = addressFields.pincode
      if (addressFields.latitude !== undefined) addressData.latitude = addressFields.latitude
      if (addressFields.longitude !== undefined) addressData.longitude = addressFields.longitude

      await prisma.kitchenAddress.upsert({
        where: { kitchenPartnerId: kitchenId },
        create: {
          kitchenPartnerId: kitchenId,
          lineOne: addressFields.lineOne ?? "",
          pincode: addressFields.pincode ?? "",
          latitude: addressFields.latitude ?? 0,
          longitude: addressFields.longitude ?? 0,
          ...addressData,
        } as Prisma.KitchenAddressUncheckedCreateInput,
        update: addressData,
      })
    }

    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_KITCHEN_DETAILS",
      targetType: "KitchenPartner",
      targetId: kitchenId,
      metadata: details,
    })

    await publishKitchenUpdate(kitchenId, "details-updated", details as Record<string, unknown>)

    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to update kitchen details:", error)
    return { success: false, error: "Failed to update kitchen details" }
  }
}

export async function updateKitchenImage(kitchenId: string, imageUrl: string | null) {
  let session
  try { const result = await requirePermission("MANAGE_CMS"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.kitchenAlias.update({
      where: { kitchenPartnerId: kitchenId },
      data: { imageUrl },
    })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_KITCHEN_IMAGE",
      targetType: "KitchenAlias",
      targetId: kitchenId,
      metadata: { imageUrl },
    })
    await publishKitchenUpdate(kitchenId, "image-updated", { imageUrl })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update kitchen image" }
  }
}

export async function updateKitchenOfferText(kitchenId: string, customOfferText: string | null) {
  let session
  try { const result = await requirePermission("MANAGE_CMS"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.kitchenAlias.update({
      where: { kitchenPartnerId: kitchenId },
      data: { customOfferText },
    })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_KITCHEN_OFFER_TEXT",
      targetType: "KitchenAlias",
      targetId: kitchenId,
      metadata: { customOfferText },
    })
    await publishKitchenUpdate(kitchenId, "offer-text-updated", { customOfferText })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update offer text" }
  }
}

export async function updateDeliveryPartnerStatus(id: string, status: string) {
  let session
  try { const result = await requirePermission("APPROVE_KYC"); session = result.session } catch {
    return { success: false, error: "Unauthorized" }
  }

  const validStatuses = ["PENDINGAPPROVAL", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"]
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  try {
    await prisma.deliveryPartner.update({
      where: { id },
      data: {
        status: status as import("@/lib/generated/prisma/client").PartnerStatus,
        ...(status === "APPROVED" || status === "ACTIVE" ? { approvedAt: new Date() } : {}),
      },
    })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "UPDATE_DELIVERY_PARTNER_STATUS",
      targetType: "DeliveryPartner",
      targetId: id,
      metadata: { status },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update status" }
  }
}
