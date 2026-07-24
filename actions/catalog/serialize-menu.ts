import type { getTomorrowMenu } from "@/actions/catalog/menu";

export function serializeMenuItems(items: Awaited<ReturnType<typeof getTomorrowMenu>>) {
  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    avgRating: item.avgRating ? Number(item.avgRating) : null,
    totalReviews: item.totalReviews,
    menu: item.menu
      ? {
          ...item.menu,
          kitchenPartner: item.menu.kitchenPartner
            ? {
                ...item.menu.kitchenPartner,
              }
            : null,
        }
      : null,
    photos: item.photos.map((p) => ({
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    })),
  }));
}
