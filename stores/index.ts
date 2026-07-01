export * from "./authStore";
export * from "./cartStore";
export * from "./menuStore";

// Backward compatible re-exports
import { authStore } from "./authStore";
import { cartStore } from "./cartStore";
import { menuStore } from "./menuStore";
import type { CartItem } from "./cartStore";
import type { FoodTypeFilter, TimeSlotFilter } from "./menuStore";
import type { UserRole } from "./authStore";

export { authStore, cartStore, menuStore };
export type { CartItem, FoodTypeFilter, TimeSlotFilter, UserRole };

// Legacy hook-style accessors for backward compatibility
export const useAuthStore = authStore;
export const useCartStore = cartStore;
export const useMenuStore = menuStore;
