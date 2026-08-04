import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature, confirmPayment } from "@/actions/payments/payment";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method_detail,
    } = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_detail?: Record<string, any>;
    };

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const result = await confirmPayment(
      razorpay_order_id,
      razorpay_payment_id,
      undefined,
      payment_method_detail,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Payment] Verify failed:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}

