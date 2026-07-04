import "dotenv/config";
import prisma from "../lib/prisma";

const roles = ["CUSTOMER", "KITCHENPARTNER", "DELIVERYPARTNER", "ADMIN", "SUPPORTAGENT"] as const;

async function main() {
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log("Roles seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
