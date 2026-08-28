import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addAddress, deleteAddress, getUserAddresses } from "@/actions/cart-checkout/address";
import { updateProfileNameEmail } from "@/actions/onboarding/profile";
import { getUserOrders } from "@/actions/orders/orders";
import type { UserOrder } from "@/actions/orders/orders";

/** Shape of the user profile returned by /api/account/profile. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  createdAt?: string | null;
}

/** Address row as returned by getUserAddresses. */
export interface UserAddress {
  id: string;
  label?: string | null;
  lineOne: string;
  lineTwo?: string | null;
  pincode: string;
  isDefault?: boolean;
}

/** Loyalty points payload from /api/loyalty/points. */
export interface LoyaltyPoints {
  points: number;
  lifetimePoints: number;
  tier: string;
}

/** Referral stats payload from /api/referral/stats. */
export interface ReferralStats {
  totalReferrals: number;
  totalPointsEarned: number;
  referrals?: Array<{
    id: string;
    name: string;
    phone: string | null;
    status: string;
    rewardAmount: number;
    createdAt: string;
  }>;
}

/** State shape for the user profile store. */
interface UserProfileState {
  profile: UserProfile | null;
  addresses: UserAddress[];
  loyaltyPoints: LoyaltyPoints | null;
  wishlist: unknown[];
  referralCode: string | null;
  referralStats: ReferralStats | null;
  orders: UserOrder[];
  setProfile: (profile: UserProfile | null) => void;
  setAddresses: (addresses: UserAddress[]) => void;
  setLoyaltyPoints: (points: LoyaltyPoints | null) => void;
  setWishlist: (wishlist: unknown[]) => void;
  setReferralCode: (code: string | null) => void;
  setReferralStats: (stats: ReferralStats | null) => void;
  setOrders: (orders: UserOrder[]) => void;
  resetUserProfileState: () => void;
}

/** Selector returning the user profile. */
export const selectUserProfile = (s: UserProfileState) => s.profile;
/** Selector returning the saved addresses. */
export const selectUserAddresses = (s: UserProfileState) => s.addresses;
/** Selector returning the loyalty points. */
export const selectUserLoyaltyPoints = (s: UserProfileState) => s.loyaltyPoints;
/** Selector returning the wishlist. */
export const selectUserWishlist = (s: UserProfileState) => s.wishlist;
/** Selector returning the referral code. */
export const selectUserReferralCode = (s: UserProfileState) => s.referralCode;
/** Selector returning the referral stats. */
export const selectUserReferralStats = (s: UserProfileState) => s.referralStats;
/** Selector returning the user's orders. */
export const selectUserOrders = (s: UserProfileState) => s.orders;
/** Selector returning all user profile actions in a single object (stable via shallow). */
export const selectUserProfileActions = (s: UserProfileState) => ({
  setProfile: s.setProfile,
  setAddresses: s.setAddresses,
  setLoyaltyPoints: s.setLoyaltyPoints,
  setWishlist: s.setWishlist,
  setReferralCode: s.setReferralCode,
  setReferralStats: s.setReferralStats,
  setOrders: s.setOrders,
  resetUserProfileState: s.resetUserProfileState,
});

/**
 * Zustand store for the account profile page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const userProfileStore = create<UserProfileState>()((set) => ({
  profile: null,
  addresses: [],
  loyaltyPoints: null,
  wishlist: [],
  referralCode: null,
  referralStats: null,
  orders: [],
  setProfile: (profile) => set({ profile }),
  setAddresses: (addresses) => set({ addresses }),
  setLoyaltyPoints: (loyaltyPoints) => set({ loyaltyPoints }),
  setWishlist: (wishlist) => set({ wishlist }),
  setReferralCode: (referralCode) => set({ referralCode }),
  setReferralStats: (referralStats) => set({ referralStats }),
  setOrders: (orders) => set({ orders }),
  resetUserProfileState: () =>
    set({
      profile: null,
      addresses: [],
      loyaltyPoints: null,
      wishlist: [],
      referralCode: null,
      referralStats: null,
      orders: [],
    }),
}));

/** Hook returning the user profile. */
export function useUserProfile() {
  return userProfileStore(selectUserProfile);
}
/** Hook returning the saved addresses. */
export function useUserAddresses() {
  return userProfileStore(selectUserAddresses);
}
/** Hook returning the loyalty points. */
export function useUserLoyaltyPoints() {
  return userProfileStore(selectUserLoyaltyPoints);
}
/** Hook returning the wishlist. */
export function useUserWishlist() {
  return userProfileStore(selectUserWishlist);
}
/** Hook returning the referral code. */
export function useUserReferralCode() {
  return userProfileStore(selectUserReferralCode);
}
/** Hook returning the referral stats. */
export function useUserReferralStats() {
  return userProfileStore(selectUserReferralStats);
}
/** Hook returning the user's orders. */
export function useUserOrders() {
  return userProfileStore(selectUserOrders);
}
/** Hook returning all user profile actions (stable reference). */
export function useUserProfileActions() {
  return userProfileStore(useShallow(selectUserProfileActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the user profile via TanStack Query and syncs the result
 * into the zustand store. Enabled only when the user is logged in.
 */
export function useUserProfileQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/account/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<UserProfile>;
    },
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setProfile(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's saved addresses via TanStack Query and syncs the
 * result into the zustand store. Enabled only when logged in.
 */
export function useUserAddressesQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["addresses"],
    queryFn: getUserAddresses,
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setAddresses(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the loyalty points via TanStack Query and syncs the result
 * into the zustand store. Enabled only when logged in.
 */
export function useUserLoyaltyPointsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["loyalty-points"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/points");
      if (!res.ok) return null;
      return res.json() as Promise<LoyaltyPoints>;
    },
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setLoyaltyPoints(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's wishlist via TanStack Query and syncs the result
 * into the zustand store. Enabled only when logged in.
 */
export function useUserWishlistQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["user-wishlist-preview"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return [];
      const json = (await res.json()) as { items?: unknown[] };
      return (json.items ?? json) as unknown[];
    },
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setWishlist(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the referral code via TanStack Query and syncs the result
 * into the zustand store. Enabled only when logged in.
 */
export function useUserReferralCodeQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["referral-code"],
    queryFn: async () => {
      const res = await fetch("/api/referral/code");
      if (!res.ok) return null;
      return res.json() as Promise<string>;
    },
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setReferralCode(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the referral stats via TanStack Query and syncs the result
 * into the zustand store. Enabled only when logged in.
 */
export function useUserReferralStatsQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: async () => {
      const res = await fetch("/api/referral/stats");
      if (!res.ok) return null;
      return res.json() as Promise<ReferralStats>;
    },
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setReferralStats(data ?? null);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the user's orders via TanStack Query and syncs the result
 * into the zustand store. Enabled only when logged in.
 */
export function useUserOrdersQuery(enabled: boolean) {
  const { data, ...rest } = useQuery({
    queryKey: ["orders"],
    queryFn: getUserOrders,
    enabled,
  });

  useEffect(() => {
    userProfileStore.getState().setOrders(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Adds a new address. Invalidates the addresses query on success.
 * @param onSuccess Optional callback (e.g. to reset the form) invoked
 * after the addresses query has been invalidated.
 */
export function useAddAddressMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof addAddress>[0]) => {
      const result = await addAddress(data);
      if (!result.success) throw new Error(result.error);
      return result.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onSuccess?.();
    },
  });
}

/**
 * Deletes an address. Invalidates the addresses query on success.
 */
export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

/**
 * Updates the user's profile name/email. Invalidates the profile and
 * orders queries on success.
 * @param onSuccess Optional callback (e.g. to refetch the session or
 * exit edit mode) invoked after the queries have been invalidated.
 */
export function useUpdateProfileNameEmailMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileNameEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onSuccess?.();
    },
  });
}
