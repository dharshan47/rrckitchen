"use client";

import Link from "next/link";
import Image from "next/image";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { InfiniteKitchenGrid } from "@/components/kitchen/infinite-kitchen-grid";
import type { SortOption } from "@/components/kitchen/sort-by-dialog";
import type { VegFilterValue } from "@/components/kitchen/veg-filter";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { FastDeliveryCarousel } from "@/components/home/fast-delivery-carousel";

const recipes = [
  { name: "Dosa", slug: "dosa" },
  { name: "Biryani", slug: "biryani" },
  { name: "Idli", slug: "idli" },
  { name: "Vada", slug: "vada" },
  { name: "Momos", slug: "momos" },
  { name: "Parotta", slug: "parotta" },
  { name: "Noodles", slug: "noodles" },
  { name: "Pancake", slug: "pancake" },
  { name: "Sandwich", slug: "sandwich" },
];

export function HomeClient() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [vegFilter, setVegFilter] = useState<VegFilterValue>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-360 px-4 lg:px-12 pb-16 pt-1 lg:pt-8 space-y-6 lg:space-y-20">
        <ErrorBoundary>
          {/* Fast Delivery - Nearby Kitchens */}
          <FastDeliveryCarousel />

          {/* What's on Your Mind - Recipe Navigation */}
          <section>
            <h2 className="text-base font-extrabold mb-2 lg:mb-6 tracking-tight text-foreground/90">
              {userName ? `${userName}, What` : "What"}&apos;s on your mind?
            </h2>
            <div className="hidden lg:grid grid-cols-7 gap-x-6 gap-y-8">
              {recipes.slice(0, 7).map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={`/search?q=${recipe.slug}`}
                  className="flex flex-col items-center gap-0 group transition-all"
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden">
                    <Image
                      src="/categories/idli.png"
                      alt={recipe.name}
                      fill
                      sizes="(min-width: 1024px) calc(100vw / 7 - 48px), 64px"
                      className="object-contain scale-110 drop-shadow-md p-3"
                    />
                  </div>
                  <span className="text-sm font-bold text-center text-foreground/70 group-hover:text-[#EE7005] transition-colors leading-tight mt-2">
                    {recipe.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="lg:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 touch-pan-x">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={`/search?q=${recipe.slug}`}
                  className="flex flex-col items-center gap-1 shrink-0 w-20 group"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src="/categories/idli.png"
                      alt={recipe.name}
                      fill
                      sizes="64px"
                      className="object-contain scale-110 drop-shadow-md p-2"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-center text-muted-foreground leading-tight truncate w-full">
                    {recipe.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

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
                fetchPriority="high"
              />
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </main>
  );
}
