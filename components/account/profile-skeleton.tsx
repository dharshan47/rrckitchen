import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#111111] pb-12 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 flex gap-6 relative">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:block sticky top-8 left-0 h-auto w-64 bg-transparent z-auto">
          <div className="bg-white rounded-[12px] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-[#E6E6E6] flex flex-col min-h-max">
            <nav className="flex-1 space-y-1">
              {Array.from({ length: 11 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-[6px]">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              ))}
            </nav>

            <div className="mt-6 p-4 bg-[#F8FCF9] rounded-[10px] border border-[#DCEADF]">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 rounded mb-1" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="w-full mt-3 h-9 rounded-[6px]" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 min-w-0 pt-2 md:pt-0">
          
          {/* BREADCRUMB */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Skeleton className="h-4 w-12 rounded" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-16 rounded" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-14 rounded" />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Profile Header Card */}
          <Card className="p-6 md:p-8 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E7E7E7] bg-white">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                <div className="relative shrink-0">
                  <Skeleton className="h-[90px] w-[90px] rounded-full border border-[#E7E7E7]" />
                </div>
                <div className="text-center md:text-left pt-1 flex-1 flex flex-col items-center md:items-start">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <Skeleton className="h-[28px] w-48 rounded" />
                    <Skeleton className="h-[24px] w-20 rounded-[999px]" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2.5 w-full justify-center md:justify-start">
                    <Skeleton className="h-[18px] w-40 rounded" />
                    <Skeleton className="h-[18px] w-32 rounded" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full justify-center md:justify-start">
                    <Skeleton className="h-[18px] w-44 rounded" />
                    <Skeleton className="h-[18px] w-36 rounded" />
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0 shrink-0">
                <Skeleton className="h-9 w-full md:w-28 rounded-[6px]" />
              </div>
            </div>
          </Card>

          {/* Grid Section 1 (Loyalty, Favorites, Referrals) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white relative overflow-hidden flex flex-col justify-between h-full min-h-[180px]">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-[18px] w-[18px] rounded-full" />
                    <Skeleton className="h-5 w-32 rounded" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2 mt-2">
                    <Skeleton className="h-10 w-16 rounded" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded mt-1" />
                </div>
                
                <div className="mt-8 relative z-10">
                  <Skeleton className="h-8 w-28 rounded-[6px]" />
                </div>
              </Card>
            ))}
          </div>

          {/* Grid Section 2 (Recent Orders, Saved Addresses, Recent Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white flex flex-col h-full min-h-[300px]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-5 w-32 rounded" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex-1 space-y-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex gap-3 pb-4 border-b border-[#EEEEEE] last:border-0 last:pb-0">
                      <Skeleton className="h-[60px] w-[60px] rounded-[8px] shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between pt-0.5">
                        <Skeleton className="h-4 w-3/4 rounded mb-1" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <Skeleton className="h-3 w-1/4 rounded mt-auto" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-1">
                   <Skeleton className="w-full h-[40px] rounded-[6px]" />
                </div>
              </Card>
            ))}
            
          </div>
          
          {/* Footer Features */}
          <div className="mt-8 bg-[#FBF9F7] rounded-[12px] shadow-sm border border-[#E9E5E2] p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-x-0 md:divide-x divide-[#E9E5E2]">
               {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className={`flex flex-col items-center gap-2 px-2 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                    <Skeleton className="h-[28px] w-[28px] rounded-full" />
                    <div className="flex flex-col items-center w-full">
                      <Skeleton className="h-4 w-24 rounded mb-1" />
                      <Skeleton className="h-3 w-20 rounded" />
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
