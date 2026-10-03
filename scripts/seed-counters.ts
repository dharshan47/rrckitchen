import "dotenv/config";
import prisma from "@/lib/prisma";
import { PUBLIC_ID_SPECS } from "@/lib/public-id";

async function main() {
  for (const [key, spec] of Object.entries(PUBLIC_ID_SPECS)) {
    await prisma.publicIdCounter.upsert({
      where: { prefix: spec.prefix },
      create: { prefix: spec.prefix, sequence: 0, digits: spec.digits },
      update: {},
    });
    console.log(`Ensured counter for ${key} (prefix: ${spec.prefix})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
