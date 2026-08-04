import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import { globalEventBus, AppEvents } from "@/lib/patterns/event-bus";
import { getUserAddresses } from "@/actions/cart-checkout/address";
import { getCartConfig } from "@/actions/cart-checkout/config";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  kitchenId?: string;
  imageUrl?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  description?: string;
}

export type OrderType = "PREBOOK";

/** Saved address row used on the cart page (from getUserAddresses). */
export interface CartAddress {
  id: string;
  label: string | null;
  lineOne: string;
  lineTwo: string | null;
  pincode: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
  serviceZone: { name: string } | null;
}

/** Checkout charges config (from getCartConfig). */
export interface CartConfig {
  packagingCharge: number;
  deliveryCharge: number;
  freeDeliveryMin: number;
}

/** Coupon offer row returned by /api/coupon/offers. */
export interface CouponOffer {
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  minOrderValue: number | null;
}

interface CartState {
  cart: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  orderType: OrderType;
  addresses: CartAddress[];
  cartConfig: CartConfig | null;
  availableCoupons: CouponOffer[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setOrderType: (type: OrderType) => void;
  setAddresses: (addresses: CartAddress[]) => void;
  setCartConfig: (config: CartConfig | null) => void;
  setAvailableCoupons: (coupons: CouponOffer[]) => void;
  resetCartData: () => void;
}

// Fine-grained selectors for stable references and minimal re-renders
export const selectCartItems = (s: CartState) => s.cart;
export const selectCartCount = (s: CartState) => s.cart.reduce((total, item) => total + item.qty, 0);
export const selectCartTotal = (s: CartState) => s.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
export const selectCartActions = (s: CartState) => ({
  addToCart: s.addToCart,
  removeFromCart: s.removeFromCart,
  updateQuantity: s.updateQuantity,
  clearCart: s.clearCart,
  applyCoupon: s.applyCoupon,
  removeCoupon: s.removeCoupon,
  setOrderType: s.setOrderType,
});

export const selectCartCoupon = (s: CartState) => s.appliedCoupon;

export const selectCartOrderType = (s: CartState) => s.orderType;

export const selectCartAddresses = (s: CartState) => s.addresses;
export const selectCartConfig = (s: CartState) => s.cartConfig;
export const selectCartAvailableCoupons = (s: CartState) => s.availableCoupons;
export const selectCartDataActions = (s: CartState) => ({
  setAddresses: s.setAddresses,
  setCartConfig: s.setCartConfig,
  setAvailableCoupons: s.setAvailableCoupons,
  resetCartData: s.resetCartData,
});

export const cartStore = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        cart: [],
        appliedCoupon: null,
        orderType: "PREBOOK" as OrderType,
        addresses: [],
        cartConfig: null,
        availableCoupons: [],
        setOrderType: () => {},
        addToCart: (item: CartItem) => {
          set((state) => {
            const existing = state.cart.find((cartItem) => cartItem.id === item.id);
            if (existing) {
              return {
                cart: state.cart.map((cartItem) =>
                  cartItem.id === item.id
                    ? { ...cartItem, qty: cartItem.qty + item.qty }
                    : cartItem
                ),
              };
            }
            return { cart: [...state.cart, item] };
          });
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "add", item });
        },
        removeFromCart: (id: string) => {
          set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "remove", id });
        },
        updateQuantity: (id: string, qty: number) => {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.id === id ? { ...item, qty: qty < 1 ? 1 : qty } : item
            ),
          }));
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "update-qty", id, qty });
        },
        clearCart: () => {
          set({ cart: [], appliedCoupon: null });
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "clear" });
        },
        applyCoupon: (coupon: AppliedCoupon) => {
          set({ appliedCoupon: coupon });
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "apply-coupon", coupon });
        },
        removeCoupon: () => {
          set({ appliedCoupon: null });
          globalEventBus.emit(AppEvents.CART_UPDATED, { action: "remove-coupon" });
        },
        setAddresses: (addresses: CartAddress[]) => set({ addresses }),
        setCartConfig: (cartConfig: CartConfig | null) => set({ cartConfig }),
        setAvailableCoupons: (availableCoupons: CouponOffer[]) => set({ availableCoupons }),
        resetCartData: () => set({ addresses: [], cartConfig: null, availableCoupons: [] }),
      }),
      {
        name: "rrc-cart",
        // Only the user's client-side cart state is persisted; server data
        // (addresses, config, coupons) is always fetched from the backend.
        partialize: (state) => ({
          cart: state.cart,
          appliedCoupon: state.appliedCoupon,
          orderType: state.orderType,
        }),
      }
    )
  )
);

// Stable hooks with fine-grained selectors
export function useCartItems() {
  return cartStore(selectCartItems);
}
export function useCartCount() {
  return cartStore(selectCartCount);
}
export function useCartTotal() {
  return cartStore(selectCartTotal);
}
export function useCartActions() {
  return cartStore(useShallow(selectCartActions));
}
export function useCartCoupon() {
  return cartStore(selectCartCoupon);
}
export function useCartOrderType() {
  return cartStore(selectCartOrderType);
}
export function useCartAddresses() {
  return cartStore(selectCartAddresses);
}
export function useCartConfig() {
  return cartStore(selectCartConfig);
}
export function useCartAvailableCoupons() {
  return cartStore(selectCartAvailableCoupons);
}
export function useCartDataActions() {
  return cartStore(useShallow(selectCartDataActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the user's saved addresses via TanStack Query and syncs the
 * result into the zustand store. Runs only when the user is logged in.
 */
export function useCartAddressesQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: async () => {
      const result = await getUserAddresses();
      return result as unknown as CartAddress[];
    },
    enabled,
  });

  useEffect(() => {
    cartStore.getState().setAddresses(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the cart charges config via TanStack Query and syncs the
 * result into the zustand store.
 */
export function useCartConfigQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["cart-config"],
    queryFn: getCartConfig,
  });

  useEffect(() => {
    cartStore.getState().setCartConfig(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the available coupon offers for the given cart total via
 * TanStack Query and syncs the result into the zustand store. The query
 * is keyed by cart total so the offers always match the current cart.
 */
export function useCartCouponsQuery(cartTotal: number) {
  const { data, ...rest } = useQuery({
    queryKey: ["cart-sidebar-coupons", cartTotal],
    queryFn: async () => {
      const res = await fetch("/api/coupon/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartTotal }),
      });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.coupons || []) as CouponOffer[];
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });

  useEffect(() => {
    cartStore.getState().setAvailableCoupons(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}
