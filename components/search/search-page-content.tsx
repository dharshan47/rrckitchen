"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search, UtensilsCrossed, Star, ChevronRight } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchItem {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  foodType: string
  timeSlot: string
  kitchenName: string
  kitchenId: string | null
  imageUrl: string | null
}

interface SearchKitchen {
  id: string
  displayName: string
  avgRating: number
  totalReviews: number
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
}

interface SearchResult {
  dishes: SearchItem[]
  kitchens: SearchKitchen[]
}

function SearchSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border mb-4 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") ?? ""

  const { data, isFetching } = useQuery<SearchResult>({
    queryKey: ["menu-search-page", q],
    queryFn: async () => {
      const res = await fetch(`/api/menu/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  })

  const dishes = data?.dishes ?? []
  const kitchens = data?.kitchens ?? []
  const hasResults = dishes.length > 0 || kitchens.length > 0
  const isLoading = isFetching && !data

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {!q ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">Search for meals & kitchens</p>
          <p className="text-sm text-muted-foreground mt-1">
            Find your favourite meals or explore kitchens in Thanjavur
          </p>
        </div>
      ) : isLoading ? (
        <SearchSkeleton />
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">
            We couldn&apos;t find anything for &ldquo;{q}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {dishes.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Dishes
                <span className="text-sm font-normal text-muted-foreground">({dishes.length})</span>
              </h2>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {dishes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/menu/${item.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <UtensilsCrossed className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.kitchenName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.compareAtPrice != null ? (
                          <div className="rounded-sm bg-[#EE7005] px-1.5 py-0.5 text-xs font-bold text-white">
                            ₹{item.price}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-foreground">₹{item.price}</span>
                        )}
                        {item.compareAtPrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{item.compareAtPrice}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {kitchens.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Kitchens
                <span className="text-sm font-normal text-muted-foreground">({kitchens.length})</span>
              </h2>
              <div className="space-y-4">
                {kitchens.map((kitchen) => (
                  <Link
                    key={kitchen.id}
                    href={`/menu?kitchen=${kitchen.id}`}
                    className="block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-base">{kitchen.displayName}</h3>
                          {kitchen.avgRating > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center gap-0.5 rounded-sm bg-green-700 px-1 py-0.5">
                                <Star className="h-3 w-3 fill-white text-white" />
                                <span className="text-xs font-bold text-white">{Number(kitchen.avgRating).toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {kitchen.totalReviews} ratings
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                    {kitchen.items.length > 0 && (
                      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
                        {kitchen.items.map((mi) => (
                          <div
                            key={mi.id}
                            className="flex flex-col items-center gap-1 shrink-0"
                          >
                            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
                              {mi.imageUrl ? (
                                <Image src={mi.imageUrl} alt={mi.name} fill className="object-cover" />
                              ) : (
                                <UtensilsCrossed className="h-6 w-6 text-muted-foreground/40" />
                              )}
                            </div>
                            <p className="text-[10px] font-medium text-center line-clamp-1 w-20">{mi.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
