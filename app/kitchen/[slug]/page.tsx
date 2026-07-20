import { notFound, redirect } from "next/navigation";
import { getKitchenDetail } from "@/actions/catalog/home-data";
import { KitchenDetailClient } from "@/components/kitchen/kitchen-detail-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kitchen = await getKitchenDetail(slug);
  if (!kitchen) return { title: "Kitchen Not Found" };
  return {
    title: kitchen.displayName,
    description: `Browse menu items from ${kitchen.displayName}`,
  };
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ timeSlot?: string; q?: string }>;
}

export default async function KitchenDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { timeSlot, q } = await searchParams;

  const kitchen = await getKitchenDetail(slug);
  if (!kitchen) {
    if (q) redirect(`/search?q=${encodeURIComponent(q)}`);
    notFound();
  }

  return <KitchenDetailClient kitchen={kitchen} initialTimeSlot={timeSlot ?? null} initialSearchQuery={q ?? null} />;
}
