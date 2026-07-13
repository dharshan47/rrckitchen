import { create } from "zustand";
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow";
import { globalEventBus, AppEvents } from "@/lib/patterns/event-bus";

export type FoodTypeFilter = "ALL" | "VEG" | "NONVEG";
export type TimeSlotFilter = "ALL" | "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";
type MenuTab = "menu" | "cart";

/** State shape for the menu store. */
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

/** Selector returning the current search query. */
export const selectSearchQuery = (s: MenuState) => s.searchQuery;
/** Selector returning the current food type filter. */
export const selectFoodType = (s: MenuState) => s.selectedFoodType;
/** Selector returning the current time slot filter. */
export const selectTimeSlot = (s: MenuState) => s.selectedTimeSlot;
/** Selector returning the current active tab. */
export const selectMenuTab = (s: MenuState) => s.selectedTab;
/** Selector returning the delivery address. */
export const selectDeliveryAddress = (s: MenuState) => s.deliveryAddress;
/** Selector returning all menu actions in a single object (stable reference via shallow). */
export const selectMenuActions = (s: MenuState) => ({
  setSearchQuery: s.setSearchQuery,
  setSelectedFoodType: s.setSelectedFoodType,
  setSelectedTimeSlot: s.setSelectedTimeSlot,
  setSelectedTab: s.setSelectedTab,
  setDeliveryAddress: s.setDeliveryAddress,
});

/**
 * Zustand store for menu search/filter state.
 * Emits events on the global event bus when filters change.
 */
export const menuStore = create<MenuState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "rrc-menu-store",
      partialize: (state) => ({ deliveryAddress: state.deliveryAddress }),
    }
  )
);

/** Hook returning the current search query value. */
export function useMenuSearchQuery() {
  return menuStore(selectSearchQuery);
}
/** Hook returning the current food type filter. */
export function useMenuFoodType() {
  return menuStore(selectFoodType);
}
/** Hook returning the current time slot filter. */
export function useMenuTimeSlot() {
  return menuStore(selectTimeSlot);
}
/** Hook returning the current active tab. */
export function useMenuTab() {
  return menuStore(selectMenuTab);
}
/** Hook returning the delivery address. */
export function useMenuDeliveryAddress() {
  return menuStore(selectDeliveryAddress);
}
/** Hook returning all menu actions (stable reference). */
export function useMenuActions() {
  return menuStore(useShallow(selectMenuActions));
}
