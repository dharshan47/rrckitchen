import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function POST(req: Request) {
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

    const { serviceDate, items } = await req.json();
    if (!serviceDate || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const serviceDateObj = new Date(serviceDate + "T00:00:00Z");

    const results = await prisma.$transaction(
      items.map((item: { menuItemId: string; totalQuantity: number }) =>
        prisma.menuItemDailyStock.upsert({
          where: {
            menuItemId_serviceDate: {
              menuItemId: item.menuItemId,
              serviceDate: serviceDateObj,
            },
          },
          update: { totalQuantity: item.totalQuantity },
          create: {
            menuItemId: item.menuItemId,
            serviceDate: serviceDateObj,
            totalQuantity: item.totalQuantity,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("[StockUpdate] Error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
