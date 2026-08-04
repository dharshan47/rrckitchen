"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function HomeChefsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-50/80 to-orange-100/40 mb-10 flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-12 z-10 w-full">
            <Skeleton className="h-12 md:h-14 w-64 md:w-80 mb-4" />
            <div className="space-y-2 max-w-2xl mb-8">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 relative h-[300px] md:h-[400px] mt-8 md:mt-0">
            <div className="absolute inset-0 right-0 overflow-hidden">
              <div className="absolute right-0 bottom-0 w-[90%] md:w-[120%] h-full flex items-end">
                <Skeleton className="w-full h-full rounded-tl-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-12 flex flex-col lg:flex-row gap-4 items-end">
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-auto flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-11 w-full lg:w-36 rounded-xl" />
            </div>
            <div className="flex items-end">
              <Skeleton className="h-11 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Top Rated Home Chefs */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <HomeChefCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* All Home Chefs */}
        <div className="mb-16">
          <Skeleton className="h-6 w-56 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <HomeChefCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Bottom Features Banner */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-wrap justify-between gap-8 md:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 flex-1 min-w-[200px]">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeChefCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white p-4">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-24 rounded-xl shrink-0" />
        <div className="flex flex-col py-1 flex-1 min-w-0">
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-3 w-3 rounded-sm" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
