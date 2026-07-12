"use client"

import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ThanjavurMap = dynamic(
  () => import("@/components/map/thanjavur-map").then((m) => m.ThanjavurMap),
  { ssr: false }
)

interface LiveOrderTrackingMapProps {
  orderId: string
  kitchenLat: number
  kitchenLng: number
  customerLat?: number
  customerLng?: number
  deliveryPersonLat?: number
  deliveryPersonLng?: number
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function LiveOrderTrackingMap({
  orderId,
  kitchenLat,
  kitchenLng,
  customerLat,
  customerLng,
  deliveryPersonLat,
  deliveryPersonLng,
}: LiveOrderTrackingMapProps) {
  const [deliveryPos, setDeliveryPos] = useState<{ lat: number; lng: number } | null>(
    deliveryPersonLat && deliveryPersonLng ? { lat: deliveryPersonLat, lng: deliveryPersonLng } : null
  )
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])

  const destLat = customerLat ?? kitchenLat
  const destLng = customerLng ?? kitchenLng

  const { data: eta, isFetching: etaLoading } = useQuery({
    queryKey: ["route-eta", deliveryPos?.lat, deliveryPos?.lng, destLat, destLng],
    queryFn: async () => {
      if (!deliveryPos) return null
      const res = await fetch("/api/route/road-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenPos: [deliveryPos.lat, deliveryPos.lng],
          customerPos: [destLat, destLng],
        }),
      })
      const data = await res.json()
      if (data.route) {
        setRouteCoords(data.route as [number, number][])
      }
      return data.etaMinutes ?? null
    },
    enabled: !!deliveryPos,
    refetchInterval: 30_000,
  })

  useAblyOrderChannel(
    orderId,
    useCallback((msg: { name: string; data: unknown }) => {
      if (msg.name === "rider:location") {
        const { lat, lng } = msg.data as { lat: number; lng: number }
        setDeliveryPos({ lat, lng })
      }
    }, []),
    true
  )

  const distance = deliveryPos
    ? haversineKm(deliveryPos.lat, deliveryPos.lng, destLat, destLng)
    : null

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden border border-border">
        <ThanjavurMap
          markerPosition={deliveryPos ? [deliveryPos.lat, deliveryPos.lng] : undefined}
          kitchenPosition={[kitchenLat, kitchenLng]}
          routeCoords={routeCoords.length > 0 ? routeCoords : undefined}
          height="250px"
        />
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff5722]" />
          <span className="text-muted-foreground">Kitchen</span>
          <span className="mx-1.5 text-muted-foreground/40">|</span>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a6a32]" />
          <span className="text-muted-foreground">Delivery</span>
        </div>
        {etaLoading && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Calculating ETA...
          </span>
        )}
        {eta != null && (
          <span className="text-sm font-semibold text-foreground">
            ETA: ~{Math.round(eta)} min
          </span>
        )}
        {distance != null && (
          <span className="text-xs text-muted-foreground">
            {distance < 1
              ? `${Math.round(distance * 1000)} m`
              : `${distance.toFixed(1)} km`}
          </span>
        )}
      </div>
    </div>
  )
}
