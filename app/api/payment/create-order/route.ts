import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPaymentOrder } from "@/actions/payments/payment";

// Messages createPaymentOrder throws for expected, user-facing failures.
// These are returned as 400s so the client can show the real reason instead
// of a generic "failed to create order".
const BUSINESS_ERROR_PREFIXES = [
  "Cart is empty",
  "Some menu items not found",
  "Invalid delivery date",
  "Same day delivery is not available",
  "Orders for this time slot closed",
  "Delivery is not available for this address",
];


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { items?: { id: string; qty: number; price: number }[]; couponCode?: string; serviceDateType?: "TODAY" | "TOMORROW" | "FUTURE"; serviceDate?: string; timeSlot?: string; addressId?: string };
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
      serviceDateType: body.serviceDateType,
      serviceDate: body.serviceDate,
      timeSlot: body.timeSlot,
      addressId: body.addressId,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && BUSINESS_ERROR_PREFIXES.some((prefix) => error.message.startsWith(prefix))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[Payment] Create order failed:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
