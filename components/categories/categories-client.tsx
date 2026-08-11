"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { ChefHat, ShieldCheck, Clock3, Leaf, UsersRound, ChevronRight } from "lucide-react"
import { CategoriesSkeleton } from "@/components/categories/categories-skeleton"

const CATEGORY_COLORS: Record<string, string> = {
  "south indian": "#FCE3D3",
  "north indian": "#FEECC1",
  "chinese": "#FBE2E1",
  "snacks": "#E4DCF1",
  "healthy meals": "#E7F0DC",
  "biryani": "#F2E5D5",
  "breakfast": "#EAF1D9",
  "lunch": "#DBECF4",
  "evening snacks": "#FCE7DA",
  "dinner": "#FEEDC2",
  "beverages": "#DAECF4",
  "desserts": "#E7E0F2",
}

const DEFAULT_COLORS = [
  "#FCE3D3", "#FEECC1", "#FBE2E1", "#E4DCF1", "#E7F0DC", "#F2E5D5",
  "#EAF1D9", "#DBECF4", "#FCE7DA", "#FEEDC2", "#DAECF4", "#E7E0F2"
]

const features = [
  { title: "100% Homemade", desc: "Made with love & care", icon: ChefHat, color: "#FE4A00" },
  { title: "Hygienic & Safe", desc: "Verified home kitchens", icon: ShieldCheck, color: "#00512F" },
  { title: "Pre-book & Save Time", desc: "Order in advance", icon: Clock3, color: "#FE4A00" },
  { title: "Fresh Ingredients", desc: "Sourced daily", icon: Leaf, color: "#00512F" },
  { title: "Support Local Women", desc: "Empowering homemakers", icon: UsersRound, color: "#FE4A00" },
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
    <main className="min-h-screen pb-24 font-sans" style={{ backgroundColor: "#FAF8F7" }}>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-8 lg:py-[60px]">
        
        {/* Top Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start mb-[48px] gap-8">
          
          {/* Left Text */}
          <div className="flex-1 max-w-2xl pt-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-[6px] mb-[24px]">
              <Link href="/" className="text-[#333333] text-[12px] font-[500] hover:underline transition-all">
                Home
              </Link>
              <ChevronRight className="w-[12px] h-[12px] text-[#777777]" strokeWidth={2} />
              <span className="text-[#333333] text-[12px] font-[500]">
                Categories
              </span>
            </div>

            <h1 className="text-[#01441F] text-[36px] font-[700] mb-[16px] leading-tight tracking-tight">
              Categories
            </h1>
            <p className="text-[#3F4145] text-[14px] font-[400] leading-[1.55] max-w-[480px]">
              Explore a wide variety of homemade meals from talented home chefs.
              <br className="hidden sm:block" />
              Choose from different cuisines, meal times and special preferences.
            </p>
          </div>

          {/* Right Support Card */}
          <div 
            className="w-full xl:w-[460px] shrink-0 relative bg-[#FFFFFF] flex items-center justify-between overflow-hidden"
            style={{
              borderRadius: "10px",
              border: "1px solid #F6E5DD",
              boxShadow: "0 2px 10px rgba(55, 35, 25, 0.035)",
              height: "120px"
            }}
          >
            <div className="pl-[28px] z-10 py-[24px] max-w-[65%]">
              <h3 className="text-[20px] font-[700] mb-[6px] whitespace-nowrap tracking-tight">
                <span className="text-[#01441F]">Support </span>
                <span className="text-[#FE4A00]">Home Chefs</span>
              </h3>
              <p className="text-[#252525] text-[13px] leading-[1.55]">
                Every order you place supports<br />a homemaker and her family.
              </p>
            </div>
            
            {/* Decoration SVG */}
            <div className="absolute left-[195px] bottom-[30px] w-[130px] h-[45px] z-10 pointer-events-none hidden sm:block">
              <svg viewBox="0 0 200 60" fill="none" className="w-full h-full overflow-visible text-[#176B43]">
                  <path d="M 0 50 L 90 50 C 70 25 85 15 90 30 C 95 15 110 25 90 50 Q 130 50 180 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* Chef Image */}
            <div className="absolute right-[-10px] bottom-0 h-[130%] w-[170px] z-0 pointer-events-none">
               <Image
                  src="/categories/home-chef.webp"
                  alt="Support Home Chefs"
                  fill
                  className="object-contain object-bottom scale-[1.05] origin-bottom-right"
                  sizes="170px"
                  priority
                />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[20px] lg:gap-x-[32px] gap-y-[48px] mb-[64px] justify-items-center">
            {categories.map((cat, i) => {
              const bgClass = CATEGORY_COLORS[cat.name.toLowerCase()] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
              const imageUrl = cat.imageUrl;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex flex-col items-center group cursor-pointer w-full max-w-[190px]"
                >
                  <div 
                    className="flex items-center justify-center rounded-full mb-[18px] transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: bgClass,
                      width: "100%",
                      aspectRatio: "1/1"
                    }}
                  >
                    <div 
                      className="relative w-[100%] h-[100%] rounded-full overflow-visible"
                      style={{
                        filter: "drop-shadow(0 5px 5px rgba(45, 30, 20, 0.12))"
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 190px"
                          className="object-contain scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-black/5">
                          <span className="text-[32px] font-bold text-black/20">
                            {cat.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[#35373A] text-[15px] font-[700] text-center tracking-tight">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom Feature Bar */}
        <div 
          className="w-full bg-[#FFFFFF] flex flex-col md:flex-row items-stretch overflow-hidden"
          style={{
            borderRadius: "10px",
            border: "1px solid #EEE7E3",
            boxShadow: "0 2px 8px rgba(35, 25, 20, 0.035)"
          }}
        >
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={`flex-1 flex items-center justify-center gap-[14px] py-[28px] px-[16px] ${
                i !== features.length - 1 ? 'border-b md:border-b-0 md:border-r border-dotted border-[#E3DEDA]' : ''
              }`}
            >
              <feature.icon size={28} strokeWidth={1.8} color={feature.color} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-[#171717] text-[13px] font-[700] mb-[2px]">
                  {feature.title}
                </span>
                <span className="text-[#4F4F4F] text-[11px] font-[400]">
                  {feature.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

