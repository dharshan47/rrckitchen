import "dotenv/config";
import prisma from "@/lib/prisma";
import { PUBLIC_ID_SPECS, allocatePublicCode } from "@/lib/public-id";

async function main() {
  try {
    const ticket = await prisma.$transaction(async (tx) => {
      return await tx.supportTicket.create({
        data: {
          publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.SUPPORT_TICKET),
          subject: "Test Subject",
          description: "Test description",
          category: "other",
          priority: "MEDIUM",
          mediaUrls: ["https://example.com/image.jpg"],
        },
      });
    });
    console.log("Ticket created successfully:", ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
  }
}

main().finally(() => prisma.$disconnect());
