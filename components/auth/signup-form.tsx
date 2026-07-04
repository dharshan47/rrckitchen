"use client";

import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "@/hooks/useSignUp";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner, OtpInputBoxes } from "@/components/ui";
import { ArrowLeft, User, Phone, UserPlus } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@/stores";

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

const nameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type NameForm = z.infer<typeof nameSchema>;

interface SignupFormProps {
  role?: UserRole;
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  accountLinkHref?: string;
  accountLinkLabel?: string;
}

function SignupFormInner({ role = "customer", title, subtitle, nameLabel = "Full Name", accountLinkHref, accountLinkLabel }: SignupFormProps) {
  const {
    step, statusMessage, errorMessage, isLoading, resendCooldown,
    sendOtp, verifyOtp, completeSignup, resendOtp,
  } = useSignUp(role);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
  });

  const onPhoneSubmit = (data: PhoneForm) => {
    sendOtp(data.phone);
  };

  const onOtpSubmit = (data: OtpForm) => {
    verifyOtp(data.code);
  };

  const onNameSubmit = (data: NameForm) => {
    completeSignup(data.name);
  };

  const serverError = errorMessage && (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-200">
      {errorMessage}
    </div>
  );

  const serverStatus = statusMessage && (
    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary animate-in fade-in slide-in-from-top-2 duration-200">
      {statusMessage}
    </div>
  );

  const showBack = step !== "phone";

  return (
    <Card className="mx-auto w-full border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm bg-card">
      <CardHeader className="px-6 py-8">
        <CardTitle className="flex items-center gap-2 text-xl">
          {showBack && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg p-1 -ml-1 hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span>{title ?? "Create Account"}</span>
        </CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
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
                  disabled={isLoading}
                  className="pl-10"
                  {...phoneForm.register("phone")}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
              )}
            </div>

            {serverError}

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
                "Verify OTP"
              )}
            </Button>
          </form>
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

        {step === "name" && (
          <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">{nameLabel}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  placeholder="Enter your name"
                  disabled={isLoading}
                  className="pl-10"
                  autoFocus
                  {...nameForm.register("name")}
                />
              </div>
              {nameForm.formState.errors.name && (
                <p className="text-xs text-destructive">{nameForm.formState.errors.name.message}</p>
              )}
            </div>

            {serverError}
            {serverStatus}

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? (
                <><Spinner className="h-4 w-4" /> Setting up...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Create Account</>
              )}
            </Button>
          </form>
        )}

        {accountLinkHref && accountLinkLabel && (
          <p className="text-center text-sm text-muted-foreground">
            {accountLinkLabel}{" "}
            <Link href={accountLinkHref} className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80">
              {accountLinkHref.includes("login") ? "Login" : "Sign In"}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const SignupForm = memo(function SignupForm({ role = "customer", title, subtitle, nameLabel, accountLinkHref, accountLinkLabel }: SignupFormProps) {
  return <SignupFormInner key={role} role={role} title={title} subtitle={subtitle} nameLabel={nameLabel} accountLinkHref={accountLinkHref} accountLinkLabel={accountLinkLabel} />;
});

export default SignupForm;
export type { SignupFormProps };
