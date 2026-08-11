import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminInvites,
  getActiveAdmins,
  createAdminInvite,
  revokeAdminInvite,
  deleteAdminInvite,
  deactivateAdmin,
  reactivateAdmin,
} from "@/actions/admin/invites-actions";
import type { AdminPermission } from "@/lib/generated/prisma/client";

export type AdminInviteRow = NonNullable<Awaited<ReturnType<typeof getAdminInvites>>>[number];
export type ActiveAdminRow = NonNullable<Awaited<ReturnType<typeof getActiveAdmins>>>[number];

const INVITES_KEY = ["admin-invites"] as const;
const ADMINS_KEY = ["admin-active-admins"] as const;

/** Fetches admin invites, polling every 30s. */
export function useAdminInvitesQuery() {
  return useQuery({
    queryKey: INVITES_KEY,
    queryFn: getAdminInvites,
    refetchInterval: 30_000,
  });
}

/** Fetches active admins, polling every 30s. */
export function useActiveAdminsQuery() {
  return useQuery({
    queryKey: ADMINS_KEY,
    queryFn: getActiveAdmins,
    refetchInterval: 30_000,
  });
}

/** Creates a new admin invite link. */
export function useCreateInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: AdminPermission[]) => createAdminInvite(permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

/** Revokes a pending invite. */
export function useRevokeInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeAdminInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

/** Permanently deletes an invite. */
export function useDeleteInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => deleteAdminInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

/** Deactivates an admin profile. */
export function useDeactivateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => deactivateAdmin(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMINS_KEY });
    },
  });
}

/** Reactivates a deactivated admin profile. */
export function useReactivateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => reactivateAdmin(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMINS_KEY });
    },
  });
}
