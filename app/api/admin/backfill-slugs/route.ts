import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function POST() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { slug: null },
      select: { id: true, name: true },
    });

    const existingSlugs = new Set(
      (await prisma.menuItem.findMany({ select: { slug: true } }))
        .map(i => i.slug)
        .filter(Boolean) as string[]
    );

    let updated = 0;
    for (const item of items) {
      let slug = slugify(item.name, { lower: true, strict: true });
      if (!slug) slug = "item";
      let candidate = slug;
      let counter = 1;
      while (existingSlugs.has(candidate)) {
        candidate = `${slug}-${counter}`;
        counter++;
      }
      existingSlugs.add(candidate);

      await prisma.menuItem.update({
        where: { id: item.id },
        data: { slug: candidate },
      });
      updated++;
    }

    return NextResponse.json({ updated, total: items.length });
  } catch (error) {
    console.error("[Backfill] Failed:", error);
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
