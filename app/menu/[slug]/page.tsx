import { getMenuItemBySlug, getMenuItemById } from "@/actions/catalog/menu";
import { notFound, redirect } from "next/navigation";
import { MenuItemDetail } from "@/components/menu/menu-item-detail";

async function lookupItem(slugOrId: string) {
  let item = await getMenuItemBySlug(slugOrId);
  if (!item) item = await getMenuItemById(slugOrId);
  return item;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await lookupItem(slug);
  if (!item) return { title: "Item Not Found" };
  return {
    title: `${item.name}`,
    description: item.description ?? `Order ${item.name} for tomorrow from RRC Kitchen.`,
  };
}

export default async function MenuItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await lookupItem(slug);

  if (!item) notFound();

  if (item.slug && item.slug !== slug) {
    redirect(`/menu/${item.slug}`);
  }

  return <MenuItemDetail item={item} />;
}