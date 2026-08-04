"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function HomeKitchenCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-[20px] shadow-sm border border-border overflow-hidden shrink-0 w-[300px]">
      <div className="relative h-[180px] w-full bg-muted/50 shrink-0">
        <Skeleton className="absolute top-3 left-3 h-5 w-20 rounded-sm" />
        <div className="absolute -bottom-5 left-4">
          <Skeleton className="h-11 w-11 rounded-full border-[3px] border-white" />
        </div>
      </div>
      <div className="p-4 pt-7 flex flex-col flex-1">
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="mt-4 pt-4 flex-1 flex flex-col justify-end">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 pb-20 pt-10 lg:pt-14 space-y-14 lg:space-y-20">

        {/* What Would You Like To Eat? */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <Skeleton className="h-7 sm:h-9 w-72 max-w-full" />
            <Skeleton className="hidden sm:flex h-4 w-32" />
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 sm:gap-x-8 md:gap-x-12 gap-y-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 w-18 sm:w-22.5 md:w-25 lg:w-27.5">
                <Skeleton className="w-full aspect-square rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </section>

        {/* Top Home Kitchens Near You */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 sm:h-9 w-64 max-w-full" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="hidden sm:flex h-4 w-32" />
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4 lg:grid lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <HomeKitchenCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Why Tiffin Carrier */}
        <section className="bg-white rounded-2xl lg:rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left space-y-3">
              <Skeleton className="h-7 sm:h-8 w-48 mx-auto lg:mx-0" />
              <Skeleton className="h-4 w-44 mx-auto lg:mx-0" />
              <Skeleton className="h-4 w-52 mx-auto lg:mx-0" />
            </div>
            <div className="relative h-60 lg:h-80 order-1 lg:order-2 flex items-center justify-center">
              <Skeleton className="w-40 lg:w-52 h-52 lg:h-72 rounded-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-4 order-3 items-center lg:items-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-44" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Icons Bar */}
        <section className="py-4 lg:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 px-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* How It Works */}
          <div className="bg-[#fdfbf7] rounded-2xl p-6 border border-gray-100 flex flex-col">
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="grid grid-cols-[1fr_auto_1fr] gap-y-8 items-center w-full px-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Meet Our Home Chefs */}
          <div className="bg-[#fdfbf7] rounded-2xl p-6 border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-5 my-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Become a Home Chef */}
          <div className="bg-[#fdfbf7] rounded-2xl p-6 border border-gray-100 relative overflow-hidden flex flex-col min-h-70">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="mt-5">
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
            <div className="absolute right-0 bottom-0 w-35 h-50">
              <Skeleton className="w-full h-full rounded-tl-full" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-8">
          <Skeleton className="h-7 sm:h-9 w-72 max-w-full mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative">
                <Skeleton className="absolute top-4 right-5 h-8 w-6" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3.5 w-3/5" />
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-3 w-3 rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
