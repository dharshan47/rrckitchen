import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPaymentOffers,
  createPaymentOffer,
  updatePaymentOffer,
  deletePaymentOffer,
} from "@/actions/admin/admin-payment-offers";

/** Shape of a payment offer row as returned by getAllPaymentOffers. */
export type AdminPaymentOffer = NonNullable<
  Awaited<ReturnType<typeof getAllPaymentOffers>>[number]
>;

/** State shape for the admin payment offers store. */
interface AdminPaymentOffersState {
  paymentOffers: AdminPaymentOffer[];
  setPaymentOffers: (paymentOffers: AdminPaymentOffer[]) => void;
  resetAdminPaymentOffersState: () => void;
}

/** Selector returning the payment offers list. */
export const selectAdminPaymentOffers = (s: AdminPaymentOffersState) =>
  s.paymentOffers;
/** Selector returning all payment offers actions in a single object (stable via shallow). */
export const selectAdminPaymentOffersActions = (s: AdminPaymentOffersState) => ({
  setPaymentOffers: s.setPaymentOffers,
  resetAdminPaymentOffersState: s.resetAdminPaymentOffersState,
});

/**
 * Zustand store for the admin payment offers page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const adminPaymentOffersStore = create<AdminPaymentOffersState>()((set) => ({
  paymentOffers: [],
  setPaymentOffers: (paymentOffers: AdminPaymentOffer[]) =>
    set({ paymentOffers }),
  resetAdminPaymentOffersState: () => set({ paymentOffers: [] }),
}));

/** Hook returning the payment offers list. */
export function useAdminPaymentOffers() {
  return adminPaymentOffersStore(selectAdminPaymentOffers);
}
/** Hook returning all payment offers actions (stable reference). */
export function useAdminPaymentOffersActions() {
  return adminPaymentOffersStore(useShallow(selectAdminPaymentOffersActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the payment offers list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminPaymentOffersQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-payment-offers-list"],
    queryFn: getAllPaymentOffers,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminPaymentOffersStore
      .getState()
      .setPaymentOffers(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/* ------------------------- Mutation hooks ------------------------- */

/**
 * Creates a new payment offer and invalidates the payment offers query.
 * Returns the action result object ({ success, error? }).
 */
export function useCreatePaymentOfferMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createPaymentOffer>[0]) =>
      createPaymentOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-offers-list"],
      });
    },
  });
}

/**
 * Updates an existing payment offer and invalidates the payment offers query.
 * Returns the action result object ({ success, error? }).
 */
export function useUpdatePaymentOfferMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updatePaymentOffer>[1];
    }) => updatePaymentOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-offers-list"],
      });
    },
  });
}

/**
 * Deletes a payment offer and invalidates the payment offers query.
 * Returns the action result object ({ success, error? }).
 */
export function useDeletePaymentOfferMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-offers-list"],
      });
    },
  });
}
