import prisma from "../lib/prisma";

async function main() {
  const r = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'cravings%'"
  );
  console.log("TABLES", JSON.stringify(r));
  const e = await prisma.$queryRawUnsafe(
    "SELECT typname FROM pg_type WHERE typname = 'CravingsPriority'"
  );
  console.log("ENUM", JSON.stringify(e));
  process.exit(0);
}
void main();