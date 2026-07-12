import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        deliveryAssignment: { include: { deliveryPartner: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.payment || order.payment.provider !== "CASH_ON_DELIVERY") {
      return NextResponse.json({ error: "Not a COD order" }, { status: 400 });
    }

    if (order.payment.status !== "SUCCESS") {
      return NextResponse.json({ error: "Payment not yet collected" }, { status: 400 });
    }

    const existingPayout = await prisma.deliveryPartnerPayout.findFirst({
      where: { orderId },
    });

    if (existingPayout) {
      if (existingPayout.status === "SETTLED") {
        return NextResponse.json({ error: "Already settled" }, { status: 400 });
      }

      await prisma.deliveryPartnerPayout.update({
        where: { id: existingPayout.id },
        data: { status: "SETTLED", settledAt: new Date() },
      });
    } else if (order.deliveryAssignment?.deliveryPartnerId) {
      await prisma.deliveryPartnerPayout.create({
        data: {
          deliveryPartnerId: order.deliveryAssignment.deliveryPartnerId,
          orderId,
          amount: Math.round(Number(order.totalAmount) * 0.15),
          status: "SETTLED",
          settledAt: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Settle COD failed:", error);
    return NextResponse.json({ error: "Failed to settle COD payment" }, { status: 500 });
  }
}
