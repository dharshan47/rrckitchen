import { NextRequest, NextResponse } from "next/server";
import type { Coupon, PaymentOffer, LoyaltyCoupon } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    await req.json().catch(() => {}); // parse body to avoid unconsumed body issues if any

    const now = new Date();
    const couponCacheKey = "coupon:offers:platform";
    const paymentOfferCacheKey = "payment:offers:active";
    const loyaltyCouponCacheKey = "loyalty:coupons:active";
    
    const [cachedCoupons, cachedPaymentOffers, cachedLoyaltyCoupons] = await Promise.all([
      redis.get(couponCacheKey),
      redis.get(paymentOfferCacheKey),
      redis.get(loyaltyCouponCacheKey)
    ]);

    const fetchCoupons = cachedCoupons
      ? Promise.resolve(cachedCoupons as unknown as Coupon[])
      : prisma.coupon.findMany({
          where: {
            isActive: true,
            validFrom: { lte: now },
            validTo: { gte: now },
            scope: "PLATFORM",
          },
          orderBy: { discountValue: "desc" },
          take: 10,
        });

    const fetchPaymentOffers = cachedPaymentOffers
      ? Promise.resolve(cachedPaymentOffers as unknown as PaymentOffer[])
      : prisma.paymentOffer.findMany({
          where: {
            isActive: true,
            validFrom: { lte: now },
            validTo: { gte: now },
          },
          orderBy: { discountValue: "desc" },
          take: 10,
        });

    const fetchLoyaltyCoupons = cachedLoyaltyCoupons
      ? Promise.resolve(cachedLoyaltyCoupons as unknown as LoyaltyCoupon[])
      : prisma.loyaltyCoupon.findMany({
          where: {
            isActive: true,
          },
          orderBy: { discountValue: "desc" },
          take: 10,
        });

    const [coupons, paymentOffers, loyaltyCoupons] = await Promise.all([fetchCoupons, fetchPaymentOffers, fetchLoyaltyCoupons]);

    if (!cachedCoupons) {
      await redis.set(couponCacheKey, coupons, { ex: 2 });
    }
    if (!cachedPaymentOffers) {
      await redis.set(paymentOfferCacheKey, paymentOffers, { ex: 2 });
    }
    if (!cachedLoyaltyCoupons) {
      await redis.set(loyaltyCouponCacheKey, loyaltyCoupons, { ex: 2 });
    }

    const availableCoupons = coupons
      .slice(0, 10)
      .map((c) => ({
        code: c.code,
        description: c.description ?? "",
        discountValue: Number(c.discountValue),
        discountType: c.discountType,
        minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
      }));

    const availablePaymentOffers = paymentOffers
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        offerType: p.offerType,
        discountType: p.discountType,
        discountValue: Number(p.discountValue),
        maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
        minOrderValue: p.minOrderValue ? Number(p.minOrderValue) : null,
      }));

    const availableLoyaltyCoupons = loyaltyCoupons
      .slice(0, 10)
      .map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description ?? "",
        discountType: l.discountType,
        discountValue: Number(l.discountValue),
        maxDiscount: l.maxDiscount ? Number(l.maxDiscount) : null,
        minOrderValue: l.minOrderValue ? Number(l.minOrderValue) : null,
        pointsCost: l.pointsCost,
      }));

    return NextResponse.json({ 
      coupons: availableCoupons, 
      paymentOffers: availablePaymentOffers,
      loyaltyCoupons: availableLoyaltyCoupons
    });
  } catch (error) {
    console.error("[Coupon Offers] Failed:", error);
    return NextResponse.json({ coupons: [], paymentOffers: [], loyaltyCoupons: [] });
  }
}