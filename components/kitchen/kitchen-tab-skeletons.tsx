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
  return <Skeleton className={`h-[22px] w-44 rounded-md mb-5 ${className}`} />;
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
          <div className="bg-[#FFFFFF] border border-[#eef1f5] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] p-4 md:p-5">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              <div className="w-full lg:w-[400px] shrink-0">
                <Skeleton className="w-full h-[180px] md:h-[220px] rounded-[18px]" />
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0 pt-2 lg:pt-0 pl-2 lg:pl-2">
                <Skeleton className="h-6 md:h-7 w-56 max-w-[90%] rounded-md" />
                <div className="flex items-center flex-wrap gap-3 md:gap-5 mt-2 md:mt-3">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-3">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
                <Skeleton className="h-3.5 w-full max-w-2xl rounded-md mt-3" />
                <Skeleton className="h-3.5 w-3/4 max-w-2xl rounded-md mt-2" />
                <div className="flex flex-wrap gap-2.5 mt-4 md:mt-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[30px] w-[130px] rounded-[8px]" />
                  ))}
                </div>
                <Skeleton className="h-3.5 w-40 rounded-md mt-4 md:mt-5" />
              </div>

              <div className="hidden lg:flex flex-col w-[280px] shrink-0 pl-6 border-l border-[#EEEEEE] ml-2">
                <Skeleton className="h-[42px] w-[90%] rounded-[7px]" />
                <div className="flex flex-col gap-4 mt-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <SkeletonIcon />
                      <div className="flex flex-col gap-1 flex-1">
                        <Skeleton className="h-3.5 w-16 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
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
              <Skeleton className="h-3 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border-b border-[#eef1f5] sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-8 md:gap-16">
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
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="w-full lg:w-[240px] shrink-0 hidden lg:block">
            <div className="bg-[#FFFFFF] lg:sticky lg:top-[100px] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden p-2">
              <Skeleton className="h-4 w-32 rounded-md px-3 py-3 mx-3 mt-3" />
              <div className="flex flex-col gap-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-[12px]" />
                ))}
              </div>
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] p-3 md:p-4 flex gap-3">
                  <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-[18px] shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3.5 w-full rounded" />
                    <Skeleton className="h-3.5 w-2/3 rounded" />
                    <Skeleton className="h-8 w-24 rounded-md mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
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
      </div>

      <div className="lg:hidden px-4 md:px-6 pb-4 space-y-3">
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden p-3">
              <Skeleton className="h-4 w-28 rounded mb-3" />
              <SkeletonLine className="w-3/4" />
              <SkeletonLine className="w-1/2 mt-2" />
            </div>
          ))}
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
      <section className="w-full">
        <Skeleton className="h-[26px] w-52 rounded-md" />
        <div className="mt-4 rounded-[26px] border border-[#eef1f5] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <Skeleton className="h-5 w-64 rounded-md" />
          <SkeletonLine className="mt-3" />
          <SkeletonLine className="mt-2 w-5/6" />
          <Skeleton className="h-4 w-40 rounded-md mt-4" />
          <SkeletonLine className="mt-2 w-4/5" />
          <Skeleton className="h-4 w-20 rounded-md mt-4" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <SkeletonCard className="col-span-1 lg:col-span-3">
          <SkeletonTitle className="w-36" />
          <Skeleton className="h-[2px] w-8 bg-[#FFD0B5] rounded-full mb-6" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48 rounded" />
              <SkeletonLine className="w-32" />
              <SkeletonLine className="mt-3" />
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="w-2/3" />
            </div>
            <Skeleton className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-full shrink-0 mx-auto md:mx-0" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#EEEEEE] pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <SkeletonIcon />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard className="col-span-1 lg:col-span-2">
          <SkeletonTitle className="w-28" />
          <Skeleton className="h-[2px] w-8 bg-[#FFD0B5] rounded-full mb-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-[140px] h-[140px] rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine />
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="w-3/4" />
            </div>
          </div>
        </SkeletonCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonTitle className="w-40" />
            <Skeleton className="h-[2px] w-8 bg-[#FFD0B5] rounded-full mb-6" />
            <div className="grid grid-cols-2 gap-3 flex-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-1.5 p-3 border border-[#EEEEEE] rounded-[12px]">
                  <SkeletonIcon className="h-6 w-6" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonTitle className="w-40" />
            <Skeleton className="h-[2px] w-8 bg-[#FFD0B5] rounded-full mb-6" />
            <div className="grid grid-cols-4 gap-2 flex-1 items-center">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex flex-col items-center gap-1.5">
                  <SkeletonIcon className="h-10 w-10" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>

      <div className="bg-[#FAFAFA] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] w-full grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 divide-x divide-[#EEEEEE] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-2 px-2 py-5">
            <SkeletonIcon className="h-10 w-10" />
            <Skeleton className="h-3 w-16 rounded" />
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
      {[0, 1].map((row) => (
        <div key={row} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i}>
              <SkeletonTitle className="w-40" />
              <div className="space-y-4 flex-1">
                {Array.from({ length: row === 0 && i === 0 ? 7 : 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </div>
                ))}
                {i === 1 && (
                  <Skeleton className="w-full flex-1 rounded-xl min-h-[140px] mt-auto" />
                )}
                {i === 3 && (
                  <div className="mt-auto pt-6">
                    <Skeleton className="h-[64px] w-full rounded-[12px]" />
                  </div>
                )}
              </div>
            </SkeletonCard>
          ))}
        </div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="col-span-1 lg:col-span-3 bg-[#FEF9F5] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col">
          <SkeletonTitle className="w-36" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <SkeletonIcon className="w-12 h-12" />
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonCard className="col-span-1">
          <SkeletonTitle className="w-28" />
          <SkeletonLine />
          <SkeletonLine className="w-5/6" />
          <div className="flex items-center gap-3 mt-auto pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        <SkeletonCard className="lg:col-span-3 items-center text-center justify-center">
          <SkeletonTitle className="w-32 self-start" />
          <Skeleton className="h-[56px] w-24 rounded-md mt-2" />
          <Skeleton className="h-5 w-28 rounded mt-3" />
          <Skeleton className="h-3.5 w-36 rounded mt-3 mb-6" />
          <Skeleton className="h-[60px] w-full rounded-xl" />
        </SkeletonCard>

        <SkeletonCard className="lg:col-span-6 p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-[35%] p-5 md:p-6 border-b md:border-b-0 md:border-r border-[#EEEEEE]">
              <SkeletonTitle className="w-36" />
              <Skeleton className="h-3 w-40 rounded mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3.5 w-8 rounded" />
                    <Skeleton className="h-2 flex-1 rounded-full" />
                    <Skeleton className="h-3.5 w-8 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-[65%] p-5 md:p-6 flex flex-col">
              <SkeletonTitle className="w-48" />
              <div className="grid grid-cols-3 gap-2 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <SkeletonIcon className="h-10 w-10 rounded-[12px]" />
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-8 rounded" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-[52px] w-full rounded-lg mt-auto" />
            </div>
          </div>
        </SkeletonCard>

        <SkeletonCard className="lg:col-span-3">
          <SkeletonTitle className="w-44" />
          <div className="space-y-4 mb-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-3.5 w-10 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="h-[76px] w-full rounded-[12px] mt-6" />
        </SkeletonCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <SkeletonCard className="p-0 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-[#EEEEEE] flex flex-wrap items-center gap-3 bg-[#FAFAFA]">
              <Skeleton className="h-[34px] w-36 rounded-lg" />
              <Skeleton className="h-[34px] w-[90px] rounded-lg" />
              <Skeleton className="h-[34px] w-[120px] rounded-lg ml-auto" />
            </div>
            <div className="flex flex-col p-4 md:p-6 divide-y divide-[#EEEEEE]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex flex-col md:flex-row gap-4 md:gap-6 ${i === 0 ? "pb-6" : "py-6"}`}>
                  <div className="flex items-center md:flex-col md:items-start gap-3 md:w-[140px] shrink-0">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <SkeletonLine className="w-11/12" />
                    <SkeletonLine className="w-3/4" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5">
          <SkeletonCard>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-14 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-[12px]" />
              ))}
            </div>
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonTitle className="w-52" />
            <div className="space-y-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3.5 w-8 rounded" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>
      </div>

      <div className="bg-[#FEF9F5] rounded-[26px] p-6 md:p-8 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 justify-center">
              <SkeletonIcon className="h-8 w-8" />
              <div className="text-left space-y-1">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
