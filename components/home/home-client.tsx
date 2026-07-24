"use client";

import Link from "next/link";
import Image from "next/image";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { InfiniteKitchenGrid } from "@/components/kitchen/infinite-kitchen-grid";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { WhatsOnYourMind } from "@/components/home/whats-on-your-mind";
import { FastDeliveryCarousel } from "@/components/home/fast-delivery-carousel";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { KitchenFilters } from "@/components/kitchen/kitchen-filters";
import { useKitchenCategories } from "@/hooks/useExploreKitchens";
import { cn } from "@/lib/utils";

export function HomeClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [vegFilter, setVegFilter] = useState<VegFilterValue>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const { data: categories = [] } = useKitchenCategories();

  const kitchenSectionRef = useRef<HTMLElement>(null);
  const [isPastHeader, setIsPastHeader] = useState(false);
  const [inKitchenSection, setInKitchenSection] = useState(false);
  const [isPastInlineFilters, setIsPastInlineFilters] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scroll direction with a small threshold to avoid jitter
      if (currentScrollY > lastScrollY + 5) {
        setScrollDirection("down"); // Downward scroll time
      } else if (currentScrollY < lastScrollY - 5) {
        setScrollDirection("up"); // Upward scroll time
      }
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;

      // Check if we passed the static header
      setIsPastHeader(currentScrollY > 120);

      // Check kitchen section boundaries
      if (kitchenSectionRef.current) {
        const rect = kitchenSectionRef.current.getBoundingClientRect();
        // If the top of the section is less than 0, we've scrolled past the inline filters at its top
        setIsPastInlineFilters(rect.top < 0);
        // We are in the section as long as the bottom is still in view
        setInKitchenSection(rect.bottom > 80);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* ===== Custom Mobile Sticky Header (Two phases) ===== */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 md:hidden bg-white shadow-sm transition-transform duration-300",
          isPastHeader ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {/* Search Bar - Shown when scrolling DOWN */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden px-4",
            scrollDirection === "down" ? "max-h-20 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <SearchAutocomplete
            mobileModal
            placeholder="Search meals..."
            inputClassName="h-10 rounded-none text-sm pl-10 focus-visible:ring-1 bg-white text-foreground placeholder:text-muted-foreground border border-black shadow-md"
          />
        </div>

        {/* Filters - Shown only when past inline filters and inside the Kitchen Section */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
            (isPastInlineFilters && inKitchenSection) ? "max-h-20 py-2 opacity-100 border-t border-gray-100" : "max-h-0 py-0 opacity-0"
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

      <div className="mx-auto max-w-360 px-4 lg:px-12 pb-16 pt-0 lg:pt-4 space-y-4 lg:space-y-12">
        <ErrorBoundary>
          <WhatsOnYourMind />

          <FastDeliveryCarousel />

          {/* Explore Kitchens Section */}
          <section ref={kitchenSectionRef} className="space-y-4 lg:space-y-6 pt-3 lg:pt-6 border-t border-gray-100">
            <InfiniteKitchenGrid
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              sortOption={sortOption}
              onSortChange={setSortOption}
              vegFilter={vegFilter}
              onVegFilterChange={setVegFilter}
              selectedCuisines={selectedCuisines}
              onCuisinesChange={setSelectedCuisines}
            />
          </section>

          {/* Premium CTA Banner */}
          <section className="bg-[#EE7005] overflow-hidden flex flex-col md:flex-row md:justify-between md:items-stretch shadow-2xl">
            <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-10 flex flex-col justify-center flex-1 gap-3 text-left">
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter">
                Become a Home Chef
              </h2>
              <p className="text-sm sm:text-base text-black leading-relaxed max-w-lg font-medium">
                Turn your passion into profession.
                <br />
                Cook from home, earn on your terms, and build something
                extraordinary.
              </p>
              <Link
                href="/kitchen/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 min-h-11 text-sm font-black text-[#B85300] hover:bg-slate-50 transition-all self-start shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 group"
              >
                Join the Kitchen
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="relative w-full md:w-[38%] lg:w-[30%] min-h-56 ">
              <Image
                src="/banners/womenchef.png"
                alt=""
                fill
                className="object-cover object-bottom-right"
                sizes="(max-width: 1024px) 100vw, 28vw"
                priority
              />
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </main>
  );
}
