"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight, Star as StarIcon, UsersRound, Leaf, CircleCheck, Sparkles, ChevronDown, CircleSlash, X } from "lucide-react";
import {  KitchenCardSkeleton } from "@/components/kitchen/kitchens-page-skeleton";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { KitchenCard } from "@/components/kitchen/kitchen-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useKitchensGridData,
  useKitchensGridCategories,
  useKitchensGridPagination,
  useKitchensGridFilters,
  useKitchensGridActions,
  useKitchensGridQuery,
  useKitchensGridCategoriesQuery,
} from "@/stores/kitchensGridStore";

const MEAL_TYPE_LABELS: Record<string, string> = {
  MORNING: "Breakfast",
  LUNCH: "Lunch",
  EVENINGSNACKS: "Evening Snacks",
  DINNER: "Dinner",
};

export function InfiniteKitchenGrid() {
  const kitchens = useKitchensGridData();
  const categories = useKitchensGridCategories();
  const { isLoading, isError } = useKitchensGridPagination();
  const {
    selectedCategory,
    sortOption,
    vegFilter,
    selectedCuisines,
    minRating,
    minPrepTime,
    maxPrepTime,
    mealType,
    topRatedOnly,
    newOnly,
    showMobileFilters,
  } = useKitchensGridFilters();
  const actions = useKitchensGridActions();

  // Trigger queries
  const kitchensQuery = useKitchensGridQuery(selectedCategory);
  useKitchensGridCategoriesQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const itemsPerPage = 12;

  const allKitchens = useMemo(() => {
    const seen = new Set<string>();
    return kitchens.filter((k) => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }, [kitchens]);

  const filteredKitchens = useMemo(() => {
    let result = allKitchens;

    if (vegFilter === "pure-veg") {
      result = result.filter((k) => k.items?.length > 0 && k.items.every((i) => i.foodType === "VEG"));
    } else if (vegFilter === "veg") {
      result = result.filter((k) => k.items?.some((i) => i.foodType === "VEG"));
    } else if (vegFilter === "non-veg") {
      result = result.filter((k) => k.items?.some((i) => i.foodType === "NONVEG"));
    }

    if (selectedCuisines.length > 0) {
      result = result.filter((k) =>
        k.cuisineTags?.some((tag) =>
          selectedCuisines.includes(categories.find((c) => c.name.toLowerCase() === tag.toLowerCase())?.id ?? "")
        )
      );
    }

    if (mealType) {
      result = result.filter((k) => k.timeSlots?.includes(mealType));
    }

    if (minRating !== null) {
      result = result.filter((k) => k.avgRating !== null && k.avgRating >= minRating);
    }

    if (minPrepTime !== null || maxPrepTime !== null) {
      result = result.filter(
        (k) =>
          k.estimatedPrepTime !== null &&
          (minPrepTime === null || k.estimatedPrepTime >= minPrepTime) &&
          (maxPrepTime === null || k.estimatedPrepTime <= maxPrepTime)
      );
    }

    if (topRatedOnly) {
      result = result.filter((k) => k.avgRating !== null && k.avgRating >= 4.5);
    }

    if (newOnly) {
      result = result.filter((k) => k.avgRating === null);
    }

    if (sortOption === "rating") {
      result = [...result].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
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
  }, [allKitchens, vegFilter, selectedCuisines, sortOption, categories, mealType, minRating, minPrepTime, maxPrepTime, topRatedOnly, newOnly]);

  const mealTypeOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const kitchen of allKitchens) {
      for (const slot of kitchen.timeSlots ?? []) keys.add(slot);
    }
    return ["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"]
      .filter((key) => keys.has(key) || allKitchens.length === 0)
      .map((key) => ({ key, label: MEAL_TYPE_LABELS[key] ?? key }));
  }, [allKitchens]);

  // Pagination logic (clamp to valid range so a shrinking result list
  // never leaves us on an empty page).
  const totalPages = Math.max(1, Math.ceil(filteredKitchens.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentKitchens = filteredKitchens.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderFilterContent = () => (
    <Accordion type="multiple" defaultValue={["mealType", "cuisine", "ratings", "deliveryTime"]} className="w-full">
      {/* Meal Type */}
      <AccordionItem value="mealType" className="border-b-0">
        <AccordionTrigger className="text-[14px] font-bold text-[#222222] py-3 hover:no-underline select-none">
          Meal Type
        </AccordionTrigger>
        <AccordionContent className="pb-4 !h-auto">
          <div className="flex flex-col gap-2.5">
            {mealTypeOptions.map((option) => (
              <div key={option.key} className="flex items-center gap-3 group">
                <Checkbox
                  id={`meal-${option.key}`}
                  checked={mealType === option.key}
                  onCheckedChange={() => actions.setMealType(mealType === option.key ? null : option.key)}
                  className="data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] border-[#FF8A69] rounded-sm h-[15px] w-[15px] shadow-none"
                />
                <Label htmlFor={`meal-${option.key}`} className="text-[11px] font-normal text-[#333333] cursor-pointer group-hover:text-[#111111]">{option.label}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <div className="h-px bg-[#EEEEEE] w-full" />

      {/* Cuisine */}
      <AccordionItem value="cuisine" className="border-b-0">
        <AccordionTrigger className="text-[14px] font-bold text-[#222222] py-3 hover:no-underline select-none">
          Cuisine
        </AccordionTrigger>
        <AccordionContent className="pb-4 !h-auto">
          <div className="flex flex-col gap-2.5">
            {(showAllCuisines ? categories : categories.slice(0, 5)).map((category) => (
              <div key={category.id} className="flex items-center gap-3 group">
                <Checkbox
                  id={`cuisine-${category.id}`}
                  checked={selectedCuisines.includes(category.id)}
                  onCheckedChange={() => actions.toggleCuisine(category.id)}
                  className="data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] border-[#FF8A69] rounded-sm h-[15px] w-[15px] shadow-none"
                />
                <Label htmlFor={`cuisine-${category.id}`} className="text-[11px] font-normal text-[#333333] cursor-pointer group-hover:text-[#111111]">{category.name}</Label>
              </div>
            ))}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCuisines((v) => !v)}
                className="text-[11px] font-bold text-[#F44A01] text-left mt-0.5"
              >
                {showAllCuisines ? "View Less" : `View All (${categories.length})`}
              </button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <div className="h-px bg-[#EEEEEE] w-full" />

      {/* Ratings */}
      <AccordionItem value="ratings" className="border-b-0">
        <AccordionTrigger className="text-[14px] font-bold text-[#222222] py-3 hover:no-underline select-none">
          Ratings
        </AccordionTrigger>
        <AccordionContent className="pb-4 !h-auto">
          <div className="flex flex-col gap-2.5">
            {[
              { label: "4.5 & above", value: 4.5 },
              { label: "4.0 & above", value: 4.0 },
              { label: "3.5 & above", value: 3.5 },
              { label: "3.0 & above", value: 3.0 },
            ].map((item) => (
              <div key={item.value} className="flex items-center gap-3 group">
                <Checkbox
                  id={`rating-${item.value}`}
                  checked={minRating === item.value}
                  onCheckedChange={() => actions.setMinRating(minRating === item.value ? null : item.value)}
                  className="data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] border-[#FF8A69] rounded-sm h-[15px] w-[15px] shadow-none"
                />
                <Label htmlFor={`rating-${item.value}`} className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => {
                      const fill = Math.max(0, Math.min(1, item.value - j));
                      return (
                        <div key={j} className="relative h-[11px] w-[11px]">
                          <StarIcon className="absolute inset-0 h-[11px] w-[11px] fill-[#E8E8E8] text-[#E8E8E8]" />
                          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <StarIcon className="h-[11px] w-[11px] fill-[#F44A01] text-[#F44A01]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-normal text-[#333333] group-hover:text-[#111111]">{item.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <div className="h-px bg-[#EEEEEE] w-full" />

      {/* Delivery Time */}
      <AccordionItem value="deliveryTime" className="border-b-0">
        <AccordionTrigger className="text-[14px] font-bold text-[#222222] py-3 hover:no-underline select-none">
          Delivery Time
        </AccordionTrigger>
        <AccordionContent className="pb-4 !h-auto">
          <div className="flex flex-col gap-2.5">
            {[
              { label: "25 mins or less", min: null, max: 25 },
              { label: "25 - 40 mins", min: 25, max: 40 },
              { label: "40 - 60 mins", min: 40, max: 60 },
              { label: "More than 60 mins", min: 60, max: null },
            ].map((option) => {
              const isSelected = minPrepTime === option.min && maxPrepTime === option.max;
              return (
                <div key={option.label} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`time-${option.min ?? 0}-${option.max ?? "max"}`}
                    checked={isSelected}
                    onCheckedChange={() => {
                      if (isSelected) {
                        actions.setMinPrepTime(null);
                        actions.setMaxPrepTime(null);
                      } else {
                        actions.setMinPrepTime(option.min);
                        actions.setMaxPrepTime(option.max);
                      }
                    }}
                    className="data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] border-[#FF8A69] rounded-sm h-[15px] w-[15px] shadow-none"
                  />
                  <Label htmlFor={`time-${option.min ?? 0}-${option.max ?? "max"}`} className="text-[11px] font-normal text-[#333333] cursor-pointer group-hover:text-[#111111]">{option.label}</Label>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  );

  return (
    <div className="bg-[#F8F8F8] min-h-screen pt-4 pb-20 text-[#111111]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] font-normal text-[#595959] mb-4">
            <Link href="/" className="hover:text-[#111111]">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#595959]" />
            <span className="text-[#111111]">Kitchens</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#00512F] mb-1">Kitchens</h1>
          <p className="text-[13px] font-normal text-[#333333]">
            Discover amazing home chefs and pre-book delicious homemade meals.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0 bg-[#FFFFFF] border border-[#E8E8E8] rounded-[7px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.035)] sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#171717]">Filters</h2>
              <button onClick={actions.resetFilters} className="text-[12px] font-semibold text-[#F44A01] hover:underline">Clear All</button>
            </div>
            {renderFilterContent()}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full lg:w-auto">
            
            {/* Top Quick Filters & Mobile Sort Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4 w-full min-w-0">
              
              {/* Mobile Filter Toggle & Sort */}
              <div className="flex lg:hidden items-center justify-between w-full">
                <button
                  onClick={() => actions.setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center gap-2 text-[12px] font-bold text-[#111111] bg-white border border-[#E8E8E8] px-4 py-2 rounded-[6px] shadow-sm"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#F44A01]" /> Filters
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-[#E8E8E8] bg-[#FFFFFF] text-[12px] font-medium text-[#222222] shadow-sm">
                      {sortOption === "rating" ? "Rating" : sortOption === "cost-low" ? "Cost: Low to High" : sortOption === "cost-high" ? "Cost: High to Low" : "Sort by"}
                      <ChevronDown className="h-4 w-4 text-[#444444]" strokeWidth={1.8} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#FFFFFF] border-[#E5E5E5]">
                    <DropdownMenuRadioGroup value={sortOption ?? ""} onValueChange={(v) => actions.setSortOption(v === "" ? null : (v as SortOption))}>
                      <DropdownMenuRadioItem value="">Popularity</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cost-low">Cost: Low to High</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cost-high">Cost: High to Low</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 lg:pb-0 scrollbar-hide [&>button]:shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <button
                  onClick={() => actions.setVegFilter(null)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    vegFilter === null ? "bg-[#FFF5F0] border-[#FF8A69] text-[#F44A01]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#222222] hover:bg-[#FAFAFA]"
                  )}
                >
                  <UsersRound className={cn("h-3.5 w-3.5", vegFilter === null ? "text-[#F44A01]" : "text-[#595959]")} strokeWidth={1.8} /> All Kitchens
                </button>
                <button
                  onClick={() => actions.setVegFilter("pure-veg")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    vegFilter === "pure-veg" ? "bg-[#F0FDF4] border-[#22C55E] text-[#15803D]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#222222] hover:bg-[#FAFAFA]"
                  )}
                >
                  <CircleCheck className="w-3.5 h-3.5 text-[#08733F]" strokeWidth={1.8} />
                  Pure Veg
                </button>
                <button
                  onClick={() => actions.setVegFilter("veg")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    vegFilter === "veg" ? "bg-[#F0FDF4] border-[#22C55E] text-[#15803D]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#222222] hover:bg-[#FAFAFA]"
                  )}
                >
                  <Leaf className="w-3.5 h-3.5 text-[#08733F]" strokeWidth={1.8} />
                  Veg
                </button>
                <button
                  onClick={() => actions.setVegFilter("non-veg")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    vegFilter === "non-veg" ? "bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#333333] hover:bg-[#FAFAFA]"
                  )}
                >
                  <CircleSlash className="w-3.5 h-3.5 text-[#D92D20]" strokeWidth={1.8} />
                  Non Veg
                </button>
                <button
                  onClick={actions.toggleTopRated}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    topRatedOnly ? "bg-[#FFF5F0] border-[#FF8A69] text-[#F44A01]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#333333] hover:bg-[#FAFAFA]"
                  )}
                >
                  <StarIcon className={cn("h-3.5 w-3.5 strokeWidth={1.8}", topRatedOnly ? "text-[#F44A01]" : "text-[#F44A01]")} /> Bestseller
                </button>
                <button
                  onClick={actions.toggleNewOnly}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.025)]",
                    newOnly ? "bg-[#FAF5FF] border-[#A855F7] text-[#6D28D9]" : "bg-[#FFFFFF] border-[#E8E8E8] text-[#333333] hover:bg-[#FAFAFA]"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#6D28D9]" strokeWidth={1.8} /> New
                </button>
              </div>

              {/* Desktop Sort */}
              <div className="hidden lg:flex items-center gap-2 text-[12px] font-medium text-[#222222]">
                Sort by:
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#E5E5E5] bg-[#FFFFFF] text-[#222222]">
                      {sortOption === "rating" ? "Rating" : sortOption === "cost-low" ? "Cost: Low to High" : sortOption === "cost-high" ? "Cost: High to Low" : "Popularity"}
                      <ChevronDown className="h-4 w-4 text-[#444444]" strokeWidth={1.8} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#FFFFFF] border-[#E5E5E5]">
                    <DropdownMenuRadioGroup value={sortOption ?? ""} onValueChange={(v) => actions.setSortOption(v === "" ? null : (v as SortOption))}>
                      <DropdownMenuRadioItem value="">Popularity</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cost-low">Cost: Low to High</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cost-high">Cost: High to Low</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Showing Results Info */}
            <div className="mb-4">
              <p className="text-[13px] font-bold text-[#111111]">
                Showing {filteredKitchens.length > 0 ? Math.min((safeCurrentPage - 1) * itemsPerPage + 1, filteredKitchens.length) : 0} – {Math.min(safeCurrentPage * itemsPerPage, filteredKitchens.length)} of {filteredKitchens.length} Kitchen{filteredKitchens.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-7">
                {Array.from({ length: 12 }).map((_, i) => (
                  <KitchenCardSkeleton key={i} />
                ))}
              </div>
            ) : isError && kitchens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-xl font-bold text-[#111111] mb-2">Couldn&apos;t Load Kitchens</h3>
                <p className="text-[#555555] max-w-md text-[13px]">
                  Something went wrong while fetching kitchens. Check your connection and try again.
                </p>
                <button
                  onClick={() => kitchensQuery.refetch()}
                  className="mt-6 px-6 py-2 bg-[#F44A01] text-white font-bold rounded-[5px]"
                >
                  Retry
                </button>
              </div>
            ) : filteredKitchens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-xl font-bold text-[#111111] mb-2">No Kitchens Found</h3>
                <p className="text-[#555555] max-w-md text-[13px]">Try adjusting your filters or search criteria to find what you&apos;re looking for.</p>
                <button onClick={actions.resetFilters} className="mt-6 px-6 py-2 bg-[#F44A01] text-white font-bold rounded-[5px]">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-7">
                  {currentKitchens.map((kitchen) => (
                    <KitchenCard key={kitchen.id} kitchen={kitchen} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(safeCurrentPage - 1); }}
                            className={cn("border border-[#E8E8E8] bg-[#FFFFFF] text-[#333333] rounded-[5px]", safeCurrentPage === 1 && "pointer-events-none opacity-50")} 
                            text="" 
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                          let pageNum = idx + 1;
                          if (totalPages > 5 && safeCurrentPage > 3) {
                             pageNum = safeCurrentPage - 2 + idx;
                             if (pageNum > totalPages) return null;
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                href="#" 
                                isActive={safeCurrentPage === pageNum}
                                onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                                className={cn(
                                  "rounded-[5px] text-[13px]",
                                  safeCurrentPage === pageNum
                                    ? "bg-[#F44A01] text-white border-transparent hover:bg-[#F44A01] hover:text-white"
                                    : "bg-[#FFFFFF] text-[#222222] border border-[#E8E8E8] hover:bg-[#F8F8F8]"
                                )}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        {totalPages > 5 && safeCurrentPage < totalPages - 2 && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis className="text-[#555555]" />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}
                                className="bg-[#FFFFFF] text-[#222222] border border-[#E8E8E8] hover:bg-[#F8F8F8] rounded-[5px] text-[13px]"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(safeCurrentPage + 1); }}
                            className={cn("border border-[#E8E8E8] bg-[#FFFFFF] text-[#333333] rounded-[5px]", safeCurrentPage === totalPages && "pointer-events-none opacity-50")} 
                            text="" 
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={showMobileFilters} onOpenChange={actions.setShowMobileFilters}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl p-0 flex flex-col gap-0 overflow-hidden bg-white" showCloseButton={false}>
          <SheetHeader className="px-5 py-4 border-b border-gray-100 bg-white z-10 flex flex-row items-center justify-between shadow-sm shrink-0">
            <SheetTitle className="text-[18px] font-bold text-[#171717]">Filters</SheetTitle>
            <div className="flex items-center gap-4">
              <button onClick={actions.resetFilters} className="text-[13px] font-semibold text-[#F44A01] hover:underline">Clear All</button>
              <button onClick={() => actions.setShowMobileFilters(false)} className="text-[#333333] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#FFFFFF]">
            {renderFilterContent()}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
            <button onClick={() => { actions.setShowMobileFilters(false); }} className="w-full h-[48px] bg-[#F44A01] text-white text-[14px] font-bold rounded-[8px] shadow-[0_2px_8px_rgba(244,74,1,0.2)] hover:bg-[#E94300] transition-colors uppercase tracking-wider">
              Show Results
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
