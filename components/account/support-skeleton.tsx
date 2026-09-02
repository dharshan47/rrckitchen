import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export function SupportSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111827] pb-20 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb Section */}
        <div className="pt-1 pb-2">
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
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#FAFAFA] p-2 sm:p-4">
          <div>
            <Skeleton className="h-[36px] w-48 rounded mb-2" />
            <Skeleton className="h-[20px] w-72 md:w-96 rounded" />
          </div>
          <div className="hidden md:flex h-24 w-24 rounded-full items-center justify-center shrink-0 bg-[#F7F9F7]">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-[12px] border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(17,24,39,0.04)]">
              <Skeleton className="h-[52px] w-[52px] rounded-full mb-4" />
              <Skeleton className="h-[20px] w-20 rounded mb-1" />
              <Skeleton className="h-[14px] w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Raise a New Ticket (Form) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Skeleton className="h-[24px] w-48 rounded mb-6" />
            <Card className="rounded-[12px] border-[#E5E7EB] shadow-[0_2px_8px_rgba(17,24,39,0.04)] flex-1 flex flex-col bg-[#FFFFFF]">
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
                <div>
                  <Skeleton className="h-[16px] w-20 rounded mb-1.5" />
                  <Skeleton className="h-[44px] w-full rounded-[7px]" />
                </div>
                <div>
                  <Skeleton className="h-[16px] w-24 rounded mb-1.5" />
                  <Skeleton className="h-[44px] w-full rounded-[7px]" />
                </div>
                <div>
                  <Skeleton className="h-[16px] w-32 rounded mb-1.5" />
                  <Skeleton className="h-[44px] w-full rounded-[7px]" />
                </div>
                <div className="flex-1 flex flex-col">
                  <Skeleton className="h-[16px] w-28 rounded mb-1.5" />
                  <Skeleton className="min-h-[120px] w-full rounded-[7px]" />
                </div>
                <div>
                  <Skeleton className="h-[16px] w-32 rounded mb-1.5" />
                  <Skeleton className="h-[74px] w-full rounded-[8px]" />
                </div>
                <div className="flex gap-3 pt-4 mt-auto">
                  <Skeleton className="h-[44px] w-24 rounded-[7px]" />
                  <Skeleton className="h-[44px] flex-1 rounded-[8px]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: My Tickets */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <Skeleton className="h-[24px] w-32 rounded mb-6" />
            <Card className="rounded-[12px] border-[#E5E7EB] shadow-[0_2px_8px_rgba(17,24,39,0.04)] flex-1 flex flex-col bg-[#FFFFFF] overflow-hidden min-h-[500px]">
              <div className="px-6 pt-4 border-b border-[#ECEFF1] flex gap-6 overflow-x-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[24px] w-16 rounded mb-3" />
                ))}
              </div>
              <div className="p-6 m-0 flex-1 flex flex-col space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-[10px] border border-[#E9ECEF] p-4 bg-[#FFFFFF]">
                    <div className="flex gap-4">
                      <Skeleton className="h-[52px] w-[52px] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <Skeleton className="h-[20px] w-3/4 rounded" />
                          <Skeleton className="h-[18px] w-16 rounded-[6px]" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-[16px] w-32 rounded" />
                        </div>
                        <Skeleton className="h-[16px] w-full rounded mb-2" />
                        <div className="flex items-center justify-between mt-1">
                          <Skeleton className="h-[16px] w-24 rounded" />
                          <Skeleton className="h-4 w-4 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[#ECEFF1] bg-[#FFFFFF]">
                <Skeleton className="h-[40px] w-full rounded-[6px]" />
              </div>
            </Card>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* How to Use Support */}
            <Card className="rounded-[10px] border-[#DCE9DF] shadow-[0_2px_8px_rgba(17,24,39,0.04)] bg-[#FBFDFC]">
              <CardContent className="p-6">
                <Skeleton className="h-[20px] w-40 rounded mb-6" />
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[#DDE9E0]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <Skeleton className="h-6 w-6 rounded-full shrink-0 z-10" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-[16px] w-32 rounded" />
                        </div>
                        <Skeleton className="h-[14px] w-48 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="rounded-[10px] border-[#DCE9DF] shadow-[0_2px_8px_rgba(17,24,39,0.04)] bg-[#FBFDFC]">
              <CardContent className="p-5 flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                <div>
                  <Skeleton className="h-[20px] w-28 rounded mb-1" />
                  <Skeleton className="h-[16px] w-40 rounded mb-1" />
                  <Skeleton className="h-[16px] w-48 rounded" />
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Reach Us */}
            <div>
              <Skeleton className="h-[20px] w-44 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-[10px] border border-[#DCE9DF] bg-[#FBFDFC]">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    <div>
                      <Skeleton className="h-[16px] w-24 rounded mb-1" />
                      <Skeleton className="h-[14px] w-32 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F5FAF6] rounded-[12px] p-6 border border-[#DDE9E0]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div>
                <Skeleton className="h-[16px] w-32 rounded mb-0.5" />
                <Skeleton className="h-[14px] w-40 rounded" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
