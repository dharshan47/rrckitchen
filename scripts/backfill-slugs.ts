import prisma from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

async function main() {
  const existingSlugs = new Set<string>();

  const kitchens = await prisma.kitchenPartner.findMany({
    include: { kitchenAlias: true },
  });
  for (const kitchen of kitchens) {
    const base = kitchen.kitchenAlias?.displayName ?? "kitchen";
    const slug = uniqueSlug(base, existingSlugs);
    await prisma.kitchenPartner.update({
      where: { id: kitchen.id },
      data: { slug },
    });
    console.log(`Kitchen ${kitchen.id} -> ${slug}`);
  }

  const menuItems = await prisma.menuItem.findMany();
  for (const item of menuItems) {
    const slug = uniqueSlug(item.name, existingSlugs);
    await prisma.menuItem.update({
      where: { id: item.id },
      data: { slug },
    });
    console.log(`MenuItem ${item.id} -> ${slug}`);
  }

  console.log("Done backfilling slugs");
}

main().catch(console.error);