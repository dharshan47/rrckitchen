"use server"

import prisma from "@/lib/prisma"
import { razorpayClient } from "@/lib/razorpay"
import { getAblyRest } from "@/lib/ably/server"
import { redis } from "@/lib/redis"

export async function refundOrderItem(
  orderItemId: string,
  reason: "ITEM_OUT_OF_STOCK" | "QUALITY_ISSUE" | "KITCHEN_REJECTED" = "ITEM_OUT_OF_STOCK",
) {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { include: { payment: true } } },
  })

  if (!orderItem) throw new Error("Order item not found")
  if (orderItem.status !== "CONFIRMED") throw new Error("Order item is not in a refundable state")

  const payment = orderItem.order.payment
  if (!payment?.providerPaymentId) throw new Error("No payment found for this order")

  const refundAmount = Number(orderItem.unitPrice) * orderItem.quantity + Number(orderItem.packagingFee)

  if (refundAmount <= 0) throw new Error("Refund amount must be positive")

  let razorpayRefundId: string | null = null
  try {
    const rzpRefund = await razorpayClient.payments.refund(payment.providerPaymentId, {
      amount: Math.round(refundAmount * 100),
      speed: "normal",
      notes: { reason, orderItemId, orderId: orderItem.orderId },
    })
    razorpayRefundId = rzpRefund.id
  } catch (err) {
    console.error("Razorpay refund failed:", err)
    throw new Error("Failed to process refund with payment gateway")
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.update({
      where: { id: orderItemId },
      data: { status: "UNAVAILABLE" },
    })

    await tx.refund.create({
      data: {
        orderId: orderItem.orderId,
        orderItemId,
        paymentId: payment.id,
        razorpayRefundId,
        amount: refundAmount,
        reason,
        status: "INITIATED",
      },
    })

    const allItems = await tx.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    })

    const remainingConfirmed = allItems.filter((i) => i.status === "CONFIRMED")
    const allRefunded = allItems.every((i) => i.status === "UNAVAILABLE" || i.status === "REFUNDED")

    const newTotal = remainingConfirmed.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity + Number(i.packagingFee),
      0,
    )

    const previousDiscount = Number((await tx.order.findUnique({
      where: { id: orderItem.orderId },
      select: { discountAmount: true },
    }))?.discountAmount ?? 0)

    await tx.order.update({
      where: { id: orderItem.orderId },
      data: {
        totalAmount: newTotal,
        discountAmount: newTotal > 0 ? previousDiscount : 0,
        status: allRefunded ? "REFUNDED" : undefined,
      },
    })

    if (allRefunded) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      })
    } else {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "PARTIAL_REFUND" },
      })
    }
  })

  const ably = getAblyRest()
  await ably.channels.get(`order:${orderItem.orderId}`).publish("order:item-unavailable", {
    orderItemId,
    itemName: (await prisma.menuItem.findUnique({ where: { id: orderItem.menuItemId }, select: { name: true } }))?.name,
    refundAmount,
    reason,
  })

  await redis.xadd("order-events", "*", {
    type: "ITEM_UNAVAILABLE",
    orderId: orderItem.orderId,
    orderItemId,
    reason,
    timestamp: Date.now().toString(),
  })
}

export async function retryRefund(refundRowId: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundRowId },
    include: { payment: true },
  })

  if (!refund) throw new Error("Refund record not found")
  if (refund.status !== "FAILED") throw new Error("Refund is not in FAILED state")

  if (!refund.payment.providerPaymentId) throw new Error("Payment has no provider payment ID")

  try {
    const rzpRefund = await razorpayClient.payments.refund(refund.payment.providerPaymentId, {
      amount: Math.round(Number(refund.amount) * 100),
      speed: "normal",
      notes: { reason: refund.reason, refundRowId },
    })

    await prisma.refund.update({
      where: { id: refundRowId },
      data: {
        razorpayRefundId: rzpRefund.id,
        status: "INITIATED",
      },
    })

    return { success: true, razorpayRefundId: rzpRefund.id }
  } catch (err) {
    console.error("Retry refund failed:", err)
    return { success: false }
  }
}

export async function processWebhookRefund(razorpayRefundId: string) {
  const refund = await prisma.refund.findFirst({
    where: { razorpayRefundId },
  })

  if (!refund) {
    console.warn(`[Refund] No local refund record found for Razorpay refund: ${razorpayRefundId}`)
    return
  }

  await prisma.refund.update({
    where: { id: refund.id },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
    },
  })

  const ably = getAblyRest()
  await ably.channels.get(`order:${refund.orderId}`).publish("refund:processed", {
    refundId: refund.id,
    amount: refund.amount,
  })
}

export async function getRefundStatus(orderId: string) {
  const refunds = await prisma.refund.findMany({
    where: { orderId },
    orderBy: { initiatedAt: "desc" },
  })

  return refunds.map((r) => ({
    id: r.id,
    amount: r.amount,
    reason: r.reason,
    status: r.status,
    initiatedAt: r.initiatedAt,
    processedAt: r.processedAt,
  }))
}
