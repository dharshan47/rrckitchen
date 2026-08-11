"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

const RECENCY_WEIGHT = 0.15;

export async function submitKitchenReview(input: {
  orderId: string;
  kitchenPartnerId: string;
  rating: number;
  tasteRating?: number;
  packagingRating?: number;
  portionSizeRating?: number;
  comment?: string;
  tags?: string[];
  mediaUrls?: string[];
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const { orderId, kitchenPartnerId, rating, tasteRating, packagingRating, portionSizeRating, comment, mediaUrls } = input;

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        orderId,
        userId: session.user.id,
        kitchenPartnerId,
        rating,
        tasteRating,
        packagingRating,
        portionSizeRating,
        comment,
        mediaUrls,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    const kitchen = await tx.kitchenPartner.findUniqueOrThrow({
      where: { id: kitchenPartnerId },
    });

    const newAvg = kitchen.avgRating
      ? Number(kitchen.avgRating) * (1 - RECENCY_WEIGHT) + rating * RECENCY_WEIGHT
      : rating;

    await tx.kitchenPartner.update({
      where: { id: kitchenPartnerId },
      data: {
        avgRating: newAvg,
        totalReviews: { increment: 1 },
      },
    });
  });

  return { success: true };
}

export async function submitDeliveryReview(input: {
  orderId: string;
  deliveryPartnerId: string;
  rating: number;
  speedRating?: number;
  behaviorHygiene?: boolean;
  safetyContactless?: boolean;
  comment?: string;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const { orderId, deliveryPartnerId, rating, speedRating, behaviorHygiene, safetyContactless, comment } = input;

  await prisma.$transaction(async (tx) => {
    await tx.deliveryReview.create({
      data: {
        orderId,
        userId: session.user.id,
        deliveryPartnerId,
        rating,
        speedRating,
        behaviorHygiene,
        safetyContactless,
        comment,
      },
    });

    const partner = await tx.deliveryPartner.findUniqueOrThrow({
      where: { id: deliveryPartnerId },
    });

    const newAvg = partner.avgRating
      ? Number(partner.avgRating) * (1 - RECENCY_WEIGHT) + rating * RECENCY_WEIGHT
      : rating;

    await tx.deliveryPartner.update({
      where: { id: deliveryPartnerId },
      data: {
        avgRating: newAvg,
        totalReviews: { increment: 1 },
      },
    });
  });

  return { success: true };
}
