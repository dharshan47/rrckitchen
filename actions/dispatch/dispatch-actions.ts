"use server"

import { redis } from "@/lib/redis"
import { getAblyRest } from "@/lib/ably/server"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

export async function assignNearestDeliveryPerson(
  orderId: string,
  kitchenLat: number,
  kitchenLng: number
) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redisRaw = redis as any
  const geoMembers = await redisRaw.geosearch(
    "deliveryPersons:live",
    { longitude: kitchenLng, latitude: kitchenLat },
    { radius: 5, unit: "km", SORT: "ASC", COUNT: 20 },
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members = Array.isArray(geoMembers) ? geoMembers.map((r: any) => String(r.member ?? r)) : []

  for (const member of members) {
    const deliveryPersonId = typeof member === "string" ? member : String(member)
    const person = await prisma.deliveryPartner.findUnique({
      where: { id: deliveryPersonId },
      select: { id: true, isOnline: true },
    })
    if (!person?.isOnline) continue

    const existing = await prisma.deliveryAssignment.findFirst({
      where: {
        deliveryPartnerId: deliveryPersonId,
        status: "PENDING",
      },
    })
    if (existing) continue

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
      data: { deliveryPartnerId: deliveryPersonId },
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
  } else {
    await redis.geoadd("deliveryPersons:live", { longitude: 0, latitude: 0, member: person.id })
  }

  return { success: true, isOnline }
}
