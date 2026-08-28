import { NextRequest, NextResponse } from "next/server";
import type { Coupon } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { cartTotal } = await req.json();

    const now = new Date();
    const cacheKey = "coupon:offers:platform";
    const cached = await redis.get(cacheKey);
    const coupons: Coupon[] = cached
      ? (cached as unknown as Coupon[])
      : await prisma.coupon.findMany({
          where: {
            isActive: true,
            validFrom: { lte: now },
            validTo: { gte: now },
            scope: "PLATFORM",
          },
          orderBy: { discountValue: "desc" },
          take: 10,
        });

    if (!cached) {
      await redis.set(cacheKey, coupons, { ex: 30 });
    }

    const available = coupons
      .filter((c) => !c.minOrderValue || cartTotal >= Number(c.minOrderValue))
      .slice(0, 5)
      .map((c) => ({
        code: c.code,
        description: c.description ?? "",
        discountValue: Number(c.discountValue),
        discountType: c.discountType,
        minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
      }));

    return NextResponse.json({ coupons: available });
  } catch (error) {
    console.error("[Coupon Offers] Failed:", error);
    return NextResponse.json({ coupons: [] });
  }
}