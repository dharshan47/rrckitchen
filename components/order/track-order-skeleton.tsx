import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"

export function TrackOrderSkeleton() {
  const mapOverlays = (
    <>
      <div className="bg-[#FFFFFF] sm:bg-[#FFFFFF]/95 sm:backdrop-blur-md rounded-[20px] p-4 sm:pr-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:shadow-[0_20px_40px_rgba(15,23,42,0.08)] border border-[#eef1f5] flex items-center gap-3 sm:gap-4 pointer-events-auto self-stretch sm:self-auto max-w-full">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-[18px] sm:h-[22px] w-[140px] rounded-[4px] mb-0.5 sm:mb-1" />
          <Skeleton className="h-[15px] sm:h-[16px] w-[200px] rounded-[4px]" />
        </div>
      </div>
      
      <div className="bg-[#FFFFFF] rounded-[16px] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] text-left sm:text-right pointer-events-auto shrink-0 flex flex-row sm:flex-col justify-between items-center sm:items-end">
        <div className="sm:hidden">
          <Skeleton className="h-[14px] w-[100px] rounded-[4px] mb-1" />
          <Skeleton className="h-[14px] w-[80px] rounded-[4px] mt-1" />
        </div>
        <div className="hidden sm:block">
          <Skeleton className="h-[14px] sm:h-[16px] w-[130px] rounded-[4px] mb-0.5 sm:mb-1" />
        </div>
        <div className="text-right flex flex-col items-end">
          <Skeleton className="h-[20px] sm:h-[24px] w-[80px] rounded-[4px] mb-0.5 sm:mb-1" />
          <Skeleton className="h-[14px] sm:h-[16px] w-[100px] rounded-[4px] hidden sm:block" />
        </div>
      </div>
    </>
  )

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-[#374151] pb-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[13px]">
          <Skeleton className="h-[18px] w-10 rounded-[4px]" />
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <Skeleton className="h-[18px] w-16 rounded-[4px]" />
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <Skeleton className="h-[18px] w-[76px] rounded-[4px]" />
        </div>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <Skeleton className="h-[38px] w-[240px] rounded-[6px] mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-[20px] w-[140px] rounded-[4px]" />
              <Skeleton className="h-[24px] w-[70px] rounded-full" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-[20px] w-[220px] rounded-[4px]" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#eef1f5] rounded-[26px] p-4 flex flex-wrap sm:flex-nowrap items-center gap-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] shrink-0 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div>
                <Skeleton className="h-[18px] w-[80px] rounded-[4px] mb-1" />
                <Skeleton className="h-[16px] w-[140px] rounded-[4px]" />
              </div>
            </div>
            <Skeleton className="h-10 w-full sm:w-[150px] rounded-[12px]" />
          </div>
        </div>

        {/* Middle Section (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column: Timeline */}
          <div className="order-2 lg:order-1 lg:col-span-3 bg-[#FFFFFF] rounded-[26px] p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col relative h-full">
            <Skeleton className="h-[24px] w-[140px] rounded-[4px] mb-8" />
            <div className="relative flex-1">
              <div className="absolute top-5 bottom-16 left-[19px] w-[2px] bg-[#eef1f5]" />
              <div className="space-y-8 relative">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex gap-5 relative group">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0 z-10" />
                    <div className="flex-1 pt-1">
                      <Skeleton className="h-[18px] w-[120px] rounded-[4px]" />
                      <Skeleton className="h-[16px] w-[90px] rounded-[4px] mt-1" />
                      <Skeleton className="h-[16px] w-[95%] rounded-[4px] mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom Safe Shield */}
            <div className="mt-8 bg-[#F0F8F3] rounded-[16px] p-4 flex items-center gap-3 border border-[#D9EBDD]">
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              <div className="flex-1">
                 <Skeleton className="h-[16px] w-[160px] rounded-[4px] mb-0.5" />
                 <Skeleton className="h-[16px] w-[180px] rounded-[4px] mt-0.5" />
              </div>
            </div>
          </div>

          {/* Center Column: Live Map */}
          <div className="order-1 lg:order-2 lg:col-span-9 flex flex-col gap-4">
            <div className="relative z-0 rounded-[26px] overflow-hidden border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] bg-[#F8FAFC] w-full h-[350px] sm:h-[400px] lg:h-full lg:min-h-[400px]">
               <Skeleton className="w-full h-full rounded-none opacity-40" />
               <div className="hidden sm:flex absolute top-6 left-16 right-6 z-[1000] flex-row items-start justify-between gap-3 pointer-events-none">
                 {mapOverlays}
               </div>
            </div>
            <div className="flex sm:hidden flex-col gap-3 w-full">
              {mapOverlays}
            </div>
          </div>
        </div>

        {/* Bottom Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
          {/* Order Details */}
          <div className="p-6 border-b lg:border-b-0 md:border-r border-[#eef1f5]">
            <Skeleton className="h-[24px] w-[140px] rounded-[4px] mb-5" />
            <div className="flex gap-4 items-start">
              <Skeleton className="w-16 h-16 rounded-[16px] shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-[18px] w-[120px] rounded-[4px] mb-1" />
                <Skeleton className="h-[16px] w-[95%] rounded-[4px] mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-[16px] w-[60px] rounded-[4px]" />
                  <Skeleton className="h-[16px] w-[60px] rounded-[4px]" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-[16px] w-[100px] rounded-[4px]" />
              <Skeleton className="h-[20px] w-[60px] rounded-full" />
            </div>
          </div>

          {/* Delivery Partner */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#eef1f5]">
            <Skeleton className="h-[24px] w-[140px] rounded-[4px] mb-5" />
            <div className="flex gap-4 items-center">
              <Skeleton className="w-14 h-14 rounded-[16px] shrink-0" />
              <div>
                 <Skeleton className="h-[18px] w-[110px] rounded-[4px] mb-1" />
                 <Skeleton className="h-[16px] w-[130px] rounded-[4px]" />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#eef1f5]">
            <Skeleton className="h-[24px] w-[140px] rounded-[4px] mb-5" />
            <Skeleton className="h-[18px] w-[80px] rounded-[4px] mb-3" />
            <Skeleton className="h-[18px] w-full rounded-[4px] mb-1" />
            <Skeleton className="h-[18px] w-[75%] rounded-[4px] mb-3" />
            <Skeleton className="h-[16px] w-[120px] rounded-[4px]" />
          </div>

          {/* Order Summary */}
          <div className="p-6">
            <Skeleton className="h-[24px] w-[140px] rounded-[4px] mb-5" />
            <div className="space-y-3">
              <div className="flex justify-between"><Skeleton className="h-[18px] w-[80px] rounded-[4px]" /> <Skeleton className="h-[18px] w-[40px] rounded-[4px]" /></div>
              <div className="flex justify-between"><Skeleton className="h-[18px] w-[70px] rounded-[4px]" /> <Skeleton className="h-[18px] w-[50px] rounded-[4px]" /></div>
              <div className="flex justify-between"><Skeleton className="h-[18px] w-[130px] rounded-[4px]" /> <Skeleton className="h-[18px] w-[40px] rounded-[4px]" /></div>
            </div>
            <div className="mt-5 pt-5 border-t border-[#eef1f5] flex justify-between items-center">
              <Skeleton className="h-[20px] w-[80px] rounded-[4px]" />
              <Skeleton className="h-[24px] w-[80px] rounded-[4px]" />
            </div>
          </div>
        </div>

        {/* Footer: Trust Badges */}
        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap bg-[#FFFFFF] rounded-[26px] py-8 px-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] w-full gap-y-6">
          {[1, 2, 3, 4].map((i, idx, arr) => (
            <div key={i} className={`flex-1 flex items-center justify-start sm:justify-center gap-4 sm:px-6 ${idx !== arr.length - 1 ? 'sm:border-r border-[#eef1f5]' : ''}`}>
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col">
                <Skeleton className="h-[18px] w-[110px] rounded-[4px] mb-1" />
                <Skeleton className="h-[16px] w-[140px] rounded-[4px]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
