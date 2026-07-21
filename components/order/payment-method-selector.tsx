"use client";

import { CreditCard, Banknote } from "lucide-react";

export type PaymentMethod = "RAZORPAY" | "CASH_ON_DELIVERY";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  codAvailable?: boolean;
  codReason?: string | null;
  razorpayAvailable?: boolean;
}

export function PaymentMethodSelector({ selected, onSelect, codAvailable = true, codReason, razorpayAvailable = true }: PaymentMethodSelectorProps) {
  const methods: { id: PaymentMethod; label: string; desc: string; icon: typeof CreditCard; disabled?: boolean; disabledReason?: string }[] = [
    { id: "RAZORPAY", label: "Pay Online", desc: "Credit/Debit card, UPI, Net Banking", icon: CreditCard, disabled: !razorpayAvailable, disabledReason: !razorpayAvailable ? "Online payment coming soon" : undefined },
    { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay with cash when your order arrives", icon: Banknote, disabled: !codAvailable, disabledReason: codReason ?? undefined },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-3">Payment Method</label>
      <div className="grid gap-2">
        {methods.map((method) => {
          const isSelected = selected === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !method.disabled && onSelect(method.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                method.disabled
                  ? "border-border opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{method.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                {method.disabled && method.disabledReason && (
                  <p className="text-xs text-amber-600 mt-0.5">{method.disabledReason}</p>
                )}
              </div>
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
