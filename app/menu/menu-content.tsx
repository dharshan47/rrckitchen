"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MenuGrid } from "@/components/menu";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";
import { useMenuFoodType, useMenuActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { Button } from "@/components/ui/button";
import type { FoodTypeFilter } from "@/stores/menuStore";

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
    } | null;
  } | null;
  photos: { imageUrl: string; sortOrder: number }[];
}

const timeSlotLabels: Record<string, string> = {
  MORNING: "Breakfast",
  LUNCH: "Lunch",
  EVENINGSNACKS: "Snacks",
  DINNER: "Dinner",
};

const timeSlotSlugs: Record<string, string> = {
  MORNING: "breakfast",
  LUNCH: "lunch",
  EVENINGSNACKS: "evening-snacks",
  DINNER: "dinner",
};

const timeSlotOrder = ["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"];

const foodTypeTabs: { label: string; value: FoodTypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Veg", value: "VEG" },
  { label: "Nonveg", value: "NONVEG" },
];

export function MenuContent() {
  const router = useRouter();
  const selectedFoodType = useMenuFoodType();
  const { setSelectedFoodType } = useMenuActions();
  const { data } = useTomorrowMenu();

  const allItems = useMemo(() => (data ?? []) as MenuItem[], [data]);

  const grouped = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const slot of timeSlotOrder) {
      const items = allItems.filter((item) => item.timeSlot === slot);
      if (items.length > 0) {
        groups[slot] = items;
      }
    }
    return groups;
  }, [allItems]);

  const handleItemClick = useCallback(
    (item: { id: string }) => router.push(`/menu/${item.id}`),
    [router]
  );

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col px-6 py-10 lg:px-10">
          <div className="flex gap-2 mb-8">
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

          {Object.keys(grouped).length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No matching meals found.
            </p>
          ) : (
            <div className="space-y-12">
              {timeSlotOrder.map((slot) => {
                const items = grouped[slot];
                if (!items) return null;
                const label = timeSlotLabels[slot] ?? slot;
                const slug = timeSlotSlugs[slot];
                return (
                  <section key={slot}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">{label}</h2>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-sm"
                        onClick={() => router.push(`/menu/category/${slug}`)}
                      >
                        See all
                      </Button>
                    </div>
                    <MenuGrid items={items} onItemClick={handleItemClick} />
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
