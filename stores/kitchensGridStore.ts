import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  useExploreKitchens,
  useKitchenCategories,
  type KitchenData,
  type CategoryData,
} from "@/hooks/useExploreKitchens";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";

interface KitchensGridState {
  kitchens: KitchenData[];
  categories: CategoryData[];
  selectedCategory: string | null;
  sortOption: SortOption | null;
  vegFilter: VegFilterValue;
  selectedCuisines: string[];
  minRating: number | null;
  minPrepTime: number | null;
  maxPrepTime: number | null;
  mealType: string | null;
  topRatedOnly: boolean;
  newOnly: boolean;
  showMobileFilters: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  setSelectedCategory: (category: string | null) => void;
  setSortOption: (option: SortOption | null) => void;
  setVegFilter: (filter: VegFilterValue) => void;
  setSelectedCuisines: (cuisines: string[]) => void;
  toggleCuisine: (cuisineId: string) => void;
  setMinRating: (rating: number | null) => void;
  setMinPrepTime: (minutes: number | null) => void;
  setMaxPrepTime: (minutes: number | null) => void;
  setMealType: (mealType: string | null) => void;
  toggleTopRated: () => void;
  toggleNewOnly: () => void;
  setShowMobileFilters: (show: boolean) => void;
  resetFilters: () => void;
  setKitchens: (category: string | null, kitchens: KitchenData[]) => void;
  setCategories: (categories: CategoryData[]) => void;
  setPagination: (pagination: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  }) => void;
}

export const kitchensGridStore = create<KitchensGridState>()((set) => ({
  kitchens: [],
  categories: [],
  selectedCategory: null,
  sortOption: null,
  vegFilter: null,
  selectedCuisines: [],
  minRating: null,
  minPrepTime: null,
  maxPrepTime: null,
  mealType: null,
  topRatedOnly: false,
  newOnly: false,
  showMobileFilters: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortOption: (sortOption) => set({ sortOption }),
  setVegFilter: (vegFilter) => set({ vegFilter }),
  setSelectedCuisines: (selectedCuisines) => set({ selectedCuisines }),
  toggleCuisine: (cuisineId) =>
    set((state) => ({
      selectedCuisines: state.selectedCuisines.includes(cuisineId)
        ? state.selectedCuisines.filter((id) => id !== cuisineId)
        : [...state.selectedCuisines, cuisineId],
    })),
  setMinRating: (minRating) => set({ minRating }),
  setMinPrepTime: (minPrepTime) => set({ minPrepTime }),
  setMaxPrepTime: (maxPrepTime) => set({ maxPrepTime }),
  setMealType: (mealType) => set({ mealType }),
  toggleTopRated: () => set((state) => ({ topRatedOnly: !state.topRatedOnly })),
  toggleNewOnly: () => set((state) => ({ newOnly: !state.newOnly })),
  setShowMobileFilters: (showMobileFilters) => set({ showMobileFilters }),
  resetFilters: () =>
    set({
      selectedCategory: null,
      sortOption: null,
      vegFilter: null,
      selectedCuisines: [],
      minRating: null,
      minPrepTime: null,
      maxPrepTime: null,
      mealType: null,
      topRatedOnly: false,
      newOnly: false,
    }),
  setKitchens: (category, kitchens) => set({ kitchens }),
  setCategories: (categories) => set({ categories }),
  setPagination: (pagination) => set(pagination),
}));

const selectKitchens = (s: KitchensGridState) => s.kitchens;
const selectCategories = (s: KitchensGridState) => s.categories;
const selectPagination = (s: KitchensGridState) => ({
  hasNextPage: s.hasNextPage,
  isFetchingNextPage: s.isFetchingNextPage,
  isLoading: s.isLoading,
});
const selectFilters = (s: KitchensGridState) => ({
  selectedCategory: s.selectedCategory,
  sortOption: s.sortOption,
  vegFilter: s.vegFilter,
  selectedCuisines: s.selectedCuisines,
  minRating: s.minRating,
  minPrepTime: s.minPrepTime,
  maxPrepTime: s.maxPrepTime,
  mealType: s.mealType,
  topRatedOnly: s.topRatedOnly,
  newOnly: s.newOnly,
  showMobileFilters: s.showMobileFilters,
});
const selectActions = (s: KitchensGridState) => ({
  setSelectedCategory: s.setSelectedCategory,
  setSortOption: s.setSortOption,
  setVegFilter: s.setVegFilter,
  setSelectedCuisines: s.setSelectedCuisines,
  toggleCuisine: s.toggleCuisine,
  setMinRating: s.setMinRating,
  setMinPrepTime: s.setMinPrepTime,
  setMaxPrepTime: s.setMaxPrepTime,
  setMealType: s.setMealType,
  toggleTopRated: s.toggleTopRated,
  toggleNewOnly: s.toggleNewOnly,
  setShowMobileFilters: s.setShowMobileFilters,
  resetFilters: s.resetFilters,
});

export function useKitchensGridData() {
  return kitchensGridStore(selectKitchens);
}

export function useKitchensGridCategories() {
  return kitchensGridStore(selectCategories);
}

export function useKitchensGridPagination() {
  return kitchensGridStore(useShallow(selectPagination));
}

export function useKitchensGridFilters() {
  return kitchensGridStore(useShallow(selectFilters));
}

export function useKitchensGridActions() {
  return kitchensGridStore(useShallow(selectActions));
}

/**
 * Fetches the kitchen explorer results via TanStack Query (infinite
 * pagination, category-aware) and syncs the fetched pages into the store.
 * Returns the underlying query so callers can trigger fetchNextPage.
 */
export function useKitchensGridQuery(category?: string | null) {
  const query = useExploreKitchens(category);

  useEffect(() => {
    kitchensGridStore.getState().setPagination({
      hasNextPage: !!query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
      isLoading: query.isLoading,
    });
  }, [query.hasNextPage, query.isFetchingNextPage, query.isLoading]);

  // Fetch every page from the backend so the grid (and client-side
  // pagination) always works over the complete, real-time kitchen list.
  useEffect(() => {
    if (
      !query.isLoading &&
      !query.isPending &&
      !query.isError &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      query.fetchNextPage();
    }
  }, [query, query.hasNextPage, query.isFetchingNextPage, query.isLoading, query.isPending, query.isError, query.fetchNextPage]);

  useEffect(() => {
    const pages = query.data?.pages ?? [];
    if (query.isLoading || query.isPending) {
      kitchensGridStore.getState().setKitchens(category ?? null, []);
      return;
    }
    const seen = new Set<string>();
    const list = pages.flatMap((page) => page.data ?? []).filter((kitchen) => {
      if (seen.has(kitchen.id)) return false;
      seen.add(kitchen.id);
      return true;
    });
    kitchensGridStore.getState().setKitchens(category ?? null, list);
  }, [query, query.data, query.isLoading, query.isPending, category]);

  return query;
}

/**
 * Fetches the real cuisine categories and syncs them into the store.
 */
export function useKitchensGridCategoriesQuery() {
  const query = useKitchenCategories();

  useEffect(() => {
    if (query.data) {
      kitchensGridStore.getState().setCategories(query.data);
    }
  }, [query.data]);

  return query;
}
