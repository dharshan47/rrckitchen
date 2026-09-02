"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query"
import { UtensilsCrossed, Search, X, ChevronLeft, Heart, ShieldCheck, Clock, Leaf, Users, ChevronUp } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useState, useMemo, useRef, useEffect, startTransition, useCallback } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecentKitchens, addRecentKitchen } from "@/lib/recent-searches"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KitchenCard } from "@/components/kitchen/kitchen-card"
import type { KitchenData } from "@/hooks/useExploreKitchens"
import type { LucideIcon } from "lucide-react"

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
  coverImageUrl: string | null
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
  items: { id: string; name: string; price: number; foodType: string; timeSlot: string; imageUrl: string | null }[]
  operatingHours?: Record<string, { open: string; close: string }> | null
  customOfferText?: string | null
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
  badges: { id: string; name: string; position: string }[]
  infoItems: { id: string; icon: string; title: string; subtitle: string; color: string }[]
}

const INFO_ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  ShieldCheck,
  Clock,
  Leaf,
  Users,
}

function toKitchenData(kitchen: SearchKitchen): KitchenData {
  return {
    id: kitchen.id,
    slug: kitchen.slug,
    displayName: kitchen.displayName,
    profileImage: kitchen.profileImage ?? null,
    avgRating: kitchen.avgRating,
    totalReviews: kitchen.totalReviews,
    imageUrl: kitchen.imageUrl,
    coverImageUrl: kitchen.coverImageUrl,
    customOfferText: kitchen.customOfferText ?? null,
    cuisineTags: kitchen.cuisineTags ?? [],
    locality: kitchen.locality ?? null,
    items: kitchen.items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      imageUrl: i.imageUrl,
      foodType: i.foodType ?? "",
      timeSlot: i.timeSlot ?? "",
    })),
    timeSlots: [],
    lat: kitchen.lat,
    lng: kitchen.lng,
    estimatedPrepTime: kitchen.estimatedPrepTime ?? null,
    operatingHours: kitchen.operatingHours ?? null,
  }
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
  const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>({})
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [collapsedFilters, setCollapsedFilters] = useState<Record<string, boolean>>({})
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
  const leftBadges = useMemo(
    () => enabledBadges.filter((b) => b.position !== "right").map((b) => b.name),
    [enabledBadges]
  )
  const rightBadges = useMemo(
    () => enabledBadges.filter((b) => b.position === "right").map((b) => b.name),
    [enabledBadges]
  )

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

  const toggleFilterOption = useCallback((filterId: string, option: string) => {
    setDraftFilters((prev) => {
      const current = prev[filterId] ?? []
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [filterId]: next }
    })
  }, [])

  const toggleFilterCollapse = useCallback((filterId: string) => {
    setCollapsedFilters((prev) => ({ ...prev, [filterId]: !prev[filterId] }))
  }, [])

  const applyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    setMobileFiltersOpen(false)
  }, [draftFilters])

  const clearFilters = useCallback(() => {
    setDraftFilters({})
    setAppliedFilters({})
  }, [])

  const isFilterSelected = useCallback(
    (filterId: string, option: string) => (draftFilters[filterId] ?? []).includes(option),
    [draftFilters]
  )

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).reduce((sum, opts) => sum + opts.length, 0),
    [appliedFilters]
  )

  const activeFilterOptions = useMemo(
    () => Object.values(appliedFilters).flat().map((o) => o.toLowerCase()),
    [appliedFilters]
  )

  const filteredKitchens = useMemo(() => {
    if (activeFilterOptions.length === 0) return sortedKitchens
    return sortedKitchens.filter((k) => {
      const tags = (k.cuisineTags ?? []).map((t) => t.toLowerCase())
      return activeFilterOptions.some((opt) => tags.some((t) => t.includes(opt) || opt.includes(t)))
    })
  }, [sortedKitchens, activeFilterOptions])

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

  const rowCount = Math.ceil(filteredKitchens.length / colCount);
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
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Sticky Search Header */}
        <div ref={wrapperRef} className="sticky top-0 z-30 bg-[#FCF8F5] pt-6 pb-2 px-4 sm:px-0 lg:hidden border-b border-[#EEE8E4]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center h-14 border border-[#ECE8E5] rounded-lg shadow-sm bg-white overflow-hidden transition-all focus-within:border-[#F44A01] focus-within:shadow-md">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-4 text-[#333333] hover:text-[#111111] flex items-center justify-center h-full"
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
              <div className="w-full bg-[#FCF8F5] border-b border-[#EEE8E4] overflow-hidden">
                <div className="max-w-[1440px] mx-auto relative flex flex-col lg:flex-row items-stretch lg:min-h-[220px]">
                  {/* Left Content (Text) */}
                  <div className="w-full lg:w-[50%] xl:w-[45%] px-4 sm:px-6 py-8 lg:py-12 flex flex-col justify-center z-20 relative bg-[#FCF8F5] lg:bg-transparent">
                    <p className="text-[13px] md:text-[14px] font-bold text-[#111111] mb-1.5 uppercase tracking-wide">
                      Search Results for
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#00512F] mb-3.5 tracking-tight">
                      “{debouncedQuery}”
                    </h1>
                    <p className="text-[14px] lg:text-[15px] font-medium text-[#333333] leading-relaxed max-w-xl">
                      We found <span className="text-[#F44A01] font-bold">{kitchens.length} kitchens</span> serving delicious <strong>{debouncedQuery}</strong> near you.
                    </p>
                  </div>
                  
                  {/* Right Content (Image) */}
                  <div className="w-full h-[180px] sm:h-[220px] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[40%] lg:h-auto z-10">
                    <div className="w-full h-full relative">
                      {/* Desktop Fades */}
                      <div className="hidden lg:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#FCF8F5] via-[#FCF8F5]/90 to-transparent z-10" />
                      {/* Mobile Top Fade */}
                      <div className="lg:hidden absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#FCF8F5] to-transparent z-10" />
                      
                      {pageContent?.bannerImageUrl && (
                        <Image
                          src={pageContent.bannerImageUrl}
                          alt={debouncedQuery}
                          fill
                          className="object-cover object-center lg:object-left"
                          priority
                          unoptimized={pageContent.bannerImageUrl.startsWith("http")}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
                 {/* Sidebar */}
                 <div className="hidden lg:block w-64 shrink-0 space-y-6">
                    <div className="bg-[#FFFFFF] border border-[#ECE8E5] rounded-[8px] p-5 shadow-[0_2px_8px_rgba(40,30,25,0.035)]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EEEAE7] mb-5">
                       <h2 className="text-[16px] font-bold text-[#111111]">Filters</h2>
                       <button
                         type="button"
                         onClick={clearFilters}
                         disabled={activeFilterCount === 0}
                         className="text-[13px] font-semibold text-[#F44A01] hover:underline disabled:text-[#9CA3AF] disabled:hover:no-underline disabled:cursor-not-allowed"
                       >
                         Clear All
                       </button>
                    </div>

                    <div className="space-y-5">
                       {enabledFilters.length > 0 ? (
                         enabledFilters.map((filter, fi) => (
                           <div key={filter.id} className={fi === 0 ? "" : "pt-5 border-t border-[#EEEAE7]"}>
                              <div 
                                className="flex items-center justify-between mb-3 cursor-pointer"
                                onClick={() => toggleFilterCollapse(filter.id)}
                              >
                                 <h3 className="text-[14px] font-bold text-[#222222]">{filter.name}</h3>
                                 <ChevronUp className={cn("w-4 h-4 text-[#222222] stroke-[1.8px] transition-transform", collapsedFilters[filter.id] && "rotate-180")} />
                              </div>
                              {!collapsedFilters[filter.id] && (
                                <div className="space-y-3">
                                   {filter.options.map((item) => (
                                     <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                        <Checkbox
                                          checked={isFilterSelected(filter.id, item)}
                                          onCheckedChange={() => toggleFilterOption(filter.id, item)}
                                          className="w-4.5 h-4.5 border-[#FF8A69] data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] text-white rounded-sm"
                                        />
                                        <span className="text-[12px] font-normal text-[#333333] group-hover:text-[#111111]">{item}</span>
                                     </label>
                                   ))}
                                </div>
                              )}
                           </div>
                         ))
                       ) : (
                         (categoriesData ?? []).length > 0 && (
                           <div>
                              <div 
                                className="flex items-center justify-between mb-3 cursor-pointer"
                                onClick={() => toggleFilterCollapse("cuisine")}
                              >
                                <h3 className="text-[14px] font-bold text-[#222222]">Cuisine</h3>
                                <ChevronUp className={cn("w-4 h-4 text-[#222222] stroke-[1.8px] transition-transform", collapsedFilters["cuisine"] && "rotate-180")} />
                              </div>
                              {!collapsedFilters["cuisine"] && (
                                <div className="space-y-3">
                                   {(categoriesData ?? []).map((cat) => (
                                     <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                        <Checkbox
                                          checked={isFilterSelected("cuisine", cat.name)}
                                          onCheckedChange={() => toggleFilterOption("cuisine", cat.name)}
                                          className="w-4.5 h-4.5 border-[#FF8A69] data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] text-white rounded-sm"
                                        />
                                        <span className="text-[12px] font-normal text-[#333333] group-hover:text-[#111111]">{cat.name}</span>
                                     </label>
                                   ))}
                                </div>
                              )}
                           </div>
                         )
                       )}

                        <Button
                          type="button"
                          onClick={applyFilters}
                          className="w-full bg-[#F44A01] hover:bg-[#E94300] text-white h-[44px] rounded-[5px] font-bold text-[14px] mt-6 shadow-[0_1px_3px_rgba(244,74,1,0.12)] border-none"
                        >
                           APPLY FILTERS
                        </Button>
                    </div>
                    </div>
                 </div>

                 {/* Grid Results */}
                 <div className="flex-1 min-w-0">
                    {/* Mobile Filters and Sort */}
                    <div className="flex lg:hidden items-center gap-4 mb-6">
                       <button
                         type="button"
                         onClick={() => setMobileFiltersOpen(true)}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-white text-[14px] font-bold text-gray-800 shadow-sm"
                       >
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                          Filters {activeFilterCount > 0 && <span className="bg-primary text-white text-[11px] px-1.5 py-0.5 rounded-full leading-none">{activeFilterCount}</span>}
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4 border-b border-[#EEEAE7] pb-4">
                       <span className="text-[15px] font-bold text-[#111111]">
                         Showing {filteredKitchens.length > 0 ? `1 - ${filteredKitchens.length}` : "0"} of {sortedKitchens.length} Kitchens
                         {activeFilterCount > 0 && <span className="ml-2 text-[13px] font-bold text-[#F44A01]">({activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} applied)</span>}
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
                    
                    {filteredKitchens.length > 0 ? (
                      <>
                       <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                         {virtualizer.getVirtualItems().map((virtualRow) => {
                           const startIndex = virtualRow.index * colCount;
                           const rowItems = filteredKitchens.slice(startIndex, startIndex + colCount);
                           
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
                               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 pb-6 lg:pb-10"
                             >
                                {rowItems.map((kitchen) => (
                                  <KitchenCard
                                    key={kitchen.id}
                                    kitchen={toKitchenData(kitchen)}
                                    variant="search"
                                    query={localQuery}
                                    badges={leftBadges}
                                    rightBadges={rightBadges}
                                  />
                                ))}
                             </div>
                           );
                         })}
                       </div>
                        
                       {(hasNextPage || isFetchingNextPage) && (
                         <div ref={sentinelRef} className="mt-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 pb-6 lg:pb-10 animate-pulse">
                             {Array.from({ length: 6 }).map((_, i) => (
                               <div key={i} className="flex flex-col bg-[#FFFFFF] border border-[#EAEAEA] rounded-[9px] shadow-[0_2px_8px_rgba(30,25,20,0.045)] overflow-hidden">
                                 <div className="relative w-full h-40 bg-muted">
                                   <Skeleton className="h-full w-full rounded-none" />
                                   <div className="absolute -bottom-5 left-4 h-11 w-11 rounded-full border-[2px] border-white overflow-hidden">
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
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white rounded-[8px] border border-[#ECE8E5]">
                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-[16px] font-bold text-[#111111]">No kitchens match your filters</p>
                        <p className="text-[13px] font-medium text-muted-foreground mt-1">Try clearing or changing the applied filters.</p>
                        <Button
                          type="button"
                          onClick={clearFilters}
                          className="mt-5 bg-[#F44A01] hover:bg-[#E94300] text-white h-[40px] rounded-[5px] font-bold text-[13px]"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                 </div>
               </div>

               {/* Mobile Filters Dialog */}
               <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                 <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto rounded-[16px] p-0" showCloseButton={false}>
                   <DialogHeader className="px-5 pt-5 pb-3 border-b border-[#EEEAE7]">
                     <div className="flex items-center justify-between">
                       <DialogTitle className="text-[16px] font-bold text-[#111111]">Filters</DialogTitle>
                       <div className="flex items-center gap-3">
                         <button
                           type="button"
                           onClick={clearFilters}
                           disabled={activeFilterCount === 0}
                           className="text-[13px] font-semibold text-[#F44A01] hover:underline disabled:text-[#9CA3AF] disabled:hover:no-underline disabled:cursor-not-allowed"
                         >
                           Clear All
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setMobileFiltersOpen(false)}
                           className="text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors"
                           aria-label="Close filters"
                         >
                           <X className="w-5 h-5" />
                         </button>
                       </div>
                     </div>
                   </DialogHeader>
                   <div className="px-5 py-4 space-y-5">
                     {enabledFilters.length > 0 ? (
                       enabledFilters.map((filter) => (
                         <div key={filter.id}>
                           <h3 className="text-[14px] font-bold text-[#222222] mb-3">{filter.name}</h3>
                           <div className="space-y-3">
                             {filter.options.map((item) => (
                               <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                 <Checkbox
                                   checked={isFilterSelected(filter.id, item)}
                                   onCheckedChange={() => toggleFilterOption(filter.id, item)}
                                   className="w-4.5 h-4.5 border-[#FF8A69] data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] text-white rounded-sm"
                                 />
                                 <span className="text-[13px] font-normal text-[#333333] group-hover:text-[#111111]">{item}</span>
                               </label>
                             ))}
                           </div>
                         </div>
                       ))
                     ) : (
                       (categoriesData ?? []).length > 0 && (
                         <div>
                           <h3 className="text-[14px] font-bold text-[#222222] mb-3">Cuisine</h3>
                           <div className="space-y-3">
                             {(categoriesData ?? []).map((cat) => (
                               <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                 <Checkbox
                                   checked={isFilterSelected("cuisine", cat.name)}
                                   onCheckedChange={() => toggleFilterOption("cuisine", cat.name)}
                                   className="w-4.5 h-4.5 border-[#FF8A69] data-[state=checked]:bg-[#F44A01] data-[state=checked]:border-[#F44A01] text-white rounded-sm"
                                 />
                                 <span className="text-[13px] font-normal text-[#333333] group-hover:text-[#111111]">{cat.name}</span>
                               </label>
                             ))}
                           </div>
                         </div>
                       )
                     )}
                   </div>
                   <div className="px-5 py-4 border-t border-[#EEEAE7] flex gap-3">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={clearFilters}
                       className="flex-1 h-[44px] rounded-[5px] border-[#E8E5E2] text-[#333333] font-bold text-[14px]"
                     >
                       Clear
                     </Button>
                     <Button
                       type="button"
                       onClick={applyFilters}
                       className="flex-1 bg-[#F44A01] hover:bg-[#E94300] text-white h-[44px] rounded-[5px] font-bold text-[14px] shadow-[0_1px_3px_rgba(244,74,1,0.12)] border-none"
                     >
                       Apply Filters
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>

               {/* Bottom Feature Banner */}
              {enabledInfoItems.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#EEE7E3] rounded-[10px] mx-4 sm:mx-6 lg:mx-auto max-w-[1400px] mb-12 shadow-[0_2px_8px_rgba(40,30,20,0.035)] mt-8">
                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 py-6 divide-y lg:divide-y-0 lg:divide-x divide-[#E9E5E2]">
                      {enabledInfoItems.map((item, i) => {
                        const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                        const iconColor = 
                          item.title.includes("Homemade") || item.title.includes("Pre-book") || item.title.includes("Women") 
                          ? "#F44A01" 
                          : "#00512F";
                        return (
                          <div key={item.id ?? i} className="flex items-center gap-4 py-4 lg:py-0 lg:px-6 first:pt-0 lg:first:pl-0 last:pb-0 lg:last:pr-0 flex-1">
                             <div className="flex items-center justify-center shrink-0">
                               <IconComp className="w-8 h-8" style={{ color: iconColor, strokeWidth: 1.8 }} />
                             </div>
                             <div>
                                <p className="text-[14px] font-bold text-[#171717]">{item.title}</p>
                                <p className="text-[12px] font-normal text-[#555555] mt-0.5">{item.subtitle}</p>
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


