import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllLoyaltyCoupons,
  createLoyaltyCoupon,
  updateLoyaltyCoupon,
  deleteLoyaltyCoupon,
  toggleLoyaltyCouponActive,
} from "@/actions/loyalty/loyalty-coupons";

/** Shape of a loyalty coupon row as returned by getAllLoyaltyCoupons. */
export type AdminLoyaltyCoupon = NonNullable<
  Awaited<ReturnType<typeof getAllLoyaltyCoupons>>[number]
>;

/** State shape for the admin loyalty coupons store. */
interface AdminLoyaltyCouponsState {
  loyaltyCoupons: AdminLoyaltyCoupon[];
  setLoyaltyCoupons: (loyaltyCoupons: AdminLoyaltyCoupon[]) => void;
  resetAdminLoyaltyCouponsState: () => void;
}

/** Selector returning the loyalty coupons list. */
export const selectAdminLoyaltyCoupons = (s: AdminLoyaltyCouponsState) =>
  s.loyaltyCoupons;
/** Selector returning all loyalty coupons actions in a single object (stable via shallow). */
export const selectAdminLoyaltyCouponsActions = (s: AdminLoyaltyCouponsState) => ({
  setLoyaltyCoupons: s.setLoyaltyCoupons,
  resetAdminLoyaltyCouponsState: s.resetAdminLoyaltyCouponsState,
});

/**
 * Zustand store for the admin loyalty coupons page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const adminLoyaltyCouponsStore = create<AdminLoyaltyCouponsState>()((set) => ({
  loyaltyCoupons: [],
  setLoyaltyCoupons: (loyaltyCoupons: AdminLoyaltyCoupon[]) =>
    set({ loyaltyCoupons }),
  resetAdminLoyaltyCouponsState: () => set({ loyaltyCoupons: [] }),
}));

/** Hook returning the loyalty coupons list. */
export function useAdminLoyaltyCoupons() {
  return adminLoyaltyCouponsStore(selectAdminLoyaltyCoupons);
}
/** Hook returning all loyalty coupons actions (stable reference). */
export function useAdminLoyaltyCouponsActions() {
  return adminLoyaltyCouponsStore(useShallow(selectAdminLoyaltyCouponsActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the loyalty coupons list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminLoyaltyCouponsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-loyalty-coupons-list"],
    queryFn: getAllLoyaltyCoupons,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminLoyaltyCouponsStore
      .getState()
      .setLoyaltyCoupons(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/* ------------------------- Mutation hooks ------------------------- */

/**
 * Creates a new loyalty coupon and invalidates the loyalty coupons query.
 * Rejects with an Error message on failure.
 */
export function useCreateLoyaltyCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createLoyaltyCoupon>[0]) =>
      createLoyaltyCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-loyalty-coupons-list"],
      });
    },
  });
}

/**
 * Updates an existing loyalty coupon and invalidates the loyalty coupons query.
 * Rejects with an Error message on failure.
 */
export function useUpdateLoyaltyCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateLoyaltyCoupon>[1];
    }) => updateLoyaltyCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-loyalty-coupons-list"],
      });
    },
  });
}

/**
 * Deletes a loyalty coupon and invalidates the loyalty coupons query.
 * Rejects with an Error message on failure.
 */
export function useDeleteLoyaltyCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLoyaltyCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-loyalty-coupons-list"],
      });
    },
  });
}

/**
 * Toggles a loyalty coupon's active state and invalidates the loyalty
 * coupons query. Rejects with an Error message on failure.
 */
export function useToggleLoyaltyCouponActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleLoyaltyCouponActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-loyalty-coupons-list"],
      });
    },
  });
}
