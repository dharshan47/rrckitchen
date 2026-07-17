"use client";

import { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useExploreKitchens, useKitchenCategories } from "@/hooks/useExploreKitchens";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, Star, Loader2 } from "lucide-react";
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button";
import { KitchenFilters } from "@/components/kitchen/kitchen-filters";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { SortOption } from "@/components/kitchen/sort-by-dialog";

function KitchenCard({
  kitchen,
  onClick,
}: {
  kitchen: {
    id: string;
    displayName: string;
    avgRating: number | null;
    imageUrl: string | null;
    cuisineTags?: string[];
  };
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className="cursor-pointer group"
    >
      {kitchen.imageUrl ? (
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          <Image
            src={kitchen.imageUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 1024px) 50vw, 16vw"
          />
          <KitchenWishlistButton
            kitchenPartnerId={kitchen.id}
            className="absolute top-2 right-2"
            size="sm"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
          <ChefHat className="h-10 w-10 text-muted-foreground/40" />
          <KitchenWishlistButton
            kitchenPartnerId={kitchen.id}
            className="absolute top-2 right-2"
            size="sm"
          />
        </div>
      )}

      <div className="mt-1.5 space-y-0.5">
        <h3 className="font-semibold text-sm lg:text-lg text-foreground truncate">
          {kitchen.displayName}
        </h3>
        {kitchen.cuisineTags && kitchen.cuisineTags.length > 0 && (
          <p className="text-[11px] text-muted-foreground truncate">
            {kitchen.cuisineTags.join(", ")}
          </p>
        )}
        {kitchen.avgRating != null && kitchen.avgRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-green-600 text-green-600" />
            <span className="text-xs font-semibold text-green-600">
              {kitchen.avgRating.toFixed(1)}
            </span>
          </div>
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
    return (data?.pages.flatMap((page) => page.data) ?? []).filter((k) => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }, [data]);

  const filteredKitchens = useMemo(() => {
    let result = allKitchens;

    if (vegFilter === "pure-veg") {
      result = result.filter((k) =>
        k.items.length > 0 && k.items.every((i) => i.foodType === "VEG")
      );
    } else if (vegFilter === "veg") {
      result = result.filter((k) =>
        k.items.some((i) => i.foodType === "VEG")
      );
    } else if (vegFilter === "non-veg") {
      result = result.filter((k) =>
        k.items.some((i) => i.foodType === "NONVEG")
      );
    }

    if (selectedCuisines.length > 0) {
      result = result.filter((k) =>
        k.cuisineTags.some((tag) =>
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
        <div key={i}>
          <div className="relative w-full aspect-[4/3] rounded-xl bg-muted">
            <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
          </div>
          <div className="mt-1.5 space-y-0.5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      )),
    [],
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              className="absolute left-0 right-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
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
    <section>
      <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-primary" />
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
