import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAblyRest } from "@/lib/ably/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, cashCollected, otp } = await req.json();

    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const validStatuses = ["PICKEDUP", "INTRANSIT", "DELIVERED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "DELIVERED") {
      // Require delivery OTP for all orders (prepaid + COD) — proof-of-delivery
      if (!otp || order.deliveryOtp !== otp) {
        return NextResponse.json({ error: "Incorrect delivery code — ask the customer to confirm it again" }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: status as never, status: "COMPLETED" as never, deliveryOtpVerifiedAt: new Date() },
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: status as never },
      });
    }

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { orderId },
    });

    if (assignment) {
      const assignmentData: Record<string, unknown> = { status };
      if (status === "PICKEDUP") assignmentData.pickedUpAt = new Date();
      if (status === "DELIVERED" || status === "FAILED") assignmentData.deliveredAt = new Date();
      await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: assignmentData as never,
      });
    }

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: status === "DELIVERED" ? "COMPLETED" : (status as never),
        note: `Delivery partner: ${status}`,
      },
    });

    if (status === "DELIVERED" && cashCollected && order.payment?.provider === "CASH_ON_DELIVERY") {
      await prisma.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", paidAt: new Date() },
      });

      await prisma.deliveryPartnerPayout.create({
        data: {
          deliveryPartnerId: partner.id,
          orderId,
          amount: Number(order.commissionAmount) || Math.round(Number(order.totalAmount) * 0.15),
          status: "PENDING",
        },
      });
    }

    const ably = getAblyRest();
    await ably.channels.get(`order:${orderId}`).publish("delivery:status", { status, cashCollected });
    if (status === "DELIVERED") {
      await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "COMPLETED" });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Delivery] Order status update failed:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
