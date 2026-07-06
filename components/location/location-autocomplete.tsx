"use client"

import { useRef, useEffect, useState } from "react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const SERVICE_BOUNDS = {
  north: 10.86,
  south: 10.68,
  east: 79.22,
  west: 79.04,
}

const DEFAULT_CENTER_LAT = 10.7867
const DEFAULT_CENTER_LNG = 79.1378

interface LocationAutocompleteProps {
  placeholder?: string
  onPlaceSelect: (place: { name: string; address: string; lat: number; lng: number }) => void
  className?: string
  defaultValue?: string
}

export function LocationAutocomplete({
  placeholder = "Search a location",
  onPlaceSelect,
  className,
  defaultValue,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue ?? "")
  const places = useMapsLibrary("places")

  useEffect(() => {
    if (!places || !inputRef.current) return

    const autocomplete = new places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "in" },
      bounds: SERVICE_BOUNDS,
      strictBounds: true,
    })

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setValue(place.name ?? place.formatted_address ?? "")
        onPlaceSelect({
          name: place.name ?? "Selected Location",
          address: place.formatted_address ?? "",
          lat,
          lng,
        })
      }
    })

    return () => {
      listener.remove()
    }
  }, [places, onPlaceSelect])

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 pl-11 pr-4 bg-search-bar border-none rounded-xl text-sm ${className ?? ""}`}
      />
    </div>
  )
}

export { DEFAULT_CENTER_LAT as SERVICE_CENTER_LAT, DEFAULT_CENTER_LNG as SERVICE_CENTER_LNG, SERVICE_BOUNDS }
