"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Lock, ShieldCheck, ArrowLeft, User, EyeOff, Eye, ArrowRight, Smartphone, Calendar, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className={`w-full shadow-sm border-slate-100 rounded-xl overflow-hidden transition-all duration-300 ${step === 'verify' ? 'max-w-4xl' : 'max-w-[440px]'}`}>
        <CardContent className="p-0">
          {step === "credentials" && (
            <div className="p-8 flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full border border-green-200 bg-green-50 flex items-center justify-center">
                  <User className="h-7 w-7 text-green-700" strokeWidth={2} />
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back!</h1>
                <p className="text-[15px] text-slate-500 mt-2">Sign in to your admin account</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-900">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@rrckitchen.com"
                      className="pl-11 h-12 rounded-lg border-slate-200 bg-white text-slate-900 focus-visible:ring-[#10b981]"
                      disabled={isProcessing}
                      {...credentialsForm.register("email")}
                    />
                  </div>
                  {credentialsForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{credentialsForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-900">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="pl-11 pr-11 h-12 rounded-lg border-slate-200 bg-white text-slate-900 font-medium tracking-widest focus-visible:ring-[#10b981]"
                      disabled={isProcessing}
                      {...credentialsForm.register("password")}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <Eye className="h-5 w-5" strokeWidth={1.5} /> : <EyeOff className="h-5 w-5" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {credentialsForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{credentialsForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-1 pb-2">
                  <Checkbox 
                    id="remember" 
                    checked={trustDevice}
                    onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-[#10b981] data-[state=checked]:border-[#10b981] data-[state=checked]:text-white rounded w-5 h-5 flex items-center justify-center"
                  />
                  <label
                    htmlFor="remember"
                    className="text-[15px] font-medium text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>

                {credentialsForm.formState.errors.root?.message && (
                  <p className="text-sm text-destructive text-center font-medium bg-red-50 py-2 rounded-lg">{credentialsForm.formState.errors.root.message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-[52px] bg-[#f97316] hover:bg-[#ea580c] text-white text-[16px] font-bold rounded-lg shadow-sm" 
                  disabled={isProcessing}
                >
                  {signInMutation.isPending ? "Signing in..." : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2.5} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {step === "verify" && (
            <div className="flex flex-col">
              <div className="p-8">
                {/* Header actions */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setAvailableMethods([]);
                    }}
                    className="text-sm font-semibold text-[#10b981] hover:text-[#059669] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                    Back to Sign In
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50/50">
                    <Lock className="h-3.5 w-3.5 text-[#10b981]" strokeWidth={2} />
                    <span className="text-xs font-bold text-[#10b981]">Secure Connection</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] ml-1"></div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="h-[72px] w-[72px] rounded-full border border-green-200 bg-green-50 flex items-center justify-center mb-5">
                    <div className="h-[52px] w-[52px] rounded-full bg-white shadow-sm flex items-center justify-center relative">
                      <ShieldCheck className="h-8 w-8 text-[#10b981]" strokeWidth={1.5} />
                      <div className="absolute inset-0 flex items-center justify-center mt-1">
                         <Lock className="h-3 w-3 text-[#f97316] fill-[#f97316]" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Two-Factor Authentication</h1>
                  <p className="text-[15px] text-slate-500 mt-2">Choose your preferred verification method and enter the code</p>
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
                    className={`flex items-center p-5 rounded-xl border text-left transition-all ${method === "totp" ? "border-[#10b981] bg-green-50/30 ring-1 ring-[#10b981]/10" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center mr-4 shrink-0 bg-white shadow-sm border border-slate-100">
                      <Smartphone className={`h-5 w-5 ${method === "totp" ? "text-[#10b981]" : "text-slate-400"}`} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${method === "totp" ? "text-slate-900" : "text-slate-700"}`}>Authenticator App</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Use code from your app</p>
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
                    className={`flex items-center p-5 rounded-xl border text-left transition-all ${method === "backup" ? "border-[#f97316] bg-orange-50/30 ring-1 ring-[#f97316]/10" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center mr-4 shrink-0 bg-white shadow-sm border border-slate-100">
                      <Calendar className={`h-5 w-5 ${method === "backup" ? "text-[#f97316]" : "text-slate-400"}`} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${method === "backup" ? "text-slate-900" : "text-slate-700"}`}>Backup Code</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Use one of your backup codes</p>
                    </div>
                  </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  {/* OTP Input Area */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center mb-6">
                    <h3 className="text-base font-bold text-slate-900">Enter Verification Code</h3>
                    <p className="text-[13px] text-slate-500 mt-1 mb-6">
                      {method === "totp" ? "Enter the 6-digit code from your authenticator app" : "Enter a 16-character backup code"}
                    </p>
                    
                    {method === "totp" ? (
                      <div className="w-full max-w-sm mx-auto flex justify-center">
                        <InputOTP
                          maxLength={6}
                          render={({ slots }) => (
                            <InputOTPGroup className="gap-2 sm:gap-3 w-full justify-center">
                              {slots.map((slot, index) => (
                                <InputOTPSlot key={index} index={index} {...slot} className="w-12 h-14 sm:w-[52px] sm:h-[60px] text-2xl font-semibold border-slate-200 rounded-xl bg-white shadow-sm" />
                              ))}
                            </InputOTPGroup>
                          )}
                          disabled={isProcessing}
                          value={codeValue}
                          onChange={(v) => { codeForm.setValue("code", v); codeForm.clearErrors("code"); }}
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-md mx-auto">
                        <Input
                          id="code"
                          placeholder="Enter backup code"
                          className="h-14 text-center tracking-widest text-lg font-semibold rounded-xl border-slate-200 bg-white shadow-sm"
                          disabled={isProcessing}
                          {...codeForm.register("code")}
                        />
                      </div>
                    )}

                    {codeForm.formState.errors.code && (
                      <p className="text-xs text-destructive mt-4">{codeForm.formState.errors.code.message}</p>
                    )}
                  </div>

                  {codeForm.formState.errors.root?.message && !codeForm.formState.errors.root.message.includes("TOTP is not enabled") && (
                    <p className="text-sm text-destructive text-center font-medium bg-red-50 py-2 rounded-lg">{codeForm.formState.errors.root.message}</p>
                  )}

                  {totpNotEnabled && (
                    <div className="text-center bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="text-sm text-destructive">
                        TOTP is not enabled. Use a backup code or set up your authenticator app below.
                      </p>
                      <Link
                        href="/admin/2fa-setup"
                        className="text-sm text-[#f97316] font-bold hover:underline mt-2 inline-block"
                      >
                        Set up authenticator app →
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2 pl-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <Checkbox
                      id="trust"
                      checked={trustDevice}
                      onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                      className="border-slate-300 data-[state=checked]:bg-[#10b981] data-[state=checked]:border-[#10b981] data-[state=checked]:text-white rounded w-5 h-5 flex items-center justify-center mt-0.5 shrink-0"
                    />
                    <div className="flex flex-col">
                      <label
                        htmlFor="trust"
                        className="text-[15px] font-bold text-slate-900 leading-none cursor-pointer"
                      >
                        Trust this device for 30 days
                      </label>
                      <p className="text-[13px] text-slate-500 mt-1.5">You won&apos;t be asked for a code again on this device</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-[52px] bg-[#f97316] hover:bg-[#ea580c] text-white text-[16px] font-bold rounded-xl shadow-sm mt-6" 
                    disabled={isProcessing}
                  >
                    <ShieldCheck className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    {isProcessing ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </form>
              </div>
              
              {/* Footer info bar */}
              <div className="bg-[#f8fafc] border-t border-slate-100 p-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-b-xl">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-[#10b981] mt-0.5 shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">Secure & Private</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your data is encrypted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#10b981] mt-0.5 shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">24/7 Protection</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Always monitoring</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#10b981] mt-0.5 shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">Trusted Platform</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Enterprise security</p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end md:text-right">
                  <h4 className="text-[13px] font-bold text-slate-900">Need help?</h4>
                  <Link href="#" className="text-[12px] font-bold text-[#f97316] hover:underline mt-0.5">Contact support team</Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
