import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { AdminPermission } from "@/lib/generated/prisma/client";
import type { DateRange } from "react-day-picker";
import { getAdminDashboardData } from "@/actions/admin/dashboard";
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions";
import { getAdminNavData } from "@/actions/admin/admin-nav";

/** Shape of the data returned by getAdminNavData. */
export interface AdminNavData {
  todayRevenue: number;
  yesterdayRevenue: number;
  trend: number | null;
  weeklyTrend: { value: number }[];
  pendingOrders: number;
  openTickets: number;
  attentionCount: number;
}

/** Shape of the data returned by getAdminDashboardData. */
export type AdminDashboardData = NonNullable<
  Awaited<ReturnType<typeof getAdminDashboardData>>
>;

/** Default header date range (last 7 days). */
const DEFAULT_DATE_RANGE: DateRange = { from: subDays(new Date(), 6), to: new Date() };

/** State shape for the admin store. */
interface AdminState {
  permissions: AdminPermission[];
  navData: AdminNavData | null;
  dashboardData: AdminDashboardData | null;
  date: DateRange | undefined;
  setPermissions: (permissions: AdminPermission[]) => void;
  setNavData: (navData: AdminNavData | null) => void;
  setDashboardData: (dashboardData: AdminDashboardData | null) => void;
  setDate: (date: DateRange | undefined) => void;
  resetAdminState: () => void;
}

/** Selector returning the current admin permissions. */
export const selectAdminPermissions = (s: AdminState) => s.permissions;
/** Selector returning the current admin nav data. */
export const selectAdminNavData = (s: AdminState) => s.navData;
/** Selector returning the current admin dashboard data. */
export const selectAdminDashboardData = (s: AdminState) => s.dashboardData;
/** Selector returning the header date range. */
export const selectAdminDate = (s: AdminState) => s.date;
/** Selector returning all admin actions in a single object (stable reference via shallow). */
export const selectAdminActions = (s: AdminState) => ({
  setPermissions: s.setPermissions,
  setNavData: s.setNavData,
  setDashboardData: s.setDashboardData,
  setDate: s.setDate,
  resetAdminState: s.resetAdminState,
});

/**
 * Zustand store for admin layout state.
 * Server data (permissions, nav data, dashboard) is fetched via TanStack Query
 * and synced into this store through a useEffect on the query data.
 */
export const adminStore = create<AdminState>()((set) => ({
  permissions: [],
  navData: null,
  dashboardData: null,
  date: DEFAULT_DATE_RANGE,
  setPermissions: (permissions: AdminPermission[]) => set({ permissions }),
  setNavData: (navData: AdminNavData | null) => set({ navData }),
  setDashboardData: (dashboardData: AdminDashboardData | null) => set({ dashboardData }),
  setDate: (date: DateRange | undefined) => set({ date }),
  resetAdminState: () =>
    set({ permissions: [], navData: null, dashboardData: null, date: DEFAULT_DATE_RANGE }),
}));

/** Hook returning the current admin permissions. */
export function useAdminPermissions() {
  return adminStore(selectAdminPermissions);
}
/** Hook returning the current admin nav data. */
export function useAdminNavData() {
  return adminStore(selectAdminNavData);
}
/** Hook returning the current admin dashboard data. */
export function useAdminDashboardData() {
  return adminStore(selectAdminDashboardData);
}
/** Hook returning the header date range. */
export function useAdminDate() {
  return adminStore(selectAdminDate);
}
/** Hook returning all admin actions (stable reference). */
export function useAdminActions() {
  return adminStore(useShallow(selectAdminActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the current admin's permissions via TanStack Query and syncs the
 * result into the zustand store. Returns the raw query result, so callers
 * can react to loading/error states.
 */
export function useAdminPermissionsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data) adminStore.getState().setPermissions(data);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches sidebar nav data (earnings, badges, attention count) via TanStack
 * Query and syncs the result into the zustand store. Polls every 30s.
 * Pass `{ enabled: false }` until the session is confirmed to be an admin.
 */
export function useAdminNavDataQuery(options?: { enabled?: boolean }) {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-nav"],
    queryFn: getAdminNavData,
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (data) adminStore.getState().setNavData(data);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the admin dashboard payload via TanStack Query and syncs the
 * result into the zustand store. Polls every 30s.
 */
export function useAdminDashboardDataQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) adminStore.getState().setDashboardData(data);
  }, [data]);

  return { data, ...rest };
}
