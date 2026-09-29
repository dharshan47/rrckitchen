"use server"

import { redis } from "@/lib/redis"
import { getAblyRest } from "@/lib/ably/server"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

async function findNearbyOnlineMemberIds(kitchenLat: number, kitchenLng: number): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redisRaw = redis as any
  const geoMembers = await redisRaw.geosearch(
    "deliveryPersons:live",
    { type: "FROMLONLAT", coordinate: { lon: kitchenLng, lat: kitchenLat } },
    { type: "BYRADIUS", radius: 5, radiusType: "KM" },
    "ASC",
    { count: { limit: 20 } },
  )
  return Array.isArray(geoMembers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? geoMembers.map((r: any) => String(r?.member ?? r)).filter(Boolean)
    : []
}

async function tryAssignDeliveryPerson(
  orderId: string,
  deliveryPersonId: string,
  kitchenLat?: number,
  kitchenLng?: number
) {
  const person = await prisma.deliveryPartner.findUnique({
    where: { id: deliveryPersonId },
    select: { id: true, isOnline: true },
  })
  if (!person?.isOnline) return null

  const assignment = await prisma.deliveryAssignment.create({
    data: {
      orderId,
      deliveryPartnerId: deliveryPersonId,
      assignedByAdminId: "system",
      status: "PENDING",
    },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { deliveryPartnerId: deliveryPersonId, deliveryStatus: "ASSIGNED" },
  })

  const ably = getAblyRest()
  await Promise.all([
    ably.channels.get(`deliveryPartner:${deliveryPersonId}`).publish("delivery:offer", {
      orderId,
      kitchenLat,
      kitchenLng,
    }),
    ably.channels.get(`order:${orderId}`).publish("order:status", {
      status: "DELIVERY_ASSIGNED",
    }),
  ])

  return assignment
}

export async function assignNearestDeliveryPerson(
  orderId: string,
  kitchenLat: number,
  kitchenLng: number
) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const existingAssignment = await prisma.deliveryAssignment.findFirst({
    where: { orderId },
  })
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redisRaw = redis as any
  if (existingAssignment) {
    // If it's pending for more than 60 seconds, expire it
    if (existingAssignment.status === "PENDING" && Date.now() - existingAssignment.createdAt.getTime() > 60_000) {
      await redisRaw.sadd(`order:${orderId}:rejected`, existingAssignment.deliveryPartnerId)
      await redisRaw.expire(`order:${orderId}:rejected`, 86400) // 1 day expiry
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { deliveryPartnerId: null, deliveryStatus: null },
        })
        await tx.deliveryAssignment.delete({ where: { id: existingAssignment.id } })
      })
    } else {
      return existingAssignment
    }
  }

  // Step 1: try nearby online delivery partners (within 5km of the kitchen)
  const nearbyMemberIds = await findNearbyOnlineMemberIds(kitchenLat, kitchenLng)
  const rejectedDrivers = await redisRaw.smembers(`order:${orderId}:rejected`) || []

  for (const member of nearbyMemberIds) {
    if (rejectedDrivers.includes(member)) continue
    const assignment = await tryAssignDeliveryPerson(orderId, member, kitchenLat, kitchenLng)
    if (assignment) return assignment
  }

  // Step 2: fall back to ANY available online partner when no one is nearby
  const allOnline = await prisma.deliveryPartner.findMany({
    where: { isOnline: true },
    select: { id: true },
  })
  for (const person of allOnline) {
    if (rejectedDrivers.includes(person.id)) continue
    const assignment = await tryAssignDeliveryPerson(orderId, person.id, kitchenLat, kitchenLng)
    if (assignment) return assignment
  }

  throw new Error("No delivery persons available nearby")
}

export async function acceptDeliveryOffer(orderId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const person = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!person) throw new Error("Delivery partner not found")

  await prisma.deliveryAssignment.updateMany({
    where: { orderId, deliveryPartnerId: person.id },
    data: { acceptedAt: new Date() },
  })

  const ably = getAblyRest()
  await ably.channels.get(`order:${orderId}`).publish("delivery:status", {
    status: "ACCEPTED",
  })
}

export async function updateDeliveryStatus(orderId: string, status: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const validStatuses: Array<"PICKEDUP" | "INTRANSIT" | "DELIVERED" | "FAILED"> = ["PICKEDUP", "INTRANSIT", "DELIVERED", "FAILED"]
  if (!validStatuses.includes(status as typeof validStatuses[number])) throw new Error("Invalid status")

  await prisma.order.update({
    where: { id: orderId },
    data: { deliveryStatus: status as import("@/lib/generated/prisma/client").DeliveryStatus }
  })

  if (status === "PICKEDUP") {
    await prisma.deliveryAssignment.updateMany({
      where: { orderId },
      data: { pickedUpAt: new Date() },
    })
  }

  if (status === "DELIVERED") {
    await prisma.deliveryAssignment.updateMany({
      where: { orderId },
      data: { deliveredAt: new Date() },
    })
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      include: {
        orderItems: {
          include: { menuItem: true }
        }
      }
    })

    const hasReusableCarrier = updatedOrder.orderItems.some(item =>
      item.menuItem.packagingType === "REUSABLE_TIFFIN" || 
      item.menuItem.packagingType === "Reusable Tiffin" ||
      item.menuItem.packagingType === "Tiffin Carrier"
    )

    if (hasReusableCarrier) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0) // Schedule for 10 AM next day

      const kitchenId = updatedOrder.orderItems[0]?.kitchenPartnerId
      if (kitchenId && updatedOrder.addressId) {
        await prisma.tiffinPickup.create({
          data: {
            publicCode: `TFP-${updatedOrder.id.slice(-6)}`,
            orderId: updatedOrder.id,
            customerId: updatedOrder.userId,
            kitchenId: kitchenId,
            pickupAddressId: updatedOrder.addressId,
            scheduledDate: tomorrow,
            status: "SCHEDULED"
          }
        })
      }
    }
  }

  const ably = getAblyRest()
  await ably.channels.get(`order:${orderId}`).publish("delivery:status", { status })
}

export async function setDeliveryPersonOnline(isOnline: boolean) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const person = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!person) throw new Error("Delivery partner not found")

  await prisma.deliveryPartner.update({
    where: { id: person.id },
    data: { isOnline },
  })

  if (!isOnline) {
    await redis.zrem("deliveryPersons:live", person.id)
  }

  return { success: true, isOnline }
}

export async function getOnlineDeliveryPartners() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  return await prisma.deliveryPartner.findMany({
    where: { isOnline: true, status: { in: ["APPROVED", "ACTIVE"] } },
    include: { user: { select: { name: true, phoneNumber: true } } },
  })
}

export async function adminWithdrawDeliveryPartner(orderId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { deliveryStatus: true }
  })

  if (order?.deliveryStatus && ["PICKEDUP", "INTRANSIT", "DELIVERED", "COMPLETED"].includes(order.deliveryStatus)) {
    throw new Error("Order has already been picked up and cannot be withdrawn")
  }

  const existingAssignment = await prisma.deliveryAssignment.findFirst({
    where: { orderId },
  })

  if (existingAssignment) {
    await prisma.deliveryAssignment.delete({ where: { id: existingAssignment.id } })
    await prisma.order.update({
      where: { id: orderId },
      data: { deliveryPartnerId: null, deliveryStatus: null }
    })
    const ably = getAblyRest()
    await ably.channels.get(`deliveryPartner:${existingAssignment.deliveryPartnerId}`).publish("delivery:withdrawn", { orderId })
    await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "DELIVERY_WITHDRAWN" })
  }

  return { success: true }
}

export async function adminAssignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { deliveryStatus: true }
  })

  if (order?.deliveryStatus && ["PICKEDUP", "INTRANSIT", "DELIVERED", "COMPLETED"].includes(order.deliveryStatus)) {
    throw new Error("Order has already been picked up and cannot be reassigned")
  }

  const existingAssignment = await prisma.deliveryAssignment.findFirst({
    where: { orderId },
  })
  
  if (existingAssignment) {
    if (existingAssignment.deliveryPartnerId === deliveryPartnerId) {
      throw new Error("Delivery partner is already assigned to this order")
    }
    await prisma.deliveryAssignment.delete({ where: { id: existingAssignment.id } })
    const ably = getAblyRest()
    await ably.channels.get(`deliveryPartner:${existingAssignment.deliveryPartnerId}`).publish("delivery:withdrawn", { orderId })
  }

  const assignment = await tryAssignDeliveryPerson(orderId, deliveryPartnerId)
  if (!assignment) {
    throw new Error("Failed to assign delivery partner")
  }
  
  return { success: true }
}
