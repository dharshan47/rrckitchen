import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { getOrderForTracking, type OrderTrackingInfo } from "@/actions/orders/orders";

/** Order open in the delivery rating dialog. */
export interface RatingOrderSelection {
  id: string;
  deliveryPartnerId: string;
  deliveryPartnerName: string;
}

/** State shape for the order tracking store. */
interface OrderTrackingState {
  order: OrderTrackingInfo | null;
  ratingOrder: RatingOrderSelection | null;
  setOrder: (order: OrderTrackingInfo | null) => void;
  setRatingOrder: (ratingOrder: RatingOrderSelection | null) => void;
  resetOrderTrackingState: () => void;
}

/** Selector returning the tracked order. */
export const selectOrderTracking = (s: OrderTrackingState) => s.order;
/** Selector returning the order open in the rating dialog. */
export const selectRatingOrder = (s: OrderTrackingState) => s.ratingOrder;
/** Selector returning all tracking actions in a single object (stable via shallow). */
export const selectOrderTrackingActions = (s: OrderTrackingState) => ({
  setOrder: s.setOrder,
  setRatingOrder: s.setRatingOrder,
  resetOrderTrackingState: s.resetOrderTrackingState,
});

/**
 * Zustand store for the order tracking page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the rating dialog selection
 * lives here too.
 */
export const orderTrackingStore = create<OrderTrackingState>()((set) => ({
  order: null,
  ratingOrder: null,
  setOrder: (order: OrderTrackingInfo | null) => set({ order }),
  setRatingOrder: (ratingOrder: RatingOrderSelection | null) => set({ ratingOrder }),
  resetOrderTrackingState: () => set({ order: null, ratingOrder: null }),
}));

/** Hook returning the tracked order. */
export function useOrderTracking() {
  return orderTrackingStore(selectOrderTracking);
}
/** Hook returning the order open in the rating dialog. */
export function useRatingOrder() {
  return orderTrackingStore(selectRatingOrder);
}
/** Hook returning all tracking actions (stable reference). */
export function useOrderTrackingActions() {
  return orderTrackingStore(useShallow(selectOrderTrackingActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the order being tracked via TanStack Query and syncs the
 * result into the zustand store. Polls every 15s and runs only when
 * the user is logged in and an orderId is present.
 */
export function useOrderTrackingQuery(orderId: string, enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () => getOrderForTracking(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    orderTrackingStore.getState().setOrder(data ?? null);
  }, [data]);

  return { data, ...rest };
}
