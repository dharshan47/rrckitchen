"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { assignUserRole } from "@/actions/auth";
import type { UserRole } from "@/stores";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignupForm = z.infer<typeof signupSchema>;
type LoginForm = z.infer<typeof loginSchema>;

interface EmailPasswordFormProps {
  mode: "signup" | "login";
  role?: UserRole;
  title?: string;
  subtitle?: string;
}

function EmailPasswordFormInner({ mode, role = "customer", title, subtitle }: EmailPasswordFormProps) {
  const router = useRouter();

  const schema = mode === "signup" ? signupSchema : loginSchema;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm | LoginForm>({
    resolver: zodResolver(schema),
  });

  const roleToDbName: Record<UserRole, string> = {
    customer: "CUSTOMER",
    "delivery-partner": "DELIVERYPARTNER",
    kitchen: "KITCHENPARTNER",
    admin: "ADMIN",
  };

  const redirectMap: Record<string, string> = {
    customer: "/",
    "delivery-partner": "/delivery-partner/dashboard",
    kitchen: "/kitchen/dashboard",
    admin: "/admin",
  };

  const onSubmit = async (data: SignupForm | LoginForm) => {
    try {
      if (mode === "signup") {
        const { name, email, password } = data as SignupForm;
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email,
          password,
        });
        if (signUpError) {
          setError("root", { message: signUpError.message || "Sign up failed." });
          return;
        }
        await assignUserRole(roleToDbName[role]);
        router.push(redirectMap[role] ?? "/");
      } else {
        const { email, password } = data as LoginForm;
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError("root", { message: signInError.message || "Invalid credentials." });
          return;
        }
        router.push(redirectMap[role] ?? "/");
      }
    } catch {
      setError("root", { message: "Something went wrong. Please try again." });
    }
  };

  const serverError = errors.root?.message;

  return (
    <Card className="mx-auto w-full max-w-lg border border-border bg-white">
      <CardHeader className="px-6 py-6">
        <CardTitle>{title ?? (mode === "signup" ? "Create Account" : "Sign In")}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {mode === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="ep-name">Name</Label>
              <Input
                id="ep-name"
                placeholder="John Doe"
                disabled={isSubmitting}
                {...register("name")}
              />
              {(errors as FieldErrors<SignupForm>).name && <p className="text-xs text-destructive">{(errors as FieldErrors<SignupForm>).name!.message}</p>}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="ep-email">Email</Label>
            <Input
              id="ep-email"
              type="email"
              placeholder="john@example.com"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ep-password">Password</Label>
            <Input
              id="ep-password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? (mode === "signup" ? "Creating account..." : "Signing in...")
              : (mode === "signup" ? "Create Account" : "Sign In")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const EmailPasswordForm = memo(EmailPasswordFormInner);
export default EmailPasswordForm;
