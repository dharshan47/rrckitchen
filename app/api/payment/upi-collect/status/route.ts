import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { pollUpiCollectStatus } from "@/actions/payments/payment";

/**
 * GET /api/payment/upi-collect/status?orderId=<id>
 *
 * Polls Razorpay to check if a Smart Collect VPA has received payment.
 * Returns { status: "PENDING" | "PAID" | "EXPIRED" | "FAILED", orderId? }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "orderId query param is required" }, { status: 400 });
    }

    const result = await pollUpiCollectStatus(orderId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to poll UPI collect status";
    console.error("[UPI Collect] Status poll failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
