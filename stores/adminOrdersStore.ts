import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrderStatus } from "@/actions/orders/orders";

/** Shape of an admin order row as returned by getAdminOrders. */
export interface AdminOrder {
  id: string;
  publicCode: string | null;
  customer: { name?: string | null; phone?: string | null; email?: string | null };
  kitchen: { name?: string | null; address?: string; phone?: string | null };
  items: { id: string; name: string; price: number; quantity: number; imageUrl?: string }[];
  date: string;
  amount: number;
  discountAmount: number;
  serviceDate: string;
  timeSlot: string;
  status: string;
  deliveryStatus?: string | null;
  payment?: string | null;
  paymentProvider?: string | null;
  paymentMethod?: string | null;
  providerOrderId?: string | null;
  deliveryAddress?: {
    lineOne?: string | null;
    lineTwo?: string | null;
    pincode?: string | null;
    label?: string | null;
  } | null;
  statusHistory: { id: string; status: string; changedAt: string; note?: string | null }[];
  deliveryPartner: { id: string; name?: string | null; phone?: string | null } | null;
}

/** Valid order statuses and the next status in the fulfilment flow. */
export const NEXT_STATUS: Record<string, string> = {
  CONFIRMED: "PREPARING",
  PREPARING: "READYFORPICKUP",
  READYFORPICKUP: "COMPLETED",
};

/** Human-readable labels for order statuses. */
export const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READYFORPICKUP: "Ready for Pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

/** State shape for the admin orders store. */
interface AdminOrdersState {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  setOrders: (orders: AdminOrder[]) => void;
  setSelectedOrder: (order: AdminOrder | null) => void;
  resetAdminOrdersState: () => void;
}

/** Selector returning the orders list. */
export const selectAdminOrders = (s: AdminOrdersState) => s.orders;
/** Selector returning the order currently open in the detail sheet. */
export const selectAdminSelectedOrder = (s: AdminOrdersState) => s.selectedOrder;
/** Selector returning all orders actions in a single object (stable via shallow). */
export const selectAdminOrdersActions = (s: AdminOrdersState) => ({
  setOrders: s.setOrders,
  setSelectedOrder: s.setSelectedOrder,
  resetAdminOrdersState: s.resetAdminOrdersState,
});

/**
 * Zustand store for the admin orders page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the sheet selection lives here too.
 */
export const adminOrdersStore = create<AdminOrdersState>()((set) => ({
  orders: [],
  selectedOrder: null,
  setOrders: (orders: AdminOrder[]) => set({ orders }),
  setSelectedOrder: (selectedOrder: AdminOrder | null) => set({ selectedOrder }),
  resetAdminOrdersState: () => set({ orders: [], selectedOrder: null }),
}));

/** Hook returning the orders list. */
export function useAdminOrders() {
  return adminOrdersStore(selectAdminOrders);
}
/** Hook returning the order open in the detail sheet. */
export function useAdminSelectedOrder() {
  return adminOrdersStore(selectAdminSelectedOrder);
}
/** Hook returning all orders actions (stable reference). */
export function useAdminOrdersActions() {
  return adminOrdersStore(useShallow(selectAdminOrdersActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin orders list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminOrdersQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-orders-list"],
    queryFn: getAdminOrders,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminOrdersStore.getState().setOrders(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Updates an order's status. Invalidates the orders query on success.
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-list"] });
    },
  });
}
