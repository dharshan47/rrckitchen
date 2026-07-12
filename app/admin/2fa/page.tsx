"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signIn, twoFactor } from "@/lib/auth-client";
import { Button, Input, Label, Card, CardContent, Checkbox } from "@/components/ui";
import { Mail, Lock, ShieldCheck, LogIn, Key, Copy, HelpCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const codeSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;
type CodeForm = z.infer<typeof codeSchema>;

export default function AdminTwoFactorChallengePage() {
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [method, setMethod] = useState<"totp" | "backup">("backup");
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [trustDevice, setTrustDevice] = useState(true);
  const [totpNotEnabled, setTotpNotEnabled] = useState(false);

  useEffect(() => {
    if (step === "credentials") {
      setTimeout(() => document.getElementById("email")?.focus(), 100);
    } else {
      setTimeout(() => document.getElementById("code")?.focus(), 100);
    }
  }, [step]);

  const credentialsForm = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: CredentialsForm) => {
      const res = await signIn.email({ email: data.email, password: data.password });
      if (res?.error) throw new Error(res.error.message || "Invalid email or password");
      return res.data as Record<string, unknown>;
    },
    onSuccess: (data) => {
      if (data?.twoFactorRedirect) {
        const methods = (data.twoFactorMethods as string[]) || [];
        setAvailableMethods(methods);
        setStep("verify");
        if (!methods.includes("totp")) {
          setMethod("backup");
        }
        return;
      }
      window.location.assign("/admin");
    },
    onError: (err) => {
      credentialsForm.setError("root", { message: err.message });
    },
  });

  const verifyTotpMutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await twoFactor.verifyTotp({ code, trustDevice });
      if (result?.error) {
        const msg = result.error.message || result.error.statusText || "";
        if (msg.toLowerCase().includes("not enabled") || msg.toLowerCase().includes("not set up") || msg.toLowerCase().includes("not enrolled")) {
          setTotpNotEnabled(true);
          setMethod("backup");
          codeForm.setValue("code", "");
          throw new Error("TOTP is not enabled. Use a backup code or set up your authenticator app below.");
        }
        throw new Error(msg || "Verification failed");
      }
    },
    onSuccess: () => window.location.assign("/admin"),
    onError: (err) => {
      const msg = err.message;
      if (!totpNotEnabled) {
        toast.error(msg);
      }
      codeForm.setError("root", { message: msg });
    },
  });

  const verifyBackupMutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await twoFactor.verifyBackupCode({ code, trustDevice });
      if (result?.error) {
        throw new Error(result.error.message || result.error.statusText || "Invalid backup code");
      }
    },
    onSuccess: () => window.location.assign("/admin"),
    onError: (err) => {
      toast.error(err.message);
      codeForm.setError("root", { message: err.message });
    },
  });

  const isProcessing = signInMutation.isPending || verifyTotpMutation.isPending || verifyBackupMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">
              {step === "credentials" ? "Admin Sign In" : "Two-Factor Authentication"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "credentials"
                ? "Enter your email and password"
                : method === "totp"
                  ? "Enter the 6-digit code from your authenticator app"
                  : "Enter one of your backup codes"}
            </p>
          </div>

          {step === "credentials" && (
            <form onSubmit={credentialsForm.handleSubmit((d) => signInMutation.mutate(d))} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@rrckitchen.com"
                    className="pl-9"
                    disabled={isProcessing}
                    {...credentialsForm.register("email")}
                  />
                </div>
                {credentialsForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{credentialsForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-9"
                    disabled={isProcessing}
                    {...credentialsForm.register("password")}
                  />
                </div>
                {credentialsForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{credentialsForm.formState.errors.password.message}</p>
                )}
              </div>

              {credentialsForm.formState.errors.root?.message && (
                <p className="text-sm text-destructive text-center">{credentialsForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isProcessing}>
                <LogIn className="h-4 w-4 mr-2" />
                {signInMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={codeForm.handleSubmit((d) => {
              setTotpNotEnabled(false);
              if (method === "totp") {
                verifyTotpMutation.mutate(d.code);
              } else {
                verifyBackupMutation.mutate(d.code);
              }
            })} className="grid gap-4">
              {availableMethods.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Available methods: {availableMethods.map((m) => m === "totp" ? "Authenticator" : m === "otp" ? "OTP" : m === "backup" ? "Backup Code" : m).join(", ")}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("totp");
                    setTotpNotEnabled(false);
                    codeForm.setValue("code", "");
                    codeForm.clearErrors();
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    method === "totp"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Key className="h-4 w-4 inline mr-1" />
                  Authenticator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("backup");
                    setTotpNotEnabled(false);
                    codeForm.setValue("code", "");
                    codeForm.clearErrors();
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    method === "backup"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Copy className="h-4 w-4 inline mr-1" />
                  Backup Code
                </button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">
                  {method === "totp" ? "Authenticator code" : "Backup code"}
                </Label>
                <div className="relative">
                  {method === "totp" ? (
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Copy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    id="code"
                    maxLength={method === "totp" ? 6 : 16}
                    placeholder={method === "totp" ? "000000" : "Enter backup code"}
                    className="pl-9"
                    disabled={isProcessing}
                    {...codeForm.register("code")}
                  />
                </div>
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>
                )}
              </div>

              {codeForm.formState.errors.root?.message && !codeForm.formState.errors.root.message.includes("TOTP is not enabled") && (
                <p className="text-sm text-destructive text-center">{codeForm.formState.errors.root.message}</p>
              )}

              {totpNotEnabled && (
                <>
                  <p className="text-sm text-destructive text-center">
                    TOTP is not enabled. Use a backup code or set up your authenticator app below.
                  </p>
                  <Link
                    href="/admin/2fa-setup"
                    className="text-sm text-primary font-medium hover:underline text-center block"
                  >
                    Set up authenticator app →
                  </Link>
                </>
              )}

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={trustDevice}
                  onCheckedChange={(v) => setTrustDevice(v === true)}
                />
                Trust this device for 30 days
              </label>

              <Button type="submit" className="w-full" disabled={isProcessing}>
                <LogIn className="h-4 w-4 mr-2" />
                {isProcessing
                  ? "Verifying..."
                  : method === "totp"
                    ? "Verify"
                    : "Verify Backup Code"}
              </Button>

              {method === "backup" && !totpNotEnabled && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  <HelpCircle className="h-3 w-3 inline mr-1" />
                  Backup codes are case-sensitive. Each code can only be used once.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setAvailableMethods([]);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
