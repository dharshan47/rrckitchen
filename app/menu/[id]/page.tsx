import { getMenuItemById } from "@/actions/catalog/menu";
import { notFound } from "next/navigation";
import { MenuItemDetail } from "@/components/menu/menu-item-detail";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMenuItemById(id);
  if (!item) return { title: "Item Not Found" };
  return {
    title: `${item.name}`,
    description: item.description ?? `Order ${item.name} for tomorrow from RRC Kitchen.`,
  };
}

export default async function MenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMenuItemById(id);

  if (!item) notFound();

  return <MenuItemDetail item={item} />;
}
