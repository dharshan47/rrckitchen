import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDeliveryPartners,
  updateDeliveryPartnerStatus,
} from "@/actions/admin/admin-partners";

/** Shape of a delivery partner row as returned by getAdminDeliveryPartners. */
export type AdminDeliveryPartner = NonNullable<
  Awaited<ReturnType<typeof getAdminDeliveryPartners>>[number]
>;

/** State shape for the admin delivery partners store. */
interface AdminDeliveryState {
  partners: AdminDeliveryPartner[];
  selectedPartner: AdminDeliveryPartner | null;
  setPartners: (partners: AdminDeliveryPartner[]) => void;
  setSelectedPartner: (partner: AdminDeliveryPartner | null) => void;
  resetAdminDeliveryState: () => void;
}

/** Selector returning the partners list. */
export const selectAdminDeliveryPartners = (s: AdminDeliveryState) => s.partners;
/** Selector returning the partner open in the details sheet. */
export const selectAdminSelectedPartner = (s: AdminDeliveryState) => s.selectedPartner;
/** Selector returning all delivery partners actions in a single object (stable via shallow). */
export const selectAdminDeliveryActions = (s: AdminDeliveryState) => ({
  setPartners: s.setPartners,
  setSelectedPartner: s.setSelectedPartner,
  resetAdminDeliveryState: s.resetAdminDeliveryState,
});

/**
 * Zustand store for the admin delivery partners page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the partner open in the details
 * sheet lives here too.
 */
export const adminDeliveryStore = create<AdminDeliveryState>()((set) => ({
  partners: [],
  selectedPartner: null,
  setPartners: (partners: AdminDeliveryPartner[]) => set({ partners }),
  setSelectedPartner: (selectedPartner: AdminDeliveryPartner | null) =>
    set({ selectedPartner }),
  resetAdminDeliveryState: () => set({ partners: [], selectedPartner: null }),
}));

/** Hook returning the partners list. */
export function useAdminDeliveryPartners() {
  return adminDeliveryStore(selectAdminDeliveryPartners);
}
/** Hook returning the partner open in the details sheet. */
export function useAdminSelectedPartner() {
  return adminDeliveryStore(selectAdminSelectedPartner);
}
/** Hook returning all delivery partners actions (stable reference). */
export function useAdminDeliveryActions() {
  return adminDeliveryStore(useShallow(selectAdminDeliveryActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the delivery partners list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminDeliveryPartnersQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-delivery-partners-list"],
    queryFn: getAdminDeliveryPartners,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminDeliveryStore
      .getState()
      .setPartners(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/* ------------------------- Mutation hooks ------------------------- */

/**
 * Updates a delivery partner's status and invalidates the partners query.
 * Returns the action result object ({ success, error? }).
 */
export function useUpdateDeliveryPartnerStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateDeliveryPartnerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-delivery-partners-list"],
      });
    },
  });
}
