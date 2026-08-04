import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { getKitchenReviews } from "@/actions/catalog/kitchen-reviews";

export interface KitchenReview {
  id: string;
  rating: number;
  tasteRating?: number | null;
  packagingRating?: number | null;
  portionSizeRating?: number | null;
  comment?: string | null;
  mediaUrls?: string[];
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface KitchenReviewsState {
  reviews: KitchenReview[];
  kitchenId: string | null;
  isLoading: boolean;
  setReviews: (kitchenId: string, reviews: KitchenReview[]) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const kitchenReviewsStore = create<KitchenReviewsState>()((set) => ({
  reviews: [],
  kitchenId: null,
  isLoading: false,
  setReviews: (kitchenId, reviews) => set({ kitchenId, reviews }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ reviews: [], kitchenId: null, isLoading: false }),
}));

const selectReviews = (s: KitchenReviewsState) => s.reviews;
const selectReviewsKitchenId = (s: KitchenReviewsState) => s.kitchenId;
const selectReviewsLoading = (s: KitchenReviewsState) => s.isLoading;
const selectReviewsActions = (s: KitchenReviewsState) => ({
  setReviews: s.setReviews,
  setLoading: s.setLoading,
  reset: s.reset,
});

export function useKitchenReviews() {
  return kitchenReviewsStore(selectReviews);
}

export function useKitchenReviewsKitchenId() {
  return kitchenReviewsStore(selectReviewsKitchenId);
}

export function useKitchenReviewsLoading() {
  return kitchenReviewsStore(selectReviewsLoading);
}

export function useKitchenReviewsActions() {
  return kitchenReviewsStore(useShallow(selectReviewsActions));
}

/**
 * Fetches the kitchen's reviews via TanStack Query (kept fresh via
 * polling) and syncs the result into the zustand store.
 */
export function useKitchenReviewsQuery(kitchenId: string) {
  const query = useQuery<KitchenReview[]>({
    queryKey: ["kitchen-reviews", kitchenId],
    queryFn: () => getKitchenReviews(kitchenId),
    enabled: !!kitchenId,
    staleTime: 60_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    kitchenReviewsStore.getState().setLoading(query.isFetching);
  }, [query.isFetching]);

  useEffect(() => {
    if (query.data) {
      kitchenReviewsStore.getState().setReviews(kitchenId, query.data);
    }
  }, [query.data, kitchenId]);

  return query;
}
