"use client";

import { memo } from "react";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, InputOTP, Label } from "@/components/ui";

export type UserRole = "customer" | "delivery-partner" | "kitchen";

interface MobileOtpLoginProps {
  role?: UserRole;
}

function MobileOtpLoginInner({ role = "customer" }: MobileOtpLoginProps) {
  const {
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
  } = usePhoneAuth(role);

  return (
    <Card className="mx-auto w-full max-w-lg border border-border bg-white">
      <CardHeader className="px-6 py-6">
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 px-6 py-2">
        <form onSubmit={step === "phone" ? sendOtp : verifyOtp} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              inputMode="tel"
              pattern="[0-9+ ]*"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+919876543210"
              disabled={step === "otp"}
              required
            />
          </div>

          {step === "otp" ? (
            <div className="grid gap-2">
              <Label htmlFor="otp">OTP code</Label>
              <InputOTP
                id="otp"
                value={code}
                onChange={setCode}
                maxLength={6}
                autoFocus
                className="w-full"
              />
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              {statusMessage}
            </div>
          ) : null}

          {step === "login" ? (
            <Button type="button" className="w-full" onClick={login}>
              Login
            </Button>
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {step === "phone" ? "Continue" : "Verify OTP"}
            </Button>
          )}
        </form>

        {step === "otp" ? (
          <div className="rounded-3xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
            <p>Didn&apos;t get a code?</p>
            <Button variant="link" size="sm" type="button" onClick={resendOtp} className="mt-2 px-0 text-left">
              Resend OTP
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const MobileOtpLogin = memo(function MobileOtpLogin({ role = "customer" }: MobileOtpLoginProps) {
  return <MobileOtpLoginInner key={role} role={role} />;
});

export default MobileOtpLogin;
