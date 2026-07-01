"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { menuStore } from "@/stores";
import { useRequestDedupe } from "./useRequestDedupe";

export function useTomorrowMenu() {
  const searchQuery = menuStore((state) => state.searchQuery);
  const selectedFoodType = menuStore((state) => state.selectedFoodType);
  const selectedTimeSlot = menuStore((state) => state.selectedTimeSlot);
  const debouncedSearch = useDebouncedValue(searchQuery, 350);
  const { dedupe } = useRequestDedupe(5000);

  return useQuery({
    queryKey: [
      "tomorrow-menu",
      { q: debouncedSearch, foodType: selectedFoodType, timeSlot: selectedTimeSlot },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (selectedFoodType !== "ALL") params.set("foodType", selectedFoodType);
      if (selectedTimeSlot !== "ALL") params.set("timeSlot", selectedTimeSlot);

      const key = `/api/menu/tomorrow?${params.toString()}`;
      return dedupe(key, async () => {
        const res = await fetch(key, { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to load menu items.");
        return res.json();
      });
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
