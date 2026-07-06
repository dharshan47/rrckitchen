"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { menuStore } from "@/stores";

/**
 * Builds query params string from current filter state.
 * TanStack Query handles deduplication natively via queryKey — no custom dedupe needed.
 */
function buildQueryParams(search: string, foodType: string, timeSlot: string): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (foodType !== "ALL") params.set("foodType", foodType);
  if (timeSlot !== "ALL") params.set("timeSlot", timeSlot);
  return params.toString();
}

/**
 * Fetches tomorrow's menu items from the API.
 */
export function useTomorrowMenu() {
  const searchQuery = menuStore((state) => state.searchQuery);
  const selectedFoodType = menuStore((state) => state.selectedFoodType);
  const selectedTimeSlot = menuStore((state) => state.selectedTimeSlot);
  const debouncedSearch = useDebouncedValue(searchQuery, 350);

  return useQuery({
    queryKey: [
      "tomorrow-menu",
      { q: debouncedSearch, foodType: selectedFoodType, timeSlot: selectedTimeSlot },
    ],
    queryFn: async () => {
      const params = buildQueryParams(debouncedSearch, selectedFoodType, selectedTimeSlot);
      const qs = params ? `?${params}` : "";
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
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

/** Static query key factory for server-side prefetching */
export const tomorrowMenuKeys = {
  all: ["tomorrow-menu"] as const,
  filtered: (params: { q?: string; foodType?: string; timeSlot?: string }) =>
    ["tomorrow-menu", params] as const,
};
