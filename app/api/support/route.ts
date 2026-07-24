import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description, orderId, category, priority, mediaUrls } = await req.json();
    if (!subject?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const validCategory = ["order", "delivery", "food", "payment", "account", "kitchen", "menu", "delivery-partner", "customer-order", "kitchen-partner", "delivery-issue", "cod", "ingredient", "equipment", "safety", "other"].includes(category) ? category : "other";

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        orderId: orderId || null,
        subject: subject.trim(),
        description: description.trim(),
        category: validCategory,
        priority: priority || "MEDIUM",
        mediaUrls: mediaUrls || [],
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("[Support] POST failed:", error);
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("[Support] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}