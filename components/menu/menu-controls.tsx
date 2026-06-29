"use client";

import { memo, useCallback, useMemo, useTransition } from "react";
import { Button, Input, Label } from "@/components/ui";
import { useCartStore, useMenuStore, FoodTypeFilter, TimeSlotFilter } from "@/stores";

const foodTypeOptions: FoodTypeFilter[] = ["ALL", "VEG", "NONVEG"];
const timeSlotOptions: { value: TimeSlotFilter; label: string }[] = [
  { value: "MORNING", label: "Morning Breakfast" },
  { value: "LUNCH", label: "Afternoon Lunch" },
  { value: "EVENINGSNACKS", label: "Evening snacks" },
  { value: "DINNER", label: "Night dinner" },
];

function MenuControls() {
  const [isPending, startTransition] = useTransition();
  const searchQuery = useMenuStore((s) => s.searchQuery);
  const selectedFoodType = useMenuStore((s) => s.selectedFoodType);
  const selectedTimeSlot = useMenuStore((s) => s.selectedTimeSlot);
  const selectedTab = useMenuStore((s) => s.selectedTab);
  const setSearchQuery = useMenuStore((s) => s.setSearchQuery);
  const setSelectedFoodType = useMenuStore((s) => s.setSelectedFoodType);
  const setSelectedTimeSlot = useMenuStore((s) => s.setSelectedTimeSlot);
  const setSelectedTab = useMenuStore((s) => s.setSelectedTab);
  const cartCount = useCartStore((state) => state.cart.reduce((total, item) => total + item.qty, 0));

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const handleSelectedTab = useCallback(
    (tab: "menu" | "cart") => {
      startTransition(() => {
        setSelectedTab(tab);
      });
    },
    [setSelectedTab]
  );

  const handleFoodTypeClick = useCallback(
    (option: FoodTypeFilter) => {
      startTransition(() => {
        setSelectedFoodType(option);
      });
    },
    [setSelectedFoodType]
  );

  const handleTimeSlotClick = useCallback(
    (slot: TimeSlotFilter) => {
      startTransition(() => {
        setSelectedTimeSlot(slot);
      });
    },
    [setSelectedTimeSlot]
  );

  const activeSlotLabel = useMemo(
    () => timeSlotOptions.find((option) => option.value === selectedTimeSlot)?.label ?? "All slots",
    [selectedTimeSlot]
  );

  return (
    <div className="grid gap-4 rounded-3xl border border-border bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">Browse menu</span>
          <div className="flex gap-2">
            <Button size="sm" variant={selectedTab === "menu" ? "secondary" : "outline"} onClick={() => handleSelectedTab("menu")}>Menu</Button>
            <Button size="sm" variant={selectedTab === "cart" ? "secondary" : "outline"} onClick={() => handleSelectedTab("cart")}>Cart</Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="menu-search">Search menu</Label>
          <Input id="menu-search" placeholder="Search meals, kitchen, slot..." value={searchQuery} onChange={handleSearchChange} />
        </div>

        <div className="grid gap-2 md:grid-cols-[auto_1fr]">
          <div className="flex flex-wrap items-center gap-2">
            {foodTypeOptions.map((option) => (
              <Button key={option} variant={selectedFoodType === option ? "secondary" : "outline"} size="sm" onClick={() => handleFoodTypeClick(option)}>
                {option === "ALL" ? "All" : option}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {timeSlotOptions.map((option) => (
              <Button key={option.value} variant={selectedTimeSlot === option.value ? "secondary" : "outline"} size="sm" onClick={() => handleTimeSlotClick(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isPending ? (
          <div className="rounded-3xl border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Updating filters...</div>
        ) : (
          <div className="rounded-3xl border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{activeSlotLabel}</div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-2 rounded-3xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cart status</p>
        <p className="text-lg font-semibold text-foreground">
          {cartCount} item{cartCount === 1 ? "" : "s"}
        </p>
        <p className="text-sm">Add items and manage your selections from the menu.</p>
      </div>
    </div>
  );
}

export default memo(MenuControls);
