import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kitchenPartnerId = searchParams.get("kitchenPartnerId");

    const now = new Date();
    const platformFilter: Prisma.CouponWhereInput = { scope: "PLATFORM" };
    const kitchenFilter: Prisma.CouponWhereInput = { scope: "KITCHEN_SPECIFIC", kitchenPartnerId };
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
        OR: [
          platformFilter,
          ...(kitchenPartnerId ? [kitchenFilter] : []),
        ],
      },
      orderBy: { discountValue: "desc" },
      take: 10,
    });

    const offers = coupons.slice(0, 5).map((c) => ({
      code: c.code,
      description: c.description ?? "",
      discountValue: Number(c.discountValue),
      discountType: c.discountType,
      minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
    }));

    return NextResponse.json({ coupons: offers });
  } catch (error) {
    console.error("[Kitchen Coupons] Failed:", error);
    return NextResponse.json({ coupons: [] });
  }
}
