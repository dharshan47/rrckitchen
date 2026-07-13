"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { useCartActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
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

export function MenuContent() {
  const router = useRouter();
  const { data } = useTomorrowMenu();
  const { addToCart } = useCartActions();

  const allItems = useMemo(() => (data ?? []) as MenuItem[], [data]);

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

  if (allItems.length === 0) {
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

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
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
