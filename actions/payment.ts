import prisma from "@/lib/prisma";
import { razorpayClient } from "@/lib/auth";

export interface CreateOrderInput {
  userId: string;
  items: { id: string; qty: number; price: number }[];
}

export async function createPaymentOrder({ userId, items }: CreateOrderInput) {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  const menuItemIds = items.map((i) => i.id);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, deletedAt: null },
    include: { menu: true },
  });

  if (menuItems.length !== items.length) {
    throw new Error("Some menu items not found");
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const timeSlot = menuItems[0].timeSlot;
  const serviceDate = new Date();
  serviceDate.setDate(serviceDate.getDate() + 1);
  serviceDate.setHours(0, 0, 0, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        serviceDate,
        timeSlot,
        totalAmount,
        commissionAmount: 0,
        source: "APP" as const,
        orderItems: {
          create: items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.id)!;
            const kitchenPartnerId = menuItem.menu.kitchenPartnerId;
            return {
              menuItemId: item.id,
              kitchenPartnerId,
              quantity: item.qty,
              unitPrice: item.price,
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

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    localOrderId: order.id,
  };
}

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
) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESS",
      providerPaymentId: razorpayPaymentId,
      paidAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CONFIRMED" },
  });

  await prisma.transaction.create({
    data: {
      paymentId: payment.id,
      type: "ORDERPAYMENT",
      amount: payment.amount,
      direction: "CREDIT",
    },
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

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CANCELLED" },
  });
}

import crypto from "crypto";
function cryptoCreateHmac(body: string) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
}
