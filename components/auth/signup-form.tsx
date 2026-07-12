"use client";

import { memo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "@/hooks/useSignUp";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner, OtpInputBoxes } from "@/components/ui";
import { ArrowLeft, User, Mail, Phone, UserPlus, Store } from "lucide-react";
import type { UserRole } from "@/stores";
type SignUpRole = Exclude<UserRole, "admin">;

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

const nameSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  kitchenName: z.string().optional(),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type NameForm = z.infer<typeof nameSchema>;

interface SignupFormProps {
  role?: SignUpRole;
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  accountLinkHref?: string;
  accountLinkLabel?: string;
}

function SignupFormInner({ role = "customer", title, subtitle, nameLabel = "Full Name", accountLinkHref, accountLinkLabel }: SignupFormProps) {
  const { step, errorMessage, isLoading, resendCooldown, sendOtp, verifyOtp, completeSignup, resendOtp } = useSignUp(role);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const otpCode = useWatch({ control: otpForm.control, name: "code" }) || "";
  const nameForm = useForm<NameForm>({ resolver: zodResolver(nameSchema) });

  const isKitchen = role === "kitchen";
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
          <form onSubmit={phoneForm.handleSubmit((d) => sendOtp(d.phone))} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-medium">Mobile number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="9876543210"
                  disabled={isLoading}
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

        {step === "otp" && (
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
              {isLoading ? <><Spinner className="h-4 w-4" /> Verifying...</> : "Verify OTP"}
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
          <form onSubmit={nameForm.handleSubmit((d) => completeSignup(d.name, d.email, { kitchenName: d.kitchenName }))} className="grid gap-5">
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

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="pl-10"
                  {...nameForm.register("email")}
                />
              </div>
              {nameForm.formState.errors.email && (
                <p className="text-xs text-destructive">{nameForm.formState.errors.email.message}</p>
              )}
            </div>

            {isKitchen && (
              <div className="grid gap-2">
                <Label htmlFor="kitchenName" className="text-sm font-medium">Kitchen Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="kitchenName"
                    placeholder="Your kitchen name"
                    disabled={isLoading}
                    className="pl-10"
                    {...nameForm.register("kitchenName")}
                  />
                </div>
              </div>
            )}

            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-4 w-4" /> Creating account...</> : <><UserPlus className="h-4 w-4" /> Create Account</>}
            </Button>
          </form>
        )}

        {accountLinkHref && accountLinkLabel && (
          <p className="text-center text-sm text-muted-foreground">
            {accountLinkLabel}{" "}
            <a href={accountLinkHref} className="font-semibold text-primary hover:underline underline-offset-4 transition-all hover:text-primary/80">
              Login
            </a>
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
