import { Metadata } from "next";
import { AboutUsClient } from "@/components/about/about-us-client";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "About Us | RRC Kitchen",
  description: "Learn more about RRC Kitchen, our mission, values, and how we connect you with passionate home chefs.",
};

const getStats = unstable_cache(
  async () => {
    try {
      const [chefsCount, customersCount, ordersCount] = await Promise.all([
        prisma.kitchenPartner.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
        prisma.user.count({ where: { role: { in: ["customer", "CUSTOMER"] } } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),
      ]);
      return { chefsCount, customersCount, ordersCount };
    } catch (error) {
      console.error("Failed to fetch about us stats", error);
      return { chefsCount: 0, customersCount: 0, ordersCount: 0 };
    }
  },
  ["about-us-stats"],
  { revalidate: 3600 }
);

export default async function AboutUsPage() {
  const stats = await getStats();
  return <AboutUsClient stats={stats} />;
}
