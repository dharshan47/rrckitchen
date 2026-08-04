"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  return (
    <main className="min-h-screen bg-[#fcfbf9]">
      {/* Notice Bar */}
      <div className="bg-[#FFF4E8] border-b border-[#EE7005]/20">
        <div className="max-w-300 mx-auto px-4 md:px-6 py-3 flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-4 md:px-6 py-6 pb-44 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-20 md:hidden" />
            </div>

            {/* Cart Item Cards */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                    <Skeleton className="h-[72px] w-[72px] sm:h-21 sm:w-21 shrink-0 rounded-xl" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-20 rounded-sm hidden sm:block" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center justify-end sm:justify-start gap-4 mt-3 sm:mt-0 shrink-0 sm:pl-4">
                        <Skeleton className="h-4 w-10 hidden sm:block" />
                        <Skeleton className="h-8 w-28 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pre-Book Notice */}
            <div className="bg-[#FFF4E8] border border-[#EE7005]/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <Skeleton className="h-4 w-16 shrink-0 mt-0.5" />
              <Skeleton className="h-3.5 flex-1 max-w-md" />
            </div>

            {/* Select Delivery Address */}
            <div>
              <Skeleton className="h-5 w-56 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 border border-gray-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-2.5 w-12" />
                      </div>
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
              <Skeleton className="h-5 w-64 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                  </div>
                  <Skeleton className="h-3.5 w-48 px-1" />
                </div>
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <div className="mt-3 flex items-center gap-2 bg-[#e8f5ed] rounded-lg px-3 py-2.5">
                <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
                <Skeleton className="h-3 flex-1 max-w-sm" />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-95 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-36 mb-4" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-7 w-16" />
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
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-7 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex items-start gap-3 bg-[#e8f5ed] rounded-xl p-4">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-full max-w-[220px]" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                </div>
              </div>

              {/* Proceed to Pay */}
              <div className="hidden md:block">
                <Skeleton className="w-full h-14 rounded-xl" />
                <div className="flex items-center justify-center gap-1.5 mt-3">
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
      </div>
    </main>
  )
}
