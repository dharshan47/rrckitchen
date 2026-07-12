/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionHeaders() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return h;
}

export async function GET() {
  try {
    const h = await getSessionHeaders();
    const result = await auth.api.getTOTPURI({ body: {}, headers: h });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[totp GET] failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message === "Unauthorized" ? "Unauthorized" : "Failed to get TOTP URI" },
      { status: error?.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const h = await getSessionHeaders();
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
    console.error("[totp POST] failed:", error?.message || error);
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: error?.message || "Failed to process TOTP request" },
      { status }
    );
  }
}
