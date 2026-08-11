"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  return (
    <main className="min-h-screen bg-[#FDFBF9]">
      {/* Top Banner */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 mb-2">
        <div className="bg-[#FFF6F0] rounded-2xl p-4 flex items-center gap-4 border border-[#EE7005]/10">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#EE7005]/20">
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 pb-44 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-20 md:hidden" />
            </div>

            {/* Cart Item Cards */}
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 flex gap-4 sm:gap-5">
                    <Skeleton className="h-[90px] w-[90px] sm:h-[100px] sm:w-[100px] shrink-0 rounded-xl" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:justify-between min-w-0">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3.5 w-14 rounded-sm hidden sm:block" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3.5 w-40 mt-3" />
                        <Skeleton className="h-3.5 w-32" />
                      </div>
                      <div className="flex flex-col items-start sm:items-end justify-between shrink-0 sm:pl-4 mt-3 sm:mt-0 gap-3">
                        <Skeleton className="h-4 w-12" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-9 w-28 rounded-lg" />
                          <Skeleton className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pre-Book Notice */}
            <div className="bg-[#FFF6F0] border border-[#EE7005]/20 rounded-xl p-5 flex items-start gap-4">
              <Skeleton className="h-5 w-5 rounded-md shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>

            {/* Select Delivery Address */}
            <div>
              <Skeleton className="h-5 w-56 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 border border-gray-200 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-16" />
                          <Skeleton className="h-2.5 w-12" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 mt-1.5" />
                  </div>
                ))}
              </div>
              <Skeleton className="w-full mt-3 h-11 rounded-xl" />
            </div>

            {/* Select Delivery Date & Time */}
            <div>
              <Skeleton className="h-5 w-72 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                    <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-5 w-5 shrink-0" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 bg-[#E8F5EE] rounded-lg px-4 py-3">
                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                <Skeleton className="h-3 flex-1 max-w-sm" />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-36 mb-5" />
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                  <div className="border-t border-gray-100 pt-5 flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>

              {/* Apply Coupon */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-11 rounded-lg" />
                  <Skeleton className="h-11 w-24 rounded-lg" />
                </div>
              </div>

              {/* Available Offers */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-7 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex items-start gap-3 bg-[#F0F8F4] rounded-xl p-4">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-full max-w-[220px]" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                </div>
              </div>

              {/* Proceed to Pay */}
              <div className="hidden md:block">
                <Skeleton className="w-full h-14 rounded-xl" />
                <div className="mt-3 bg-[#FFF6F0] rounded-xl py-2 flex items-center justify-center gap-2">
                  <Skeleton className="h-3.5 w-4 rounded-sm" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 md:hidden safe-area-bottom">
        <Skeleton className="w-full h-14 rounded-xl" />
        <div className="mt-3 bg-[#FFF6F0] rounded-xl py-2 flex items-center justify-center gap-2">
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-2.5 w-28" />
        </div>
      </div>
    </main>
  )
}
