"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function submitMenuItemReview(input: {
  orderItemId: string;
  rating: number;
  comment?: string;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: input.orderItemId },
    select: {
      id: true,
      orderId: true,
      menuItemId: true,
      order: { select: { userId: true } },
    },
  });

  if (!orderItem) throw new Error("Order item not found");
  if (orderItem.order.userId !== session.user.id) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.menuItemReview.create({
      data: {
        orderId: orderItem.orderId,
        orderItemId: orderItem.id,
        userId: session.user.id,
        menuItemId: orderItem.menuItemId,
        rating: input.rating,
        comment: input.comment,
      },
    });

    const agg = await tx.menuItemReview.aggregate({
      where: { menuItemId: orderItem.menuItemId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.menuItem.update({
      where: { id: orderItem.menuItemId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        totalReviews: agg._count,
      },
    });
  });

  return { success: true };
}
