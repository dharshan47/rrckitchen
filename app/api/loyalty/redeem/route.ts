import { NextRequest, NextResponse } from "next/server";
import { redeemPoints } from "@/actions/loyalty/loyalty";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, points } = body;

    if (!orderId || !points || points < 100) {
      return NextResponse.json({ error: "Minimum 100 points required to redeem" }, { status: 400 });
    }

    const result = await redeemPoints(orderId, points);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to redeem points";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
