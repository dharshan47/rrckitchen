import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const admin = await prisma.adminProfile.findUnique({ where: { userId: session.user.id } });
  if (!admin?.isActive) return null;
  return session.user;
}

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tickets = await prisma.supportTicket.findMany({
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        user: { select: { name: true, email: true, phoneNumber: true, image: true } },
        order: {
          select: {
            id: true,
            publicCode: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            orderItems: {
              select: {
                id: true,
                quantity: true,
                unitPrice: true,
                menuItem: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("[Admin Support] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ticketId, status } = await req.json();
    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required" }, { status: 400 });
    }

    const validStatuses = ["OPEN", "INPROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as "OPEN" | "INPROGRESS" | "RESOLVED" | "CLOSED" },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("[Admin Support] PATCH failed:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ticketId, message } = await req.json();
    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ error: "ticketId and message are required" }, { status: 400 });
    }

    const msg = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: admin.id,
        message: message.trim(),
      },
    });

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "INPROGRESS" },
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error) {
    console.error("[Admin Support] POST failed:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}