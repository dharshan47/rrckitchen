"use client";

import { memo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "@/hooks/useSignUp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { OtpInputBoxes } from "@/components/ui/otp-input-boxes";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Store, ArrowRight, ShieldCheck, RotateCw, ChevronDown } from "lucide-react";
import Link from "next/link";
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
  subtitle?: string;
  nameLabel?: string;
  accountLinkHref?: string;
  accountLinkLabel?: string;
  referralCode?: string | null;
}

const IndianFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm shrink-0">
    <rect width="24" height="16" fill="#FFFFFF" />
    <rect width="24" height="5.33" fill="#FF9933" />
    <rect y="10.67" width="24" height="5.33" fill="#138808" />
    <circle cx="12" cy="8" r="1.5" stroke="#000080" strokeWidth="0.5" fill="none" />
    <circle cx="12" cy="8" r="0.5" fill="#000080" />
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1="12" y1="8" x2={12 + 1.5 * Math.cos(i * Math.PI / 4)} y2={8 + 1.5 * Math.sin(i * Math.PI / 4)} stroke="#000080" strokeWidth="0.2" />
    ))}
  </svg>
);

function SignupFormInner({ role = "customer", subtitle, nameLabel = "Full Name", accountLinkHref, accountLinkLabel, referralCode }: SignupFormProps) {
  const { step, errorMessage, isLoading, resendCooldown, sendOtp, verifyOtp, completeSignup, resendOtp } = useSignUp(role, referralCode ?? undefined);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const otpCode = useWatch({ control: otpForm.control, name: "code" }) || "";
  const nameForm = useForm<NameForm>({ resolver: zodResolver(nameSchema) });

  const isKitchen = role === "kitchen";
  const showBack = step !== "phone";

  return (
    <Card className="mx-auto w-full max-w-lg border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[1.5rem] overflow-hidden">
      <CardHeader className="px-8 pt-10 pb-6 text-center space-y-3 relative">
        {showBack && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="absolute left-6 top-10 inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Create Your <span className="text-green-700">Account</span>
        </h1>
        <p className="text-muted-foreground text-[15px]">
          {subtitle ?? "Sign up to your account to continue"}
        </p>
      </CardHeader>
      
      <CardContent className="px-8 pb-10">
        {step === "phone" && (
          <form onSubmit={phoneForm.handleSubmit((d) => sendOtp(d.phone))} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">Phone number</Label>
              <div className="flex border border-green-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-700/20 transition-all bg-white">
                <div className="flex items-center px-4 bg-white border-r border-border gap-2 shrink-0">
                  <IndianFlag />
                  <span className="text-sm font-medium text-gray-700 ml-1">+91</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className="border-0 focus-visible:ring-0 rounded-none bg-white flex-1 text-base py-6 placeholder:text-muted-foreground"
                  {...phoneForm.register("phone")}
                />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                We&apos;ll send you a verification code to sign up
              </p>
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-red-500">{phoneForm.formState.errors.phone.message}</p>
              )}
            </div>
            
            {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
            
            <Button type="submit" className="w-full h-14 text-base font-semibold bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-xl flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-5 w-5 text-white" /> Sending...</> : <>Continue <ArrowRight className="h-5 w-5" /></>}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit((d) => verifyOtp(d.code))} className="grid gap-6">
            <div className="grid gap-2 text-center">
              <Label htmlFor="otp" className="text-sm font-semibold text-gray-900 mb-2">Enter OTP code</Label>
              <div className="flex justify-center">
                <OtpInputBoxes
                  value={otpCode}
                  onChange={(value) => otpForm.setValue("code", value)}
                  disabled={isLoading}
                  className="pt-1"
                />
              </div>
              {otpForm.formState.errors.code && (
                <p className="text-xs text-red-500 mt-2">{otpForm.formState.errors.code.message}</p>
              )}
            </div>
            {errorMessage && <p className="text-xs text-red-500 text-center">{errorMessage}</p>}
            <Button type="submit" className="w-full h-14 text-base font-semibold bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-xl flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-5 w-5 text-white" /> Verifying...</> : <>Verify OTP <ArrowRight className="h-5 w-5" /></>}
            </Button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={nameForm.handleSubmit((d) => completeSignup(d.name, d.email, { kitchenName: d.kitchenName }))} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-900">{nameLabel}</Label>
                <div className="relative flex border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-700/20 focus-within:border-green-700 transition-all bg-white">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  disabled={isLoading}
                  className="border-0 focus-visible:ring-0 rounded-none bg-white flex-1 text-base py-6 pl-12 placeholder:text-muted-foreground"
                  autoFocus
                  {...nameForm.register("name")}
                />
              </div>
              {nameForm.formState.errors.name && (
                <p className="text-xs text-red-500">{nameForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email</Label>
                <div className="relative flex border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-700/20 focus-within:border-green-700 transition-all bg-white">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="border-0 focus-visible:ring-0 rounded-none bg-white flex-1 text-base py-6 pl-12 placeholder:text-muted-foreground"
                  {...nameForm.register("email")}
                />
              </div>
              {nameForm.formState.errors.email && (
                <p className="text-xs text-red-500">{nameForm.formState.errors.email.message}</p>
              )}
            </div>

            {isKitchen && (
              <div className="grid gap-2">
                <Label htmlFor="kitchenName" className="text-sm font-semibold text-gray-900">Kitchen Name</Label>
                <div className="relative flex border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-700/20 focus-within:border-green-700 transition-all bg-white">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="kitchenName"
                    placeholder="Your kitchen name"
                    disabled={isLoading}
                    className="border-0 focus-visible:ring-0 rounded-none bg-white flex-1 text-base py-6 pl-12 placeholder:text-muted-foreground"
                    {...nameForm.register("kitchenName")}
                  />
                </div>
              </div>
            )}

            {errorMessage && <p className="text-xs text-red-500 text-center">{errorMessage}</p>}
            <Button type="submit" className="w-full h-14 text-base font-semibold bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-xl flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <><Spinner className="h-5 w-5 text-white" /> Creating account...</> : <>Create Account <ArrowRight className="h-5 w-5" /></>}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">Didn&apos;t get a code?</p>
            <button
              type="button"
              onClick={resendOtp}
              className="mt-1 font-semibold text-[#FF5722] hover:underline disabled:opacity-50 disabled:hover:no-underline"
              disabled={isLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
        )}

        {/* Divider - Simple border as requested */}
        {step === "phone" && (
          <div className="my-8">
            <Separator className="bg-muted" />
          </div>
        )}

        {/* Info Box */}
        {step === "phone" && (
          <div className="bg-[#F6FAF7] rounded-xl p-5 flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-start sm:items-center">
            <div className="flex-1 flex flex-col items-center text-center gap-1.5 px-2">
              <ShieldCheck className="h-6 w-6 text-green-700" strokeWidth={1.5} />
              <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Secure Login</h4>
              <p className="text-[11px] text-muted-foreground leading-tight">Your data is safe with us</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
            <div className="flex-1 flex flex-col items-center text-center gap-1.5 px-2">
              <RotateCw className="h-6 w-6 text-green-700" strokeWidth={1.5} />
              <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Quick Access</h4>
              <p className="text-[11px] text-muted-foreground leading-tight">Login in seconds with OTP</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
            <div className="flex-1 flex flex-col items-center text-center gap-1.5 px-2">
              <ShieldCheck className="h-6 w-6 text-green-700" strokeWidth={1.5} />
              <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Trusted Support</h4>
              <p className="text-[11px] text-muted-foreground leading-tight">Real people, real support</p>
            </div>
          </div>
        )}

        {(accountLinkHref && accountLinkLabel) || step === "phone" ? (
          <div className="mt-8 text-center space-y-6">
            {accountLinkHref && accountLinkLabel && (
              <p className="text-[15px] text-muted-foreground">
                {accountLinkLabel}{" "}
                <Link href={accountLinkHref} className="font-semibold text-[#FF5722] hover:underline transition-all">
                  Login
                </Link>
              </p>
            )}
            
            {step === "phone" && (
              <p className="text-[13px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-green-700 hover:underline font-medium">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-green-700 hover:underline font-medium">Privacy Policy</Link>
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const SignupForm = memo(function SignupForm({ role = "customer", subtitle, nameLabel, accountLinkHref, accountLinkLabel, referralCode }: SignupFormProps) {
  return <SignupFormInner key={role} role={role} subtitle={subtitle} nameLabel={nameLabel} accountLinkHref={accountLinkHref} accountLinkLabel={accountLinkLabel} referralCode={referralCode} />;
});

export default SignupForm;
export type { SignupFormProps };
