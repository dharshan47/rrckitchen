import "dotenv/config";
import prisma from "../lib/prisma";

const roles = ["CUSTOMER", "KITCHENPARTNER", "DELIVERYPARTNER", "ADMIN", "SUPPORTAGENT"] as const;

const cuisineCategories = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Chettinadu",
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

const serviceZones = [
  {
    name: "Thanjavur",
    pincodes: [
      "613001", "613002", "613003", "613004", "613005",
      "613006", "613007", "613008", "613009", "613010",
      "613102", "613303", "613401", "613402", "613403",
      "613501", "613601", "613602", "614019", "614206",
      "614904",
    ],
  },
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

  for (const zone of serviceZones) {
    await prisma.serviceZone.upsert({
      where: { name: zone.name },
      create: { name: zone.name, pincodes: zone.pincodes },
      update: { pincodes: zone.pincodes },
    });
  }
  console.log("Service zones seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
