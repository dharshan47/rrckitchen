"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MenuGrid } from "@/components/menu";
import { useMenuActions } from "@/stores";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import type { FoodTypeFilter } from "@/stores/menuStore";

export function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedTimeSlot, setSelectedFoodType, setSearchQuery } = useMenuActions();

  useEffect(() => {
    const timeSlot = searchParams.get("timeSlot");
    if (timeSlot === "MORNING" || timeSlot === "LUNCH" || timeSlot === "EVENINGSNACKS" || timeSlot === "DINNER") {
      setSelectedTimeSlot(timeSlot);
    }

    const foodType = searchParams.get("foodType");
    if (foodType === "VEG" || foodType === "NONVEG" || foodType === "ALL") {
      setSelectedFoodType(foodType as FoodTypeFilter);
    }

    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSelectedTimeSlot, setSelectedFoodType, setSearchQuery]);

  const handleItemClick = useCallback(
    (item: { id: string }) => router.push(`/menu/${item.id}`),
    [router]
  );

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
          <section className="grid gap-4">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100" />}>
              <MenuGrid onItemClick={handleItemClick} />
            </Suspense>
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}
