"use server";

import prisma from "@/lib/prisma";
import { getAblyRest } from "@/lib/ably/server";
import { awardPoints } from "@/actions/loyalty/loyalty";

export async function confirmCodDelivery(orderId: string, enteredOtp: string, riderId: string, cashEntered: number) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

  if (order.deliveryOtp !== enteredOtp) {
    throw new Error("Incorrect delivery code — ask the customer to confirm it again");
  }

  const expected = Number(order.codAmountExpected ?? order.totalAmount);
  const variance = expected - cashEntered;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        deliveryStatus: "DELIVERED",
        deliveryOtpVerifiedAt: new Date(),
        codAmountEntered: cashEntered,
      },
    });
    await tx.payment.update({ where: { orderId }, data: { status: "SUCCESS", paidAt: new Date() } });
    await tx.deliveryPartner.update({ where: { id: riderId }, data: { cashInHand: { increment: cashEntered } } });

    if (Math.abs(variance) > 0) {
      await tx.codVariance.create({
        data: { orderId, deliveryPartnerId: riderId, expectedAmount: expected, enteredAmount: cashEntered, varianceAmount: variance },
      });
    }

    await tx.orderStatusHistory.create({
      data: { orderId, status: "COMPLETED", note: "COD delivery confirmed with OTP" },
    });
  });

  const { createKitchenPayout } = await import("@/actions/payouts/kitchen-payout");
  await createKitchenPayout(orderId);

  const { createDeliveryPayout } = await import("@/actions/payouts/delivery-payout");
  await createDeliveryPayout(orderId, expected);

  const ably = getAblyRest();
  await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "COMPLETED" });

  await awardPoints(orderId).catch(() => {});

  return { success: true, variance: variance !== 0 ? variance : undefined };
}