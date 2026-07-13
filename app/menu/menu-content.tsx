"use client";

import { useCallback, useMemo, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { useCartActions, useMenuActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, UtensilsCrossed, Pizza, Moon, ArrowRight } from "lucide-react";

interface MenuItem {
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
      avgRating?: number | null;
      totalReviews?: number;
    } | null;
  } | null;
  photos: { imageUrl: string; sortOrder: number }[];
}

interface SlotGroup {
  key: string;
  label: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const SLOTS: { key: string; label: string; slug: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "MORNING", label: "Breakfast", slug: "breakfast", icon: Coffee },
  { key: "LUNCH", label: "Lunch", slug: "lunch", icon: UtensilsCrossed },
  { key: "EVENINGSNACKS", label: "Snacks", slug: "evening-snacks", icon: Pizza },
  { key: "DINNER", label: "Dinner", slug: "dinner", icon: Moon },
];

function getKitchenName(item: MenuItem): string {
  return item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Home kitchen";
}

interface MenuContentProps {
  initialMenuItems?: MenuItem[];
}

function MenuCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-1">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

function MenuSectionSkeleton() {
  return (
    <>
      {SLOTS.map((slot) => (
        <section key={slot.key}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <slot.icon className="h-5 w-5 text-muted-foreground" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function MenuContent({ initialMenuItems }: MenuContentProps) {
  const router = useRouter();
  const { setSelectedTimeSlot, setSelectedFoodType } = useMenuActions();
  const { data, isFetching, isPlaceholderData } = useTomorrowMenu();
  const { addToCart } = useCartActions();

  useLayoutEffect(() => {
    setSelectedTimeSlot("ALL");
    setSelectedFoodType("ALL");
  }, [setSelectedTimeSlot, setSelectedFoodType]);

  const allItems = useMemo(() => (data ?? initialMenuItems ?? []) as MenuItem[], [data, initialMenuItems]);

  const slotGroups = useMemo(() => {
    const groups: SlotGroup[] = SLOTS.map((slot) => ({
      ...slot,
      items: allItems.filter((item) => item.timeSlot === slot.key),
    }));
    return groups.filter((g) => g.items.length > 0);
  }, [allItems]);

  const handleAddToCart = useCallback(
    (id: string) => {
      const item = allItems.find((i) => i.id === id);
      if (!item) return;
      addToCart({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: 1,
        foodType: item.foodType,
        timeSlot: item.timeSlot,
        kitchenName: getKitchenName(item),
      });
    },
    [allItems, addToCart],
  );

  const handleItemClick = useCallback(
    (item: { id: string }) => router.push(`/menu/${item.id}`),
    [router],
  );

  const isLoading = allItems.length === 0 && isFetching;

  if (allItems.length === 0 && !isFetching) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen bg-background text-foreground">
          <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 py-8 sm:py-10 lg:px-10">
            <p className="py-16 text-center text-sm text-muted-foreground">
              No matching meals found.
            </p>
          </div>
        </main>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 lg:px-10 space-y-8 sm:space-y-10 animate-pulse">
            <MenuSectionSkeleton />
          </div>
        </main>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
        {isPlaceholderData && (
          <div className="fixed top-0 left-0 z-50 h-0.5 w-full bg-primary/20">
            <div className="h-full w-full origin-left animate-loading-bar bg-primary" />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 lg:px-10 space-y-8 sm:space-y-10">
          {slotGroups.map((group) => (
            <section key={group.key}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <group.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold">{group.label}</h2>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ({group.items.length})
                  </span>
                </div>
                <Link
                  href={`/menu/category/${group.slug}`}
                  className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  See all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
                {group.items.map((item) => (
                  <CompoundMenuCard.Root
                    key={item.id}
                    item={{
                      id: item.id,
                      name: item.name,
                      price: Number(item.price),
                      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
                      foodType: item.foodType,
                      timeSlot: item.timeSlot,
                      kitchenName: getKitchenName(item),
                      kitchenRating: (item.menu?.kitchenPartner as { avgRating?: number | null })?.avgRating != null ? Number((item.menu?.kitchenPartner as { avgRating?: number | null })?.avgRating) : null,
                      totalReviews: (item.menu?.kitchenPartner as { totalReviews?: number })?.totalReviews ?? 0,
                      description: item.description,
                      imageUrl: item.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
                    }}
                    onAddToCart={handleAddToCart}
                    onItemClick={handleItemClick}
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
            </section>
          ))}
        </div>
      </main>
    </ErrorBoundary>
  );
}
