"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search, MapPin, UtensilsCrossed } from "lucide-react"
import Image from "next/image"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"

interface SearchItem {
  id: string
  name: string
  price: number
  foodType: string
  kitchenName: string
  kitchenId: string | null
  imageUrl: string | null
}

interface SearchKitchen {
  id: string
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
}

export function SearchAutocomplete({
  placeholder = "Search for meals..",
  inputClassName,
  onNavigate,
  onSearch,
  navigateOnFocus,
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dismissCount, setDismissCount] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebouncedValue(query, 150)

  const { data: results } = useQuery<SearchResult>({
    queryKey: ["menu-search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/menu/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  })

  const handleFocus = useCallback(() => {
    if (navigateOnFocus) {
      router.push("/search")
    } else if (results && (results.dishes.length > 0 || results.kitchens.length > 0)) {
      setDismissCount(0)
    }
  }, [navigateOnFocus, results, router])

  const hasResults = results && (results.dishes.length > 0 || results.kitchens.length > 0)
  const isOpen = dismissCount === 0 && debouncedQuery.length >= 1

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDismissCount(c => c + 1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const flatResults = useCallback(() => {
    if (!results) return [] as ({ type: "item" } & SearchItem)[]
    const items: ({ type: "item" } & SearchItem)[] = results.dishes.map((i) => ({ ...i, type: "item" as const }))
    const kitchens: ({ type: "kitchen"; id: string; name: string })[] = results.kitchens.map((k) => ({
      type: "kitchen" as const,
      id: k.id,
      name: k.displayName,
    }))
    return [...items, ...kitchens]
  }, [results])

  const handleSelect = useCallback(
    (type: "item" | "kitchen", id: string) => {
      setDismissCount(c => c + 1)
      setQuery("")
      onNavigate?.()
      if (type === "item") {
        router.push(`/menu/${id}`)
      } else {
        router.push(`/menu?kitchen=${id}`)
      }
    },
    [router, onNavigate]
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
            handleSelect("item", selected.id)
          } else if (selected.type === "kitchen") {
            handleSelect("kitchen", selected.id)
          }
        } else {
          if (query.trim()) {
            setDismissCount(c => c + 1)
            onNavigate?.()
            if (onSearch) {
              onSearch(query.trim())
            } else {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`)
            }
          }
        }
      } else if (e.key === "Escape") {
        setDismissCount(c => c + 1)
        inputRef.current?.blur()
      }
    },
    [flatResults, selectedIndex, query, handleSelect, router, onNavigate, onSearch]
  )

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
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

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover shadow-lg max-h-80 overflow-y-auto">
          {!hasResults ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <>
              {results!.dishes.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Dishes
                  </p>
                  {results!.dishes.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect("item", item.id)}
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
                          {item.kitchenName}
                          <span className="mx-1">·</span>
                          ₹{item.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.kitchens.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Kitchens
                  </p>
                  {results!.kitchens.map((kitchen, i) => {
                    const idx = (results!.dishes.length ?? 0) + i
                    return (
                      <button
                        key={kitchen.id}
                        onClick={() => handleSelect("kitchen", kitchen.id)}
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
      )}
    </div>
  )
}
