"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { UtensilsCrossed, Star, ChevronRight, ArrowUpDown, Clock } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { SearchAutocomplete } from "@/components/search/search-autocomplete"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchItem {
  id: string
  slug?: string
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
  slug: string
  displayName: string
  avgRating: number
  totalReviews: number
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
}

interface SearchResult {
  dishes: SearchItem[]
  kitchens: SearchKitchen[]
}

type DishSort = "relevance" | "price-low" | "price-high" | "rating"
type KitchenSort = "relevance" | "rating" | "name"

interface DishGroup {
  kitchenId: string
  kitchenName: string
  avgRating: number
  totalReviews: number
  slug: string
  items: SearchItem[]
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
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border mb-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
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

function DishSortDropdown({ sort, onSortChange }: { sort: DishSort; onSortChange: (v: DishSort) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort: {sort === "relevance" ? "Relevance" : sort === "price-low" ? "Price: Low" : sort === "price-high" ? "Price: High" : "Rating"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as DishSort)}>
          <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function KitchenSortDropdown({ sort, onSortChange }: { sort: KitchenSort; onSortChange: (v: KitchenSort) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort: {sort === "relevance" ? "Relevance" : sort === "rating" ? "Rating" : "Name"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as KitchenSort)}>
          <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") ?? ""
  const [dishSort, setDishSort] = useState<DishSort>("relevance")
  const [kitchenSort, setKitchenSort] = useState<KitchenSort>("relevance")
  const [recentKitchens] = useState<{ id: string; slug: string; name: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recentlySearchedKitchens") || "[]")
    } catch {
      return []
    }
  })

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

  const dishes = useMemo(() => data?.dishes ?? [], [data?.dishes])
  const kitchens = useMemo(() => data?.kitchens ?? [], [data?.kitchens])
  const hasResults = dishes.length > 0 || kitchens.length > 0
  const isLoading = isFetching && !data

  const dishGroups = useMemo(() => {
    const groups = new Map<string, DishGroup>()
    for (const item of dishes) {
      const kid = item.kitchenId ?? "unknown"
      if (!groups.has(kid)) {
        const k = kitchens.find((k) => k.id === kid)
        groups.set(kid, {
          kitchenId: kid,
          kitchenName: item.kitchenName,
          avgRating: k?.avgRating ?? 0,
          totalReviews: k?.totalReviews ?? 0,
          slug: k?.slug ?? kid,
          items: [],
        })
      }
      groups.get(kid)!.items.push(item)
    }
    const arr = Array.from(groups.values())
    switch (dishSort) {
      case "price-low":
        return arr.sort((a, b) => Math.min(...a.items.map(i => i.price)) - Math.min(...b.items.map(i => i.price)))
      case "price-high":
        return arr.sort((a, b) => Math.max(...b.items.map(i => i.price)) - Math.max(...a.items.map(i => i.price)))
      case "rating":
        return arr.sort((a, b) => b.avgRating - a.avgRating)
      default:
        return arr
    }
  }, [dishes, kitchens, dishSort])

  const sortedKitchens = useMemo(() => {
    const arr = [...kitchens]
    switch (kitchenSort) {
      case "rating":
        return arr.sort((a, b) => b.avgRating - a.avgRating)
      case "name":
        return arr.sort((a, b) => a.displayName.localeCompare(b.displayName))
      default:
        return arr
    }
  }, [kitchens, kitchenSort])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <SearchAutocomplete
          placeholder="Search meals..."
          inputClassName="h-12 rounded-xl text-base pl-12 focus-visible:ring-1 bg-white border border-border"
        />
        {!q && recentKitchens.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Recently Searched Kitchens
            </p>
            <div className="flex flex-wrap gap-2">
              {recentKitchens.map((k) => (
                <Link
                  key={k.id}
                  href={`/kitchen/${k.slug}`}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {k.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {!q ? null : isLoading ? (
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
          {dishGroups.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Dishes
                  <span className="text-sm font-normal text-muted-foreground">({dishes.length})</span>
                </h2>
                <DishSortDropdown sort={dishSort} onSortChange={setDishSort} />
              </div>
              <div className="space-y-4">
                {dishGroups.map((group) => (
                  <Link
                    key={group.kitchenId}
                    href={`/kitchen/${group.slug}`}
                    className="block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-base">{group.kitchenName}</h3>
                          {group.avgRating > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center gap-0.5 rounded-sm bg-green-700 px-1 py-0.5">
                                <Star className="h-3 w-3 fill-white text-white" />
                                <span className="text-xs font-bold text-white">{group.avgRating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {group.totalReviews} ratings
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(`/menu/${item.slug ?? item.id}`)
                          }}
                          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            ) : (
                              <UtensilsCrossed className="h-6 w-6 text-muted-foreground/40" />
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-center line-clamp-1 w-20">{item.name}</p>
                          <p className="text-[10px] font-semibold text-primary">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {sortedKitchens.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Kitchens
                  <span className="text-sm font-normal text-muted-foreground">({sortedKitchens.length})</span>
                </h2>
                <KitchenSortDropdown sort={kitchenSort} onSortChange={setKitchenSort} />
              </div>
              <div className="space-y-4">
                {sortedKitchens.map((kitchen) => (
                  <Link
                    key={kitchen.id}
                    href={`/kitchen/${kitchen.slug}`}
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