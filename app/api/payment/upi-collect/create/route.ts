import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUpiCollectRequest } from "@/actions/payments/payment";

/**
 * POST /api/payment/upi-collect/create
 * Body: { orderId: string }
 *
 * Creates a Razorpay Virtual Account / VPA for the given pending order.
 * Requires Razorpay Smart Collect to be enabled on your account.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { orderId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!body?.orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await createUpiCollectRequest(body.orderId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create UPI collect request";
    console.error("[UPI Collect] Create failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
