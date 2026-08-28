import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import type { KitchenData } from "@/hooks/useExploreKitchens";

export interface Testimonial {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  userImage: string | null;
  kitchenName: string | null;
}

interface HomeState {
  selectedCategory: string | null;
  sortOption: SortOption | null;
  vegFilter: VegFilterValue;
  selectedCuisines: string[];
  setSelectedCategory: (category: string | null) => void;
  setSortOption: (option: SortOption | null) => void;
  setVegFilter: (filter: VegFilterValue) => void;
  setSelectedCuisines: (cuisines: string[]) => void;
}

const useHomeStore = create<HomeState>()((set) => ({
  selectedCategory: null,
  sortOption: null,
  vegFilter: null,
  selectedCuisines: [],
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortOption: (sortOption) => set({ sortOption }),
  setVegFilter: (vegFilter) => set({ vegFilter }),
  setSelectedCuisines: (selectedCuisines) => set({ selectedCuisines }),
}));

export function useHomeFilters() {
  return useHomeStore(
    useShallow((state) => ({
      selectedCategory: state.selectedCategory,
      sortOption: state.sortOption,
      vegFilter: state.vegFilter,
      selectedCuisines: state.selectedCuisines,
    }))
  );
}

export function useHomeActions() {
  return useHomeStore(
    useShallow((state) => ({
      setSelectedCategory: state.setSelectedCategory,
      setSortOption: state.setSortOption,
      setVegFilter: state.setVegFilter,
      setSelectedCuisines: state.setSelectedCuisines,
    }))
  );
}

export function useHomeKitchensQuery() {
  return useQuery<KitchenData[]>({
    queryKey: ["home-kitchens"],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      const res = await fetch(`/api/kitchen/explore?${params}`);
      if (!res.ok) throw new Error("Failed to load home chefs");
      const json = (await res.json()) as { data: KitchenData[] };
      return json.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useTestimonialsQuery() {
  return useQuery<Testimonial[]>({
    queryKey: ["home-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/home/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      const json = (await res.json()) as { data: Testimonial[] };
      return json.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
