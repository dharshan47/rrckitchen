import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { twoFactor } from "@/lib/auth-client";

/** Step of the admin 2FA setup flow. */
export type AdminTwoFactorSetupStep = "verify" | "password" | "codes";

/** State shape for the admin 2FA setup store. */
interface AdminTwoFactorSetupState {
  step: AdminTwoFactorSetupStep;
  backupCodes: string[] | null;
  setStep: (step: AdminTwoFactorSetupStep) => void;
  setBackupCodes: (backupCodes: string[] | null) => void;
  resetAdminTwoFactorSetupState: () => void;
}

/** Selector returning the current setup step. */
export const selectAdminTwoFactorSetupStep = (s: AdminTwoFactorSetupState) => s.step;
/** Selector returning the generated backup codes (null before generation). */
export const selectAdminTwoFactorSetupBackupCodes = (s: AdminTwoFactorSetupState) => s.backupCodes;
/** Selector returning all setup actions in a single object (stable via shallow). */
export const selectAdminTwoFactorSetupActions = (s: AdminTwoFactorSetupState) => ({
  setStep: s.setStep,
  setBackupCodes: s.setBackupCodes,
  resetAdminTwoFactorSetupState: s.resetAdminTwoFactorSetupState,
});

/**
 * Zustand store for the admin 2FA setup page.
 * The setup flow state lives here; server interaction happens through
 * the TanStack Query mutation hooks below.
 */
export const adminTwoFactorSetupStore = create<AdminTwoFactorSetupState>()((set) => ({
  step: "verify",
  backupCodes: null,
  setStep: (step: AdminTwoFactorSetupStep) => set({ step }),
  setBackupCodes: (backupCodes: string[] | null) => set({ backupCodes }),
  resetAdminTwoFactorSetupState: () => set({ step: "verify", backupCodes: null }),
}));

/** Hook returning the current setup step. */
export function useAdminTwoFactorSetupStep() {
  return adminTwoFactorSetupStore(selectAdminTwoFactorSetupStep);
}
/** Hook returning the generated backup codes (null before generation). */
export function useAdminTwoFactorSetupBackupCodes() {
  return adminTwoFactorSetupStore(selectAdminTwoFactorSetupBackupCodes);
}
/** Hook returning all setup actions (stable reference). */
export function useAdminTwoFactorSetupActions() {
  return adminTwoFactorSetupStore(useShallow(selectAdminTwoFactorSetupActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Enables 2FA for the current admin and returns the TOTP provisioning URI
 * used to render the QR code.
 */
export function useAdminEnableTwoFactorMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await twoFactor.enable({});
      if (res?.error) throw new Error(res.error.message || "Failed to enable 2FA");
      return res.data as { totpURI?: string } | undefined;
    },
  });
}

/**
 * Verifies the 6-digit TOTP code during setup. Moves the flow to the
 * password step on success.
 */
export function useAdminVerifyTotpCodeMutation() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await twoFactor.verifyTotp({ code });
      if (res?.error) throw new Error(res.error.message || "Verification failed");
    },
    onSuccess: () => {
      adminTwoFactorSetupStore.getState().setStep("password");
    },
  });
}

/**
 * Generates backup codes after confirming the admin password. Stores the
 * codes and moves the flow to the final step on success.
 */
export function useAdminGenerateBackupCodesMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const res = await twoFactor.generateBackupCodes({ password });
      if (res?.error) throw new Error(res.error.message || "Failed to generate backup codes");
      return res.data as { backupCodes?: string[] } | undefined;
    },
    onSuccess: (data) => {
      adminTwoFactorSetupStore.getState().setBackupCodes(data?.backupCodes ?? null);
      adminTwoFactorSetupStore.getState().setStep("codes");
    },
  });
}
