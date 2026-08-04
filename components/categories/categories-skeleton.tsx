"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CategoriesSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">

          {/* Left: Title & Text */}
          <div className="flex-1 lg:max-w-xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-6">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3.5 w-16" />
            </div>

            <Skeleton className="h-9 lg:h-11 w-48 mb-4" />

            <div className="space-y-2.5 max-w-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Right: Support Banner */}
          <div className="lg:w-[450px] shrink-0 mt-4 lg:mt-0">
            <div className="bg-[#FFFDF9] border border-[#F5E6D3] rounded-[24px] p-6 lg:p-8 relative overflow-hidden flex items-center h-full min-h-[160px] shadow-sm">
              <div className="z-10 w-[60%] space-y-3">
                <Skeleton className="h-6 lg:h-7 w-40" />
                <Skeleton className="h-3.5 w-full max-w-[200px]" />
                <Skeleton className="h-3.5 w-3/4 max-w-[160px]" />
              </div>
              <div className="absolute right-0 bottom-0 w-[45%] h-[120%] -mb-4">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8 lg:gap-x-10 lg:gap-y-14 mb-20 px-1 lg:px-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-full aspect-square rounded-full mb-2 lg:mb-4" />
              <Skeleton className="h-3.5 lg:h-5 w-20 lg:w-28" />
            </div>
          ))}
        </div>

        {/* Trust Badges - Desktop */}
        <div className="hidden lg:flex bg-white rounded-2xl py-8 px-4 mb-10 border border-gray-100 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-1 flex items-center justify-center gap-3 px-4 ${i !== 4 ? 'border-r border-dotted border-gray-300' : ''}`}>
              <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges - Mobile */}
        <div className="flex lg:hidden bg-white shadow-sm rounded-xl py-6 px-2 border border-gray-100 mb-8 overflow-hidden">
          <div className="flex justify-between items-start w-full divide-x divide-dotted divide-gray-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-start text-center flex-1 px-1">
                <Skeleton className="w-5 h-5 rounded-md mb-2" />
                <Skeleton className="h-2.5 w-14 mb-1.5" />
                <Skeleton className="h-2 w-10" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
