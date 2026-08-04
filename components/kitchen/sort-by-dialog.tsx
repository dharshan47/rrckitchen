"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "rating" | "cost-low" | "cost-high";

interface SortByDropdownProps {
  value: SortOption | null;
  onValueChange: (value: SortOption | null) => void;
  variant?: "desktop" | "mobile";
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Rating" },
  { value: "cost-low", label: "Cost: Low to High" },
  { value: "cost-high", label: "Cost: High to Low" },
];

export function SortByDropdown({ value, onValueChange, variant = "desktop" }: SortByDropdownProps) {
  const selectedLabel = sortOptions.find((o) => o.value === value)?.label;

  if (variant === "mobile") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 text-[13px] font-bold text-gray-900">
            <span>{value ? selectedLabel : "Popularity"}</span>
            <ArrowUpDown className="h-3 w-3 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44 p-1.5">
          <DropdownMenuRadioGroup
            value={value ?? ""}
            onValueChange={(v) => {
              if (v === value) {
                onValueChange(null);
              } else {
                onValueChange(v as SortOption);
              }
            }}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="py-2.5 px-3 text-sm rounded-md cursor-pointer text-nowrap"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md",
            value && "text-primary"
          )}
        >
          <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{value ? selectedLabel : "Sort by"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 p-1.5">
        <DropdownMenuRadioGroup
          value={value ?? ""}
          onValueChange={(v) => {
            if (v === value) {
              onValueChange(null);
            } else {
              onValueChange(v as SortOption);
            }
          }}
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="py-2.5 px-3 text-sm rounded-md cursor-pointer text-nowrap"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
