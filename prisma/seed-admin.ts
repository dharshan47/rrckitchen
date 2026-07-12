import "dotenv/config";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";

const ALL_PERMISSIONS: AdminPermission[] = [
  "MANAGE_ADMINS", "APPROVE_KYC", "MANAGE_CATALOG", "ISSUE_REFUNDS",
  "MANAGE_PAYOUTS", "MANAGE_COUPONS", "VIEW_FINANCIALS", "MANAGE_SUPPORT",
  "BAN_USERS", "MANAGE_CMS",
];

async function main() {
  const identifier = process.argv[2];
  if (!identifier) throw new Error("Usage: tsx prisma/seed-admin.ts <email-or-phone>");

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phoneNumber: identifier },
      ],
    },
  });

  if (!user) {
    console.log(`User with email/phone "${identifier}" not found.`);
    console.log("Available users:");
    const users = await prisma.user.findMany({ take: 10, select: { id: true, email: true, phoneNumber: true, name: true } });
    for (const u of users) {
      console.log(`  - ${u.email ?? u.phoneNumber ?? u.id} (${u.name ?? "no name"})`);
    }
    return;
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    }),
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
      create: { userId: user.id, roleId: adminRole.id },
      update: {},
    }),
    prisma.adminProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, permissions: ALL_PERMISSIONS },
      update: { permissions: ALL_PERMISSIONS },
    }),
  ]);
  console.log(`✅ ${user.email ?? user.phoneNumber ?? user.id} now has admin access — must complete 2FA setup on first login`);
}

main()
  .catch((e) => {
    console.error("Failed to seed admin:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
