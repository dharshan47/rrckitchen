"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { useMenuStore } from "@/stores";

export function useTomorrowMenu() {
  const searchQuery = useMenuStore((state) => state.searchQuery);
  const selectedFoodType = useMenuStore((state) => state.selectedFoodType);
  const selectedTimeSlot = useMenuStore((state) => state.selectedTimeSlot);
  const debouncedSearch = useDebouncedValue(searchQuery, 350);

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

      const res = await fetch(`/api/menu/tomorrow?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Unable to load menu items.");
      }

      return res.json();
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
