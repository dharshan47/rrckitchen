import { NextRequest, NextResponse } from "next/server";
import { sendOtpSms } from "@/lib/twilio";
import prisma from "@/lib/prisma";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpCode.updateMany({
      where: { mobileNumber: mobile, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    await prisma.otpCode.create({
      data: { mobileNumber: mobile, code: otp, expiresAt },
    });

    const result = await sendOtpSms(mobile, otp);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send OTP" }, { status: 400 });
    }

    return NextResponse.json({ status: true, messageId: result.messageId, message: "OTP sent" });
  } catch (error) {
    console.error("[OTP_SEND] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
