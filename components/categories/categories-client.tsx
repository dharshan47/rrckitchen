"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { ChefHat, ShieldCheck, Clock, Leaf, Users, ChevronRight, ShoppingBag } from "lucide-react"
import { CategoriesSkeleton } from "@/components/categories/categories-skeleton"

const PASTEL_COLORS = [
  "bg-[#FFF4E5]", // Light Orange
  "bg-[#FFF9D2]", // Light Yellow
  "bg-[#FCE4E4]", // Pink
  "bg-[#F3E5F5]", // Light Purple
  "bg-[#E6F4EA]", // Light Green
  "bg-[#FFF4E5]", // Light Orange
  "bg-[#E6F4EA]", // Light Green
  "bg-[#E5F5FF]", // Light Blue
  "bg-[#FFF4E5]", // Light Orange
  "bg-[#FDF3D2]", // Yellow
  "bg-[#E5F5FF]", // Blue
  "bg-[#F0EDF6]", // Purple
]

const desktopTrustBadges = [
  { title: "100% Homemade", desc: "Made with love & care", icon: ChefHat, iconColor: "text-red-500" },
  { title: "Hygienic & Safe", desc: "Verified home kitchens", icon: ShieldCheck, iconColor: "text-green-600" },
  { title: "Pre-book & Save Time", desc: "Order in advance", icon: Clock, iconColor: "text-orange-500" },
  { title: "Fresh Ingredients", desc: "Sourced daily", icon: Leaf, iconColor: "text-green-600" },
  { title: "Support Local Women", desc: "Empowering homemakers", icon: Users, iconColor: "text-orange-500" },
]

const mobileTrustBadges = [
  { title: "100% Homemade", desc: "Made with love & care", icon: ChefHat, iconColor: "text-red-500" },
  { title: "Hygienic & Safe", desc: "Verified home kitchens", icon: ShieldCheck, iconColor: "text-green-600" },
  { title: "On-time Delivery", desc: "Always on time", icon: Clock, iconColor: "text-orange-500" },
  { title: "Secure Payments", desc: "100% secure", icon: ShoppingBag, iconColor: "text-green-600" },
]

interface Category {
  id: string
  name: string
  kitchenCount: number
  imageUrl: string
}

export function CategoriesClient() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen/categories", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load categories")
      return res.json() as Promise<Category[]>
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return <CategoriesSkeleton />
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">

          {/* Left: Title & Text */}
          <div className="flex-1 lg:max-w-xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0A3D24] font-bold">Categories</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0A3D24] mb-4">
              Categories
            </h1>

            <p className="text-sm lg:text-[15px] text-gray-600 font-medium leading-relaxed max-w-md">
              Explore a wide variety of homemade meals from talented home chefs. Choose from different cuisines, meal times and special preferences.
            </p>
          </div>

          {/* Right: Support Banner */}
          <div className="lg:w-[450px] shrink-0 mt-4 lg:mt-0">
            <div className="bg-[#FFFDF9] border border-[#F5E6D3] rounded-[24px] p-6 lg:p-8 relative overflow-hidden flex items-center h-full min-h-[160px] shadow-sm">
              <div className="z-10 w-[60%]">
                <h3 className="text-[18px] lg:text-[22px] font-black text-[#0A3D24] mb-2 leading-tight tracking-tight">
                  Support <span className="text-[#EE7005]">Home Chefs</span>
                </h3>
                <p className="text-[12px] lg:text-[13px] text-gray-700 font-medium leading-snug">
                  Every order you place supports a homemaker and her family.
                </p>
              </div>
              {/* Illustration */}
              <div className="absolute right-0 bottom-0 w-[45%] h-[120%] -mb-4">
                <Image
                  src="/categories/home-chef.webp"
                  alt="Home Chef"
                  fill
                  className="object-contain object-bottom scale-[1.15]"
                />
              </div>
              {/* Decorative heart loop line */}
              <div className="absolute bottom-6 left-1/3 w-32 h-12 text-[#168846]">
                <svg viewBox="0 0 200 60" fill="none" className="w-full h-full overflow-visible">
                  <path d="M 0 50 L 90 50 C 70 25 85 15 90 30 C 95 15 110 25 90 50 Q 130 50 180 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {!categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-500 max-w-md">Check back soon — new categories are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8 lg:gap-x-10 lg:gap-y-14 mb-20 px-1 lg:px-0">
            {categories.map((cat, i) => {
              const bgClass = PASTEL_COLORS[i % PASTEL_COLORS.length];
              const imageUrl = cat.imageUrl;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-full aspect-square rounded-full flex items-center justify-center p-2 lg:p-4 mb-2 lg:mb-4 transition-transform duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md ${bgClass}`}>
                    <div className="relative w-[90%] h-[90%] drop-shadow-md">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 33vw, 20vw"
                          className="object-contain scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-black/5">
                          <span className="text-xl lg:text-3xl font-bold text-muted-foreground/30">
                            {cat.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] lg:text-base font-bold text-[#0A3D24] text-center leading-tight tracking-tight px-1">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Trust Badges - Desktop */}
        <div className="hidden lg:flex bg-white rounded-2xl py-8 px-4 mb-10 border border-gray-100 shadow-sm">
          {desktopTrustBadges.map((badge, i) => (
            <div key={i} className={`flex-1 flex items-center justify-center gap-3 px-4 ${i !== desktopTrustBadges.length - 1 ? 'border-r border-dotted border-gray-300' : ''}`}>
              <badge.icon className={`w-7 h-7 ${badge.iconColor} shrink-0`} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0A3D24] leading-tight mb-0.5">{badge.title}</span>
                <span className="text-[11px] text-gray-500 font-medium leading-tight">{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges - Mobile */}
        <div className="flex lg:hidden bg-white shadow-sm rounded-xl py-6 px-2 border border-gray-100 mb-8 overflow-hidden">
          <div className="flex justify-between items-start w-full divide-x divide-dotted divide-gray-200">
            {mobileTrustBadges.map((badge, i) => (
              <div key={i} className="flex flex-col items-center justify-start text-center flex-1 px-1">
                <badge.icon className={`w-5 h-5 ${badge.iconColor} mb-2 shrink-0`} strokeWidth={1.5} />
                <span className="text-[9px] font-bold text-[#0A3D24] leading-[1.1] mb-1">{badge.title}</span>
                <span className="text-[8px] text-gray-500 font-medium leading-[1.1] hidden sm:block">{badge.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
