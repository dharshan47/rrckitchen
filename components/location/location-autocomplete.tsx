"use client"

import { useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Loader2 } from "lucide-react"
import {
  useLocationSearchInput,
  useLocationSearchClosed,
  useLocationSearchResults,
  useLocationSearchFetching,
  useLocationSearchActions,
  useLocationSearchQuery,
  type GeoResult,
} from "@/stores/locationSearchStore"

interface LocationAutocompleteProps {
  placeholder?: string
  onPlaceSelect: (place: { name: string; address: string; lat: number; lng: number }) => void
  className?: string
  defaultValue?: string
}

export function LocationAutocomplete({
  placeholder = "Search a location in Thanjavur",
  onPlaceSelect,
  className,
  defaultValue,
}: LocationAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const query = useLocationSearchInput()
  const manuallyClosed = useLocationSearchClosed()
  const results = useLocationSearchResults()
  const isFetching = useLocationSearchFetching()
  const actions = useLocationSearchActions()

  useLocationSearchQuery(query)

  const defaultRef = useRef(defaultValue)
  useEffect(() => {
    if (defaultRef.current) {
      actions.setQuery(defaultRef.current)
    }
  }, [actions])

  useEffect(() => {
    return () => actions.resetSearch()
  }, [actions])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      actions.setQuery(e.target.value)
    },
    [actions]
  )

  const handleSelect = useCallback(
    (result: GeoResult) => {
      actions.setQuery(result.display_name)
      actions.setManuallyClosed(true)
      onPlaceSelect({
        name: result.display_name,
        address: result.display_name,
        lat: result.lat,
        lng: result.lon,
      })
    },
    [actions, onPlaceSelect]
  )

  const handleWrapperClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const isOpen = !manuallyClosed && query.length >= 1

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onClick={handleWrapperClick}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) actions.setManuallyClosed(false) }}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-sm ${className ?? ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg max-h-60 overflow-y-auto">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No locations found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.display_name}</p>
                  {r.city && (
                    <p className="text-xs text-muted-foreground">
                      {r.city}
                      {r.postcode ? ` - ${r.postcode}` : ""}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
