import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      where: {
        payment: {
          provider: "CASH_ON_DELIVERY",
        },
      },
      include: {
        payment: { select: { status: true } },
        user: { select: { name: true } },
        deliveryPartner: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const orderIds = orders.map((o) => o.id);
    const payouts = await prisma.deliveryPartnerPayout.findMany({
      where: { orderId: { in: orderIds } },
      select: { orderId: true, status: true },
    });
    const payoutMap = new Map(payouts.map((po) => [po.orderId, po.status]));

    const data = orders.map((o) => ({
      id: o.id,
      customerName: o.user?.name ?? "Unknown",
      totalAmount: o.totalAmount.toString(),
      paymentStatus: o.payment?.status ?? "PENDING",
      orderStatus: o.status,
      deliveryPartnerName: o.deliveryPartner?.user?.name ?? null,
      payoutStatus: payoutMap.get(o.id) ?? null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin] COD orders fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch COD orders" }, { status: 500 });
  }
}