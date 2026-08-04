"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function KitchenCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Image */}
      <div className="relative w-full h-[160px] md:h-[180px] shrink-0 bg-muted/50">
        <Skeleton className="absolute top-2 md:top-3 left-2 md:left-3 h-5 w-16 rounded-sm" />
        <Skeleton className="absolute top-2 right-2 md:top-3 md:right-3 h-5 w-20 rounded-sm" />
        <div className="absolute -bottom-4 md:-bottom-5 left-3 md:left-4">
          <Skeleton className="h-10 w-10 md:h-11 md:w-11 rounded-full border-[2.5px] border-white" />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-3 md:p-4 pt-6 md:pt-7 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 md:h-5 w-40" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          <Skeleton className="h-3 md:h-3.5 w-3/4 mt-1.5" />
          <div className="flex items-center gap-3 mt-2 md:mt-2.5">
            <Skeleton className="h-3 md:h-4 w-16" />
            <Skeleton className="h-3 md:h-4 w-14" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <Skeleton className="h-6 md:h-7 w-28 rounded-md" />
          <Skeleton className="h-7 md:h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function KitchensPageSkeleton() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen pt-4 md:pt-6 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3.5 w-16" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl p-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-6">
              {/* Diet Preference */}
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div>
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                  ))}
                </div>
              </div>

              <Skeleton className="w-full h-11 rounded-lg mt-4" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* Header section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 md:h-9 w-40" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
                  <Skeleton className="h-11 flex-1 sm:flex-none w-full sm:w-28 rounded-lg lg:hidden" />
                  <Skeleton className="h-11 flex-1 sm:flex-none w-full sm:w-32 rounded-lg" />
                </div>
              </div>

              {/* Quick Filters Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="shrink-0 h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>

            {/* Kitchen Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <KitchenCardSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
