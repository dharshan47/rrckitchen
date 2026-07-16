import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCategoryImageUrl } from "@/lib/category-images";


export async function GET() {
  try {
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

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        kitchenCount: c._count.kitchenCategories,
        imageUrl: getCategoryImageUrl(c.name),
      })),
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 },
    );
  }
}
