import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { KitchenData } from "@/hooks/useExploreKitchens";

export type CuisineFilter = "all" | "South Indian" | "North Indian" | "Chinese" | "Desserts" | "Healthy" | "Street Food";
export type MealFilter = "all" | "veg" | "non-veg";
export type SlotFilter = "all" | "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";
export type RatingFilter = "all" | "4+";
export type SortOption = "recommended" | "rating";

interface HomeChefsState {
  search: string;
  cuisine: CuisineFilter;
  mealType: MealFilter;
  availability: SlotFilter;
  rating: RatingFilter;
  sort: SortOption;
  setSearch: (search: string) => void;
  setCuisine: (cuisine: CuisineFilter) => void;
  setMealType: (mealType: MealFilter) => void;
  setAvailability: (availability: SlotFilter) => void;
  setRating: (rating: RatingFilter) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;
}

export const useHomeChefsStore = create<HomeChefsState>((set) => ({
  search: "",
  cuisine: "all",
  mealType: "all",
  availability: "all",
  rating: "all",
  sort: "recommended",
  setSearch: (search) => set({ search }),
  setCuisine: (cuisine) => set({ cuisine }),
  setMealType: (mealType) => set({ mealType }),
  setAvailability: (availability) => set({ availability }),
  setRating: (rating) => set({ rating }),
  setSort: (sort) => set({ sort }),
  resetFilters: () =>
    set({
      search: "",
      cuisine: "all",
      mealType: "all",
      availability: "all",
      rating: "all",
      sort: "recommended",
    }),
}));

const selectFilters = (state: HomeChefsState) => ({
  search: state.search,
  cuisine: state.cuisine,
  mealType: state.mealType,
  availability: state.availability,
  rating: state.rating,
  sort: state.sort,
});

const selectActions = (state: HomeChefsState) => ({
  setSearch: state.setSearch,
  setCuisine: state.setCuisine,
  setMealType: state.setMealType,
  setAvailability: state.setAvailability,
  setRating: state.setRating,
  setSort: state.setSort,
  resetFilters: state.resetFilters,
});

export function useHomeChefsFilters() {
  return useHomeChefsStore(useShallow(selectFilters));
}

export function useHomeChefsActions() {
  return useHomeChefsStore(useShallow(selectActions));
}

export function useHomeChefsQuery() {
  return useInfiniteQuery<{ data: KitchenData[]; nextCursor: string | null }>({
    queryKey: ["home-chefs"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "15" });
      if (pageParam) params.set("cursor", pageParam as string);
      const res = await fetch(`/api/kitchen/explore?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load home chefs");
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
