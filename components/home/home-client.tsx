"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { useCartActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  menu: { kitchenPartner: { kitchenAlias: { displayName: string } | null } | null } | null;
  photos: { imageUrl: string; sortOrder: number }[];
}

const timeSlotCategories: { value: string; label: string }[] = [
  { value: "MORNING", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "EVENINGSNACKS", label: "Evening Snacks" },
  { value: "DINNER", label: "Dinner" },
];

const MAX_VISIBLE_ITEMS = 6;

export function HomeClient() {
  const router = useRouter();
  const { data, isLoading, isError } = useTomorrowMenu();
  const { addToCart } = useCartActions();

  const apiItems = (data ?? []) as MenuItem[];
  const isEmpty = !apiItems.length && !isLoading && !isError;

  const handleItemClick = useCallback(
    (item: { id: string }) => {
      router.push(`/menu/${item.id}`);
    },
    [router]
  );

  const handleAddToCart = useCallback(
    (id: string) => {
      const item = apiItems.find((i) => i.id === id);
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
    [apiItems, addToCart]
  );

  const grouped = timeSlotCategories
    .map((cat) => ({
      ...cat,
      items: apiItems.filter((i) => i.timeSlot === cat.value),
    }))
    .filter((g) => g.items.length > 0);

  const steps = [
    { num: "1", title: "Browse", desc: "Explore home-cooked meals by Breakfast, Lunch, Snacks, or Dinner." },
    { num: "2", title: "Select", desc: "Pick your favorites and add them to your cart." },
    { num: "3", title: "Checkout", desc: "Pay securely. Orders are always for tomorrow." },
    { num: "4", title: "Collect & Enjoy", desc: "Pick up your fresh, home-cooked meals the next day." },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <ErrorBoundary>
          {isLoading ? (
            <div className="space-y-10">
              {timeSlotCategories.map((cat) => (
                <section key={cat.value}>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    <SkeletonCard variant="menu-item" count={6} />
                  </div>
                </section>
              ))}
            </div>
          ) : isError ? (
            <p className="text-center text-sm text-destructive py-20">
              Unable to load menu items right now. Please try again later.
            </p>
          ) : (
            <>
              {grouped.map((group) => (
                <CategoryRow
                  key={group.value}
                  title={group.label}
                  items={group.items}
                  onItemClick={handleItemClick}
                  onAddToCart={handleAddToCart}
                />
              ))}

              {isEmpty && (
                <p className="text-center text-sm text-muted-foreground py-12">
                  No menu items available right now. Check back later!
                </p>
              )}
            </>
          )}
        </ErrorBoundary>

        {/* How It Works */}
        <section className="py-16 border-t border-border mt-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How It Works</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.num} className="text-center space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mx-auto">
                    {step.num}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CategoryRow({
  title,
  items,
  onItemClick,
  onAddToCart,
}: {
  title: string;
  items: MenuItem[];
  onItemClick: (item: { id: string }) => void;
  onAddToCart: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = items.length > MAX_VISIBLE_ITEMS;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
        <Link
          href={`/menu/category/${slug}`}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          See all
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory"
      >
        {visibleItems.map((item) => (
          <div key={item.id} className="snap-start shrink-0 w-55 lg:w-60">
            <CompoundMenuCard.Root
              item={{
                id: item.id,
                name: item.name,
                price: Number(item.price),
                compareAtPrice: item.compareAtPrice ?? null,
                foodType: item.foodType,
                timeSlot: item.timeSlot,
                kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen",
                description: item.description,
                imageUrl: item.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
              }}
              onAddToCart={onAddToCart}
              onItemClick={onItemClick}
            >
              <CompoundMenuCard.ImageSection>
                <CompoundMenuCard.BadgeRibbon />
                <CompoundMenuCard.AddButtonOverlay />
              </CompoundMenuCard.ImageSection>
              <CompoundMenuCard.Header />
              <CompoundMenuCard.Footer />
            </CompoundMenuCard.Root>
          </div>
        ))}
        {hasMore && (
          <Link
            href={`/menu/category/${slug}`}
            className="snap-start shrink-0 w-55 lg:w-60 rounded-3xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary/60 bg-muted/30"
          >
            <span className="text-3xl font-light">→</span>
            <span className="text-sm font-semibold">View all {title}</span>
          </Link>
        )}
      </div>
    </section>
  );
}
