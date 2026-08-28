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

  useEffect(() => {
    if (!isPending && session?.user?.twoFactorEnabled && step !== "codes") {
      window.location.assign("/admin");
    }
  }, [session, isPending, step]);

  // On a fresh page load the setup flow starts at the password step. If the
  // store is somehow still on "verify" without a TOTP URI (no mutation data),
  // fall back to "password" so the form always renders.
  const activeStep =
    step === "verify" && !enableMutation.data?.totpURI ? "password" : step;

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleEnable = passwordForm.handleSubmit((d) => {
    enableMutation.mutateAsync(d.password).catch((err) => {
      passwordForm.setError("root", { message: err.message });
    });
  });

  const handleVerify = verifyForm.handleSubmit((d) => {
    verifyMutation.mutateAsync(d.code).catch((err) => {
      verifyForm.setError("root", { message: err.message });
    });
  });

  if (isPending || enableMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex items-center justify-center p-4">
        <div className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 border border-[#F0F0F0] text-center animate-pulse">
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
        <div className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 border border-[#F0F0F0] text-center">
          <h1 className="text-xl font-bold mb-4 text-destructive">Failed to enable 2FA</h1>
          <p className="text-sm text-muted-foreground mb-4">{enableMutation.error?.message}</p>
          <Button className="w-full bg-[#FD4F03] hover:bg-[#E94700] rounded-xl h-14 shadow-[0_4px_14px_rgba(253,79,3,0.3)]" onClick={() => passwordForm.handleSubmit((d) => enableMutation.mutate(d.password))()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 border border-[#F0F0F0] relative overflow-hidden">
        
        {/* Top Icon */}
        <div className="mx-auto w-[100px] h-[100px] bg-[#F7FCF8] rounded-full flex items-center justify-center mb-6 border-[2px] border-[#EEF9F1] shadow-sm relative before:absolute before:inset-[6px] before:rounded-full before:border before:border-[#E8F6ED] before:bg-transparent">
          <div className="w-[52px] h-[52px] bg-[#22C55E] rounded-full flex items-center justify-center relative z-10">
            <Lock className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111111] text-center mb-2 tracking-tight">Set Up Two-Factor Authentication</h1>
        <p className="text-[#666666] text-sm sm:text-[15px] text-center leading-relaxed px-2 mb-8">
          Secure your admin account using an authenticator app.
        </p>

        {/* Stepper */}
        <div className="relative flex justify-between items-center max-w-[340px] mx-auto mb-8">
          {/* Progress Component */}
          <Progress 
            value={activeStep === 'password' ? 0 : activeStep === 'verify' ? 50 : 100}
            className="absolute top-4 sm:top-[18px] left-0 right-0 h-[2px] -z-10 bg-[#E8E8E8] [&>div]:bg-[#FD4F03] [&>div]:transition-all [&>div]:duration-500" 
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 z-10 bg-white px-3">
            <div className={cn("w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center text-[15px] font-bold transition-colors", 
              activeStep === 'verify' || activeStep === 'codes' ? "bg-[#FD4F03] text-white shadow-sm shadow-orange-200" : "bg-[#FD4F03] text-white")}>
              1
            </div>
            <span className={cn("text-[12px] sm:text-[13px] font-bold text-[#111111] whitespace-nowrap")}>Scan QR Code</span>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 z-10 bg-white px-3">
            <div className={cn("w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center text-[15px] font-medium transition-colors border", 
              activeStep === 'codes' ? "bg-[#FD4F03] border-[#FD4F03] text-white" : "bg-white border-[#E8E8E8] text-[#777777]")}>
              2
            </div>
            <span className={cn("text-[12px] sm:text-[13px] font-medium whitespace-nowrap", activeStep === 'codes' ? "text-[#111111]" : "text-[#777777]")}>Verify Code</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 z-10 bg-white px-3">
            <div className={cn("w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center text-[15px] font-medium transition-colors border", 
              activeStep === 'codes' ? "bg-[#FD4F03] border-[#FD4F03] text-white" : "bg-white border-[#E8E8E8] text-[#777777]")}>
              3
            </div>
            <span className={cn("text-[12px] sm:text-[13px] font-medium whitespace-nowrap", activeStep === 'codes' ? "text-[#111111]" : "text-[#777777]")}>Backup Codes</span>
          </div>
        </div>

        {/* Content Area wrapped in green border */}
        <div className="bg-[#F9FCFA] border border-[#E6F4EA] rounded-[24px] p-5 sm:p-7 relative overflow-hidden">
          
          {activeStep === "verify" && enableMutation.data?.totpURI && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              
              <div className="bg-white border border-[#E8E8E8] rounded-[16px] w-[180px] p-5 mx-auto flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-5">
                <div className="w-[140px] h-[140px]">
                  <QRCode value={enableMutation.data.totpURI} className="w-full h-full" />
                </div>
                <span className="text-[13px] font-semibold text-[#333333] mt-4">QR Code</span>
              </div>

              <div className="bg-[#F4FAF6] border border-[#22C55E] rounded-[12px] p-4 flex items-center gap-3 mb-6">
                <div className="w-[28px] h-[28px] shrink-0 rounded-full border border-[#22C55E] flex items-center justify-center">
                  <Info className="w-[14px] h-[14px] text-[#22C55E]" strokeWidth={2.5} />
                </div>
                <p className="text-[13px] text-[#111111] leading-relaxed">
                  Open Google Authenticator, Microsoft Authenticator, or Authy and scan the QR code.
                </p>
              </div>

              <form onSubmit={handleVerify}>
                <Label className="block text-[14px] font-semibold text-[#111111] mb-3">Enter 6-digit verification code</Label>
                
                <div className="mb-6">
                  <Controller
                    control={verifyForm.control}
                    name="code"
                    render={({ field }) => (
                      <OtpInputBoxes
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={verifyMutation.isPending}
                        className="justify-between sm:justify-between sm:gap-2 [&>input]:flex-1 [&>input]:max-w-[60px] [&>input]:h-[56px] [&>input]:rounded-[10px] [&>input]:!border-[1px] [&>input]:!border-[#E8E8E8] [&>input]:bg-white [&>input]:text-[22px] [&>input]:font-semibold [&>input]:text-[#111111] focus:[&>input]:!border-[#FD4F03] focus:[&>input]:!ring-0 focus:[&>input]:outline-none"
                      />
                    )}
                  />
                  {verifyForm.formState.errors.code && (
                    <p className="text-xs text-destructive mt-2 font-medium">{verifyForm.formState.errors.code.message}</p>
                  )}
                  {verifyForm.formState.errors.root?.message && (
                    <p className="text-sm text-destructive mt-2 font-medium">{verifyForm.formState.errors.root.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-[17px] font-semibold bg-[#FD4F03] hover:bg-[#E94700] rounded-xl shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all" 
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
                  {!verifyMutation.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>

                {/* Footer Security Text inside Verify box */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[#777777]">
                  <ShieldCheck className="w-[14px] h-[14px] text-[#777777]" strokeWidth={2} />
                  <span>Your account will be protected with two-factor authentication.</span>
                </div>
              </form>
            </div>
          )}

          {activeStep === "password" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-[20px] font-bold text-[#111111]">Confirm Your Password</h2>
                <p className="text-[14px] text-[#666666] mt-2">
                  Enter your admin password to enable two-factor authentication.
                </p>
              </div>

              <form onSubmit={handleEnable} className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="enablePassword" className="text-[14px] font-semibold text-[#111111] block mb-1">Password</Label>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[38px] h-[38px] bg-[#F4FAF6] rounded-md flex items-center justify-center border border-[#E6F4EA]">
                      <Lock className="h-[20px] w-[20px] text-[#22C55E]" strokeWidth={1.5} />
                    </div>
                    <Input
                      id="enablePassword"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-[54px] h-[52px] rounded-[8px] bg-white border-[#E8E8E8] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E] text-[15px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] text-[#333333] placeholder:text-[#999999]"
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
                  className="w-full h-14 text-[17px] font-semibold bg-[#FD4F03] hover:bg-[#E94700] rounded-xl shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all" 
                  disabled={enableMutation.isPending}
                >
                  {enableMutation.isPending ? "Enabling..." : "Enable Two-Factor Authentication"}
                  {!enableMutation.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
                
                <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[#777777]">
                  <ShieldCheck className="w-[14px] h-[14px] text-[#777777]" strokeWidth={2} />
                  <span>Your account will be protected with two-factor authentication.</span>
                </div>
              </form>
            </div>
          )}

          {activeStep === "codes" && backupCodes && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-6">
                <div className="bg-[#F1F8F3] rounded-full p-3 inline-flex mb-3">
                  <Check className="h-8 w-8 text-[#22C55E]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[20px] font-bold text-[#111111]">2FA Enabled Successfully</h2>
                <p className="text-[14px] text-[#666666] mt-2">
                  Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
                </p>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 mb-6 shadow-sm">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 font-mono text-[14px]">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 bg-[#F9F9F9] px-3 py-2.5 rounded-lg border border-[#F0F0F0]">
                      <span className="text-[#999999] w-4 sm:w-5 text-right font-sans text-xs">{i + 1}.</span>
                      <span className="tracking-widest text-[#111111] font-bold">{code.match(/.{4}/g)?.join("-") || code}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-[#E8E8E8] bg-white hover:bg-[#F9F9F9] text-[#111111] font-semibold" 
                  onClick={async () => {
                    if (!backupCodes) return;
                    await navigator.clipboard.writeText(backupCodes.join("\\n"));
                    setCodesCopied(true);
                    setTimeout(() => setCodesCopied(false), 2000);
                  }}
                >
                  {codesCopied ? <Check className="h-4 w-4 mr-2 text-[#22C55E]" /> : <Copy className="h-4 w-4 mr-2" />}
                  {codesCopied ? "Copied!" : "Copy Codes"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-[#E8E8E8] bg-white hover:bg-[#F9F9F9] text-[#111111] font-semibold" 
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
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button 
                className="w-full h-14 text-[17px] font-semibold bg-[#FD4F03] hover:bg-[#E94700] rounded-xl shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all" 
                onClick={() => { window.location.assign("/admin"); }}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[#777777]">
                <ShieldCheck className="w-[14px] h-[14px] text-[#777777]" strokeWidth={2} />
                <span>Your account is now protected with two-factor authentication.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
