"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Link2Off,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAcceptInviteLoading,
  useAcceptInviteShowPassword,
  useAcceptInviteStatus,
  useAcceptInviteSubmitError,
  useAcceptInviteActions,
  useAcceptInviteMutation,
  useInviteSignOutMutation,
  useInviteValidationQuery,
} from "@/stores";
import type { AdminInviteInvalidReason } from "@/stores";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type InviteForm = z.infer<typeof inviteSchema>;

const INVITE_REASON_TEXT: Record<AdminInviteInvalidReason, string> = {
  not_found: "This invite link is invalid or has already been used.",
  consumed: "This invite has already been used. Please ask the admin to send a new invite.",
  revoked: "This invite has been revoked. Please ask the admin to send a new invite.",
  expired: "This invite link has expired. Please ask the admin to send a new invite.",
};

function AcceptInviteSkeleton() {
  return (
    <div
      data-testid="accept-invite-skeleton"
      className="w-full max-w-[540px] mx-auto bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10 border border-[#F0F0F0] animate-in fade-in-0 duration-300"
    >
      <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
      </div>
      <div className="text-center mb-10 space-y-3">
        <Skeleton className="h-9 w-64 rounded-md mx-auto" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md mx-auto" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md ml-1" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-md ml-1" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="mt-4 px-1">
            <div className="flex justify-between items-center mb-2.5">
              <Skeleton className="h-3 w-32 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <div className="flex gap-2 h-1.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="flex-1 h-full rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-16 sm:h-20 w-full rounded-xl mt-6" />
      </div>
    </div>
  );
}

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, refetch } = useSession();

  const inviteStatus = useAcceptInviteStatus();
  const inviteLoading = useAcceptInviteLoading();
  const showPassword = useAcceptInviteShowPassword();
  const submitError = useAcceptInviteSubmitError();
  const { toggleShowPassword, resetAcceptInviteState } = useAcceptInviteActions();

  useInviteValidationQuery(token);
  const signOutMutation = useInviteSignOutMutation();
  const accept = useAcceptInviteMutation();

  useEffect(() => {
    return () => resetAcceptInviteState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  const passwordValue = useWatch({ control, name: "password" }) || "";

  if (session?.user) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Sign out first</h1>
        <p className="text-sm text-gray-500 mb-6">
          You&apos;re currently signed in as <span className="font-medium text-gray-900">{session.user.email || session.user.phoneNumber}</span>.
          Admin access requires a brand-new account — sign out, then open this invite link again.
        </p>
        <Button
          className="w-full h-14 text-base font-semibold bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200"
          onClick={() =>
            signOutMutation.mutate(undefined, {
              onSuccess: async () => {
                await refetch();
              },
            })
          }
          disabled={signOutMutation.isPending}
        >
          {signOutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    );
  }

  if (inviteLoading) {
    return <AcceptInviteSkeleton />;
  }

  if (inviteStatus && !inviteStatus.valid) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10 border border-[#F0F0F0] text-center animate-in fade-in-0 duration-300">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center shadow-md shadow-red-200">
            <Link2Off className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111111] mb-3 tracking-tight">
          Invite unavailable
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed px-4">
          {INVITE_REASON_TEXT[inviteStatus.reason]}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div className="h-0.5 w-10 bg-red-400 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
          <div className="h-0.5 w-10 bg-red-400 rounded-full"></div>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Contact the administrator who invited you for a new link.
        </p>
      </div>
    );
  }

  const getStrengthLevel = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 5) return 1;
    if (pass.length < 8) return 2;
    if (pass.length < 10) return 3;
    return 4;
  };
  const strengthLevel = getStrengthLevel(passwordValue);

  return (
    <div className="w-full max-w-[540px] mx-auto bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 border border-[#F0F0F0]">
      {/* Top Icon */}
      <div className="mx-auto w-[100px] h-[100px] bg-[#F7FCF8] rounded-full flex items-center justify-center mb-6 border-[2px] border-[#EEF9F1] shadow-sm relative before:absolute before:inset-[6px] before:rounded-full before:border before:border-[#E8F6ED] before:bg-transparent">
        <div className="w-[52px] h-[52px] bg-[#22C55E] rounded-full flex items-center justify-center relative z-10">
          <Lock className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111111] mb-2 tracking-tight">Create Admin Account</h1>
        <p className="text-[#666666] text-sm sm:text-[15px] leading-relaxed px-2">
          Accept your invitation and create your secure<br className="hidden sm:block" />administrator account.
        </p>
        
        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="h-[2px] w-12 bg-[#FD4F03]"></div>
          <div className="h-1.5 w-1.5 bg-[#22C55E] rounded-full"></div>
          <div className="h-[2px] w-12 bg-[#22C55E]"></div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) =>
          accept.mutate(
            { token, email: data.email, password: data.password },
            { onSuccess: () => router.push("/admin/2fa-setup") }
          )
        )}
        className="space-y-5"
      >
        {/* Email Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="invite-email" className="text-sm font-semibold text-[#111111] block mb-1">Email Address</Label>
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[38px] h-[38px] bg-[#F4FAF6] rounded-md flex items-center justify-center border border-[#E6F4EA]">
              <Mail className="h-[20px] w-[20px] text-[#22C55E]" strokeWidth={1.5} />
            </div>
            <Input 
              id="invite-email" 
              type="email" 
              placeholder="Enter your email address"
              className="pl-[54px] h-[52px] rounded-[8px] bg-white border-[#E8E8E8] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E] text-[15px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] text-[#333333] placeholder:text-[#999999]"
              disabled={accept.isPending} 
              {...register("email")} 
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="invite-password" className="text-sm font-semibold text-[#111111] block mb-1">Password</Label>
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[38px] h-[38px] bg-[#F4FAF6] rounded-md flex items-center justify-center border border-[#E6F4EA]">
              <Lock className="h-[20px] w-[20px] text-[#22C55E]" strokeWidth={1.5} />
            </div>
            <Input 
              id="invite-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter a strong password"
              className="pl-[54px] pr-12 h-[52px] rounded-[8px] bg-white border-[#E8E8E8] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E] text-[15px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] text-[#333333] placeholder:text-[#999999]"
              disabled={accept.isPending} 
              {...register("password")} 
            />
            <button 
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#333333] transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>}
          
          {/* Password Strength Indicator */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-medium text-[#777777]">Password strength:</span>
              <span className="text-[13px] font-medium text-[#777777]">Use 8+ characters</span>
            </div>
            <div className="flex gap-1.5 h-[3px]">
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 1 ? "bg-[#FD4F03]" : "bg-[#E8E8E8]")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 2 ? "bg-[#F59E0B]" : "bg-[#E8E8E8]")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 3 ? "bg-[#FACC15]" : "bg-[#E8E8E8]")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 4 ? "bg-[#22C55E]" : "bg-[#E8E8E8]")}></div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#F9FCFA] border border-[#E6F4EA] rounded-[12px] p-4 flex items-start gap-4 mt-6">
          <div className="bg-[#F1F8F3] rounded-full p-2 shrink-0">
            <ShieldCheck className="h-[22px] w-[22px] text-[#22C55E]" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-[15px] font-medium text-[#006F3D] mb-0.5">Security Enhanced</h4>
            <p className="text-[13px] text-[#666666] leading-relaxed">
              Two-Factor Authentication will be configured<br className="hidden sm:block" /> after account creation.
            </p>
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive font-medium text-center bg-red-50 p-3 rounded-lg">{submitError}</p>}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-14 text-[17px] font-semibold bg-[#FD4F03] hover:bg-[#E94700] rounded-xl shadow-[0_4px_14px_rgba(253,79,3,0.3)] transition-all mt-6" 
          disabled={accept.isPending}
        >
          {accept.isPending ? "Creating account..." : "Create Admin Account"}
          {!accept.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </form>

      {/* Security notice below button */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#777777] mb-8">
        <Lock className="w-[14px] h-[14px] text-[#22C55E]" strokeWidth={2} />
        <span>Invitation secured with encrypted verification.</span>
      </div>

      <div className="border-t border-[#F0F0F0] mb-5"></div>

      {/* Footer Info Row */}
      <div className="bg-[#FDFDFD] rounded-[12px] border border-[#F0F0F0] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#22C55E]" strokeWidth={1.5} />
          <div>
            <h5 className="text-[12px] sm:text-[11px] font-bold text-[#111111] mb-[1px]">Secure Access</h5>
            <p className="text-[10px] sm:text-[9px] text-[#777777] leading-snug">Only invited users<br className="hidden sm:block"/>can create accounts</p>
          </div>
        </div>
        
        <div className="hidden sm:block w-[1px] h-8 bg-[#F0F0F0]"></div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#F4FAF6] rounded-full p-1.5 border border-[#E6F4EA]">
             <Lock className="w-[14px] h-[14px] text-[#22C55E]" strokeWidth={2} />
          </div>
          <div>
            <h5 className="text-[12px] sm:text-[11px] font-bold text-[#111111] mb-[1px]">Encrypted</h5>
            <p className="text-[10px] sm:text-[9px] text-[#777777] leading-snug">Your data is protected<br className="hidden sm:block"/>with encryption</p>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-[#F0F0F0]"></div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F4FAF6] rounded-full p-1.5 border border-[#E6F4EA]">
            <UserCheck className="w-[14px] h-[14px] text-[#22C55E]" strokeWidth={2} />
          </div>
          <div>
            <h5 className="text-[12px] sm:text-[11px] font-bold text-[#111111] mb-[1px]">Admin Only</h5>
            <p className="text-[10px] sm:text-[9px] text-[#777777] leading-snug">Full access to admin<br className="hidden sm:block"/>dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
