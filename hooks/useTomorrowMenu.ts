"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { menuStore } from "@/stores";

/**
 * Fetches tomorrow's menu items from the API.
 */
export function useTomorrowMenu() {
  const searchQuery = menuStore((state) => state.searchQuery);
  const selectedFoodType = menuStore((state) => state.selectedFoodType);
  const selectedTimeSlot = menuStore((state) => state.selectedTimeSlot);
  const bestsellerOnly = menuStore((state) => state.bestsellerOnly);
  const debouncedSearch = useDebouncedValue(searchQuery, 350);

  return useQuery({
    queryKey: [
      "tomorrow-menu",
      { q: debouncedSearch, foodType: selectedFoodType, timeSlot: selectedTimeSlot, bestseller: bestsellerOnly },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (selectedFoodType !== "ALL") params.set("foodType", selectedFoodType);
      if (selectedTimeSlot !== "ALL") params.set("timeSlot", selectedTimeSlot);
      if (bestsellerOnly) params.set("bestseller", "true");
      const qs = params.toString() ? `?${params.toString()}` : "";
      const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/menu/tomorrow${qs}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Unable to load menu items.");
      }
      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
  });
}

/** Static query key factory for server-side prefetching */
export const tomorrowMenuKeys = {
  all: ["tomorrow-menu"] as const,
  filtered: (params: { q?: string; foodType?: string; timeSlot?: string }) =>
    ["tomorrow-menu", params] as const,
};
