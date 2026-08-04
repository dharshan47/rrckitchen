import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

interface KitchenDetailState {
  kitchen: KitchenDetail | null;
  slug: string | null;
  lastUpdatedAt: number | null;
  hydrate: (kitchen: KitchenDetail) => void;
  patchKitchen: (patch: Partial<KitchenDetail>) => void;
  reset: () => void;
}

export const kitchenDetailStore = create<KitchenDetailState>()((set) => ({
  kitchen: null,
  slug: null,
  lastUpdatedAt: null,

  hydrate: (kitchen) =>
    set({ kitchen, slug: kitchen.slug, lastUpdatedAt: Date.now() }),

  patchKitchen: (patch) =>
    set((state) =>
      state.kitchen
        ? { kitchen: { ...state.kitchen, ...patch }, lastUpdatedAt: Date.now() }
        : {}
    ),

  reset: () => set({ kitchen: null, slug: null, lastUpdatedAt: null }),
}));

const selectKitchen = (s: KitchenDetailState) => s.kitchen;
const selectSlug = (s: KitchenDetailState) => s.slug;
const selectLastUpdatedAt = (s: KitchenDetailState) => s.lastUpdatedAt;

export function useKitchenDetail() {
  return kitchenDetailStore(selectKitchen);
}

export function useKitchenDetailSlug() {
  return kitchenDetailStore(selectSlug);
}

export function useKitchenDetailLastUpdatedAt() {
  return kitchenDetailStore(selectLastUpdatedAt);
}

export function useKitchenDetailActions() {
  return kitchenDetailStore(
    useShallow((s) => ({
      hydrate: s.hydrate,
      patchKitchen: s.patchKitchen,
      reset: s.reset,
    }))
  );
}
