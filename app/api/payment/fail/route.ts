import { NextRequest, NextResponse } from "next/server";
import { failPayment } from "@/actions/payment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id } = await req.json() as {
      razorpay_order_id: string;
    };

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "Missing razorpay_order_id" }, { status: 400 });
    }

    await failPayment(razorpay_order_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Payment] Fail call failed:", error);
    return NextResponse.json({ error: "Failed to mark payment as failed" }, { status: 500 });
  }
}
