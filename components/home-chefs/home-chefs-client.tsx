"use client"

import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Search, Filter, Heart, ShieldCheck, Leaf, Star, Truck, Users, ChevronRight } from "lucide-react";
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
  { icon: Heart, iconBg: "bg-orange-100", iconColor: "text-primary", title: "Made with Love", desc: "Homemade with care" },
  { icon: ShieldCheck, iconBg: "bg-green-100", iconColor: "text-green-600", title: "Hygienic & Safe", desc: "Verified home kitchens" },
  { icon: Leaf, iconBg: "bg-green-100", iconColor: "text-green-600", title: "Support Local", desc: "Empower homemakers" },
];

const features = [
  { icon: <Heart className="w-6 h-6 text-green-600" />, title: "100% Homemade", desc: "Made with love" },
  { icon: <ShieldCheck className="w-6 h-6 text-green-600" />, title: "Hygienic & Safe", desc: "Verified home kitchens" },
  { icon: <Leaf className="w-6 h-6 text-green-600" />, title: "Fresh Ingredients", desc: "Sourced daily" },
  { icon: <Truck className="w-6 h-6 text-green-600" />, title: "On-time Delivery", desc: "Right to your doorstep" },
  { icon: <Users className="w-6 h-6 text-primary" />, title: "Support Local Women", desc: "Empowering homemakers" },
];

type CuisineFilter = "all" | string;
type MealFilter = "all" | "veg" | "non-veg";
type SlotFilter = "all" | "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";
type RatingFilter = "all" | "4+";
type SortOption = "recommended" | "rating";

const PAGE_SIZE = 15;

export function HomeChefsClient() {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState<CuisineFilter>("all");
  const [mealType, setMealType] = useState<MealFilter>("all");
  const [availability, setAvailability] = useState<SlotFilter>("all");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [sort, setSort] = useState<SortOption>("recommended");

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<{ data: KitchenData[]; nextCursor: string | null }>({
    queryKey: ["home-chefs"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (pageParam) params.set("cursor", pageParam as string);
      const res = await fetch(`/api/kitchen/explore?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load home chefs");
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

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
      if (width >= 1024) setColCount(6);
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
    estimateSize: () => 152,
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
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="container mx-auto px-4 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary cursor-pointer transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Home Chefs</span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-50/80 to-orange-100/40 mb-10 flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-12 z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4 tracking-tight">Home Chefs</h1>
            <p className="text-gray-700 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              Discover talented home chefs who cook with love and passion.
              <br className="hidden md:block" />
              Support local homemakers and enjoy homemade meals.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              {heroHighlights.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/3 relative h-[300px] md:h-[400px] mt-8 md:mt-0 flex items-end justify-end">
            <div className="absolute inset-0 right-0 overflow-hidden">
              <div className="absolute right-0 bottom-0 w-[90%] md:w-[120%] h-full flex items-end">
                <Image
                  src="/hero-women-chef.webp"
                  alt="Home Chef"
                  width={500}
                  height={500}
                  className="object-contain object-bottom drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-12 flex flex-col lg:flex-row gap-4 items-end">
          <div className="w-full lg:w-1/3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search Home Chefs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, dish or cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white border-gray-200 focus-visible:ring-primary rounded-xl"
              />
            </div>
          </div>

          <div className="w-full lg:w-auto flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cuisine</label>
              <Select value={cuisine} onValueChange={(v) => setCuisine(v as CuisineFilter)}>
                <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Meal Type</label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealFilter)}>
                <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meal Types</SelectItem>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Availability</label>
              <Select value={availability} onValueChange={(v) => setAvailability(v as SlotFilter)}>
                <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Availability" />
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
              <Select value={rating} onValueChange={(v) => setRating(v as RatingFilter)}>
                <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4+">4.0 & Above</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl min-w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCuisine("all");
                  setMealType("all");
                  setAvailability("all");
                  setRating("all");
                  setSort("recommended");
                }}
                className="h-11 border-green-600 text-green-700 hover:bg-green-50 rounded-xl px-6 gap-2"
              >
                <Filter className="w-4 h-4" />
                {hasActiveFilters ? "Clear" : "Filters"}
              </Button>
            </div>
          </div>
        </div>

        {/* Top Rated Home Chefs */}
        {topRatedChefs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">Top Rated Home Chefs</h2>
                <p className="text-sm text-gray-500">Best loved by our customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {topRatedChefs.map((chef) => (
                <ChefCard key={`top-${chef.id}`} chef={chef} />
              ))}
            </div>
          </div>
        )}

        {/* All Home Chefs */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {hasActiveFilters ? "Search Results" : "All Home Chefs"} ({sortedChefs.length})
          </h2>
          {sortedChefs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 font-medium">No home chefs match your filters.</p>
              <Button
                variant="outline"
                className="mt-4 border-green-600 text-green-700 hover:bg-green-50 rounded-xl"
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
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mt-6 animate-pulse">
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
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-wrap justify-between gap-8 md:gap-4 text-center md:text-left">
          {features.map((item) => (
            <FeatureItem key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
          ))}
        </div>

      </div>
    </div>
  );
}

function ChefCard({ chef }: { chef: KitchenData }) {
  const imageUrl = chef.imageUrl ?? "/hero-women-chef.webp";
  const rating = chef.avgRating ?? 0;
  const itemNames = chef.items.slice(0, 3).map((i) => i.name).join(", ");

  return (
    <Link href={`/kitchens/${chef.slug}`} className="block h-full">
      <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white h-full">
        <CardContent className="p-4 flex gap-4 h-full">
          <div className="w-20 h-24 relative rounded-xl overflow-hidden shrink-0 bg-blue-50/50">
            <Image
              src={imageUrl}
              alt={chef.displayName}
              fill
              sizes="80px"
              className="object-cover object-top"
            />
          </div>
          <div className="flex flex-col py-1 min-w-0">
            <h3 className="font-bold text-gray-900 leading-none mb-1.5 truncate">{chef.displayName}</h3>
            <p className="text-xs text-gray-500 mb-1 truncate">{chef.cuisineTags.join(", ") || "Home Kitchen"}</p>
            <p className="text-xs text-gray-600 mb-2 truncate">{itemNames}</p>

            <div className="flex items-center gap-0.5 mb-2">
              {STAR_RATING.map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(rating) ? "text-primary fill-primary" : "text-gray-200"}`}
                />
              ))}
            </div>

            <div className="mt-auto">
              <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-semibold px-2 py-0.5 rounded-md text-xs gap-1">
                <Star className="w-3 h-3 fill-current" />
                {rating.toFixed(1)} <span className="text-gray-500 font-normal ml-0.5">({chef.totalReviews})</span>
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
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white p-4">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-24 rounded-xl shrink-0" />
        <div className="flex flex-col py-1 flex-1 min-w-0">
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-3 w-3 rounded-sm" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
      <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center shrink-0 bg-white">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
