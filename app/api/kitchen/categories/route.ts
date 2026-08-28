import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const cacheKey = "kitchen:categories";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached as object, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      });
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            kitchenCategories: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const payload = categories.map((c) => ({
      id: c.id,
      name: c.name,
      kitchenCount: c._count.kitchenCategories,
      imageUrl: c.imageUrl,
    }));

    await redis.set(cacheKey, payload, { ex: 60 });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 },
    );
  }
}
