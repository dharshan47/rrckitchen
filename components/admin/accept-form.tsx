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

/* ------------------------- Exact-shape loading skeleton ------------------------- */

function AcceptInviteSkeleton() {
  return (
    <div
      data-testid="accept-invite-skeleton"
      className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-50 animate-in fade-in-0 duration-300"
    >
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
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
      <div className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-50 text-center animate-in fade-in-0 duration-300">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center shadow-md shadow-red-200">
            <Link2Off className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">
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

  // Password strength visual logic
  const getStrengthLevel = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 5) return 1;
    if (pass.length < 8) return 2;
    if (pass.length < 10) return 3;
    return 4;
  };
  const strengthLevel = getStrengthLevel(passwordValue);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-50">
      {/* Top Icon */}
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-[6px] border-white shadow-sm">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-full flex items-center justify-center shadow-md shadow-green-200">
          <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">Create Admin Account</h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed px-4">
          Accept your invitation and create your secure administrator account.
        </p>
        
        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div className="h-0.5 w-10 bg-orange-500 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-green-600 rounded-full"></div>
          <div className="h-0.5 w-10 bg-green-600 rounded-full"></div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) =>
          accept.mutate(
            { token, email: data.email, password: data.password },
            { onSuccess: () => router.push("/admin/2fa-setup") }
          )
        )}
        className="space-y-6"
      >
        {/* Email Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="invite-email" className="text-sm font-bold text-gray-900 ml-1">Email Address</Label>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50/50 rounded-lg flex items-center justify-center border border-green-100/50">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <Input 
              id="invite-email" 
              type="email" 
              placeholder="Enter your email address"
              className="pl-[52px] h-14 rounded-xl bg-white border-gray-200 focus-visible:ring-green-500 text-base shadow-sm"
              disabled={accept.isPending} 
              {...register("email")} 
            />
          </div>
          {errors.email && <p className="text-xs text-destructive font-medium ml-1 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2 text-left">
          <Label htmlFor="invite-password" className="text-sm font-bold text-gray-900 ml-1">Password</Label>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50/50 rounded-lg flex items-center justify-center border border-green-100/50">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <Input 
              id="invite-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter a strong password"
              className="pl-[52px] pr-12 h-14 rounded-xl bg-white border-gray-200 focus-visible:ring-green-500 text-base shadow-sm"
              disabled={accept.isPending} 
              {...register("password")} 
            />
            <button 
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive font-medium ml-1 mt-1">{errors.password.message}</p>}
          
          {/* Password Strength Indicator */}
          <div className="mt-4 px-1">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-semibold text-gray-400">Password strength:</span>
              <span className="text-xs font-semibold text-gray-500">Use 8+ characters</span>
            </div>
            <div className="flex gap-2 h-1.5">
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 1 ? "bg-orange-500" : "bg-gray-200")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 2 ? "bg-orange-400" : "bg-gray-200")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 3 ? "bg-yellow-400" : "bg-gray-200")}></div>
              <div className={cn("flex-1 rounded-full transition-colors duration-500", strengthLevel >= 4 ? "bg-green-600" : "bg-gray-200")}></div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#f4faf6] border border-green-200/60 rounded-xl p-4 sm:p-5 flex items-start gap-4 mt-8">
          <div className="bg-white rounded-full p-2 border border-green-100 shadow-sm shrink-0 mt-0.5">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-700 mb-1">Security Enhanced</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Two-Factor Authentication will be configured after account creation.
            </p>
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive font-medium text-center bg-red-50 p-3 rounded-lg">{submitError}</p>}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold bg-[#ff6b00] hover:bg-[#e56000] rounded-xl shadow-lg shadow-orange-200/50 transition-all active:scale-[0.98] mt-6" 
          disabled={accept.isPending}
        >
          {accept.isPending ? "Creating account..." : "Create Admin Account"}
          {!accept.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </form>

      {/* Security notice below button */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 mb-8">
        <Lock className="w-3.5 h-3.5 text-green-600" />
        <span className="font-medium">Invitation secured with encrypted verification.</span>
      </div>

      <div className="border-t border-gray-100/80 mb-6"></div>

      {/* Footer Info Row */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100/80 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between items-start sm:items-center">
        
        <div className="flex items-start gap-3 flex-1">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-gray-900 mb-0.5">Secure Access</h5>
            <p className="text-[10px] text-gray-500 leading-tight">Only invited users<br/>can create accounts</p>
          </div>
        </div>
        
        <div className="hidden sm:block w-px h-10 bg-gray-200/60 mx-1"></div>
        
        <div className="flex items-start gap-3 flex-1 sm:justify-center">
          <div className="bg-green-50/80 rounded-full p-1 border border-green-100 shrink-0">
             <Lock className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-gray-900 mb-0.5">Encrypted</h5>
            <p className="text-[10px] text-gray-500 leading-tight">Your data is protected<br/>with encryption</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-gray-200/60 mx-1"></div>

        <div className="flex items-start gap-3 flex-1 sm:justify-end">
          <div className="bg-green-50/80 rounded-full p-1 border border-green-100 shrink-0">
            <UserCheck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-gray-900 mb-0.5">Admin Only</h5>
            <p className="text-[10px] text-gray-500 leading-tight">Full access to admin<br/>dashboard</p>
          </div>
        </div>

      </div>
    </div>
  );
}
