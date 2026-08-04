"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query"
import { UtensilsCrossed, Star, Search, X, ChevronLeft, Heart, ShieldCheck, Clock, Leaf, Users } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useState, useMemo, useRef, useEffect, startTransition, useCallback } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecentKitchens, addRecentKitchen } from "@/lib/recent-searches"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"
import { getKitchenStatus } from "@/components/kitchen/kitchen-timing-display"

import { useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores"
import { haversineDistance } from "@/lib/geo"
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
  lat: number | null
  lng: number | null
  profileImage?: string | null
  estimatedPrepTime?: number | null
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
  operatingHours?: Record<string, { open: string; close: string }> | null
}

interface SearchResult {
  dishes: SearchItem[]
  kitchens: SearchKitchen[]
  nextCursor: string | null
}

type KitchenSort = "relevance" | "rating" | "name"

interface CategoryData {
  id: string
  name: string
  kitchenCount: number
  imageUrl: string
}

interface SearchPageContentData {
  id: string
  keyword: string
  bannerImageUrl: string
  heading: string
  subHeading: string
  cardsPerPage: number
  defaultSort: string
  showRatings: boolean
  kitchensCount: number
  filters: { id: string; name: string; options: string[] }[]
  badges: { id: string; name: string }[]
  infoItems: { id: string; icon: string; title: string; subtitle: string; color: string }[]
}

const INFO_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  ShieldCheck,
  Clock,
  Leaf,
  Users,
}

function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse px-4 py-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-4">
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
  const [kitchenSort, setKitchenSort] = useState<KitchenSort>("relevance")
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery<SearchResult>({
    queryKey: ["menu-search-page", debouncedQuery],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set("q", debouncedQuery)
      if (pageParam) params.set("cursor", pageParam as string)
      const res = await fetch(`/api/menu/search?${params}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  })

  const { data: categoriesData } = useQuery<CategoryData[]>({
    queryKey: ["kitchen-categories"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
    staleTime: 120_000,
  })

  const contentKeyword = debouncedQuery.trim().toLowerCase().replace(/\s+/g, "-")
  const { data: pageData } = useQuery<{ content: SearchPageContentData | null }>({
    queryKey: ["search-page-content", contentKeyword],
    queryFn: async () => {
      const res = await fetch(`/api/search/content?keyword=${encodeURIComponent(contentKeyword)}`)
      if (!res.ok) throw new Error("Failed to fetch search page content")
      return res.json()
    },
    enabled: contentKeyword.length >= 1,
    staleTime: 30_000,
    refetchInterval: 120_000,
  })
  const pageContent = pageData?.content ?? null
  const enabledFilters = useMemo(() => (pageContent ? pageContent.filters : []), [pageContent])
  const enabledInfoItems = useMemo(() => (pageContent ? pageContent.infoItems : []), [pageContent])
  const enabledBadges = useMemo(() => (pageContent ? pageContent.badges : []), [pageContent])

  const dishes = useMemo(() => data?.pages[0]?.dishes ?? [], [data])
  const kitchens = useMemo(() => {
    const seen = new Set<string>()
    return (data?.pages.flatMap((page) => page.kitchens) ?? []).filter((k) => {
      if (seen.has(k.id)) return false
      seen.add(k.id)
      return true
    })
  }, [data])
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



  const [prevDefaultSort, setPrevDefaultSort] = useState<string | undefined>(undefined)
  if (prevDefaultSort !== pageContent?.defaultSort) {
    setPrevDefaultSort(pageContent?.defaultSort)
    const raw = pageContent?.defaultSort?.toLowerCase()
    if (raw === "rating") setKitchenSort("rating")
    else if (raw === "name" || raw === "a-z") setKitchenSort("name")
    else setKitchenSort("relevance")
  }

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

  const [colCount, setColCount] = useState(1);
  useEffect(() => {
    const updateCols = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColCount(6);
      else if (width >= 1280) setColCount(5);
      else if (width >= 1024) setColCount(4);
      else if (width >= 768) setColCount(3);
      else if (width >= 640) setColCount(2);
      else setColCount(1);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage()
      },
      { rootMargin: "400px" },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const rowCount = Math.ceil(sortedKitchens.length / colCount);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 390,
    overscan: 2,
  });

  const handleAutocompleteSelect = useCallback(
    (type: "item" | "kitchen", id: string, slug?: string, kitchenName?: string, itemName?: string) => {
      setShowAutocomplete(false)
      if (type === "item") {
        router.push(`/search?q=${encodeURIComponent(itemName ?? localQuery)}`)
      } else {
        if (kitchenName) {
          addRecentKitchen({ id, slug: slug ?? id, name: kitchenName })
        }
        router.push(`/kitchens/${slug ?? id}`)
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
              className="px-4 text-muted-foreground hover:text-gray-700 flex items-center justify-center h-full"
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
              className="flex-1 h-full bg-transparent text-[15px] font-medium outline-none placeholder:text-muted-foreground placeholder:font-medium text-foreground"
            />
            {localQuery ? (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("")
                  inputRef.current?.focus()
                }}
                className="px-4 text-muted-foreground hover:text-muted-foreground flex items-center justify-center h-full"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <div className="px-4 text-muted-foreground flex items-center justify-center h-full">
                 <Search className="h-5 w-5" />
              </div>
            )}
          </form>
          {showAutocomplete && localQuery.length >= 1 && (
            <div className="absolute left-0 right-0 z-50 mt-1 mx-4 sm:mx-0 rounded-xl border border-border bg-white shadow-lg max-h-80 overflow-y-auto">
              {isAutocompleteFetching ? (
                <div className="px-4 py-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-lg bg-muted" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-3/4 rounded bg-muted" />
                        <div className="h-2.5 w-1/3 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : flatAutocompleteItems.length === 0 ? (
                <div className="px-4 py-8 text-sm text-muted-foreground text-center">
                  No results found for &ldquo;{autocompleteQuery}&rdquo;
                </div>
              ) : (
                <>
                  {autocompleteDishes.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dishes</p>
                      {autocompleteDishes.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => handleAutocompleteSelect("item", item.id, item.slug, undefined, item.name)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                            selectedIndex === i && "bg-gray-50"
                          )}
                        >
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="32px" />
                            ) : (
                              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.kitchenName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {autocompleteKitchens.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kitchens</p>
                      {autocompleteKitchens.map((kitchen, i) => {
                        const idx = autocompleteDishes.length + i
                        return (
                          <button
                            key={kitchen.id}
                            onClick={() => handleAutocompleteSelect("kitchen", kitchen.id, kitchen.slug, kitchen.displayName)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                              selectedIndex === idx && "bg-gray-50"
                            )}
                          >
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                              {kitchen.imageUrl ? (
                                <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className="object-cover" sizes="32px" />
                              ) : (
                                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
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
                        href={`/kitchens/${k.slug}`}
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
                  {(categoriesData ?? []).slice(0, 15).map((cuisine) => (
                    <Link
                      key={cuisine.id}
                      href={`/search?q=${cuisine.name}`}
                      className="flex flex-col items-center gap-2.5 shrink-0 group"
                    >
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border border-border bg-white shadow-xs group-hover:shadow-sm transition-all">
                        {cuisine.imageUrl ? (
                          <Image 
                            src={cuisine.imageUrl} 
                            alt={cuisine.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform" 
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <UtensilsCrossed className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
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
            <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
              {/* Header Banner */}
              <div className="bg-[#FFF4EB] relative overflow-hidden">
                 {pageContent?.bannerImageUrl ? (
                   <div className="absolute top-0 right-0 h-full w-1/3 opacity-30 pointer-events-none">
                      <Image src={pageContent.bannerImageUrl} alt="" fill className="object-cover" unoptimized={pageContent.bannerImageUrl.startsWith("http")} />
                      <div className="absolute inset-0 bg-linear-to-r from-[#FFF4EB] via-[#FFF4EB]/80 to-transparent"></div>
                   </div>
                 ) : null}
                 <div className="relative max-w-350 mx-auto px-4 sm:px-6 py-12 lg:py-16">
                   <p className="text-[15px] font-bold text-gray-700 mb-1">Search Results for</p>
                   <h1 className="text-4xl lg:text-5xl font-extrabold text-[#00A300] mb-3">&ldquo;{debouncedQuery}&rdquo;</h1>
                   <p className="text-[15px] font-medium text-muted-foreground">
                     {pageContent?.subHeading || `We found ${sortedKitchens.length} kitchens serving delicious ${debouncedQuery} near you.`}
                   </p>
                 </div>
              </div>

              {/* Main Content */}
              <div className="max-w-350 mx-auto w-full px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
                 {/* Sidebar */}
                 <div className="hidden lg:block w-64 shrink-0 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                       <h2 className="text-[17px] font-bold text-foreground">Filters</h2>
                       <button className="text-[13px] font-bold text-primary hover:underline">Clear All</button>
                    </div>

                    <div className="space-y-5">
                       {enabledFilters.length > 0 ? (
                         enabledFilters.map((filter, fi) => (
                           <div key={filter.id} className={fi === 0 ? "" : "pt-5 border-t border-border"}>
                              <div className="flex items-center justify-between mb-3 cursor-pointer">
                                 <h3 className="text-[14px] font-bold text-foreground">{filter.name}</h3>
                                 <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                              <div className="space-y-3">
                                 {filter.options.map((item, i) => (
                                   <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                      <input type="checkbox" defaultChecked={i < 1} className="w-4.5 h-4.5 rounded-sm border-gray-300 text-primary focus:ring-primary bg-white" />
                                      <span className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground">{item}</span>
                                   </label>
                                 ))}
                              </div>
                           </div>
                         ))
                       ) : (
                         (categoriesData ?? []).length > 0 && (
                           <div>
                              <h3 className="text-[14px] font-bold text-foreground mb-3">Cuisine</h3>
                              <div className="space-y-3">
                                 {(categoriesData ?? []).map((cat) => (
                                   <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                      <input type="checkbox" className="w-4.5 h-4.5 rounded-sm border-gray-300 text-primary focus:ring-primary bg-white" />
                                      <span className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground">{cat.name}</span>
                                   </label>
                                 ))}
                              </div>
                           </div>
                         )
)}

                        <button className="w-full bg-primary text-white py-3.5 rounded-lg font-extrabold text-[15px] hover:bg-primary/90 transition-colors mt-4 shadow-sm">
                           APPLY FILTERS
                        </button>
                    </div>
                 </div>

                 {/* Grid Results */}
                 <div className="flex-1 min-w-0">
                    {/* Mobile Filters and Sort */}
                    <div className="flex lg:hidden items-center gap-4 mb-6">
                       <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-white text-[14px] font-bold text-gray-800 shadow-sm">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                          Filters <span className="bg-primary text-white text-[11px] px-1.5 py-0.5 rounded-full leading-none">{enabledFilters.length}</span>
                       </button>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <button className="flex-1 flex items-center justify-between px-4 py-2.5 border border-border rounded-lg text-[14px] font-bold text-gray-800 bg-white shadow-sm">
                             <div className="flex items-center gap-1.5">
                               <span className="font-normal text-muted-foreground">Sort by:</span> {kitchenSort === "relevance" ? "Relevance" : kitchenSort === "rating" ? "Rating" : "Name"}
                             </div>
                             <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                           </button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 rounded-xl">
                           <DropdownMenuRadioGroup value={kitchenSort} onValueChange={(v) => setKitchenSort(v as KitchenSort)}>
                             <DropdownMenuRadioItem value="relevance" className="text-[14px] font-bold py-2">Relevance</DropdownMenuRadioItem>
                             <DropdownMenuRadioItem value="rating" className="text-[14px] font-bold py-2">Rating</DropdownMenuRadioItem>
                             <DropdownMenuRadioItem value="name" className="text-[14px] font-bold py-2">Name</DropdownMenuRadioItem>
                           </DropdownMenuRadioGroup>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4 border-b border-border pb-4">
                       <span className="text-[15px] font-bold text-gray-800">
                         Showing 1 - {sortedKitchens.length} of {sortedKitchens.length} Kitchens
                       </span>
                       <div className="hidden lg:flex items-center gap-3">
                         <span className="text-[14px] font-bold text-gray-700">Sort by:</span>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <button className="flex items-center justify-between w-40 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-bold text-gray-800 hover:bg-muted/50 bg-white shadow-sm">
                               {kitchenSort === "relevance" ? "Relevance" : kitchenSort === "rating" ? "Rating" : "Name"}
                               <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                             </button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-40 rounded-xl">
                             <DropdownMenuRadioGroup value={kitchenSort} onValueChange={(v) => setKitchenSort(v as KitchenSort)}>
                               <DropdownMenuRadioItem value="relevance" className="text-[14px] font-bold py-2 cursor-pointer">Relevance</DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="rating" className="text-[14px] font-bold py-2 cursor-pointer">Rating</DropdownMenuRadioItem>
                               <DropdownMenuRadioItem value="name" className="text-[14px] font-bold py-2 cursor-pointer">Name</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                    </div>
                    
                    {sortedKitchens.length > 0 && (
                      <>
                       <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                         {virtualizer.getVirtualItems().map((virtualRow) => {
                           const startIndex = virtualRow.index * colCount;
                           const rowItems = sortedKitchens.slice(startIndex, startIndex + colCount);
                           
                           return (
                             <div
                               key={virtualRow.key}
                               data-index={virtualRow.index}
                               ref={virtualizer.measureElement}
                               style={{
                                 position: 'absolute',
                                 top: 0,
                                 left: 0,
                                 width: '100%',
                                 transform: `translateY(${virtualRow.start}px)`,
                               }}
                               className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 pb-6 lg:pb-10"
                             >
{rowItems.map((kitchen) => (
                                  <KitchenSearchCard
                                    key={kitchen.id}
                                    kitchen={kitchen}
                                    query={localQuery}
                                    badges={enabledBadges.map((b) => b.name)}
                                    showRatings={pageContent?.showRatings ?? true}
                                  />
                                ))}
                             </div>
                           );
                         })}
                       </div>
                       {(hasNextPage || isFetchingNextPage) && (
                         <div ref={sentinelRef} className="mt-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 pb-6 lg:pb-10 animate-pulse">
                             {Array.from({ length: 6 }).map((_, i) => (
                               <div key={i} className="flex flex-col bg-white border border-border rounded-xl overflow-hidden">
                                 <div className="relative w-full h-45 bg-muted">
                                   <Skeleton className="h-full w-full rounded-none" />
                                   <div className="absolute -bottom-5 left-4 h-11 w-11 rounded-full border-2 border-white overflow-hidden">
                                     <Skeleton className="h-full w-full rounded-full" />
                                   </div>
                                 </div>
                                 <div className="p-4 pt-7 flex flex-col gap-2.5 relative">
                                   <Skeleton className="h-4 w-3/4 rounded-lg" />
                                   <Skeleton className="h-3 w-1/3 rounded-lg" />
                                   <Skeleton className="h-3 w-2/3 rounded-lg" />
                                   <Skeleton className="h-3 w-1/4 rounded-lg" />
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                      </>
                    )}
                 </div>
              </div>

              {/* Bottom Feature Banner */}
              {enabledInfoItems.length > 0 && (
                <div className="bg-[#FAF8F5] border-t border-border mt-16">
                   <div className="max-w-350 mx-auto px-4 py-8 lg:py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {enabledInfoItems.map((item, i) => {
                        const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                        const colorClass = item.color && /^text-(primary|\[\#|emerald|orange|blue|green|red|purple)/.test(item.color) ? item.color : "text-primary";
                        return (
                          <div key={item.id ?? i} className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                               <IconComp className={`w-6 h-6 ${colorClass}`} />
                             </div>
                             <div>
                                <p className="text-[14px] font-extrabold text-foreground">{item.title}</p>
                                <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{item.subtitle}</p>
                             </div>
                          </div>
                        )
                      })}
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

function KitchenSearchCard({ kitchen, query, badges = [], showRatings = true }: { kitchen: SearchKitchen; query: string; badges?: string[]; showRatings?: boolean }) {
  const status = useMemo(() => getKitchenStatus(kitchen.operatingHours ?? null), [kitchen.operatingHours]);
  const isClosed = !status.isOpen;
  const deliveryLat = useMenuDeliveryLat();
  const deliveryLng = useMenuDeliveryLng();

  const distanceKm = useMemo(() => {
    if (deliveryLat == null || deliveryLng == null || kitchen.lat == null || kitchen.lng == null) return null
    return haversineDistance(deliveryLat, deliveryLng, kitchen.lat, kitchen.lng)
  }, [deliveryLat, deliveryLng, kitchen.lat, kitchen.lng])

  let badge = null;
  let badgeColor = "";
  if (badges.length > 0) {
    if (kitchen.avgRating >= 4.7) {
      badge = badges[0];
      badgeColor = "bg-primary";
    } else if (kitchen.avgRating >= 4.3) {
      badge = badges[1] ?? badges[0];
      badgeColor = "bg-[#008A00]";
    } else if (kitchen.avgRating === 0) {
      badge = badges[2] ?? badges[0];
      badgeColor = "bg-[#8A2BE2]";
    } else {
      badge = badges[3] ?? badges[badges.length - 1];
      badgeColor = "bg-[#37474F]";
    }
  }

  return (
    <Link
      href={`/kitchens/${kitchen.slug}${query ? `?q=${encodeURIComponent(query)}` : ""}`}
      className="flex flex-col bg-white border border-border rounded-xl hover:shadow-md transition-all group overflow-hidden"
    >
      <div className="relative w-full h-45 bg-muted">
        {kitchen.imageUrl ? (
          <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className={cn("object-cover group-hover:scale-105 transition-transform duration-500", isClosed && "grayscale opacity-80")} sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/10 to-muted">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        
        {badge && (
          <div className={cn("absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm", badgeColor)}>
            {badge}
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-3 z-10">
          {query && (
            <div className="bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-sm shadow-sm capitalize">
              {query}
            </div>
          )}
          <button className="text-white hover:text-primary transition-colors drop-shadow-md" onClick={(e) => { e.preventDefault(); }}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>
        </div>

        {kitchen.isAd && !badge && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm uppercase tracking-wide">Ad</div>
        )}

        <div className="absolute -bottom-5 left-4 h-11 w-11 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm z-10">
           {kitchen.profileImage ? (
             <Image src={kitchen.profileImage} alt={kitchen.displayName} fill className="object-cover" />
           ) : (
             <div className="flex items-center justify-center h-full bg-gray-200 text-muted-foreground text-xs font-bold uppercase">
               {kitchen.displayName.charAt(0)}
             </div>
           )}
        </div>
      </div>

      <div className="p-4 pt-7 flex flex-col gap-2 relative">
        <div className="flex items-center justify-between gap-2">
           <h3 className="font-bold text-[16px] text-foreground truncate flex items-center gap-1.5">
             {kitchen.displayName}
             <svg className="w-4 h-4 text-[#00A300] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
           </h3>
        </div>
        
        {showRatings && (
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-primary">{kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "NEW"}</span>
            <span className="text-muted-foreground font-normal">({kitchen.totalReviews})</span>
          </div>
        )}

        <div className="text-[13px] text-muted-foreground truncate">
          {kitchen.locality ? `${kitchen.locality} • ` : ""}{kitchen.cuisineTags.slice(0, 2).join(", ")}
        </div>

        <div className="flex items-center gap-4 text-[12px] text-muted-foreground font-medium mt-1">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {kitchen.estimatedPrepTime ?? 25} mins
          </div>
          {distanceKm != null && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {distanceKm.toFixed(1)} km
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border flex lg:hidden items-center justify-between">
          <div className="flex items-center gap-1.5 bg-[#F0FDF4] px-2 py-1 rounded-md text-[#16A34A] text-[11px] font-bold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            100% Hygienic
          </div>
          <div className="text-primary border border-primary px-3 py-1 rounded-md text-[12px] font-bold hover:bg-primary hover:text-white transition-colors">
            View Menu
          </div>
        </div>
      </div>
    </Link>
  )
}


