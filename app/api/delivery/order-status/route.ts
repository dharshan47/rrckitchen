import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAblyRest } from "@/lib/ably/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status } = await req.json();

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

    const validStatuses = ["ACCEPTED", "REJECTED", "PICKEDUP", "INTRANSIT", "DELIVERED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "REJECTED") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const redisRaw = redis as any;
      await redisRaw.sadd(`order:${orderId}:rejected`, partner.id);
      await redisRaw.expire(`order:${orderId}:rejected`, 86400);

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { deliveryPartnerId: null, deliveryStatus: null },
        });
        await tx.deliveryAssignment.deleteMany({
          where: { orderId, deliveryPartnerId: partner.id },
        });
      });
    } else {
      if (status === "DELIVERED") {
        await prisma.order.update({
          where: { id: orderId },
          data: { deliveryStatus: status as never, status: "COMPLETED" as never },
        });
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: { deliveryStatus: status as never },
        });
      }

      const assignment = await prisma.deliveryAssignment.findFirst({
        where: { orderId, deliveryPartnerId: partner.id },
      });

      if (assignment) {
        const assignmentData: Record<string, unknown> = {};
        if (status === "ACCEPTED") assignmentData.acceptedAt = new Date();
        if (status === "PICKEDUP") assignmentData.pickedUpAt = new Date();
        if (status === "DELIVERED" || status === "FAILED") assignmentData.deliveredAt = new Date();
        
        if (status === "DELIVERED") assignmentData.status = "DELIVERED";
        if (status === "FAILED") assignmentData.status = "CANCELLED";
        
        await prisma.deliveryAssignment.update({
          where: { id: assignment.id },
          data: assignmentData,
        });
      }
    }

    if (status === "DELIVERED") {
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: "COMPLETED",
          note: `Delivery partner: ${status}`,
        },
      });
    }

    const ably = getAblyRest();
    await ably.channels.get(`order:${orderId}`).publish("delivery:status", { status });
    if (status === "DELIVERED") {
      await ably.channels.get(`order:${orderId}`).publish("order:status", { status: "COMPLETED" });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Delivery] Order status update failed:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
