import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getSimpleKitchenPartners,
} from "@/actions/admin/admin-coupons";

/** Shape of a coupon row as returned by getAllCoupons. */
export type AdminCoupon = NonNullable<
  Awaited<ReturnType<typeof getAllCoupons>>[number]
>;
/** Shape of a simple kitchen partner option as returned by getSimpleKitchenPartners. */
export type AdminSimpleKitchen = NonNullable<
  Awaited<ReturnType<typeof getSimpleKitchenPartners>>[number]
>;

/** State shape for the admin coupons store. */
interface AdminCouponsState {
  coupons: AdminCoupon[];
  setCoupons: (coupons: AdminCoupon[]) => void;
  resetAdminCouponsState: () => void;
}

/** Selector returning the coupons list. */
export const selectAdminCoupons = (s: AdminCouponsState) => s.coupons;
/** Selector returning all coupons actions in a single object (stable via shallow). */
export const selectAdminCouponsActions = (s: AdminCouponsState) => ({
  setCoupons: s.setCoupons,
  resetAdminCouponsState: s.resetAdminCouponsState,
});

/**
 * Zustand store for the admin coupons page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const adminCouponsStore = create<AdminCouponsState>()((set) => ({
  coupons: [],
  setCoupons: (coupons: AdminCoupon[]) => set({ coupons }),
  resetAdminCouponsState: () => set({ coupons: [] }),
}));

/** Hook returning the coupons list. */
export function useAdminCoupons() {
  return adminCouponsStore(selectAdminCoupons);
}
/** Hook returning all coupons actions (stable reference). */
export function useAdminCouponsActions() {
  return adminCouponsStore(useShallow(selectAdminCouponsActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the coupons list via TanStack Query and syncs the result into the
 * zustand store. Polls every 30s.
 */
export function useAdminCouponsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-coupons-list"],
    queryFn: getAllCoupons,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminCouponsStore.getState().setCoupons(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the simple kitchen partner options used by the coupon form.
 * Synced into no store - consumed directly from the query result.
 */
export function useAdminCouponKitchensQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-simple-kitchens"],
    queryFn: getSimpleKitchenPartners,
    refetchInterval: 30_000,
  });

  return { data, ...rest };
}

/* ------------------------- Mutation hooks ------------------------- */

/**
 * Creates a new coupon and invalidates the coupons query.
 * Returns the action result object ({ success, error? }).
 */
export function useCreateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createCoupon>[0]) => createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
  });
}

/**
 * Updates an existing coupon and invalidates the coupons query.
 * Returns the action result object ({ success, error? }).
 */
export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCoupon>[1];
    }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
  });
}

/**
 * Deletes a coupon and invalidates the coupons query.
 * Returns the action result object ({ success, error? }).
 */
export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
  });
}

/**
 * Toggles a coupon's active state via updateCoupon and invalidates the
 * coupons query. Returns the action result object ({ success, error? }).
 */
export function useToggleCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCoupon(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
  });
}
