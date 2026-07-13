"use client";

import { useCallback, useMemo } from "react";
import { useCartActions } from "@/stores";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { ErrorBoundary } from "@/components/patterns/error-boundary";

/** Shape of a menu item returned from the API. */
interface MenuGridItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  foodType: string;
  timeSlot: string;
  menu: {
    kitchenPartner: {
      kitchenAlias: { displayName: string } | null;
    } | null;
  } | null;
  photos: { imageUrl: string; sortOrder: number }[];
}

/** Callback payload when a menu item is clicked. */
interface ItemClickPayload {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  description?: string | null;
}

interface MenuGridProps {
  items?: MenuGridItem[];
  onItemClick?: (item: ItemClickPayload) => void;
}

/**
 * Renders the menu grid with suspense-based data fetching.
 * Loading/error states are handled by parent Suspense boundaries.
 * If `items` is provided, renders those instead of fetching internally.
 */
export default function MenuGrid({ items: propItems, onItemClick }: MenuGridProps) {
  const { data } = useTomorrowMenu();
  const { addToCart } = useCartActions();
  const items = useMemo(() => (propItems ?? data ?? []) as MenuGridItem[], [propItems, data]);

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

  if (!items.length) {
    return (
      <div className="grid min-h-96 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        <div className="col-span-full flex items-center justify-center">
          <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No matching meals found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {items.map((item) => (
          <CompoundMenuCard.Root
            key={item.id}
            item={{
              id: item.id,
              name: item.name,
              price: Number(item.price),
              compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
              foodType: item.foodType,
              timeSlot: item.timeSlot,
              kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen",
              kitchenRating: (item.menu?.kitchenPartner as { avgRating?: number | null })?.avgRating != null ? Number((item.menu?.kitchenPartner as { avgRating?: number | null })?.avgRating) : null,
              totalReviews: (item.menu?.kitchenPartner as { totalReviews?: number })?.totalReviews ?? 0,
              description: item.description,
              imageUrl: item.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
            }}
            onAddToCart={handleAddToCart}
            onItemClick={onItemClick}
          >
            <CompoundMenuCard.ImageSection>
              <CompoundMenuCard.BadgeRibbon />
              <CompoundMenuCard.WishlistButton />
            </CompoundMenuCard.ImageSection>
            <CompoundMenuCard.Header />
            <CompoundMenuCard.Footer />
          </CompoundMenuCard.Root>
        ))}
      </div>
    </ErrorBoundary>
  );
}
