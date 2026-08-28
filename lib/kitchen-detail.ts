import prisma from "@/lib/prisma";
import { toTitleCase } from "@/lib/utils";
import type { OperatingHours } from "@/components/kitchen/kitchen-timing-display";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

export async function queryKitchenDetail(kitchenSlug: string): Promise<KitchenDetail | null> {
  const kitchen = await prisma.kitchenPartner.findFirst({
    where: {
      OR: [
        { slug: kitchenSlug },
        { kitchenAlias: { displayName: { equals: kitchenSlug.replace(/-/g, " "), mode: "insensitive" } } },
      ],
      status: { in: ["APPROVED", "ACTIVE"] },
    },
    include: {
      kitchenAlias: true,
      menus: {
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isAvailable: true },
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              price: true,
              compareAtPrice: true,
              foodType: true,
              timeSlot: true,
              avgRating: true,
              totalReviews: true,
              deliveryFee: true,
              freeDelivery: true,
              photos: { orderBy: { sortOrder: "asc" } },
              _count: { select: { orderItems: true } },
            },
            orderBy: { name: "asc" },
          },
        },
      },
      kitchenCategories: { include: { category: true } },
      kitchenKyc: {
        select: {
          fssaiNumber: true,
          fssaiValidTill: true,
          gstNumber: true,
        },
      },
      kitchenAddress: true,
    },
  });

  if (!kitchen) return null;

  const avgRating = kitchen.avgRating ? Number(kitchen.avgRating) : null;

  const allItems = kitchen.menus.flatMap((m) => m.menuItems);
  const firstPhoto = allItems.find((i) => i.photos.length > 0)?.photos[0]?.imageUrl;

  const sortedByOrders = [...allItems].sort((a, b) => b._count.orderItems - a._count.orderItems);
  const bestsellerThreshold = sortedByOrders.length > 0 ? sortedByOrders[0]._count.orderItems : 0;
  const isBestseller = (orderCount: number) => orderCount > 0 && orderCount >= bestsellerThreshold * 0.6;

  const cuisineTags = kitchen.kitchenCategories.map((kc) => toTitleCase(kc.category.name));

  // Real stats computed from actual data
  const totalOrdersDelivered = allItems.reduce((sum, i) => sum + i._count.orderItems, 0);
  const hasPureVeg = allItems.length > 0 && allItems.every((i) => i.foodType === "VEG");
  const kitchenCreatedAt = kitchen.createdAt.toISOString();

  // Compute time on platform
  const monthsOnPlatform = Math.max(1, Math.floor((Date.now() - kitchen.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  const timeOnPlatform = monthsOnPlatform >= 12
    ? `${Math.floor(monthsOnPlatform / 12)}+ Year${Math.floor(monthsOnPlatform / 12) > 1 ? "s" : ""}`
    : `${monthsOnPlatform}+ Month${monthsOnPlatform > 1 ? "s" : ""}`;

  return {
    id: kitchen.id,
    slug: kitchen.slug,
    displayName: toTitleCase(kitchen.kitchenAlias?.displayName ?? kitchen.slug),
    avgRating,
    totalReviews: kitchen.totalReviews,
    imageUrl: firstPhoto ?? null,
    kpProfileImageUrl: kitchen.kitchenAlias?.imageUrl ?? null,
    cuisineTags,
    operatingHours: kitchen.operatingHours as OperatingHours | null,
    estimatedPrepTime: kitchen.estimatedPrepTime,
    costForTwo: undefined,
    totalOrdersDelivered,
    hasPureVeg,
    kitchenCreatedAt,
    timeOnPlatform,
    address: kitchen.kitchenAddress,
    description: kitchen.kitchenAlias?.description,
    fssaiNumber: kitchen.kitchenKyc?.fssaiNumber ?? null,
    fssaiValidTill: kitchen.kitchenKyc?.fssaiValidTill?.toISOString() ?? null,
    gstNumber: kitchen.kitchenKyc?.gstNumber ?? null,
    kitchenId: kitchen.publicCode ? `KK-${kitchen.publicCode}` : null,
    minOrder: kitchen.minOrder ?? null,
    deliveryRadiusKm: kitchen.deliveryRadiusKm ?? null,
    items: allItems.map((i) => ({
      id: i.id,
      slug: i.slug ?? i.id,
      shortId: i.id.substring(0, 8),
      kitchenSlug: kitchen.slug,
      name: i.name,
      description: i.description,
      price: Number(i.price),
      compareAtPrice: i.compareAtPrice ? Number(i.compareAtPrice) : null,
      foodType: i.foodType,
      timeSlot: i.timeSlot,
      imageUrl: i.photos[0]?.imageUrl,
      photos: i.photos.map((p) => ({ imageUrl: p.imageUrl, sortOrder: p.sortOrder })),
      kitchenName: toTitleCase(kitchen.kitchenAlias?.displayName ?? kitchen.slug),
      orderCount: i._count.orderItems,
      isBestseller: isBestseller(i._count.orderItems),
      avgRating: i.avgRating ? Number(i.avgRating) : null,
      totalReviews: i.totalReviews,
      deliveryFee: i.deliveryFee ? Number(i.deliveryFee) : null,
      freeDelivery: i.freeDelivery,
    })),
  };
}
