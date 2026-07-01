import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { confirmPayment, failPayment } from "@/actions/payment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(text)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(text);
    const eventType = event.event as string;

    switch (eventType) {
      case "payment.captured": {
        const payload = event.payload.payment.entity;
        const razorpayOrderId = payload.order_id as string;
        const razorpayPaymentId = payload.id as string;

        try {
          await confirmPayment(razorpayOrderId, razorpayPaymentId);
        } catch (e) {
          if (e instanceof Error && e.message === "Payment record not found") {
            console.warn(`[Webhook] Payment not found for order: ${razorpayOrderId}`);
          } else {
            throw e;
          }
        }
        break;
      }

      case "payment.failed": {
        const failedPayload = event.payload.payment.entity;
        const failedOrderId = failedPayload.order_id as string;

        try {
          await failPayment(failedOrderId);
        } catch (e) {
          if (e instanceof Error && e.message === "Payment record not found") {
            console.warn(`[Webhook] Payment not found for order: ${failedOrderId}`);
          } else {
            throw e;
          }
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
