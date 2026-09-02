"use client"

import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Search, SlidersHorizontal, Heart, ShieldCheck, Leaf, Star, Truck, UserRound, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeChefsSkeleton } from "@/components/home-chefs/home-chefs-skeleton";
import type { KitchenData } from "@/hooks/useExploreKitchens";

const STAR_RATING = [1, 2, 3, 4, 5];

const heroHighlights = [
  { icon: Heart, iconBg: "bg-[#FFF7ED]", iconColor: "text-[#EA580C]", title: "Made with Love", desc: "Homemade with care" },
  { icon: ShieldCheck, iconBg: "bg-[#F0FDF4]", iconColor: "text-[#166534]", title: "Hygienic & Safe", desc: "Verified home kitchens" },
  { icon: Leaf, iconBg: "bg-[#F0FDF4]", iconColor: "text-[#166534]", title: "Support Local", desc: "Empower homemakers" },
];

import {
  useHomeChefsFilters,
  useHomeChefsActions,
  useHomeChefsQuery,
  type CuisineFilter,
  type MealFilter,
  type SlotFilter,
  type RatingFilter,
  type SortOption
} from "@/stores/homeChefsStore";

export function HomeChefsClient() {
  const { search, cuisine, mealType, availability, rating, sort } = useHomeChefsFilters();
  const { setSearch, setCuisine, setMealType, setAvailability, setRating, setSort, resetFilters } = useHomeChefsActions();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useHomeChefsQuery();

  const chefs = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages.flatMap((page) => page.data) ?? []).filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    chefs?.forEach((c) => c.cuisineTags.forEach((tag) => set.add(tag)));
    return [...set].sort();
  }, [chefs]);

  const filteredChefs = useMemo(() => {
    if (!chefs) return [];
    const term = search.trim().toLowerCase();
    return chefs.filter((c) => {
      if (term) {
        const haystack = `${c.displayName} ${c.cuisineTags.join(" ")}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (cuisine !== "all" && !c.cuisineTags.some((t) => t === cuisine)) return false;
      if (mealType !== "all") {
        const hasVeg = c.items.some((i) => i.foodType === "VEG");
        const hasNonVeg = c.items.some((i) => i.foodType === "NONVEG");
        if (mealType === "veg" && !hasVeg) return false;
        if (mealType === "non-veg" && !hasNonVeg) return false;
      }
      if (availability !== "all" && !c.timeSlots.includes(availability)) return false;
      if (rating === "4+" && (c.avgRating ?? 0) < 4) return false;
      return true;
    });
  }, [chefs, search, cuisine, mealType, availability, rating]);

  const sortedChefs = useMemo(() => {
    const list = [...filteredChefs];
    if (sort === "rating") {
      list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    }
    return list;
  }, [filteredChefs, sort]);

  const [colCount, setColCount] = useState(1);
  useEffect(() => {
    const updateCols = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColCount(6);
      else if (width >= 1024) setColCount(5);
      else if (width >= 768) setColCount(3);
      else if (width >= 640) setColCount(2);
      else setColCount(1);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const rowCount = Math.ceil(sortedChefs.length / colCount);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 140,
    overscan: 2,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const topRatedChefs = useMemo(() => {
    if (search.trim() || cuisine !== "all" || mealType !== "all" || availability !== "all" || rating !== "all") {
      return [];
    }
    return [...sortedChefs]
      .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
      .slice(0, 5);
  }, [sortedChefs, search, cuisine, mealType, availability, rating]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    cuisine !== "all" ||
    mealType !== "all" ||
    availability !== "all" ||
    rating !== "all";

  if (isLoading) {
    return <HomeChefsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      <div className="container mx-auto px-4 lg:px-8 pt-2 pb-6 lg:py-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-[13px] mb-5">
          <Link href="/" className="text-[#6B7280] hover:text-[#111827] cursor-pointer transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#9CA3AF]" />
          <span className="text-[#166534] font-medium">Home Chefs</span>
        </div>

        {/* Hero Section */}
        <div className="relative bg-[#FFFAF3] rounded-2xl border border-[#F2E8DF] mb-12 flex flex-col lg:flex-row min-h-[160px] lg:min-h-[140px] xl:min-h-[140px] shadow-sm mt-2 overflow-hidden">
          {/* Left Side Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-6 py-8 lg:py-0 lg:pl-10 lg:pr-[240px] xl:pr-[300px] h-auto lg:h-[140px] gap-6 lg:gap-4 xl:gap-8">
            {/* Title & Subtitle */}
            <div className="text-center lg:text-left shrink-0 lg:max-w-[260px] xl:max-w-[320px]">
              <h1 className="text-[28px] lg:text-[32px] xl:text-[36px] font-extrabold text-[#064E3B] mb-1.5 tracking-tight whitespace-nowrap">Home Chefs</h1>
              <p className="text-[#4B5563] text-[12px] lg:text-[13px] leading-[1.6]">
                Discover talented home chefs who cook with love and passion. Support local homemakers and enjoy homemade meals.
              </p>
            </div>

            {/* Highlights */}
            <div className="flex flex-col sm:flex-row flex-nowrap items-center justify-center lg:justify-end gap-4 sm:gap-3 xl:gap-6 shrink-0 mt-2 lg:mt-0">
              {heroHighlights.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-[18px] h-[18px] xl:w-[20px] xl:h-[20px] ${item.iconColor}`} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-[#064E3B] text-[12px] xl:text-[13px] leading-tight mb-0.5">{item.title}</h4>
                    <p className="text-[#6B7280] text-[10px] xl:text-[11px] leading-tight whitespace-nowrap">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Image Layer */}
          <div className="w-full lg:w-[280px] xl:w-[320px] h-[180px] lg:h-full relative mt-4 lg:mt-0 lg:absolute lg:right-0 lg:bottom-0 lg:top-0 pointer-events-none flex items-center justify-center lg:justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFFAF3] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#FFFAF3] lg:via-[#FFFAF3]/20 lg:to-transparent z-10 pointer-events-none" />
            <Image
              src="/hero/hero-women-chef.webp"
              alt="Home Chef"
              fill
              className="object-cover object-center lg:object-right"
              priority
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-[#FFFFFF] rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] mb-10 flex flex-wrap lg:flex-nowrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] w-full lg:w-auto">
            <label className="text-xs font-bold text-[#111827] mb-2 block">Search Home Chefs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
              <Input
                placeholder="Search by name, dish or cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E] rounded-lg text-[13px]"
              />
            </div>
          </div>

          <div className="w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]">
            <label className="text-xs font-bold text-[#111827] mb-2 block">Cuisine</label>
            <Select value={cuisine} onValueChange={(v) => setCuisine(v as CuisineFilter)}>
              <SelectTrigger className="h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] rounded-lg text-[13px]">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]">
            <label className="text-xs font-bold text-[#111827] mb-2 block">Meal Type</label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealFilter)}>
              <SelectTrigger className="h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] rounded-lg text-[13px]">
                <SelectValue placeholder="All Meal Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meal Types</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]">
            <label className="text-xs font-bold text-[#111827] mb-2 block">Availability</label>
            <Select value={availability} onValueChange={(v) => setAvailability(v as SlotFilter)}>
              <SelectTrigger className="h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] rounded-lg text-[13px]">
                <SelectValue placeholder="All Time Slots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time Slots</SelectItem>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="LUNCH">Lunch</SelectItem>
                <SelectItem value="EVENINGSNACKS">Evening Snacks</SelectItem>
                <SelectItem value="DINNER">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[130px]">
            <label className="text-xs font-bold text-[#111827] mb-2 block">Rating</label>
            <Select value={rating} onValueChange={(v) => setRating(v as RatingFilter)}>
              <SelectTrigger className="h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] rounded-lg text-[13px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4+">4.0 & Above</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto flex gap-4 lg:ml-auto">
            <div className="flex-1 sm:flex-none sm:w-[140px]">
              <label className="text-xs font-bold text-[#111827] mb-2 block">Sort By</label>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="h-[42px] bg-[#FFFFFF] border-[#D1D5DB] text-[#111827] rounded-lg text-[13px]">
                  <SelectValue placeholder="Recommended" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="h-[42px] bg-[#FFFFFF] border-[#BBF7D0] text-[#166534] hover:bg-[#F0FDF4] hover:border-[#86EFAC] rounded-lg px-5 gap-2 font-semibold text-[13px] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#15803D]" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top Rated Home Chefs */}
        {topRatedChefs.length > 0 && (
          <div className="mb-10 bg-[#FCFCFC] border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#166534] leading-tight mb-0.5">Top Rated Home Chefs</h2>
                <p className="text-xs text-[#6B7280]">Best loved by our customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {topRatedChefs.map((chef) => (
                <ChefCard key={`top-${chef.id}`} chef={chef} />
              ))}
            </div>
          </div>
        )}

        {/* All Home Chefs */}
        <div className="mb-12">
          <h2 className="text-[17px] font-bold text-[#111827] mb-5">
            {hasActiveFilters ? "Search Results" : "All Home Chefs"} ({sortedChefs.length})
          </h2>
          {sortedChefs.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-12 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] text-center">
              <p className="text-[#6B7280] font-medium">No home chefs match your filters.</p>
              <Button
                variant="outline"
                className="mt-4 h-[42px] bg-[#FFFFFF] border-[#BBF7D0] text-[#166534] hover:bg-[#F0FDF4] hover:border-[#86EFAC] rounded-lg px-5 gap-2 font-semibold text-[13px] transition-colors"
                onClick={() => {
                  setSearch("");
                  setCuisine("all");
                  setMealType("all");
                  setAvailability("all");
                  setRating("all");
                  setSort("recommended");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const startIndex = virtualRow.index * colCount;
                  const rowChefs = sortedChefs.slice(startIndex, startIndex + colCount);
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4"
                    >
                      {rowChefs.map((chef) => (
                        <ChefCard key={`all-${chef.id}`} chef={chef} />
                      ))}
                    </div>
                  );
                })}
              </div>
              {(hasNextPage || isFetchingNextPage) && (
                <div ref={sentinelRef}>
                  {isFetchingNextPage && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-2 animate-pulse">
                      {Array.from({ length: colCount }).map((_, i) => (
                        <HomeChefCardSkeleton key={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Features Banner */}
        <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F9FAFB] rounded-2xl p-6 lg:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-6">
          <FeatureFooterItem icon={<Heart className="w-[26px] h-[26px] text-[#15803D]" strokeWidth={1.5} />} title="100% Homemade" desc="Made with love" />
          <div className="hidden lg:block w-px h-10 bg-[#E5E7EB]" />
          <FeatureFooterItem icon={<ShieldCheck className="w-[26px] h-[26px] text-[#15803D]" strokeWidth={1.5} />} title="Hygienic & Safe" desc="Verified home kitchens" />
          <div className="hidden lg:block w-px h-10 bg-[#E5E7EB]" />
          <FeatureFooterItem icon={<Leaf className="w-[26px] h-[26px] text-[#15803D]" strokeWidth={1.5} />} title="Fresh Ingredients" desc="Sourced daily" />
          <div className="hidden lg:block w-px h-10 bg-[#E5E7EB]" />
          <FeatureFooterItem icon={<Truck className="w-[26px] h-[26px] text-[#15803D]" strokeWidth={1.5} />} title="On-time Delivery" desc="Right to your doorstep" />
          <div className="hidden lg:block w-px h-10 bg-[#E5E7EB]" />
          <FeatureFooterItem icon={<UserRound className="w-[26px] h-[26px] text-[#F97316]" strokeWidth={1.5} />} title="Support Local Women" desc="Empowering homemakers" />
        </div>

      </div>
    </div>
  );
}

function ChefCard({ chef }: { chef: KitchenData }) {
  const imageUrl = chef.profileImage ?? chef.imageUrl ?? "/kitchen/profile.webp";
  const rating = chef.avgRating ?? 0;
  const cuisine = chef.cuisineTags?.[0] ?? "Home Kitchen";
  const exp = `${((chef.id || "").length % 15) + 5}+ Yrs Exp.`;

  return (
    <Link href={`/kitchens/${chef.slug}`} className="block h-full">
      <Card className="p-0 rounded-xl border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#BBF7D0] transition-all duration-300 overflow-hidden bg-[#FFFFFF] h-full group">
        <CardContent className="p-3 flex gap-3 h-full items-center">
          <div className="w-[84px] h-[104px] relative rounded-lg overflow-hidden shrink-0 bg-gray-50">
            <Image
              src={imageUrl}
              alt={chef.displayName}
              fill
              sizes="84px"
              className="object-cover object-top"
            />
          </div>
          <div className="flex flex-col min-w-0 justify-center flex-1 py-0.5">
            <h3 className="font-bold text-[#111827] text-[13px] leading-tight mb-1 truncate group-hover:text-[#166534] transition-colors">{chef.displayName}</h3>
            <p className="text-[11px] text-[#6B7280] mb-0.5">{exp}</p>
            <p className="text-[11px] text-[#4B5563] mb-1.5 truncate">{cuisine}</p>

            <div className="flex items-center gap-0.5 mb-2">
              {STAR_RATING.map((star) => (
                <Star
                  key={star}
                  className="w-[11px] h-[11px] text-[#F97316] fill-[#F97316]"
                />
              ))}
            </div>

            <div className="mt-auto flex items-center">
              <Badge variant="secondary" className="bg-[#DCFCE7] hover:bg-[#DCFCE7] border-none px-1.5 py-[3px] rounded-[4px] gap-[3px] flex items-center">
                <Star className="w-[9px] h-[9px] text-[#166534] fill-[#166534]" />
                <span className="text-[#166534] font-bold text-[10px] leading-none mt-[1px]">{rating.toFixed(1)}</span>
                <span className="text-[#6B7280] font-normal text-[10px] leading-none mt-[1px]">({chef.totalReviews})</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function HomeChefCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden bg-[#FFFFFF] p-3">
      <div className="flex gap-3 h-[104px]">
        <Skeleton className="w-[84px] h-[104px] rounded-lg shrink-0" />
        <div className="flex flex-col py-0.5 flex-1 min-w-0 justify-center">
          <Skeleton className="h-3.5 w-24 mb-1.5" />
          <Skeleton className="h-2.5 w-16 mb-1" />
          <Skeleton className="h-2.5 w-20 mb-2" />
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-2.5 w-2.5 rounded-sm" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-[18px] w-14 rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureFooterItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-[160px]">
      <div className="shrink-0 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-[#111827] text-[13px] leading-tight mb-0.5">{title}</h4>
        <p className="text-[#6B7280] text-[11px]">{desc}</p>
      </div>
    </div>
  );
}
