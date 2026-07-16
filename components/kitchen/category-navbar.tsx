"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

interface CategoryNavbarProps {
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryNavbar({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryNavbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 bg-background border-b border-border transition-all duration-200",
        showSearch ? "shadow-sm" : ""
      )}
    >
      <div
        className={cn(
          "overflow-x-auto scrollbar-none flex items-center gap-2 px-4",
          showSearch ? "pt-3 pb-2" : "py-3"
        )}
      >
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
            selectedCategory === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat.name)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === cat.name
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
      {showSearch && (
        <div className="px-4 pb-3">
          <SearchAutocomplete
            navigateOnFocus
            placeholder="Search meals..."
            inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1 bg-white border border-border"
          />
        </div>
      )}
    </div>
  );
}
