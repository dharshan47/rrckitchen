"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CouponResult {
  code: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  description?: string;
}

interface CouponInputProps {
  onApply: (coupon: CouponResult) => void;
  onRemove: () => void;
  appliedCoupon: CouponResult | null;
  cartTotal: number;
}

export function CouponInput({ onApply, onRemove, appliedCoupon, cartTotal }: CouponInputProps) {
  const [code, setCode] = useState("");

  const validateMutation = useMutation({
    mutationFn: async (couponCode: string): Promise<CouponResult> => {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Invalid coupon" }));
        throw new Error(err.error || "Invalid coupon code");
      }
      return res.json();
    },
  });

  const handleApply = useCallback(() => {
    if (!code.trim()) return;
    validateMutation.mutate(code.trim().toUpperCase(), {
      onSuccess: (result) => {
        onApply(result);
        setCode("");
      },
    });
  }, [code, validateMutation, onApply]);

  if (appliedCoupon) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
          <p className="text-xs text-green-600">
            {appliedCoupon.type === "PERCENTAGE"
              ? `${appliedCoupon.discount}% off`
              : appliedCoupon.type === "FIXED"
                ? `₹${appliedCoupon.discount} off`
                : "Free delivery"}
            {appliedCoupon.description ? ` — ${appliedCoupon.description}` : ""}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 rounded-full p-1 hover:bg-green-200 transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4 text-green-700" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5">
        <Tag className="h-4 w-4" />
        Apply Coupon
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className="h-11 pl-4 pr-4 rounded-xl"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApply(); } }}
          />
        </div>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || validateMutation.isPending}
          className="h-11 px-6 rounded-xl shrink-0"
        >
          {validateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {validateMutation.isError && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{validateMutation.error.message}</span>
        </div>
      )}
    </div>
  );
}
