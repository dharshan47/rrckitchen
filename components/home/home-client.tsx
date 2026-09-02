"use client";

import Link from "next/link";
import Image from "next/image";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { KitchenCard } from "@/components/kitchen/kitchen-card";
import {
  Star,
  ShieldCheck,
  Clock,
  Leaf,
  MapPin,
  ChefHat,
  ArrowRight,
  Users,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { WhatsOnYourMind } from "@/components/home/whats-on-your-mind";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { KitchenFilters } from "@/components/kitchen/kitchen-filters";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import { useKitchenCategories, useExploreKitchens } from "@/hooks/useExploreKitchens";
import { HomeKitchenCardSkeleton } from "@/components/home/home-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  useHomeFilters,
  useHomeActions,
  useHomeKitchensQuery,
  useTestimonialsQuery,
  type Testimonial,
} from "@/stores/homeStore";

const STAR_RATING = [1, 2, 3, 4, 5];
const FALLBACK_AVATAR = "/kitchen/profile.webp";

const mockTestimonials: Testimonial[] = [
  {
    id: "m1",
    rating: 5,
    comment: "The food feels just like home! The ever-silver tiffin box keeps it hot and fresh. Absolutely love it.",
    userName: "Rahul Sharma",
    userImage: null,
    kitchenName: "Aunty's Kitchen",
  },
  {
    id: "m2",
    rating: 5,
    comment: "I've been ordering lunch for a month now. Very hygienic, zero plastic, and amazing taste every single day.",
    userName: "Priya Desai",
    userImage: null,
    kitchenName: "Spice Route",
  },
  {
    id: "m3",
    rating: 4,
    comment: "Healthy and delicious! It's such a relief to not worry about cooking after a long day at work.",
    userName: "Amit Kumar",
    userImage: null,
    kitchenName: "Healthy Bites",
  },
  {
    id: "m4",
    rating: 5,
    comment: "The concept of reusable steel boxes is fantastic. Food stays warm and I don't feel guilty about plastic waste.",
    userName: "Sneha Reddy",
    userImage: null,
    kitchenName: "South Indian Delights",
  }
];

function TrendingKitchens() {
  const { data, isLoading } = useExploreKitchens();

  const kitchens = data?.pages[0]?.data.slice(0, 4) || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black text-[#111111] tracking-tight uppercase leading-none">
            Top Home Kitchens Near You
          </h2>
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280] font-medium mt-0.5">
            <MapPin className="h-4 w-4 text-[#F04E00]" />
            <p>Serving delicious meals in tiffin box</p>
          </div>
        </div>
        <Link
          href="/kitchens"
          className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#F04E00] hover:underline shrink-0 mt-0.5"
        >
          View All Kitchens
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible scrollbar-none pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[90vw] sm:w-[calc(50%-10px)] lg:w-auto shrink-0">
              <HomeKitchenCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible scrollbar-none pb-4 snap-x snap-mandatory lg:snap-none">
          {kitchens.map((k) => (
            <div key={k.id} className="snap-start shrink-0 w-[90vw] sm:w-[calc(50%-10px)] lg:w-auto">
              <KitchenCard kitchen={k} variant="home" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeClient() {
  const { selectedCategory, sortOption, vegFilter, selectedCuisines } = useHomeFilters();
  const { setSelectedCategory, setSortOption, setVegFilter, setSelectedCuisines } = useHomeActions();
  
  const { data: categories = [] } = useKitchenCategories();

  const { data: allChefs = [], isLoading: chefsLoading } = useHomeKitchensQuery();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonialsQuery();

  const homeChefs = useMemo(() => {
    if (!Array.isArray(allChefs)) return [];
    return [...allChefs]
      .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
      .slice(0, 3);
  }, [allChefs]);

  const kitchenSectionRef = useRef<HTMLElement>(null);
  const [isPastHeader, setIsPastHeader] = useState(false);
  const [inKitchenSection, setInKitchenSection] = useState(false);
  const [isPastInlineFilters, setIsPastInlineFilters] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY + 5) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY - 5) {
        setScrollDirection("up");
      }
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;

      setIsPastHeader(currentScrollY > 120);

      if (kitchenSectionRef.current) {
        const rect = kitchenSectionRef.current.getBoundingClientRect();
        setIsPastInlineFilters(rect.top < 0);
        setInKitchenSection(rect.bottom > 80);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#111111] relative">
      {/* Mobile sticky search + filters */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 md:hidden bg-white shadow-sm transition-transform duration-300",
          isPastHeader ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden px-4",
            scrollDirection === "down"
              ? "max-h-20 py-3 opacity-100"
              : "max-h-0 py-0 opacity-0"
          )}
        >
          <SearchAutocomplete
            mobileModal
            placeholder="Search meals..."
            inputClassName="h-10 rounded-full text-sm pl-10 focus-visible:ring-1 focus-visible:ring-primary bg-[#FEFEFE] text-[#111111] border border-[#E7E7E7] shadow-sm"
          />
        </div>
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
            isPastInlineFilters && inKitchenSection
              ? "max-h-20 py-2 opacity-100 border-t border-[#EEEEEE]"
              : "max-h-0 py-0 opacity-0"
          )}
        >
          <KitchenFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            vegFilter={vegFilter}
            onVegFilterChange={setVegFilter}
            selectedCuisines={selectedCuisines}
            onCuisinesChange={setSelectedCuisines}
          />
        </div>
      </div>

      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 pb-8 pt-10 lg:pt-14 space-y-14 lg:space-y-20">
        <ErrorBoundary>
          {/* Category Carousel */}
          <WhatsOnYourMind />

          {/* Top Home Kitchens */}
          <section ref={kitchenSectionRef}>
            <TrendingKitchens />
          </section>

          <section className="bg-[#FDF8F1] rounded-2xl lg:rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8 lg:px-16 lg:py-12 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.2fr] gap-8 lg:gap-12 items-center">
              {/* Left text */}
              <div className="flex flex-col justify-center text-center lg:text-left">
                <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] tracking-wide uppercase mb-4 lg:mb-10">
                  WHY TIFFIN CARRIER?
                </h2>
                <div className="space-y-1.5">
                  <p className="text-[#4B5563] font-medium text-[14px] lg:text-[15px]">
                    Not Plastic. Not Aluminium.
                  </p>
                  <p className="text-[#003015] font-bold text-[15px] lg:text-[16px]">
                    Authentic Stainless Steel.
                  </p>
                </div>
              </div>

              {/* Middle Image */}
              <div className="relative h-[220px] sm:h-[280px] lg:h-[300px] flex items-center justify-center">
                <Image
                  src="/home/tiffin-carrier.webp"
                  alt="Stainless steel tiffin carrier"
                  fill
                  className="object-contain drop-shadow-md scale-[1.15]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                />
              </div>

              {/* Right Checkmarks */}
              <div className="flex flex-col justify-center gap-3.5 lg:gap-5 items-start mx-auto lg:mx-0 lg:pl-16">
                {[
                  "Keeps food hot & fresh",
                  "Leak proof & spill safe",
                  "Eco friendly & reusable",
                  "Healthy & chemical free",
                  "Traditional & reliable",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex items-center justify-center shrink-0 text-[#087A35]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[20px] w-[20px]">
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <path d="M8 12.5l3 3 5-6" />
                      </svg>
                    </div>
                    <span className="text-[13px] lg:text-[14px] font-medium text-[#111111]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Service Icons Bar */}
          <section className="bg-[#FDF8F1] rounded-2xl lg:rounded-3xl overflow-x-auto scrollbar-none snap-x snap-mandatory">
            <div className="flex items-stretch min-w-max lg:min-w-0 lg:grid lg:grid-cols-5 py-4 lg:py-0">
              {[
                {
                  icon: ChefHat,
                  iconColor: "text-[#F04E00]",
                  title: "Curated Home Chefs",
                  desc: "Verified and trusted home chefs who cook with passion.",
                },
                {
                  icon: Leaf,
                  iconColor: "text-[#087A35]",
                  title: "Fresh & Quality Ingredients",
                  desc: "Only the best ingredients for healthy and tasty meals.",
                },
                {
                  icon: Clock,
                  iconColor: "text-[#F04E00]",
                  title: "Timely Delivery",
                  desc: "Your meals delivered on time, every time.",
                },
                {
                  icon: ShieldCheck,
                  iconColor: "text-[#F04E00]",
                  title: "Safe & Hygienic",
                  desc: "Packed with care and hygiene you can trust.",
                },
                {
                  icon: Users,
                  iconColor: "text-[#F04E00]",
                  title: "Support Local",
                  desc: "Empowering homemakers and local communities.",
                },
              ].map((item, i, arr) => (
                <div key={item.title} className="flex relative snap-start shrink-0 w-[280px] lg:w-auto items-stretch">
                  <div className="flex items-start gap-4 p-5 lg:p-6 xl:p-8">
                    <item.icon className={`w-8 h-8 lg:w-9 lg:h-9 shrink-0 ${item.iconColor}`} strokeWidth={1.5} />
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-[#F04E00] text-[13px] lg:text-[14px] leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[11px] lg:text-[12px] text-[#4B5563] font-medium leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  {/* Separator Line */}
                  {i < arr.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-6 bottom-6 w-[1px] bg-[#FFE5D7]" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Info Grid: How It Works, Meet Chefs, Become Chef */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* How It Works */}
            <div className="bg-[#FDF8F1] rounded-[20px] p-5 lg:p-6 xl:p-8 relative flex flex-col justify-center min-h-[220px] shadow-sm overflow-hidden">
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide mb-8">
                How It Works
              </h3>
              
              <div className="flex-1 flex flex-row items-start justify-between w-full">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center gap-2.5 flex-1 relative">
                  <div className="flex items-center justify-center mb-1 h-8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[#003015]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-5.5-6-10.5a6 6 0 1112 0c0 5-6 10.5-6 10.5z" />
                      <circle cx="12" cy="10.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] leading-tight">
                    Choose<br/>Location
                  </span>
                </div>
                
                <div className="text-[#6B7280] font-light text-base mt-1.5 shrink-0">→</div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center gap-2.5 flex-1 relative">
                  <div className="flex items-center justify-center mb-1 h-8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[#003015]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l-1 11h12l-1-11" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9q2.5 3 5 0q2.5-3 5 0" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v2M12 3v3M15 4v2" />
                      <circle cx="12" cy="15" r="1.5" stroke="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] leading-tight">
                    Select<br/>Kitchen
                  </span>
                </div>
                
                <div className="text-[#6B7280] font-light text-base mt-1.5 shrink-0">→</div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center gap-2.5 flex-1 relative">
                  <div className="flex items-center justify-center mb-1 h-8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[#003015]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l1 12H5L6 8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V5a3 3 0 116 0v3" />
                      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
                      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4l-1-1M17 4l1-1M12 2v1" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] leading-tight">
                    Pick Today&apos;s<br/>Menu
                  </span>
                </div>
                
                <div className="text-[#6B7280] font-light text-base mt-1.5 shrink-0">→</div>
                
                {/* Step 4 */}
                <div className="flex flex-col items-center text-center gap-2.5 flex-1 relative">
                  <div className="flex items-center justify-center mb-1 h-8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[#003015]">
                      <rect x="7" y="8" width="10" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="7" y="12" width="10" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="7" y="16" width="10" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v5M9 3h6M7 10h10M7 14h10M5 5l2 3M19 5l-2 3" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] leading-tight">
                    Receive<br/>Tiffin
                  </span>
                </div>
                
                <div className="text-[#6B7280] font-light text-base mt-1.5 shrink-0 hidden sm:block">→</div>
                
                {/* Step 5 */}
                <div className="flex flex-col items-center text-center gap-2.5 flex-1 relative hidden sm:flex">
                  <div className="flex items-center justify-center mb-1 h-8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[#003015]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] leading-tight">
                    Return<br/>Pickup
                  </span>
                </div>
                
              </div>
            </div>

            {/* Meet Our Home Chefs */}
            <div className="bg-[#FEFEFE] rounded-2xl p-6 border border-[#EEEEEE] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black text-[#003015] uppercase tracking-widest">
                  Meet Our Home Chefs
                </h3>
                <Link
                  href="/home-chefs"
                  className="text-[11px] font-bold text-[#087A35] hover:underline flex items-center gap-0.5"
                >
                  View All
                </Link>
              </div>
              {chefsLoading ? (
                <div className="space-y-5 my-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full border-2 border-white shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 my-auto">
                  {homeChefs.map((chef) => (
                    <Link
                      key={chef.id}
                      href={`/kitchens/${chef.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <Image
                          src={chef.imageUrl ?? FALLBACK_AVATAR}
                          alt={chef.displayName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#003015] truncate leading-tight group-hover:text-primary transition-colors">
                          {chef.displayName}
                        </p>
                        <p className="text-[10px] text-[#6B7280] font-medium mt-0.5 leading-[1.2] truncate">
                          {chef.cuisineTags.join(", ") || "Home Kitchen"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center gap-0.5">
                            {STAR_RATING.map((star) => (
                              <Star
                                key={star}
                                className={`h-2.5 w-2.5 ${star <= Math.round(chef.avgRating ?? 0) ? "fill-primary text-primary" : "text-[#E7E7E7]"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#6B7280]">
                            ({chef.totalReviews})
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Become a Home Chef */}
            <div className="bg-[#FDF8F1] rounded-[20px] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-sm">
              <div className="relative z-10 w-[60%] sm:w-[55%] flex flex-col items-start">
                <h3 className="text-sm font-bold text-[#F04E00] uppercase tracking-wide mb-3">
                  Become a Home Chef
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#111111] font-semibold leading-relaxed mb-5">
                  Cook from home.<br />Earn with RRC Kitchen.<br />No restaurant required.
                </p>
                <Link
                  href="/kitchen/signup"
                  className="inline-flex items-center justify-center bg-[#003015] text-white px-6 py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-[#087A35] transition-colors shadow-md"
                >
                  Join Now
                </Link>
              </div>

              <div className="absolute right-0 bottom-0 w-[45%] max-w-[190px] h-[105%] pointer-events-none">
                <Image
                  src="/home/home-cta-chef.webp"
                  alt="Become a home chef"
                  fill
                  className="object-contain object-bottom drop-shadow-xl"
                  sizes="(max-width: 768px) 150px, 190px"
                />
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="space-y-5">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111111] uppercase tracking-wide">
              Loved by Thousands of Families
            </h2>

            {testimonialsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#EEEEEE] flex flex-col gap-4 relative min-h-[140px]"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-6 w-6 shrink-0" />
                      <div className="space-y-2 w-full mt-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="flex items-center gap-0.5">
                        {STAR_RATING.map((j) => (
                          <Skeleton key={j} className="h-3.5 w-3.5 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {(testimonials.length > 0 ? testimonials : mockTestimonials).slice(0, 4).map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#EEEEEE] flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[32px] text-[#F04E00] font-serif leading-[0.7] mt-2">
                        &ldquo;
                      </span>
                      <p className="text-[12.5px] sm:text-[13px] font-medium text-[#4B5563] leading-relaxed min-h-[40px]">
                        {review.comment}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2.5">
                        {review.userImage ? (
                          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-[#E7E7E7] shrink-0">
                            <Image
                              src={review.userImage}
                              alt={review.userName}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#003015] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[13px] font-bold text-[#111111] truncate">
                          {review.userName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {STAR_RATING.map((star) => (
                          <Star
                            key={star}
                            className={`h-[13px] w-[13px] ${star <= review.rating ? "fill-[#FF9F00] text-[#FF9F00]" : "text-[#E7E7E7] fill-[#E7E7E7]"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* App Download Banner */}
          <AppDownloadBanner />
        </ErrorBoundary>
      </div>
    </main>
  );
}
