import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminKitchenPartners,
  updateKitchenDetails,
  updateKitchenPartnerStatus,
  updateKitchenImage,
  updateKitchenOfferText,
} from "@/actions/admin/admin-partners";

/** Shape of a kitchen partner row as returned by getAdminKitchenPartners. */
export type AdminKitchenPartner = NonNullable<
  Awaited<ReturnType<typeof getAdminKitchenPartners>>[number]
>;

/** State shape for the admin kitchens store. */
interface AdminKitchensState {
  kitchens: AdminKitchenPartner[];
  selectedKitchen: AdminKitchenPartner | null;
  setKitchens: (kitchens: AdminKitchenPartner[]) => void;
  setSelectedKitchen: (kitchen: AdminKitchenPartner | null) => void;
  resetAdminKitchensState: () => void;
}

/** Selector returning the kitchen partners list. */
export const selectAdminKitchens = (s: AdminKitchensState) => s.kitchens;
/** Selector returning the kitchen currently open in the details sheet. */
export const selectAdminSelectedKitchen = (s: AdminKitchensState) => s.selectedKitchen;
/** Selector returning all kitchen actions in a single object (stable via shallow). */
export const selectAdminKitchensActions = (s: AdminKitchensState) => ({
  setKitchens: s.setKitchens,
  setSelectedKitchen: s.setSelectedKitchen,
  resetAdminKitchensState: s.resetAdminKitchensState,
});

/**
 * Zustand store for the admin kitchens page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the sheet selection lives here too.
 */
export const adminKitchensStore = create<AdminKitchensState>()((set) => ({
  kitchens: [],
  selectedKitchen: null,
  setKitchens: (kitchens: AdminKitchenPartner[]) => set({ kitchens }),
  setSelectedKitchen: (selectedKitchen: AdminKitchenPartner | null) => set({ selectedKitchen }),
  resetAdminKitchensState: () => set({ kitchens: [], selectedKitchen: null }),
}));

/** Hook returning the kitchen partners list. */
export function useAdminKitchens() {
  return adminKitchensStore(selectAdminKitchens);
}
/** Hook returning the kitchen open in the details sheet. */
export function useAdminSelectedKitchen() {
  return adminKitchensStore(selectAdminSelectedKitchen);
}
/** Hook returning all kitchen actions (stable reference). */
export function useAdminKitchensActions() {
  return adminKitchensStore(useShallow(selectAdminKitchensActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin kitchen partners list via TanStack Query and syncs the
 * result into the zustand store. Polls every 30s.
 */
export function useAdminKitchensQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-kitchen-partners"],
    queryFn: getAdminKitchenPartners,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminKitchensStore.getState().setKitchens(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Updates a kitchen's basic details. Invalidates the partners query on success.
 */
export function useUpdateKitchenDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kitchenId,
      details,
    }: {
      kitchenId: string;
      details: Parameters<typeof updateKitchenDetails>[1];
    }) => updateKitchenDetails(kitchenId, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] });
    },
  });
}

/**
 * Updates a kitchen's custom offer text. Invalidates the partners query on success.
 */
export function useUpdateKitchenOfferTextMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kitchenId, customOfferText }: { kitchenId: string; customOfferText: string | null }) =>
      updateKitchenOfferText(kitchenId, customOfferText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] });
    },
  });
}

/**
 * Updates a kitchen's banner image. Invalidates the partners query on success.
 */
export function useUpdateKitchenImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kitchenId, imageUrl }: { kitchenId: string; imageUrl: string }) =>
      updateKitchenImage(kitchenId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] });
    },
  });
}

/**
 * Updates a kitchen partner's status (ACTIVE / SUSPENDED / ...).
 * Invalidates the partners query on success.
 */
export function useUpdateKitchenStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateKitchenPartnerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-partners"] });
    },
  });
}
