import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AdminCustomerRow,
} from "@/actions/admin/admin-customers";
import {
  getAdminCustomers,
  adminDeleteCustomer,
  adminSendCustomerMessage,
} from "@/actions/admin/admin-customers";
import { banUser, unbanUser } from "@/actions/admin/ban-actions";

/** Shape of the payload returned by getAdminCustomers. */
export type AdminCustomersData = NonNullable<
  Awaited<ReturnType<typeof getAdminCustomers>>
>;

/** Shape of a push message being composed for customers. */
export interface AdminCustomerMessage {
  title: string;
  body: string;
}

/** State shape for the admin customers store. */
interface AdminCustomersState {
  customersData: AdminCustomersData | null;
  selectedUser: AdminCustomerRow | null;
  messageTargets: AdminCustomerRow[];
  message: AdminCustomerMessage;
  setCustomersData: (data: AdminCustomersData | null) => void;
  setSelectedUser: (user: AdminCustomerRow | null) => void;
  setMessageTargets: (targets: AdminCustomerRow[]) => void;
  setMessage: (message: AdminCustomerMessage) => void;
  resetAdminCustomersState: () => void;
}

/** Selector returning the full customers payload. */
export const selectAdminCustomersData = (s: AdminCustomersState) => s.customersData;
/** Selector returning the customer currently open in the detail sheet. */
export const selectAdminSelectedUser = (s: AdminCustomersState) => s.selectedUser;
/** Selector returning the rows selected for bulk actions / messaging. */
export const selectAdminMessageTargets = (s: AdminCustomersState) => s.messageTargets;
/** Selector returning the in-progress message (title/body). */
export const selectAdminCustomerMessage = (s: AdminCustomersState) => s.message;
/** Selector returning all customers actions in a single object (stable via shallow). */
export const selectAdminCustomersActions = (s: AdminCustomersState) => ({
  setCustomersData: s.setCustomersData,
  setSelectedUser: s.setSelectedUser,
  setMessageTargets: s.setMessageTargets,
  setMessage: s.setMessage,
  resetAdminCustomersState: s.resetAdminCustomersState,
});

/**
 * Zustand store for the admin customers page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; UI selection/messaging state lives here too.
 */
export const adminCustomersStore = create<AdminCustomersState>()((set) => ({
  customersData: null,
  selectedUser: null,
  messageTargets: [],
  message: { title: "", body: "" },
  setCustomersData: (customersData: AdminCustomersData | null) => set({ customersData }),
  setSelectedUser: (selectedUser: AdminCustomerRow | null) => set({ selectedUser }),
  setMessageTargets: (messageTargets: AdminCustomerRow[]) => set({ messageTargets }),
  setMessage: (message: AdminCustomerMessage) => set({ message }),
  resetAdminCustomersState: () =>
    set({ customersData: null, selectedUser: null, messageTargets: [], message: { title: "", body: "" } }),
}));

/** Hook returning the full customers payload. */
export function useAdminCustomersData() {
  return adminCustomersStore(selectAdminCustomersData);
}
/** Hook returning the customer open in the detail sheet. */
export function useAdminSelectedUser() {
  return adminCustomersStore(selectAdminSelectedUser);
}
/** Hook returning the rows selected for bulk actions / messaging. */
export function useAdminMessageTargets() {
  return adminCustomersStore(selectAdminMessageTargets);
}
/** Hook returning the in-progress message (title/body). */
export function useAdminCustomerMessage() {
  return adminCustomersStore(selectAdminCustomerMessage);
}
/** Hook returning all customers actions (stable reference). */
export function useAdminCustomersActions() {
  return adminCustomersStore(useShallow(selectAdminCustomersActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin customers payload (stats, charts, rows, recent orders)
 * via TanStack Query and syncs the result into the zustand store.
 * Polls every 30s.
 */
export function useAdminCustomersQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: getAdminCustomers,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) adminCustomersStore.getState().setCustomersData(data);
  }, [data]);

  return { data, ...rest };
}

/**
 * Bans a customer. Invalidates the customers query on success.
 */
export function useBanCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });
}

/**
 * Unbans a customer. Invalidates the customers query on success.
 */
export function useUnbanCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });
}

/**
 * Soft-deletes a customer and revokes their sessions.
 * Invalidates the customers query on success.
 */
export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminDeleteCustomer(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });
}

/**
 * Sends a push notification to one or more customers.
 * Loops over the provided targets and reports the total sent.
 */
export function useSendCustomerMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targets,
      message,
    }: {
      targets: AdminCustomerRow[];
      message: AdminCustomerMessage;
    }) => {
      let totalSent = 0;
      let firstError: string | undefined;
      for (const target of targets) {
        const res = await adminSendCustomerMessage(target.userId, message.title, message.body);
        if (!res.ok) {
          firstError = firstError ?? ("error" in res ? res.error : undefined);
          continue;
        }
        if ("sent" in res) totalSent += (res as { sent: number }).sent ?? 0;
      }
      if (firstError) return { ok: false as const, error: firstError, sent: totalSent };
      return { ok: true as const, sent: totalSent };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });
}
