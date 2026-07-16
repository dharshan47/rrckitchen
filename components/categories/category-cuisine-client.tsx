"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChefHat, Star } from "lucide-react";
import { SortByDropdown, SortOption } from "@/components/kitchen/sort-by-dialog";
import { VegFilter } from "@/components/kitchen/veg-filter";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  foodType: string;
  timeSlot: string;
  imageUrl: string | null;
}

interface KitchenData {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  cuisineTags: string[];
  items: MenuItem[];
  timeSlots: string[];
}

interface Props {
  categoryName: string;
  kitchens: KitchenData[];
}

export function CategoryCuisineClient({ categoryName, kitchens }: Props) {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [vegFilter, setVegFilter] = useState<boolean | null>(null);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const footerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      if (!sentinelRef.current) return;
      const rect = sentinelRef.current.getBoundingClientRect();
      if (!nearFooter) {
        setShowFilterBar(rect.top <= 0);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [nearFooter]);

  useEffect(() => {
    if (!footerSentinelRef.current) return;
    const el = footerSentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearFooter(entry.isIntersecting);
        if (entry.isIntersecting) {
          setShowFilterBar(false);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showFilterBar) {
      document.body.dataset.categoryFilterActive = "true";
    } else {
      delete document.body.dataset.categoryFilterActive;
    }
  }, [showFilterBar]);

  const displayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const filteredKitchens = useMemo(() => {
    let result = kitchens;

    if (vegFilter !== null) {
      result = result.filter((k) =>
        k.items.some((i) =>
          vegFilter
            ? i.foodType === "VEG"
            : i.foodType === "NON_VEG"
        )
      );
    }

    if (sortOption === "rating") {
      result = [...result].sort(
        (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0)
      );
    } else if (sortOption === "cost-low") {
      result = [...result].sort((a, b) => {
        const aMin = Math.min(...a.items.map((i) => i.price));
        const bMin = Math.min(...b.items.map((i) => i.price));
        return aMin - bMin;
      });
    } else if (sortOption === "cost-high") {
      result = [...result].sort((a, b) => {
        const aMin = Math.min(...a.items.map((i) => i.price));
        const bMin = Math.min(...b.items.map((i) => i.price));
        return bMin - aMin;
      });
    }

    return result;
  }, [kitchens, vegFilter, sortOption]);

  const handleKitchenClick = useCallback(
    (kitchenSlug: string) => router.push(`/kitchen/${kitchenSlug}`),
    [router],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Sticky filter navbar - filters left, search right */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-transform duration-200",
          showFilterBar ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <SortByDropdown value={sortOption} onValueChange={setSortOption} />
            <VegFilter value={vegFilter} onValueChange={setVegFilter} />
          </div>
          <div className="flex-1 min-w-0 max-w-md ml-auto">
            <SearchAutocomplete
              navigateOnFocus
              placeholder="Search meals..."
              inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1 bg-white border border-border"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Indulge with the best of {displayName.toLowerCase()} cuisines.
          </p>
        </div>

        {/* Inline filters (hidden when sticky bar takes over) */}
        <div className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none pb-1", showFilterBar && "hidden")}>
          <SortByDropdown value={sortOption} onValueChange={setSortOption} />
          <VegFilter value={vegFilter} onValueChange={setVegFilter} />
        </div>

        {/* Sentinel to trigger sticky bar when kitchen cards come into view */}
        <div ref={sentinelRef} />

        {filteredKitchens.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            No kitchens found for {displayName.toLowerCase()} right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredKitchens.map((kitchen) => (
              <div
                key={kitchen.id}
                onClick={() => handleKitchenClick(kitchen.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") handleKitchenClick(kitchen.slug); }}
                className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
              >
                {kitchen.items.length > 0 && kitchen.items[0].imageUrl ? (
                  <div className="relative w-full h-40 sm:h-48 bg-muted">
                    <Image
                      src={kitchen.items[0].imageUrl}
                      alt={kitchen.items[0].name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ) : kitchen.imageUrl ? (
                  <div className="relative w-full h-40 sm:h-48 bg-muted">
                    <Image
                      src={kitchen.imageUrl}
                      alt={kitchen.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 sm:h-48 bg-muted flex items-center justify-center">
                    <ChefHat className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base truncate">{kitchen.displayName}</h3>
                    {kitchen.avgRating != null && kitchen.avgRating > 0 && (
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
                        {kitchen.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {kitchen.cuisineTags && kitchen.cuisineTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {kitchen.cuisineTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] leading-tight px-1.5 py-0.5 rounded-full bg-primary/10 text-primary truncate max-w-25"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {kitchen.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {kitchen.items.slice(0, 3).map((item) => (
                        <span key={item.id} className="text-[10px] text-muted-foreground truncate max-w-30">
                          {item.name} - ₹{item.price}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer sentinel - hides filter bar when near footer */}
      <div ref={footerSentinelRef} className="h-1" />
    </main>
  );
}
