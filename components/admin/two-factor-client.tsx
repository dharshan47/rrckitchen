"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpInputBoxes } from "@/components/ui/otp-input-boxes";
import { Mail, Lock, ShieldCheck, ArrowLeft, User, EyeOff, Eye, Smartphone, Calendar, Clock, LogIn } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  useAdminTwoFactorStep,
  useAdminTwoFactorMethod,
  useAdminTwoFactorTrustDevice,
  useAdminTwoFactorTotpNotEnabled,
  useAdminTwoFactorActions,
  useAdminSignInMutation,
  useAdminVerifyTotpMutation,
  useAdminVerifyBackupMutation,
} from "@/stores";

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
  const [showPassword, setShowPassword] = useState(false);
  const step = useAdminTwoFactorStep();
  const method = useAdminTwoFactorMethod();
  const trustDevice = useAdminTwoFactorTrustDevice();
  const totpNotEnabled = useAdminTwoFactorTotpNotEnabled();
  const { setStep, setMethod, setAvailableMethods, setTrustDevice, setTotpNotEnabled } =
    useAdminTwoFactorActions();

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

  const codeValue = useWatch({ control: codeForm.control, name: "code" });

  const signInMutation = useAdminSignInMutation();

  const verifyTotpMutation = useAdminVerifyTotpMutation();

  const verifyBackupMutation = useAdminVerifyBackupMutation();

  const handleSignIn = credentialsForm.handleSubmit((d) => {
    signInMutation.mutateAsync(d).catch((err) => {
      credentialsForm.setError("root", { message: err.message });
    });
  });

  const handleVerify = codeForm.handleSubmit((d) => {
    if (method === "totp") {
      verifyTotpMutation
        .mutateAsync({ code: d.code, trustDevice })
        .catch((err) => {
          const msg = err.message;
          if (msg.includes("TOTP is not enabled")) {
            codeForm.setValue("code", "");
          }
          if (!totpNotEnabled) {
            toast.error(msg);
          }
          codeForm.setError("root", { message: msg });
        });
    } else {
      verifyBackupMutation
        .mutateAsync({ code: d.code, trustDevice })
        .catch((err) => {
          toast.error(err.message);
          codeForm.setError("root", { message: err.message });
        });
    }
  });

  const isProcessing = signInMutation.isPending || verifyTotpMutation.isPending || verifyBackupMutation.isPending;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
      <div className={`w-full bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 border border-[#F0F0F0] ${step === 'verify' ? 'max-w-[700px]' : 'max-w-[480px]'}`}>
        <div className="p-0">
          {step === "credentials" && (
            <div className="p-8 sm:p-10 flex flex-col">
              <div className="flex justify-center mb-5">
                <div className="h-[80px] w-[80px] rounded-full border border-[#E6F4EA] bg-[#F7FCF8] flex items-center justify-center shadow-sm">
                  <User className="h-[34px] w-[34px] text-[#006F3D]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-center mb-10">
                <h1 className="text-[32px] font-bold text-[#111111] tracking-tight mb-2">Welcome Back!</h1>
                <p className="text-[16px] text-[#666666]">Sign in to your admin account</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[14px] font-semibold text-[#111111] block mb-2">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[22px] w-[22px] text-[#777777]" strokeWidth={1.5} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@rrckitchen.com"
                      className="pl-[46px] h-[52px] rounded-[12px] border-[#E8E8E8] bg-white text-[#111111] text-[15px] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]"
                      disabled={isProcessing}
                      {...credentialsForm.register("email")}
                    />
                  </div>
                  {credentialsForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{credentialsForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[14px] font-semibold text-[#111111] block mb-2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[22px] w-[22px] text-[#777777]" strokeWidth={1.5} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="pl-[46px] pr-12 h-[52px] rounded-[12px] border-[#E8E8E8] bg-white text-[#111111] font-medium tracking-widest text-[18px] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]"
                      disabled={isProcessing}
                      {...credentialsForm.register("password")}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#333333] focus:outline-none transition-colors"
                    >
                      {showPassword ? <Eye className="h-[22px] w-[22px]" strokeWidth={1.5} /> : <EyeOff className="h-[22px] w-[22px]" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {credentialsForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{credentialsForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-2 pb-2">
                  <Checkbox 
                    id="remember" 
                    checked={trustDevice}
                    onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                    className="border-[#006F3D] data-[state=checked]:bg-[#006F3D] data-[state=checked]:border-[#006F3D] data-[state=checked]:text-white rounded w-6 h-6 flex items-center justify-center shrink-0"
                  />
                  <label
                    htmlFor="remember"
                    className="text-[15px] font-medium text-[#333333] cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>

                {credentialsForm.formState.errors.root?.message && (
                  <p className="text-sm text-destructive text-center font-medium bg-red-50 py-3 rounded-xl">{credentialsForm.formState.errors.root.message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-[56px] bg-[#FD4F03] hover:bg-[#E94700] text-white text-[17px] font-semibold rounded-[12px] shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all flex items-center justify-center gap-2 mt-4" 
                  disabled={isProcessing}
                >
                  {signInMutation.isPending ? "Signing in..." : (
                    <>
                      Sign In <LogIn className="h-[22px] w-[22px]" strokeWidth={2} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {step === "verify" && (
            <div className="flex flex-col">
              <div className="p-8 sm:p-10">
                {/* Header actions */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setAvailableMethods([]);
                    }}
                    className="text-sm font-semibold text-[#006F3D] hover:text-[#00522B] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                    Back to Sign In
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6F4EA] bg-[#F7FCF8]">
                    <Lock className="h-3.5 w-3.5 text-[#22C55E]" strokeWidth={2} />
                    <span className="text-[11px] font-bold text-[#006F3D]">Secure Connection</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E] ml-1"></div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="h-[80px] w-[80px] rounded-full border border-[#E6F4EA] bg-[#F7FCF8] flex items-center justify-center mb-5 relative before:absolute before:inset-1.5 before:rounded-full before:border before:border-[#E6F4EA] before:bg-transparent">
                    <div className="h-[52px] w-[52px] rounded-full bg-[#22C55E] shadow-sm flex items-center justify-center relative z-10">
                      <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111111] tracking-tight mb-2">Two-Factor Authentication</h1>
                  <p className="text-[15px] text-[#666666] text-center max-w-md mx-auto">Choose your preferred verification method and enter the code</p>
                </div>

                {/* Method Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button 
                    type="button"
                    onClick={() => {
                      setMethod("totp");
                      codeForm.setValue("code", "");
                      codeForm.clearErrors();
                    }}
                    className={`flex items-center p-5 rounded-[16px] border text-left transition-all ${method === "totp" ? "border-[#22C55E] bg-[#F4FAF6] ring-1 ring-[#22C55E]/20" : "border-[#E8E8E8] hover:border-[#CCCCCC] bg-white"}`}
                  >
                    <div className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center mr-4 shrink-0 bg-white shadow-sm border border-[#E8E8E8]">
                      <Smartphone className={`h-5 w-5 ${method === "totp" ? "text-[#22C55E]" : "text-[#777777]"}`} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`text-[15px] font-bold ${method === "totp" ? "text-[#111111]" : "text-[#333333]"}`}>Authenticator App</h3>
                      <p className="text-[12px] text-[#777777] mt-0.5">Use code from your app</p>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setMethod("backup");
                      setTotpNotEnabled(false);
                      codeForm.setValue("code", "");
                      codeForm.clearErrors();
                    }}
                    className={`flex items-center p-5 rounded-[16px] border text-left transition-all ${method === "backup" ? "border-[#FD4F03] bg-orange-50/50 ring-1 ring-[#FD4F03]/20" : "border-[#E8E8E8] hover:border-[#CCCCCC] bg-white"}`}
                  >
                    <div className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center mr-4 shrink-0 bg-white shadow-sm border border-[#E8E8E8]">
                      <Calendar className={`h-5 w-5 ${method === "backup" ? "text-[#FD4F03]" : "text-[#777777]"}`} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`text-[15px] font-bold ${method === "backup" ? "text-[#111111]" : "text-[#333333]"}`}>Backup Code</h3>
                      <p className="text-[12px] text-[#777777] mt-0.5">Use one of your backup codes</p>
                    </div>
                  </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  {/* OTP Input Area */}
                  <div className="bg-[#F9FCFA] border border-[#E6F4EA] rounded-[24px] p-6 sm:p-8 flex flex-col items-center mb-6">
                    <h3 className="text-[16px] font-bold text-[#111111] mb-2">Enter Verification Code</h3>
                    <p className="text-[14px] text-[#666666] mb-6 text-center">
                      {method === "totp" ? "Enter the 6-digit code from your authenticator app" : "Enter a 10-character backup code (format XXXXX-XXXXX)"}
                    </p>
                    
                    {method === "totp" ? (
                      <div id="code" tabIndex={-1} className="w-full max-w-[360px] mx-auto flex justify-center">
                        <OtpInputBoxes
                          value={codeValue}
                          onChange={(v) => { codeForm.setValue("code", v); codeForm.clearErrors("code"); }}
                          disabled={isProcessing}
                          className="justify-between sm:justify-between sm:gap-2 [&>input]:flex-1 [&>input]:max-w-[60px] [&>input]:h-[52px] sm:[&>input]:h-[60px] [&>input]:rounded-[12px] [&>input]:!border-[1px] [&>input]:!border-[#E8E8E8] [&>input]:bg-white [&>input]:text-[24px] [&>input]:font-bold [&>input]:text-[#111111] [&>input]:shadow-[0_2px_4px_rgba(0,0,0,0.01)] focus:[&>input]:!border-[#22C55E] focus:[&>input]:!ring-0 focus:[&>input]:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-[400px] mx-auto">
                        <Input
                          id="code"
                          placeholder="XXXXX-XXXXX"
                          maxLength={11}
                          className="h-[60px] text-center tracking-widest text-[20px] font-semibold rounded-[12px] border-[#E8E8E8] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)] focus-visible:ring-[#FD4F03] uppercase"
                          disabled={isProcessing}
                          {...codeForm.register("code")}
                        />
                      </div>
                    )}

                    {codeForm.formState.errors.code && (
                      <p className="text-[13px] text-destructive mt-4 font-medium">{codeForm.formState.errors.code.message}</p>
                    )}
                  </div>

                  {codeForm.formState.errors.root?.message && !codeForm.formState.errors.root.message.includes("TOTP is not enabled") && (
                    <p className="text-[14px] text-destructive text-center font-medium bg-red-50 py-3 rounded-xl">{codeForm.formState.errors.root.message}</p>
                  )}

                  {totpNotEnabled && (
                    <div className="text-center bg-[#FFF5F5] p-5 rounded-[16px] border border-[#FFEAEA]">
                      <p className="text-[14px] text-destructive">
                        TOTP is not enabled. Use a backup code or set up your authenticator app below.
                      </p>
                      <Link
                        href="/admin/2fa-setup"
                        className="text-[14px] text-[#FD4F03] font-bold hover:underline mt-2 inline-block"
                      >
                        Set up authenticator app →
                      </Link>
                    </div>
                  )}

                  <div className="flex items-start space-x-4 p-5 bg-white rounded-[16px] border border-[#F0F0F0] shadow-sm mb-6">
                    <Checkbox
                      id="trust"
                      checked={trustDevice}
                      onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                      className="border-[#006F3D] data-[state=checked]:bg-[#006F3D] data-[state=checked]:border-[#006F3D] data-[state=checked]:text-white rounded w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col">
                      <label
                        htmlFor="trust"
                        className="text-[15px] font-bold text-[#111111] leading-none cursor-pointer mb-2"
                      >
                        Trust this device for 30 days
                      </label>
                      <p className="text-[13px] text-[#666666]">You won&apos;t be asked for a code again on this device</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-[56px] bg-[#FD4F03] hover:bg-[#E94700] text-white text-[17px] font-semibold rounded-[12px] shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all flex items-center justify-center" 
                    disabled={isProcessing}
                  >
                    <ShieldCheck className="h-[22px] w-[22px] mr-2" strokeWidth={2} />
                    {isProcessing ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </form>
              </div>
              
              {/* Footer info bar */}
              <div className="bg-[#FDFDFD] border-t border-[#F0F0F0] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-b-[32px]">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-[#22C55E] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#111111]">Secure & Private</h4>
                    <p className="text-[11px] text-[#777777] mt-1">Your data is encrypted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#22C55E] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#111111]">24/7 Protection</h4>
                    <p className="text-[11px] text-[#777777] mt-1">Always monitoring</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#22C55E] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#111111]">Trusted Platform</h4>
                    <p className="text-[11px] text-[#777777] mt-1">Enterprise security</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end sm:text-right">
                  <h4 className="text-[13px] font-bold text-[#111111]">Need help?</h4>
                  <Link href="#" className="text-[12px] font-bold text-[#FD4F03] hover:underline mt-1">Contact support</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
