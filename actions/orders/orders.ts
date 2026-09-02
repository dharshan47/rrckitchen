"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { razorpayClient } from "@/lib/razorpay"
import { confirmPayment } from "@/actions/payments/payment"
import { sendPushToDeliveryPartners } from "@/lib/notification"
import { getAblyRest } from "@/lib/ably/server"
import { requireAdmin } from "@/lib/auth-guards"
import { redis } from "@/lib/redis"

export async function getUserOrders() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      payment: { status: "SUCCESS" },
    },
    select: {
      id: true,
      publicCode: true,
      status: true,
      serviceDate: true,
      timeSlot: true,
      totalAmount: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          kitchenPartnerId: true,
          menuItem: {
            select: {
              name: true,
              foodType: true,
              photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
            },
          },
          kitchenPartner: {
            select: {
              id: true,
              kitchenAlias: { select: { displayName: true } },
              deliveryPartnerAssignments: {
                select: {
                  deliveryPartner: {
                    select: { id: true, user: { select: { name: true } } },
                  },
                },
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
      address: { select: { lineOne: true, lineTwo: true, pincode: true, label: true, isDefault: true } },
      payment: { select: { status: true, provider: true } },
      deliveryReview: { select: { id: true, rating: true, speedRating: true, behaviorHygiene: true, safetyContactless: true, comment: true } },
      review: { select: { id: true, rating: true, tasteRating: true, packagingRating: true, portionSizeRating: true, comment: true } },
      statusHistory: { select: { status: true, changedAt: true, note: true } },
      user: { select: { phoneNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return orders.map((o) => {
    const kitchenPartner = o.orderItems[0]?.kitchenPartner
    const deliveryAssignment = kitchenPartner?.deliveryPartnerAssignments[0]
    return {
      id: o.id,
      publicCode: o.publicCode,
      status: o.status,
      serviceDate: o.serviceDate.toISOString(),
      timeSlot: o.timeSlot,
      totalAmount: o.totalAmount.toString(),
      createdAt: o.createdAt.toISOString(),
      items: o.orderItems.map((i) => ({
        name: i.menuItem.name,
        foodType: i.menuItem.foodType,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toString(),
        imageUrl: i.menuItem.photos[0]?.imageUrl,
        kitchenId: i.kitchenPartnerId,
        kitchenName: i.kitchenPartner?.kitchenAlias?.displayName,
      })),
      address: o.address
        ? `${o.address.lineOne}${o.address.lineTwo ? `, ${o.address.lineTwo}` : ""}, ${o.address.pincode}`
        : null,
      addressLabel: o.address?.label,
      addressIsDefault: o.address?.isDefault ?? false,
      phoneNumber: o.user?.phoneNumber,
      paymentProvider: o.payment?.provider,
      paymentStatus: o.payment?.status,
      deliveryReview: o.deliveryReview,
      kitchenReview: o.review,
      kitchenName: kitchenPartner?.kitchenAlias?.displayName,
      kitchenPartnerId: kitchenPartner?.id,
      deliveryPartner: deliveryAssignment
        ? {
            id: deliveryAssignment.deliveryPartner.id,
            name: deliveryAssignment.deliveryPartner.user?.name,
          }
        : null,
      statusHistory: o.statusHistory.map(h => ({
        status: h.status,
        changedAt: h.changedAt.toISOString(),
        note: h.note,
      })),
    }
  })
}

export type UserOrder = Awaited<ReturnType<typeof getUserOrders>>[number]

export async function getAdminOrders() {
  try { await requireAdmin() } catch { return [] }

  const orders = await prisma.order.findMany({
    where: {
      payment: { status: "SUCCESS" },
    },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
      orderItems: {
        include: {
          kitchenPartner: { 
            include: { 
              kitchenAlias: true,
              kitchenAddress: {
                select: { lineOne: true, area: true, landmark: true, pincode: true }
              }
            } 
          },
          menuItem: { select: { name: true, price: true, photos: { take: 1 } } },
        },
      },
      payment: { select: { status: true, provider: true, paymentMethod: true, providerOrderId: true } },
      deliveryPartner: { include: { user: { select: { name: true, phoneNumber: true } } } },
      address: { select: { lineOne: true, lineTwo: true, pincode: true, label: true } },
      statusHistory: { orderBy: { changedAt: "asc" }, select: { id: true, status: true, changedAt: true, note: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return orders.map((o) => {
    const firstKitchen = o.orderItems[0]?.kitchenPartner
    const address = firstKitchen?.kitchenAddress
    
    return {
      id: o.id,
      publicCode: o.publicCode,
      customer: {
        name: o.user?.name,
        phone: o.user?.phoneNumber,
        email: o.user?.email
      },
      kitchen: {
        name: firstKitchen?.kitchenAlias?.displayName,
        address: address 
          ? `${address.lineOne}${address.area ? `, ${address.area}` : ""}, ${address.pincode}` 
          : undefined,
      },
      items: o.orderItems.map((i) => ({
        id: i.id,
        name: i.menuItem.name,
        price: Number(i.unitPrice), // using the price at time of order
        quantity: i.quantity,
        imageUrl: i.menuItem.photos?.[0]?.imageUrl
      })),
      date: o.createdAt.toISOString(),
      amount: Number(o.totalAmount),
      discountAmount: Number(o.discountAmount),
      serviceDate: o.serviceDate.toISOString(),
      timeSlot: o.timeSlot,
      status: o.status,
      deliveryStatus: o.deliveryStatus,
      payment: o.payment?.status,
      paymentProvider: o.payment?.provider,
      paymentMethod: o.payment?.paymentMethod,
      providerOrderId: o.payment?.providerOrderId,
      deliveryAddress: o.address
        ? {
            lineOne: o.address.lineOne,
            lineTwo: o.address.lineTwo,
            pincode: o.address.pincode,
            label: o.address.label,
          }
        : null,
      statusHistory: o.statusHistory.map((h) => ({
        id: h.id,
        status: h.status,
        changedAt: h.changedAt.toISOString(),
        note: h.note,
      })),
      deliveryPartner: o.deliveryPartner
        ? {
            id: o.deliveryPartner.id,
            name: o.deliveryPartner.user?.name,
            phone: o.deliveryPartner.user?.phoneNumber,
          }
        : null,
    }
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const validStatuses = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "COMPLETED", "CANCELLED", "REFUNDED"]
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, error: "Order not found" }

    const statusOrder = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "COMPLETED"]
    const currentIdx = statusOrder.indexOf(order.status)
    const newIdx = statusOrder.indexOf(status as import("@/lib/generated/prisma/client").OrderStatus)

    if (newIdx < currentIdx && status !== "CANCELLED" && status !== "REFUNDED") {
      return { success: false, error: "Cannot move order backwards" }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as import("@/lib/generated/prisma/client").OrderStatus },
    })

    await prisma.orderStatusHistory.create({
      data: { orderId, status: status as import("@/lib/generated/prisma/client").OrderStatus },
    })

    const ably = getAblyRest()
    await ably.channels.get(`order:${orderId}`).publish("order:status", { status })

    if (status === "READYFORPICKUP") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        select: { kitchenPartnerId: true },
        distinct: ["kitchenPartnerId"],
      })

      for (const item of orderItems) {
        await ably.channels.get(`kitchen:${item.kitchenPartnerId}`).publish("order:ready", { orderId })
        await sendPushToDeliveryPartners(
          item.kitchenPartnerId,
          "Order Ready for Pickup",
          "An order is ready for pickup from your assigned kitchen partner.",
          `/delivery-partner/dashboard`
        )
      }

      // Auto-assign nearest delivery partner
      try {
        const firstKitchenId = orderItems[0]?.kitchenPartnerId
        if (firstKitchenId) {
          const kitchenPartner = await prisma.kitchenPartner.findUnique({
            where: { id: firstKitchenId },
            include: {
              kitchenAddress: { select: { latitude: true, longitude: true } },
            },
          })
          const kitchenLat = kitchenPartner?.kitchenAddress?.latitude
          const kitchenLng = kitchenPartner?.kitchenAddress?.longitude

          let assigned = false

          // Step 1: Try nearby delivery partners (within 5km of kitchen)
          if (kitchenLat != null && kitchenLng != null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geoMembers = await (redis as any).geosearch(
              "deliveryPersons:live",
              { type: "FROMLONLAT", coordinate: { lon: kitchenLng, lat: kitchenLat } },
              { type: "BYRADIUS", radius: 5, radiusType: "KM" },
              "ASC",
              { count: { limit: 20 } },
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nearbyMembers = Array.isArray(geoMembers) ? geoMembers.map((r: any) => String(r.member ?? r)) : []

            for (const member of nearbyMembers) {
              const deliveryPersonId = typeof member === "string" ? member : String(member)
              const person = await prisma.deliveryPartner.findUnique({
                where: { id: deliveryPersonId },
                select: { id: true, isOnline: true },
              })
              if (!person?.isOnline) continue

              const existing = await prisma.deliveryAssignment.findFirst({
                where: { deliveryPartnerId: deliveryPersonId, status: "PENDING" },
              })
              if (existing) continue

              await prisma.deliveryAssignment.create({
                data: { orderId, deliveryPartnerId: deliveryPersonId, assignedByAdminId: "system", status: "PENDING" },
              })
              await prisma.order.update({
                where: { id: orderId },
                data: { deliveryPartnerId: deliveryPersonId, deliveryStatus: "ASSIGNED" },
              })

              const ablyAssign = getAblyRest()
              await Promise.all([
                ablyAssign.channels.get(`deliveryPartner:${deliveryPersonId}`).publish("delivery:offer", { orderId, kitchenLat, kitchenLng }),
                ablyAssign.channels.get(`order:${orderId}`).publish("order:status", { status: "DELIVERY_ASSIGNED" }),
              ])
              assigned = true
              break
            }
          }

          // Step 2: If no nearby partner found, try ANY available online partner
          if (!assigned) {
            const allOnline = await prisma.deliveryPartner.findMany({
              where: { isOnline: true, status: { in: ["APPROVED", "ACTIVE"] } },
              select: { id: true },
            })

            for (const person of allOnline) {
              const existing = await prisma.deliveryAssignment.findFirst({
                where: { deliveryPartnerId: person.id, status: "PENDING" },
              })
              if (existing) continue

              await prisma.deliveryAssignment.create({
                data: { orderId, deliveryPartnerId: person.id, assignedByAdminId: "system", status: "PENDING" },
              })
              await prisma.order.update({
                where: { id: orderId },
                data: { deliveryPartnerId: person.id, deliveryStatus: "ASSIGNED" },
              })

              const ablyAssign = getAblyRest()
              await Promise.all([
                ablyAssign.channels.get(`deliveryPartner:${person.id}`).publish("delivery:offer", { orderId }),
                ablyAssign.channels.get(`order:${orderId}`).publish("order:status", { status: "DELIVERY_ASSIGNED" }),
              ])
              assigned = true
              break
            }
          }

          if (!assigned) {
            console.error("No available delivery partners found for order", orderId)
          }
        }
      } catch (assignError) {
        console.error("Auto-assignment failed:", assignError)
      }
    }

    if (status === "PREPARING") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        select: { kitchenPartnerId: true },
        distinct: ["kitchenPartnerId"],
      })
      for (const item of orderItems) {
        await ably.channels.get(`kitchen:${item.kitchenPartnerId}`).publish("queue:status", { orderId, status: "PREPARING" })
      }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function cancelOrder(orderId: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    })

    if (!order) return { success: false, error: "Order not found" }
    if (order.userId !== session.user.id) return { success: false, error: "Unauthorized" }

    const cancellableStatuses = ["CONFIRMED", "PREPARING"]
    if (!cancellableStatuses.includes(order.status)) {
      return { success: false, error: "Order cannot be cancelled at this stage" }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    })

    await prisma.orderStatusHistory.create({
      data: { orderId, status: "CANCELLED", note: "Cancelled by customer" },
    })

    return { success: true }
  } catch {
    return { success: false, error: "Failed to cancel order" }
  }
}

export async function getOrderForTracking(orderId: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { publicCode: orderId }],
      userId: session.user.id
    },
    include: {
      orderItems: {
        include: {
          menuItem: { select: { name: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } } },
          kitchenPartner: {
            include: {
              kitchenAddress: { select: { latitude: true, longitude: true } },
              kitchenAlias: { select: { displayName: true } },
            },
          },
        },
      },
      address: { select: { latitude: true, longitude: true, lineOne: true, lineTwo: true, pincode: true, label: true } },
      user: { select: { phoneNumber: true } },
      payment: { select: { provider: true, status: true } },
      deliveryLocations: { orderBy: { updatedAt: "desc" }, take: 1 },
      deliveryPartner: { select: { id: true, user: { select: { name: true, image: true, phoneNumber: true } } } },
      deliveryAssignment: { select: { status: true } },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  })

  if (!order) throw new Error("Order not found")

  let livePos: { lat: number; lng: number } | null = null
  const lastLocRaw = await redis.get<string>(`deliveryOrder:${orderId}:lastLoc`)
  if (lastLocRaw) {
    try {
      const parsed = JSON.parse(lastLocRaw)
      if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
        livePos = { lat: parsed.lat, lng: parsed.lng }
      }
    } catch {
      livePos = null
    }
  }

  const firstItem = order.orderItems[0]
  const kitchen = firstItem?.kitchenPartner

  return {
    id: order.id,
    publicCode: order.publicCode,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    totalAmount: order.totalAmount.toString(),
    discountAmount: order.discountAmount.toString(),
    createdAt: order.createdAt.toISOString(),
    serviceDate: order.serviceDate.toISOString(),
    timeSlot: order.timeSlot,
    statusHistory: order.statusHistory.map((h) => ({
      status: h.status,
      changedAt: h.changedAt.toISOString(),
      note: h.note,
    })),
    items: order.orderItems.map((i) => ({
      name: i.menuItem.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      imageUrl: i.menuItem.photos[0]?.imageUrl,
      kitchenName: i.kitchenPartner?.kitchenAlias?.displayName,
    })),
    kitchenLat: kitchen?.kitchenAddress?.latitude,
    kitchenLng: kitchen?.kitchenAddress?.longitude,
    kitchenName: kitchen?.kitchenAlias?.displayName,
    customerLat: order.address?.latitude,
    customerLng: order.address?.longitude,
    customerAddress: order.address
      ? `${order.address.lineOne}${order.address.lineTwo ? `, ${order.address.lineTwo}` : ""}, ${order.address.pincode}`
      : null,
    customerAddressLabel: order.address?.label,
    customerPhone: order.user?.phoneNumber ?? null,
    deliveryPersonName: order.deliveryPartner?.user?.name,
    deliveryPersonLat: livePos?.lat ?? order.deliveryLocations[0]?.latitude,
    deliveryPersonLng: livePos?.lng ?? order.deliveryLocations[0]?.longitude,
    deliveryAssignmentStatus: order.deliveryAssignment?.status,
    paymentProvider: order.payment?.provider,
    paymentStatus: order.payment?.status,
    deliveryPartner: order.deliveryPartner
      ? {
          id: order.deliveryPartner.id,
          name: order.deliveryPartner.user?.name,
          image: order.deliveryPartner.user?.image,
          phone: order.deliveryPartner.user?.phoneNumber,
        }
      : null,
  }
}

export type OrderTrackingInfo = Awaited<ReturnType<typeof getOrderForTracking>>

export async function verifyPaymentWithRazorpay(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } })

  if (!payment || payment.status !== "PENDING" || !payment.providerOrderId) {
    return { success: false, error: "No pending payment to verify" }
  }

  try {
    const razorpayPayments = await razorpayClient.orders.fetchPayments(payment.providerOrderId)
    const items = razorpayPayments.items ?? []
    const captured = items.find((p: { status: string }) => p.status === "captured")

    if (captured) {
      await confirmPayment(payment.providerOrderId, captured.id, captured.method)
      return { success: true, message: "Payment confirmed, order moved to Preparing" }
    }

    return { success: false, error: "No captured payment found with Razorpay" }
  } catch {
    return { success: false, error: "Failed to verify payment with Razorpay" }
  }
}
