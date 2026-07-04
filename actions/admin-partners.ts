"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getAdminKitchenPartners() {
  const session = await getSession()
  if (!session?.user?.id) return []

  const partners = await prisma.kitchenPartner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kitchenAlias: true,
      kitchenKyc: true,
      user: { select: { name: true, phoneNumber: true, email: true } },
      _count: { select: { orderItems: true, menus: true } },
      orderItems: { select: { unitPrice: true, quantity: true } },
    },
  })

  return partners.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.kitchenAlias?.displayName ?? p.user?.name ?? "Unknown",
    phoneNumber: p.user?.phoneNumber ?? null,
    email: p.user?.email ?? null,
    status: p.status,
    orders: p._count.orderItems,
    menuCount: p._count.menus,
    revenue: p.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0),
    kyc: p.kitchenKyc
      ? {
          bankName: p.kitchenKyc.bankName,
          bankAccountNumber: p.kitchenKyc.bankAccountNumber,
          ifscCode: p.kitchenKyc.ifscCode,
          accountHolderName: p.kitchenKyc.accountHolderName,
          upiId: p.kitchenKyc.upiId,
          gpayNumber: p.kitchenKyc.gpayNumber,
          phoneNumber: p.kitchenKyc.phoneNumber,
          fssaiNumber: p.kitchenKyc.fssaiNumber,
          aadhaarVerified: p.kitchenKyc.aadhaarVerified,
        }
      : null,
    createdAt: p.createdAt,
  }))
}

export async function getAdminDeliveryPartners() {
  const session = await getSession()
  if (!session?.user?.id) return []

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
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

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
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update status" }
  }
}

export async function updateDeliveryPartnerStatus(id: string, status: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

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
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update status" }
  }
}
