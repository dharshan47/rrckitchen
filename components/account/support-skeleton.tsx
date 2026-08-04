"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SupportSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="hidden md:flex h-24 w-24 bg-green-50 rounded-full items-center justify-center shrink-0 border-[4px] border-white shadow-sm">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 bg-white">
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-3.5 w-24 mb-1.5" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Skeleton className="h-6 w-44 mb-4 px-1" />
            <Card className="rounded-2xl border-gray-100 shadow-sm flex-1 flex flex-col">
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
                <div>
                  <Skeleton className="h-3.5 w-20 mb-2" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-3.5 w-16 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-3.5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="flex-1 flex flex-col">
                  <Skeleton className="h-3.5 w-24 mb-2" />
                  <Skeleton className="flex-1 w-full min-h-[120px] rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-3.5 w-24 mb-2" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
                <div className="flex gap-3 pt-4 mt-auto">
                  <Skeleton className="h-11 w-24 rounded-xl" />
                  <Skeleton className="h-11 flex-1 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: My Tickets */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <Skeleton className="h-6 w-32 mb-4 px-1" />
            <Card className="rounded-2xl border-gray-100 shadow-sm flex-1 flex flex-col bg-white overflow-hidden">
              <div className="px-6 pt-4 border-b border-gray-100">
                <div className="flex gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-16 rounded-none" />
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-56" />
                        <div className="flex justify-between items-center pt-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-4 w-4 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </Card>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-3 flex flex-col space-y-6">

            {/* How to Use Support */}
            <Card className="rounded-2xl border-gray-100 shadow-sm border-t-4 border-t-green-600 bg-white">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-44 mb-6" />
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-3.5 w-32" />
                        </div>
                        <Skeleton className="h-3 w-full max-w-[180px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-sm mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Reach Us */}
            <div>
              <Skeleton className="h-4 w-40 mb-3 px-1" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <Skeleton className="h-5 w-5 rounded-sm shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F2F8F4] rounded-2xl p-6 border border-green-100/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
