"use client";

import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { useAuthStore } from "@/stores/authStore";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, InputOTP, Label } from "@/components/ui";

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return "";
};

export type UserRole = "customer" | "supplier" | "kitchen";

interface MobileOtpLoginProps {
  role?: UserRole;
}

const roleMeta: Record<UserRole, { title: string; description: string; button: string }> = {
  customer: {
    title: "Customer login",
    description: "Use your mobile number to order meals for tomorrow.",
    button: "Continue as customer",
  },
  supplier: {
    title: "Supplier login",
    description: "Login with OTP to view supplier assignments and update status.",
    button: "Continue as supplier",
  },
  kitchen: {
    title: "Kitchen partner login",
    description: "Verify your mobile number and manage tomorrow's kitchen menu.",
    button: "Continue as kitchen partner",
  },
};

export default function MobileOtpLogin({ role = "customer" }: MobileOtpLoginProps) {
  const setRole = useAuthStore((state) => state.setRole);
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
        <CardTitle>{roleMeta[role].title}</CardTitle>
        <CardDescription>{roleMeta[role].description}</CardDescription>
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
              {step === "phone" ? roleMeta[role].button : "Verify OTP"}
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
      <CardFooter className="flex flex-col gap-3 px-6 py-6">
        <p className="text-sm text-muted-foreground">
          First-time sign-ins are created automatically with your mobile number.
        </p>
      </CardFooter>
    </Card>
  );
}
