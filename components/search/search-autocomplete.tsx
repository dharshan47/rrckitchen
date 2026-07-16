"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Search, MapPin, UtensilsCrossed, ArrowLeft, Clock, X } from "lucide-react"
import Image from "next/image"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"

interface SearchItem {
  id: string
  slug?: string
  name: string
  price: number
  foodType: string
  kitchenName: string
  kitchenId: string | null
  imageUrl: string | null
}

interface SearchKitchen {
  id: string
  slug: string
  displayName: string
  items: { id: string; name: string; price: number; imageUrl: string | null }[]
}

interface SearchResult {
  dishes: SearchItem[]
  kitchens: SearchKitchen[]
}

interface SearchAutocompleteProps {
  placeholder?: string
  inputClassName?: string
  onNavigate?: () => void
  onSearch?: (query: string) => void
  navigateOnFocus?: boolean
  mobileModal?: boolean
}

const RECENT_KEY = "recentlySearchedKitchens"
const MAX_RECENT = 5

function getRecentKitchens(): { id: string; slug: string; name: string }[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch {
    return []
  }
}

function addRecentKitchen(kitchen: { id: string; slug: string; name: string }) {
  const list = getRecentKitchens().filter((k) => k.id !== kitchen.id)
  list.unshift(kitchen)
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
}

function removeRecentKitchen(id: string) {
  const list = getRecentKitchens().filter((k) => k.id !== id)
  localStorage.setItem(RECENT_KEY, JSON.stringify(list))
}

export function SearchAutocomplete({
  placeholder = "Search for meals..",
  inputClassName,
  onNavigate,
  onSearch,
  navigateOnFocus,
  mobileModal,
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dismissCount, setDismissCount] = useState(0)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [recentKitchens, setRecentKitchens] = useState<{ id: string; slug: string; name: string }[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebouncedValue(query, 150)

  const { data: results, isFetching } = useQuery<SearchResult>({
    queryKey: ["menu-search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/menu/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: debouncedQuery.length >= 1,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (showMobileModal) {
      setRecentKitchens(getRecentKitchens())
      setTimeout(() => mobileInputRef.current?.focus(), 100)
    }
  }, [showMobileModal])

  const handleFocus = useCallback(() => {
    if (mobileModal) {
      if (window.innerWidth >= 768) {
        router.push("/search")
        return
      }
      setShowMobileModal(true)
      setRecentKitchens(getRecentKitchens())
      return
    }
    if (navigateOnFocus) {
      router.push("/search")
    } else if (results && (results.dishes.length > 0 || results.kitchens.length > 0)) {
      setDismissCount(0)
    }
  }, [navigateOnFocus, results, router, mobileModal])

  const closeMobileModal = useCallback(() => {
    setShowMobileModal(false)
    setQuery("")
    setDismissCount(c => c + 1)
  }, [])

  const hasResults = results && (results.dishes.length > 0 || results.kitchens.length > 0)
  const isLoading = isFetching && !results
  const isOpen = dismissCount === 0 && debouncedQuery.length >= 1

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!mobileModal && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDismissCount(c => c + 1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileModal])

  const flatResults = useCallback(() => {
    if (!results) return [] as ({ type: "item" } & SearchItem)[]
    const items: ({ type: "item" } & SearchItem)[] = results.dishes.map((i) => ({ ...i, type: "item" as const }))
    const kitchens: ({ type: "kitchen"; id: string; slug: string; name: string })[] = results.kitchens.map((k) => ({
      type: "kitchen" as const,
      id: k.id,
      slug: k.slug,
      name: k.displayName,
    }))
    return [...items, ...kitchens]
  }, [results])

  const handleSelect = useCallback(
    (type: "item" | "kitchen", id: string, slug?: string, kitchenName?: string) => {
      if (type === "kitchen" && kitchenName) {
        addRecentKitchen({ id, slug: slug ?? id, name: kitchenName })
      }
      setDismissCount(c => c + 1)
      setQuery("")
      onNavigate?.()
      if (mobileModal) setShowMobileModal(false)
      if (type === "item") {
        router.push(`/menu/${slug ?? id}`)
      } else {
        router.push(`/kitchen/${slug ?? id}`)
      }
    },
    [router, onNavigate, mobileModal]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = flatResults()
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          const selected = items[selectedIndex]
          if (selected.type === "item") {
            handleSelect("item", selected.id, (selected as { slug?: string }).slug)
          } else if (selected.type === "kitchen") {
            handleSelect("kitchen", selected.id, (selected as { slug?: string }).slug)
          }
        } else {
          if (query.trim()) {
            setDismissCount(c => c + 1)
            onNavigate?.()
            if (mobileModal) setShowMobileModal(false)
            if (onSearch) {
              onSearch(query.trim())
            } else {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`)
            }
          }
        }
      } else if (e.key === "Escape") {
        if (mobileModal) {
          closeMobileModal()
        } else {
          setDismissCount(c => c + 1)
          inputRef.current?.blur()
        }
      }
    },
    [flatResults, selectedIndex, query, handleSelect, router, onNavigate, onSearch, mobileModal, closeMobileModal]
  )

  const input = (ref: React.RefObject<HTMLInputElement | null>) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        ref={ref}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelectedIndex(-1)
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-12 pl-12 pr-4 bg-search-bar border-none rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground",
          inputClassName
        )}
      />
    </div>
  )

  const autocompleteDropdown = () => {
    if (!isOpen) return null
    return (
      <div className={cn("z-50 w-full rounded-xl border border-border bg-popover shadow-lg max-h-80 overflow-y-auto", mobileModal ? "" : "absolute mt-2")}>
        {isLoading ? (
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
        ) : !hasResults ? (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">
            No results found for &ldquo;{debouncedQuery}&rdquo;
          </div>
        ) : (
          <>
            {results!.dishes.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dishes</p>
                {results!.dishes.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect("item", item.id, item.slug)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                      selectedIndex === i && "bg-muted/50"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.kitchenName} · ₹{item.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {results!.kitchens.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kitchens</p>
                {results!.kitchens.map((kitchen, i) => {
                  const idx = (results!.dishes.length ?? 0) + i
                  return (
                    <button
                      key={kitchen.id}
                      onClick={() => handleSelect("kitchen", kitchen.id, kitchen.slug, kitchen.displayName)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                        selectedIndex === idx && "bg-muted/50"
                      )}
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{kitchen.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {kitchen.items.map((mi) => mi.name).join(", ")}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (mobileModal) {
    return (
      <>
        {input(inputRef)}
        {showMobileModal && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border">
              <button onClick={closeMobileModal} className="p-1 -ml-1">
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
              <p className="text-sm font-semibold text-foreground">Search for dishes and kitchens</p>
            </div>

            <div className="px-4 pt-3 pb-2">
              {input(mobileInputRef)}
            </div>

            {!query ? (
              <div className="flex-1 overflow-y-auto px-4 pt-4">
                {recentKitchens.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Recently Searched Kitchens
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentKitchens.map((k) => (
                        <div key={k.id} className="group relative">
                          <button
                            onClick={() => {
                              handleSelect("kitchen", k.id, k.slug, k.name)
                              closeMobileModal()
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors pr-7"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {k.name}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRecentKitchen(k.id)
                              setRecentKitchens(getRecentKitchens())
                            }}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40"
                          >
                            <X className="h-2.5 w-2.5 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                {autocompleteDropdown()}
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      {input(inputRef)}
      {autocompleteDropdown()}
    </div>
  )
}