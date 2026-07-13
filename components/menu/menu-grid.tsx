"use client";

import { useCallback, useMemo } from "react";
import { useCartActions } from "@/stores";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { ErrorBoundary } from "@/components/patterns/error-boundary";

/** Shape of a menu item returned from the API. */
export interface MenuGridItem {
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
 * Renders the menu grid. Uses server-provided `items` as initial data
 * while maintaining reactivity to filter changes via useTomorrowMenu.
 */
export default function MenuGrid({ items: propItems, onItemClick }: MenuGridProps) {
  const { data, isFetching } = useTomorrowMenu();
  const { addToCart } = useCartActions();
  const items = useMemo(() => {
    if (data) return data as MenuGridItem[];
    if (propItems) return propItems;
    return [];
  }, [data, propItems]);

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

  if (!data && !propItems && isFetching) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-muted animate-pulse" />
            </div>
            <div className="px-3 pb-4 pt-1.5">
              <div className="flex flex-col space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                  <div className="h-8 w-14 bg-muted animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
