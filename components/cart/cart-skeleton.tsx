"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 mb-2">
        <div className="bg-[#FFF8F0] rounded-[8px] p-4 flex items-start sm:items-center gap-3 sm:gap-4 border border-[#FFE6D5]">
          <div className="flex items-center justify-center shrink-0">
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-3 w-full max-w-[400px]" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 pb-44 md:pb-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-8">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-44 rounded-sm" />
                <Skeleton className="h-4 w-20 md:hidden rounded-sm" />
              </div>

              {/* Cart Items */}
              <div className="bg-[#FFFFFF] rounded-[8px] border border-[#E7E7E7] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <div className="divide-y divide-[#E7E7E7]">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="px-4 sm:px-5">
                      <div className="flex gap-3 sm:gap-5 py-5">
                        <Skeleton className="h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] shrink-0 rounded-[7px]" />
                        
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-start min-w-0 gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-16 hidden sm:block" />
                            </div>
                            <Skeleton className="h-3 w-32 mb-3" />
                            
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1">
                              <Skeleton className="h-3 w-48" />
                              <Skeleton className="h-3 w-36" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 lg:gap-8 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
                            <Skeleton className="h-5 w-14" />
                            <div className="flex items-center gap-3 sm:gap-4">
                              <Skeleton className="h-8 w-24 rounded-[6px]" />
                              <Skeleton className="h-5 w-5 rounded-md" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pre-Book Notice inside Cart */}
                <div className="border-t border-[#E7E7E7] bg-[#FFF7EF] px-4 sm:px-5 py-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0">
                    <Skeleton className="h-[18px] w-[18px] rounded-md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-full max-w-[400px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Select Delivery Address */}
            <div>
              <Skeleton className="h-5 w-52 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={`rounded-[8px] p-4 border border-[#E2E2E2] bg-[#FFFFFF] flex flex-col min-w-0`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
                
                {/* Add New Address */}
                <div className="flex items-center justify-center rounded-[8px] border border-dashed border-[#FFB894] bg-[#FFFCFA] min-h-[120px] p-4 min-w-0">
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>

            {/* Select Delivery Date & Time */}
            <div>
              <Skeleton className="h-5 w-[340px] mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-[48px] w-full rounded-[7px]" />
                <Skeleton className="h-[48px] w-full rounded-[7px]" />
              </div>
              <div className="mt-3 flex items-center gap-2 bg-[#F0F8F0] border border-[#E1F0E2] rounded-[6px] px-4 py-3">
                <Skeleton className="h-[18px] w-[18px] rounded-md shrink-0" />
                <Skeleton className="h-3 w-full max-w-[360px]" />
              </div>
            </div>
            
          </div>

          {/* Right Sidebar */}
          <div className="w-full md:w-[320px] lg:w-[380px] shrink-0">
            <div className="md:sticky md:top-24 space-y-5">
              
              {/* Order Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <Skeleton className="h-5 w-32 mb-5" />
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                </div>
                <div className="border-t border-[#EEEEEE] mt-4 pt-4 flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              {/* Apply Coupon */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <Skeleton className="h-4 w-28 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-[46px] rounded-[7px]" />
                  <Skeleton className="h-[46px] w-[80px] rounded-[7px]" />
                </div>
              </div>

              {/* Available Offers */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full border border-[#CFE7D2] flex items-center justify-center shrink-0 bg-[#F0F8F0]">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3 w-full mb-1.5" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-3 w-6 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex items-center gap-3 bg-[#F1F8F1] border border-[#E0EFE0] rounded-[8px] p-4">
                  <div className="h-10 w-10 flex items-center justify-center shrink-0">
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-3 w-32 mb-1.5" />
                    <Skeleton className="h-2.5 w-full max-w-[180px] mb-1" />
                    <Skeleton className="h-2.5 w-full max-w-[160px]" />
                  </div>
                  <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                </div>
              </div>

              {/* Proceed to Pay Desktop */}
              <div className="hidden md:block">
                <Skeleton className="w-full h-[52px] rounded-[7px]" />
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Skeleton className="h-[15px] w-[15px] rounded-sm" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-[15px] w-[15px] rounded-sm" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E7E7E7] p-4 md:hidden safe-area-bottom">
        <Skeleton className="w-full h-[52px] rounded-[7px]" />
      </div>
    </main>
  )
}
