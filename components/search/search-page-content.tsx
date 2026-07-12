"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search, Loader2, UtensilsCrossed, MapPin } from "lucide-react"
import Image from 'next/image'

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
}

interface SearchResult {
  items: SearchItem[]
  kitchens: SearchKitchen[]
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

  const items = data?.items ?? []
  const kitchens = data?.kitchens ?? []

  const hasResults = items.length > 0 || kitchens.length > 0

  const showLoader = isFetching && q.length >= 1 && !hasResults

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">

      {showLoader ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : q && !hasResults && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">
            We couldn&apos;t find anything for &ldquo;{q}&rdquo;
          </p>
        </div>
      ) : !q ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">Search for meals & kitchens</p>
          <p className="text-sm text-muted-foreground mt-1">
            Find your favourite meals or explore kitchens in Thanjavur
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {items.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Meals
                <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/menu/${item.id}`)}
                    className="rounded-xl border border-border bg-card overflow-hidden text-left hover:shadow-md transition-shadow group"
                  >
                    <div className="h-40 bg-muted flex items-center justify-center overflow-hidden relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.kitchenName}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">₹{item.price}</span>
                        {item.compareAtPrice && (
                          <span className="text-xs line-through text-muted-foreground">₹{item.compareAtPrice}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {kitchens.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Kitchens
                <span className="text-sm font-normal text-muted-foreground">({kitchens.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {kitchens.map((kitchen) => (
                  <button
                    key={kitchen.id}
                    onClick={() => router.push(`/menu?kitchen=${kitchen.id}`)}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{kitchen.displayName}</p>
                      <p className="text-xs text-muted-foreground">View meals from this kitchen</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
