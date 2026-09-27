"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getPendingTiffinPickups() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  return await prisma.tiffinPickup.findMany({
    where: {
      status: "SCHEDULED",
      scheduledDate: { lte: new Date(new Date().setHours(23, 59, 59, 999)) } // Includes all of today
    },
    include: {
      pickupAddress: true,
      customer: { select: { name: true, phoneNumber: true } },
      kitchen: { include: { kitchenAlias: true, kitchenAddress: true } },
      order: { select: { publicCode: true } }
    },
    orderBy: { scheduledDate: "asc" }
  })
}

export async function getTiffinPickupByOrderId(orderId: string) {
  return await prisma.tiffinPickup.findUnique({
    where: { orderId },
    include: {
      deliveryPartner: { include: { user: true } }
    }
  })
}

export async function assignTiffinPickup(pickupId: string, partnerId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  return await prisma.tiffinPickup.update({
    where: { id: pickupId },
    data: {
      deliveryPartnerId: partnerId,
      status: "ASSIGNED"
    }
  })
}

export async function updateTiffinPickupStatus(pickupId: string, status: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const validStatuses = ["ACCEPTED", "STARTED", "ARRIVED", "COLLECTED", "COMPLETED", "FAILED"]
  if (!validStatuses.includes(status)) throw new Error("Invalid status")

  return await prisma.tiffinPickup.update({
    where: { id: pickupId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { status: status as any }
  })
}

export async function getMyTiffinPickups() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id }
  })
  if (!partner) throw new Error("Not a delivery partner")

  return await prisma.tiffinPickup.findMany({
    where: { deliveryPartnerId: partner.id },
    include: {
      pickupAddress: true,
      customer: { select: { name: true, phoneNumber: true } },
      kitchen: { include: { kitchenAlias: true, kitchenAddress: true } },
      order: { select: { publicCode: true, totalAmount: true } }
    },
    orderBy: { scheduledDate: "desc" }
  })
}

export async function getCustomerTiffinPickups() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  return await prisma.tiffinPickup.findMany({
    where: { customerId: session.user.id },
    include: {
      deliveryPartner: { include: { user: true } },
      kitchen: { include: { kitchenAlias: true } },
      order: { select: { publicCode: true } }
    },
    orderBy: { scheduledDate: "desc" }
  })
}
