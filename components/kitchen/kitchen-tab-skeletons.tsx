"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#FFFFFF] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function SkeletonTitle({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-[20px] w-44 rounded-md mb-4 ${className}`} />;
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-3.5 w-full rounded-md ${className}`} />;
}

function SkeletonIcon({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-10 rounded-full shrink-0 ${className}`} />;
}

/* ============================================================
   Kitchen Detail (page) skeleton — mirrors kitchen-detail-client.tsx
   ============================================================ */
export function KitchenDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#fcfbf9] text-foreground pb-20 lg:pb-20" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="bg-[#FEF9F5]">
        <div className="hidden md:block">
          <div className="max-w-[1200px] mx-auto px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-10 rounded" />
              <Skeleton className="h-3.5 w-3 rounded" />
              <Skeleton className="h-3.5 w-12 rounded" />
              <Skeleton className="h-3.5 w-3 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-4 md:pb-6">
          <div className="bg-[#FFFFFF] border border-[#f0f0f0] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-3 md:p-4">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
              <div className="w-full lg:w-[420px] shrink-0">
                <Skeleton className="w-full h-[200px] md:h-[240px] lg:h-[280px] rounded-[12px]" />
              </div>

              <div className="flex-1 flex flex-col justify-start pt-10 md:pt-14 lg:pt-2 pl-2 lg:pl-0">
                <Skeleton className="h-7 md:h-8 w-56 max-w-[90%] rounded-md" />
                <div className="flex items-center flex-wrap gap-2 md:gap-4 mt-2 md:mt-3">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-3 md:mt-4">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
                <Skeleton className="h-3.5 w-full max-w-2xl rounded-md mt-3 md:mt-4" />
                <Skeleton className="h-3.5 w-3/4 max-w-2xl rounded-md mt-2" />
                <div className="flex flex-wrap gap-3 mt-5 md:mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[28px] w-[130px] rounded-[8px]" />
                  ))}
                </div>
                <Skeleton className="h-3.5 w-40 rounded-md mt-6 md:mt-auto pt-4" />
              </div>

              <div className="hidden lg:flex flex-col w-[260px] shrink-0 pl-6 border-l border-[#F0F0F0]">
                <Skeleton className="h-[42px] w-full rounded-[8px] mb-6" />
                <div className="flex flex-col">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex items-center gap-4 py-3 ${i < 3 ? 'border-b border-[#F5F5F5]' : ''}`}>
                      <SkeletonIcon className="w-[18px] h-[18px]" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-[45px] rounded" />
                        <Skeleton className="h-3.5 w-24 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden bg-[#FFFFFF] border-b border-[#eef1f5] overflow-x-auto px-4 md:px-6 py-3">
        <div className="flex items-stretch gap-0 justify-between min-w-[460px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 px-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3.5 w-16 rounded mt-1" />
              <Skeleton className="h-2.5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border-b border-[#eef1f5] sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-start md:justify-center gap-8 md:gap-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-4 md:py-5 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 hidden lg:block">
            <div className="sticky top-[100px] flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#FFFBF7] rounded-[20px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F5EFEA]">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                  <div className="space-y-3">
                    <SkeletonLine />
                    <SkeletonLine className="w-5/6" />
                    <SkeletonLine className="w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Skeleton className="h-[46px] w-full rounded-[12px]" />
            <div className="flex items-center gap-2 mb-4 md:mb-6 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[34px] w-20 rounded-[8px]" />
              ))}
            </div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-[8px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-[16px] border border-[#eef1f5] p-3 md:p-4 flex gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-[36px] w-24 rounded-[8px] mt-auto" />
                  </div>
                  <Skeleton className="h-[120px] w-[120px] md:h-[130px] md:w-[130px] rounded-[12px] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   About tab skeleton — mirrors about-kitchen-tab.tsx
   ============================================================ */
export function AboutKitchenTabSkeleton() {
  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Meet the Chef */}
        <div className="col-span-1 lg:col-span-3 bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-8 flex flex-col">
          <div className="flex flex-col md:flex-row gap-6 mb-8 flex-1">
            <div className="flex-1 relative">
              <Skeleton className="h-[21px] md:h-[22.5px] w-32 mb-1" />
              <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
              
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-[42px] md:h-[48px] w-64" />
                <Skeleton className="h-[22px] w-[22px] rounded-full" />
              </div>
              <Skeleton className="h-5 w-40 mb-6" />
              
              <div className="relative">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-24 ml-auto mt-4" />
              </div>
            </div>
            
            <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] shrink-0 relative mx-auto md:mx-0 mt-4 md:mt-0">
               <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>
          
          <div className="border-t border-[#EEEEEE] pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x divide-[#EEEEEE]">
            {Array.from({length: 4}).map((_, i) => (
             <div key={i} className="flex flex-col items-center text-center gap-2 px-2 pt-4 md:pt-0">
               <Skeleton className="w-10 h-10 rounded-full" />
               <Skeleton className="h-[14px] w-24" />
               <Skeleton className="h-[14px] w-20" />
             </div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="col-span-1 lg:col-span-2 bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-8 flex flex-col">
          <Skeleton className="h-[21px] md:h-[22.5px] w-24 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
            <div className="w-[140px] h-[140px] shrink-0 relative">
               <Skeleton className="w-full h-full rounded-full" />
            </div>
            <div className="flex-1 w-full">
              <Skeleton className="h-4 w-full mb-1.5" />
              <Skeleton className="h-4 w-full mb-1.5" />
              <Skeleton className="h-4 w-full mb-1.5" />
              <Skeleton className="h-4 w-3/4 mb-1.5" />
              <Skeleton className="h-4 w-20 ml-auto mt-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Behind Every Meal */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-36 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-2 flex-1 relative border border-[#EEEEEE] rounded-[12px] overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#EEEEEE]"></div>
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#EEEEEE]"></div>
            
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="flex flex-col xl:flex-row gap-3 p-4">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-[18px] w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-0.5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Cook */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-28 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-4 gap-y-5 gap-x-2 mb-5">
             {Array.from({length: 8}).map((_, i) => (
               <div key={i} className="flex flex-col items-center text-center gap-1.5">
                 <Skeleton className="w-10 h-10 rounded-full" />
                 <Skeleton className="h-[13.5px] w-12" />
               </div>
             ))}
          </div>
          
          <div className="bg-[#FFF1E8] rounded-lg p-2.5 flex items-center justify-center gap-2 mt-auto border border-[#FFD0B5]">
            <Skeleton className="w-4 h-4 rounded-full shrink-0" />
            <Skeleton className="h-[15px] w-4/5" />
          </div>
        </div>

        {/* Our Ingredients Promise */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-48 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex flex-1 gap-2 items-center">
            <div className="flex-1 flex flex-col gap-4">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-[140px] shrink-0 relative flex items-center justify-center h-full min-h-[140px]">
               <Skeleton className="w-[140px] h-[140px] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trusted by Families */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-40 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-4 gap-2 flex-1 items-center">
             {Array.from({length: 4}).map((_, i) => (
               <div key={i} className="flex flex-col items-center text-center gap-1">
                 <Skeleton className="w-10 h-10 rounded-full mb-1" />
                 <Skeleton className="h-5 w-10 mb-0.5" />
                 <Skeleton className="h-3 w-16" />
                 <Skeleton className="h-3 w-12" />
               </div>
             ))}
          </div>
        </div>

        {/* Recognition & Highlights */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-48 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-4 gap-2 flex-1 items-center">
             {Array.from({length: 4}).map((_, i) => (
               <div key={i} className="flex flex-col items-center text-center">
                 <Skeleton className="w-10 h-10 rounded-full mb-2" />
                 <Skeleton className="h-3 w-16 mb-0.5" />
                 <Skeleton className="h-3 w-12" />
               </div>
             ))}
          </div>
        </div>

        {/* Community & Giving Back */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <Skeleton className="h-[21px] md:h-[22.5px] w-48 mb-1" />
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex flex-1 gap-4 items-center">
            <div className="flex-1 w-full">
              <Skeleton className="h-[16.5px] w-full mb-1.5" />
              <Skeleton className="h-[16.5px] w-full mb-1.5" />
              <Skeleton className="h-[16.5px] w-3/4" />
            </div>
            <div className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] shrink-0 relative flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4 */}
      <div className="bg-[#FAFAFA] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] w-full grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 divide-x divide-[#EEEEEE] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
            <Skeleton className="w-10 h-10 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full max-w-[120px] mb-1" />
              <Skeleton className="h-[13.5px] w-full max-w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Info tab skeleton — mirrors info-kitchen-tab.tsx
   ============================================================ */
export function InfoKitchenTabSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 md:gap-5 pb-8">
      {/* ROW 1: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Kitchen Details */}
        <SkeletonCard>
          <SkeletonTitle className="w-40" />
          <div className="space-y-4 flex-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Our Kitchen Location */}
        <SkeletonCard className="flex flex-col">
          <SkeletonTitle className="w-48" />
          <div className="flex flex-col h-full">
            <Skeleton className="h-[19.5px] w-full mb-1" />
            <Skeleton className="h-[19.5px] w-3/4 mb-4" />
            <Skeleton className="h-[34px] w-40 rounded-lg mb-4" />
            <Skeleton className="w-full flex-1 rounded-xl min-h-[140px] mt-auto" />
          </div>
        </SkeletonCard>

        {/* Kitchen Timings */}
        <SkeletonCard>
          <SkeletonTitle className="w-36" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-[68px] w-full rounded-[12px] mb-4" />
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Delivery Information */}
        <SkeletonCard>
          <SkeletonTitle className="w-44" />
          <div className="space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
            <div className="mt-auto pt-6">
              <Skeleton className="h-[64px] w-full rounded-[12px]" />
            </div>
          </div>
        </SkeletonCard>

      </div>

      {/* ROW 2: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Food Safety & Hygiene */}
        <SkeletonCard className="relative overflow-hidden">
          <SkeletonTitle className="w-48" />
          <div className="space-y-3.5 flex-1 z-10 relative pr-[80px] sm:pr-0">
             {Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} className="h-4 w-full max-w-[200px]" />
             ))}
          </div>
        </SkeletonCard>

        {/* Ingredients We Use */}
        <SkeletonCard className="relative overflow-hidden">
          <SkeletonTitle className="w-40" />
          <div className="space-y-3.5 flex-1 z-10 relative pr-[80px] sm:pr-0">
             {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-4 w-full max-w-[200px]" />
             ))}
          </div>
        </SkeletonCard>

        {/* Payment Methods */}
        <SkeletonCard>
          <SkeletonTitle className="w-40" />
          <div className="flex items-center gap-3 sm:gap-4 flex-1 mt-4 flex-wrap justify-center sm:justify-start">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <Skeleton className="h-[15px] w-12" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Customer Support */}
        <SkeletonCard>
          <SkeletonTitle className="w-40" />
          <div className="flex-1 flex flex-col">
            <Skeleton className="h-[18px] w-36 mb-4" />
            
            <div className="space-y-4 mb-6">
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-4 w-40" />
               <div className="flex gap-3">
                 <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
                 <div>
                   <Skeleton className="h-4 w-32 mb-1" />
                   <Skeleton className="h-[15px] w-20" />
                 </div>
               </div>
            </div>

            <Skeleton className="w-full h-[40px] rounded-lg mt-auto" />
          </div>
        </SkeletonCard>

      </div>

      {/* ROW 3: Our Promise & Follow Us */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Our Promise */}
        <div className="col-span-1 lg:col-span-3 bg-[#FEF9F5] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col">
          <SkeletonTitle className="w-32" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-12 h-12 rounded-full mb-2" />
                <Skeleton className="h-[18px] w-24" />
                <Skeleton className="h-[15px] w-full" />
                <Skeleton className="h-[15px] w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Follow Us */}
        <SkeletonCard className="col-span-1">
          <SkeletonTitle className="w-24" />
          <div className="flex-1 flex flex-col">
            <Skeleton className="h-[18px] w-full mb-1" />
            <Skeleton className="h-[18px] w-3/4 mb-6" />
            
            <div className="flex items-center gap-3 mt-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
        </SkeletonCard>

      </div>
    </div>
  );
}

/* ============================================================
   Reviews tab skeleton — mirrors reviews-kitchen-tab.tsx
   ============================================================ */
export function ReviewsKitchenTabSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 md:gap-5 pb-8">
      {/* ROW 1: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

        {/* Overall Rating */}
        <SkeletonCard className="lg:col-span-3 items-center text-center justify-center">
          <SkeletonTitle className="w-32 self-start mb-2" />
          <Skeleton className="h-[56px] w-20 mt-2 mb-3" />
          <div className="mb-2 flex gap-1">
             {Array.from({length: 5}).map((_, i) => (
               <Skeleton key={i} className="h-5 w-5 rounded-full" />
             ))}
          </div>
          <Skeleton className="h-[16.5px] w-36 mb-6" />

          <Skeleton className="h-[80px] w-full rounded-xl" />
        </SkeletonCard>

        {/* Rating Overview & Key Aspects */}
        <SkeletonCard className="lg:col-span-6 p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left: Overview */}
            <div className="w-full md:w-[35%] p-5 md:p-6 border-b md:border-b-0 md:border-r border-[#EEEEEE]">
              <SkeletonTitle className="w-40 mb-1" />
              <Skeleton className="h-[16.5px] w-48 mb-6" />

              <div className="space-y-3">
                {Array.from({length: 5}).map((_, star) => (
                  <div key={star} className="flex items-center gap-3">
                    <Skeleton className="w-6 h-4" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="w-8 h-[16.5px]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Key Aspects */}
            <div className="w-full md:w-[65%] p-5 md:p-6 flex flex-col">
              <SkeletonTitle className="w-52 mb-6" />

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-6">
                {Array.from({length: 3}).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <Skeleton className="w-10 h-10 rounded-[12px] mb-2" />
                    <Skeleton className="h-[13.5px] w-20 mb-1" />
                    <Skeleton className="h-[22.5px] w-12 mb-1" />
                    <div className="scale-50 origin-top -mt-2 -mb-2 w-[80px] flex justify-center">
                       {Array.from({length: 5}).map((_, j) => (
                         <Skeleton key={j} className="h-4 w-4 rounded-full mx-0.5" />
                       ))}
                    </div>
                    <Skeleton className="h-[13.5px] w-10 mt-1" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-[42px] w-full rounded-lg mt-auto" />
            </div>
          </div>
        </SkeletonCard>

        {/* What Customers Love */}
        <SkeletonCard className="lg:col-span-3">
          <SkeletonTitle className="w-48 mb-4" />
          <div className="space-y-4 mb-auto">
            {Array.from({length: 4}).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <Skeleton className="h-[16.5px] w-32" />
                <Skeleton className="h-[16.5px] w-8" />
              </div>
            ))}
          </div>

          <Skeleton className="mt-6 h-[76px] w-full rounded-[12px]" />
        </SkeletonCard>

      </div>

      {/* ROW 2: Reviews and Right Column */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

          {/* Left: Reviews List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <SkeletonCard className="p-0 overflow-hidden flex flex-col h-full">
              {/* Filters Header */}
              <div className="p-4 md:p-5 border-b border-[#EEEEEE] flex flex-wrap items-center gap-3 bg-[#FAFAFA]">
                <Skeleton className="h-[36px] w-[140px] rounded-lg" />
                <Skeleton className="h-[34px] w-[90px] rounded-lg" />
                <div className="ml-auto">
                  <Skeleton className="h-[34px] w-[120px] rounded-lg" />
                </div>
              </div>

              {/* Reviews Content */}
              <div className="flex flex-col p-4 md:p-6 divide-y divide-[#EEEEEE]">
                {Array.from({length: 3}).map((_, i) => (
                  <div key={i} className={`flex flex-col md:flex-row gap-4 md:gap-6 ${i === 0 ? "pb-6" : "py-6"}`}>
                    {/* User Info Sidebar */}
                    <div className="flex items-center md:flex-col md:items-start gap-3 md:w-[140px] shrink-0">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col">
                        <Skeleton className="h-[19.5px] w-24 mb-1" />
                        <Skeleton className="h-[15px] w-28 mb-1" />
                        <Skeleton className="h-[15px] w-20" />
                      </div>
                    </div>

                    {/* Review Body */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="flex gap-1">
                          {Array.from({length: 5}).map((_, j) => (
                            <Skeleton key={j} className="h-4 w-4 rounded-full" />
                          ))}
                        </div>
                        <Skeleton className="h-[19.5px] w-8" />
                      </div>
                      <Skeleton className="h-[18px] w-full mb-1" />
                      <Skeleton className="h-[18px] w-3/4 mb-4" />
                      <div className="flex flex-wrap gap-2">
                         {Array.from({length: 3}).map((_, j) => (
                           <Skeleton key={j} className="h-[24px] w-[90px] rounded-md" />
                         ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>

          {/* Right: Photos & Categories */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5">

            {/* Customer Photos */}
            <SkeletonCard>
              <div className="flex items-center justify-between mb-4">
                <SkeletonTitle className="w-40 mb-0" />
                <Skeleton className="h-[18px] w-16" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({length: 6}).map((_, idx) => (
                  <Skeleton key={idx} className="aspect-square rounded-[12px]" />
                ))}
              </div>
            </SkeletonCard>

            {/* Rating Distribution by Category */}
            <SkeletonCard>
              <SkeletonTitle className="w-56" />
              <div className="space-y-3.5">
                {Array.from({length: 3}).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Skeleton className="w-[110px] h-[16.5px]" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="w-6 h-[16.5px]" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

          </div>
        </div>
      </div>

      {/* ROW 3: FOOTER STATS */}
      <div className="bg-[#FEF9F5] rounded-[26px] p-6 md:p-8 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#EEEEEE]">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className={`flex items-center gap-4 justify-center ${i > 0 ? "pt-4 md:pt-0" : ""}`}>
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="text-left">
                <Skeleton className="h-[30px] w-16 mb-0.5" />
                <Skeleton className="h-[16.5px] w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
