import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let points = await prisma.loyaltyPoints.findUnique({
      where: { userId: session.user.id },
    });

    if (!points) {
      points = await prisma.loyaltyPoints.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json(points);
  } catch (error) {
    console.error("[Loyalty] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty points" }, { status: 500 });
  }
}
