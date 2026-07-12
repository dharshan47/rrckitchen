import "dotenv/config";
import prisma from "@/lib/prisma";

async function main() {
  const identifier = process.argv[2];
  const newPassword = process.argv[3];
  if (!identifier || !newPassword) {
    throw new Error("Usage: tsx prisma/set-password.ts <email-or-phone> <new-password>");
  }

  const phoneRegex = /^\d{10}$/;
  const isPhone = phoneRegex.test(identifier);

  const user = await prisma.user.findFirst({
    where: isPhone ? { phoneNumber: identifier } : { email: identifier },
    select: { id: true, email: true, phoneNumber: true },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const { hashPassword } = await import("better-auth/crypto");
  const hashed = await hashPassword(newPassword);

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashed },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashed,
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  console.log(`✅ Password set for ${user.email ?? user.phoneNumber}`);
  console.log("Now go to /admin/2fa-setup and enter that password");
}

main()
  .catch((e) => {
    console.error("Failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
