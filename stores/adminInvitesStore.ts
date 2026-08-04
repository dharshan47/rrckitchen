import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminInvites,
  getActiveAdmins,
  createAdminInvite,
} from "@/actions/admin/invites-actions";
import type { AdminPermission } from "@/lib/generated/prisma/client";

/** Shape of an admin invite row as returned by getAdminInvites. */
export type AdminInvite = NonNullable<
  Awaited<ReturnType<typeof getAdminInvites>>[number]
>;

/** Shape of an active admin row as returned by getActiveAdmins. */
export type ActiveAdmin = NonNullable<
  Awaited<ReturnType<typeof getActiveAdmins>>[number]
>;

/** State shape for the admin invites store. */
interface AdminInvitesState {
  invites: AdminInvite[];
  activeAdmins: ActiveAdmin[];
  setInvites: (invites: AdminInvite[]) => void;
  setActiveAdmins: (activeAdmins: ActiveAdmin[]) => void;
  resetAdminInvitesState: () => void;
}

/** Selector returning the invite links list. */
export const selectAdminInvites = (s: AdminInvitesState) => s.invites;
/** Selector returning the active admins list. */
export const selectAdminActiveAdmins = (s: AdminInvitesState) => s.activeAdmins;
/** Selector returning all invites actions in a single object (stable via shallow). */
export const selectAdminInvitesActions = (s: AdminInvitesState) => ({
  setInvites: s.setInvites,
  setActiveAdmins: s.setActiveAdmins,
  resetAdminInvitesState: s.resetAdminInvitesState,
});

/**
 * Zustand store for the admin invites page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const adminInvitesStore = create<AdminInvitesState>()((set) => ({
  invites: [],
  activeAdmins: [],
  setInvites: (invites: AdminInvite[]) => set({ invites }),
  setActiveAdmins: (activeAdmins: ActiveAdmin[]) => set({ activeAdmins }),
  resetAdminInvitesState: () => set({ invites: [], activeAdmins: [] }),
}));

/** Hook returning the invite links list. */
export function useAdminInvites() {
  return adminInvitesStore(selectAdminInvites);
}
/** Hook returning the active admins list. */
export function useAdminActiveAdmins() {
  return adminInvitesStore(selectAdminActiveAdmins);
}
/** Hook returning all invites actions (stable reference). */
export function useAdminInvitesActions() {
  return adminInvitesStore(useShallow(selectAdminInvitesActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin invite links list via TanStack Query and syncs the
 * result into the zustand store. Polls every 30s.
 */
export function useAdminInvitesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: getAdminInvites,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminInvitesStore.getState().setInvites(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches the active admins list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminActiveAdminsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-active"],
    queryFn: getActiveAdmins,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminInvitesStore.getState().setActiveAdmins(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Creates a new admin invite link for the given permissions.
 * Invalidates the invites query on success.
 */
export function useCreateAdminInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: AdminPermission[]) => createAdminInvite(permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
  });
}
