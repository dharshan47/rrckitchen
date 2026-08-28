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

  const existing = await prisma.deliveryAssignment.findFirst({
    where: {
      deliveryPartnerId: deliveryPersonId,
      status: "PENDING",
    },
  })
  if (existing) return null

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
  if (existingAssignment) return existingAssignment

  // Step 1: try nearby online delivery partners (within 5km of the kitchen)
  const nearbyMemberIds = await findNearbyOnlineMemberIds(kitchenLat, kitchenLng)
  for (const member of nearbyMemberIds) {
    const assignment = await tryAssignDeliveryPerson(orderId, member, kitchenLat, kitchenLng)
    if (assignment) return assignment
  }

  // Step 2: fall back to ANY available online partner when no one is nearby
  const allOnline = await prisma.deliveryPartner.findMany({
    where: { isOnline: true, status: { in: ["APPROVED", "ACTIVE"] } },
    select: { id: true },
  })
  for (const person of allOnline) {
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
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    })
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
