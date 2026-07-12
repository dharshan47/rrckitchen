import { NextResponse } from "next/server";
import { processCravingsNudge } from "@/actions/notifications/cravings-nudge";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processCravingsNudge(3);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CravingsNudge] Error:", error);
    return NextResponse.json({ error: "Cravings nudge job failed" }, { status: 500 });
  }
}
