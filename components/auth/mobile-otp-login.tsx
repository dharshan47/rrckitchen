"use client";

import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner, OtpInputBoxes } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, Phone, KeyRound, LogIn } from "lucide-react";

export type UserRole = "customer" | "delivery-partner" | "kitchen";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .max(15)
    .regex(/^\+?\d{10,15}$/, "Enter a valid mobile number with country code"),
});

const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

interface MobileOtpLoginProps {
  role?: UserRole;
  noAccountHref?: string;
  noAccountLabel?: string;
}

/**
 * Inner component for phone-based OTP login flow.
 * Handles three steps: phone number entry, OTP verification, and final login.
 */
function MobileOtpLoginInner({ role = "customer", noAccountHref, noAccountLabel }: MobileOtpLoginProps) {
  const {
    step,
    statusMessage,
    errorMessage,
    isLoading,
    resendCooldown,
    sendOtp,
    verifyOtp,
    login,
    resendOtp,
  } = usePhoneAuth(role);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onPhoneSubmit = (data: PhoneForm) => {
    sendOtp(data.phone);
  };

  const onOtpSubmit = (data: OtpForm) => {
    verifyOtp(data.code);
  };

  const serverError = errorMessage ? (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-200">
      {errorMessage}
    </div>
  ) : null;

  const serverStatus = statusMessage ? (
    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary animate-in fade-in slide-in-from-top-2 duration-200">
      {statusMessage}
    </div>
  ) : null;

  return (
    <Card className="mx-auto w-full border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm bg-card">
      <CardHeader className="px-6 py-8">
        <CardTitle className="flex items-center gap-2 text-xl">
          {step !== "phone" && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg p-1 -ml-1 hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span>
            {step === "phone" && "Sign In"}
            {step === "otp" && "Enter OTP"}
            {step === "login" && "Ready to Login"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 pb-8">
        {step === "phone" && (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-medium">Mobile number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="+919876543210"
                  className="pl-10"
                  {...phoneForm.register("phone")}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
              )}
            </div>

            {serverError}
            {serverStatus}

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? (
                <><Spinner className="h-4 w-4" /> Sending OTP...</>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-sm font-medium">OTP code</Label>
              <OtpInputBoxes
                value={otpForm.watch("code") || ""}
                onChange={(value) => otpForm.setValue("code", value)}
                disabled={isLoading}
                className="pt-1"
              />
              {otpForm.formState.errors.code && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.code.message}</p>
              )}
            </div>

            {serverError}
            {serverStatus}

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? (
                <><Spinner className="h-4 w-4" /> Verifying...</>
              ) : (
                <><KeyRound className="h-4 w-4" /> Verify OTP</>
              )}
            </Button>
          </form>
        )}

        {step === "login" && (
          <div className="grid gap-4">
            {serverStatus}
            <Button type="button" className="w-full h-11 gap-2" onClick={login}>
              <LogIn className="h-4 w-4" /> Login
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>Didn&apos;t get a code?</p>
            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={resendOtp}
              className="mt-1 px-0 text-left h-auto font-medium"
              disabled={isLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </Button>
          </div>
        )}

        {noAccountHref && noAccountLabel && (
          <p className="text-center text-sm text-muted-foreground">
            {noAccountLabel}{" "}
            <Link href={noAccountHref} className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80">
              Sign Up
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const MobileOtpLogin = memo(function MobileOtpLogin({ role = "customer", noAccountHref, noAccountLabel }: MobileOtpLoginProps) {
  return <MobileOtpLoginInner key={role} role={role} noAccountHref={noAccountHref} noAccountLabel={noAccountLabel} />;
});

export default MobileOtpLogin;
