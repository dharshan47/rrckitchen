"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { useSession } from "@/lib/auth-client";
import { Button, Input, Label, Card } from "@/components/ui";
import { Copy, Download, Check, ShieldCheck, ArrowRight } from "lucide-react";

const verifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function AdminTwoFactorSetupPage() {
  const { data: session, isPending } = useSession();
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user?.twoFactorEnabled && !backupCodes) {
      window.location.href = "/admin";
    }
  }, [session, isPending, backupCodes]);

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  const enable = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to enable 2FA");
      }
      return res.json();
    },
    onSuccess: (res) => {
      if (res?.totpURI) setTotpURI(res.totpURI);
    },
  });

  useEffect(() => {
    if (!isPending && session?.user && !session.user.twoFactorEnabled && !enable.isSuccess && !enable.isPending) {
      enable.mutate();
    }
  }, [session, isPending, enable]);

  const verify = useMutation({
    mutationFn: async (data: VerifyForm) => {
      const res = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: data.code, trustDevice: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Verification failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      const res = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-backup-codes", password: "" }),
      });
      if (res.ok) {
        const data = await res.json();
        setBackupCodes(data.backupCodes);
      }
    },
    onError: (err) => {
      verifyForm.setError("root", { message: err.message || "Verification failed" });
    },
  });

  const copyCodes = async () => {
    if (!backupCodes) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
  };

  const downloadCodes = () => {
    if (!backupCodes) return;
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rrckitchen-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isPending || enable.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Set up Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">Generating your TOTP secret...</p>
        </Card>
      </div>
    );
  }

  if (enable.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold mb-4 text-destructive">Failed to enable 2FA</h1>
          <p className="text-sm text-muted-foreground mb-4">{enable.error?.message}</p>
          <Button className="w-full" onClick={() => enable.mutate()}>Try again</Button>
        </Card>
      </div>
    );
  }

  if (backupCodes) {
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
            <Button variant="outline" className="flex-1" onClick={copyCodes}>
              {codesCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {codesCopied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={downloadCodes}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-4">
            Backup codes are case-sensitive. Each code can only be used once.
            <br />
            You can generate new codes later from your profile settings.
          </p>

          <Button className="w-full" onClick={() => { window.location.href = "/admin"; }}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (totpURI) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <h1 className="text-xl font-bold mb-4 text-center">Scan this QR code</h1>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Open your authenticator app and scan this QR code to set up TOTP.
          </p>
          <div className="bg-white p-4 inline-block rounded-lg mx-auto">
            <QRCode value={totpURI} />
          </div>
          <form
            onSubmit={verifyForm.handleSubmit((data) => verify.mutate(data))}
            className="mt-6 grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="verifyCode">Enter the 6-digit code from your app</Label>
              <Input
                id="verifyCode"
                maxLength={6}
                disabled={verify.isPending}
                {...verifyForm.register("code")}
              />
              {verifyForm.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {verifyForm.formState.errors.code.message}
                </p>
              )}
            </div>
            {verifyForm.formState.errors.root?.message && (
              <p className="text-sm text-destructive">
                {verifyForm.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={verify.isPending}>
              {verify.isPending ? "Verifying..." : "Verify & Enable"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return null;
}
