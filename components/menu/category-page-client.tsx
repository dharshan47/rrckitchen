"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMenuActions, useMenuFoodType } from "@/stores";
import { MenuGrid } from "@/components/menu";
import type { MenuGridItem } from "@/components/menu/menu-grid";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { Button } from "@/components/ui/button";
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

/**
 * Client component for category-filtered menu pages.
 * Sets the time slot filter on mount and renders the menu grid.
 */
export function CategoryPageClient({ slug, timeSlot, initialMenuItems }: { slug: string; timeSlot: string; initialMenuItems?: MenuGridItem[] }) {
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
            <MenuGrid items={initialMenuItems} onItemClick={handleItemClick} />
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}
