import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAblyRest } from "@/lib/ably/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rider = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
    });
    if (!rider) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 });
    }

    const { orderId, otp, cashEntered } = await req.json();
    if (!orderId || !otp || cashEntered === undefined) {
      return NextResponse.json({ error: "orderId, otp, and cashEntered are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.deliveryOtp !== otp) {
      return NextResponse.json({ error: "Incorrect delivery code — ask the customer to confirm it again" }, { status: 400 });
    }

    if (order.payment?.provider !== "CASH_ON_DELIVERY") {
      return NextResponse.json({ error: "Not a COD order" }, { status: 400 });
    }

    const expected = Number(order.codAmountExpected ?? order.totalAmount);
    const cashAmount = Number(cashEntered);
    const variance = expected - cashAmount;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          deliveryStatus: "DELIVERED",
          deliveryOtpVerifiedAt: new Date(),
          codAmountEntered: cashAmount,
        },
      });

      await tx.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", paidAt: new Date() },
      });

      await tx.deliveryPartner.update({
        where: { id: rider.id },
        data: { cashInHand: { increment: cashAmount } },
      });

      if (Math.abs(variance) > 0) {
        await tx.codVariance.create({
          data: {
            orderId,
            deliveryPartnerId: rider.id,
            expectedAmount: expected,
            enteredAmount: cashAmount,
            varianceAmount: variance,
          },
        });
      }
    });

    const { createKitchenPayout } = await import("@/actions/payouts/kitchen-payout");
    await createKitchenPayout(orderId);

    const { createDeliveryPayout } = await import("@/actions/payouts/delivery-payout");
    const commissionAmount = Number(order.commissionAmount) || Math.round(Number(order.totalAmount) * 0.15);
    await createDeliveryPayout(orderId, commissionAmount);

    const ably = getAblyRest();
    await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "COMPLETED" });
    await ably.channels.get(`order:${orderId}`).publish("delivery:status", { status: "DELIVERED", cashCollected: true });

    await prisma.orderStatusHistory.create({
      data: { orderId, status: "COMPLETED", note: "COD delivery confirmed with OTP" },
    });

    return NextResponse.json({ ok: true, variance: variance !== 0 ? variance : undefined });
  } catch (error) {
    console.error("[COD Delivery] Confirmation failed:", error);
    return NextResponse.json({ error: "Failed to confirm COD delivery" }, { status: 500 });
  }
}