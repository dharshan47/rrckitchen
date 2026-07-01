import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import { globalEventBus, AppEvents } from "@/lib/patterns/event-bus";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
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
});

export const cartStore = create<CartState>()(
  subscribeWithSelector((set, get) => ({
    cart: [],
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
      set({ cart: [] });
      globalEventBus.emit(AppEvents.CART_UPDATED, { action: "clear" });
    },
  }))
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
