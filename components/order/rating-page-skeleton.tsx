"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function RatingPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container max-w-[1200px] mx-auto px-4 py-6 md:py-10">

        {/* Header Section */}
        <div className="bg-[#fff9f5] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between mb-10 shadow-sm border border-orange-50/50">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left w-full md:w-auto">
            <Skeleton className="w-48 h-32 md:w-56 md:h-36 shrink-0 rounded-xl" />
            <div className="mt-2 md:mt-6 space-y-3">
              <Skeleton className="h-7 w-72 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-4 w-52 max-w-full" />
            </div>
          </div>
          <div className="flex gap-6 md:gap-10 mt-8 md:mt-0 justify-center w-full md:w-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn("flex flex-col items-center gap-3", i === 2 && "hidden sm:flex")}>
                <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-10 relative px-2 sm:px-0">
          <div className="absolute top-[15px] left-0 right-0 z-0 block">
            <Progress value={0} className="h-[2px] bg-gray-200" />
          </div>
          <div className="flex justify-between relative z-10 gap-1 sm:gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                <Skeleton className="h-3 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column - Rating Area */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2.5">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
              </div>
              <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-green-50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 border rounded-xl bg-white">
                  <Skeleton className="w-10 h-10 rounded-full mb-3" />
                  <Skeleton className="h-3.5 w-20 mb-3" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-6 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-14 mt-2" />
                </div>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-full" />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="w-full h-28 rounded-xl" />
            </div>

            <Skeleton className="w-full h-[50px] rounded-xl" />
          </div>

          {/* Right Column - Context Cards */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Order Summary */}
            <Card className="bg-[#f8f9fa] rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-3.5 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
              <div className="border-t border-gray-200 mt-5 pt-4">
                <Skeleton className="h-3 w-48" />
              </div>
            </Card>

            {/* Why review matters */}
            <div className="bg-[#fff9f5] rounded-xl p-6 relative overflow-hidden border border-orange-50 shadow-sm">
              <Skeleton className="h-4 w-44 mb-4" />
              <div className="space-y-3.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                ))}
              </div>
              <Skeleton className="absolute right-0 bottom-0 w-36 h-36 rounded-full" />
            </div>

            {/* Tips Card */}
            <div className="bg-green-50/50 rounded-xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Skeleton className="w-[18px] h-[18px] rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-16 mx-auto" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  )
}
