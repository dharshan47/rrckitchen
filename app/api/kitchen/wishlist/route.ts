import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.kitchenWishlist.findMany({
      where: { userId: session.user.id },
      select: { kitchenPartnerId: true },
    });

    return NextResponse.json(items.map((i) => i.kitchenPartnerId));
  } catch (error) {
    console.error("[KitchenWishlist] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kitchenPartnerId } = await req.json();
    if (!kitchenPartnerId) {
      return NextResponse.json({ error: "kitchenPartnerId is required" }, { status: 400 });
    }

    const existing = await prisma.kitchenWishlist.findUnique({
      where: { userId_kitchenPartnerId: { userId: session.user.id, kitchenPartnerId } },
    });

    if (existing) {
      await prisma.kitchenWishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false, removed: true });
    }

    await prisma.kitchenWishlist.create({
      data: { userId: session.user.id, kitchenPartnerId },
    });

    return NextResponse.json({ added: true, removed: false });
  } catch (error) {
    console.error("[KitchenWishlist] POST failed:", error);
    return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
  }
}
