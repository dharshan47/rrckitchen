import { redis } from "@/lib/redis";
import { refundOrderItem } from "@/actions/payments/refund";

const STREAM = "order-events";
const GROUP = "order-processors";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await redis.xgroup(STREAM, {
      type: "CREATE",
      group: GROUP,
      id: "$",
      options: { MKSTREAM: true },
    });
  } catch {
    // group already exists — fine, ignore
  }

  const raw = await redis.xreadgroup(GROUP, "consumer-1", STREAM, ">", {
    count: 50,
  });

  let processed = 0;
  if (raw) {
    for (const entry of raw) {
      if (!Array.isArray(entry)) continue;
      const messages = entry[1];
      if (!Array.isArray(messages)) continue;
      for (const msg of messages) {
        if (!Array.isArray(msg)) continue;
        const id = msg[0] as string;
        const fields = msg[1] as Record<string, string> | undefined;
        if (fields) {
          await handleOrderEvent(fields);
          await redis.xack(STREAM, GROUP, id);
          processed++;
        }
      }
    }
  }

  return Response.json({ processed });
}

async function handleOrderEvent(event: Record<string, string>) {
  switch (event.type) {
    case "ORDER_CONFIRMED":
      break;
    case "ITEM_UNAVAILABLE":
      if (event.orderItemId) {
        await refundOrderItem(event.orderItemId, "ITEM_OUT_OF_STOCK");
      }
      break;
    case "ORDER_CANCELLED":
      break;
    case "REFUND_INITIATED":
      break;
    case "PAYOUT_SETTLED":
      break;
  }
}
