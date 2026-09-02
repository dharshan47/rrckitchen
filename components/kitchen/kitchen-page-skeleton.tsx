"use client"

import { Skeleton } from "@/components/ui/skeleton"

function KitchenChefCountSkeleton() {
  return (
    <div className="absolute top-12 right-0 lg:-right-6 bg-[#FFFFFF] rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6 flex flex-col border border-[#F9F9F9] z-20 w-[180px] animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function KitchenPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FEFEFE] font-sans overflow-hidden">
      <main>
        {/* Hero Section */}
        <section className="relative bg-[#FEFCFA] pt-12 pb-20 lg:pt-20 lg:pb-0 overflow-hidden border-b border-[#F5F5F5]">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-end">
              <div className="max-w-2xl lg:pb-28">
                <Skeleton className="h-12 sm:h-14 lg:h-[64px] w-full max-w-xl mb-6" />
                <Skeleton className="h-16 lg:h-[60px] w-full max-w-lg mb-10" />
                
                <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-12">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-28 mt-1" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-28 mt-1" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-28 mt-1" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <Skeleton className="h-[76px] w-[240px] rounded-xl" />
                  <Skeleton className="h-[76px] w-[220px] rounded-xl bg-transparent" />
                </div>
              </div>
              
              <div className="relative lg:ml-auto flex justify-center lg:justify-end w-full mt-10 lg:mt-0">
                <div className="relative w-full max-w-[450px] lg:max-w-[550px] aspect-[4/5] z-10 mx-auto lg:mr-0 lg:ml-auto">
                  <div className="absolute bottom-[8%] sm:bottom-[10%] left-1/2 -translate-x-1/2 w-[85%] sm:w-[90%] aspect-square bg-[#FFF4EE] rounded-full z-0 opacity-100"></div>
                  <Skeleton className="absolute inset-0 bg-transparent rounded-full" />
                  <div className="absolute z-20 right-[2%] sm:right-[-10px] top-[10%] sm:top-[20%] scale-[0.7] sm:scale-100 origin-top-right">
                    <KitchenChefCountSkeleton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner With Us Section */}
        <section id="why-partner" className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 relative">
              <Skeleton className="h-10 sm:h-12 w-80 mx-auto mb-2" />
              <div className="w-8 h-[2px] bg-[#FD4F03] mx-auto mb-6"></div>
              <Skeleton className="h-12 w-full max-w-lg mx-auto" />
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-[12px] p-8 border border-[#EEEEEE] shadow-[0_3px_12px_rgba(0,0,0,0.06)] text-center">
                  <Skeleton className="mx-auto h-16 w-16 mb-6 rounded-full" />
                  <Skeleton className="h-6 w-40 mx-auto mb-3" />
                  <Skeleton className="h-4 w-52 mx-auto mb-1.5" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-[#FEFEFE]">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 relative flex flex-col items-center">
              <Skeleton className="h-10 sm:h-12 w-64 mb-4 sm:mb-6" />
              <Skeleton className="h-6 w-80" />
            </div>
            
            <div className="bg-[#FFFFFF] rounded-[32px] sm:rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-[#F5F5F5] p-8 sm:p-12 lg:p-16 relative w-full mx-auto">
              <div className="hidden md:block absolute top-[88px] lg:top-[119px] left-[12.5%] right-[12.5%] h-[1px] bg-[#EEEEEE] z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <Skeleton className="h-20 w-20 lg:h-[110px] lg:w-[110px] rounded-full mb-5 lg:mb-6" />
                    <Skeleton className="h-4 w-16 mb-1.5 lg:mb-2" />
                    <Skeleton className="h-6 w-32 mb-1.5 lg:mb-2" />
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who Can Join Section */}
        <section className="py-20 lg:py-28 bg-[#FEFEFE] overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative z-10 lg:pl-4">
                <Skeleton className="h-12 sm:h-14 lg:h-16 w-80 mb-6" />
                <div className="w-8 h-[3px] bg-[#FD4F03] mt-4 mb-8"></div>
                <Skeleton className="h-6 w-full max-w-md mb-2" />
                <Skeleton className="h-6 w-4/5 mb-10" />
                
                <ul className="space-y-4 mb-10">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Skeleton className="w-[22px] h-[22px] rounded-full shrink-0" />
                      <Skeleton className="h-5 w-64" />
                    </li>
                  ))}
                </ul>
                
                <Skeleton className="h-14 w-64 rounded-lg" />
              </div>
              
              <div className="relative mt-12 lg:mt-0 w-full lg:pr-8">
                <div className="flex flex-row gap-4 sm:gap-6 lg:gap-8 relative z-10 w-full h-[350px] sm:h-[450px] lg:h-[500px]">
                  <div className="relative w-[50%] lg:w-[52%] h-full">
                    <Skeleton className="w-full h-full rounded-2xl lg:rounded-[24px]" />
                  </div>
                  <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-[50%] lg:w-[48%] h-full">
                    <Skeleton className="w-full h-[calc(50%-8px)] sm:h-[calc(50%-12px)] lg:h-[calc(50%-16px)] rounded-2xl lg:rounded-[24px]" />
                    <Skeleton className="w-full h-[calc(50%-8px)] sm:h-[calc(50%-12px)] lg:h-[calc(50%-16px)] rounded-2xl lg:rounded-[24px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-24 bg-[#FEFEFE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center flex flex-col items-center">
            <Skeleton className="h-10 sm:h-12 w-[350px] mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1150px] mx-auto mt-6 px-4 lg:px-16">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-[24px] p-8 border border-[#F5F5F5] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-5 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-11/12 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-10" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12 flex flex-col items-center">
              <Skeleton className="h-10 sm:h-12 w-[400px] mb-2" />
              <div className="w-8 h-[2px] bg-[#FD4F03] mt-2"></div>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`l-${i}`} className="border border-[#EEEEEE] bg-[#FFFFFF] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] px-6 py-5">
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`r-${i}`} className="border border-[#EEEEEE] bg-[#FFFFFF] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] px-6 py-5">
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-[#FEFEFE] relative overflow-hidden border-t border-[#F9F9F9]">
          <div className="mx-auto max-w-[1250px] w-full px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
            <div className="shrink-0 relative w-48 h-48 lg:w-[240px] lg:h-[240px]">
              <Skeleton className="w-full h-full rounded-full bg-transparent" />
            </div>
            <div className="flex-1 text-center lg:text-left max-w-xl lg:px-4 relative z-10 flex flex-col items-center lg:items-start">
              <Skeleton className="h-10 sm:h-12 w-full max-w-md mb-4 lg:mb-5" />
              <Skeleton className="h-10 sm:h-12 w-3/4 max-w-sm mb-4 lg:mb-5" />
              <Skeleton className="h-6 w-full max-w-sm mb-2" />
              <Skeleton className="h-6 w-4/5 max-w-xs" />
            </div>
            <div className="flex flex-col items-center justify-center shrink-0 lg:pr-32 xl:pr-16 lg:-mt-4 relative z-10 w-full sm:w-auto">
              <Skeleton className="h-[76px] w-full sm:w-[240px] rounded-xl mb-3 lg:mb-4" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
