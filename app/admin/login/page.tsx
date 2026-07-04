"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const result = await signIn.email({ email: data.email, password: data.password });
      if (result.error) throw new Error(result.error.message || "Invalid credentials");
      return result;
    },
    onSuccess: () => router.push("/admin"),
    onError: (err) => setError(err.message),
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="w-full border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm bg-card">
          <CardHeader className="px-6 py-8 text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Sign in with your admin credentials</p>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-11" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
