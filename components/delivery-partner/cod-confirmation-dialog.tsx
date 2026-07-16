"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface CodConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  otp: z.string().length(4, "Delivery code must be 4 digits"),
  cashEntered: z.string().min(1, "Enter a valid cash amount").refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Enter a valid cash amount" }
  ),
});

type FormData = z.infer<typeof formSchema>;

export function CodConfirmationDialog({ open, onOpenChange, orderId, onSuccess }: CodConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      cashEntered: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const cashAmount = Number(data.cashEntered);
      const res = await fetch("/api/delivery/confirm-cod-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otp: data.otp.trim(), cashEntered: cashAmount }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to confirm delivery" }));
        throw new Error(err.error || "Failed to confirm delivery");
      }

      const responseData = await res.json();
      toast.success("Delivery confirmed successfully!");
      if (responseData.variance) {
        toast.warning(`Variance of ₹${Math.abs(responseData.variance)} detected (expected vs entered differs)`);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Confirm COD Delivery
            </DialogTitle>
            <DialogDescription>
              Enter the delivery code shared by the customer and the exact cash amount collected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="otp">Delivery Code</Label>
              <Input
                id="otp"
                placeholder="4-digit code from customer"
                value={form.watch("otp")}
                onChange={(e) => form.setValue("otp", e.target.value.replace(/\D/g, "").slice(0, 4), { shouldValidate: true })}
                maxLength={4}
                className="text-center text-lg font-mono tracking-widest"
                autoComplete="off"
              />
              {form.formState.errors.otp && (
                <p className="text-xs text-destructive">{form.formState.errors.otp.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ask the customer for the 4-digit code shown in their order details.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount Collected (₹)</Label>
              <Input
                id="cash"
                type="number"
                placeholder="e.g. 250"
                value={form.watch("cashEntered")}
                onChange={(e) => form.setValue("cashEntered", e.target.value, { shouldValidate: true })}
                min="0"
                step="1"
                className="text-center text-lg font-semibold"
              />
              {form.formState.errors.cashEntered && (
                <p className="text-xs text-destructive">{form.formState.errors.cashEntered.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                "Confirm Delivery & Cash"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
