import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { signIn, twoFactor } from "@/lib/auth-client";

/** Step of the admin 2FA challenge flow. */
export type AdminTwoFactorStep = "credentials" | "verify";
/** Verification method chosen during the challenge. */
export type AdminTwoFactorMethod = "totp" | "backup";

/** State shape for the admin 2FA challenge store. */
interface AdminTwoFactorState {
  step: AdminTwoFactorStep;
  method: AdminTwoFactorMethod;
  availableMethods: string[];
  trustDevice: boolean;
  totpNotEnabled: boolean;
  setStep: (step: AdminTwoFactorStep) => void;
  setMethod: (method: AdminTwoFactorMethod) => void;
  setAvailableMethods: (methods: string[]) => void;
  setTrustDevice: (trustDevice: boolean) => void;
  setTotpNotEnabled: (totpNotEnabled: boolean) => void;
  resetAdminTwoFactorState: () => void;
}

/** Selector returning the current challenge step. */
export const selectAdminTwoFactorStep = (s: AdminTwoFactorState) => s.step;
/** Selector returning the verification method in use. */
export const selectAdminTwoFactorMethod = (s: AdminTwoFactorState) => s.method;
/** Selector returning the 2FA methods the user can use. */
export const selectAdminTwoFactorAvailableMethods = (s: AdminTwoFactorState) => s.availableMethods;
/** Selector returning whether the device should be trusted for 30 days. */
export const selectAdminTwoFactorTrustDevice = (s: AdminTwoFactorState) => s.trustDevice;
/** Selector returning whether TOTP is known to be disabled for the account. */
export const selectAdminTwoFactorTotpNotEnabled = (s: AdminTwoFactorState) => s.totpNotEnabled;
/** Selector returning all 2FA challenge actions in a single object (stable via shallow). */
export const selectAdminTwoFactorActions = (s: AdminTwoFactorState) => ({
  setStep: s.setStep,
  setMethod: s.setMethod,
  setAvailableMethods: s.setAvailableMethods,
  setTrustDevice: s.setTrustDevice,
  setTotpNotEnabled: s.setTotpNotEnabled,
  resetAdminTwoFactorState: s.resetAdminTwoFactorState,
});

/**
 * Zustand store for the admin 2FA challenge page.
 * The sign-in flow state lives here; server interaction happens through
 * the TanStack Query mutation hooks below.
 */
export const adminTwoFactorStore = create<AdminTwoFactorState>()((set) => ({
  step: "credentials",
  method: "backup",
  availableMethods: [],
  trustDevice: true,
  totpNotEnabled: false,
  setStep: (step: AdminTwoFactorStep) => set({ step }),
  setMethod: (method: AdminTwoFactorMethod) => set({ method }),
  setAvailableMethods: (availableMethods: string[]) => set({ availableMethods }),
  setTrustDevice: (trustDevice: boolean) => set({ trustDevice }),
  setTotpNotEnabled: (totpNotEnabled: boolean) => set({ totpNotEnabled }),
  resetAdminTwoFactorState: () =>
    set({
      step: "credentials",
      method: "backup",
      availableMethods: [],
      trustDevice: true,
      totpNotEnabled: false,
    }),
}));

/** Hook returning the current challenge step. */
export function useAdminTwoFactorStep() {
  return adminTwoFactorStore(selectAdminTwoFactorStep);
}
/** Hook returning the verification method in use. */
export function useAdminTwoFactorMethod() {
  return adminTwoFactorStore(selectAdminTwoFactorMethod);
}
/** Hook returning the 2FA methods the user can use. */
export function useAdminTwoFactorAvailableMethods() {
  return adminTwoFactorStore(selectAdminTwoFactorAvailableMethods);
}
/** Hook returning whether the device should be trusted for 30 days. */
export function useAdminTwoFactorTrustDevice() {
  return adminTwoFactorStore(selectAdminTwoFactorTrustDevice);
}
/** Hook returning whether TOTP is known to be disabled for the account. */
export function useAdminTwoFactorTotpNotEnabled() {
  return adminTwoFactorStore(selectAdminTwoFactorTotpNotEnabled);
}
/** Hook returning all 2FA challenge actions (stable reference). */
export function useAdminTwoFactorActions() {
  return adminTwoFactorStore(useShallow(selectAdminTwoFactorActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Signs the admin in with email + password. When 2FA is required the
 * flow advances to the verify step; otherwise it redirects to /admin.
 */
export function useAdminSignInMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await signIn.email({ email, password });
      if (res?.error) throw new Error(res.error.message || "Invalid email or password");
      return res.data as Record<string, unknown>;
    },
    onSuccess: (data) => {
      if (data?.twoFactorRedirect) {
        const methods = (data.twoFactorMethods as string[]) || [];
        adminTwoFactorStore.getState().setAvailableMethods(methods);
        adminTwoFactorStore.getState().setStep("verify");
        if (!methods.includes("totp")) {
          adminTwoFactorStore.getState().setMethod("backup");
        }
        return;
      }
      window.location.assign("/admin");
    },
  });
}

/**
 * Verifies a TOTP code during the challenge. Falls back to backup codes
 * when TOTP is not enabled for the account.
 */
export function useAdminVerifyTotpMutation() {
  return useMutation({
    mutationFn: async ({ code, trustDevice }: { code: string; trustDevice: boolean }) => {
      const result = await twoFactor.verifyTotp({ code, trustDevice });
      if (result?.error) {
        const msg = result.error.message || result.error.statusText || "";
        if (
          msg.toLowerCase().includes("not enabled") ||
          msg.toLowerCase().includes("not set up") ||
          msg.toLowerCase().includes("not enrolled")
        ) {
          adminTwoFactorStore.getState().setTotpNotEnabled(true);
          adminTwoFactorStore.getState().setMethod("backup");
          throw new Error("TOTP is not enabled. Use a backup code or set up your authenticator app below.");
        }
        throw new Error(msg || "Verification failed");
      }
    },
    onSuccess: () => window.location.assign("/admin"),
  });
}

/**
 * Verifies a backup code during the challenge. Redirects to /admin on
 * success.
 */
export function useAdminVerifyBackupMutation() {
  return useMutation({
    mutationFn: async ({ code, trustDevice }: { code: string; trustDevice: boolean }) => {
      const result = await twoFactor.verifyBackupCode({ code, trustDevice });
      if (result?.error) {
        throw new Error(result.error.message || result.error.statusText || "Invalid backup code");
      }
    },
    onSuccess: () => window.location.assign("/admin"),
  });
}
