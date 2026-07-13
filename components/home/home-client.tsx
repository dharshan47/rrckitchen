"use client";

import { useCallback, useMemo, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCartActions, useMenuActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";
import { HeroCarousel } from "./hero-carousel";
import { CravingsBanner } from "./cravings-banner";
import { Star, Clock, ChefHat, ArrowRight, TrendingUp, Sparkles, Zap, Bike, BadgePercent } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  menu: {
    kitchenPartner: {
      kitchenAlias: { displayName: string } | null;
      avgRating?: number | null;
      totalReviews?: number;
    } | null;
  } | null;
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
  initialMenuItems?: MenuItem[];
}

const staticOffers = [
  {
    icon: Zap,
    title: "First order",
    desc: "50% off up to ₹100",
    gradient: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
  },
  {
    icon: Bike,
    title: "Kitchen special",
    desc: "Free delivery above ₹199",
    gradient: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
  },
  {
    icon: BadgePercent,
    title: "Weekend thali",
    desc: "₹30 off on lunch thalis",
    gradient: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
];

export function HomeClient({ topRatedKitchens = [], newKitchens = [], recentOrderKitchens = [], initialMenuItems }: HomeClientProps) {
  const router = useRouter();
  const { addToCart } = useCartActions();
  const { setSelectedTimeSlot, setSelectedFoodType } = useMenuActions();

  useLayoutEffect(() => {
    setSelectedTimeSlot("ALL");
    setSelectedFoodType("ALL");
  }, [setSelectedTimeSlot, setSelectedFoodType]);

  const { data, isError, isFetching } = useQuery({
    queryKey: ["tomorrow-menu", { q: "", foodType: "ALL", timeSlot: "ALL" }],
    queryFn: async () => {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/menu/tomorrow`);
      if (!res.ok) throw new Error("Failed to load menu");
      return res.json();
    },
    staleTime: 15_000,
    gcTime: 60_000,
  });

  const apiItems = useMemo(() => (data ?? initialMenuItems ?? []) as MenuItem[], [data, initialMenuItems]);

  const handleItemClick = useCallback(
    (item: { id: string }) => { router.push(`/menu/${item.id}`); },
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

  const showSkeleton = !data && isFetching;
  const showError = isError && !apiItems.length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 pt-1 sm:pt-3 pb-3 sm:pb-6 space-y-4 sm:space-y-6 lg:space-y-8">
        <ErrorBoundary>
          {showSkeleton ? (
            <HomePageSkeleton />
          ) : (
            <>
              <HeroCarousel />
              <CravingsBanner />

              <section>
                <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Offers for you
                </h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                  {staticOffers.map((offer, i) => (
                    <div key={i} className={`shrink-0 w-56 sm:w-64 rounded-xl bg-linear-to-br ${offer.gradient} border ${offer.border} p-3 sm:p-4`}>
                      <offer.icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">{offer.title}</p>
                      <p className="text-sm font-semibold mt-0.5">{offer.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {recentOrderKitchens.length > 0 && (
                <section>
                  <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Reorder from your favourites
                  </h2>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                    {recentOrderKitchens.map((k) => (
                      <Link key={k.id} href={`/menu?kitchenId=${k.id}`} className="shrink-0 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-colors min-w-36 sm:min-w-40">
                        <p className="text-sm font-semibold">{k.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Reorder now</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {topRatedKitchens.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Top rated kitchens near you
                    </h2>
                    <Link href="/menu" className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors">See all</Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                    {topRatedKitchens.map((k) => (
                      <Link key={k.id} href={`/menu?kitchenId=${k.id}`} className="shrink-0 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-colors min-w-40 sm:min-w-44">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{k.avgRating ?? "New"}</span>
                        </div>
                        <p className="text-sm font-semibold truncate">{k.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{k.totalReviews} ratings</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Today&apos;s Featured Meals
                </h2>
                {showError ? (
                  <p className="text-center text-sm text-destructive py-6">Unable to load menu items right now. Please try again later.</p>
                ) : apiItems.length > 0 ? (
                  <FeaturedItems items={apiItems} onItemClick={handleItemClick} onAddToCart={handleAddToCart} />
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">No menu items available right now. Check back later!</p>
                )}
              </section>

              {newKitchens.length > 0 && (
                <section>
                  <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    New kitchens to try
                  </h2>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                    {newKitchens.map((k) => (
                      <Link key={k.id} href={`/menu?kitchenId=${k.id}`} className="shrink-0 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-colors min-w-36 sm:min-w-40">
                        <p className="text-sm font-semibold">{k.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Recently joined</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 p-5 sm:p-6 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-2">Become a Home Chef</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Cook from home, set your own hours, and earn money sharing your food with your community.
                </p>
                <Link href="/kitchen/signup" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Start earning this week
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>

              <HowItWorksSection />
            </>
          )}
        </ErrorBoundary>
      </div>
    </main>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "1", title: "Browse Menus", desc: "Explore fresh home-cooked meals from local kitchens near you. Filter by Breakfast, Lunch, Snacks, or Dinner." },
    { num: "2", title: "Select & Order", desc: "Pick your favourite dishes and add them to your cart. Order before midnight for next-day delivery." },
    { num: "3", title: "Secure Checkout", desc: "Pay securely online via UPI, card or wallet. Your order is confirmed instantly." },
    { num: "4", title: "Collect & Enjoy", desc: "Pick up your freshly cooked meal or get it delivered. Enjoy homemade food without the effort." },
  ];

  return (
    <section className="py-6 sm:py-8 border-t border-border">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center mb-6 sm:mb-10">How It Works</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="text-center space-y-2 sm:space-y-3 p-4 sm:p-6">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mx-auto">
                {step.num}
              </div>
              <h3 className="font-semibold text-sm sm:text-base">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-5 sm:leading-6">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedItems({
  items,
  onItemClick,
  onAddToCart,
}: {
  items: MenuItem[];
  onItemClick: (item: { id: string }) => void;
  onAddToCart: (id: string) => void;
}) {
  const featured = useMemo(() => items.slice(0, 6), [items]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {featured.map((item) => (
        <CompoundMenuCard.Root
          key={item.id}
          item={{
            id: item.id,
            name: item.name,
            price: Number(item.price),
            compareAtPrice: item.compareAtPrice ?? null,
            foodType: item.foodType,
            timeSlot: item.timeSlot,
            kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen",
            kitchenRating: item.menu?.kitchenPartner?.avgRating != null ? Number(item.menu?.kitchenPartner?.avgRating) : null,
            totalReviews: item.menu?.kitchenPartner?.totalReviews ?? 0,
            description: item.description,
            imageUrl: item.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
          }}
          onAddToCart={onAddToCart}
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
      {featured.length > 0 && featured.length < 6 && (
        <Link
          href="/menu"
          className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary/60 bg-muted/30 min-h-50"
        >
          <span className="text-3xl font-light">→</span>
          <span className="text-sm font-semibold">View all menu</span>
        </Link>
      )}
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-pulse">
      {/* Hero Banner */}
      <div className="w-full h-40 sm:h-48 lg:h-56 rounded-2xl bg-muted" />

      {/* Cravings banner */}
      <div className="w-full h-14 sm:h-16 rounded-xl bg-muted" />

      {/* Offers section */}
      <section>
        <div className="h-5 w-32 bg-muted rounded mb-3" />
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-56 sm:w-64 rounded-xl bg-muted h-24" />
          ))}
        </div>
      </section>

      {/* Top rated kitchens */}
      <section>
        <div className="h-5 w-48 bg-muted rounded mb-3" />
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 min-w-40 sm:min-w-44 rounded-xl bg-muted h-20" />
          ))}
        </div>
      </section>

      {/* Featured meals grid */}
      <section>
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted overflow-hidden">
              <div className="aspect-square w-full bg-muted-foreground/10" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 bg-muted-foreground/10 rounded" />
                <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-6 w-14 bg-muted-foreground/10 rounded" />
                  <div className="h-7 w-14 bg-muted-foreground/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New kitchens */}
      <section>
        <div className="h-5 w-36 bg-muted rounded mb-3" />
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 min-w-36 sm:min-w-40 rounded-xl bg-muted h-20" />
          ))}
        </div>
      </section>

      {/* Home chef banner */}
      <div className="w-full h-32 sm:h-36 rounded-2xl bg-muted" />

      {/* How it works */}
      <div className="w-full h-48 rounded-2xl bg-muted" />
    </div>
  );
}
