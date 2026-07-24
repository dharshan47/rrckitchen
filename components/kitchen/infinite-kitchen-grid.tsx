"use client";

import { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useExploreKitchens, useKitchenCategories, type KitchenData } from "@/hooks/useExploreKitchens";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, Star, Loader2 } from "lucide-react";
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button";
import { KitchenFilters } from "@/components/kitchen/kitchen-filters";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { SortOption } from "@/components/kitchen/sort-by-dialog";
import { getKitchenStatus } from "@/components/kitchen/kitchen-timing-display";
import { cn } from "@/lib/utils";

function KitchenCard({
  kitchen,
  onClick,
}: {
  kitchen: KitchenData;
  onClick: () => void;
}) {
  const minPrice = kitchen.items && kitchen.items.length > 0
    ? Math.min(...kitchen.items.map((i) => i.price))
    : null;

  const maxDiscountPct = useMemo(() => {
    if (!kitchen.items || kitchen.items.length === 0) return null;
    const pct = kitchen.items.reduce((max, item) => {
      if (!item.compareAtPrice || item.compareAtPrice <= item.price) return max;
      const discount = Math.round(
        ((item.compareAtPrice - item.price) / item.compareAtPrice) * 100,
      );
      return Math.max(max, discount);
    }, 0);
    return pct > 0 ? pct : null;
  }, [kitchen.items]);

  const status = useMemo(() => getKitchenStatus(kitchen.operatingHours), [kitchen.operatingHours]);
  const isClosed = !status.isOpen;

  const offerText = useMemo(() => {
    if (maxDiscountPct != null) {
      const maxSavings = kitchen.items?.reduce((max, item) => {
        if (!item.compareAtPrice || item.compareAtPrice <= item.price) return max;
        const saving = item.compareAtPrice - item.price;
        return Math.max(max, saving);
      }, 0) ?? 0;
      return maxSavings > 0 ? `${maxDiscountPct}% OFF UPTO ₹${maxSavings}` : `${maxDiscountPct}% OFF`;
    }
    if (minPrice != null) return `ITEMS AT ₹${minPrice}`;
    return null;
  }, [maxDiscountPct, minPrice, kitchen.items]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className="cursor-pointer group flex flex-col hover:scale-[0.98] active:scale-95 transition-all duration-200"
    >
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
        {kitchen.imageUrl ? (
          <Image
            src={kitchen.imageUrl}
            alt={kitchen.displayName}
            fill
            className={cn("object-cover", isClosed && "grayscale opacity-80")}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
            <ChefHat className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient overlay for bottom text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Offer Text at bottom left */}
        {offerText && !isClosed && (
          <div className="absolute bottom-2.5 left-3 right-10 z-10">
            <span className="text-white text-[14px] sm:text-[16px] lg:text-[17px] font-black uppercase tracking-tight drop-shadow-lg leading-none">
              {offerText}
            </span>
          </div>
        )}
        
        {/* Closed Overlay Text */}
        {isClosed && status.opensNextAt && (
          <div className="absolute bottom-2.5 left-3 right-10 z-10">
            <span className="text-white/90 text-[12px] sm:text-[13px] font-black uppercase tracking-tight drop-shadow-lg leading-none">
              Opens next at {status.opensNextAt.time}, {status.opensNextAt.day}
            </span>
          </div>
        )}

        <KitchenWishlistButton
          kitchenPartnerId={kitchen.id}
          className="absolute top-2.5 right-2.5 z-10"
          size="sm"
        />
      </div>

      <div className={cn("mt-2 space-y-0.5", isClosed && "opacity-60")}>
        <h3 className="font-bold text-[15px] sm:text-[16px] text-foreground truncate leading-snug">
          {kitchen.displayName}
        </h3>
        
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
          <div className="flex items-center justify-center h-[17px] w-[17px] rounded-full bg-success text-white shrink-0">
            <Star className="h-[9px] w-[9px] fill-white" />
          </div>
          <span>{kitchen.avgRating != null && kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "NEW"}</span>
          <span className="text-foreground/30">•</span>
          <span>5-10 mins</span>
        </div>
        
        {kitchen.cuisineTags && kitchen.cuisineTags.length > 0 && (
          <p className="text-[13px] text-muted-foreground font-normal truncate">
            {kitchen.cuisineTags.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

interface InfiniteKitchenGridProps {
  selectedCategory?: string | null;
  onCategorySelect?: (category: string | null) => void;
  sortOption?: SortOption | null;
  onSortChange?: (option: SortOption | null) => void;
  vegFilter?: VegFilterValue;
  onVegFilterChange?: (veg: VegFilterValue) => void;
  selectedCuisines?: string[];
  onCuisinesChange?: (cuisines: string[]) => void;
  showInlineFilters?: boolean;
}

export function InfiniteKitchenGrid({
  selectedCategory: externalSelectedCategory,
  onCategorySelect: externalOnCategorySelect,
  sortOption: externalSortOption,
  onSortChange: externalOnSortChange,
  vegFilter: externalVegFilter,
  onVegFilterChange: externalOnVegFilterChange,
  selectedCuisines: externalSelectedCuisines,
  onCuisinesChange: externalOnCuisinesChange,
  showInlineFilters = true,
}: InfiniteKitchenGridProps = {}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null);
  const [internalSortOption, setInternalSortOption] = useState<SortOption | null>(null);
  const [internalVegFilter, setInternalVegFilter] = useState<VegFilterValue>(null);
  const [internalSelectedCuisines, setInternalSelectedCuisines] = useState<string[]>([]);

  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;
  const setSelectedCategory = externalOnCategorySelect ?? setInternalSelectedCategory;
  const sortOption = externalSortOption !== undefined ? externalSortOption : internalSortOption;
  const setSortOption = externalOnSortChange ?? setInternalSortOption;
  const vegFilter = externalVegFilter !== undefined ? externalVegFilter : internalVegFilter;
  const setVegFilter = externalOnVegFilterChange ?? setInternalVegFilter;
  const selectedCuisines = externalSelectedCuisines !== undefined ? externalSelectedCuisines : internalSelectedCuisines;
  const setSelectedCuisines = externalOnCuisinesChange ?? setInternalSelectedCuisines;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useExploreKitchens(selectedCategory);

  const { data: categories = [] } = useKitchenCategories();

  const allKitchens = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages.flatMap((page) => page.data ?? []) ?? []).filter((k) => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }, [data]);

  const filteredKitchens = useMemo(() => {
    let result = allKitchens;

    if (vegFilter === "pure-veg") {
      result = result.filter((k) =>
        k.items?.length > 0 && k.items.every((i) => i.foodType === "VEG")
      );
    } else if (vegFilter === "veg") {
      result = result.filter((k) =>
        k.items?.some((i) => i.foodType === "VEG")
      );
    } else if (vegFilter === "non-veg") {
      result = result.filter((k) =>
        k.items?.some((i) => i.foodType === "NONVEG")
      );
    }

    if (selectedCuisines.length > 0) {
      result = result.filter((k) =>
        k.cuisineTags?.some((tag) =>
          selectedCuisines.includes(
            categories.find((c) => c.name === tag)?.id ?? ""
          )
        )
      );
    }

    if (sortOption === "rating") {
      result = [...result].sort(
        (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0)
      );
    } else if (sortOption === "cost-low") {
      result = [...result].sort((a, b) => {
        const aMin = Math.min(...(a.items?.map((i) => i.price) ?? [0]));
        const bMin = Math.min(...(b.items?.map((i) => i.price) ?? [0]));
        return aMin - bMin;
      });
    } else if (sortOption === "cost-high") {
      result = [...result].sort((a, b) => {
        const aMin = Math.min(...(a.items?.map((i) => i.price) ?? [0]));
        const bMin = Math.min(...(b.items?.map((i) => i.price) ?? [0]));
        return bMin - aMin;
      });
    }

    return result;
  }, [allKitchens, vegFilter, selectedCuisines, sortOption, categories]);

  const handleKitchenClick = useCallback(
    (kitchenSlug: string) => router.push(`/kitchen/${kitchenSlug}`),
    [router],
  );

  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 2;
    return window.matchMedia("(min-width: 1024px)").matches ? 4 : 2;
  });
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) =>
      setColumns(e.matches ? 4 : 2);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setScrollMargin(containerRef.current.offsetTop);
    }
  }, [filteredKitchens]);

  const rowCount = Math.ceil(filteredKitchens.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 320,
    overscan: 3,
    scrollMargin,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    virtualizer.scrollToIndex(0);
  };

  const skeletonCards = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-muted overflow-hidden">
            <Skeleton className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full" />
          </div>
          <div className="mt-2 space-y-0.5">
            <Skeleton className="h-[20px] w-3/4 rounded-md" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-[17px] w-[17px] rounded-full shrink-0" />
              <Skeleton className="h-[13px] w-20 rounded-md" />
              <Skeleton className="h-[13px] w-[4px] rounded-full" />
              <Skeleton className="h-[13px] w-16 rounded-md" />
            </div>
            <Skeleton className="h-[13px] w-1/2 rounded-md" />
          </div>
        </div>
      )),
    [],
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {skeletonCards}
        </div>
      );
    }

    if (isError) {
      return (
        <p className="text-center text-sm text-destructive py-12">
          {error?.message ?? "Failed to load kitchens. Please try again later."}
        </p>
      );
    }

    if (filteredKitchens.length === 0) {
      return (
        <p className="text-center text-sm text-muted-foreground py-12">
          {selectedCategory
            ? `No kitchens found in "${selectedCategory}" category.`
            : "No kitchens available right now."}
        </p>
      );
    }

    return (
      <div
        ref={containerRef}
        className="relative"
        style={{ height: totalHeight }}
      >
        {virtualRows.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const startIdx = rowIndex * columns;
          const rowKitchens = filteredKitchens.slice(
            startIdx,
            startIdx + columns,
          );

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 right-0 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8"
              style={{
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {rowKitchens.map((kitchen) => (
                <KitchenCard
                  key={kitchen.id}
                  kitchen={kitchen}
                  onClick={() => handleKitchenClick(kitchen.slug)}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Kitchens to Explore
        </h2>

        {showInlineFilters && (
          <KitchenFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            sortOption={sortOption}
            onSortChange={setSortOption}
            vegFilter={vegFilter}
            onVegFilterChange={setVegFilter}
            selectedCuisines={selectedCuisines}
            onCuisinesChange={setSelectedCuisines}
          />
        )}
      </div>

      {renderContent()}

      {(hasNextPage || isFetchingNextPage) && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-6"
        >
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading more kitchens...
          </span>
        </div>
      )}
    </section>
  );
}
