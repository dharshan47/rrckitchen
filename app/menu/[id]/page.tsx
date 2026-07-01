import { getMenuItemById } from "@/actions/menu";
import { notFound } from "next/navigation";
import { MenuItemDetail } from "@/components/menu/menu-item-detail";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMenuItemById(id);
  if (!item) return { title: "Item Not Found — RrcKitchen" };
  return {
    title: `${item.name} — RrcKitchen`,
    description: item.description ?? `Order ${item.name} for tomorrow from RrcKitchen.`,
  };
}

export default async function MenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMenuItemById(id);

  if (!item) notFound();

  return <MenuItemDetail item={item} />;
}
