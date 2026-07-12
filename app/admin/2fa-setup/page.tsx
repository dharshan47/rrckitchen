"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { useSession, twoFactor } from "@/lib/auth-client";
import { Button, Input, Label, Card } from "@/components/ui";
import { Copy, Download, Check, ShieldCheck, ArrowRight, Lock, Key } from "lucide-react";

const verifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type VerifyForm = z.infer<typeof verifySchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminTwoFactorSetupPage() {
  const { data: session, isPending } = useSession();
  const [step, setStep] = useState<"verify" | "password" | "codes">("verify");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  const enableMutation = useMutation({
    mutationFn: async () => {
      const res = await twoFactor.enable({});
      if (res?.error) throw new Error(res.error.message || "Failed to enable 2FA");
      return res.data as { totpURI?: string } | undefined;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyForm) => {
      const res = await twoFactor.verifyTotp({ code: data.code });
      if (res?.error) throw new Error(res.error.message || "Verification failed");
    },
    onSuccess: () => setStep("password"),
    onError: (err) => verifyForm.setError("root", { message: err.message }),
  });

  const generateCodesMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const res = await twoFactor.generateBackupCodes({ password: data.password });
      if (res?.error) throw new Error(res.error.message || "Failed to generate backup codes");
      return res.data as { backupCodes?: string[] } | undefined;
    },
    onSuccess: (data) => {
      if (data?.backupCodes) setBackupCodes(data.backupCodes);
      setStep("codes");
    },
    onError: (err) => passwordForm.setError("root", { message: err.message }),
  });

  useEffect(() => {
    if (!isPending && session?.user?.twoFactorEnabled && step === "verify") {
      window.location.assign("/admin");
    }
  }, [session, isPending, step]);

  const shouldEnable = !isPending && session?.user && !session.user.twoFactorEnabled && !enableMutation.isSuccess && !enableMutation.isPending && !enableMutation.isError;

  useEffect(() => {
    if (shouldEnable) {
      enableMutation.mutate();
    }
  }, [shouldEnable]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  if (isPending || enableMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Set up Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">Generating your TOTP secret...</p>
        </Card>
      </div>
    );
  }

  if (enableMutation.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold mb-4 text-destructive">Failed to enable 2FA</h1>
          <p className="text-sm text-muted-foreground mb-4">{enableMutation.error?.message}</p>
          <Button className="w-full" onClick={() => enableMutation.mutate()}>Try again</Button>
        </Card>
      </div>
    );
  }

  if (step === "codes" && backupCodes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <ShieldCheck className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <h1 className="text-xl font-bold">2FA Enabled Successfully</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="tracking-wider">{code.match(/.{4}/g)?.join("-") || code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1" onClick={async () => {
              if (!backupCodes) return;
              await navigator.clipboard.writeText(backupCodes.join("\n"));
              setCodesCopied(true);
              setTimeout(() => setCodesCopied(false), 2000);
            }}>
              {codesCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {codesCopied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => {
              if (!backupCodes) return;
              const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rrckitchen-backup-codes.txt";
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-4">
            Backup codes are case-sensitive. Each code can only be used once.
            <br />
            You can generate new codes later from your profile settings.
          </p>

          <Button className="w-full" onClick={() => { window.location.assign("/admin"); }}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">Generate Backup Codes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              2FA is enabled. Now enter your password to generate backup codes for account recovery.
            </p>
          </div>

          <form onSubmit={passwordForm.handleSubmit((d) => generateCodesMutation.mutate(d))} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="backupPassword">Confirm your password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="backupPassword"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  {...passwordForm.register("password")}
                />
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>

            {passwordForm.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={generateCodesMutation.isPending}>
              {generateCodesMutation.isPending ? "Generating..." : "Generate Backup Codes"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (enableMutation.data?.totpURI) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <h1 className="text-xl font-bold mb-4 text-center">Scan this QR code</h1>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Open your authenticator app and scan this QR code to set up TOTP.
          </p>
          <div className="bg-white p-4 inline-block rounded-lg mx-auto">
            <QRCode value={enableMutation.data.totpURI} />
          </div>
          <form onSubmit={verifyForm.handleSubmit((d) => verifyMutation.mutate(d))} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="verifyCode" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Enter the 6-digit code from your app
              </Label>
              <Input
                id="verifyCode"
                maxLength={6}
                placeholder="000000"
                disabled={verifyMutation.isPending}
                {...verifyForm.register("code")}
              />
              {verifyForm.formState.errors.code && (
                <p className="text-xs text-destructive">{verifyForm.formState.errors.code.message}</p>
              )}
            </div>
            {verifyForm.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{verifyForm.formState.errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return null;
}
