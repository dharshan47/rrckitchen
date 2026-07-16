"use client";

import { cn } from "@/lib/utils";

export type VegFilterValue = "pure-veg" | "veg" | "non-veg" | null;

interface VegFilterProps {
  value: VegFilterValue;
  onValueChange: (value: VegFilterValue) => void;
}

const options: { label: string; value: VegFilterValue }[] = [
  { label: "Pure Veg", value: "pure-veg" },
  { label: "Veg", value: "veg" },
  { label: "Non Veg", value: "non-veg" },
];

export function VegFilter({ value, onValueChange }: VegFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onValueChange(value === opt.value ? null : opt.value)}
          className={cn(
            "rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md",
            value === opt.value && "text-primary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
