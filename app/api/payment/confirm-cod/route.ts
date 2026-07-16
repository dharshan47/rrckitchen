import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getAblyRest } from "@/lib/ably/server";
import { redis } from "@/lib/redis";


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { localOrderId } = await req.json() as { localOrderId: string };

    const order = await prisma.order.findUnique({
      where: { id: localOrderId, userId: session.user.id },
      include: {
        payment: true,
        orderItems: { include: { menuItem: { include: { menu: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.payment || order.payment.provider !== "CASH_ON_DELIVERY") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (order.payment.provider === "CASH_ON_DELIVERY") {
      return NextResponse.json({ orderId: order.id });
    }

    if (order.payment.status !== "PENDING") {
      return NextResponse.json({ orderId: order.id });
    }

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: "SUCCESS", paidAt: new Date() },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PREPARING" },
    });

    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status: "PREPARING", note: "Cash on pickup - order confirmed" },
    });

    const { createKitchenPayout } = await import("@/actions/payouts/kitchen-payout");
    await createKitchenPayout(order.id);

    const ably = getAblyRest();
    await ably.channels.get(`order:${order.id}`).publish("order:status", { status: "PREPARING" });

    const kitchenPartnerIds = [...new Set(order.orderItems.map((i) => i.menuItem.menu.kitchenPartnerId))];
    for (const kitchenPartnerId of kitchenPartnerIds) {
      await ably.channels.get(`kitchen:${kitchenPartnerId}`).publish("queue:new-order", {
        orderId: order.id,
        items: order.orderItems.map((i) => ({
          name: i.menuItem.name,
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
      });
    }

    await redis.xadd("order-events", "*", {
      type: "ORDER_CONFIRMED",
      orderId: order.id,
      kitchenPartnerIds: JSON.stringify(kitchenPartnerIds),
      timestamp: Date.now().toString(),
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[Payment] Confirm COD failed:", error);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
