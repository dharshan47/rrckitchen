"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { razorpayClient } from "@/lib/auth"
import { confirmPayment } from "@/actions/payment"
import { sendPushToDeliveryPartners } from "@/lib/notification"

export async function getUserOrders() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      payment: { status: "SUCCESS" },
    },
    include: {
      orderItems: {
        include: {
          menuItem: { select: { name: true, foodType: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } } },
          kitchenPartner: {
            include: {
              deliveryPartnerAssignments: {
                where: { status: "DELIVERED" },
                include: {
                  deliveryPartner: {
                    select: {
                      id: true,
                      user: { select: { name: true } },
                    },
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
    },
    orderBy: { createdAt: "desc" },
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
      })),
      address: o.address
        ? `${o.address.lineOne}${o.address.lineTwo ? `, ${o.address.lineTwo}` : ""}, ${o.address.pincode}`
        : null,
      paymentStatus: o.payment?.status ?? null,
      deliveryReview: o.deliveryReview ?? null,
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
  const session = await getSession()
  if (!session?.user?.id) return []

  const orders = await prisma.order.findMany({
    where: {
      payment: { status: "SUCCESS" },
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

    if (status === "READYFORPICKUP") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        select: { kitchenPartnerId: true },
        distinct: ["kitchenPartnerId"],
      })

      for (const item of orderItems) {
        await sendPushToDeliveryPartners(
          item.kitchenPartnerId,
          "Order Ready for Pickup",
          "An order is ready for pickup from your assigned kitchen partner.",
          `/delivery-partner/dashboard`
        )
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
