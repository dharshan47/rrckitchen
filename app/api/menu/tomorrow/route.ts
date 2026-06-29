import { NextResponse } from "next/server";
import { getTomorrowMenu } from "@/actions/menu";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const foodType = url.searchParams.get("foodType") ?? "ALL";
    const timeSlot = url.searchParams.get("timeSlot") ?? "ALL";

    const menuItems = await getTomorrowMenu({ query: q, foodType, timeSlot });

    return NextResponse.json(menuItems, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
