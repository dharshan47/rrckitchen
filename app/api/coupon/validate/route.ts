import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, cartTotal } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.minOrderValue && cartTotal < Number(coupon.minOrderValue)) {
      return NextResponse.json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` }, { status: 400 });
    }

    if (coupon.usageLimitTotal) {
      const redemptionCount = await prisma.couponRedemption.count({
        where: { couponId: coupon.id },
      });
      if (redemptionCount >= coupon.usageLimitTotal) {
        return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
      }
    }

    if (coupon.usageLimitPerUser) {
      const userRedemptionCount = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId: session.user.id },
      });
      if (userRedemptionCount >= coupon.usageLimitPerUser) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
      }
    }

    let discount = 0;
    let discountType: "PERCENTAGE" | "FIXED" = "FIXED";

    if (coupon.discountType === "PERCENTAGE") {
      discountType = "PERCENTAGE";
      discount = Math.min(
        Math.round((cartTotal * Number(coupon.discountValue)) / 100),
        Number(coupon.maxDiscount ?? Infinity)
      );
    } else {
      discount = Number(coupon.discountValue);
    }

    if (discount > cartTotal) {
      discount = cartTotal;
    }

    return NextResponse.json({
      code: coupon.code,
      discount,
      type: discountType,
      description: coupon.description ?? undefined,
    });
  } catch (error) {
    console.error("[Coupon] Validate failed:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
