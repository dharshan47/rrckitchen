"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"

export function HomeChefsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      <div className="container mx-auto px-4 lg:px-8 pt-2 pb-6 lg:py-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-[13px] mb-5">
          <Skeleton className="h-[18px] w-[38px] rounded-[4px]" />
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#9CA3AF]" />
          <Skeleton className="h-[18px] w-[76px] rounded-[4px]" />
        </div>

        {/* Hero Section */}
        <div className="relative bg-[#FFFAF3] rounded-2xl border border-[#F2E8DF] mb-12 flex flex-col lg:flex-row min-h-[160px] lg:min-h-[140px] xl:min-h-[140px] shadow-sm mt-2 overflow-hidden">
          {/* Left Side Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-6 py-8 lg:py-0 lg:pl-10 lg:pr-[240px] xl:pr-[300px] h-auto lg:h-[140px] gap-6 lg:gap-4 xl:gap-8">
            {/* Title & Subtitle */}
            <div className="text-center lg:text-left shrink-0 lg:max-w-[260px] xl:max-w-[320px] w-full">
              <Skeleton className="h-[36px] lg:h-[40px] xl:h-[44px] w-[180px] lg:w-[200px] mb-1.5 mx-auto lg:mx-0 rounded-[6px]" />
              <div className="space-y-[5px] w-full flex flex-col items-center lg:items-start">
                <Skeleton className="h-[18px] w-full max-w-[280px] rounded-[4px]" />
                <Skeleton className="h-[18px] w-[85%] max-w-[240px] rounded-[4px]" />
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-col sm:flex-row flex-nowrap items-center justify-center lg:justify-end gap-4 sm:gap-3 xl:gap-6 shrink-0 mt-2 lg:mt-0">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <Skeleton className="w-10 h-10 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full shrink-0" />
                  <div className="text-left flex flex-col gap-[3px]">
                    <Skeleton className="h-[15px] xl:h-[16px] w-[80px] xl:w-[90px] rounded-[4px]" />
                    <Skeleton className="h-[13px] xl:h-[14px] w-[100px] xl:w-[110px] rounded-[4px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Image Layer */}
          <div className="w-full lg:w-[280px] xl:w-[320px] h-[180px] lg:h-full relative mt-4 lg:mt-0 lg:absolute lg:right-0 lg:bottom-0 lg:top-0 pointer-events-none flex items-center justify-center lg:justify-end">
            <Skeleton className="absolute inset-0 w-full h-full opacity-30 rounded-none" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-[#FFFFFF] rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] mb-10 flex flex-wrap lg:flex-nowrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] w-full lg:w-auto">
            <Skeleton className="h-[16px] w-[120px] mb-2 rounded-[4px]" />
            <Skeleton className="h-[42px] w-full rounded-lg" />
          </div>

          {[
            { labelW: "50px", wClass: "w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]" }, // Cuisine
            { labelW: "65px", wClass: "w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]" }, // Meal Type
            { labelW: "70px", wClass: "w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[140px]" }, // Availability
            { labelW: "42px", wClass: "w-[calc(50%-8px)] sm:w-[calc(25%-12px)] lg:w-[130px]" }, // Rating
          ].map((item, i) => (
            <div key={i} className={item.wClass}>
              <Skeleton className="h-[16px] mb-2 rounded-[4px]" style={{ width: item.labelW }} />
              <Skeleton className="h-[42px] w-full rounded-lg" />
            </div>
          ))}

          <div className="w-full sm:w-auto flex gap-4 lg:ml-auto">
            <div className="flex-1 sm:flex-none sm:w-[140px]">
              <Skeleton className="h-[16px] w-[48px] mb-2 rounded-[4px]" />
              <Skeleton className="h-[42px] w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Top Rated Home Chefs */}
        <div className="mb-10 bg-[#FCFCFC] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex flex-col justify-center">
              <Skeleton className="h-[20px] w-[170px] mb-0.5 rounded-[4px]" />
              <Skeleton className="h-[16px] w-[140px] rounded-[4px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <HomeChefCardSkeleton key={`top-${i}`} />
            ))}
          </div>
        </div>

        {/* All Home Chefs */}
        <div className="mb-12">
          <Skeleton className="h-[24px] w-[160px] mb-5 rounded-[4px]" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <HomeChefCardSkeleton key={`all-${i}`} />
            ))}
          </div>
        </div>

        {/* Bottom Features Banner */}
        <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F9FAFB] rounded-2xl p-6 lg:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-6">
          {[1, 2, 3, 4, 5].map((i, index) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-3 flex-1 min-w-[160px]">
                <div className="shrink-0 flex items-center justify-center">
                  <Skeleton className="w-[26px] h-[26px] rounded-full shrink-0" />
                </div>
                <div className="flex flex-col justify-center">
                  <Skeleton className="h-[16px] w-[110px] mb-0.5 rounded-[4px]" />
                  <Skeleton className="h-[14px] w-[90px] rounded-[4px]" />
                </div>
              </div>
              {index < 4 && <div className="hidden lg:block w-px h-10 bg-[#E5E7EB]" />}
            </React.Fragment>
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
        
        <div className="flex flex-col min-w-0 justify-center flex-1 py-0.5 h-[104px]">
          <Skeleton className="h-[16px] w-[85%] mb-1 rounded-[4px]" />
          <Skeleton className="h-[14px] w-[60%] mb-0.5 rounded-[4px]" />
          <Skeleton className="h-[14px] w-[75%] mb-1.5 rounded-[4px]" />

          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Skeleton key={star} className="w-[11px] h-[11px] rounded-[2px]" />
            ))}
          </div>

          <div className="mt-auto flex items-center">
            <Skeleton className="h-[18px] w-[54px] rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
