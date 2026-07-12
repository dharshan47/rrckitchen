"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { THANJAVUR_CENTER } from "@/lib/geo/thanjavur-bounds"
import type { Map as LeafletMap } from "leaflet"

interface ThanjavurMapProps {
  markerPosition?: [number, number]
  kitchenPosition?: [number, number]
  routeCoords?: [number, number][]
  height?: string
  onLocationSelect?: (lat: number, lng: number) => void
  interactive?: boolean
}

export function ThanjavurMap({
  markerPosition,
  kitchenPosition,
  routeCoords,
  height = "200px",
  onLocationSelect,
  interactive = true,
}: ThanjavurMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<{ setLatLng: (pos: [number, number]) => void; getLatLng: () => { lat: number; lng: number } } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    let destroyed = false
    const container = mapContainerRef.current

    async function initMap() {
      try {
        if (!document.querySelector("link[href*='leaflet.css']")) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }
        const L = (await import("leaflet")).default
        if (destroyed || !container) return

        const deliveryIcon = L.divIcon({
          html: '<div style="background:#EE7005;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;font-size:16px;font-weight:bold;">📍</div>',
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        })

        const map = L.map(container, {
          center: THANJAVUR_CENTER,
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: true,
        })
        mapInstanceRef.current = map

        setTimeout(() => map.invalidateSize(), 100)

        if (onLocationSelect && interactive) {
          map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
            const { lat, lng } = e.latlng;
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              const newMarker = L.marker([lat, lng], { draggable: true, icon: deliveryIcon }).addTo(map)
                .bindPopup("Your Delivery Location");
              newMarker.on("dragend", () => {
                const pos = newMarker.getLatLng();
                onLocationSelect(pos.lat, pos.lng);
              });
              markerRef.current = newMarker;
            }
            onLocationSelect(lat, lng);
          });
        }

        L.tileLayer(
          `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
          {
            tileSize: 512,
            zoomOffset: -1,
          }
        ).addTo(map)

        const bounds = L.latLngBounds(
          [10.45, 78.85],
          [11.05, 79.45]
        )
        map.setMaxBounds(bounds)

        if (markerPosition) {
          const marker = L.marker(markerPosition, { draggable: Boolean(onLocationSelect && interactive), icon: deliveryIcon }).addTo(map)
            .bindPopup("Your Delivery Location")
          if (onLocationSelect && interactive) {
            marker.on("dragend", () => {
              const pos = marker.getLatLng();
              onLocationSelect(pos.lat, pos.lng);
            });
          }
          markerRef.current = marker;
        }

        if (kitchenPosition) {
          const kitchenIcon = L.divIcon({
            html: '<div style="background:#ff5722;color:white;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap">🏪 Kitchen</div>',
            className: "",
            iconSize: [80, 30],
            iconAnchor: [40, 15],
          })
          L.marker(kitchenPosition, { icon: kitchenIcon }).addTo(map)
            .bindPopup("Kitchen")
        }

        if (routeCoords && routeCoords.length > 1) {
          L.polyline(routeCoords, {
            color: "#ff5722",
            weight: 4,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(map)
        }

        if (markerPosition && kitchenPosition) {
          const group = L.featureGroup([
            L.marker(markerPosition),
            L.marker(kitchenPosition),
          ])
          map.fitBounds(group.getBounds().pad(0.2))
        }

        setLoaded(true)
      } catch (err) {
        console.error("[ThanjavurMap] Failed to load Leaflet", err)
      }
    }

    initMap()

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [markerPosition, kitchenPosition, routeCoords, onLocationSelect, interactive])

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