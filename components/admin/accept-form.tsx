"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signUp, signOut, useSession } from "@/lib/auth-client";
import { acceptAdminInvite } from "@/actions/admin/invites-actions";
import { Button, Input, Label, Card } from "@/components/ui";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type InviteForm = z.infer<typeof inviteSchema>;

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, refetch } = useSession();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
      await refetch();
    },
  });

  const accept = useMutation({
    mutationFn: async (data: InviteForm) => {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0],
      });
      if (result.error) {
        throw new Error(result.error.message || "Could not create account — this email may already be in use");
      }

      await acceptAdminInvite(token);
      router.push("/admin/2fa-setup");
    },
    onError: (err) => setError("root", { message: err.message }),
  });

  if (session?.user) {
    return (
      <Card className="max-w-md w-full p-6 text-center">
        <h1 className="text-xl font-bold mb-4">Sign out first</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You&apos;re currently signed in as {session.user.email || session.user.phoneNumber}.
          Admin access requires a brand-new account — sign out, then open this
          invite link again.
        </p>
        <Button
          className="w-full"
          onClick={() => signOutMutation.mutate()}
          disabled={signOutMutation.isPending}
        >
          {signOutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full p-6">
      <h1 className="text-xl font-bold mb-4">Create your admin account</h1>
      <p className="text-sm text-muted-foreground mb-6">
        This invite creates a new account. You&apos;ll set up two-factor
        authentication right after.
      </p>

      <form onSubmit={handleSubmit((data) => accept.mutate(data))} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" type="email" disabled={isSubmitting} {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="invite-password">Password</Label>
          <Input id="invite-password" type="password" disabled={isSubmitting} {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {errors.root?.message && <p className="text-sm text-destructive">{errors.root.message}</p>}

        <Button type="submit" className="w-full" disabled={accept.isPending}>
          {accept.isPending ? "Creating account..." : "Create admin account"}
        </Button>
      </form>
    </Card>
  );
}
