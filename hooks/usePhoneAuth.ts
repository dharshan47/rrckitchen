"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore, UserRole } from "@/stores";
import { checkPhoneRegistered } from "@/actions/auth";

export function usePhoneAuth(role: UserRole) {
  const setRole = useAuthStore((state) => state.setRole);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "login">("phone");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setRole(role);
    resetAuthState();
  }, [role, resetAuthState, setRole]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const normalizePhoneNumber = useMemo(
    () => (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
      return "";
    },
    []
  );

  const sendOtp = useCallback(async (formPhone: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const normalized = normalizePhoneNumber(formPhone);
    if (!normalized) {
      setErrorMessage("Enter a valid mobile number including country code or 10-digit number.");
      return;
    }

    setIsLoading(true);
    try {
      const registered = await checkPhoneRegistered(normalized);
      if (!registered) {
        setErrorMessage("Phone number not registered. Please sign up.");
        return;
      }

      await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
      setPhoneNumber(normalized);
      setStep("otp");
      setResendCooldown(30);
      setStatusMessage("OTP sent. Check your SMS for the code.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [normalizePhoneNumber]);

  const verifyOtp = useCallback(async (code: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!code.trim()) {
      setErrorMessage("Enter the OTP code sent to your phone.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.phoneNumber.verify({ phoneNumber, code });
      if (result?.data) {
        setStatusMessage("Phone verified. Login to continue...");
        setStep("login");
      } else {
        setErrorMessage(result?.error?.message ?? "OTP verification failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const login = useCallback(() => {
    const redirectMap: Record<string, string> = {
      customer: "/",
      "delivery-partner": "/delivery-partner/dashboard",
      kitchen: "/kitchen/dashboard",
      admin: "/admin",
    };
    window.location.href = redirectMap[role] ?? "/";
  }, [role]);

  const resendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;

    setErrorMessage(null);
    setStatusMessage(null);

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) {
      setErrorMessage("Enter a valid mobile number to resend OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
      setResendCooldown(30);
      setStatusMessage("OTP resent. Check your SMS for the code.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, resendCooldown, normalizePhoneNumber]);

  return {
    step,
    statusMessage,
    errorMessage,
    isLoading,
    resendCooldown,
    sendOtp,
    verifyOtp,
    login,
    resendOtp,
  };
}
