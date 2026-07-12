"use server";

import prisma from "@/lib/prisma";

export async function recordCashRemittance(
  riderId: string,
  amount: number,
  referenceId: string,
  method: "UPI_TO_PLATFORM" | "ADMIN_COLLECTED_CASH"
) {
  return prisma.cashRemittance.create({
    data: { deliveryPartnerId: riderId, amount, method, referenceId, status: "PENDING" },
  });
}

export async function confirmRemittance(remittanceId: string, confirmedByUserId?: string) {
  const r = await prisma.cashRemittance.findUniqueOrThrow({ where: { id: remittanceId } });
  await prisma.$transaction([
    prisma.cashRemittance.update({
      where: { id: remittanceId },
      data: { status: "CONFIRMED", confirmedAt: new Date(), confirmedByUserId },
    }),
    prisma.deliveryPartner.update({
      where: { id: r.deliveryPartnerId },
      data: { cashInHand: { decrement: r.amount } },
    }),
  ]);
  return { success: true };
}

export async function isEligibleForCodAssignment(riderId: string) {
  const rider = await prisma.deliveryPartner.findUniqueOrThrow({ where: { id: riderId } });
  return rider.codEligible && Number(rider.cashInHand) < 3000;
}

export async function reconcileOverdueCash() {
  const overdue = await prisma.deliveryPartner.findMany({ where: { cashInHand: { gt: 500 } } });
  for (const rider of overdue) {
    const pendingPayout = await prisma.deliveryPartnerPayout.findFirst({
      where: { deliveryPartnerId: rider.id, status: "PENDING" },
    });
    if (pendingPayout) {
      const offset = Math.min(Number(pendingPayout.amount), Number(rider.cashInHand));
      await prisma.$transaction([
        prisma.deliveryPartnerPayout.update({
          where: { id: pendingPayout.id },
          data: { amount: { decrement: offset } },
        }),
        prisma.deliveryPartner.update({
          where: { id: rider.id },
          data: { cashInHand: { decrement: offset } },
        }),
      ]);
    }
  }
  return { reconciled: overdue.length };
}

export async function settleDeliveryPartnerPayout(riderId: string, payoutAmount: number) {
  const rider = await prisma.deliveryPartner.findUniqueOrThrow({ where: { id: riderId } });

  let adjustedAmount = payoutAmount;
  if (Number(rider.cashInHand) > 0) {
    const offset = Math.min(Number(rider.cashInHand), payoutAmount);
    await prisma.deliveryPartner.update({
      where: { id: riderId },
      data: { cashInHand: { decrement: offset } },
    });
    adjustedAmount -= offset;
  }

  return adjustedAmount;
}

export async function recordCodRefusal(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  await prisma.userCodEligibility.update({
    where: { userId: order.userId },
    data: { codRefusalCount: { increment: 1 }, isCodBlocked: true },
  });
  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  return { success: true };
}