import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return value;
}

async function signSessionToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign(
    { name: "HMAC", hash: "SHA-256" },
    key,
    encoder.encode(token),
  );
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
  return `${token}.${sigBase64}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp, phoneNumber } = body;

    if (!otp || !phoneNumber) {
      return NextResponse.json({ error: "OTP and phone number are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        mobileNumber: phoneNumber,
        code: otp,
        consumedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    const normalizedPhone = normalizePhone(phoneNumber);

    let user = await prisma.user.findFirst({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          phoneNumberVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumberVerified: true },
      });
    }

    const sessionToken = crypto.randomUUID();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const isSecure = process.env.NODE_ENV === "production";
    const prefix = isSecure ? "__Secure-" : "";
    const cookieName = `${prefix}better-auth.session_token`;

    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      throw new Error("BETTER_AUTH_SECRET environment variable is not set");
    }
    const signedToken = await signSessionToken(sessionToken, secret);

    const cookieStore = await cookies();
    cookieStore.set(cookieName, signedToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      status: true,
      token: sessionToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        phoneNumberVerified: user.phoneNumberVerified,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[OTP_VERIFY] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
