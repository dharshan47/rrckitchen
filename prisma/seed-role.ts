/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import prisma from "@/lib/prisma";

async function main() {
  const identifier = process.argv[2];
  const roleName = process.argv[3];
  if (!identifier || !roleName) {
    throw new Error("Usage: tsx prisma/seed-role.ts <email-or-phone> <role-name>");
  }

  const phoneRegex = /^\d{10}$/;
  const isPhone = phoneRegex.test(identifier);

  const user = await prisma.user.findFirst({
    where: isPhone ? { phoneNumber: identifier } : { email: identifier },
  });

  if (!user) {
    console.log(`User with ${isPhone ? "phone" : "email"} "${identifier}" not found.`);
    const users = await prisma.user.findMany({ take: 20, select: { id: true, email: true, phoneNumber: true, name: true } });
    for (const u of users) {
      console.log(`  - ${u.email ?? u.phoneNumber ?? u.id} (${u.name ?? "no name"})`);
    }
    return;
  }

  const role = await prisma.role.findUnique({ where: { name: roleName as any } });
  if (!role) {
    console.log(`Role "${roleName}" not found. Available roles:`);
    const roles = await prisma.role.findMany();
    for (const r of roles) {
      console.log(`  - ${r.name}`);
    }
    return;
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    create: { userId: user.id, roleId: role.id },
    update: {},
  });

  console.log(`✅ ${user.email ?? user.phoneNumber ?? user.id} now has role "${roleName}"`);
}

main()
  .catch((e) => {
    console.error("Failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
