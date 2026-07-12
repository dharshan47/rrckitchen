import "dotenv/config";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";

const ALL_PERMISSIONS: AdminPermission[] = [
  "MANAGE_ADMINS", "APPROVE_KYC", "MANAGE_CATALOG", "ISSUE_REFUNDS",
  "MANAGE_PAYOUTS", "MANAGE_COUPONS", "VIEW_FINANCIALS", "MANAGE_SUPPORT",
  "BAN_USERS", "MANAGE_CMS",
];

async function main() {
  const email = process.argv[2];
  const phone = process.argv[3];
  if (!email) throw new Error("Usage: tsx prisma/create-admin.ts <email> [phone]");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user && phone) {
    user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone ?? null,
        name: email.split("@")[0],
        emailVerified: true,
        role: "customer",
      },
    });
    console.log(`Created user: ${email}`);
  } else {
    console.log(`Found existing user: ${user.email ?? user.phoneNumber}`);
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

  console.log(`✅ ${email} now has ADMIN access — login with this email`);
}

main()
  .catch((e) => {
    console.error("Failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
