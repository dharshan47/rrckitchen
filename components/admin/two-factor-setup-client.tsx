"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInputBoxes } from "@/components/ui/otp-input-boxes";
import { Progress } from "@/components/ui/progress";
import { Copy, Download, Check, ShieldCheck, ArrowRight, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminTwoFactorSetupStep,
  useAdminTwoFactorSetupBackupCodes,
  useAdminEnableTwoFactorMutation,
  useAdminVerifyTotpCodeMutation,
  useAdminGenerateBackupCodesMutation,
} from "@/stores";

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
  const [codesCopied, setCodesCopied] = useState(false);
  const step = useAdminTwoFactorSetupStep();
  const backupCodes = useAdminTwoFactorSetupBackupCodes();

  const enableMutation = useAdminEnableTwoFactorMutation();

  const verifyMutation = useAdminVerifyTotpCodeMutation();

  const generateCodesMutation = useAdminGenerateBackupCodesMutation();

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

  const handleVerify = verifyForm.handleSubmit((d) => {
    verifyMutation.mutateAsync(d.code).catch((err) => {
      verifyForm.setError("root", { message: err.message });
    });
  });

  const handleGenerateCodes = passwordForm.handleSubmit((d) => {
    generateCodesMutation.mutateAsync(d.password).catch((err) => {
      passwordForm.setError("root", { message: err.message });
    });
  });

  if (isPending || enableMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center animate-pulse">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (enableMutation.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center">
          <h1 className="text-xl font-bold mb-4 text-destructive">Failed to enable 2FA</h1>
          <p className="text-sm text-muted-foreground mb-4">{enableMutation.error?.message}</p>
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => enableMutation.mutate()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl p-6 sm:p-12 relative overflow-hidden">
        {/* Top Icon */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 text-gray-900 tracking-tight">Set Up Two-Factor Authentication</h1>
        <p className="text-gray-500 text-center mb-10 text-sm sm:text-base">Secure your admin account using an authenticator app.</p>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 relative max-w-md mx-auto">
          <Progress 
            value={step === "verify" ? 0 : step === "password" ? 50 : 100}
            className="absolute top-4 left-4 h-[2px] w-[calc(100%-2rem)] -z-10 bg-gray-200 [&>div]:bg-orange-500" 
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 bg-white px-2 sm:px-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
              "bg-orange-500 text-white shadow-md shadow-orange-200"
            )}>
              1
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-medium transition-colors duration-300",
              "text-gray-900"
            )}>
              Scan QR Code
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 bg-white px-2 sm:px-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
              step === "password" || step === "codes" ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-gray-100 text-gray-500"
            )}>
              2
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-medium transition-colors duration-300",
              step === "password" || step === "codes" ? "text-gray-900" : "text-gray-400"
            )}>
              Verify Code
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 bg-white px-2 sm:px-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
              step === "codes" ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-gray-100 text-gray-500"
            )}>
              3
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-medium transition-colors duration-300",
              step === "codes" ? "text-gray-900" : "text-gray-400"
            )}>
              Backup Codes
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-[#f4faf6] border border-green-100 rounded-3xl p-5 sm:p-8">
          
          {step === "verify" && enableMutation.data?.totpURI && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl p-4 w-40 h-40 sm:w-48 sm:h-48 mx-auto flex flex-col items-center justify-center shadow-sm border border-gray-100 mb-6">
                <QRCode value={enableMutation.data.totpURI} className="w-full h-full" />
                <span className="text-xs sm:text-sm font-medium text-gray-500 mt-2">QR Code</span>
              </div>

              <div className="bg-[#eaf5ec] border border-green-200/60 rounded-xl p-4 flex items-start gap-3 mb-8">
                <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Open Google Authenticator, Microsoft Authenticator, or Authy and scan the QR code.
                </p>
              </div>

              <form onSubmit={handleVerify}>
                <Label className="block text-sm font-bold text-gray-900 mb-4">Enter 6-digit verification code</Label>
                
                <div className="mb-8">
                  <Controller
                    control={verifyForm.control}
                    name="code"
                    render={({ field }) => (
                      <OtpInputBoxes
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={verifyMutation.isPending}
                        className="justify-between sm:justify-center sm:gap-4"
                      />
                    )}
                  />
                  {verifyForm.formState.errors.code && (
                    <p className="text-xs text-destructive mt-2 text-center font-medium">{verifyForm.formState.errors.code.message}</p>
                  )}
                  {verifyForm.formState.errors.root?.message && (
                    <p className="text-sm text-destructive mt-2 text-center font-medium">{verifyForm.formState.errors.root.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-base font-semibold bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]" 
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
                  {!verifyMutation.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </form>
            </div>
          )}

          {step === "password" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Confirm Password</h2>
                <p className="text-sm text-gray-600 mt-2">
                  To generate backup codes, please confirm your admin password.
                </p>
              </div>

              <form onSubmit={handleGenerateCodes} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="backupPassword" className="text-sm font-bold text-gray-900">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="backupPassword"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-11 h-12 rounded-xl bg-white border-gray-200"
                      {...passwordForm.register("password")}
                    />
                  </div>
                  {passwordForm.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium">{passwordForm.formState.errors.password.message}</p>
                  )}
                  {passwordForm.formState.errors.root?.message && (
                    <p className="text-sm text-destructive font-medium">{passwordForm.formState.errors.root.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-base font-semibold bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]" 
                  disabled={generateCodesMutation.isPending}
                >
                  {generateCodesMutation.isPending ? "Generating..." : "Generate Backup Codes"}
                  {!generateCodesMutation.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </form>
            </div>
          )}

          {step === "codes" && backupCodes && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-6">
                <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900">2FA Enabled Successfully</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 font-mono text-sm sm:text-base">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <span className="text-gray-400 w-4 sm:w-5 text-right font-sans text-xs">{i + 1}.</span>
                      <span className="tracking-widest text-gray-900 font-semibold">{code.match(/.{4}/g)?.join("-") || code}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold" 
                  onClick={async () => {
                    if (!backupCodes) return;
                    await navigator.clipboard.writeText(backupCodes.join("\\n"));
                    setCodesCopied(true);
                    setTimeout(() => setCodesCopied(false), 2000);
                  }}
                >
                  {codesCopied ? <Check className="h-5 w-5 mr-2 text-green-600" /> : <Copy className="h-5 w-5 mr-2" />}
                  {codesCopied ? "Copied!" : "Copy Codes"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold" 
                  onClick={() => {
                    if (!backupCodes) return;
                    const blob = new Blob([backupCodes.join("\\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "rrckitchen-backup-codes.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </Button>
              </div>

              <Button 
                className="w-full h-12 sm:h-14 text-base font-semibold bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]" 
                onClick={() => { window.location.assign("/admin"); }}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

        </div>

        {/* Footer Security Text */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <span>Your account will be protected with two-factor authentication.</span>
        </div>
      </div>
    </div>
  );
}
