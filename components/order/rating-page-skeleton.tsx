"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function RatingPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container max-w-[1200px] mx-auto px-4 py-6 md:py-10">

        {/* Header Section */}
        <div className="bg-[#fff9f5] rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between mb-10 shadow-sm border border-orange-50/50">
          <div className="flex items-center gap-6 md:gap-8 w-full lg:w-auto">
            <Skeleton className="w-48 h-48 md:w-64 md:h-64 -ml-12 -my-16 shrink-0 rounded-full" />
            <div className="mt-2 md:mt-0 flex-1 space-y-3">
              <Skeleton className="h-8 md:h-[34px] w-72 max-w-full rounded-md" />
              <Skeleton className="h-[16px] w-64 max-w-full rounded" />
              <Skeleton className="h-[16px] w-52 max-w-full rounded hidden md:block" />
            </div>
          </div>
          <div className="flex gap-6 md:gap-14 mt-8 lg:mt-0 justify-center w-full lg:w-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn("flex flex-col items-center gap-4", i === 2 && "hidden sm:flex")}>
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-1.5 flex flex-col items-center">
                  <Skeleton className="h-[13px] w-20" />
                  <Skeleton className="h-[13px] w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-10 relative px-4 sm:px-12">
          <div className="absolute top-[16px] left-[10%] right-[10%] z-0 block">
            <Progress value={0} className="h-[2px] bg-gray-200" />
          </div>
          <div className="flex justify-between relative z-10 gap-1 sm:gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 text-center">
                <Skeleton className="w-8 h-8 rounded-full border-[2px] border-white" />
                <Skeleton className="h-[13px] w-16 sm:w-24 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column - Rating Area */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2.5">
                  <Skeleton className="h-[22px] md:h-6 w-56 rounded" />
                  <Skeleton className="h-[14px] w-48 rounded" />
                </div>
              </div>
              <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 px-0 py-2 sm:p-0">
                <Skeleton className="h-[14px] w-32 rounded" />
                <Skeleton className="h-[12px] w-28 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-5 border border-[#E5E7EB] rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="h-[14px] w-20 mb-3 rounded" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-6 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="h-[12px] w-14 mt-2 rounded" />
                </div>
              ))}
            </div>

            <div className="mb-8 mt-2">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-[15px] w-44 rounded" />
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-[15px] w-40 rounded" />
              </div>
              <Skeleton className="w-full h-32 rounded-2xl" />
            </div>

            <Skeleton className="w-full h-14 py-4 rounded-xl" />
          </div>

          {/* Right Column - Context Cards */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Order Summary */}
            <div className="bg-[#F8FAF8] rounded-2xl p-6 border-none shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-[16px] w-24 rounded" />
                <Skeleton className="h-[13px] w-24 rounded" />
              </div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-[15px] w-32 rounded" />
                    <Skeleton className="h-[13px] w-24 rounded" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-[15px] w-12 ml-auto rounded" />
                  <Skeleton className="h-[13px] w-14 ml-auto rounded" />
                </div>
              </div>
              <div className="border-t border-[#E5E7EB] pt-4 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-[13px] w-48 rounded" />
              </div>
            </div>

            {/* Why review matters */}
            <div className="bg-[#FFF8F5] rounded-2xl p-6 relative overflow-hidden border-none shadow-sm min-h-[190px]">
              <Skeleton className="h-[16px] w-44 mb-5 rounded relative z-10" />
              <div className="space-y-3.5 relative z-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-[14px] w-48 rounded" />
                  </div>
                ))}
              </div>
              <Skeleton className="absolute -right-4 -bottom-4 w-44 h-44 rounded-full mix-blend-multiply opacity-50 z-0" />
            </div>

            {/* Tips Card */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-[20px] h-[20px] rounded-full" />
                <Skeleton className="h-[15px] w-32 rounded" />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full border border-[#E5E7EB]" />
                    <div className="space-y-1.5 flex flex-col items-center">
                      <Skeleton className="h-[11px] w-14 rounded" />
                      <Skeleton className="h-[11px] w-10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 mb-4 bg-[#F8F9FA] rounded-2xl py-4 flex items-center justify-center border border-[#E5E7EB]">
          <Skeleton className="h-[14px] w-64 md:w-96 rounded" />
        </div>
      </div>
    </div>
  )
}
