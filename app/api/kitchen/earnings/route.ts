import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kitchenPartner = await prisma.kitchenPartner.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!kitchenPartner) {
      return NextResponse.json({ error: "Kitchen partner not found" }, { status: 404 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payouts = await prisma.kitchenPayout.findMany({
      where: {
        kitchenPartnerId: kitchenPartner.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap = new Map<string, { amount: number; orders: number }>();
    for (const payout of payouts) {
      const dateKey = payout.createdAt.toISOString().slice(0, 10);
      const existing = dailyMap.get(dateKey) ?? { amount: 0, orders: 0 };
      existing.amount += Number(payout.netAmount);
      existing.orders += 1;
      dailyMap.set(dateKey, existing);
    }

    const data = Array.from(dailyMap.entries()).map(([date, values]) => ({
      date,
      amount: Math.round(values.amount * 100) / 100,
      orders: values.orders,
    }));

    const totalEarnings = data.reduce((s, d) => s + d.amount, 0);
    const totalOrders = data.reduce((s, d) => s + d.orders, 0);

    return NextResponse.json({
      data,
      summary: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalOrders,
        averagePerOrder: totalOrders > 0 ? Math.round((totalEarnings / totalOrders) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    console.error("[KitchenEarnings] Error:", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
