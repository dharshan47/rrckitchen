"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { UtensilsCrossed, Star, Search, ArrowUpDown, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useState, useMemo, useRef, useEffect, startTransition, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getRecentKitchens, addRecentKitchen } from "@/lib/recent-searches"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"
import { getKitchenStatus } from "@/components/kitchen/kitchen-timing-display"
import { useCartItems, useCartActions } from "@/stores/cartStore"
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
  kitchenSlug?: string
  imageUrl: string | null
  avgRating?: number
  totalReviews?: number
}

interface SearchKitchen {
  id: string
  slug: string
  displayName: string
  imageUrl: string | null
  avgRating: number
  totalReviews: number
  cuisineTags: string[]
  locality?: string
  distance?: string
  time?: string
  offer?: string
  isAd?: boolean
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
  operatingHours?: Record<string, { open: string; close: string }> | null
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
  offer?: string
  isAd?: boolean
  time?: string
  items: SearchItem[]
}

const POPULAR_CUISINES = [
  { name: "Rolls", image: "https://images.pexels.com/photos/17200361/pexels-photo-17200361.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Pizzas", image: "https://images.pexels.com/photos/5175546/pexels-photo-5175546.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Burger", image: "https://images.pexels.com/photos/5175611/pexels-photo-5175611.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Tea", image: "https://images.pexels.com/photos/16942969/pexels-photo-16942969.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Chinese", image: "https://images.pexels.com/photos/28895971/pexels-photo-28895971.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Cake", image: "https://images.pexels.com/photos/6441084/pexels-photo-6441084.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Dessert", image: "https://images.pexels.com/photos/34552000/pexels-photo-34552000.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "North Indian", image: "https://images.pexels.com/photos/8148149/pexels-photo-8148149.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "South Indian", image: "https://images.pexels.com/photos/36854501/pexels-photo-36854501.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Sandwich", image: "https://images.pexels.com/photos/1239347/pexels-photo-1239347.jpeg?auto=format&w=200&q=80&fit=crop" },
  { name: "Ice cream", image: "https://images.pexels.com/photos/9227710/pexels-photo-9227710.jpeg?auto=format&w=200&q=80&fit=crop" },
]

function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse px-4 py-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-28 w-28 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3 py-2">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/3 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/2 rounded-lg" />
                <Skeleton className="h-3 w-1/4 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") ?? ""
  const [localQuery, setLocalQuery] = useState(q)
  const [activeTab, setActiveTab] = useState<"kitchens" | "dishes">("kitchens")
  const [dishSort, setDishSort] = useState<DishSort>("relevance")
  const [kitchenSort, setKitchenSort] = useState<KitchenSort>("relevance")
  const [foodTypeFilter, setFoodTypeFilter] = useState<"all" | "veg" | "nonveg" | "pureveg">("all")
  const [ratingFilter, setRatingFilter] = useState(false)
  const [offerFilter, setOfferFilter] = useState(false)
  const [timeFilter, setTimeFilter] = useState(false)
  const [recentKitchens, setRecentKitchens] = useState<{ id: string; slug: string; name: string }[]>(!q ? getRecentKitchens() : [])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebouncedValue(localQuery, 300)
  const autocompleteQuery = useDebouncedValue(localQuery, 150)

  useEffect(() => {
    startTransition(() => { setLocalQuery(q) })
  }, [q])

  useEffect(() => {
    startTransition(() => {
      if (!q) {
        setRecentKitchens(getRecentKitchens())
      } else {
        setRecentKitchens([])
      }
    })
  }, [q])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: autocompleteData, isFetching: isAutocompleteFetching } = useQuery<SearchResult>({
    queryKey: ["menu-search-autocomplete", autocompleteQuery],
    queryFn: async () => {
      const res = await fetch(`/api/menu/search?q=${encodeURIComponent(autocompleteQuery)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: autocompleteQuery.length >= 1 && showAutocomplete,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  const { data, isFetching } = useQuery<SearchResult>({
    queryKey: ["menu-search-page", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/menu/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  })

  const dishes = useMemo(() => data?.dishes ?? [], [data?.dishes])
  const kitchens = useMemo(() => data?.kitchens ?? [], [data?.kitchens])
  const hasResults = dishes.length > 0 || kitchens.length > 0
  const isLoading = isFetching && !data

  const autocompleteDishes = useMemo(() => autocompleteData?.dishes ?? [], [autocompleteData?.dishes])
  const autocompleteKitchens = useMemo(() => autocompleteData?.kitchens ?? [], [autocompleteData?.kitchens])

  const flatAutocompleteItems = useMemo(() => {
    const items: ({ type: "item" } & SearchItem)[] = autocompleteDishes.map((i) => ({ ...i, type: "item" as const }))
    const kitchenItems: ({ type: "kitchen"; id: string; slug: string; name: string; kitchenName: string } & SearchItem)[] = autocompleteKitchens.map((k) => ({
      ...({} as SearchItem),
      type: "kitchen" as const,
      id: k.id,
      slug: k.slug,
      name: k.displayName,
      kitchenName: k.displayName,
    }))
    return [...items, ...kitchenItems]
  }, [autocompleteDishes, autocompleteKitchens])

  const dishGroups = useMemo(() => {
    const groups = new Map<string, DishGroup>()
    for (const item of dishes) {
      const kid = item.kitchenId ?? "unknown"
      if (!groups.has(kid)) {
        const k = kitchens.find((k) => k.id === kid)
        const kitchenName = k?.displayName ?? item.kitchenName
        const slug = k?.slug ?? item.kitchenSlug ?? kitchenName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        groups.set(kid, {
          kitchenId: kid,
          kitchenName,
          avgRating: k?.avgRating ?? item.avgRating ?? 0,
          totalReviews: k?.totalReviews ?? item.totalReviews ?? 0,
          slug,
          offer: k?.offer,
          isAd: k?.isAd,
          time: k?.time,
          items: [],
        })
      }
      const group = groups.get(kid)!
      group.items.push({ ...item, kitchenName: item.kitchenName || group.kitchenName })
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

  const filteredDishGroups = useMemo(() => {
    return dishGroups.map(group => {
      if (foodTypeFilter === "pureveg" && group.items.some(item => item.foodType !== "VEG")) {
        return { ...group, items: [] }
      }
      return {
        ...group,
        items: group.items.filter(item => {
          if (foodTypeFilter === "veg" && item.foodType !== "VEG") return false
          if (foodTypeFilter === "nonveg" && item.foodType !== "NONVEG") return false
          if (ratingFilter && (!item.avgRating || item.avgRating < 4)) return false
          if (offerFilter && !group.offer) return false
          return true
        }),
      }
    }).filter(g => g.items.length > 0)
  }, [dishGroups, foodTypeFilter, ratingFilter, offerFilter])

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

  const handleAutocompleteSelect = useCallback(
    (type: "item" | "kitchen", id: string, slug?: string, kitchenName?: string, itemName?: string) => {
      setShowAutocomplete(false)
      if (type === "item") {
        router.push(`/search?q=${encodeURIComponent(itemName ?? localQuery)}`)
      } else {
        if (kitchenName) {
          addRecentKitchen({ id, slug: slug ?? id, name: kitchenName })
        }
        router.push(`/kitchen/${slug ?? id}`)
      }
    },
    [router, localQuery]
  )

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || flatAutocompleteItems.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < flatAutocompleteItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatAutocompleteItems.length - 1))
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < flatAutocompleteItems.length) {
        e.preventDefault()
        const selected = flatAutocompleteItems[selectedIndex]
        if (selected.type === "item") {
          handleAutocompleteSelect("item", selected.id, selected.slug, undefined, selected.name)
        } else {
          const k = autocompleteKitchens[selectedIndex - autocompleteDishes.length] || autocompleteKitchens[0]
          handleAutocompleteSelect("kitchen", k?.id ?? selected.id, k?.slug ?? selected.slug, k?.displayName)
        }
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      setShowAutocomplete(false)
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-215">
        {/* Sticky Search Header */}
        <div ref={wrapperRef} className="sticky top-0 z-30 bg-white pt-6 pb-2 px-4 sm:px-0">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center h-14 border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden transition-all focus-within:border-gray-400 focus-within:shadow-md">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-4 text-gray-500 hover:text-gray-700 flex items-center justify-center h-full"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value)
                setSelectedIndex(-1)
                setShowAutocomplete(true)
              }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for kitchens and food"
              className="flex-1 h-full bg-transparent text-[15px] font-medium outline-none placeholder:text-gray-400 placeholder:font-medium text-foreground"
            />
            {localQuery ? (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("")
                  inputRef.current?.focus()
                }}
                className="px-4 text-gray-400 hover:text-gray-600 flex items-center justify-center h-full"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <div className="px-4 text-gray-400 flex items-center justify-center h-full">
                 <Search className="h-5 w-5" />
              </div>
            )}
          </form>
          {showAutocomplete && localQuery.length >= 1 && (
            <div className="absolute left-0 right-0 z-50 mt-1 mx-4 sm:mx-0 rounded-xl border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
              {isAutocompleteFetching ? (
                <div className="px-4 py-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-lg bg-gray-100" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-3/4 rounded bg-gray-100" />
                        <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : flatAutocompleteItems.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">
                  No results found for &ldquo;{autocompleteQuery}&rdquo;
                </div>
              ) : (
                <>
                  {autocompleteDishes.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Dishes</p>
                      {autocompleteDishes.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => handleAutocompleteSelect("item", item.id, item.slug, undefined, item.name)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                            selectedIndex === i && "bg-gray-50"
                          )}
                        >
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="32px" />
                            ) : (
                              <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">{item.kitchenName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {autocompleteKitchens.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Kitchens</p>
                      {autocompleteKitchens.map((kitchen, i) => {
                        const idx = autocompleteDishes.length + i
                        return (
                          <button
                            key={kitchen.id}
                            onClick={() => handleAutocompleteSelect("kitchen", kitchen.id, kitchen.slug, kitchen.displayName)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                              selectedIndex === idx && "bg-gray-50"
                            )}
                          >
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                              {kitchen.imageUrl ? (
                                <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className="object-cover" sizes="32px" />
                              ) : (
                                <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{kitchen.displayName}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="pb-10">
          {!localQuery ? (
            <div className="space-y-10 px-4 sm:px-0 pt-6">
              {recentKitchens.length > 0 && (
                <div>
                  <h2 className="text-[17px] font-extrabold text-foreground mb-4">
                    Recent Searches
                  </h2>
                  <div className="space-y-5">
                    {recentKitchens.map((k) => (
                      <Link
                        key={k.id}
                        href={`/kitchen/${k.slug}`}
                        className="flex items-center gap-4 text-[15px] font-medium text-[#4b5563] hover:text-foreground transition-colors"
                      >
                        <Search className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                        <span className="truncate">{k.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-[17px] font-extrabold text-foreground mb-6">
                  Popular Cuisines
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
                  {POPULAR_CUISINES.map((cuisine) => (
                    <Link
                      key={cuisine.name}
                      href={`/search?q=${cuisine.name}`}
                      className="flex flex-col items-center gap-2.5 shrink-0 group"
                    >
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border border-gray-100 bg-white shadow-xs group-hover:shadow-sm transition-all">
                        <Image 
                          src={cuisine.image} 
                          alt={cuisine.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform" 
                          sizes="80px"
                        />
                      </div>
                      <span className="text-[12px] font-bold text-[#4b5563] group-hover:text-foreground transition-colors text-center">{cuisine.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <SearchSkeleton />
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <UtensilsCrossed className="h-14 w-14 text-muted-foreground/20 mb-4" />
              <p className="text-xl font-bold text-foreground">No results found</p>
              <p className="text-[15px] font-medium text-muted-foreground mt-2 max-w-sm mx-auto">
                We couldn&apos;t find anything matching &ldquo;{debouncedQuery}&rdquo;. Try another search term.
              </p>
            </div>
          ) : (
            <div className="flex flex-col bg-[#f0f2f5] min-h-screen">
              {/* TABS HEADER */}
              <div className="sticky top-18 z-20 bg-white px-4 sm:px-0">
                <div className="flex items-center gap-8 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("kitchens")}
                    className={cn(
                      "relative py-4 text-[15px] font-bold transition-colors",
                      activeTab === "kitchens" ? "text-[#EE7005]" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Kitchens
                    {activeTab === "kitchens" && (
                      <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#EE7005]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("dishes")}
                    className={cn(
                      "relative py-4 text-[15px] font-bold transition-colors",
                      activeTab === "dishes" ? "text-[#EE7005]" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    Dishes
                    {activeTab === "dishes" && (
                      <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#EE7005]" />
                    )}
                  </button>
                </div>
              </div>

              {activeTab === "kitchens" && (
                <div className="p-4 sm:p-6 bg-white min-h-[calc(100vh-200px)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-bold text-gray-500">{sortedKitchens.length} results</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-[13px] font-bold">
                          <ArrowUpDown className="h-4 w-4" />
                          {kitchenSort === "relevance" ? "Relevance" : kitchenSort === "rating" ? "Rating" : "Name"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={kitchenSort} onValueChange={(v) => setKitchenSort(v as KitchenSort)}>
                          <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedKitchens.map((kitchen) => (
                      <KitchenSearchCard key={kitchen.id} kitchen={kitchen} query={localQuery} />
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === "dishes" && (
                 <div className="bg-[#f0f2f5]">
                     {/* Filters + Sort for Dishes */}
                     <div className="bg-white py-4 px-4 sm:px-6 shadow-sm overflow-x-auto scrollbar-none flex items-center gap-3">
                        <button
                          onClick={() => setTimeFilter(p => !p)}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            timeFilter ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >15-20 mins</button>
                        <button
                          onClick={() => setFoodTypeFilter(p => p === "veg" ? "all" : "veg")}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            foodTypeFilter === "veg" ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >Veg Dishes</button>
                        <button
                          onClick={() => setFoodTypeFilter(p => p === "nonveg" ? "all" : "nonveg")}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            foodTypeFilter === "nonveg" ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >Non-Veg</button>
                        <button
                          onClick={() => setFoodTypeFilter(p => p === "pureveg" ? "all" : "pureveg")}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            foodTypeFilter === "pureveg" ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >Pure Veg</button>
                        <button
                          onClick={() => setRatingFilter(p => !p)}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            ratingFilter ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >Rated 4+</button>
                        <button
                          onClick={() => setOfferFilter(p => !p)}
                          className={cn(
                            "whitespace-nowrap shrink-0 border rounded-[10px] px-3.5 py-1.5 text-[13px] font-bold transition-colors",
                            offerFilter ? "border-[#EE7005] bg-[#EE7005] text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          )}
                        >Offers</button>
                       <div className="ml-auto shrink-0">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm" className="gap-2 text-[13px] font-bold">
                               <ArrowUpDown className="h-4 w-4" />
                               {dishSort === "relevance" ? "Relevance" : dishSort === "price-low" ? "Price: Low" : dishSort === "price-high" ? "Price: High" : "Rating"}
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuRadioGroup value={dishSort} onValueChange={(v) => setDishSort(v as DishSort)}>
                               <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                    </div>

                     <div className="p-4 sm:p-6 space-y-4">
                      {filteredDishGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-[15px] font-bold text-gray-500">No dishes match the selected filters</p>
                        </div>
                      ) : null}
                      {filteredDishGroups.map((group) => (
                        <div key={group.kitchenId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden pt-4 pb-5 pl-4 sm:pl-6 pr-0">
                           <div className="flex items-center justify-between mb-4 pr-4 sm:pr-6">
                              <div className="min-w-0">
                                 <div className="flex items-center gap-1.5 mb-0.5">
                                    {group.isAd && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1 rounded-sm uppercase tracking-wide">Ad</span>}
                                    <h3 className="font-bold text-[16px] text-foreground truncate leading-tight">{group.kitchenName}</h3>
                                 </div>
<div className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground leading-none">
                                     <div className="flex items-center justify-center h-4 w-4 rounded-full bg-success text-white">
                                        <Star className="h-2.5 w-2.5 fill-white" />
                                     </div>
                                     <span>{group.avgRating > 0 ? group.avgRating.toFixed(1) : "NEW"}</span>
                                     {group.totalReviews > 0 && <span>({group.totalReviews})</span>}
                                     <span className="opacity-50">•</span>
                                     <span>{group.time ?? "15-20 mins"}</span>
                                  </div>
                                 {group.offer && (
                                    <div className="flex items-center gap-1 mt-1.5 text-[#EE7005]">
                                       <svg className="h-3.5 w-3.5 fill-[#EE7005]" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                                       <span className="text-[11px] font-bold uppercase">{group.offer}</span>
                                    </div>
                                 )}
                              </div>
                              <Link href={`/kitchen/${group.slug}`} className="text-gray-400 hover:text-gray-600 shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-50">
                                 <ChevronRight className="h-5 w-5" />
                              </Link>
                           </div>
                           
                           {/* Horizontal Scroll of Dishes */}
                           <div className="flex gap-4 overflow-x-auto scrollbar-none pr-4 sm:pr-6 pb-2">
                              {group.items.map((item) => (
                                <DishSearchCard key={item.id} item={item} />
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KitchenSearchCard({ kitchen, query }: { kitchen: SearchKitchen; query: string }) {
  const status = useMemo(() => getKitchenStatus(kitchen.operatingHours ?? null), [kitchen.operatingHours]);
  const isClosed = !status.isOpen;

  return (
    <Link
      href={`/kitchen/${kitchen.slug}${query ? `?q=${encodeURIComponent(query)}` : ""}`}
      className="flex gap-4 p-4 bg-white border border-transparent hover:border-gray-200 rounded-none hover:shadow-md transition-all group border-b border-b-gray-100 lg:border-b-transparent"
    >
      <div className="relative w-32.5 h-35 sm:w-37.5 sm:h-37.5 shrink-0 rounded-2xl overflow-hidden bg-muted shadow-sm">
        {kitchen.imageUrl ? (
          <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className={cn("object-cover group-hover:scale-105 transition-transform duration-500", isClosed && "grayscale opacity-80")} sizes="150px" />
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/10 to-muted">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {kitchen.isAd && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm uppercase tracking-wide">Ad</div>
        )}
        {kitchen.offer && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%]">
            <div className="bg-white/95 backdrop-blur-xs text-[#EE7005] text-[12px] font-black py-1.5 px-1 rounded-xl shadow-md text-center uppercase leading-none border border-gray-100 flex flex-col justify-center min-h-9">
              {kitchen.offer.includes("OFF") ? (
                <>
                  <span className="text-[12px] whitespace-nowrap">{kitchen.offer.split("UPTO")[0]}</span>
                  {kitchen.offer.includes("UPTO") && <span className="text-[8px] opacity-80 mt-0.5">UPTO {kitchen.offer.split("UPTO")[1]}</span>}
                </>
              ) : (
                <>
                  <span className="block text-gray-500 text-[8px] mb-0.5 font-bold">ITEMS</span>
                  <span className="text-[12px] whitespace-nowrap">{kitchen.offer.replace("ITEMS AT ", "")}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 pl-1">
        <h3 className="font-bold text-[17px] text-foreground leading-tight truncate">{kitchen.displayName}</h3>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gray-600 text-gray-600" />
          <span>{kitchen.avgRating > 0 ? `${kitchen.avgRating.toFixed(1)} (${kitchen.totalReviews})` : "NEW"}</span>
          <span className="opacity-40">•</span>
          <span>{kitchen.time ?? "15-20 MINS"}</span>
        </div>
        {kitchen.cuisineTags.length > 0 && <p className="text-[13px] font-medium text-gray-500 truncate mt-1">{kitchen.cuisineTags.join(", ")}</p>}
      </div>
    </Link>
  )
}

function DishSearchCard({ item }: { item: SearchItem }) {
  const cartItems = useCartItems()
  const { addToCart, updateQuantity } = useCartActions()
  const cartItem = cartItems.find((ci) => ci.id === item.id)
  const qty = cartItem?.qty ?? 0

  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName: item.kitchenName,
      kitchenId: item.kitchenId ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
    })
  }

  return (
    <div className="flex flex-col min-w-70 max-w-[320px] p-4 bg-white rounded-[20px] border border-gray-200 shrink-0">
       <div className="flex items-start justify-between gap-4 h-full">
          <div className="flex-1 min-w-0 flex flex-col h-full">
             <div className="mb-2">
                <FoodTypeIcon foodType={item.foodType} />
             </div>
             {item.kitchenName && <p className="text-[12px] font-bold text-gray-500 truncate mb-0.5">{item.kitchenName}</p>}
             <h4 className="font-bold text-[16px] text-foreground line-clamp-2 leading-snug">{item.name}</h4>
             {item.avgRating ? (
                <div className="flex items-center gap-1 text-[13px] font-bold text-success mt-1">
                   <Star className="h-3.5 w-3.5 fill-success text-success" />
                   <span>{item.avgRating}{item.totalReviews ? ` (${item.totalReviews})` : ""}</span>
                </div>
             ) : null}
             <div className="flex items-center gap-2 mt-auto pt-3">
                <span className="text-[15px] font-bold text-foreground">₹{item.price}</span>
                {item.compareAtPrice && <span className="text-[13px] font-medium text-gray-400 line-through">₹{item.compareAtPrice}</span>}
             </div>
          </div>
          <div className="relative w-27.5 h-27.5 shrink-0 rounded-xl bg-gray-50">
             {item.imageUrl ? (
               <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" sizes="110px" />
             ) : (
               <div className="flex items-center justify-center h-full"><UtensilsCrossed className="h-6 w-6 text-muted-foreground/30" /></div>
             )}
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] z-10">
               {qty === 0 ? (
                 <Button size="sm" variant="outline" onClick={handleAdd} className="w-full h-8 bg-white text-success border-gray-200 font-black text-[13px] shadow-sm hover:bg-success hover:text-white transition-all rounded-lg text-center px-0">ADD</Button>
               ) : (
                 <div className="flex items-center h-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                   <button
                     onClick={() => { if (qty === 1) return; updateQuantity(item.id, qty - 1) }}
                     className="flex items-center justify-center h-full w-8 text-success font-bold text-lg hover:bg-gray-50 rounded-l-lg transition-colors"
                   >−</button>
                   <span className="flex items-center justify-center h-full min-w-8 text-[13px] font-black text-foreground">{qty}</span>
                   <button
                     onClick={() => updateQuantity(item.id, qty + 1)}
                     className="flex items-center justify-center h-full w-8 text-success font-bold text-lg hover:bg-gray-50 rounded-r-lg transition-colors"
                   >+</button>
                 </div>
               )}
             </div>
          </div>
       </div>
    </div>
  )
}

function FoodTypeIcon({ foodType }: { foodType: string }) {
  if (foodType === "VEG") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="white" stroke="#22C55E" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="3.5" fill="#22C55E" />
      </svg>
    );
  }
  if (foodType === "NONVEG") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="white" stroke="#EF4444" strokeWidth="1.5" />
        <path d="M8 4L11 12H5L8 4Z" fill="#EF4444" />
      </svg>
    );
  }
  return null;
}
