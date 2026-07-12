"use client";

import { memo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner, OtpInputBoxes } from "@/components/ui";
import { ArrowLeft, Phone, KeyRound, CheckCircle, LogIn } from "lucide-react";

export type UserRole = "customer" | "delivery-partner" | "kitchen";

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
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

function MobileOtpLoginInner({ role = "customer", noAccountHref, noAccountLabel }: MobileOtpLoginProps) {
  const { step, errorMessage, isLoading, resendCooldown, verified, sendOtp, verifyOtp, resendOtp } = usePhoneAuth(role);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const otpCode = useWatch({ control: otpForm.control, name: "code" }) || "";

  const handleLogin = () => {
    const redirectMap: Record<string, string> = {
      customer: "/",
      "delivery-partner": "/delivery-partner/dashboard",
      kitchen: "/kitchen/dashboard",
    };
    window.location.href = redirectMap[role] ?? "/";
  };

  return (
    <Card className="mx-auto w-full border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm bg-card">
      <CardHeader className="px-6 py-8">
        <CardTitle className="flex items-center gap-2 text-xl">
          {step !== "phone" && !verified && (
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
            {verified ? "Welcome!" : step === "phone" ? "Sign In" : "Enter OTP"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 pb-8">
        {step === "phone" && !verified && (
          <form onSubmit={phoneForm.handleSubmit((d) => sendOtp(d.phone))} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="9876543210"
                  className="pl-10"
                  {...phoneForm.register("phone")}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
              )}
            </div>
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-4 w-4" /> Sending OTP...</> : "Continue"}
            </Button>
          </form>
        )}

        {step === "otp" && !verified && (
          <form onSubmit={otpForm.handleSubmit((d) => verifyOtp(d.code))} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-sm font-medium">OTP code</Label>
              <OtpInputBoxes
                value={otpCode}
                onChange={(value) => otpForm.setValue("code", value)}
                disabled={isLoading}
                className="pt-1"
              />
              {otpForm.formState.errors.code && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.code.message}</p>
              )}
            </div>
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-4 w-4" /> Verifying...</> : <><KeyRound className="h-4 w-4" /> Verify OTP</>}
            </Button>
          </form>
        )}

        {/* Success state after verification */}
        {verified && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">Phone Verified!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your phone number has been verified successfully.
              </p>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full h-11 gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login 
            </Button>
          </div>
        )}

        {step === "otp" && !verified && (
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
        {!verified && noAccountHref && noAccountLabel && (
          <p className="text-center text-sm text-muted-foreground">
            {noAccountLabel}{" "}
            <a href={noAccountHref} className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80">
              Sign up
            </a>
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