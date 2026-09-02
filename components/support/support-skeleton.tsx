"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SupportClientSkeleton() {
  return (
    <div className="bg-[#FEFEFE] min-h-screen pb-20">
      {/* HERO SECTION */}
      <section className="relative px-4 pt-10 pb-16 md:px-8 overflow-hidden"
               style={{
                 background: "linear-gradient(135deg, #FFF8F2 0%, #FFF4EA 50%, #FFFDF9 100%)",
                 borderBottom: "1px solid #F9DCC5",
                 borderBottomLeftRadius: "24px",
                 borderBottomRightRadius: "24px"
               }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 max-w-xl w-full">
            <Skeleton className="h-[48px] md:h-[60px] w-3/4 mb-4 rounded-lg bg-black/5" />
            <Skeleton className="h-[48px] md:h-[60px] w-2/3 mb-4 rounded-lg bg-black/5" />
            
            <Skeleton className="h-6 w-5/6 mb-8 mt-4 bg-black/5" />
            
            <Skeleton className="w-full h-14 rounded-xl mb-6 bg-white border border-[#E5E7EB]" />
            
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-24 mr-2 bg-black/5" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full bg-white border border-[#E5E7EB]" />
              ))}
            </div>
          </div>
          
          <div className="flex-1 hidden md:block w-full max-w-[450px]">
            <Skeleton className="w-full aspect-square rounded-full bg-black/5" />
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16 space-y-16">
        
        {/* ROLE CARDS */}
        <section className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-3 bg-black/5 rounded-lg" />
          <Skeleton className="h-5 w-72 mx-auto mb-8 bg-black/5 rounded-lg" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-[14px] flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-full bg-black/5 shrink-0" />
                <div className="flex-1 pr-2 text-left">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-black/5" />
                  <Skeleton className="h-4 w-full mb-1 bg-black/5" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-black/5" />
                  <div className="flex justify-end w-full">
                    <Skeleton className="w-5 h-5 rounded-full bg-black/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HELP TOPICS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48 bg-black/5 rounded-lg" />
            <Skeleton className="h-5 w-24 bg-black/5 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-[12px] flex items-start gap-4 h-[130px]">
                <Skeleton className="w-12 h-12 rounded-full shrink-0 bg-black/5" />
                <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                  <div>
                    <Skeleton className="h-4 w-3/4 mb-2 bg-black/5" />
                    <Skeleton className="h-3 w-full mb-1 bg-black/5" />
                    <Skeleton className="h-3 w-2/3 bg-black/5" />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Skeleton className="w-4 h-4 rounded-full bg-black/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO COLUMNS: Need More Help & Highlights */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-[#E5E7EB] rounded-[16px] p-6 md:p-8 flex flex-col md:flex-row gap-8 bg-black/5">
             <div className="flex-1">
               <Skeleton className="h-7 w-48 mb-2 bg-black/10" />
               <Skeleton className="h-4 w-64 mb-6 bg-black/10" />
               <div className="hidden md:block w-[240px] h-[150px] bg-black/10 rounded-lg mt-auto mx-auto lg:mx-0"></div>
             </div>
             <div className="flex-1 space-y-4">
               {Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-4">
                   <Skeleton className="w-10 h-10 rounded-full bg-black/5 shrink-0" />
                   <div className="flex-1">
                     <Skeleton className="h-4 w-24 mb-1.5 bg-black/5" />
                     <Skeleton className="h-3 w-32 bg-black/5" />
                   </div>
                   <Skeleton className="w-16 h-6 rounded-md bg-black/5 shrink-0" />
                 </div>
               ))}
             </div>
          </div>
          
          <div className="lg:col-span-1 border border-[#E5E7EB] rounded-[16px] p-6 md:p-8 bg-black/5">
            <Skeleton className="h-6 w-48 mb-6 bg-black/10" />
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full bg-black/10 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1.5 bg-black/10" />
                    <Skeleton className="h-3 w-full bg-black/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <Skeleton className="h-6 w-32 mb-4 bg-black/5 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
             {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col gap-3 items-start">
                 <Skeleton className="w-9 h-9 rounded-full bg-black/5 shrink-0" />
                 <div className="w-full">
                   <Skeleton className="h-4 w-24 mb-1.5 bg-black/5" />
                   <Skeleton className="h-3 w-32 bg-black/5" />
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* Satisfaction Banner */}
        <section className="bg-black/5 border border-[#E5E7EB] rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 flex-1">
             <Skeleton className="w-12 h-12 rounded-full bg-black/10 shrink-0" />
             <div className="w-full">
               <Skeleton className="h-6 w-64 mb-2 bg-black/10" />
               <Skeleton className="h-4 w-full max-w-md bg-black/10" />
             </div>
           </div>
           <Skeleton className="h-10 w-32 rounded-lg bg-black/10 shrink-0" />
        </section>
      </div>
    </div>
  );
}
