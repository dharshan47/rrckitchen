import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/menu/category-page-client";
import { getTomorrowMenu } from "@/actions/catalog/menu";

const slugToTimeSlot: Record<string, string> = {
  breakfast: "MORNING",
  lunch: "LUNCH",
  "evening-snacks": "EVENINGSNACKS",
  dinner: "DINNER",
};

const slugLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  "evening-snacks": "Evening Snacks",
  dinner: "Dinner",
};

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slugLabels[slug];
  if (!label) return { title: "Category Not Found" };
  return {
    title: `Buy ${label} Foods`,
    description: `Order delicious ${label.toLowerCase()} meals for tomorrow from RRC Kitchen. Browse home-cooked options and order now.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const timeSlot = slugToTimeSlot[slug];

  if (!timeSlot) notFound();

  const menuItems = await getTomorrowMenu({ foodType: "ALL", timeSlot }).then(serializeMenuItems);

  return <CategoryPageClient slug={slug} timeSlot={timeSlot} initialMenuItems={menuItems} />;
}
