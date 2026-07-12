"use client";

import { Clock, CalendarDays } from "lucide-react";

export type OrderType = "PREBOOK" | "INSTANT";

interface OrderTypeSelectorProps {
  selected: OrderType;
  onSelect: (type: OrderType) => void;
}

export function OrderTypeSelector({ selected, onSelect }: OrderTypeSelectorProps) {
  const options: { id: OrderType; label: string; desc: string; icon: typeof Clock; badge?: string }[] = [
    {
      id: "PREBOOK",
      label: "Pre-book",
      desc: "Order now for tomorrow's meal",
      icon: CalendarDays,
      badge: "Tomorrow",
    },
    {
      id: "INSTANT",
      label: "Order Now",
      desc: "Get it delivered as soon as possible",
      icon: Clock,
      badge: "Today",
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Order Type</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{option.label}</p>
                </div>
                {option.badge && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {option.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-4">{option.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
