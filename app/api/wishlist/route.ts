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

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        menuItem: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            foodType: true,
            timeSlot: true,
            description: true,
            photos: { select: { imageUrl: true }, take: 1 },
            menu: {
              select: {
                kitchenPartner: {
                  select: {
                    kitchenAlias: { select: { displayName: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[Wishlist] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { menuItemId } = await req.json();
    if (!menuItemId) {
      return NextResponse.json({ error: "menuItemId is required" }, { status: 400 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_menuItemId: { userId: session.user.id, menuItemId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false, removed: true });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId: session.user.id, menuItemId },
    });

    return NextResponse.json({ added: true, removed: false, item });
  } catch (error) {
    console.error("[Wishlist] POST failed:", error);
    return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const menuItemId = searchParams.get("menuItemId");

    if (!menuItemId) {
      return NextResponse.json({ error: "menuItemId is required" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { userId_menuItemId: { userId: session.user.id, menuItemId } },
    });

    if (item) {
      await prisma.wishlistItem.delete({ where: { id: item.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Wishlist] DELETE failed:", error);
    return NextResponse.json({ error: "Failed to remove wishlist item" }, { status: 500 });
  }
}