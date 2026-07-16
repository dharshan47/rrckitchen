import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPaymentOrder } from "@/actions/payments/payment";


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { items?: { id: string; qty: number; price: number }[]; couponCode?: string; paymentProvider?: "RAZORPAY" | "CASH_ON_DELIVERY" };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const items = body?.items;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const result = await createPaymentOrder({
      userId: session.user.id,
      items,
      couponCode: body.couponCode,
      paymentProvider: body.paymentProvider,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Payment] Create order failed:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
