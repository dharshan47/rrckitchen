import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const countersToSeed = [
    { id: "cnt-tkt", prefix: "TKT", sequence: 0, digits: 8 },
    { id: "cnt-gst", prefix: "GST", sequence: 0, digits: 9 },
  ];

  for (const counter of countersToSeed) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "public_id_counter" ("id", "prefix", "sequence", "digits")
        VALUES (${counter.id}, ${counter.prefix}, ${counter.sequence}, ${counter.digits})
        ON CONFLICT ("prefix") DO NOTHING
      `;
      console.log(`Seeded counter for ${counter.prefix}`);
    } catch (err) {
      console.error(`Failed to seed counter for ${counter.prefix}`, err);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
