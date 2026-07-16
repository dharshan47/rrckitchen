import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";


export async function POST(req: NextRequest) {
  try {
    const { session } = await requireAdmin();
    const { remittanceId } = await req.json();

    if (!remittanceId) {
      return NextResponse.json({ error: "Remittance ID is required" }, { status: 400 });
    }

    const r = await prisma.cashRemittance.findUniqueOrThrow({ where: { id: remittanceId } });

    await prisma.$transaction([
      prisma.cashRemittance.update({
        where: { id: remittanceId },
        data: { status: "CONFIRMED", confirmedAt: new Date(), confirmedByUserId: session.user.id },
      }),
      prisma.deliveryPartner.update({
        where: { id: r.deliveryPartnerId },
        data: { cashInHand: { decrement: r.amount } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Confirm remittance failed:", error);
    return NextResponse.json({ error: "Failed to confirm remittance" }, { status: 500 });
  }
}