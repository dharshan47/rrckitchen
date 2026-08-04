"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartStore, type CartItem } from "@/stores/cartStore";
import { executeCommand, AddToCartCommand, UpdateCartQuantityCommand, ClearCartCommand } from "@/lib/patterns";

const cartQueryKey = ["cart"] as const;

/**
 * Optimistic cart built on TanStack Query. The persisted zustand store stays the
 * source of truth; mutations apply an optimistic update to the query cache first,
 * run the command (which writes the store), and sync the cache back from the
 * store when settled so both layers can never diverge for long.
 */
export function useOptimisticCart() {
  const queryClient = useQueryClient();
  const storeCart = cartStore((s) => s.cart);

  const { data: cart } = useQuery<CartItem[]>({
    queryKey: cartQueryKey,
    queryFn: () => cartStore.getState().cart,
    enabled: false,
    initialData: storeCart,
  });

  const syncFromStore = useCallback((snapshot: CartItem[]) => {
    const current = cartStore.getState().cart;
    if (current !== snapshot) {
      queryClient.setQueryData<CartItem[]>(cartQueryKey, current);
    }
  }, [queryClient]);

  const addToCartMutation = useMutation({
    mutationFn: (item: CartItem) => executeCommand(new AddToCartCommand(item)),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? [];
      const snapshot = cartStore.getState().cart;
      queryClient.setQueryData<CartItem[]>(cartQueryKey, (state) => {
        const items = state ?? previous;
        const existing = items.find((i) => i.id === item.id);
        if (existing) return items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i));
        return [...items, item];
      });
      return { previous, snapshot };
    },
    onError: (_err, _item, ctx) => {
      if (ctx?.previous) queryClient.setQueryData<CartItem[]>(cartQueryKey, ctx.previous);
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.snapshot) syncFromStore(ctx.snapshot);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      executeCommand(new UpdateCartQuantityCommand(id, cartStore.getState().cart.find((i) => i.id === id)?.qty ?? 1, qty)),
    onMutate: async ({ id, qty }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? [];
      const snapshot = cartStore.getState().cart;
      queryClient.setQueryData<CartItem[]>(cartQueryKey, (state) => {
        const items = state ?? previous;
        return items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
      });
      return { previous, snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData<CartItem[]>(cartQueryKey, ctx.previous);
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.snapshot) syncFromStore(ctx.snapshot);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      cartStore.getState().removeFromCart(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? [];
      const snapshot = cartStore.getState().cart;
      queryClient.setQueryData<CartItem[]>(cartQueryKey, (state) => (state ?? previous).filter((i) => i.id !== id));
      return { previous, snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData<CartItem[]>(cartQueryKey, ctx.previous);
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.snapshot) syncFromStore(ctx.snapshot);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => executeCommand(new ClearCartCommand()),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? [];
      const snapshot = cartStore.getState().cart;
      queryClient.setQueryData<CartItem[]>(cartQueryKey, []);
      return { previous, snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData<CartItem[]>(cartQueryKey, ctx.previous);
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.snapshot) syncFromStore(ctx.snapshot);
    },
  });

  const addToCart = useCallback((item: CartItem) => addToCartMutation.mutateAsync(item), [addToCartMutation]);
  const updateQuantity = useCallback((id: string, qty: number) => updateQuantityMutation.mutateAsync({ id, qty }), [updateQuantityMutation]);
  const removeFromCart = useCallback((id: string) => removeFromCartMutation.mutateAsync(id), [removeFromCartMutation]);
  const clearCart = useCallback(() => clearCartMutation.mutateAsync(), [clearCartMutation]);

  const items = cart ?? [];

  return {
    cart: items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
  };
}
