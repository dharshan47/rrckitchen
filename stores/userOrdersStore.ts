import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders, type UserOrder } from "@/actions/orders/orders";

/** Valid filter tabs on the orders page. */
export type OrdersTab = "all" | "ongoing" | "completed" | "cancelled" | "refunds";

/** Valid sort orders on the orders page. */
export type OrdersSortOrder = "latest" | "oldest";

/** State shape for the user orders store. */
interface UserOrdersState {
  orders: UserOrder[];
  activeTab: OrdersTab;
  sortOrder: OrdersSortOrder;
  setOrders: (orders: UserOrder[]) => void;
  setActiveTab: (tab: OrdersTab) => void;
  setSortOrder: (sort: OrdersSortOrder) => void;
  resetUserOrdersState: () => void;
}

/** Selector returning the orders list. */
export const selectUserOrdersList = (s: UserOrdersState) => s.orders;
/** Selector returning the active filter tab. */
export const selectUserOrdersTab = (s: UserOrdersState) => s.activeTab;
/** Selector returning the current sort order. */
export const selectUserOrdersSort = (s: UserOrdersState) => s.sortOrder;
/** Selector returning all user orders actions in a single object (stable via shallow). */
export const selectUserOrdersActions = (s: UserOrdersState) => ({
  setOrders: s.setOrders,
  setActiveTab: s.setActiveTab,
  setSortOrder: s.setSortOrder,
  resetUserOrdersState: s.resetUserOrdersState,
});

/**
 * Zustand store for the account orders page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; tab/sort UI state lives here too.
 */
export const userOrdersStore = create<UserOrdersState>()((set) => ({
  orders: [],
  activeTab: "all",
  sortOrder: "latest",
  setOrders: (orders: UserOrder[]) => set({ orders }),
  setActiveTab: (activeTab: OrdersTab) => set({ activeTab }),
  setSortOrder: (sortOrder: OrdersSortOrder) => set({ sortOrder }),
  resetUserOrdersState: () => set({ orders: [], activeTab: "all", sortOrder: "latest" }),
}));

/** Hook returning the orders list. */
export function useUserOrdersList() {
  return userOrdersStore(selectUserOrdersList);
}
/** Hook returning the active filter tab. */
export function useUserOrdersTab() {
  return userOrdersStore(selectUserOrdersTab);
}
/** Hook returning the current sort order. */
export function useUserOrdersSort() {
  return userOrdersStore(selectUserOrdersSort);
}
/** Hook returning all user orders actions (stable reference). */
export function useUserOrdersActions() {
  return userOrdersStore(useShallow(selectUserOrdersActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the user's orders via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s and runs only when the
 * user is logged in.
 */
export function useUserOrdersListQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["orders"],
    queryFn: getUserOrders,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    userOrdersStore.getState().setOrders(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}
