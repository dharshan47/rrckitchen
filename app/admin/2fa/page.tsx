"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { Button, Input, Label, Card, CardContent } from "@/components/ui";
import { Mail, Lock, ShieldCheck, LogIn } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

type FormData = z.infer<typeof schema>;

export default function AdminTwoFactorChallengePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "totp">("credentials");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", code: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);

    try {
      if (step === "credentials") {
        const signInResult = await signIn.email({
          email: data.email,
          password: data.password,
        });

        if (signInResult?.error) {
          setError(signInResult.error.message || "Invalid credentials");
          setLoading(false);
          return;
        }

        setStep("totp");
        setLoading(false);
        return;
      }

      const verifyRes = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: data.code, trustDevice: true }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        setError(err.error || "Verification failed");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">
              {step === "credentials" ? "Admin Sign In" : "Two-Factor Authentication"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "credentials"
                ? "Enter your email and password"
                : "Enter the 6-digit code from your authenticator app"}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {step === "credentials" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@rrckitchen.com"
                      className="pl-9"
                      disabled={loading}
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-9"
                      disabled={loading}
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </>
            )}

            {step === "totp" && (
              <div className="grid gap-2">
                <Label htmlFor="code">Authenticator code</Label>
                <Input
                  id="code"
                  maxLength={6}
                  placeholder="000000"
                  disabled={loading}
                  {...form.register("code")}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" />
              {loading
                ? "Please wait..."
                : step === "credentials"
                  ? "Sign in"
                  : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
