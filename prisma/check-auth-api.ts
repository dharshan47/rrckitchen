/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function main() {
  const methods = Object.keys(auth.api).filter(
    (k) =>
      k.toLowerCase().includes("password") ||
      k.toLowerCase().includes("2fa") ||
      k.toLowerCase().includes("two") ||
      k.toLowerCase().includes("admin") ||
      k.toLowerCase().includes("user")
  );
  console.log("Available auth.api methods:", methods);

  const result = await auth.api.setUserPassword?.({
    body: { userId: "", newPassword: "test123", currentPassword: "" },
    headers: new Headers(),
  } as any);
  console.log("setUserPassword result:", result);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
