import { NextResponse } from "next/server";
import { processScheduledKitchenPayouts } from "@/actions/payouts/kitchen-payout";
import { settleDeliveryPayouts } from "@/actions/payouts/delivery-payout";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [kitchenResults, deliveryResults] = await Promise.all([
      processScheduledKitchenPayouts(),
      settleDeliveryPayouts(),
    ]);

    return NextResponse.json({
      kitchenPayouts: kitchenResults,
      deliveryPayouts: deliveryResults,
    });
  } catch (error) {
    console.error("[SettlePayouts] Error:", error);
    return NextResponse.json({ error: "Payout settlement job failed" }, { status: 500 });
  }
}
