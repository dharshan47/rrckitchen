import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { online } = await req.json();

    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 });
    }

    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { isOnline: online },
    });

    if (online) {
      // Real position is added to the geo index on the first location ping;
      // adding a (0,0) placeholder here would break nearby-partner searches.
    } else {
      await redis.zrem("deliveryPersons:live", partner.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Delivery] Online toggle failed:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
