import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/menu/category-page-client";
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

  return <CategoryPageClient slug={slug} timeSlot={timeSlot} />;
}
