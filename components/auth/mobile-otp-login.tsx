"use client";

import { memo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { OtpInputBoxes } from "@/components/ui/otp-input-boxes";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, LogIn, ArrowRight, ShieldCheck, RotateCw } from "lucide-react";
import Link from "next/link";
import IndianFlag from "@/components/icons/indian-flag";

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
    <Card className="mx-auto w-full max-w-lg border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[1.5rem] overflow-hidden">
      <CardHeader className="px-5 sm:px-8 pt-8 sm:pt-10 pb-6 text-center space-y-3 relative">
        {step !== "phone" && !verified && (
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
          Welcome <span className="text-green-700">Back!</span>
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Sign in to your account to continue
        </p>
      </CardHeader>
      
      <CardContent className="px-5 sm:px-8 pb-8 sm:pb-10">
        {step === "phone" && !verified && (
          <form onSubmit={phoneForm.handleSubmit((d) => sendOtp(d.phone))} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">Phone number</Label>
              <div className="flex items-center border border-green-700 rounded-[8px] focus-within:ring-2 focus-within:ring-green-700/20 transition-all bg-white h-[56px] pl-3 sm:pl-4 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-2 sm:pr-3 cursor-pointer">
                  <IndianFlag className="!w-[22px]" />
                  <span className="text-[15px] font-medium text-[#4B5563]">+91</span>
                
                </div>
                <div className="w-[1px] h-[28px] bg-[#E5E7EB] shrink-0"></div>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  className="border-0 focus-visible:ring-0 rounded-none bg-transparent flex-1 min-w-0 w-full text-[16px] px-3 sm:px-4 py-6 h-full placeholder:text-[#6B7280] text-[#111827]"
                  {...phoneForm.register("phone")}
                />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                We&apos;ll send you a verification code to sign in
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

        {step === "otp" && !verified && (
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

        {/* Success state after verification */}
        {verified && (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-4 border-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">Phone Verified!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your phone number has been verified successfully.
              </p>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="h-5 w-5" />
              Login 
            </Button>
          </div>
        )}

        {step === "otp" && !verified && (
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
        {!verified && step === "phone" && (
          <div className="my-8">
            <Separator className="bg-muted" />
          </div>
        )}

        {/* Info Box */}
        {!verified && step === "phone" && (
          <div className="bg-[#F6FAF7] rounded-xl p-4 sm:p-5 grid grid-cols-3 gap-0 divide-x divide-gray-200">
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 px-1 sm:px-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#087A35]" fill="none" strokeWidth={1.5} />
              <h4 className="text-[10px] sm:text-[13px] font-bold text-gray-900 leading-tight">Secure Login</h4>
              <p className="text-[9px] sm:text-[11px] text-muted-foreground leading-tight hidden sm:block">Your data is safe with us</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 px-1 sm:px-2">
              <RotateCw className="h-5 w-5 sm:h-6 sm:w-6 text-[#087A35]" fill="none" strokeWidth={1.5} />
              <h4 className="text-[10px] sm:text-[13px] font-bold text-gray-900 leading-tight">Quick Access</h4>
              <p className="text-[9px] sm:text-[11px] text-muted-foreground leading-tight hidden sm:block">Login in seconds with OTP</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 px-1 sm:px-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#087A35]" fill="none" strokeWidth={1.5} />
              <h4 className="text-[10px] sm:text-[13px] font-bold text-gray-900 leading-tight">Trusted Support</h4>
              <p className="text-[9px] sm:text-[11px] text-muted-foreground leading-tight hidden sm:block">Real people, real support</p>
            </div>
          </div>
        )}

        {!verified && noAccountHref && noAccountLabel && (
          <div className="mt-8 text-center space-y-6">
            <p className="text-[15px] text-muted-foreground">
              {noAccountLabel}{" "}
              <Link href={noAccountHref} className="font-semibold text-[#FF5722] hover:underline transition-all">
                Sign up
              </Link>
            </p>
            
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
              By continuing, you agree to our{" "}
              <Link href="/terms-of-use" className="text-[#087A35] hover:underline font-medium">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-[#087A35] hover:underline font-medium">Privacy Policy</Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const MobileOtpLogin = memo(function MobileOtpLogin({ role = "customer", noAccountHref, noAccountLabel }: MobileOtpLoginProps) {
  return <MobileOtpLoginInner key={role} role={role} noAccountHref={noAccountHref} noAccountLabel={noAccountLabel} />;
});

export default MobileOtpLogin;