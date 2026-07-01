import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { globalEventBus, AppEvents } from "@/lib/patterns/event-bus";

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

// Fine-grained selectors for stable references
export const selectSearchQuery = (s: MenuState) => s.searchQuery;
export const selectFoodType = (s: MenuState) => s.selectedFoodType;
export const selectTimeSlot = (s: MenuState) => s.selectedTimeSlot;
export const selectMenuTab = (s: MenuState) => s.selectedTab;
export const selectDeliveryAddress = (s: MenuState) => s.deliveryAddress;
export const selectMenuActions = (s: MenuState) => ({
  setSearchQuery: s.setSearchQuery,
  setSelectedFoodType: s.setSelectedFoodType,
  setSelectedTimeSlot: s.setSelectedTimeSlot,
  setSelectedTab: s.setSelectedTab,
  setDeliveryAddress: s.setDeliveryAddress,
});

export const menuStore = create<MenuState>((set) => ({
  searchQuery: "",
  selectedFoodType: "ALL",
  selectedTimeSlot: "ALL",
  selectedTab: "menu",
  deliveryAddress: "",
  setSearchQuery: (value: string) => {
    set({ searchQuery: value });
    globalEventBus.emit(AppEvents.MENU_FILTER_CHANGED, { type: "search", value });
  },
  setSelectedFoodType: (value: FoodTypeFilter) => {
    set({ selectedFoodType: value });
    globalEventBus.emit(AppEvents.MENU_FILTER_CHANGED, { type: "foodType", value });
  },
  setSelectedTimeSlot: (value: TimeSlotFilter) => {
    set({ selectedTimeSlot: value });
    globalEventBus.emit(AppEvents.MENU_FILTER_CHANGED, { type: "timeSlot", value });
  },
  setSelectedTab: (value: MenuTab) => set({ selectedTab: value }),
  setDeliveryAddress: (value: string) => set({ deliveryAddress: value }),
}));

export function useMenuSearchQuery() {
  return menuStore(selectSearchQuery);
}
export function useMenuFoodType() {
  return menuStore(selectFoodType);
}
export function useMenuTimeSlot() {
  return menuStore(selectTimeSlot);
}
export function useMenuTab() {
  return menuStore(selectMenuTab);
}
export function useMenuDeliveryAddress() {
  return menuStore(selectDeliveryAddress);
}
export function useMenuActions() {
  return menuStore(useShallow(selectMenuActions));
}
