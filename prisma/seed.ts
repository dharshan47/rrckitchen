import "dotenv/config";
import prisma from "../lib/prisma";

const roles = ["CUSTOMER", "KITCHENPARTNER", "DELIVERYPARTNER", "ADMIN", "SUPPORTAGENT"] as const;

const cuisineCategories = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Chettinad",
  "Home Food",
  "Bakery",
  "Asian",
  "Snacks",
  "Desserts",
  "Beverages",
  "Biryani",
  "Parotta",
  "Dosa",
  "Idli",
  "Vada",
  "Momos",
];

async function main() {
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log("Roles seeded successfully");

  for (const name of cuisineCategories) {
    await prisma.category.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log("Cuisine categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
