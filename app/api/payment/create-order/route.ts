import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPaymentOrder } from "@/actions/payment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json() as {
      items: { id: string; qty: number; price: number }[];
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const result = await createPaymentOrder({ userId: session.user.id, items });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Payment] Create order failed:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
