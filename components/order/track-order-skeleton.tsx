import { Skeleton } from "@/components/ui/skeleton"

export function TrackOrderSkeleton() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen text-[#374151] pb-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-[18px] w-12 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-[18px] w-16 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-[18px] w-20 rounded" />
        </div>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <Skeleton className="h-[40px] w-64 rounded-lg mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-[22px] w-32 rounded" />
              <Skeleton className="h-[24px] w-24 rounded-full" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-[20px] w-56 rounded" />
            </div>
          </div>

          {/* Support Box */}
          <div className="bg-[#FFFFFF] border border-[#eef1f5] rounded-[26px] p-4 flex flex-wrap sm:flex-nowrap items-center gap-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] shrink-0 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div>
                <Skeleton className="h-[20px] w-24 rounded mb-1" />
                <Skeleton className="h-[18px] w-36 rounded" />
              </div>
            </div>
            <Skeleton className="h-10 w-full sm:w-[140px] rounded-[12px]" />
          </div>
        </div>

        {/* Middle Section (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column: Timeline */}
          <div className="order-2 lg:order-1 lg:col-span-3 bg-[#FFFFFF] rounded-[26px] p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col relative h-full">
            <Skeleton className="h-[26px] w-36 rounded mb-8" />
            <div className="relative flex-1">
              <div className="absolute top-5 bottom-16 left-[19px] w-[2px] bg-[#eef1f5]" />
              <div className="space-y-8 relative">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex gap-5 relative group">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0 z-10" />
                    <div className="flex-1">
                      <Skeleton className="h-[22px] w-32 rounded mb-1" />
                      <Skeleton className="h-[18px] w-24 rounded mb-1" />
                      <Skeleton className="h-[18px] w-40 rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom Safe Shield */}
            <div className="mt-8 bg-[#F0F8F3] rounded-[16px] p-4 flex items-center gap-3 border border-[#D9EBDD]">
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              <div className="flex-1">
                 <Skeleton className="h-[18px] w-36 rounded mb-0.5" />
                 <Skeleton className="h-[18px] w-40 rounded mt-0.5" />
              </div>
            </div>
          </div>

          {/* Center Column: Live Map */}
          <div className="order-1 lg:order-2 lg:col-span-9 relative rounded-[26px] overflow-hidden border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] bg-[#F8FAFC] w-full min-h-[400px]">
             {/* Map Overlay: Live Tracking */}
             <div className="absolute top-6 left-6 bg-[#FFFFFF] rounded-[16px] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] flex items-center gap-3">
               <Skeleton className="w-2 h-2 rounded-full" />
               <div>
                 <Skeleton className="h-[20px] w-28 rounded mb-1" />
                 <Skeleton className="h-[18px] w-48 rounded" />
               </div>
             </div>
             
             {/* Map Overlay: Estimated Delivery Time */}
             <div className="absolute top-6 right-6 bg-[#FFFFFF] rounded-[16px] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] text-right flex flex-col items-end">
               <Skeleton className="h-[18px] w-36 rounded mb-1" />
               <Skeleton className="h-[26px] w-20 rounded mb-1" />
               <Skeleton className="h-[18px] w-24 rounded" />
             </div>
          </div>
        </div>

        {/* Bottom Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
          {/* Order Details */}
          <div className="p-6 border-b lg:border-b-0 md:border-r border-[#eef1f5]">
            <Skeleton className="h-[26px] w-32 rounded mb-5" />
            <div className="flex gap-4 items-start">
              <Skeleton className="w-16 h-16 rounded-[16px] shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-[20px] w-28 rounded mb-1" />
                <Skeleton className="h-[18px] w-full rounded mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-[18px] w-20 rounded" />
                  <Skeleton className="h-[18px] w-16 rounded" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-[18px] w-28 rounded" />
              <Skeleton className="h-[22px] w-16 rounded-full" />
            </div>
          </div>

          {/* Delivery Partner */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#eef1f5]">
            <Skeleton className="h-[26px] w-36 rounded mb-5" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-[16px] shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-[20px] w-40 rounded mb-0.5" />
                <Skeleton className="h-[18px] w-48 rounded" />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#eef1f5]">
            <Skeleton className="h-[26px] w-36 rounded mb-5" />
            <Skeleton className="h-[20px] w-24 rounded mb-3" />
            <Skeleton className="h-[20px] w-full rounded mb-1" />
            <Skeleton className="h-[20px] w-3/4 rounded mb-3" />
            <Skeleton className="h-[18px] w-32 rounded" />
          </div>

          {/* Order Summary */}
          <div className="p-6">
            <Skeleton className="h-[26px] w-36 rounded mb-5" />
            <div className="space-y-3">
              <div className="flex justify-between"><Skeleton className="h-[20px] w-24 rounded" /> <Skeleton className="h-[20px] w-12 rounded" /></div>
              <div className="flex justify-between"><Skeleton className="h-[20px] w-16 rounded" /> <Skeleton className="h-[20px] w-14 rounded" /></div>
              <div className="flex justify-between"><Skeleton className="h-[20px] w-36 rounded" /> <Skeleton className="h-[20px] w-14 rounded" /></div>
            </div>
            <div className="mt-5 pt-5 border-t border-[#eef1f5] flex justify-between items-center">
              <Skeleton className="h-[22px] w-20 rounded" />
              <Skeleton className="h-[28px] w-16 rounded" />
            </div>
          </div>
        </div>

        {/* Footer: Trust Badges */}
        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap bg-[#FFFFFF] rounded-[26px] py-8 px-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] w-full gap-y-6">
          {[1, 2, 3, 4].map((i, idx, arr) => (
            <div key={i} className={`flex-1 flex items-center justify-start sm:justify-center gap-4 sm:px-6 ${idx !== arr.length - 1 ? 'sm:border-r border-[#eef1f5]' : ''}`}>
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col">
                <Skeleton className="h-[20px] w-28 rounded mb-1" />
                <Skeleton className="h-[18px] w-36 rounded" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
