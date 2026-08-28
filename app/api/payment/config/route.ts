import { NextResponse } from "next/server";

/**
 * GET /api/payment/config
 *
 * Public availability probe for online payments. Never exposes the secret —
 * only reports whether the server has Razorpay credentials configured and
 * returns the publishable key id (safe to embed client-side).
 */
export async function GET() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  return NextResponse.json({
    available: Boolean(keyId && keySecret),
    keyId: keyId || null,
  });
}