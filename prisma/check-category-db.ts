import prisma from "../lib/prisma";

async function main() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  console.log("ACTIVE CATEGORIES:", JSON.stringify(categories));
}

main()
  .catch((e) => {
    console.error("FULL ERROR:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
