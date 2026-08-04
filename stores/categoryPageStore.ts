import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type CategorySort =
  | "Popularity"
  | "Rating"
  | "Newest"
  | "Price Low"
  | "Price High"
  | "Recommended";

export const CATEGORY_SORT_OPTIONS: { value: CategorySort; label: string }[] = [
  { value: "Popularity", label: "Popularity" },
  { value: "Rating", label: "Rating" },
  { value: "Newest", label: "Newest" },
  { value: "Price Low", label: "Price Low" },
  { value: "Price High", label: "Price High" },
  { value: "Recommended", label: "Recommended" },
];

interface CategoryPageState {
  mealTypes: string[];
  foodTypes: string[];
  cuisines: string[];
  deliveryTime: string | null;
  minRating: number | null;
  sortBy: CategorySort;
  visibleCount: number;
  pageSize: number;
  toggleMealType: (value: string) => void;
  toggleFoodType: (value: string) => void;
  toggleCuisine: (value: string) => void;
  setDeliveryTime: (value: string | null) => void;
  setMinRating: (value: number | null) => void;
  setSortBy: (sort: CategorySort) => void;
  clearFilters: () => void;
  loadMore: () => void;
  reset: () => void;
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export const categoryPageStore = create<CategoryPageState>()((set, get) => ({
  mealTypes: [],
  foodTypes: [],
  cuisines: [],
  deliveryTime: null,
  minRating: null,
  sortBy: "Popularity",
  visibleCount: 12,
  pageSize: 12,

  toggleMealType: (value) =>
    set({ mealTypes: toggleInArray(get().mealTypes, value), visibleCount: 12 }),
  toggleFoodType: (value) =>
    set({ foodTypes: toggleInArray(get().foodTypes, value), visibleCount: 12 }),
  toggleCuisine: (value) =>
    set({ cuisines: toggleInArray(get().cuisines, value), visibleCount: 12 }),
  setDeliveryTime: (value) => set({ deliveryTime: value, visibleCount: 12 }),
  setMinRating: (value) => set({ minRating: value, visibleCount: 12 }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFilters: () =>
    set({ mealTypes: [], foodTypes: [], cuisines: [], deliveryTime: null, minRating: null, visibleCount: 12 }),
  loadMore: () => set({ visibleCount: get().visibleCount + get().pageSize }),
  reset: () =>
    set({
      mealTypes: [],
      foodTypes: [],
      cuisines: [],
      deliveryTime: null,
      minRating: null,
      sortBy: "Popularity",
      visibleCount: 12,
    }),
}));

export function useCategoryFilters() {
  return categoryPageStore(
    useShallow((s) => ({
      mealTypes: s.mealTypes,
      foodTypes: s.foodTypes,
      cuisines: s.cuisines,
      deliveryTime: s.deliveryTime,
      minRating: s.minRating,
      sortBy: s.sortBy,
      visibleCount: s.visibleCount,
      toggleMealType: s.toggleMealType,
      toggleFoodType: s.toggleFoodType,
      toggleCuisine: s.toggleCuisine,
      setDeliveryTime: s.setDeliveryTime,
      setMinRating: s.setMinRating,
      setSortBy: s.setSortBy,
      clearFilters: s.clearFilters,
      loadMore: s.loadMore,
    }))
  );
}

export function useCategorySort() {
  return categoryPageStore((s) => s.sortBy);
}
