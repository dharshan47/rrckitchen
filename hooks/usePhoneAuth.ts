"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, UserRole } from "@/stores";
import { checkPhoneRegistered } from "@/actions/onboarding/auth";
import { normalizePhone } from "@/lib/phone";

export function usePhoneAuth(role: UserRole) {
  const setRole = useAuthStore((state) => state.setRole);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const phoneNumberRef = useRef(phoneNumber);
  const roleRef = useRef(role);
  const resendCooldownRef = useRef(resendCooldown);

  useEffect(() => { phoneNumberRef.current = phoneNumber; }, [phoneNumber]);
  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => { resendCooldownRef.current = resendCooldown; }, [resendCooldown]);

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

  const sendOtpMutation = useMutation({
    mutationFn: async (formPhone: string) => {
      const normalized = normalizePhone(formPhone);
      if (!normalized) throw new Error("Enter a valid 10-digit mobile number.");

      const registered = await checkPhoneRegistered(normalized);
      if (!registered) throw new Error("Phone number not registered. Please sign up.");

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
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!code.trim()) throw new Error("Enter the OTP code sent to your phone.");

      const currentPhone = phoneNumberRef.current;

      const res = await fetch("/api/auth/twilio/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, phoneNumber: currentPhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.error || "OTP verification failed. Please try again.");
      }
    },
    onSuccess: () => {
      setVerified(true);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (resendCooldownRef.current > 0 || !phoneNumberRef.current) return false;

      const normalized = normalizePhone(phoneNumberRef.current);
      if (!normalized) throw new Error("Enter a valid mobile number to resend OTP.");

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
      return true;
    },
    onError: (error) => {
      setErrorMessage(error.message);
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
    verified,
    sendOtp,
    verifyOtp,
    resendOtp,
  };
}
