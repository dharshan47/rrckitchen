import { HomeClient } from "@/components/home/home-client";
import { getHomePageData } from "@/actions/catalog/home-data";
import { getTomorrowMenu } from "@/actions/catalog/menu";
import { getSession } from "@/lib/auth-server";

function serializeMenuItems(items: Awaited<ReturnType<typeof getTomorrowMenu>>) {
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

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user?.id;

  const [homeData, menuItems] = await Promise.all([
    getHomePageData(userId),
    getTomorrowMenu({ foodType: "ALL", timeSlot: "ALL" }).then(serializeMenuItems),
  ]);

  return (
    <HomeClient
      topRatedKitchens={homeData.topRatedKitchens}
      newKitchens={homeData.newKitchens}
      recentOrderKitchens={homeData.recentOrderKitchens}
      initialMenuItems={menuItems}
    />
  );
}
