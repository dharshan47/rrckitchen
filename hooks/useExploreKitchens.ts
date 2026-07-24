"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface KitchenData {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  cuisineTags: string[];
  items: { id: string; name: string; price: number; compareAtPrice?: number | null; timeSlot: string; foodType: string }[];
  timeSlots: string[];
  operatingHours: Record<string, { open: string; close: string }> | null;
}

interface ExploreResponse {
  data: KitchenData[];
  nextCursor: string | null;
}

export interface CategoryData {
  id: string;
  name: string;
  kitchenCount: number;
  imageUrl: string;
}

const PAGE_SIZE = 15;

export function useExploreKitchens(category?: string | null) {
  return useInfiniteQuery<ExploreResponse>({
    queryKey: ["explore-kitchens", category],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      if (pageParam) params.set("cursor", pageParam as string);
      if (category) params.set("category", category);
      const res = await fetch(`/api/kitchen/explore?${params}`);
      if (!res.ok) throw new Error("Failed to fetch kitchens");
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useKitchenCategories() {
  return useQuery<CategoryData[]>({
    queryKey: ["kitchen-categories"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 120_000,
  });
}
