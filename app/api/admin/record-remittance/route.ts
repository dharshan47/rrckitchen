import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";


export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { riderId, amount, method, referenceId } = await req.json();

    if (!riderId || !amount || !method || !referenceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.cashRemittance.create({
      data: {
        deliveryPartnerId: riderId,
        amount: Number(amount),
        method,
        referenceId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Record remittance failed:", error);
    return NextResponse.json({ error: "Failed to record remittance" }, { status: 500 });
  }
}