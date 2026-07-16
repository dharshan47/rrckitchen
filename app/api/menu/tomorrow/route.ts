import { NextResponse } from "next/server";
import { getTomorrowMenu } from "@/actions/catalog/menu";
import { redis } from "@/lib/redis";


const CACHE_TTL = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const foodType = url.searchParams.get("foodType") ?? "ALL";
    const timeSlot = url.searchParams.get("timeSlot") ?? "ALL";
    const bestseller = url.searchParams.get("bestseller") === "true";

    const cacheKey = `menu:tomorrow:${foodType}:${timeSlot}:${q || "all"}:bs${bestseller}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

    const menuItems = await getTomorrowMenu({ query: q, foodType, timeSlot, bestseller });

    await redis.set(cacheKey, JSON.parse(JSON.stringify(menuItems)), { ex: CACHE_TTL });

    return NextResponse.json(menuItems, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "Vercel-CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "Surrogate-Control": "public, max-age=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Failed to fetch tomorrow's menu:", error);
    return NextResponse.json(
      { error: "Failed to load menu. Please try again later." },
      { status: 500 }
    );
  }
}
