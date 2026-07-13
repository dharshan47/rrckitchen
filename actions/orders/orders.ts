"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { razorpayClient } from "@/lib/razorpay"
import { confirmPayment } from "@/actions/payments/payment"
import crypto from "crypto"
import { sendPushToDeliveryPartners } from "@/lib/notification"
import { getAblyRest } from "@/lib/ably/server"
import { requireAdmin } from "@/lib/auth-guards"


export async function getUserOrders() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      payment: { OR: [{ status: "SUCCESS" }, { provider: "CASH_ON_DELIVERY" }] },
    },
    select: {
      id: true,
      status: true,
      serviceDate: true,
      timeSlot: true,
      totalAmount: true,
      deliveryOtp: true,
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
                where: { status: "DELIVERED" },
                select: {
                  deliveryPartner: {
                    select: { id: true, user: { select: { name: true } } },
                  },
                },
                take: 1,
              },
            },
          },
        },
      },
      address: { select: { lineOne: true, lineTwo: true, pincode: true } },
      payment: { select: { status: true, provider: true } },
      deliveryReview: { select: { id: true, rating: true, comment: true } },
      review: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return orders.map((o) => {
    const kitchenPartner = o.orderItems[0]?.kitchenPartner
    const deliveryAssignment = kitchenPartner?.deliveryPartnerAssignments[0]
    return {
      id: o.id,
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
        imageUrl: i.menuItem.photos[0]?.imageUrl ?? null,
        kitchenId: i.kitchenPartnerId,
      })),
      address: o.address
        ? `${o.address.lineOne}${o.address.lineTwo ? `, ${o.address.lineTwo}` : ""}, ${o.address.pincode}`
        : null,
      paymentProvider: o.payment?.provider ?? null,
      paymentStatus: o.payment?.status ?? null,
      deliveryOtp: o.deliveryOtp ?? null,
      deliveryReview: o.deliveryReview ?? null,
      kitchenReview: o.review ?? null,
      kitchenPartnerId: kitchenPartner?.id ?? null,
      deliveryPartner: deliveryAssignment
        ? {
            id: deliveryAssignment.deliveryPartner.id,
            name: deliveryAssignment.deliveryPartner.user?.name ?? "Delivery Partner",
          }
        : null,
    }
  })
}

export type UserOrder = Awaited<ReturnType<typeof getUserOrders>>[number]

export async function getAdminOrders() {
  try { await requireAdmin() } catch { return [] }

  const orders = await prisma.order.findMany({
    where: {
      payment: { OR: [{ status: "SUCCESS" }, { provider: "CASH_ON_DELIVERY" }] },
    },
    include: {
      user: { select: { name: true } },
      orderItems: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true } },
          menuItem: { select: { name: true } },
        },
      },
      payment: { select: { status: true, provider: true, paymentMethod: true, providerOrderId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return orders.map((o) => ({
    id: o.id,
    customer: o.user?.name ?? "Unknown",
    kitchen: o.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName ?? "Unknown",
    items: o.orderItems.map((i) => i.menuItem.name),
    date: o.createdAt.toISOString(),
    amount: Number(o.totalAmount),
    status: o.status,
    payment: o.payment?.status ?? "PENDING",
    paymentProvider: o.payment?.provider ?? null,
    paymentMethod: o.payment?.paymentMethod ?? null,
    providerOrderId: o.payment?.providerOrderId ?? null,
  }))
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
      // Generate delivery OTP for all orders (proof-of-delivery for prepaid too)
      const otp = crypto.randomInt(1000, 9999).toString()
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryOtp: otp },
      })

      // Send OTP to customer via Ably
      await ably.channels.get(`order:${orderId}`).publish("order:confirmation-code", { code: otp })

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

    if (status === "CANCELLED" || status === "REFUNDED") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        include: { menuItem: true },
      })

      await prisma.$transaction(
        orderItems.map((item) =>
          prisma.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              reservedCount: { decrement: item.quantity },
            },
          })
        )
      )
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

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
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
      address: { select: { latitude: true, longitude: true, lineOne: true, lineTwo: true, pincode: true } },
      payment: { select: { provider: true, status: true } },
      deliveryLocations: { orderBy: { updatedAt: "desc" }, take: 1 },
      deliveryPartner: { select: { user: { select: { name: true } } } },
      deliveryAssignment: { select: { status: true } },
    },
  })

  if (!order) throw new Error("Order not found")

  const firstItem = order.orderItems[0]
  const kitchen = firstItem?.kitchenPartner

  return {
    id: order.id,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    totalAmount: order.totalAmount.toString(),
    createdAt: order.createdAt.toISOString(),
    deliveryOtp: order.deliveryOtp,
    deliveryOtpVerifiedAt: order.deliveryOtpVerifiedAt?.toISOString() ?? null,
    items: order.orderItems.map((i) => ({
      name: i.menuItem.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      imageUrl: i.menuItem.photos[0]?.imageUrl ?? null,
      kitchenName: i.kitchenPartner?.kitchenAlias?.displayName ?? "Kitchen",
    })),
    kitchenLat: kitchen?.kitchenAddress?.latitude ?? null,
    kitchenLng: kitchen?.kitchenAddress?.longitude ?? null,
    kitchenName: kitchen?.kitchenAlias?.displayName ?? "Kitchen",
    customerLat: order.address?.latitude ?? null,
    customerLng: order.address?.longitude ?? null,
    customerAddress: order.address
      ? `${order.address.lineOne}${order.address.lineTwo ? `, ${order.address.lineTwo}` : ""}, ${order.address.pincode}`
      : null,
    deliveryPersonName: order.deliveryPartner?.user?.name ?? null,
    deliveryPersonLat: order.deliveryLocations[0]?.latitude ?? null,
    deliveryPersonLng: order.deliveryLocations[0]?.longitude ?? null,
    deliveryAssignmentStatus: order.deliveryAssignment?.status ?? null,
    paymentProvider: order.payment?.provider ?? null,
    paymentStatus: order.payment?.status ?? null,
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
