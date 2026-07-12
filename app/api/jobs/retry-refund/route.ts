import { NextRequest, NextResponse } from "next/server";
import { retryRefund } from "@/actions/payments/refund";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const refundRowId = searchParams.get("refundRowId") ?? "all";
    if (refundRowId === "all") {
      const { default: prisma } = await import("@/lib/prisma");
      const failedRefunds = await prisma.refund.findMany({
        where: { status: "FAILED" },
        take: 20,
      });
      const results = [];
      for (const refund of failedRefunds) {
        try {
          const result = await retryRefund(refund.id);
          results.push({ refundId: refund.id, ...result });
        } catch (err) {
          results.push({ refundId: refund.id, success: false, error: String(err) });
        }
      }
      return NextResponse.json({ processed: results.length, results });
    }

    const result = await retryRefund(refundRowId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[RetryRefund] Error:", error);
    return NextResponse.json({ error: "Failed to retry refund" }, { status: 500 });
  }
}
