"use server"

import prisma from "@/lib/prisma"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"

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
      kitchenCategories: { include: { category: true } },
      user: { select: { name: true, phoneNumber: true, email: true } },
      _count: { select: { orderItems: true, menus: true } },
      orderItems: { select: { unitPrice: true, quantity: true } },
    },
  })

  return partners.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.kitchenAlias?.displayName ?? p.user?.name ?? "",
    phoneNumber: p.user?.phoneNumber ?? null,
    email: p.user?.email ?? null,
    status: p.status,
    orders: p._count.orderItems,
    menuCount: p._count.menus,
    revenue: p.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0),
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
    name: p.user?.name ?? "Unknown",
    phoneNumber: p.user?.phoneNumber ?? null,
    email: p.user?.email ?? null,
    status: p.status,
    orders: p._count.kitchenAssignments,
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

    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to update kitchen cuisines:", error)
    return { success: false, error: "Failed to update cuisines" }
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
