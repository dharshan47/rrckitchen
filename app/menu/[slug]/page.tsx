import { getMenuItemBySlug } from "@/actions/catalog/menu";
import { notFound } from "next/navigation";
import { MenuItemDetail } from "@/components/menu/menu-item-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);
  if (!item) return { title: "Item Not Found" };
  return {
    title: `${item.name}`,
    description: item.description ?? `Order ${item.name} for tomorrow from RRC Kitchen.`,
  };
}

export default async function MenuItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);

  if (!item) notFound();

  return <MenuItemDetail item={item} />;
}