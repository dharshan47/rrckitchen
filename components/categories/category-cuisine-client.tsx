"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Filter,
  ChevronDown,
  ChefHat,
  ShieldCheck,
  Leaf,
  Heart,
  Users,
  Clock,
  Star,
  Tag,
  Info,
  TrendingUp,
  HelpCircle,
  Loader2,
  RotateCcw,
  MapPin,
  CheckCircle2,
  ChevronUp,
} from "lucide-react";
import { KitchenCard } from "@/components/kitchen/kitchen-card";
import type { KitchenData } from "@/hooks/useExploreKitchens";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCategoryPageBundle } from "@/actions/catalog/category-page";
import type { PublicCategoryBundle } from "@/actions/catalog/category-page";
import {
  useCategoryFilters,
  CATEGORY_SORT_OPTIONS,
  type CategorySort,
} from "@/stores/categoryPageStore";

const FEATURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat,
  ShieldCheck,
  Leaf,
  Heart,
  Users,
  Clock,
  Star,
  Tag,
  Info,
  TrendingUp,
  HelpCircle,
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  MORNING: "Breakfast",
  LUNCH: "Lunch",
  EVENINGSNACKS: "Evening Snacks",
  DINNER: "Dinner",
};

function kitchenMealTypes(kitchen: PublicCategoryBundle["kitchens"][number]): string[] {
  return [...new Set(kitchen.timeSlots.map((s) => MEAL_TYPE_LABELS[s]).filter(Boolean))];
}

function kitchenMatchesFoodType(kitchen: PublicCategoryBundle["kitchens"][number], value: string): boolean {
  const hasItems = kitchen.items.length > 0;
  const hasVeg = kitchen.items.some((i) => i.foodType === "VEG");
  const hasNonVeg = kitchen.items.some((i) => i.foodType === "NONVEG");
  if (value === "Pure Veg") return hasItems && hasVeg && !hasNonVeg;
  if (value === "Veg") return hasVeg;
  if (value === "Non Veg") return hasNonVeg;
  return true;
}

function kitchenDeliveryTime(kitchen: PublicCategoryBundle["kitchens"][number], value: string): boolean {
  const m = kitchen.estimatedPrepTime;
  if (m === null) return false;
  if (value === "25") return m <= 25;
  if (value === "25-40") return m > 25 && m <= 40;
  if (value === "40-60") return m > 40 && m <= 60;
  if (value === "60+") return m > 60;
  return false;
}

/* ===================================================================
   SKELETON — exact page shape with animation
   =================================================================== */
function CategoryPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#FDF9F6] pb-16 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative z-10 overflow-hidden md:rounded-[24px] bg-[#FDF9F6]">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-3/5 py-6 md:py-12 md:pr-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-52 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full max-w-xl mt-5 rounded-md" />
              <Skeleton className="h-4 w-3/4 mt-2 rounded-md" />
            </div>
            <div className="w-full md:w-2/5">
              <Skeleton className="h-50 md:h-75 w-full rounded-r-[24px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 flex gap-8">
        <aside className="hidden lg:block w-65 shrink-0">
          <div className="sticky top-24 bg-[#FFFFFF] rounded-[8px] shadow-[0_2px_8px_rgba(35,25,20,0.04)] border border-[#EEE7E2] p-5 space-y-5">
            <Skeleton className="h-5 w-20 rounded-md" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
            ))}
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-64 mb-4 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-[10px] border border-[#EEE7E2] overflow-hidden shadow-[0_2px_8px_rgba(35,25,20,0.05)]">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/3 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===================================================================
   FILTER PANEL — real facets from backend data
   =================================================================== */
interface CheckRowProps {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}

function CheckRow({ label, count, checked, onToggle }: CheckRowProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="border-[#FF7A52] data-[state=checked]:bg-[#FF4B00] data-[state=checked]:border-[#FF4B00] data-[state=checked]:text-white cursor-pointer"
      />
      <span className={`text-[13px] font-semibold ${checked ? "text-[#FF4B00]" : "text-gray-600 group-hover:text-[#222222]"}`}>
        {label}
      </span>
      {typeof count === "number" && (
        <span className="ml-auto text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </label>
  );
}

function RadioRow({ label, count, checked, onToggle }: CheckRowProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={onToggle}
        className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
          checked ? "border-2 border-[#FF4B00]" : "border border-[#FF6F48] bg-[#FFFFFF]"
        }`}
      >
        {checked && <div className="h-2 w-2 rounded-full bg-[#FF4B00]" />}
      </div>
      <span
        onClick={onToggle}
        className={`text-[13px] font-semibold ${
          checked ? "text-[#FF4B00]" : "text-gray-600 group-hover:text-[#222222]"
        }`}
      >
        {label}
      </span>
      {typeof count === "number" && (
        <span className="ml-auto text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </label>
  );
}

interface FilterPanelProps {
  data: PublicCategoryBundle;
  onApply?: () => void;
}

function FilterPanel({ data, onApply }: FilterPanelProps) {
  const filters = useCategoryFilters();
  const { facets } = data;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mealTypes: true,
    foodTypes: true,
    deliveryTimes: false,
    ratings: false,
    cuisines: false,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const filterCount =
    filters.mealTypes.length +
    filters.foodTypes.length +
    filters.cuisines.length +
    (filters.deliveryTime ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  return (
    <div className="sticky top-24 bg-[#FFFFFF] rounded-[8px] shadow-[0_2px_8px_rgba(35,25,20,0.04)] border border-[#EEE7E2] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-[18px] text-[#00512F]">Filters</h3>
        {filterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={filters.clearFilters}
            className="h-7 px-2 text-[12px] font-bold text-[#FF4B00] hover:text-[#E94300] hover:bg-[#FFF1EB] flex items-center gap-1"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Meal Type */}
      {facets.mealTypes.length > 0 && (
        <div className="mb-6 animate-in fade-in duration-300">
          <h4
            className="font-bold text-[14px] text-[#222222] flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => toggleSection("mealTypes")}
          >
            Meal Type{" "}
            {openSections.mealTypes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </h4>
          {openSections.mealTypes && (
            <div className="space-y-2.5">
              {facets.mealTypes.map((option) => (
                <CheckRow
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  checked={filters.mealTypes.includes(option.value)}
                  onToggle={() => filters.toggleMealType(option.value)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Veg Preference */}
      {facets.foodTypes.length > 0 && (
        <div className="mb-6 animate-in fade-in duration-300" style={{ animationDelay: "60ms" }}>
          <h4
            className="font-bold text-[14px] text-[#222222] flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => toggleSection("foodTypes")}
          >
            Veg Preference{" "}
            {openSections.foodTypes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </h4>
          {openSections.foodTypes && (
            <div className="space-y-2.5">
              {/* Option to clear this filter - visually 'All' */}
              <RadioRow
                label="All"
                checked={filters.foodTypes.length === 0}
                onToggle={() => {
                  filters.foodTypes.forEach((ft) => filters.toggleFoodType(ft));
                }}
              />
              {facets.foodTypes.map((option) => (
                <RadioRow
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  checked={filters.foodTypes.includes(option.value)}
                  onToggle={() => {
                    // Make it act like a radio button by clearing others
                    filters.foodTypes.forEach((ft) => {
                      if (ft !== option.value) filters.toggleFoodType(ft);
                    });
                    if (!filters.foodTypes.includes(option.value)) {
                      filters.toggleFoodType(option.value);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cuisines */}
      {facets.cuisines.length > 1 && (
        <div className="mb-6 animate-in fade-in duration-300" style={{ animationDelay: "120ms" }}>
          <h4
            className="font-bold text-[14px] text-[#222222] flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => toggleSection("cuisines")}
          >
            Cuisine{" "}
            {openSections.cuisines ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </h4>
          {openSections.cuisines && (
            <div className="space-y-2.5">
              {facets.cuisines.map((option) => (
                <CheckRow
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  checked={filters.cuisines.includes(option.value)}
                  onToggle={() => filters.toggleCuisine(option.value)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Time */}
      {facets.deliveryTimes.length > 0 && (
        <div className="mb-6 animate-in fade-in duration-300" style={{ animationDelay: "180ms" }}>
          <h4
            className="font-bold text-[14px] text-[#222222] flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => toggleSection("deliveryTimes")}
          >
            Delivery Time{" "}
            {openSections.deliveryTimes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </h4>
          {openSections.deliveryTimes && (
            <div className="space-y-2.5">
              {facets.deliveryTimes.map((option) => (
                <CheckRow
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  checked={filters.deliveryTime === option.value}
                  onToggle={() =>
                    filters.setDeliveryTime(
                      filters.deliveryTime === option.value ? null : option.value
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      {facets.ratings.length > 0 && (
        <div className="mb-6 animate-in fade-in duration-300" style={{ animationDelay: "240ms" }}>
          <h4
            className="font-bold text-[14px] text-[#222222] flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => toggleSection("ratings")}
          >
            Rating{" "}
            {openSections.ratings ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </h4>
          {openSections.ratings && (
            <div className="space-y-2.5">
              {facets.ratings.map((option) => (
                <CheckRow
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  checked={filters.minRating === Number(option.value)}
                  onToggle={() =>
                    filters.setMinRating(
                      filters.minRating === Number(option.value) ? null : Number(option.value)
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full mt-2 h-[32px] bg-[#FF4B00] hover:bg-[#E94300] text-[#FFFFFF] font-[700] rounded-[5px] shadow-none uppercase tracking-wide text-[13px]"
        onClick={onApply}
      >
        Apply Filters
      </Button>
    </div>
  );
}

/* ===================================================================
   MAIN CLIENT — real data, real filters, live from backend
   =================================================================== */
interface Props {
  categoryName: string;
}

export function CategoryCuisineClient({ categoryName }: Props) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const slug = useMemo(
    () => categoryName.toLowerCase().trim().replace(/\s+/g, "-"),
    [categoryName]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<PublicCategoryBundle>({
    queryKey: ["category-page-bundle", slug],
    queryFn: () => getCategoryPageBundle(slug),
    enabled: !!slug,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const filters = useCategoryFilters();
  const content = data?.content ?? null;
  const kitchens = useMemo(() => data?.kitchens ?? [], [data?.kitchens]);

  const displayName = useMemo(
    () =>
      content?.title ||
      data?.categoryName ||
      categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    [content?.title, data?.categoryName, categoryName]
  );

  const heroImage = useMemo(
    () =>
      content?.desktopBannerUrl ||
      content?.mobileBannerUrl ||
      kitchens.find((k) => k.imageUrl)?.imageUrl ||
      null,
    [content?.desktopBannerUrl, content?.mobileBannerUrl, kitchens]
  );

  const enabledFeatures = useMemo(
    () => (content?.features ?? []).filter((f) => f.isEnabled),
    [content?.features]
  );
  const enabledOffers = useMemo(
    () => (content?.offers ?? []).filter((o) => o.isEnabled),
    [content?.offers]
  );
  const faqs = useMemo(() => content?.faqs ?? [], [content?.faqs]);
  const heroLayout = useMemo(() => content?.heroLayout ?? "LEFT_TEXT", [content?.heroLayout]);
  const isCenter = heroLayout === "CENTER_TEXT";
  const isRight = heroLayout === "RIGHT_TEXT";
  const isFullWidth = heroLayout === "FULL_WIDTH";

  const matchesFilters = useCallback(
    (kitchen: PublicCategoryBundle["kitchens"][number]): boolean => {
      if (filters.mealTypes.length > 0) {
        const mealTypes = kitchenMealTypes(kitchen);
        if (!filters.mealTypes.some((m) => mealTypes.includes(m))) return false;
      }
      if (filters.foodTypes.length > 0) {
        if (!filters.foodTypes.some((f) => kitchenMatchesFoodType(kitchen, f))) return false;
      }
      if (filters.cuisines.length > 0) {
        if (!filters.cuisines.some((c) => kitchen.cuisineTags.includes(c))) return false;
      }
      if (filters.deliveryTime) {
        if (!kitchenDeliveryTime(kitchen, filters.deliveryTime)) return false;
      }
      if (filters.minRating !== null) {
        if (kitchen.avgRating === null || kitchen.avgRating < filters.minRating) return false;
      }
      return true;
    },
    [filters]
  );

  const filteredKitchens = useMemo(() => {
    let list = kitchens.filter(matchesFilters);

    switch (filters.sortBy) {
      case "Popularity":
        list = [...list].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0) || b.totalReviews - a.totalReviews);
        break;
      case "Rating":
        list = [...list].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
        break;
      case "Newest":
        break;
      case "Price Low": {
        const avgPrice = (k: PublicCategoryBundle["kitchens"][number]) =>
          k.items.length ? k.items.reduce((s, i) => s + i.price, 0) / k.items.length : Infinity;
        list = [...list].sort((a, b) => avgPrice(a) - avgPrice(b));
        break;
      }
      case "Price High": {
        const avgPrice = (k: PublicCategoryBundle["kitchens"][number]) =>
          k.items.length ? k.items.reduce((s, i) => s + i.price, 0) / k.items.length : -Infinity;
        list = [...list].sort((a, b) => avgPrice(b) - avgPrice(a));
        break;
      }
      case "Recommended":
        list = [...list].sort(
          (a, b) => (b.avgRating ?? 0) * (b.totalReviews + 1) - (a.avgRating ?? 0) * (a.totalReviews + 1)
        );
        break;
    }
    return list;
  }, [kitchens, filters, matchesFilters]);

  const visibleKitchens = useMemo(
    () => filteredKitchens.slice(0, filters.visibleCount),
    [filteredKitchens, filters.visibleCount]
  );
  const hasMore = useMemo(
    () => filteredKitchens.length > filters.visibleCount,
    [filteredKitchens, filters.visibleCount]
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleSortChange = useCallback(
    (value: string) => {
      filters.setSortBy(value as CategorySort);
    },
    [filters]
  );

  const handleCloseMobileFilters = useCallback(() => setShowMobileFilters(false), []);

  if (isLoading && !data) {
    return <CategoryPageSkeleton />;
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#FDF9F6] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300">
          <RotateCcw className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-bold text-[15px]">Failed to load this category</p>
          <p className="text-[13px] text-gray-500">Please check your connection and try again.</p>
          <Button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-[#FF4B00] hover:bg-[#E94300] text-white rounded-xl text-[14px] font-black shadow-md shadow-[#FF4B00]/20"
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  if (!data) {
    return <CategoryPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#FDF9F6] text-foreground font-sans pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-[12px] font-bold text-[#222222] animate-in fade-in duration-300">
        <Link href="/" className="hover:text-[#FF4B00] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <Link href="/categories" className="hover:text-[#FF4B00] transition-colors">
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-500">{displayName}</span>
      </div>

      {/* Hero Section */}
      {content?.showHero !== false && (
        <div
          className={`max-w-7xl mx-auto px-4 md:px-8 relative z-10 overflow-hidden md:rounded-[24px] bg-[#FDF9F6] animate-in fade-in duration-500 ${
            isFullWidth ? "md:rounded-none" : ""
          }`}
        >
          <div className={`flex ${isFullWidth ? "flex-col" : `flex-col md:flex-row ${isRight ? "md:flex-row-reverse" : ""}`} items-center`}>
            <div
              className={`w-full ${isFullWidth ? "" : "md:w-3/5"} py-6 md:py-12 md:pr-8 flex flex-col ${
                isCenter ? "items-center text-center" : isRight ? "items-center md:items-end text-center md:text-right" : "items-center md:items-start text-center md:text-left"
              }`}
            >
              <div className={`flex ${isCenter ? "flex-col" : "flex-col md:flex-row"} items-center gap-4`}>
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#00512F] flex items-center justify-center shrink-0 shadow-md overflow-hidden relative">
                  {content?.iconUrl ? (
                    <Image src={content.iconUrl} alt={displayName} fill className="object-cover" unoptimized />
                  ) : (
                    <ChefHat className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  )}
                </div>
                <div>
                  <div className={`flex items-center gap-3 ${isCenter ? "justify-center flex-col" : isRight ? "justify-center md:justify-end" : "justify-center md:justify-start"}`}>
                    <h1 className="text-3xl md:text-[42px] font-black text-[#00512F] leading-tight">
                      {displayName}
                    </h1>
                    {(content?.badgeText || data?.totalCount !== undefined) && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-[6px] border-[#FF6A43] text-[#FF4B00] text-[12px] font-bold shrink-0 bg-[#FFFFFF] shadow-sm animate-in zoom-in duration-300"
                      >
                        {content?.badgeText || `${data?.totalCount ?? 0}+ Kitchens`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {content?.description && (
                <p
                  className={`mt-4 text-[13px] md:text-[15px] font-bold text-gray-600 leading-relaxed ${
                    isFullWidth ? "max-w-3xl" : "max-w-xl"
                  } animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  {content.description}
                </p>
              )}
            </div>
            {/* Hero Image */}
            <div
              className={`w-full ${isFullWidth ? "h-64 md:h-96 relative" : "md:w-2/5 h-50 md:h-75 relative mt-4 md:mt-0 overflow-hidden md:rounded-r-[24px]"} ${
                isRight ? "md:rounded-l-[24px] md:rounded-r-none" : ""
              }`}
            >
              {!isFullWidth && (
                <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-linear-to-r from-[#fdfbf7] to-transparent z-10" />
              )}
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={displayName}
                  fill
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-[#00512F] to-[#146c43] flex flex-col items-center justify-center gap-2">
                  <ChefHat className="h-12 w-12 text-white/70" />
                  <span className="text-[12px] font-bold text-white/70">
                    {displayName} from home kitchens
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Strip */}
      {enabledFeatures.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:mt-6">
          <div
            className={`bg-[#FFFFFF] rounded-[9px] shadow-[0_2px_8px_rgba(35,25,20,0.04)] border border-[#EEE7E2] py-4 px-2 md:px-6 grid gap-4 md:gap-8 divide-x divide-[#EEE7E2] animate-in fade-in slide-in-from-top-2 duration-500 ${
              enabledFeatures.length === 3
                ? "grid-cols-3"
                : enabledFeatures.length <= 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {enabledFeatures.slice(0, 6).map((feature, i) => {
              const Icon = FEATURE_ICON_MAP[feature.icon] ?? ChefHat;
              return (
                <div
                  key={feature.title + i}
                  className="flex flex-col items-center text-center px-2 animate-in fade-in slide-in-from-bottom-2 duration-300 group hover:-translate-y-1 transition-transform"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <Icon className={`h-6 w-6 ${feature.color} mb-1.5 group-hover:scale-110 transition-transform duration-300`} />
                  <span className="text-[12px] md:text-[14px] font-black text-[#222222]">{feature.title}</span>
                  {feature.subtitle && (
                    <span className="text-[10px] md:text-[12px] font-medium text-gray-500 mt-0.5">
                      {feature.subtitle}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Offers Strip */}
      {enabledOffers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {enabledOffers.map((offer, i) => (
              <div
                key={offer.title + i}
                className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4 md:p-5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-[#FF4B00] text-white rounded-full p-2.5 shrink-0 shadow-sm shadow-[#FF4B00]/30">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  {offer.badge && (
                    <span className="inline-block px-2 py-0.5 bg-[#FF4B00] text-white rounded-full text-[10px] font-black tracking-wide mb-1">
                      {offer.badge}
                    </span>
                  )}
                  <h3 className="text-[14px] font-black text-[#00512F] truncate">{offer.title}</h3>
                  <p className="text-[11px] font-semibold text-gray-500 truncate">{offer.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-65 shrink-0">
          <FilterPanel data={data} />
        </aside>

        {/* Kitchens Grid */}
        <div className="flex-1 min-w-0">
          {/* Top Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            {/* Mobile Filters Trigger */}
            <div className="lg:hidden flex gap-2">
              <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-white border-gray-200 rounded-xl text-[14px] font-bold text-gray-700 shadow-sm"
                  >
                    <Filter className="h-4 w-4 text-[#FF4B00]" /> Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex-1 min-h-0 pr-3 pb-4">
                    <div className="pt-4">
                      <FilterPanel data={data} onApply={handleCloseMobileFilters} />
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <div className="flex-1 flex items-center justify-between px-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                <span className="text-[13px] font-bold text-gray-500">Sort by:</span>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="h-9 border-0 bg-transparent shadow-none text-[14px] font-bold text-[#222222] pl-1 pr-1 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-bold text-[#222222]">
                  Showing {visibleKitchens.length} of {filteredKitchens.length} Kitchens
                  {isFetching && !isLoading && (
                    <Loader2 className="inline h-3.5 w-3.5 ml-2 text-[#FF4B00] animate-spin" />
                  )}
                </p>
                <span className="hidden xl:inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400">
                  <MapPin className="h-3.5 w-3.5" /> Home kitchens near you
                </span>
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    isFetching
                      ? "text-[#FF4B00] bg-[#FFF1EB] border-orange-200"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <CheckCircle2 className={`h-3 w-3 ${isFetching ? "animate-pulse" : ""}`} />
                  {isFetching ? "SYNCING" : "LIVE"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-gray-600">Sort by:</span>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] h-10 bg-[#FFFFFF] border-[#E9E2DD] rounded-[6px] text-[14px] font-bold text-[#222222] hover:border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile counts */}
            <p className="lg:hidden text-[13px] font-bold text-gray-600 pt-1">
              Showing {visibleKitchens.length} of {filteredKitchens.length} Kitchens
            </p>
          </div>

          {/* Grid */}
          {filteredKitchens.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mt-4 animate-in fade-in duration-300">
              <div className="mx-auto h-14 w-14 rounded-full bg-[#FFF1EB] flex items-center justify-center mb-3">
                <Filter className="h-6 w-6 text-[#FF4B00]" />
              </div>
              <p className="text-[15px] font-bold text-gray-700">No kitchens match your filters</p>
              <p className="text-[13px] text-gray-500 mt-1">Try clearing a few filters to see more kitchens.</p>
              <Button
                onClick={filters.clearFilters}
                className="mt-4 px-4 py-2 bg-[#FF4B00] hover:bg-[#E94300] text-white rounded-xl text-[13px] font-black shadow-sm shadow-[#FF4B00]/20"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {visibleKitchens.map((kitchen, i) => (
                  <div
                    key={kitchen.id}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                    style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}
                  >
                    <KitchenCard
                      kitchen={kitchen as unknown as KitchenData}
                      variant="page"
                    />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={filters.loadMore}
                    className="px-8 py-3 bg-white border-2 border-[#FF4B00] text-[#FF4B00] rounded-xl text-[14px] font-black shadow-sm hover:bg-[#FF4B00] hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-[#FF4B00]/20"
                  >
                    Load More Kitchens ({filteredKitchens.length - visibleKitchens.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 animate-in fade-in duration-500">
          <div className="bg-white rounded-2xl md:rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#00512F] rounded-full p-2 text-white">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#00512F]">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FaqItem key={faq.question + i} question={faq.question} answer={faq.answer} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div
      className="border border-gray-100 rounded-xl overflow-hidden bg-[#FDF9F6]/60 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Button
        variant="ghost"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-auto flex items-center justify-between gap-4 px-4 md:px-5 py-4 text-left"
      >
        <span className="text-[14px] md:text-[15px] font-black text-[#00512F]">{question}</span>
        <span
          className={`shrink-0 h-7 w-7 rounded-full bg-[#FF4B00]/10 text-[#FF4B00] flex items-center justify-center transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </Button>
      {open && (
        <div className="px-4 md:px-5 pb-4 text-[13px] md:text-[14px] font-semibold text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-300">
          {answer}
        </div>
      )}
    </div>
  );
}
