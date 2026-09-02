import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecommendedKitchens } from "@/actions/catalog/favourites";
import type { RelatedKitchen } from "@/actions/catalog/home-data";
import { toast } from "sonner";

/** A saved menu item in the wishlist. */
export interface MenuWishlistItem {
  id: string;
  menuItem: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    foodType: string;
    timeSlot: string;
    description: string | null;
    photos: { imageUrl: string }[];
    menu: {
      kitchenPartner: {
        slug?: string;
        kitchenAlias: { displayName: string } | null;
      } | null;
    } | null;
  };
}

/** A saved kitchen in the wishlist. */
export interface KitchenWishlistItem {
  id: string;
  kitchenPartnerId: string;
  createdAt: string;
  kitchenPartner: {
    id: string;
    slug: string | null;
    status: string;
    operatingHours: unknown;
    estimatedPrepTime: number | null;
    kitchenAlias: { displayName: string; imageUrl: string | null } | null;
    kitchenAddress: {
      lineOne: string;
      pincode: string;
      latitude: number | null;
      longitude: number | null;
    } | null;
    kitchenKyc: { phoneNumber: string | null } | null;
    cuisineTags: string[];
    avgRating: number | null;
    totalReviews: number;
    imageUrl: string | null;
    coverImageUrl: string | null;
    lat: number | null;
    lng: number | null;
    user: { name: string | null };
  };
}

/** Page shape returned by the wishlist API routes. */
export interface WishlistPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** State shape for the favourites store. */
interface FavouritesState {
  recommendedKitchens: RelatedKitchen[];
  menuItems: MenuWishlistItem[];
  kitchenItems: KitchenWishlistItem[];
  setRecommendedKitchens: (kitchens: RelatedKitchen[]) => void;
  setMenuItems: (items: MenuWishlistItem[]) => void;
  setKitchenItems: (items: KitchenWishlistItem[]) => void;
  resetFavouritesState: () => void;
}

/** Selector returning the recommended kitchens. */
export const selectRecommendedKitchens = (s: FavouritesState) => s.recommendedKitchens;
/** Selector returning the flattened menu wishlist items. */
export const selectMenuWishlistItems = (s: FavouritesState) => s.menuItems;
/** Selector returning the flattened kitchen wishlist items. */
export const selectKitchenWishlistItems = (s: FavouritesState) => s.kitchenItems;
/** Selector returning all favourites actions in a single object (stable via shallow). */
export const selectFavouritesActions = (s: FavouritesState) => ({
  setRecommendedKitchens: s.setRecommendedKitchens,
  setMenuItems: s.setMenuItems,
  setKitchenItems: s.setKitchenItems,
  resetFavouritesState: s.resetFavouritesState,
});

/**
 * Zustand store for the favourites page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const favouritesStore = create<FavouritesState>()((set) => ({
  recommendedKitchens: [],
  menuItems: [],
  kitchenItems: [],
  setRecommendedKitchens: (recommendedKitchens: RelatedKitchen[]) => set({ recommendedKitchens }),
  setMenuItems: (menuItems: MenuWishlistItem[]) => set({ menuItems }),
  setKitchenItems: (kitchenItems: KitchenWishlistItem[]) => set({ kitchenItems }),
  resetFavouritesState: () => set({ recommendedKitchens: [], menuItems: [], kitchenItems: [] }),
}));

/** Hook returning the recommended kitchens. */
export function useRecommendedKitchens() {
  return favouritesStore(selectRecommendedKitchens);
}
/** Hook returning the flattened menu wishlist items. */
export function useMenuWishlistItems() {
  return favouritesStore(selectMenuWishlistItems);
}
/** Hook returning the flattened kitchen wishlist items. */
export function useKitchenWishlistItems() {
  return favouritesStore(selectKitchenWishlistItems);
}
/** Hook returning all favourites actions (stable reference). */
export function useFavouritesActions() {
  return favouritesStore(useShallow(selectFavouritesActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches recommended kitchens via TanStack Query and syncs the result
 * into the zustand store. Runs only when the user is logged in.
 */
export function useRecommendedKitchensQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["recommended-kitchens"],
    queryFn: getRecommendedKitchens,
    enabled,
  });

  useEffect(() => {
    favouritesStore.getState().setRecommendedKitchens(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's saved menu items (cursor paginated) via TanStack
 * Query and syncs the flattened pages into the zustand store. Polls
 * every 30s and runs only when the user is logged in.
 */
export function useMenuWishlistQuery(enabled: boolean) {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ["wishlist"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "12");
      const res = await fetch(`/api/wishlist?${params}`);
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json() as Promise<WishlistPage<MenuWishlistItem>>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    favouritesStore
      .getState()
      .setMenuItems(data?.pages.flatMap((p) => p.items) ?? []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's saved kitchens (cursor paginated) via TanStack
 * Query and syncs the flattened pages into the zustand store. Polls
 * every 30s and runs only when the user is logged in.
 */
export function useKitchenWishlistQuery(enabled: boolean) {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ["kitchen-wishlist"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "12");
      const res = await fetch(`/api/kitchen/wishlist?${params}`);
      if (!res.ok) throw new Error("Failed to fetch kitchen wishlist");
      return res.json() as Promise<WishlistPage<KitchenWishlistItem>>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    favouritesStore
      .getState()
      .setKitchenItems(data?.pages.flatMap((p) => p.items) ?? []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Removes a menu item from the wishlist. Invalidates the menu wishlist
 * query and shows a toast on success/failure.
 */
export function useRemoveMenuWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const res = await fetch(`/api/wishlist?menuItemId=${menuItemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from favourites");
    },
    onError: () => toast.error("Failed to remove item"),
  });
}

/**
 * Removes a kitchen from the wishlist. Invalidates the kitchen wishlist
 * query and shows a toast on success/failure.
 */
export function useRemoveKitchenWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (kitchenPartnerId: string) => {
      const res = await fetch(`/api/kitchen/wishlist?kitchenPartnerId=${kitchenPartnerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-wishlist"] });
      toast.success("Removed from favourites");
    },
    onError: () => toast.error("Failed to remove kitchen"),
  });
}
