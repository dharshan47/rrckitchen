"use client";

import { useCallback } from "react";
import { useCartActions } from "@/stores";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { ErrorBoundary } from "@/components/patterns/error-boundary";

interface MenuGridItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  foodType: string;
  timeSlot: string;
  menu: {
    kitchenPartner: {
      kitchenAlias: { displayName: string } | null;
    } | null;
  } | null;
  photos: { imageUrl: string; sortOrder: number }[];
}

interface MenuGridProps {
  onItemClick?: (item: {
    id: string;
    name: string;
    price: number;
    foodType: string;
    timeSlot: string;
    kitchenName: string;
    description?: string | null;
  }) => void;
}

export default function MenuGrid({ onItemClick }: MenuGridProps) {
  const { data, isLoading, isError } = useTomorrowMenu();
  const { addToCart } = useCartActions();
  const items = (data ?? []) as MenuGridItem[];

  const handleAddToCart = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      addToCart({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: 1,
        foodType: item.foodType,
        timeSlot: item.timeSlot,
        kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Home kitchen",
      });
    },
    [items, addToCart]
  );

  if (isLoading) {
    return <SkeletonCard variant="menu-item" count={6} />;
  }

  if (isError) {
    return <p className="text-center text-sm text-destructive">Unable to load menu items right now.</p>;
  }

  if (!items.length) {
    return (
      <p className="rounded-3xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
        No matching meals found.
      </p>
    );
  }

  return (
    <ErrorBoundary>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <CompoundMenuCard.Root
            key={item.id}
            item={{
              id: item.id,
              name: item.name,
              price: Number(item.price),
              foodType: item.foodType,
              timeSlot: item.timeSlot,
              kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen",
              description: item.description,
              imageUrl: item.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
            }}
            onAddToCart={handleAddToCart}
            onItemClick={onItemClick}
          >
            <CompoundMenuCard.ImageSection />
            <CompoundMenuCard.Header />
            <CompoundMenuCard.Footer />
          </CompoundMenuCard.Root>
        ))}
      </div>
    </ErrorBoundary>
  );
}
