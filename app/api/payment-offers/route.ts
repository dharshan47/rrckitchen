import { NextRequest, NextResponse } from "next/server";
import type { PaymentOffer } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { cartTotal } = await req.json();

    const now = new Date();
    const cacheKey = "payment:offers:all";
    const cached = await redis.get(cacheKey);
    const offers: PaymentOffer[] = cached
      ? (cached as unknown as PaymentOffer[])
      : await prisma.paymentOffer.findMany({
          where: {
            isActive: true,
            validFrom: { lte: now },
            validTo: { gte: now },
          },
          orderBy: { discountValue: "desc" },
          take: 10,
        });

    if (!cached) {
      await redis.set(cacheKey, offers, { ex: 30 });
    }

    const available = offers
      .filter((o) => !o.minOrderValue || cartTotal >= Number(o.minOrderValue))
      .map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description ?? "",
        offerType: o.offerType,
        discountValue: Number(o.discountValue),
        discountType: o.discountType,
        maxDiscount: o.maxDiscount ? Number(o.maxDiscount) : null,
        minOrderValue: o.minOrderValue ? Number(o.minOrderValue) : null,
      }));

    return NextResponse.json({ offers: available });
  } catch (error) {
    console.error("[Payment Offers] Failed:", error);
    return NextResponse.json({ offers: [] });
  }
}
