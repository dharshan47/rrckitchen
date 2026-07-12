"use client";

import { useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { useCartActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { HeroCarousel } from "./hero-carousel";
import { CravingsBanner } from "./cravings-banner";
import { Star, Clock, ChefHat, ArrowRight, TrendingUp, Sparkles } from "lucide-react";

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

interface KitchenRow {
  id: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
}

interface HomeClientProps {
  topRatedKitchens?: KitchenRow[];
  newKitchens?: { id: string; displayName: string; createdAt: string }[];
  recentOrderKitchens?: { id: string; displayName: string }[];
  coupons?: { code: string; description: string }[];
}

const timeSlotCategories = [
  { value: "MORNING", label: "Breakfast", icon: "🌅" },
  { value: "LUNCH", label: "Lunch", icon: "🍛" },
  { value: "EVENINGSNACKS", label: "Evening Snacks", icon: "🍿" },
  { value: "DINNER", label: "Dinner", icon: "🌙" },
];

const MAX_VISIBLE_ITEMS = 6;

export function HomeClient({ topRatedKitchens = [], newKitchens = [], recentOrderKitchens = [], coupons = [] }: HomeClientProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useTomorrowMenu();
  const { addToCart } = useCartActions();

  const apiItems = useMemo(() => (data ?? []) as MenuItem[], [data]);
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6 space-y-6">
        <ErrorBoundary>
          {/* 1. Hero Banner Carousel */}
          <HeroCarousel />

          {/* 2. Quick Category Icons */}
          <div className="flex gap-4 overflow-x-auto scrollbar-none px-0">
            {timeSlotCategories.map((cat) => (
              <Link
                key={cat.value}
                href={`/menu?timeSlot=${cat.value}`}
                className="shrink-0 flex flex-col items-center gap-1.5 w-20"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-center text-muted-foreground">{cat.label}</span>
              </Link>
            ))}
          </div>

          {/* 3. Cravings Banner (logged-in users) */}
          <CravingsBanner />

          {/* 4. Offers Strip */}
          {coupons.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Offers for you
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none">
                {coupons.map((c) => (
                  <div key={c.code} className="shrink-0 w-64 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                    <p className="text-xs font-bold text-primary uppercase">{c.code}</p>
                    <p className="text-sm font-medium mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Reorder Row */}
          {recentOrderKitchens.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Reorder from your favourites
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none">
                {recentOrderKitchens.map((k) => (
                  <Link
                    key={k.id}
                    href={`/menu?kitchenId=${k.id}`}
                    className="shrink-0 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors min-w-40"
                  >
                    <p className="text-sm font-semibold">{k.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Reorder now</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Loading State */}
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
              {/* 6. Category Sections (Breakfast/Lunch/Snacks/Dinner) */}
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

          {/* 7. Top Rated Kitchens */}
          {topRatedKitchens.length > 0 && (
            <section className="pt-4">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top rated kitchens near you
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none">
                {topRatedKitchens.map((k) => (
                  <Link
                    key={k.id}
                    href={`/menu?kitchenId=${k.id}`}
                    className="shrink-0 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors min-w-45"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{k.avgRating ?? "New"}</span>
                    </div>
                    <p className="text-sm font-semibold truncate">{k.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{k.totalReviews} reviews</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 8. New Kitchens */}
          {newKitchens.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-primary" />
                New kitchens to try
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none">
                {newKitchens.map((k) => (
                  <Link
                    key={k.id}
                    href={`/menu?kitchenId=${k.id}`}
                    className="shrink-0 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors min-w-40"
                  >
                    <p className="text-sm font-semibold">{k.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Recently joined</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 9. Become a Home Chef Banner */}
          <section className="rounded-2xl bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Become a Home Chef</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Cook from home, set your own hours, and earn money sharing your food with your community.
            </p>
            <Link
              href="/kitchen/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start earning this week
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {/* 10. How It Works */}
          <HowItWorksSection />
        </ErrorBoundary>
      </div>
    </main>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "1", title: "Browse", desc: "Explore home-cooked meals by Breakfast, Lunch, Snacks, or Dinner." },
    { num: "2", title: "Select", desc: "Pick your favorites and add them to your cart." },
    { num: "3", title: "Checkout", desc: "Pay securely. Orders are always for tomorrow." },
    { num: "4", title: "Collect & Enjoy", desc: "Pick up your fresh, home-cooked meals the next day." },
  ];

  return (
    <section className="py-8 border-t border-border">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">How It Works</h2>
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
    <section className="mb-8">
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
