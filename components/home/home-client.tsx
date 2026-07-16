"use client";

import Link from "next/link";
import Image from "next/image";

import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { InfiniteKitchenGrid } from "@/components/kitchen/infinite-kitchen-grid";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { useKitchenCategories } from "@/hooks/useExploreKitchens";
import { ArrowRight } from "lucide-react";
import { getCategoryImageUrl } from "@/lib/category-images";
import { useState } from "react";

function CategoryImage({ name, imageUrl, desktop = true }: { name: string; imageUrl: string; desktop?: boolean }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
        <span className={`font-bold text-muted-foreground/30 ${desktop ? "text-4xl" : "text-xl"}`}>{name.charAt(0)}</span>
      </div>
    );
  }
  return (
    <Image
      src={imageUrl}
      alt={`${name} Category`}
      fill
      sizes={desktop ? "(min-width: 1024px) calc(100vw / 7 - 48px), 64px" : "64px"}
      className={`object-contain scale-110 drop-shadow-md ${desktop ? "p-3" : "p-2"}`}
      onError={() => setError(true)}
    />
  );
}

export function HomeClient() {
  const { data: categories = [], isLoading: catLoading } = useKitchenCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [vegFilter, setVegFilter] = useState<VegFilterValue>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Categories in the specific order
  const prioritizedNames = [
    "South Indian", "Biryani", "North Indian", "Desserts", "Chinese", "Cake",
    "Noodles", "Coffee", "Rolls", "Salad", "Dosa", "Tea"
  ];

  const sortedCategories = prioritizedNames
    .map(name => categories.find(cat => cat.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean) as typeof categories;

  const remainingCategories = categories.filter(
    cat => !prioritizedNames.some(name => name.toLowerCase() === cat.name.toLowerCase())
  );

  const displayCategories = [...sortedCategories, ...remainingCategories];

  return (
    <main className="min-h-screen bg-background text-foreground">

      <div className="mx-auto max-w-360 px-4 lg:px-12 pb-16 pt-1 lg:pt-8 space-y-6 lg:space-y-20">
        <ErrorBoundary>
          {/* What's on Your Mind - Category Navigation */}
          {catLoading ? (
            <section>
              <h2 className="text-base font-extrabold mb-2 lg:mb-8 tracking-tight text-foreground/90">
                What&apos;s on your mind?
              </h2>
              <div className="hidden lg:grid grid-cols-7 gap-x-6 gap-y-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-0">
                    <div className="w-full aspect-square rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded mt-2" />
                  </div>
                ))}
              </div>
              <div className="lg:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0 w-20">
                    <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-14 bg-muted animate-pulse rounded mt-1" />
                  </div>
                ))}
              </div>
            </section>
          ) : displayCategories.length > 0 ? (
            <section>
              <h2 id="food-time-heading" className="text-base font-extrabold mb-2 lg:mb-8 tracking-tight text-foreground/90">
                What&apos;s on your mind?
              </h2>
              <div className="hidden lg:grid grid-cols-7 gap-x-6 gap-y-8">
                {displayCategories.slice(0, 12).map((cat) => {
                  const imageUrl = getCategoryImageUrl(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex flex-col items-center gap-0 group transition-all"
                    >
                      <div className="relative w-full aspect-square rounded-full overflow-hidden">
                        {imageUrl ? (
                          <CategoryImage name={cat.name} imageUrl={imageUrl} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
                            <span className="text-4xl font-bold text-muted-foreground/30">
                              {cat.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-center text-foreground/70 group-hover:text-[#EE7005] transition-colors leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="lg:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
                {displayCategories.map((cat) => {
                  const imageUrl = getCategoryImageUrl(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex flex-col items-center gap-1 shrink-0 w-20 group"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        {imageUrl ? (
                          <CategoryImage name={cat.name} imageUrl={imageUrl} desktop={false} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
                            <span className="text-xl font-bold text-muted-foreground/30">
                              {cat.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-center text-muted-foreground leading-tight truncate w-full">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Explore Kitchens Section */}
          <section className="space-y-6 lg:space-y-10 pt-4 lg:pt-10 border-t border-gray-100">
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
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter">Become a Home Chef</h2>
              <p className="text-sm sm:text-base text-black leading-relaxed max-w-lg font-medium">
                Turn your passion into profession.<br />Cook from home, earn on your terms, and build something extraordinary.
              </p>
              <Link href="/kitchen/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 min-h-11 text-sm font-black text-[#B85300] hover:bg-slate-50 transition-all self-start shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 group">
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
                fetchPriority="high"
              />
            </div>
          </section>

        </ErrorBoundary>
      </div>
    </main>
  );
}
