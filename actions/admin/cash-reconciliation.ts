"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"

export interface CodOrderResult {
  id: string
  totalAmount: number
  codAmountExpected: number
  codAmountEntered: number | null
  status: string
  createdAt: Date
  deliveryPartner: { id: string; name: string; phone: string } | null
  customerName: string
}

export async function getCodOrders(): Promise<CodOrderResult[]> {
  await requirePermission("MANAGE_PAYOUTS")

  const orders = await prisma.order.findMany({
    where: {
      payment: { provider: "CASH_ON_DELIVERY" },
    },
    include: {
      deliveryPartner: {
        include: {
          user: {
            select: { name: true, phoneNumber: true },
          },
        },
      },
      user: {
        select: { name: true },
      },
      payment: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return orders.map((o) => ({
    id: o.id,
    totalAmount: Number(o.totalAmount),
    codAmountExpected: Number(o.codAmountExpected ?? o.totalAmount),
    codAmountEntered: o.codAmountEntered ? Number(o.codAmountEntered) : null,
    status: o.status,
    createdAt: o.createdAt,
    deliveryPartner: o.deliveryPartner
      ? {
          id: o.deliveryPartner.id,
          name: o.deliveryPartner.user?.name ?? "",
          phone: o.deliveryPartner.user?.phoneNumber ?? "",
        }
      : null,
    customerName: o.user?.name ?? "",
  }))
}
