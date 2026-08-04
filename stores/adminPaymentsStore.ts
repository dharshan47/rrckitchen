import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { getAdminPayments } from "@/actions/admin/admin-payments";

/** Shape of a payment row as returned by getAdminPayments. */
export type AdminPaymentRow = NonNullable<
  Awaited<ReturnType<typeof getAdminPayments>>[number]
>;

/** State shape for the admin payments store. */
interface AdminPaymentsState {
  payments: AdminPaymentRow[];
  selectedPayment: AdminPaymentRow | null;
  setPayments: (payments: AdminPaymentRow[]) => void;
  setSelectedPayment: (payment: AdminPaymentRow | null) => void;
  resetAdminPaymentsState: () => void;
}

/** Selector returning the payments list. */
export const selectAdminPayments = (s: AdminPaymentsState) => s.payments;
/** Selector returning the payment open in the details sheet. */
export const selectAdminSelectedPayment = (s: AdminPaymentsState) => s.selectedPayment;
/** Selector returning all payments actions in a single object (stable via shallow). */
export const selectAdminPaymentsActions = (s: AdminPaymentsState) => ({
  setPayments: s.setPayments,
  setSelectedPayment: s.setSelectedPayment,
  resetAdminPaymentsState: s.resetAdminPaymentsState,
});

/**
 * Zustand store for the admin payments page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the payment open in the details
 * sheet lives here too.
 */
export const adminPaymentsStore = create<AdminPaymentsState>()((set) => ({
  payments: [],
  selectedPayment: null,
  setPayments: (payments: AdminPaymentRow[]) => set({ payments }),
  setSelectedPayment: (selectedPayment: AdminPaymentRow | null) => set({ selectedPayment }),
  resetAdminPaymentsState: () => set({ payments: [], selectedPayment: null }),
}));

/** Hook returning the payments list. */
export function useAdminPayments() {
  return adminPaymentsStore(selectAdminPayments);
}
/** Hook returning the payment open in the details sheet. */
export function useAdminSelectedPayment() {
  return adminPaymentsStore(selectAdminSelectedPayment);
}
/** Hook returning all payments actions (stable reference). */
export function useAdminPaymentsActions() {
  return adminPaymentsStore(useShallow(selectAdminPaymentsActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin payments list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminPaymentsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-payments-list"],
    queryFn: getAdminPayments,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminPaymentsStore.getState().setPayments(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}
