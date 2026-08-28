import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const cacheKey = "home:testimonials";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        { data: cached },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            "X-Cache": "HIT",
          },
        }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { comment: { not: null } },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, fullName: true, image: true } },
        kitchenPartner: {
          select: {
            kitchenAlias: { select: { displayName: true } },
          },
        },
      },
    });

    const serialized = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user.fullName ?? r.user.name ?? "Happy Customer",
      userImage: r.user.image ?? null,
      kitchenName: r.kitchenPartner?.kitchenAlias?.displayName ?? null,
    }));

    await redis.set(cacheKey, serialized, { ex: 60 });

    return NextResponse.json(
      { data: serialized },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { error: "Failed to load testimonials." },
      { status: 500 }
    );
  }
}
