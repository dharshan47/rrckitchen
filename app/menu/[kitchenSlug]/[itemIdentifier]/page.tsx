import { notFound } from "next/navigation";
import { getMenuItemByIdentifier } from "@/actions/catalog/menu";
import { MenuItemDetail } from "@/components/menu/menu-item-detail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ kitchenSlug: string; itemIdentifier: string }> }): Promise<Metadata> {
  const { kitchenSlug, itemIdentifier } = await params;
  const lastDash = itemIdentifier.lastIndexOf("-");
  const shortId = itemIdentifier.substring(lastDash + 1);
  const item = await getMenuItemByIdentifier(kitchenSlug, shortId);
  if (!item) return { title: "Item Not Found" };
  return {
    title: item.name,
    description: item.description ?? `Order ${item.name} for tomorrow from RRC Kitchen.`,
  };
}

export default async function MenuItemPage({ params }: { params: Promise<{ kitchenSlug: string; itemIdentifier: string }> }) {
  const { kitchenSlug, itemIdentifier } = await params;
  const lastDash = itemIdentifier.lastIndexOf("-");
  const shortId = itemIdentifier.substring(lastDash + 1);
  const item = await getMenuItemByIdentifier(kitchenSlug, shortId);
  if (!item) notFound();
  return <MenuItemDetail item={item} />;
}