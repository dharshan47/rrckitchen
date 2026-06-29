import { create } from "zustand";

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
  cartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  addToCart: (item: CartItem) =>
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
    }),
  removeFromCart: (id: string) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
  updateQuantity: (id: string, qty: number) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: qty < 1 ? 1 : qty,
            }
          : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
  cartCount: () => get().cart.reduce((total, item) => total + item.qty, 0),
}));
