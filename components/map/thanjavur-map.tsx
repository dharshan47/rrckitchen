"use client"

import { useEffect, useRef, useCallback, useId } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import { THANJAVUR_CENTER } from "@/lib/geo/thanjavur-bounds"
import {
  useThanjavurMapLoaded,
  useThanjavurMapActions,
  thanjavurMapStore,
} from "@/stores/thanjavurMapStore"
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from "leaflet"

interface ThanjavurMapProps {
  markerPosition?: [number, number]
  kitchenPosition?: [number, number]
  destinationPosition?: [number, number]
  routeCoords?: [number, number][]
  height?: string
  onLocationSelect?: (lat: number, lng: number) => void
  onPlaceResolved?: (place: { name: string; address: string; lat: number; lng: number }) => void
  interactive?: boolean
  isGoingToKitchen?: boolean
  markerIconType?: "delivery" | "kitchen" | "pin"
}

export function ThanjavurMap({
  markerPosition,
  kitchenPosition,
  destinationPosition,
  routeCoords,
  height = "200px",
  onLocationSelect,
  onPlaceResolved,
  interactive = true,
  isGoingToKitchen = false,
  markerIconType = "delivery",
}: ThanjavurMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const leafletRef = useRef<typeof import("leaflet") | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const kitchenMarkerRef = useRef<LeafletMarker | null>(null)
  const destMarkerRef = useRef<LeafletMarker | null>(null)
  const routeRef = useRef<LeafletPolyline | null>(null)
  const animFrameRef = useRef(0)
  const hasFittedRef = useRef(false)
  const onLocationSelectRef = useRef(onLocationSelect)
  const onPlaceResolvedRef = useRef(onPlaceResolved)
  const interactiveRef = useRef(interactive)
  const markerIconTypeRef = useRef(markerIconType)
  const instanceId = useId()
  const loaded = useThanjavurMapLoaded(instanceId)
  const mapActions = useThanjavurMapActions()

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect
    onPlaceResolvedRef.current = onPlaceResolved
    interactiveRef.current = interactive
    markerIconTypeRef.current = markerIconType
  }, [onLocationSelect, onPlaceResolved, interactive, markerIconType])

  const { data: leafletLib } = useQuery<typeof import("leaflet")>({
    queryKey: ["leaflet"],
    queryFn: async () => {
      if (typeof document !== "undefined" && !document.querySelector("link[href*='leaflet.css']")) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }
      const mod = await import("leaflet")
      return mod.default as typeof import("leaflet")
    },
    enabled: typeof window !== "undefined",
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const { mutate: reverseGeocode } = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`)
      if (!res.ok) throw new Error("Reverse geocode failed")
      const data = await res.json()
      return data?.display_name ? String(data.display_name) : null
    },
    onSuccess: (displayName, { lat, lng }) => {
      const name = displayName ?? `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      onPlaceResolvedRef.current?.({ name, address: name, lat, lng })
    },
  })

  function createIcon(L: typeof import("leaflet"), type: "delivery" | "kitchen" | "pin") {
    if (type === "kitchen") {
      return L.divIcon({
        html: '<div style="background:#ff5722;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,87,34,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg></div>',
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
    }
    if (type === "pin") {
      return L.divIcon({
        html: '<div style="background:#087A3E;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(8,122,62,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })
    }
    return L.divIcon({
      html: '<div style="background:#F97316;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(249,115,22,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
  }

  function fitToContent() {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return
    if (markerRef.current && kitchenMarkerRef.current) {
      map.fitBounds(
        L.latLngBounds([markerRef.current.getLatLng(), kitchenMarkerRef.current.getLatLng()]).pad(0.2)
      )
    } else if (markerRef.current) {
      map.panTo(markerRef.current.getLatLng())
    }
    hasFittedRef.current = true
  }

  const reportPlace = useCallback((lat: number, lng: number) => {
    onLocationSelectRef.current?.(lat, lng)
    if (onPlaceResolvedRef.current) reverseGeocode({ lat, lng })
  }, [reverseGeocode])

  // Initialize the map once the Leaflet lib is loaded — never re-create it when positions change
  useEffect(() => {
    if (!leafletLib || !mapContainerRef.current) return
    const container = mapContainerRef.current
    const L = leafletLib
    leafletRef.current = L

    const map = L.map(container, {
      center: THANJAVUR_CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 100)

    if (interactiveRef.current) {
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true, icon: createIcon(L, markerIconTypeRef.current) }).addTo(map)
            .bindPopup("Your Location")
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current?.getLatLng()
            if (pos) reportPlace(pos.lat, pos.lng)
          })
        }
        reportPlace(lat, lng)
      })
    }

    L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      {
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(map)

    map.setMaxBounds(L.latLngBounds([10.45, 78.85], [11.05, 79.45]))

    mapActions.setMapLoaded(instanceId, true)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      leafletRef.current = null
      markerRef.current = null
      kitchenMarkerRef.current = null
      destMarkerRef.current = null
      routeRef.current = null
      hasFittedRef.current = false
      thanjavurMapStore.getState().clearMap(instanceId)
    }
  }, [leafletLib, reverseGeocode, reportPlace, instanceId, mapActions])

  // Kitchen marker — create once, update in place
  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L || !kitchenPosition) return

    if (kitchenMarkerRef.current) {
      kitchenMarkerRef.current.setLatLng(kitchenPosition)
    } else {
      const kitchenIcon = L.divIcon({
        html: '<div style="background:#ff5722;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>',
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      kitchenMarkerRef.current = L.marker(kitchenPosition, { icon: kitchenIcon }).addTo(map)
        .bindPopup("Kitchen")
      if (markerRef.current && !hasFittedRef.current) fitToContent()
    }
  }, [kitchenPosition, loaded])

  // Destination marker
  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L || !destinationPosition) return

    if (destMarkerRef.current) {
      destMarkerRef.current.setLatLng(destinationPosition)
      
      // Update icon if the type of destination changed (going to kitchen vs going to customer)
      const currentIconStr = (destMarkerRef.current.options.icon as { options?: { html?: string } })?.options?.html || "";
      const expectedBg = isGoingToKitchen ? "#ff5722" : "#15803D";
      if (!currentIconStr.includes(expectedBg)) {
        const destIcon = L.divIcon({
          html: isGoingToKitchen
            ? '<div style="background:#ff5722;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,87,34,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>'
            : '<div style="background:#15803D;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(21,128,61,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>',
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        destMarkerRef.current.setIcon(destIcon);
        destMarkerRef.current.setPopupContent(isGoingToKitchen ? "Kitchen Location" : "Customer Location");
      }
    } else {
      const destIcon = L.divIcon({
        html: isGoingToKitchen
          ? '<div style="background:#ff5722;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,87,34,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>'
          : '<div style="background:#15803D;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(21,128,61,0.3);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>',
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
      destMarkerRef.current = L.marker(destinationPosition, { icon: destIcon }).addTo(map)
        .bindPopup(isGoingToKitchen ? "Kitchen Location" : "Customer Location")
    }
  }, [destinationPosition, loaded, isGoingToKitchen])

  // Rider marker — animate smoothly to new positions without touching the map instance
  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return

    if (!markerPosition) {
      hasFittedRef.current = false
      return
    }

    if (!markerRef.current) {
      const hasReporting = Boolean(onLocationSelectRef.current || onPlaceResolvedRef.current)
      markerRef.current = L.marker(markerPosition, {
        draggable: hasReporting,
        icon: createIcon(L, markerIconType),
      }).addTo(map)
      if (hasReporting) {
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current?.getLatLng()
          if (pos) reportPlace(pos.lat, pos.lng)
        })
      }
      if (!hasFittedRef.current) fitToContent()
      return
    }

    cancelAnimationFrame(animFrameRef.current)

    const from = markerRef.current.getLatLng()
    const target = { lat: markerPosition[0], lng: markerPosition[1] }
    const start = performance.now()
    const duration = 1200

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      markerRef.current?.setLatLng([
        from.lat + (target.lat - from.lat) * eased,
        from.lng + (target.lng - from.lng) * eased,
      ])
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = 0
        const current = markerRef.current?.getLatLng()
        if (current && !map.getBounds().pad(0.35).contains(current)) {
          map.panTo([target.lat, target.lng], { animate: true, duration: 1 })
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(step)
  }, [markerPosition, loaded, reportPlace, markerIconType])

  // Route polyline — update in place when the route changes
  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return
    if (routeCoords && routeCoords.length > 1) {
      const expectedColor = isGoingToKitchen ? "#ff5722" : "#15803D"
      if (routeRef.current) {
        routeRef.current.setLatLngs(routeCoords)
        routeRef.current.setStyle({ color: expectedColor })
      } else {
        routeRef.current = L.polyline(routeCoords, {
          color: expectedColor,
          weight: 3,
          opacity: 1,
        }).addTo(map)
      }
    }
  }, [routeCoords, loaded, isGoingToKitchen])

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
      className="relative"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-xl">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-6 w-6" />
            <span className="text-sm font-medium">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  )
}
