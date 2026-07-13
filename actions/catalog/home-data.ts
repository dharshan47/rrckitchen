import prisma from "@/lib/prisma";
import { cached } from "@/lib/server-cache";

export interface HomePageData {
  topRatedKitchens: Array<{
    id: string;
    displayName: string;
    avgRating: number | null;
    totalReviews: number;
    imageUrl: string | null;
  }>;
  newKitchens: Array<{
    id: string;
    displayName: string;
    createdAt: string;
    imageUrl: string | null;
  }>;
  recentOrderKitchens: Array<{
    id: string;
    displayName: string;
    imageUrl: string | null;
  }>;
}

export async function getKitchenData() {
  return cached("getKitchenData", 30_000, () => _getKitchenData());
}

async function _getKitchenData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [topRated, newKitchensData] = await Promise.all([
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      include: {
        kitchenAlias: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] }, createdAt: { gte: thirtyDaysAgo } },
      include: { kitchenAlias: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const topRatedKitchens = topRated
    .map((k) => {
      const avgRating =
        k.reviews.length > 0
          ? k.reviews.reduce((s, r) => s + r.rating, 0) / k.reviews.length
          : null;
      return {
        id: k.id,
        displayName: k.kitchenAlias?.displayName ?? "Kitchen",
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: k._count.reviews,
        imageUrl: null,
      };
    })
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 6);

  const newKitchens = newKitchensData.map((k) => ({
    id: k.id,
    displayName: k.kitchenAlias?.displayName ?? "New Kitchen",
    createdAt: k.createdAt.toISOString(),
    imageUrl: null,
  }));

  return { topRatedKitchens, newKitchens };
}

export async function getRecentOrderKitchens(userId?: string) {
  if (!userId) return [];

  const recentOrders = await prisma.order.findMany({
    where: { userId, payment: { status: "SUCCESS" } },
    include: {
      orderItems: {
        include: { kitchenPartner: { include: { kitchenAlias: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    distinct: ["id"],
  });

  const seen = new Set<string>();
  const kitchens: Array<{ id: string; displayName: string; imageUrl: string | null }> = [];
  for (const order of recentOrders) {
    const kp = order.orderItems[0]?.kitchenPartner;
    if (kp && !seen.has(kp.id)) {
      seen.add(kp.id);
      kitchens.push({
        id: kp.id,
        displayName: kp.kitchenAlias?.displayName ?? "Kitchen",
        imageUrl: null,
      });
    }
  }
  return kitchens;
}

export async function getHomePageData(userId?: string): Promise<HomePageData> {
  const [kitchenData, recentOrderKitchens] = await Promise.all([
    getKitchenData(),
    getRecentOrderKitchens(userId),
  ]);
  return { ...kitchenData, recentOrderKitchens };
}
