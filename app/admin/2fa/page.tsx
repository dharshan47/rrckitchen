"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Label, Card } from "@/components/ui";

const schema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must be numeric"),
});

export default function AdminTwoFactorChallengePage() {
  const form = useForm<{ code: string }>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const verify = useMutation({
    mutationFn: async (data: { code: string }) => {
      const res = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: data.code, trustDevice: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Verification failed");
      }
      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/admin";
    },
    onError: (err) => {
      form.setError("root", { message: err.message || "Verification failed" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-xl font-bold mb-4">Two-Factor Authentication</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the 6-digit code from your authenticator app.
        </p>
        <form
          onSubmit={form.handleSubmit((data) => verify.mutate(data))}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="code">Authenticator code</Label>
            <Input
              id="code"
              maxLength={6}
              disabled={verify.isPending}
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <p className="text-xs text-destructive">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          {form.formState.errors.root?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={verify.isPending}>
            {verify.isPending ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
