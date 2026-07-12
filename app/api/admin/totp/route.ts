/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireSession() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user?.id) {
    throw { status: 401, error: "Unauthorized" };
  }
  return h;
}

export async function GET() {
  try {
    const h = await requireSession();
    const result = await auth.api.getTOTPURI({ body: {}, headers: h });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.error }, { status: error.status });
    console.error("[totp GET] failed:", error);
    return NextResponse.json({ error: "Failed to get TOTP URI" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const h = await requireSession();
    const { action, code, trustDevice, password } = await req.json();

    if (action === "enable") {
      const result = await auth.api.enableTwoFactor({
        body: password ? { password } : {},
        headers: h,
      });
      return NextResponse.json(result);
    }

    if (action === "uri") {
      const result = await auth.api.getTOTPURI({
        body: password ? { password } : {},
        headers: h,
      });
      return NextResponse.json(result);
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Code is required" }, { status: 400 });
      }
      const result = await auth.api.verifyTOTP({
        body: { code, trustDevice: trustDevice ?? true },
        headers: h,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.error }, { status: error.status });
    console.error("[totp POST] failed:", error);
    return NextResponse.json({ error: "Failed to process TOTP request" }, { status: 500 });
  }
}
