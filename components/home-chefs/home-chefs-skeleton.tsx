"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"

export function HomeChefsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      <div className="container mx-auto px-4 lg:px-8 pt-2 pb-6 lg:py-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-[13px] mb-5">
          <Skeleton className="h-[18px] w-10" />
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#9CA3AF]" />
          <Skeleton className="h-[18px] w-[74px]" />
        </div>

        {/* Hero Section */}
        <div className="relative bg-[#FFFAF3] rounded-2xl border border-[#F2E8DF] mb-12 flex flex-col lg:flex-row min-h-[160px] lg:min-h-[140px] xl:min-h-[140px] shadow-sm mt-2">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-6 py-8 lg:py-0 lg:pl-10 lg:pr-[240px] xl:pr-[300px] h-auto lg:h-[140px] gap-6 lg:gap-4 xl:gap-8">
            {/* Title & Subtitle */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 lg:max-w-[260px] xl:max-w-[320px] w-full">
              <Skeleton className="h-[40px] w-[200px] mb-1.5" />
              <div className="space-y-1 w-full flex flex-col items-center lg:items-start">
                <Skeleton className="h-3.5 w-full max-w-[280px]" />
                <Skeleton className="h-3.5 w-[85%] max-w-[240px]" />
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-col sm:flex-row flex-nowrap items-center justify-center lg:justify-end gap-5 sm:gap-4 xl:gap-8 shrink-0">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full shrink-0" />
                  <div className="text-left flex flex-col gap-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Image Layer placeholder */}
          <div className="w-full lg:w-auto h-[200px] lg:h-full relative mt-auto lg:absolute lg:right-0 lg:bottom-0 pointer-events-none flex items-end justify-center lg:justify-end">
            <div className="h-[220px] lg:h-[160px] xl:h-[180px] w-[180px] lg:w-[140px] xl:w-[160px] lg:mr-2 xl:mr-8 lg:translate-y-[8px] flex items-end">
              <Skeleton className="w-full h-[90%] rounded-t-full opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-[#FFFFFF] rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] mb-10 flex flex-wrap lg:flex-nowrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] w-full lg:w-auto">
            <Skeleton className="h-[14px] w-[120px] mb-2" />
            <Skeleton className="h-[42px] w-full rounded-lg" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]">
              <Skeleton className="h-[14px] w-[80px] mb-2" />
              <Skeleton className="h-[42px] w-full rounded-lg" />
            </div>
          ))}

          <div className="w-full sm:w-auto flex gap-4 lg:ml-auto">
            <div className="flex-1 sm:flex-none sm:w-[140px]">
              <Skeleton className="h-[14px] w-[60px] mb-2" />
              <Skeleton className="h-[42px] w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Top Rated Home Chefs */}
        <div className="mb-10 bg-[#FCFCFC] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <HomeChefCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* All Home Chefs */}
        <div className="mb-12">
          <Skeleton className="h-6 w-[200px] mb-5" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <HomeChefCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Bottom Features Banner */}
        <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F9FAFB] rounded-2xl p-6 lg:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 flex-1 min-w-[160px]">
              <Skeleton className="w-[26px] h-[26px] rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-[14px] w-[110px]" />
                <Skeleton className="h-[12px] w-[90px]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export function HomeChefCardSkeleton() {
  return (
    <div className="p-0 rounded-xl border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden bg-[#FFFFFF] h-full flex flex-col">
      <div className="p-3 flex gap-3 h-full items-center">
        <Skeleton className="w-[84px] h-[104px] rounded-lg shrink-0" />
        
        <div className="flex flex-col min-w-0 justify-center flex-1 py-0.5">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-[13px] w-20 mb-0.5" />
          <Skeleton className="h-[13px] w-24 mb-1.5" />

          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Skeleton key={star} className="w-[11px] h-[11px] rounded-sm" />
            ))}
          </div>

          <div className="mt-auto flex items-center">
            <Skeleton className="h-[18px] w-14 rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
