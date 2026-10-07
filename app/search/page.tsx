import { Suspense } from "react"
import { SearchPageContent } from "@/components/search/search-page-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl pt-4">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-3 pt-2 px-4 sm:px-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        <div className="pb-10">
          <div className="space-y-10 px-4 sm:px-0 pt-6">
            <div>
              <Skeleton className="h-[20px] w-36 mb-4 rounded-md" />
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-[20px] w-48 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-[20px] w-36 mb-6 rounded-md" />
              <div className="flex gap-6 overflow-x-hidden pb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2.5 shrink-0">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
