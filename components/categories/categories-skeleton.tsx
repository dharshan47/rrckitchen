"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"

export function CategoriesSkeleton() {
  return (
    <main className="min-h-screen pb-24 font-sans" style={{ backgroundColor: "#FAF8F7" }}>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-8 lg:py-[60px]">
        
        {/* Top Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start mb-[48px] gap-8">
          
          {/* Left Text */}
          <div className="flex-1 max-w-2xl pt-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-[6px] mb-[24px]">
              <Skeleton className="h-[18px] w-10" />
              <ChevronRight className="w-[12px] h-[12px] text-[#777777]" strokeWidth={2} />
              <Skeleton className="h-[18px] w-20" />
            </div>

            <Skeleton className="h-[43px] w-[200px] mb-[16px]" />
            <div className="space-y-[6px] max-w-[480px]">
              <Skeleton className="h-[21px] w-full" />
              <Skeleton className="h-[21px] w-[85%] hidden sm:block" />
            </div>
          </div>

          {/* Right Support Card */}
          <div 
            className="w-full xl:w-[460px] shrink-0 relative bg-[#FFFFFF] flex items-center justify-between overflow-hidden sm:overflow-visible"
            style={{
              borderRadius: "10px",
              border: "1px solid #F6E5DD",
              boxShadow: "0 2px 10px rgba(55, 35, 25, 0.035)",
              height: "120px"
            }}
          >
            <div className="pl-[24px] sm:pl-[28px] relative z-30 py-[24px] max-w-[200px] sm:max-w-[240px] w-full">
              <Skeleton className="h-[28px] w-[180px] mb-[6px]" />
              <Skeleton className="h-[18px] w-full max-w-[220px]" />
            </div>
            
            {/* Decoration SVG placeholder */}
            <div className="absolute left-[195px] bottom-[30px] w-[130px] h-[45px] z-10 hidden sm:block">
              <Skeleton className="w-[90px] h-[30px]" />
            </div>

            {/* Chef Image placeholder */}
            <div className="absolute right-0 bottom-0 h-[130%] w-[170px] z-20 flex items-end">
              <Skeleton className="w-[130px] h-[95%] rounded-t-full opacity-50 ml-auto" />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[20px] lg:gap-x-[32px] gap-y-[48px] mb-[64px] justify-items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center w-full max-w-[190px]">
              <div 
                className="flex items-center justify-center rounded-full mb-[18px] w-full aspect-square"
              >
                <div 
                  className="relative w-[100%] h-[100%] rounded-full overflow-hidden"
                  style={{
                    filter: "drop-shadow(0 5px 5px rgba(45, 30, 20, 0.12))"
                  }}
                >
                  <Skeleton className="w-full h-full" />
                </div>
              </div>
              <Skeleton className="h-[22px] w-[120px]" />
            </div>
          ))}
        </div>

        {/* Bottom Feature Bar */}
        <div 
          className="w-full bg-[#FFFFFF] flex flex-col md:flex-row items-stretch overflow-hidden"
          style={{
            borderRadius: "10px",
            border: "1px solid #EEE7E3",
            boxShadow: "0 2px 8px rgba(35, 25, 20, 0.035)"
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 flex items-center justify-center gap-[14px] py-[28px] px-[16px] ${
                i !== 4 ? 'border-b md:border-b-0 md:border-r border-dotted border-[#E3DEDA]' : ''
              }`}
            >
              <Skeleton className="w-[28px] h-[28px] shrink-0 rounded-md" />
              <div className="flex flex-col gap-[2px]">
                <Skeleton className="h-[19px] w-[110px]" />
                <Skeleton className="h-[16px] w-[130px]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
