import { Suspense } from "react"
import { SearchPageContent } from "@/components/search/search-page-content"

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchFallback() {
  return (
    <main className="w-full px-4 py-8 lg:mx-auto lg:max-w-7xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
