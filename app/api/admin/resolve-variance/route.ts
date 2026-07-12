import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { varianceId, note } = await req.json();

    if (!varianceId) {
      return NextResponse.json({ error: "Variance ID is required" }, { status: 400 });
    }

    await prisma.codVariance.update({
      where: { id: varianceId },
      data: { resolvedAt: new Date(), resolutionNote: note ?? "Resolved by admin" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Resolve variance failed:", error);
    return NextResponse.json({ error: "Failed to resolve variance" }, { status: 500 });
  }
}