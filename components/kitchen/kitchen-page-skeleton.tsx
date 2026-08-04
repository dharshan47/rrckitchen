"use client"

import { Skeleton } from "@/components/ui/skeleton"

function Stagger({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-3 duration-500 ${className ?? ""}`}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      {children}
    </div>
  )
}

export function KitchenPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#FAFAFA] pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <Skeleton className="h-14 w-full max-w-lg mb-4" />
                <Skeleton className="h-14 w-4/5 mb-6" />
                <Skeleton className="h-5 w-full max-w-md mb-2" />
                <Skeleton className="h-5 w-3/5 mb-10" />

                <div className="flex flex-wrap gap-4 mb-10">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-36 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-14 w-56 rounded-full" />
                  <Skeleton className="h-14 w-52 rounded-full" />
                </div>
              </div>

              <div className="relative lg:ml-auto flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg aspect-square">
                  <Skeleton className="w-full h-full rounded-full bg-gray-200/80" />
                  <div className="absolute top-10 -right-4 lg:-right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 border border-gray-100 z-10">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner With Us */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Skeleton className="h-10 w-80 mx-auto mb-4" />
              <Skeleton className="h-5 w-96 max-w-full mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Stagger key={i} index={i}>
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center">
                    <Skeleton className="mx-auto h-16 w-16 mb-6 rounded-full" />
                    <Skeleton className="h-6 w-40 mx-auto mb-3" />
                    <Skeleton className="h-4 w-52 max-w-full mx-auto mb-1" />
                    <Skeleton className="h-4 w-44 max-w-full mx-auto" />
                  </div>
                </Stagger>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-5 w-72 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <Stagger key={i} index={i}>
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-6" />
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-28 mb-2" />
                    <Skeleton className="h-4 w-40 max-w-full mb-1" />
                    <Skeleton className="h-4 w-32 max-w-full" />
                  </div>
                </Stagger>
              ))}
            </div>
          </div>
        </section>

        {/* Who Can Join */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Skeleton className="h-10 w-72 mb-3" />
                <Skeleton className="h-10 w-56 mb-8" />
                <Skeleton className="h-5 w-full max-w-md mb-2" />
                <Skeleton className="h-5 w-2/3 mb-10" />
                <div className="space-y-4 mb-10">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-14 w-64 rounded-full" />
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Skeleton className="h-48 sm:h-64 rounded-3xl" />
                    <Skeleton className="h-40 sm:h-48 rounded-3xl" />
                  </div>
                  <Skeleton className="h-full min-h-[300px] sm:min-h-[400px] rounded-3xl" />
                </div>
                <div className="absolute top-10 -right-4 sm:-right-8 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 z-10">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-28 mb-1" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
                <div className="absolute bottom-10 -left-4 sm:-left-8 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 z-10">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <Skeleton className="h-10 w-80 mx-auto mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <Stagger key={i} index={i}>
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4 rounded-sm" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-11/12 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-8" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                </Stagger>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-72 mx-auto" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Stagger key={i} index={i}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <Skeleton className="h-5 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </Stagger>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 md:p-12 lg:p-16 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center md:justify-start">
                  <Skeleton className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full bg-gray-200/80" />
                </div>
                <div className="text-center md:text-left space-y-6">
                  <Skeleton className="h-10 w-full max-w-md mx-auto md:mx-0" />
                  <Skeleton className="h-10 w-3/4 mx-auto md:mx-0" />
                  <Skeleton className="h-5 w-full max-w-sm mx-auto md:mx-0" />
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Skeleton className="h-14 w-56 rounded-full" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
