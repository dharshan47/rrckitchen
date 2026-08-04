"use server";

import prisma from "@/lib/prisma";

export async function getKitchenReviews(kitchenId: string) {
  const reviews = await prisma.review.findMany({
    where: { kitchenPartnerId: kitchenId },
    include: {
      user: {
        select: {
          name: true,
          fullName: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    tasteRating: r.tasteRating,
    packagingRating: r.packagingRating,
    portionSizeRating: r.portionSizeRating,
    comment: r.comment,
    mediaUrls: r.mediaUrls,
    createdAt: r.createdAt.toISOString(),
    user: {
      name: r.user?.fullName ?? r.user?.name ?? null,
      image: r.user?.image || null,
    },
  }));
}
