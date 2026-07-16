/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { razorpayClient } from "@/lib/razorpay";
import { getAblyRest } from "@/lib/ably/server";
import { redis } from "@/lib/redis";
import { awardPoints } from "@/actions/loyalty/loyalty";

export interface CreateOrderInput {
  userId: string;
  items: { id: string; qty: number; price: number }[];
  idempotencyKey?: string;
  couponCode?: string;
  paymentProvider?: "RAZORPAY" | "CASH_ON_DELIVERY";
}

export async function createPaymentOrder({ userId, items, idempotencyKey, couponCode, paymentProvider = "RAZORPAY" }: CreateOrderInput) {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { payment: true },
    });
    if (existing?.payment) {
      return {
        orderId: existing.payment.providerOrderId,
        amount: Math.round(Number(existing.totalAmount) * 100),
        currency: "INR",
        localOrderId: existing.id,
        idempotent: true,
      };
    }
  }

  const menuItemIds = items.map((i) => i.id);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, deletedAt: null },
    include: { menu: true },
  });

  if (menuItems.length !== items.length) {
    throw new Error("Some menu items not found");
  }

  const serviceDate = new Date();
  serviceDate.setDate(serviceDate.getDate() + 1);
  serviceDate.setHours(0, 0, 0, 0);

  const dailyStocks = await prisma.menuItemDailyStock.findMany({
    where: {
      menuItemId: { in: menuItemIds },
      serviceDate,
    },
  });
  const stockMap = new Map(dailyStocks.map((s) => [s.menuItemId, s]));

  for (const item of items) {
    const menuItem = menuItems.find((m) => m.id === item.id)!;
    const stock = stockMap.get(item.id);
    if (stock) {
      const available = stock.totalQuantity - stock.reservedQuantity - stock.soldQuantity;
      if (item.qty > available) {
        throw new Error(`Insufficient stock for ${menuItem.name}. Only ${Math.max(0, available)} left.`);
      }
    }
  }

  const firstItem = items[0];
  const firstMenuItem = menuItems.find((m) => m.id === firstItem.id)!;
  const timeSlot = firstMenuItem.timeSlot;

  const slot = await prisma.deliverySlot.findFirst({
    where: { isActive: true },
  });

  const cutoffTime = (slot as any)?.cutoffTime;
  if (cutoffTime) {
    const now = new Date();
    const [cutoffH, cutoffM] = cutoffTime.split(":").map(Number);
    const cutoff = new Date(now);
    cutoff.setHours(cutoffH, cutoffM, 0, 0);
    if (now > cutoff) {
      throw new Error(`Orders for this time slot closed at ${cutoffTime}. Please select a later slot.`);
    }
  }

  let totalAmount = items.reduce((sum, i) => {
    const menuItem = menuItems.find((m) => m.id === i.id)!;
    return sum + Number(menuItem.price) * i.qty;
  }, 0);

  let appliedDiscount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && coupon.validFrom <= new Date() && coupon.validTo >= new Date()) {
      if (totalAmount >= Number(coupon.minOrderValue ?? 0)) {
        if (coupon.discountType === "PERCENTAGE") {
          appliedDiscount = Math.min(
            totalAmount * Number(coupon.discountValue) / 100,
            Number(coupon.maxDiscount ?? Infinity)
          );
        } else {
          appliedDiscount = Number(coupon.discountValue);
        }
        totalAmount -= appliedDiscount;
      }
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const stock = stockMap.get(item.id);
      if (stock) {
        const updated = await tx.menuItemDailyStock.update({
          where: { id: stock.id },
          data: { reservedQuantity: { increment: item.qty } },
        });
        if (updated.reservedQuantity > updated.totalQuantity) {
          throw new Error(`Insufficient stock for menu item`);
        }
      }
    }

    const created = await tx.order.create({
      data: {
        userId,
        serviceDate,
        timeSlot,
        totalAmount,
        discountAmount: appliedDiscount,
        commissionAmount: Math.round(totalAmount * 0.15 * 100) / 100,
        source: "APP" as const,
        idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
        orderItems: {
          create: items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.id)!;
            const kitchenPartnerId = menuItem.menu.kitchenPartnerId;
            return {
              menuItemId: item.id,
              kitchenPartnerId,
              quantity: item.qty,
              unitPrice: Number(menuItem.price),
            };
          }),
        },
        statusHistory: {
          create: {
            status: "CONFIRMED" as const,
            changedAt: new Date(),
          },
        },
      },
      include: { orderItems: true },
    });
    return created;
  });

  if (paymentProvider === "CASH_ON_DELIVERY") {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "CASH_ON_DELIVERY",
        amount: totalAmount,
        status: "PENDING",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { codAmountExpected: totalAmount },
    });

    await redis.del(`menu:cache`);

    return {
      orderId: order.id,
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      localOrderId: order.id,
      idempotent: false,
    };
  }

  const razorpayOrder = await razorpayClient.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: order.id,
    notes: { userId, orderId: order.id },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "RAZORPAY",
      providerOrderId: razorpayOrder.id,
      amount: totalAmount,
      status: "PENDING",
    },
  });

  await redis.del(`menu:cache`);

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    localOrderId: order.id,
    idempotent: false,
  };
}

export async function refundOrder(orderId: string, reason: RefundReasonType = "OTHER") {
  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });
  if (!payment) throw new Error("Payment not found");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  let razorpayRefundId: string | null = null;
  let refundStatus: "INITIATED" | "FAILED" = "FAILED";
  if (payment.providerPaymentId) {
    try {
      const refund = await razorpayClient.payments.refund(payment.providerPaymentId, {
        amount: Math.round(Number(order.totalAmount) * 100),
        notes: { reason },
      });
      razorpayRefundId = refund.id;
      refundStatus = "INITIATED";
    } catch (err) {
      console.error("Razorpay refund failed:", err);
    }
  }

  await prisma.refund.create({
    data: {
      orderId,
      paymentId: payment.id,
      amount: order.totalAmount,
      reason,
      razorpayRefundId,
      status: refundStatus,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "REFUNDED" },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED" },
  });

  const ably = getAblyRest();
  await ably.channels.get(`order:${orderId}`).publish("order:refund", { reason, amount: order.totalAmount });

  return { success: true, razorpayRefundId };
}

type RefundReasonType = "ITEM_OUT_OF_STOCK" | "KITCHEN_REJECTED" | "CUSTOMER_CANCELLED" | "QUALITY_ISSUE" | "LATE_DELIVERY" | "OTHER";

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = cryptoCreateHmac(body);
  return expectedSignature === razorpaySignature;
}

export async function confirmPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  paymentMethod?: string,
) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (!paymentMethod) {
    try {
      const rpPayment = await razorpayClient.payments.fetch(razorpayPaymentId);
      paymentMethod = rpPayment.method;
    } catch {
      // fallback - method stays undefined
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: {
      orderItems: {
        include: { menuItem: { include: { menu: true } } },
      },
    },
  });
  if (!order) throw new Error("Order not found");

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESS",
      providerPaymentId: razorpayPaymentId,
      paymentMethod: paymentMethod ?? null,
      paidAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "PREPARING" },
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: payment.orderId, status: "PREPARING", note: "Payment confirmed" },
  });

  const { createKitchenPayout } = await import("@/actions/payouts/kitchen-payout");
  await createKitchenPayout(payment.orderId);

  // Award loyalty points
  await awardPoints(payment.orderId).catch(() => {});

  // Track successful prepaid orders for COD eligibility
  await prisma.userCodEligibility.upsert({
    where: { userId: order.userId },
    update: { successfulPrepaidOrders: { increment: 1 } },
    create: { userId: order.userId, successfulPrepaidOrders: 1 },
  });

  const ably = getAblyRest();
  await ably.channels.get(`order:${payment.orderId}`).publish("order:status", { status: "PREPARING" });

  const kitchenPartnerIds = [...new Set(order.orderItems.map((i) => i.menuItem.menu.kitchenPartnerId))]
  for (const kitchenPartnerId of kitchenPartnerIds) {
    await ably.channels.get(`kitchen:${kitchenPartnerId}`).publish("queue:new-order", {
      orderId: payment.orderId,
      items: order.orderItems.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
    });
  }

  // Publish cravings popup with suggested items
  const suggestedItems = await getSuggestedItems(order.orderItems.map((i) => i.menuItemId));
  if (suggestedItems.length > 0) {
    await ably.channels.get(`order:${payment.orderId}`).publish("order:cravings", {
      items: suggestedItems,
      message: "Craving more? Check out these popular items!",
    });
  }

  await redis.xadd("order-events", "*", {
    type: "ORDER_CONFIRMED",
    orderId: payment.orderId,
    kitchenPartnerIds: JSON.stringify(kitchenPartnerIds),
    timestamp: Date.now().toString(),
  });

  return { orderId: payment.orderId };
}

export async function failPayment(razorpayOrderId: string) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (payment.status !== "PENDING") {
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CANCELLED" },
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: payment.orderId, status: "CANCELLED", note: "Payment cancelled by customer" },
  });
}

async function getSuggestedItems(menuItemIds: string[], limit = 6) {
  // Popular items from the same kitchen
  const orderItems = await prisma.orderItem.findMany({
    where: { menuItemId: { in: menuItemIds } },
    select: { menuItem: { select: { menu: { select: { kitchenPartnerId: true } } } } },
    take: 1,
  });

  const kitchenId = orderItems[0]?.menuItem?.menu?.kitchenPartnerId;
  if (kitchenId) {
    const popular = await prisma.menuItem.findMany({
      where: {
        menu: { kitchenPartnerId: kitchenId },
        deletedAt: null,
        isAvailable: true,
        id: { notIn: menuItemIds },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (popular.length > 0) {
      return popular.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        foodType: p.foodType,
      }));
    }
  }

  // Last fallback: any available menu items
  const anyItems = await prisma.menuItem.findMany({
    where: { deletedAt: null, isAvailable: true, id: { notIn: menuItemIds } },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return anyItems.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    foodType: p.foodType,
  }));
}

import crypto from "crypto";
function cryptoCreateHmac(body: string) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
}
