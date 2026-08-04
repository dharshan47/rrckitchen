import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserOrders, type UserOrder } from "@/actions/orders/orders";
import {
  submitKitchenReview,
  submitDeliveryReview,
} from "@/actions/reviews/review-actions";

/** Current step of the rating flow. */
export type RatingStep = "kitchen" | "delivery" | "done";

/** State shape for the rating page store. */
interface RatingState {
  orders: UserOrder[];
  step: RatingStep;
  tasteRating: number;
  packagingRating: number;
  portionRating: number;
  kitchenOverall: number;
  kitchenTags: string[];
  kitchenThoughts: string;
  deliveryRating: number;
  speedRating: number;
  deliveryTags: string[];
  deliveryThoughts: string;
  hoveredTaste: number;
  hoveredPackaging: number;
  hoveredPortion: number;
  hoveredKitchen: number;
  hoveredDelivery: number;
  hoveredSpeed: number;
  setOrders: (orders: UserOrder[]) => void;
  setStep: (step: RatingStep) => void;
  setTasteRating: (n: number) => void;
  setPackagingRating: (n: number) => void;
  setPortionRating: (n: number) => void;
  setKitchenOverall: (n: number) => void;
  setKitchenTags: (tags: string[]) => void;
  setKitchenThoughts: (text: string) => void;
  setDeliveryRating: (n: number) => void;
  setSpeedRating: (n: number) => void;
  setDeliveryTags: (tags: string[]) => void;
  setDeliveryThoughts: (text: string) => void;
  setHoveredTaste: (n: number) => void;
  setHoveredPackaging: (n: number) => void;
  setHoveredPortion: (n: number) => void;
  setHoveredKitchen: (n: number) => void;
  setHoveredDelivery: (n: number) => void;
  setHoveredSpeed: (n: number) => void;
  resetRatingState: () => void;
}

/** Selector returning the orders list. */
export const selectRatingOrders = (s: RatingState) => s.orders;
/** Selector returning the current flow step. */
export const selectRatingStep = (s: RatingState) => s.step;
/** Selector returning the kitchen ratings form values. */
export const selectKitchenRatings = (s: RatingState) => ({
  tasteRating: s.tasteRating,
  packagingRating: s.packagingRating,
  portionRating: s.portionRating,
  kitchenOverall: s.kitchenOverall,
  kitchenTags: s.kitchenTags,
  kitchenThoughts: s.kitchenThoughts,
  hoveredTaste: s.hoveredTaste,
  hoveredPackaging: s.hoveredPackaging,
  hoveredPortion: s.hoveredPortion,
  hoveredKitchen: s.hoveredKitchen,
});
/** Selector returning the delivery ratings form values. */
export const selectDeliveryRatings = (s: RatingState) => ({
  deliveryRating: s.deliveryRating,
  speedRating: s.speedRating,
  deliveryTags: s.deliveryTags,
  deliveryThoughts: s.deliveryThoughts,
  hoveredDelivery: s.hoveredDelivery,
  hoveredSpeed: s.hoveredSpeed,
});
/** Selector returning all rating actions in a single object (stable via shallow). */
export const selectRatingActions = (s: RatingState) => ({
  setOrders: s.setOrders,
  setStep: s.setStep,
  setTasteRating: s.setTasteRating,
  setPackagingRating: s.setPackagingRating,
  setPortionRating: s.setPortionRating,
  setKitchenOverall: s.setKitchenOverall,
  setKitchenTags: s.setKitchenTags,
  setKitchenThoughts: s.setKitchenThoughts,
  setDeliveryRating: s.setDeliveryRating,
  setSpeedRating: s.setSpeedRating,
  setDeliveryTags: s.setDeliveryTags,
  setDeliveryThoughts: s.setDeliveryThoughts,
  setHoveredTaste: s.setHoveredTaste,
  setHoveredPackaging: s.setHoveredPackaging,
  setHoveredPortion: s.setHoveredPortion,
  setHoveredKitchen: s.setHoveredKitchen,
  setHoveredDelivery: s.setHoveredDelivery,
  setHoveredSpeed: s.setHoveredSpeed,
  resetRatingState: s.resetRatingState,
});

/**
 * Zustand store for the rating page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; all rating form state lives
 * here too.
 */
export const ratingStore = create<RatingState>()((set) => ({
  orders: [],
  step: "kitchen",
  tasteRating: 0,
  packagingRating: 0,
  portionRating: 0,
  kitchenOverall: 0,
  kitchenTags: [],
  kitchenThoughts: "",
  deliveryRating: 0,
  speedRating: 0,
  deliveryTags: [],
  deliveryThoughts: "",
  hoveredTaste: 0,
  hoveredPackaging: 0,
  hoveredPortion: 0,
  hoveredKitchen: 0,
  hoveredDelivery: 0,
  hoveredSpeed: 0,
  setOrders: (orders: UserOrder[]) => set({ orders }),
  setStep: (step: RatingStep) => set({ step }),
  setTasteRating: (tasteRating) => set({ tasteRating }),
  setPackagingRating: (packagingRating) => set({ packagingRating }),
  setPortionRating: (portionRating) => set({ portionRating }),
  setKitchenOverall: (kitchenOverall) => set({ kitchenOverall }),
  setKitchenTags: (kitchenTags) => set({ kitchenTags }),
  setKitchenThoughts: (kitchenThoughts) => set({ kitchenThoughts }),
  setDeliveryRating: (deliveryRating) => set({ deliveryRating }),
  setSpeedRating: (speedRating) => set({ speedRating }),
  setDeliveryTags: (deliveryTags) => set({ deliveryTags }),
  setDeliveryThoughts: (deliveryThoughts) => set({ deliveryThoughts }),
  setHoveredTaste: (hoveredTaste) => set({ hoveredTaste }),
  setHoveredPackaging: (hoveredPackaging) => set({ hoveredPackaging }),
  setHoveredPortion: (hoveredPortion) => set({ hoveredPortion }),
  setHoveredKitchen: (hoveredKitchen) => set({ hoveredKitchen }),
  setHoveredDelivery: (hoveredDelivery) => set({ hoveredDelivery }),
  setHoveredSpeed: (hoveredSpeed) => set({ hoveredSpeed }),
  resetRatingState: () =>
    set({
      orders: [],
      step: "kitchen",
      tasteRating: 0,
      packagingRating: 0,
      portionRating: 0,
      kitchenOverall: 0,
      kitchenTags: [],
      kitchenThoughts: "",
      deliveryRating: 0,
      speedRating: 0,
      deliveryTags: [],
      deliveryThoughts: "",
      hoveredTaste: 0,
      hoveredPackaging: 0,
      hoveredPortion: 0,
      hoveredKitchen: 0,
      hoveredDelivery: 0,
      hoveredSpeed: 0,
    }),
}));

/** Hook returning the orders list. */
export function useRatingOrders() {
  return ratingStore(selectRatingOrders);
}
/** Hook returning the current flow step. */
export function useRatingStep() {
  return ratingStore(selectRatingStep);
}
/** Hook returning the kitchen ratings form values. */
export function useKitchenRatings() {
  return ratingStore(useShallow(selectKitchenRatings));
}
/** Hook returning the delivery ratings form values. */
export function useDeliveryRatings() {
  return ratingStore(useShallow(selectDeliveryRatings));
}
/** Hook returning all rating actions (stable reference). */
export function useRatingActions() {
  return ratingStore(useShallow(selectRatingActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the user's orders via TanStack Query and syncs the result
 * into the zustand store.
 */
export function useRatingOrdersQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["orders"],
    queryFn: getUserOrders,
  });

  useEffect(() => {
    ratingStore.getState().setOrders(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Submits the kitchen review. Invalidates the orders query on success.
 * @param onSuccess Optional callback invoked after the orders query has
 * been invalidated.
 */
export function useSubmitKitchenReviewMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitKitchenReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onSuccess?.();
    },
  });
}

/**
 * Submits the delivery review. Invalidates the orders query on success.
 * @param onSuccess Optional callback invoked after the orders query has
 * been invalidated.
 */
export function useSubmitDeliveryReviewMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitDeliveryReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onSuccess?.();
    },
  });
}
