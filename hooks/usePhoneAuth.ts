"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore, UserRole } from "@/stores";

export function usePhoneAuth(role: UserRole) {
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const code = useAuthStore((state) => state.code);
  const setRole = useAuthStore((state) => state.setRole);
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setCode = useAuthStore((state) => state.setCode);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  const [step, setStep] = useState<"phone" | "otp" | "login">("phone");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRole(role);
    resetAuthState();
    setStep("phone");
    setStatusMessage(null);
    setErrorMessage(null);
  }, [role, resetAuthState, setRole]);

  const normalizePhoneNumber = useMemo(
    () => (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
      return "";
    },
    []
  );

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) {
      setErrorMessage("Enter a valid mobile number including country code or 10-digit number.");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
      setPhoneNumber(normalized);
      setStep("otp");
      setStatusMessage("OTP sent. Check your SMS for the code.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
  };

  const login = () => {
    const redirectMap: Record<string, string> = {
      customer: "/",
      supplier: "/supplier",
      kitchen: "/kitchen",
      admin: "/admin",
    };
    window.location.href = redirectMap[role] ?? "/";
  };

  const resendOtp = async () => {
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
      setStatusMessage("OTP resent. Check your SMS for the code.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phoneNumber,
    code,
    step,
    statusMessage,
    errorMessage,
    isLoading,
    setPhoneNumber,
    setCode,
    sendOtp,
    verifyOtp,
    login,
    resendOtp,
  };
}
