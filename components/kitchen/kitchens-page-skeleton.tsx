"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function KitchenCardSkeleton() {
  return (
    <div className="flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.045)] border border-[#E7E7E7] overflow-visible bg-[#FFFFFF] w-full h-full relative group rounded-[16px]">
      <div className="flex flex-col flex-1">
        {/* Image Section */}
        <div className="relative w-full h-[132px] sm:h-[140px] bg-[#F8F8F8] shrink-0 rounded-t-[16px]">
          {/* Top Left Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
            <Skeleton className="h-[23px] w-[70px] rounded-[6px]" />
          </div>

          {/* Top Right Diet Badge */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-end">
            <Skeleton className="h-[22px] w-[64px] rounded-[5px]" />
          </div>

          {/* Chef Avatar with Checkmark */}
          <div className="absolute -bottom-[22px] left-4 z-20">
            <div className="relative">
              <Skeleton className="h-11 w-11 rounded-full border-[2px] border-[#FFFFFF] shadow-[0_1px_4px_rgba(0,0,0,0.18)]" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] z-20 shadow-sm flex items-center justify-center">
                 <Skeleton className="h-[16px] w-[16px] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-3 pt-8 flex flex-col flex-1">
          {/* Kitchen Name */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-[20px] w-3/4 rounded-md" />
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mt-1.5">
            <Skeleton className="h-[18px] w-16 rounded" />
          </div>

          {/* Cuisines */}
          <div className="mt-1.5">
            <Skeleton className="h-[18px] w-1/2 rounded" />
          </div>

          {/* Time & Distance */}
          <div className="flex items-center gap-4 mt-1.5">
            <Skeleton className="h-[18px] w-24 rounded" />
            <Skeleton className="h-[18px] w-16 rounded" />
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 mt-auto flex items-center justify-between gap-1 flex-nowrap">
          <Skeleton className="h-[26px] w-[90px] sm:w-[100px] rounded-[6px] shrink" />
          <Skeleton className="h-[26px] sm:h-[28px] w-[72px] sm:w-[86px] rounded-[6px] shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function KitchensPageSkeleton() {
  return (
    <div className="bg-[#F8F8F8] min-h-screen pt-4 pb-20 text-[#111111]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] font-normal text-[#777777] mb-4">
            <Skeleton className="h-[18px] w-12 rounded" />
            <Skeleton className="h-3 w-3 rounded-sm" />
            <Skeleton className="h-[18px] w-16 rounded" />
          </div>
          <Skeleton className="h-[40px] w-40 rounded-lg mb-1" />
          <Skeleton className="h-[20px] w-96 max-w-full rounded" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0 bg-[#FFFFFF] border border-[#E8E8E8] rounded-[7px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.035)] sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-6">
              {/* Filter sections mock */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-5 w-32 mb-4" />
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-[15px] w-[15px] rounded-sm" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                  {i < 4 && <div className="h-px bg-[#EEEEEE] w-full mt-6" />}
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full lg:w-auto">
            
            {/* Top Quick Filters & Mobile Sort Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4 w-full min-w-0">
              
              {/* Mobile Filter Toggle & Sort */}
              <div className="flex lg:hidden items-center justify-between w-full">
                <Skeleton className="h-[36px] w-[90px] rounded-[6px]" />
                <Skeleton className="h-[36px] w-[120px] rounded-[6px]" />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 lg:pb-0 scrollbar-hide">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="shrink-0 h-[34px] w-[90px] rounded-[6px]" />
                ))}
              </div>

              {/* Desktop Sort */}
              <div className="hidden lg:flex items-center gap-2">
                 <Skeleton className="h-4 w-14 rounded" />
                 <Skeleton className="h-[34px] w-[120px] rounded-[6px]" />
              </div>
            </div>

            {/* Showing Results Info */}
            <div className="mb-4">
               <Skeleton className="h-5 w-48 rounded" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-7">
              {Array.from({ length: 12 }).map((_, i) => (
                <KitchenCardSkeleton key={i} />
              ))}
            </div>
            
          </main>
        </div>
      </div>
    </div>
  );
}
