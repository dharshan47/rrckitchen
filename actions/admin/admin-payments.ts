"use server"

import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function getAdminPayments() {
  try { await requireAdmin() } catch { return [] }

  const payments = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          user: { select: { name: true, phoneNumber: true } },
          orderItems: {
            include: {
              kitchenPartner: { include: { kitchenAlias: true } },
            },
          },
        },
      },
      refunds: { select: { id: true, amount: true, status: true, reason: true, initiatedAt: true, processedAt: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return payments.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    orderPublicCode: p.order?.publicCode,
    customer: {
      name: p.order?.user?.name,
      phone: p.order?.user?.phoneNumber,
    },
    kitchen: p.order?.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName,
    amount: Number(p.amount),
    status: p.status,
    paymentMethod: p.paymentMethod,
    provider: p.provider,
    providerOrderId: p.providerOrderId,
    providerPaymentId: p.providerPaymentId,
    paidAt: p.paidAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    orderStatus: p.order?.status,
    refunds: p.refunds.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      status: r.status,
      reason: r.reason,
      initiatedAt: r.initiatedAt.toISOString(),
      processedAt: r.processedAt?.toISOString(),
    })),
  }))
}

export type AdminPayment = Awaited<ReturnType<typeof getAdminPayments>>[number]
