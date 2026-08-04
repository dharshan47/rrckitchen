import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validateAdminInvite, acceptAdminInvite } from "@/actions/admin/invites-actions";
import { signUp, signOut } from "@/lib/auth-client";

/** Result of validating an admin invite token against the backend. */
export type AdminInviteStatus = ReturnType<typeof validateAdminInvite> extends Promise<infer T>
  ? T
  : never;

export type AdminInviteInvalidReason = "not_found" | "consumed" | "revoked" | "expired";

interface AcceptInviteState {
  inviteStatus: AdminInviteStatus | null;
  inviteLoading: boolean;
  showPassword: boolean;
  submitError: string | null;
  setInviteStatus: (status: AdminInviteStatus | null) => void;
  setInviteLoading: (loading: boolean) => void;
  setShowPassword: (show: boolean) => void;
  toggleShowPassword: () => void;
  setSubmitError: (message: string | null) => void;
  resetAcceptInviteState: () => void;
}

export const acceptInviteStore = create<AcceptInviteState>()((set) => ({
  inviteStatus: null,
  inviteLoading: true,
  showPassword: false,
  submitError: null,
  setInviteStatus: (inviteStatus) => set({ inviteStatus }),
  setInviteLoading: (inviteLoading) => set({ inviteLoading }),
  setShowPassword: (showPassword) => set({ showPassword }),
  toggleShowPassword: () => set((s) => ({ showPassword: !s.showPassword })),
  setSubmitError: (submitError) => set({ submitError }),
  resetAcceptInviteState: () =>
    set({ inviteStatus: null, inviteLoading: true, showPassword: false, submitError: null }),
}));

export function useAcceptInviteStatus() {
  return acceptInviteStore((s) => s.inviteStatus);
}
export function useAcceptInviteLoading() {
  return acceptInviteStore((s) => s.inviteLoading);
}
export function useAcceptInviteShowPassword() {
  return acceptInviteStore((s) => s.showPassword);
}
export function useAcceptInviteSubmitError() {
  return acceptInviteStore((s) => s.submitError);
}
export function useAcceptInviteActions() {
  return acceptInviteStore(
    useShallow((s) => ({
      setInviteStatus: s.setInviteStatus,
      setInviteLoading: s.setInviteLoading,
      setShowPassword: s.setShowPassword,
      toggleShowPassword: s.toggleShowPassword,
      setSubmitError: s.setSubmitError,
      resetAcceptInviteState: s.resetAcceptInviteState,
    }))
  );
}

/* ------------------------- TanStack Query hooks ------------------------- */

/** Validates the invite token on the backend and syncs the result into the store. */
export function useInviteValidationQuery(token: string) {
  const query = useQuery({
    queryKey: ["admin-invite", token],
    queryFn: () => validateAdminInvite(token),
    enabled: Boolean(token),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const store = acceptInviteStore.getState();
    store.setInviteStatus(query.data ?? null);
    store.setInviteLoading(query.isLoading);
  }, [query.data, query.isLoading]);

  return query;
}

/** Signs the invitee out of any existing session before accepting. */
export function useInviteSignOutMutation() {
  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
  });
}

/** Creates the admin account and consumes the invite. */
export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      email,
      password,
    }: {
      token: string;
      email: string;
      password: string;
    }) => {
      const result = await signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });
      if (result.error) {
        throw new Error(
          result.error.message || "Could not create account — this email may already be in use"
        );
      }
      await acceptAdminInvite(token);
      return result;
    },
    onSuccess: () => {
      acceptInviteStore.getState().setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-invite"] });
    },
    onError: (err) => {
      acceptInviteStore
        .getState()
        .setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    },
  });
}
