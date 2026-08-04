"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@/stores";
import { assignUserRole, updateUserName } from "@/actions/onboarding/auth";
import { processReferralOnSignup } from "@/actions/referral/referral";
import { normalizePhone } from "@/lib/phone";

type SignUpRole = Exclude<UserRole, "admin">;

const roleToRoute: Record<SignUpRole, string> = {
  customer: "/",
  "delivery-partner": "/delivery-partner/dashboard",
  kitchen: "/kitchen/dashboard",
};

const roleToDbName: Record<SignUpRole, "CUSTOMER" | "DELIVERYPARTNER" | "KITCHENPARTNER"> = {
  customer: "CUSTOMER",
  "delivery-partner": "DELIVERYPARTNER",
  kitchen: "KITCHENPARTNER",
};

const sessionKey = ["auth-session"] as const;

export function useSignUp(role: SignUpRole, referralCode?: string) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendOtpMutation = useMutation({
    mutationFn: async (formPhone: string) => {
      const normalized = normalizePhone(formPhone);
      if (!normalized) throw new Error("Enter a valid 10-digit mobile number.");

      const res = await fetch("/api/auth/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "Failed to send OTP");
      }
      return normalized;
    },
    onSuccess: (normalized) => {
      setPhoneNumber(normalized);
      setStep("otp");
      setResendCooldown(30);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send OTP. Try again.");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!code.trim()) throw new Error("Enter the OTP code sent to your phone.");

      const res = await fetch("/api/auth/twilio/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "OTP verification failed. Try again.");
      }
    },
    onSuccess: () => {
      setStep("name");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    },
  });

  const completeSignup = useCallback(async (name: string, email: string, extra?: { kitchenName?: string }) => {
  void extra
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    try {
      await updateUserName(name.trim(), email.trim());
      await assignUserRole(roleToDbName[role]);

      if (referralCode) {
        const session = await queryClient.fetchQuery({
          queryKey: sessionKey,
          queryFn: async () => {
            const res = await fetch("/api/auth/session");
            return res.json();
          },
          staleTime: 30_000,
        });
        const userId = (session as { user?: { id?: string } }).user?.id;
        if (userId) {
          await processReferralOnSignup(referralCode, userId);
        }
      }

      window.location.href = roleToRoute[role];
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }, [role, referralCode, queryClient]);

  const resendOtpMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (resendCooldown > 0) return false;

      const normalized = normalizePhone(phoneNumber);
      if (!normalized) return false;

      const res = await fetch("/api/auth/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      return true;
    },
    onSuccess: (sent) => {
      if (sent) setResendCooldown(30);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend OTP. Try again.");
    },
  });

  const sendOtp = useCallback((formPhone: string) => sendOtpMutation.mutate(formPhone), [sendOtpMutation]);
  const verifyOtp = useCallback((code: string) => verifyOtpMutation.mutate(code), [verifyOtpMutation]);
  const resendOtp = useCallback(() => resendOtpMutation.mutate(), [resendOtpMutation]);

  return {
    step,
    errorMessage,
    isLoading: sendOtpMutation.isPending || verifyOtpMutation.isPending || resendOtpMutation.isPending,
    resendCooldown,
    sendOtp,
    verifyOtp,
    completeSignup,
    resendOtp,
  };
}
