"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils"

export function HomeKitchenCardSkeleton() {
  return (
    <div className="flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.045)] border border-[#E7E7E7] overflow-visible bg-[#FFFFFF] w-full h-full relative group rounded-[16px]">
      <div className="flex flex-col flex-1">
        {/* Image Section */}
        <div className="relative w-full h-[132px] sm:h-[140px] bg-muted shrink-0 rounded-t-[16px]">
          <Skeleton className="absolute inset-0 rounded-t-[16px]" />

          {/* Top Left Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
            <Skeleton className="h-6 w-20 rounded-[6px]" />
          </div>

          {/* Chef Avatar without Checkmark */}
          <div className="absolute -bottom-[22px] left-4 z-20">
            <Skeleton className="h-11 w-11 rounded-full border-[2px] border-[#FFFFFF] shadow-[0_1px_4px_rgba(0,0,0,0.18)] bg-white" />
          </div>
        </div>

        {/* Content Section (home variant) */}
        <div className="px-4 pb-4 pt-7 flex flex-col flex-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-3/4 rounded-[4px]" />
            <Skeleton className="h-[18px] w-[18px] rounded-full shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 mt-2.5 text-[12.5px] text-[#555555] font-medium">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-12" />
            </div>

            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-14" />
            </div>
          </div>

          <div className="mt-4">
            <Skeleton className="w-full h-[36px] rounded-[6px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <main className="min-h-screen bg-white text-[#111111] relative">
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 pb-8 pt-10 lg:pt-14 space-y-14 lg:space-y-20">

        {/* Category Carousel (WhatsOnYourMind) */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-[17px] sm:text-2xl lg:text-[1.65rem] font-bold text-black tracking-tight uppercase">
              What Would You Like To Eat?
            </h2>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[12px] sm:text-sm font-bold text-[#053F1F] shrink-0">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Horizontal scroll on mobile, 2 rows layout */}
          <div className="grid grid-rows-2 grid-flow-col gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-10 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 w-[85px] sm:w-[110px] md:w-[130px] snap-start"
              >
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white">
                  <Skeleton className="absolute inset-0" />
                </div>
                <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </section>

        {/* Top Home Kitchens Near You */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex flex-col gap-1 sm:gap-2">
              <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black text-[#111111] tracking-tight uppercase leading-none">
                Top Home Kitchens Near You
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-[#6B7280] font-medium mt-0.5">
                <MapPin className="h-4 w-4 text-[#c03a00]" />
                <p>Serving delicious meals in an Ever Silver Tiffin Carrier</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#c03a00] shrink-0 mt-0.5">
              View All Kitchens
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible scrollbar-none pb-4 snap-x snap-mandatory lg:snap-none">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="snap-start shrink-0 w-[90vw] sm:w-[calc(50%-10px)] lg:w-auto">
                <HomeKitchenCardSkeleton />
              </div>
            ))}
          </div>
        </section>

        {/* Why Tiffin Carrier */}
        <section className="bg-[#FDF8F1] rounded-2xl lg:rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:px-16 lg:py-12 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.2fr] gap-8 lg:gap-12 items-center">
            {/* Left text */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] tracking-wide uppercase mb-4 lg:mb-10">
                WHY TIFFIN CARRIER?
              </h2>
              <div className="space-y-1.5 flex flex-col items-center lg:items-start">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-52" />
              </div>
            </div>

            {/* Middle Image */}
            <div className="relative h-[220px] sm:h-[280px] lg:h-[300px] flex items-center justify-center">
              <Skeleton className="w-[80%] h-[90%] rounded-full opacity-50" />
            </div>

            {/* Right Checkmarks */}
            <div className="flex flex-col justify-center gap-3.5 lg:gap-5 items-start mx-auto lg:mx-0 lg:pl-16">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="flex items-center justify-center shrink-0 text-[#087A35]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[20px] w-[20px]">
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <path d="M8 12.5l3 3 5-6" />
                    </svg>
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Icons Bar */}
        <section className="bg-[#FDF8F1] rounded-2xl lg:rounded-3xl overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <div className="flex items-stretch min-w-max lg:min-w-0 lg:grid lg:grid-cols-5 py-4 lg:py-0">
            {[1, 2, 3, 4, 5].map((item, i, arr) => (
              <div key={i} className="flex relative snap-start shrink-0 w-[280px] lg:w-auto items-stretch">
                <div className="flex items-start gap-4 p-5 lg:p-6 xl:p-8 w-full">
                  <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 shrink-0 rounded-full" />
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-32" />
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

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* How It Works */}
          <div className="bg-[#FDF8F1] rounded-[20px] p-5 lg:p-6 xl:p-8 relative flex flex-col justify-center min-h-[220px] shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide mb-8">
              How It Works
            </h3>

            <div className="flex-1 flex flex-row items-start justify-between w-full">
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <div key={idx} className={cn("flex flex-col items-center text-center gap-2.5 flex-1 relative", step === 5 ? "hidden sm:flex" : "")}>
                  <div className="flex items-center justify-center mb-1 h-8">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meet Our Home Chefs */}
          <div className="bg-[#FEFEFE] rounded-2xl p-6 border border-[#EEEEEE] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black text-[#003015] uppercase tracking-widest">
                Meet Our Home Chefs
              </h3>
              <div className="text-[11px] font-bold text-[#087A35] flex items-center gap-0.5">
                View All
              </div>
            </div>
            <div className="space-y-5 my-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full border-2 border-white shrink-0 shadow-sm" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Become a Home Chef */}
          <div className="bg-[#FDF8F1] rounded-[20px] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-sm">
            <div className="relative z-10 w-[60%] sm:w-[55%] flex flex-col items-start">
              <h3 className="text-sm font-bold text-[#c03a00] uppercase tracking-wide mb-3">
                Become a Home Chef
              </h3>
              <div className="space-y-1 mb-5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-[36px] w-[100px] rounded-full shadow-md" />
            </div>

            <div className="absolute right-0 bottom-0 w-[45%] max-w-[190px] h-[105%] pointer-events-none">
              <Skeleton className="absolute right-0 bottom-0 w-[90%] h-[90%] rounded-tl-full opacity-50" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-5">
          <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111111] uppercase tracking-wide">
            Loved by Thousands of Families
          </h2>

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
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-3.5 w-3.5 rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App Download Banner */}
        <section className="w-full px-3 sm:px-6 lg:px-8 mt-14 sm:mt-20 lg:mt-28 xl:mt-32 mb-6 overflow-visible">
          <div className="w-full mx-auto max-w-[1300px]">
            <div className="bg-gradient-to-br from-[#003015] via-[#003819] to-[#00220e] border border-emerald-900/40 w-full rounded-2xl sm:rounded-[24px] shadow-xl sm:shadow-2xl relative px-4 sm:px-8 lg:px-10 xl:px-12 py-5 sm:py-7 lg:py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-8">

              <div className="flex flex-row items-center gap-3 sm:gap-6 lg:gap-8 flex-1 min-w-0">
                <div className="relative h-[150px] w-[80px] sm:h-[240px] sm:w-[135px] md:h-[280px] md:w-[155px] lg:h-[330px] lg:w-[185px] xl:h-[390px] xl:w-[220px] -mt-12 sm:-mt-24 md:-mt-28 lg:-mt-36 xl:-mt-44 shrink-0 z-10">
                  <Skeleton className="absolute inset-0 rounded-[24px]" />
                </div>

                <div className="flex flex-col justify-center items-start text-left z-10 flex-1 min-w-0">
                  <Skeleton className="h-6 sm:h-8 lg:h-10 w-full max-w-[400px] mb-2" />
                  <Skeleton className="h-6 sm:h-8 lg:h-10 w-3/4 max-w-[300px]" />
                  <Skeleton className="h-4 sm:h-5 w-48 mt-3 mb-5" />

                  <div className="flex flex-row items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
                    <Skeleton className="h-[36px] sm:h-[44px] lg:h-[48px] w-[120px] sm:w-[140px] lg:w-[160px] rounded-lg" />
                    <Skeleton className="h-[36px] sm:h-[44px] lg:h-[48px] w-[120px] sm:w-[140px] lg:w-[160px] rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="flex flex-row flex-nowrap items-start justify-between sm:justify-around lg:justify-end gap-2 sm:gap-4 lg:gap-3 xl:gap-6 z-10 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t border-white/10 lg:border-t-0">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center w-[72px] sm:w-[86px] lg:w-[84px] xl:w-[96px]"
                  >
                    <Skeleton className="h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 xl:h-14 xl:w-14 rounded-full" />
                    <div className="mt-2 flex flex-col items-center gap-1 w-full px-1">
                      <Skeleton className="h-2.5 w-full max-w-[60px]" />
                      <Skeleton className="h-2.5 w-3/4 max-w-[40px]" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
