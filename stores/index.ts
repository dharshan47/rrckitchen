export * from "./authStore";
export * from "./cartStore";
export * from "./menuStore";
export * from "./adminStore";
export * from "./adminCustomersStore";
export * from "./adminOrdersStore";
export * from "./adminMenuStore";
export * from "./adminKitchensStore";
export * from "./adminInvitesStore";
export * from "./acceptInviteStore";
export * from "./adminSupportStore";
export * from "./adminTwoFactorStore";
export * from "./adminTwoFactorSetupStore";
export * from "./adminPaymentsStore";
export * from "./adminCouponsStore";
export * from "./adminPaymentOffersStore";
export * from "./adminLoyaltyCouponsStore";
export * from "./adminCategoriesStore";
export * from "./cravingsPopupStore";
export * from "./adminDeliveryStore";
export * from "./searchEditorStore";
export * from "./kitchenSearchPageStore";
export * from "./kitchenDetailStore";
export * from "./kitchenReviewsStore";
export * from "./kitchensGridStore";
export * from "./helpStore";
export * from "./locationSearchStore";
export * from "./locationDialogStore";
export * from "./orderTrackingMapStore";
export * from "./thanjavurMapStore";
export * from "./userProfileStore";
export * from "./userOrdersStore";
export * from "./orderTrackingStore";
export * from "./supportStore";
export * from "./ratingStore";
export * from "./favouritesStore";
export * from "./loyaltyStore";
export * from "./liveChatStore";

// Backward compatible re-exports
import { authStore } from "./authStore";
import { cartStore } from "./cartStore";
import { menuStore } from "./menuStore";
import type { CartItem, AppliedCoupon } from "./cartStore";
import type { FoodTypeFilter, TimeSlotFilter } from "./menuStore";
import type { UserRole } from "./authStore";

export { authStore, cartStore, menuStore };
export type { CartItem, AppliedCoupon, FoodTypeFilter, TimeSlotFilter, UserRole };

// Legacy hook-style accessors for backward compatibility
export const useAuthStore = authStore;
export const useCartStore = cartStore;
export const useMenuStore = menuStore;