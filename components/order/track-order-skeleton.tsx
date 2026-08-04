"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TrackOrderSkeleton() {
  return (
    <div className="bg-[#FAF9F8] min-h-screen pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3.5 w-20" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-52" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="bg-orange-50/70 border border-orange-100/80 rounded-[20px] p-4 flex items-center justify-between gap-6 md:min-w-[320px] shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-sm" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        {/* ETA Banner */}
        <div className="mb-6 rounded-3xl border border-green-100 bg-green-50 p-5 flex items-center gap-4 shadow-sm">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="lg:order-2 flex-1">
            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
              <Skeleton className="h-[300px] lg:h-[400px] w-full rounded-none" />
            </div>
          </div>

          {/* Order Progress */}
          <div className="lg:w-[420px] shrink-0 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col order-2">
            <Skeleton className="h-5 w-36 mb-8" />
            <div className="relative flex-1 px-2 space-y-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-5">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2 pt-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Status Card */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <Card className="border-primary/20">
          <div className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
          </div>
        </Card>
      </div>

      {/* Delivery Partner Card */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <Card>
          <div className="p-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-44" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full shrink-0" />
          </div>
        </Card>
      </div>

      {/* Order Details Grid */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div>
              <Skeleton className="h-5 w-32 mb-5" />
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-36 mb-5" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-32 mb-5" />
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-32 mb-5" />
              <div className="space-y-3">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-sm flex flex-wrap lg:grid lg:grid-cols-5 gap-4 md:gap-6 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center w-[45%] lg:w-auto">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
