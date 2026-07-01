"use client";

import { useCallback, Suspense, useTransition, useState, lazy } from "react";
import { useRouter } from "next/navigation";
import { MenuGrid } from "@/components/menu";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { useMenuTimeSlot, useMenuFoodType, useMenuActions } from "@/stores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeSlot } from "@/lib/patterns";
import type { TimeSlotFilter } from "@/stores/menuStore";

const MenuDetailDialog = lazy(() => import("@/components/home/menu-detail-dialog"));

const sampleItems = [
  { id: "sample-1", name: "Idli Sambhar", price: 80, foodType: "VEG", timeSlot: "MORNING", kitchenName: "Thanjavur Kitchen" },
  { id: "sample-2", name: "Chicken Chettinad", price: 220, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Home Spice Kitchen" },
  { id: "sample-3", name: "Masala Dosa", price: 70, foodType: "VEG", timeSlot: "MORNING", kitchenName: "Thanjavur Kitchen" },
  { id: "sample-4", name: "Vegetable Biryani", price: 150, foodType: "VEG", timeSlot: "DINNER", kitchenName: "Home Spice Kitchen" },
  { id: "sample-5", name: "Mutton Kola Urundai", price: 180, foodType: "NONVEG", timeSlot: "EVENINGSNACKS", kitchenName: "Chettinad Kitchen" },
  { id: "sample-6", name: "Fish Curry Meal", price: 200, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Coastal Flavors" },
];

const timeSlotTabs: { value: TimeSlotFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "MORNING", label: "Morning" },
  { value: "LUNCH", label: "Lunch" },
  { value: "EVENINGSNACKS", label: "Snacks" },
  { value: "DINNER", label: "Dinner" },
];

export function HomeClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedTimeSlot = useMenuTimeSlot();
  const selectedFoodType = useMenuFoodType();
  const { setSelectedTimeSlot } = useMenuActions();
  const [selectedSampleItem, setSelectedSampleItem] = useState<typeof sampleItems[number] | null>(null);

  const handleMenuItemClick = useCallback(
    (item: { id: string }) => {
      router.push(`/menu/${item.id}`);
    },
    [router]
  );

  const handleTabClick = useCallback(
    (slot: TimeSlotFilter) => startTransition(() => setSelectedTimeSlot(slot)),
    [setSelectedTimeSlot]
  );

  const handleSampleClick = useCallback(
    (item: typeof sampleItems[number]) => setSelectedSampleItem(item),
    []
  );

  const handleSampleDialogClose = useCallback(() => setSelectedSampleItem(null), []);

  const filteredSampleItems = sampleItems.filter((item) => {
    const matchTimeSlot = selectedTimeSlot === "ALL" || item.timeSlot === selectedTimeSlot;
    const matchFoodType = selectedFoodType === "ALL" || item.foodType === selectedFoodType;
    return matchTimeSlot && matchFoodType;
  });

  const steps = [
    { num: "1", title: "Browse", desc: "Explore home-cooked meals by time slot — Morning, Lunch, Snacks, or Dinner." },
    { num: "2", title: "Select", desc: "Pick your favorites and add them to your cart." },
    { num: "3", title: "Checkout", desc: "Pay securely via Razorpay. Orders are always for tomorrow." },
    { num: "4", title: "Collect & Enjoy", desc: "Pick up your fresh, home-cooked meals the next day." },
  ];

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col px-4 lg:px-8">
          <section className="py-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
              {timeSlotTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={selectedTimeSlot === tab.value ? "secondary" : "ghost"}
                  size="lg"
                  onClick={() => handleTabClick(tab.value)}
                  className="rounded-full px-6 text-sm"
                >
                  {tab.label}
                </Button>
              ))}
              {isPending && (
                <span className="text-xs text-muted-foreground ml-2">Filtering...</span>
              )}
            </div>

            <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100" />}>
              <MenuGrid onItemClick={handleMenuItemClick} />
            </Suspense>

            {filteredSampleItems.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 pt-6 border-t border-border">
                {filteredSampleItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSampleClick(item)}
                    className="w-full text-left overflow-hidden rounded-3xl border border-border bg-white transition-shadow hover:shadow-sm cursor-pointer"
                  >
                    <div className="relative h-36 w-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary/20">{item.name.charAt(0)}</span>
                    </div>
                    <div className="px-5 pt-3 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-lg font-bold text-foreground">₹{item.price}</p>
                        <Badge variant={item.foodType === "VEG" ? "secondary" : "destructive"} className="shrink-0">
                          {item.foodType}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                    </div>
                    <div className="border-t border-border px-5 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {formatTimeSlot(item.timeSlot)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* How It Works */}
          <section className="py-16 border-t border-border">
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

      <Suspense fallback={null}>
        {selectedSampleItem && (
          <MenuDetailDialog
            item={{
              id: selectedSampleItem.id,
              name: selectedSampleItem.name,
              description: null,
              price: selectedSampleItem.price,
              foodType: selectedSampleItem.foodType,
              timeSlot: selectedSampleItem.timeSlot,
              isAvailable: true,
              menu: { kitchenPartner: { kitchenAlias: { displayName: selectedSampleItem.kitchenName } } },
              photos: [],
            }}
            onClose={handleSampleDialogClose}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
