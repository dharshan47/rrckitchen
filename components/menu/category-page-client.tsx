"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMenuActions, useMenuFoodType } from "@/stores";
import { MenuGrid } from "@/components/menu";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FoodTypeFilter } from "@/stores/menuStore";

const slugLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  "evening-snacks": "Evening Snacks",
  dinner: "Dinner",
};

const foodTypeTabs: { label: string; value: FoodTypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Veg", value: "VEG" },
  { label: "Nonveg", value: "NONVEG" },
];

function MenuGridFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Skeleton className="absolute inset-3 rounded-none" />
          </div>
          <div className="px-3 pb-4 pt-1.5">
            <div className="flex flex-col">
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-14 rounded-lg" />
              </div>
              <div className="mt-4 border-t border-dashed border-border" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Client component for category-filtered menu pages.
 * Sets the time slot filter on mount and renders the menu grid inside an error boundary.
 */
export function CategoryPageClient({ slug, timeSlot }: { slug: string; timeSlot: string }) {
  const router = useRouter();
  const selectedFoodType = useMenuFoodType();
  const { setSelectedTimeSlot, setSelectedFoodType } = useMenuActions();

  useEffect(() => {
    setSelectedTimeSlot(timeSlot as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER");
    return () => {
      setSelectedTimeSlot("ALL");
    };
  }, [timeSlot, setSelectedTimeSlot]);

  const handleItemClick = useCallback(
    (item: { id: string }) => router.push(`/menu/${item.id}`),
    [router]
  );

  const label = slugLabels[slug] ?? slug;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col px-6 lg:px-10 py-10">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {label}
            </h1>
            <div className="flex gap-2">
              {foodTypeTabs.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant={selectedFoodType === tab.value ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-5"
                  onClick={() => setSelectedFoodType(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
          <section>
            <Suspense fallback={<MenuGridFallback />}>
              <MenuGrid onItemClick={handleItemClick} />
            </Suspense>
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}
