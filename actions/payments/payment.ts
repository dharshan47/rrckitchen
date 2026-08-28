/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import type { Prisma } from "@/lib/generated/prisma/client";
import { TimeSlot } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";
import { getAblyRest } from "@/lib/ably/server";
import { redis } from "@/lib/redis";
import { awardPoints } from "@/actions/loyalty/loyalty";
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id";

export interface CreateOrderInput {
  userId: string;
  items: { id: string; qty: number; price: number }[];
  idempotencyKey?: string;
  couponCode?: string;
  serviceDateType?: "TODAY" | "TOMORROW" | "FUTURE";
  serviceDate?: string;
  timeSlot?: string;
  addressId?: string;
}

export async function createPaymentOrder({ userId, items, idempotencyKey, couponCode, serviceDateType, serviceDate: serviceDateIso, timeSlot: selectedTimeSlot, addressId }: CreateOrderInput) {
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

  let serviceDate: Date;
  let resolvedServiceDateType: "TODAY" | "TOMORROW" | "FUTURE";

  if (serviceDateIso) {
    const [year, month, day] = serviceDateIso.split("-").map(Number);
    if (!year || !month || !day || Number.isNaN(new Date(year, month - 1, day).getTime())) {
      throw new Error("Invalid delivery date");
    }
    const picked = new Date(year, month - 1, day);
    picked.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (picked.getTime() < tomorrow.getTime()) {
      throw new Error("Same day delivery is not available. Please choose a future date.");
    }
    serviceDate = picked;
    resolvedServiceDateType = picked.getTime() === tomorrow.getTime() ? "TOMORROW" : "FUTURE";
  } else {
    serviceDate = new Date();
    if (serviceDateType === "TODAY") {
      serviceDate.setHours(0, 0, 0, 0);
      resolvedServiceDateType = "TODAY";
    } else {
      serviceDate.setDate(serviceDate.getDate() + 1);
      serviceDate.setHours(0, 0, 0, 0);
      resolvedServiceDateType = "TOMORROW";
    }
  }

  const firstItem = items[0];
  const firstMenuItem = menuItems.find((m) => m.id === firstItem.id)!;
  const timeSlot = selectedTimeSlot || firstMenuItem.timeSlot;

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

  const itemTotal = items.reduce((sum, i) => {
    const menuItem = menuItems.find((m) => m.id === i.id)!;
    return sum + Number(menuItem.price) * i.qty;
  }, 0);

  let appliedDiscount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && coupon.validFrom <= new Date() && coupon.validTo >= new Date()) {
      if (itemTotal >= Number(coupon.minOrderValue ?? 0)) {
        if (coupon.discountType === "PERCENTAGE") {
          appliedDiscount = Math.min(
            itemTotal * Number(coupon.discountValue) / 100,
            Number(coupon.maxDiscount ?? Infinity)
          );
        } else {
          appliedDiscount = Number(coupon.discountValue);
        }
        appliedDiscount = Math.min(appliedDiscount, itemTotal);
      }
    }
  }

  // Mirror the cart page charges so the Razorpay amount matches what the
  // customer sees: item total - coupon + packaging + delivery (free above min).
  const packagingCharge = Number(process.env.PACKAGING_CHARGE) || 10;
  const deliveryCharge = Number(process.env.DELIVERY_CHARGE) || 20;
  const freeDeliveryMin = Number(process.env.FREE_DELIVERY_MIN) || 299;
  const effectiveDeliveryCharge = itemTotal >= freeDeliveryMin ? 0 : deliveryCharge;

  const totalAmount =
    itemTotal - appliedDiscount + packagingCharge + effectiveDeliveryCharge;

  let resolvedAddressId = addressId ?? null;
  if (resolvedAddressId) {
    const address = await prisma.address.findFirst({
      where: { id: resolvedAddressId, userId },
      include: { serviceZone: { select: { isActive: true } } },
    });
    if (!address) {
      resolvedAddressId = null;
    } else if (!address.serviceZone.isActive) {
      throw new Error("Delivery is not available for this address");
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.ORDER),
        userId,
        addressId: resolvedAddressId,
        serviceDate,
        serviceDateType: resolvedServiceDateType,
        timeSlot: timeSlot as TimeSlot,
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

  if (couponCode && appliedDiscount > 0) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon) {
      await prisma.couponRedemption.create({
        data: { couponId: coupon.id, userId, orderId: order.id, discountAmount: appliedDiscount },
      }).catch(() => {});
    }
  }

  const razorpayOrder = await getRazorpayClient().orders.create({
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: order.id,
    notes: { userId, orderId: order.id },
  });

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.PAYMENT),
        orderId: order.id,
        provider: "RAZORPAY",
        providerOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: "PENDING",
      },
    });
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
      const refund = await getRazorpayClient().payments.refund(payment.providerPaymentId, {
        amount: Math.round(Number(order.totalAmount) * 100),
        notes: { reason },
      });
      razorpayRefundId = refund.id;
      refundStatus = "INITIATED";
    } catch (err) {
      console.error("Razorpay refund failed:", err);
    }
  }

  await prisma.$transaction(async (tx) => {
    const created = await tx.refund.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.REFUND),
        orderId,
        paymentId: payment.id,
        amount: order.totalAmount,
        reason,
        razorpayRefundId,
        status: refundStatus,
      },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    return created;
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
  paymentMethodDetail?: Record<string, unknown>,
) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (!paymentMethod) {
    try {
      const rpPayment = await getRazorpayClient().payments.fetch(razorpayPaymentId);
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
      paymentMethodDetail: (paymentMethodDetail ?? undefined) as Prisma.InputJsonValue | undefined,
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
      include: {
        menu: {
          select: {
            kitchenPartner: {
              select: { slug: true },
            },
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (popular.length > 0) {
      return popular.map((p) => ({
        id: p.id,
        slug: p.slug ?? undefined,
        kitchenSlug: p.menu?.kitchenPartner?.slug ?? undefined,
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
    include: {
      menu: {
        select: {
          kitchenPartner: {
            select: { slug: true },
          },
        },
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return anyItems.map((p) => ({
    id: p.id,
    slug: p.slug ?? undefined,
    kitchenSlug: p.menu?.kitchenPartner?.slug ?? undefined,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    foodType: p.foodType,
  }));
}

function cryptoCreateHmac(body: string) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
}

// ── UPI Smart Collect ─────────────────────────────────────────────────────────

import { createVpa, fetchVpaPayments } from "@/lib/razorpay";

/**
 * Creates a Razorpay Virtual Account / VPA for Smart Collect.
 * Saves the request to the DB so the polling endpoint can check status.
 *
 * Requires Razorpay Smart Collect to be enabled on your account.
 */
export async function createUpiCollectRequest(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new Error("Order not found");
  if (!order.payment) throw new Error("Payment record not found for order");
  if (order.payment.status !== "PENDING") {
    throw new Error("Order payment is no longer pending");
  }

  // Idempotent: return existing if already created
  const existing = await prisma.upiCollectRequest.findUnique({
    where: { orderId },
  });
  if (existing) {
    return {
      vpa: existing.vpa,
      expiresAt: existing.expiresAt,
      status: existing.status,
    };
  }

  const result = await createVpa({
    receipt: orderId,
    amountPaise: Math.round(Number(order.totalAmount) * 100),
    expireMinutes: 30,
    description: `RRC Kitchen Order #${order.publicCode ?? orderId.slice(-8)}`,
  });

  await prisma.upiCollectRequest.create({
    data: {
      orderId,
      paymentId: order.payment.id,
      vpa: result.vpa,
      razorpayVpaId: result.virtualAccountId,
      status: "PENDING",
      expiresAt: result.expiresAt,
    },
  });

  return {
    vpa: result.vpa,
    expiresAt: result.expiresAt,
    status: "PENDING" as const,
  };
}

/**
 * Polls Razorpay to see if a payment arrived for a Smart Collect VPA.
 * If paid, confirms the order (same as regular payment verification).
 */
export async function pollUpiCollectStatus(orderId: string) {
  const collectReq = await prisma.upiCollectRequest.findUnique({
    where: { orderId },
    include: { payment: true },
  });

  if (!collectReq) throw new Error("UPI Collect request not found");

  // Already resolved
  if (collectReq.status !== "PENDING") {
    return { status: collectReq.status, orderId: collectReq.status === "PAID" ? orderId : undefined };
  }

  // Expired
  if (new Date() > collectReq.expiresAt) {
    await prisma.upiCollectRequest.update({
      where: { orderId },
      data: { status: "EXPIRED" },
    });
    return { status: "EXPIRED" as const };
  }

  if (!collectReq.razorpayVpaId) return { status: "PENDING" as const };

  const payments = await fetchVpaPayments(collectReq.razorpayVpaId);
  const captured = payments.find((p) => p.status === "captured");

  if (captured) {
    // Confirm the order
    await confirmPayment(
      collectReq.payment.providerOrderId ?? "",
      captured.paymentId,
      "upi",
      { method: "upi", source: "smart_collect", vpa: collectReq.vpa },
    );

    await prisma.upiCollectRequest.update({
      where: { orderId },
      data: { status: "PAID" },
    });

    return { status: "PAID" as const, orderId };
  }

  return { status: "PENDING" as const };
}
