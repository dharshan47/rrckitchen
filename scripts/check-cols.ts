import prisma from "../lib/prisma";

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('search_page_content','search_page_badge') ORDER BY table_name"
  );
  console.log(JSON.stringify(rows));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });