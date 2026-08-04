"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-muted/50 pb-12">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-border px-4 h-14 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <Card className="rounded-2xl p-4 shadow-sm border-border">
            <div className="space-y-1">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-[#F8FAF8] rounded-xl border border-[#E9F3EC]">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Profile Header Card */}
          <Card className="p-6 md:p-8 rounded-2xl shadow-sm border-border bg-white">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                <Skeleton className="h-28 w-28 rounded-full shrink-0" />
                <div className="space-y-3 pt-2 text-center md:text-left w-full max-w-md">
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-6">
                    <Skeleton className="h-4 w-52" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-6 pt-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
            </div>
          </Card>

          {/* Grid Section 1 (Loyalty, Favorites, Referrals) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-2xl shadow-sm border-border bg-white relative overflow-hidden h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3.5 w-32 mb-3" />
                <Skeleton className="h-8 w-28 rounded-lg" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
              </Card>
            ))}
          </div>

          {/* Grid Section 2 (Recent Orders, Saved Addresses, Recent Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-2xl shadow-sm border-border bg-white h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="flex-1 space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2 pt-1">
                        <div className="flex justify-between gap-2">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                        <div className="flex justify-between items-end pt-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3.5 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-4" />
              </Card>
            ))}
          </div>

          {/* Footer Features */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 px-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col items-center gap-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
