import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <div className="mx-auto w-full max-w-[860px] px-4">
        <div className="sticky top-0 z-20 bg-white pt-4 pb-3 border-b border-border/60">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="py-4">
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-[5.5rem] rounded-lg" />
                <Skeleton className="h-8 w-[6.5rem] rounded-lg" />
              </div>
            </div>
            <div className="p-4 space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-1.5">
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
