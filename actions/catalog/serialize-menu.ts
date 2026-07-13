import type { getTomorrowMenu } from "@/actions/catalog/menu";

export function serializeMenuItems(items: Awaited<ReturnType<typeof getTomorrowMenu>>) {
  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
    menu: item.menu
      ? {
          ...item.menu,
          kitchenPartner: item.menu.kitchenPartner
            ? {
                ...item.menu.kitchenPartner,
                avgRating: item.menu.kitchenPartner.avgRating
                  ? Number(item.menu.kitchenPartner.avgRating)
                  : null,
                totalReviews: item.menu.kitchenPartner.totalReviews,
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
