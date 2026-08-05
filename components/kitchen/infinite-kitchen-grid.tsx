"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { KitchensPageSkeleton, KitchenCardSkeleton } from "@/components/kitchen/kitchens-page-skeleton";
import { SlidersHorizontal, ChevronRight, Star as StarIcon, User, ShieldCheck } from "lucide-react";
import { KitchenFilters } from "@/components/kitchen/kitchen-filters";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { SortByDropdown } from "@/components/kitchen/sort-by-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { KitchenCard } from "@/components/kitchen/kitchen-card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
   const containerRef = useRef<HTMLDivElement>(null);
   const sentinelRef = useRef<HTMLDivElement>(null);

   const kitchens = useKitchensGridData();
   const categories = useKitchensGridCategories();
   const { hasNextPage, isFetchingNextPage, isLoading } = useKitchensGridPagination();
   const {
      selectedCategory,
      sortOption,
      vegFilter,
      selectedCuisines,
      minRating,
      maxPrepTime,
      mealType,
      topRatedOnly,
      newOnly,
      showMobileFilters,
   } = useKitchensGridFilters();
   const actions = useKitchensGridActions();

   const {
      fetchNextPage,
   } = useKitchensGridQuery(selectedCategory);

   useKitchensGridCategoriesQuery();

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
            k.cuisineTags?.some((tag) => selectedCuisines.includes(categories.find((c) => c.name === tag)?.id ?? ""))
         );
      }

      if (mealType) {
         result = result.filter((k) => k.timeSlots?.includes(mealType));
      }

      if (minRating !== null) {
         result = result.filter((k) => k.avgRating !== null && k.avgRating >= minRating);
      }

      if (maxPrepTime !== null) {
         result = result.filter((k) => k.estimatedPrepTime !== null && k.estimatedPrepTime <= maxPrepTime);
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
   }, [allKitchens, vegFilter, selectedCuisines, sortOption, categories, mealType, minRating, maxPrepTime, topRatedOnly, newOnly]);

   const mealTypeOptions = useMemo(() => {
      const keys = new Set<string>();
      for (const kitchen of allKitchens) {
         for (const slot of kitchen.timeSlots ?? []) keys.add(slot);
      }
      return ["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"]
         .filter((key) => keys.has(key) || allKitchens.length === 0)
         .map((key) => ({ key, label: MEAL_TYPE_LABELS[key] ?? key }));
   }, [allKitchens]);

   const [columns, setColumns] = useState(() => {
      if (typeof window === "undefined") return 1;
      if (window.innerWidth >= 1280) return 3; // xl: 3 columns
      if (window.innerWidth >= 1024) return 2; // lg: 2 columns
      if (window.innerWidth >= 768) return 2;  // md: 2 columns
      return 1; // mobile: 1 column
   });

   const [scrollMargin, setScrollMargin] = useState(0);

   useEffect(() => {
      const handler = () => {
         if (window.innerWidth >= 1280) setColumns(3);
         else if (window.innerWidth >= 768) setColumns(2);
         else setColumns(1);
      };
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
   }, []);

   useEffect(() => {
      if (containerRef.current) {
         setScrollMargin(containerRef.current.offsetTop);
      }
   }, [filteredKitchens]);

   const rowCount = Math.ceil(filteredKitchens.length / columns);

   const virtualizer = useWindowVirtualizer({
      count: rowCount,
      estimateSize: () => (columns === 1 ? 160 : 340), // Mobile rows are ~160px, Desktop rows are ~340px
      overscan: 3,
      scrollMargin,
   });

   const virtualRows = virtualizer.getVirtualItems();
   const totalHeight = virtualizer.getTotalSize();

   useEffect(() => {
      if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;
      const observer = new IntersectionObserver(
         (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
         { rootMargin: "400px" }
      );
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   const renderFilterContent = () => (
      <div className="space-y-7">
         {/* Meal Type */}
         <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3.5 flex justify-between items-center">Meal Type <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" /></h3>
            <div className="flex flex-col gap-3">
               {mealTypeOptions.map((option) => (
                  <div key={option.key} className="flex items-center gap-3">
                     <Checkbox
                        id={`meal-${option.key}`}
                        checked={mealType === option.key}
                        onCheckedChange={() => actions.setMealType(mealType === option.key ? null : option.key)}
                     />
                     <Label htmlFor={`meal-${option.key}`} className="text-[13px] font-medium text-gray-700 cursor-pointer hover:text-[#EE7005] transition-colors">{option.label}</Label>
                  </div>
               ))}
            </div>
         </div>

         {/* Cuisine */}
         <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3.5 flex justify-between items-center">Cuisine <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" /></h3>
            <div className="flex flex-col gap-3">
               {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-3">
                     <Checkbox
                        id={`cuisine-${category.id}`}
                        checked={selectedCuisines.includes(category.id)}
                        onCheckedChange={() => actions.toggleCuisine(category.id)}
                     />
                     <Label htmlFor={`cuisine-${category.id}`} className="text-[13px] font-medium text-gray-700 cursor-pointer hover:text-[#EE7005] transition-colors">{category.name}</Label>
                  </div>
               ))}
            </div>
         </div>

         {/* Diet Preference */}
         <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3.5 flex justify-between items-center">Diet Preference <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" /></h3>
            <RadioGroup value={vegFilter ?? "none"} onValueChange={(value) => actions.setVegFilter(value === "none" ? null : (value as VegFilterValue))}>
               <div className="flex flex-col gap-3">
                  {["Pure Veg", "Veg", "Non Veg"].map((label, idx) => {
                     const value = idx === 0 ? "pure-veg" : idx === 1 ? "veg" : "non-veg";
                     return (
                        <div key={label} className="flex items-center gap-3">
                           <RadioGroupItem value={value} id={`diet-${value}`} />
                           <Label htmlFor={`diet-${value}`} className="text-[13px] font-medium text-gray-700 cursor-pointer hover:text-[#EE7005] transition-colors">{label}</Label>
                        </div>
                     );
                  })}
               </div>
            </RadioGroup>
         </div>

         {/* Ratings */}
         <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3.5 flex justify-between items-center">Ratings <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" /></h3>
            <RadioGroup value={minRating !== null ? String(minRating) : "any"} onValueChange={(value) => actions.setMinRating(value === "any" ? null : Number(value))}>
               <div className="flex flex-col gap-3">
                  {[
                     { label: "4.5 & above", stars: 5, value: "4.5" },
                     { label: "4.0 & above", stars: 4, value: "4.0" },
                     { label: "3.5 & above", stars: 3, value: "3.5" },
                     { label: "3.0 & above", stars: 3, value: "3.0" },
                  ].map((item) => (
                     <div key={item.value} className="flex items-center gap-3">
                        <RadioGroupItem value={item.value} id={`rating-${item.value}`} />
                        <Label htmlFor={`rating-${item.value}`} className="flex items-center gap-2 cursor-pointer group">
                           <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, j) => (
                                 <StarIcon key={j} className={cn("h-3.5 w-3.5", j < item.stars ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200")} />
                              ))}
                           </div>
                           <span className="text-[12px] font-medium text-gray-600 group-hover:text-[#EE7005] transition-colors">{item.label}</span>
                        </Label>
                     </div>
                  ))}
               </div>
            </RadioGroup>
         </div>

         {/* Delivery Time */}
         <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3.5 flex justify-between items-center">Delivery Time <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" /></h3>
            <RadioGroup value={maxPrepTime !== null ? String(maxPrepTime) : "any"} onValueChange={(value) => actions.setMaxPrepTime(value === "any" ? null : Number(value))}>
               <div className="flex flex-col gap-3">
                  {[
                     { label: "25 mins or less", value: "25" },
                     { label: "40 mins or less", value: "40" },
                     { label: "60 mins or less", value: "60" },
                  ].map((option) => (
                     <div key={option.value} className="flex items-center gap-3">
                        <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                        <Label htmlFor={`time-${option.value}`} className="text-[13px] font-medium text-gray-700 cursor-pointer hover:text-[#EE7005] transition-colors">{option.label}</Label>
                     </div>
                  ))}
               </div>
            </RadioGroup>
         </div>

         <button onClick={() => { actions.resetFilters(); actions.setShowMobileFilters(false); }} className="w-full py-3.5 bg-[#EE7005] text-white text-[13px] font-black uppercase tracking-wider rounded-lg shadow-sm hover:bg-[#d66504] transition-colors mt-6">
            RESET FILTERS
         </button>
      </div>
   );

   const renderContent = () => {
      if (isLoading) {
         return <KitchensPageSkeleton />;
      }

      if (filteredKitchens.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <h3 className="text-xl font-bold text-gray-900 mb-2">No Kitchens Found</h3>
               <p className="text-gray-500 max-w-md">Try adjusting your filters or search criteria to find what you&apos;re looking for.</p>
               <button onClick={actions.resetFilters} className="mt-6 px-6 py-2 bg-[#EE7005] text-white font-bold rounded-lg hover:bg-[#d66504]">
                  Clear All Filters
               </button>
            </div>
         );
      }

      return (
         <div ref={containerRef} className="relative" style={{ height: totalHeight }}>
            {virtualRows.map((virtualRow) => {
               const rowIndex = virtualRow.index;
               const startIdx = rowIndex * columns;
               const rowKitchens = filteredKitchens.slice(startIdx, startIdx + columns);

               return (
                  <div
                     key={virtualRow.key}
                     data-index={virtualRow.index}
                     ref={virtualizer.measureElement}
                     className="absolute left-0 right-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 md:gap-6"
                     style={{ transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)` }}
                  >
                     {rowKitchens.map((kitchen) => (
                        <KitchenCard key={kitchen.id} kitchen={kitchen} variant="page" />
                     ))}
                  </div>
               );
            })}
         </div>
      );
   };

   return (
      <div className="bg-[#fcfbf9] min-h-screen pt-4 md:pt-6 pb-20">
         <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-500 mb-6">
               <Link href="/" className="hover:text-[#EE7005]">Home</Link>
               <ChevronRight className="h-3.5 w-3.5" />
               <span className="text-[#EE7005]">Kitchens</span>
            </div>

            {/* Page Header */}
            <div className="mb-8">
               <h1 className="text-[32px] md:text-[40px] font-black text-[#0A3D24] mb-2 leading-tight">Kitchens</h1>
               <p className="text-[15px] font-medium text-gray-600">
                  Discover amazing home chefs and pre-book delicious homemade meals.
               </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

               {/* Desktop Sidebar */}
               <aside className="hidden lg:block w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl p-5 sticky top-24 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                     <h2 className="text-[16px] font-black text-[#0A3D24]">Filters</h2>
                     <button onClick={actions.resetFilters} className="text-[13px] font-bold text-[#EE7005] hover:underline">Clear All</button>
                  </div>

                  {renderFilterContent()}
               </aside>

               {/* Main Content */}
               <main className="flex-1 min-w-0">

                  <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                     {/* Quick Filters */}
                     <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 w-[calc(100%+32px)] sm:w-auto lg:flex-1">
                        <button
                           onClick={() => actions.setVegFilter(null)}
                           className={cn(
                              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                              vegFilter === null ? "bg-[#fff6f0] border-[#EE7005] text-[#EE7005]" : "bg-white border-gray-200 text-gray-700 hover:border-[#EE7005] hover:text-[#EE7005]"
                           )}
                        >
                           <User className="h-4 w-4" /> All Kitchens
                        </button>
                        <button
                           onClick={() => actions.setVegFilter("pure-veg")}
                           className={cn(
                              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                              vegFilter === "pure-veg" ? "bg-[#e8f5ed] border-[#168846] text-gray-900" : "bg-white border-gray-200 text-gray-900 hover:border-[#168846]"
                           )}
                        >
                           <div className="flex items-center justify-center w-4 h-4 text-[#168846] rounded-full">
                              <ShieldCheck className="w-4 h-4" />
                           </div>
                           Pure Veg
                        </button>
                        <button
                           onClick={() => actions.setVegFilter("veg")}
                           className={cn(
                              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                              vegFilter === "veg" ? "bg-[#e8f5ed] border-[#168846] text-gray-900" : "bg-white border-gray-200 text-gray-900 hover:border-[#168846]"
                           )}
                        >
                           <div className="h-3.5 w-3.5 rounded-[3px] border border-[#168846] flex items-center justify-center p-[1px]">
                              <div className="h-2 w-2 rounded-full bg-[#168846]" />
                           </div>
                           Veg
                        </button>
                        <button
                           onClick={() => actions.setVegFilter("non-veg")}
                           className={cn(
                              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                              vegFilter === "non-veg" ? "bg-[#fef2f2] border-[#dc2626] text-gray-900" : "bg-white border-gray-200 text-gray-900 hover:border-[#dc2626]"
                           )}
                        >
                           <div className="h-3.5 w-3.5 rounded-[3px] border border-[#dc2626] flex items-center justify-center p-[1px]">
                              <div className="h-2 w-2 rounded-full bg-[#dc2626]" />
                           </div>
                           Non Veg
                        </button>

                        {/* Standard filters for Desktop */}
                        <div className="hidden lg:flex items-center gap-2.5">
                           <button
                              onClick={actions.toggleTopRated}
                              className={cn(
                                 "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                                 topRatedOnly ? "bg-[#fff6f0] border-[#F59E0B] text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:border-[#F59E0B]"
                              )}
                           >
                              <StarIcon className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" /> Top Rated
                           </button>
                           <button
                              onClick={actions.toggleNewOnly}
                              className={cn(
                                 "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm",
                                 newOnly ? "bg-[#f5f3ff] border-[#8b5cf6] text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:border-[#8b5cf6]"
                              )}
                           >
                              <div className="flex items-center justify-center h-4 w-4 bg-[#8b5cf6] text-white rounded-full text-[8px] font-black leading-none">NEW</div> New
                           </button>
                        </div>

                        {/* Mobile 'More' Button */}
                        <button onClick={() => actions.setShowMobileFilters(true)} className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border bg-white border-gray-200 text-gray-900 hover:border-gray-300 text-[13px] font-bold transition-colors whitespace-nowrap shadow-sm">
                           <div className="flex gap-[2px] items-center justify-center h-4 w-4 text-[#8b5cf6]">
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <div className="w-1 h-1 rounded-full bg-current" />
                           </div>
                           More
                           <ChevronRight className="h-3.5 w-3.5 text-gray-500 rotate-90 ml-1" />
                        </button>
                     </div>
                  </div>

                  {/* Secondary Mobile Filter Row (Filters & Sort By) */}
                  <div className="lg:hidden mb-6 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                     <button
                        onClick={() => actions.setShowMobileFilters(!showMobileFilters)}
                        className="flex items-center gap-2 text-[14px] font-bold text-gray-900 hover:text-[#EE7005] transition-colors"
                     >
                        <SlidersHorizontal className="h-4 w-4 text-[#EE7005]" /> Filters
                     </button>

                     <div className="h-5 w-px bg-gray-200" />

                     <div className="flex items-center gap-2 text-[13px]">
                        <span className="text-gray-500 font-medium">Sort by:</span>
                        <div className="flex items-center font-bold text-gray-900">
                           <SortByDropdown value={sortOption} onValueChange={actions.setSortOption} variant="mobile" />
                        </div>
                     </div>
                  </div>

                  {/* Showing Text */}
                  <div className="mb-4">
                     <p className="text-[14px] font-bold text-gray-800">
                        Showing {filteredKitchens.length} Kitchen{filteredKitchens.length === 1 ? "" : "s"}
                     </p>
                  </div>

                  {/* Mobile Filters Sheet */}
                  <Sheet open={showMobileFilters} onOpenChange={actions.setShowMobileFilters}>
                     <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col gap-0 overflow-hidden bg-white" showCloseButton={false}>
                        <SheetHeader className="px-5 py-4 border-b border-gray-100 bg-white z-10 flex flex-row items-center justify-between shadow-sm">
                           <SheetTitle className="text-[18px] font-black text-[#0A3D24]">Filters</SheetTitle>
                           <button onClick={actions.resetFilters} className="text-[13px] font-bold text-[#EE7005] hover:underline">Clear All</button>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#fdfbf9]">
                           {renderFilterContent()}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white z-10">
                           <button onClick={() => actions.setShowMobileFilters(false)} className="w-full py-3.5 bg-[#168846] text-white text-[14px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                              Show Results
                           </button>
                        </div>
                     </SheetContent>
                  </Sheet>

                  {renderContent()}

                  {/* Pagination Skeleton */}
                  {isFetchingNextPage && (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                           <KitchenCardSkeleton key={i} />
                        ))}
                     </div>
                  )}
                  <div ref={sentinelRef} className="h-px" aria-hidden />
               </main>
            </div>
         </div>
      </div>
   );
}
