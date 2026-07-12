import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { riderId, codEligible } = await req.json();

    if (!riderId) {
      return NextResponse.json({ error: "Rider ID is required" }, { status: 400 });
    }

    await prisma.deliveryPartner.update({
      where: { id: riderId },
      data: { codEligible },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Toggle COD eligibility failed:", error);
    return NextResponse.json({ error: "Failed to toggle COD eligibility" }, { status: 500 });
  }
}