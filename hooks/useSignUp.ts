"use client";

import { useCallback, useEffect, useState } from "react";
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

export function useSignUp(role: SignUpRole, referralCode?: string) {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
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

    const normalized = normalizePhone(formPhone);
    if (!normalized) {
      setErrorMessage("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setPhoneNumber(normalized);
      setStep("otp");
      setResendCooldown(30);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage("Enter the OTP code sent to your phone.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/twilio/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        setErrorMessage(data.error || "OTP verification failed. Try again.");
        return;
      }

      setStep("name");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const completeSignup = useCallback(async (name: string, email: string, extra?: { kitchenName?: string }) => {
  void extra
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserName(name.trim(), email.trim());
      await assignUserRole(roleToDbName[role]);

      if (referralCode) {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.id) {
          await processReferralOnSignup(referralCode, session.user.id);
        }
      }

      window.location.href = roleToRoute[role];
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [role, referralCode]);

  const resendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;

    setErrorMessage(null);

    const normalized = normalizePhone(phoneNumber);
    if (!normalized) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setResendCooldown(30);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, resendCooldown]);

  return {
    step,
    errorMessage,
    isLoading,
    resendCooldown,
    sendOtp,
    verifyOtp,
    completeSignup,
    resendOtp,
  };
}