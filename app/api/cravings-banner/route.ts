import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUserCravingBanner } from "@/actions/notifications/cravings-nudge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(null);
    }

    const banner = await getUserCravingBanner(session.user.id);
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json(null);
  }
}
