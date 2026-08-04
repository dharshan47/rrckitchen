import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { getKitchenDashboardData } from "@/actions/admin/dashboard";

type KitchenDashboardData = Awaited<ReturnType<typeof getKitchenDashboardData>>;

interface KitchenDashboardState {
  data: KitchenDashboardData | null;
  setData: (data: KitchenDashboardData | null) => void;
  reset: () => void;
}

export const kitchenDashboardStore = create<KitchenDashboardState>()((set) => ({
  data: null,
  setData: (data) => set({ data }),
  reset: () => set({ data: null }),
}));

const selectKitchenData = (s: KitchenDashboardState) => s.data;
const selectKitchenActions = (s: KitchenDashboardState) => ({
  setData: s.setData,
  reset: s.reset,
});

/** Reactive dashboard payload for sidebar widgets + dashboard pages. */
export function useKitchenDashboardData() {
  return kitchenDashboardStore(selectKitchenData);
}
export function useKitchenDashboardActions() {
  return kitchenDashboardStore(useShallow(selectKitchenActions));
}
