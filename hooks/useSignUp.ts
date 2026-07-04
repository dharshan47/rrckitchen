"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/stores";
import { assignUserRole, updateUserName } from "@/actions/auth";

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return "";
};

const roleToRoute: Record<UserRole, string> = {
  customer: "/",
  "delivery-partner": "/delivery-partner/dashboard",
  kitchen: "/kitchen/dashboard",
  admin: "/admin",
};

const roleToDbName: Record<UserRole, string> = {
  customer: "CUSTOMER",
  "delivery-partner": "DELIVERYPARTNER",
  kitchen: "KITCHENPARTNER",
  admin: "ADMIN",
};

export function useSignUp(role: UserRole) {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendOtp = useCallback(async (formPhone: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const normalized = normalizePhone(formPhone);
    if (!normalized) {
      setErrorMessage("Enter a valid mobile number including country code or 10-digit number.");
      return;
    }

    setIsLoading(true);
    try {
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
  }, []);

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
      if (result?.error) {
        setErrorMessage(result.error.message ?? "OTP verification failed. Try again.");
        return;
      }

      setStatusMessage("Phone verified! Now set your name...");
      setStep("name");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const completeSignup = useCallback(async (formName: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!formName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      setStatusMessage("Setting up your profile...");

      await updateUserName(formName.trim());
      await assignUserRole(roleToDbName[role]);

      setStatusMessage("Redirecting...");
      window.location.href = roleToRoute[role];
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  const resendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;

    setErrorMessage(null);
    setStatusMessage(null);

    const normalized = normalizePhone(phoneNumber);
    if (!normalized) return;

    setIsLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
      setResendCooldown(30);
      setStatusMessage("OTP resent. Check your SMS.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, resendCooldown]);

  return {
    step,
    statusMessage,
    errorMessage,
    isLoading,
    resendCooldown,
    sendOtp,
    verifyOtp,
    completeSignup,
    resendOtp,
  };
}
