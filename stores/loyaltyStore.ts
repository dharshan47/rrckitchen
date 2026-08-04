import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoyaltySummary, getLoyaltyHistory } from "@/actions/loyalty/loyalty";
import {
  getAvailableLoyaltyCoupons,
  getUserPurchasedCoupons,
  purchaseCouponWithPoints,
} from "@/actions/loyalty/loyalty-coupons";
import { getReferralStats, getOrCreateReferralCode } from "@/actions/referral/referral";
import { toast } from "sonner";

/** Loyalty summary payload. */
export type LoyaltySummary = Awaited<ReturnType<typeof getLoyaltySummary>>;
/** Loyalty history transaction row. */
export type LoyaltyHistoryEntry = Awaited<ReturnType<typeof getLoyaltyHistory>>[number];
/** Available loyalty coupon row. */
export type LoyaltyCoupon = Awaited<ReturnType<typeof getAvailableLoyaltyCoupons>>[number];
/** Purchased loyalty coupon row. */
export type PurchasedCoupon = Awaited<ReturnType<typeof getUserPurchasedCoupons>>[number];
/** Referral stats payload. */
export type LoyaltyReferralStats = Awaited<ReturnType<typeof getReferralStats>>;

/** State shape for the loyalty store. */
interface LoyaltyState {
  summary: LoyaltySummary | null;
  history: LoyaltyHistoryEntry[];
  availableCoupons: LoyaltyCoupon[];
  myCoupons: PurchasedCoupon[];
  refStats: LoyaltyReferralStats | null;
  refCode: string | null;
  setSummary: (summary: LoyaltySummary | null) => void;
  setHistory: (history: LoyaltyHistoryEntry[]) => void;
  setAvailableCoupons: (coupons: LoyaltyCoupon[]) => void;
  setMyCoupons: (coupons: PurchasedCoupon[]) => void;
  setRefStats: (stats: LoyaltyReferralStats | null) => void;
  setRefCode: (code: string | null) => void;
  resetLoyaltyState: () => void;
}

/** Selector returning the loyalty summary. */
export const selectLoyaltySummary = (s: LoyaltyState) => s.summary;
/** Selector returning the loyalty history. */
export const selectLoyaltyHistory = (s: LoyaltyState) => s.history;
/** Selector returning the available loyalty coupons. */
export const selectLoyaltyAvailableCoupons = (s: LoyaltyState) => s.availableCoupons;
/** Selector returning the user's purchased coupons. */
export const selectLoyaltyMyCoupons = (s: LoyaltyState) => s.myCoupons;
/** Selector returning the referral stats. */
export const selectLoyaltyReferralStats = (s: LoyaltyState) => s.refStats;
/** Selector returning the referral code. */
export const selectLoyaltyReferralCode = (s: LoyaltyState) => s.refCode;
/** Selector returning all loyalty actions in a single object (stable via shallow). */
export const selectLoyaltyActions = (s: LoyaltyState) => ({
  setSummary: s.setSummary,
  setHistory: s.setHistory,
  setAvailableCoupons: s.setAvailableCoupons,
  setMyCoupons: s.setMyCoupons,
  setRefStats: s.setRefStats,
  setRefCode: s.setRefCode,
  resetLoyaltyState: s.resetLoyaltyState,
});

/**
 * Zustand store for the loyalty page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const loyaltyStore = create<LoyaltyState>()((set) => ({
  summary: null,
  history: [],
  availableCoupons: [],
  myCoupons: [],
  refStats: null,
  refCode: null,
  setSummary: (summary) => set({ summary }),
  setHistory: (history) => set({ history }),
  setAvailableCoupons: (availableCoupons) => set({ availableCoupons }),
  setMyCoupons: (myCoupons) => set({ myCoupons }),
  setRefStats: (refStats) => set({ refStats }),
  setRefCode: (refCode) => set({ refCode }),
  resetLoyaltyState: () =>
    set({
      summary: null,
      history: [],
      availableCoupons: [],
      myCoupons: [],
      refStats: null,
      refCode: null,
    }),
}));

/** Hook returning the loyalty summary. */
export function useLoyaltySummary() {
  return loyaltyStore(selectLoyaltySummary);
}
/** Hook returning the loyalty history. */
export function useLoyaltyHistory() {
  return loyaltyStore(selectLoyaltyHistory);
}
/** Hook returning the available loyalty coupons. */
export function useLoyaltyAvailableCoupons() {
  return loyaltyStore(selectLoyaltyAvailableCoupons);
}
/** Hook returning the user's purchased coupons. */
export function useLoyaltyMyCoupons() {
  return loyaltyStore(selectLoyaltyMyCoupons);
}
/** Hook returning the referral stats. */
export function useLoyaltyReferralStats() {
  return loyaltyStore(selectLoyaltyReferralStats);
}
/** Hook returning the referral code. */
export function useLoyaltyReferralCode() {
  return loyaltyStore(selectLoyaltyReferralCode);
}
/** Hook returning all loyalty actions (stable reference). */
export function useLoyaltyActions() {
  return loyaltyStore(useShallow(selectLoyaltyActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the loyalty summary via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s and runs only when logged in.
 */
export function useLoyaltySummaryQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["loyalty-summary"],
    queryFn: getLoyaltySummary,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    loyaltyStore.getState().setSummary(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the loyalty history via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s and runs only when logged in.
 */
export function useLoyaltyHistoryQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["loyalty-history"],
    queryFn: getLoyaltyHistory,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    loyaltyStore.getState().setHistory(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the available loyalty coupons via TanStack Query and syncs
 * the result into the zustand store. Polls every 60s and runs only
 * when logged in.
 */
export function useLoyaltyAvailableCouponsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["loyalty-available-coupons"],
    queryFn: getAvailableLoyaltyCoupons,
    enabled,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    loyaltyStore.getState().setAvailableCoupons(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's purchased coupons via TanStack Query and syncs
 * the result into the zustand store. Polls every 60s and runs only
 * when logged in.
 */
export function useLoyaltyMyCouponsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["loyalty-my-coupons"],
    queryFn: getUserPurchasedCoupons,
    enabled,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    loyaltyStore.getState().setMyCoupons(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the referral stats via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s and runs only when logged in.
 */
export function useLoyaltyReferralStatsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: getReferralStats,
    enabled,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    loyaltyStore.getState().setRefStats(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches (and creates if missing) the referral code via TanStack Query
 * and syncs the result into the zustand store. Runs only when logged in.
 */
export function useLoyaltyReferralCodeQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["referral-code"],
    queryFn: getOrCreateReferralCode,
    enabled,
  });

  useEffect(() => {
    loyaltyStore.getState().setRefCode(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Redeems points for a loyalty coupon. Invalidates the summary, history
 * and my-coupons queries and shows a toast on success/failure.
 */
export function useRedeemCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseCouponWithPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-summary"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-history"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-my-coupons"] });
      toast.success("Coupon redeemed successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to redeem coupon");
    },
  });
}
