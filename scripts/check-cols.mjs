import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });
p.$queryRawUnsafe(
  "SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('search_page_content','search_page_badge') ORDER BY table_name"
)
  .then((r) => {
    console.log(JSON.stringify(r));
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });