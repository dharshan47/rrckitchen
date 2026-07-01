"use client";

import { useCallback, useOptimistic, startTransition } from "react";
import { cartStore, type CartItem } from "@/stores/cartStore";
import { executeCommand, AddToCartCommand, UpdateCartQuantityCommand, ClearCartCommand } from "@/lib/patterns";

export function useOptimisticCart() {
  const cart = cartStore((s) => s.cart);
  const [optimisticCart, addOptimistic] = useOptimistic(
    cart,
    (state, action: { type: "add" | "update-qty" | "remove" | "clear"; payload: CartItem | { id: string; qty: number } | string }) => {
      switch (action.type) {
        case "add": {
          const item = action.payload as CartItem;
          const existing = state.find((i) => i.id === item.id);
          if (existing) {
            return state.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i));
          }
          return [...state, item];
        }
        case "update-qty": {
          const { id, qty } = action.payload as { id: string; qty: number };
          return state.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
        }
        case "remove":
          return state.filter((i) => i.id !== (action.payload as string));
        case "clear":
          return [];
        default:
          return state;
      }
    }
  );

  const addToCart = useCallback(async (item: CartItem) => {
    startTransition(() => addOptimistic({ type: "add", payload: item }));
    await executeCommand(new AddToCartCommand(item));
  }, [addOptimistic]);

  const updateQuantity = useCallback(async (id: string, qty: number) => {
    startTransition(() => addOptimistic({ type: "update-qty", payload: { id, qty } }));
    await executeCommand(new UpdateCartQuantityCommand(id, cart.find((i) => i.id === id)?.qty ?? 1, qty));
  }, [addOptimistic, cart]);

  const removeFromCart = useCallback(async (id: string) => {
    startTransition(() => addOptimistic({ type: "remove", payload: id }));
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().removeFromCart(id);
  }, [addOptimistic]);

  const clearCart = useCallback(async () => {
    startTransition(() => addOptimistic({ type: "clear", payload: "" }));
    await executeCommand(new ClearCartCommand());
  }, [addOptimistic]);

  return {
    cart: optimisticCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total: optimisticCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    itemCount: optimisticCart.reduce((sum, item) => sum + item.qty, 0),
  };
}
