"use client";

import { cn } from "@/lib/utils";

interface VegFilterProps {
  value: boolean | null;
  onValueChange: (value: boolean | null) => void;
}

export function VegFilter({ value, onValueChange }: VegFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onValueChange(value === true ? null : true)}
        className={cn(
          "rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md",
          value === true && "text-primary"
        )}
      >
        Pure Veg
      </button>
      <button
        onClick={() => onValueChange(null)}
        className={cn(
          "rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md"
        )}
      >
        Veg
      </button>
      <button
        onClick={() => onValueChange(value === false ? null : false)}
        className={cn(
          "rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md",
          value === false && "text-primary"
        )}
      >
        Non Veg
      </button>
    </div>
  );
}
