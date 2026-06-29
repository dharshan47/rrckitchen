import { create } from "zustand";

export type FoodTypeFilter = "ALL" | "VEG" | "NONVEG";
export type TimeSlotFilter = "ALL" | "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";

type MenuTab = "menu" | "cart";

interface MenuState {
  searchQuery: string;
  selectedFoodType: FoodTypeFilter;
  selectedTimeSlot: TimeSlotFilter;
  selectedTab: MenuTab;
  deliveryAddress: string;
  setSearchQuery: (value: string) => void;
  setSelectedFoodType: (value: FoodTypeFilter) => void;
  setSelectedTimeSlot: (value: TimeSlotFilter) => void;
  setSelectedTab: (value: MenuTab) => void;
  setDeliveryAddress: (value: string) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  searchQuery: "",
  selectedFoodType: "ALL",
  selectedTimeSlot: "ALL",
  selectedTab: "menu",
  deliveryAddress: "",
  setSearchQuery: (value: string) => set({ searchQuery: value }),
  setSelectedFoodType: (value: FoodTypeFilter) => set({ selectedFoodType: value }),
  setSelectedTimeSlot: (value: TimeSlotFilter) => set({ selectedTimeSlot: value }),
  setSelectedTab: (value: MenuTab) => set({ selectedTab: value }),
  setDeliveryAddress: (value: string) => set({ deliveryAddress: value }),
}));
