"use client"

import { useEffect, useCallback, useMemo, useRef } from "react"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"
import { DeliveryPersonLocationBroadcaster } from "@/components/delivery-partner/location-broadcaster"
import dynamic from "next/dynamic"
import { Loader2, Bike } from "lucide-react"
import {
  useOrderTrackingLivePosition,
  useOrderTrackingRouteCoords,
  useOrderTrackingMapActions,
  useRiderLastLocationQuery,
  useRouteEtaQuery,
  orderTrackingMapStore,
} from "@/stores/orderTrackingMapStore"

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
  deliveryPersonId?: string
  broadcastLocation?: boolean
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
  deliveryPersonId,
  broadcastLocation,
}: LiveOrderTrackingMapProps) {
  const livePosition = useOrderTrackingLivePosition()
  const routeCoords = useOrderTrackingRouteCoords()
  const actions = useOrderTrackingMapActions()

  const initialPositionRef = useRef<{ lat: number; lng: number } | null>(
    deliveryPersonLat && deliveryPersonLng ? { lat: deliveryPersonLat, lng: deliveryPersonLng } : null
  )

  useEffect(() => {
    const initial = initialPositionRef.current
    actions.resetTracking()
    if (initial) actions.setLivePosition(initial)
    return () => actions.resetTracking()
  }, [orderId, actions])

  const destLat = customerLat ?? kitchenLat
  const destLng = customerLng ?? kitchenLng

  const { data: lastKnownLocation } = useRiderLastLocationQuery(
    orderId,
    !deliveryPersonLat && !deliveryPersonLng
  )

  const deliveryPos = livePosition ?? lastKnownLocation ?? null

  const { data: eta, isFetching: etaLoading } = useRouteEtaQuery(deliveryPos, destLat, destLng)

  useAblyOrderChannel(
    orderId,
    useCallback((msg: { name: string; data: unknown }) => {
      if (msg.name === "rider:location") {
        const { lat, lng } = msg.data as { lat: number; lng: number }
        const current = orderTrackingMapStore.getState().livePosition
        if (current && Math.abs(current.lat - lat) < 0.00001 && Math.abs(current.lng - lng) < 0.00001) return
        orderTrackingMapStore.getState().setLivePosition({ lat, lng })
      }
    }, []),
    true
  )

  const distance = deliveryPos
    ? haversineKm(deliveryPos.lat, deliveryPos.lng, destLat, destLng)
    : null

  const roadDistance = useMemo(() => {
    if (routeCoords.length < 2) return null
    return routeCoords.reduce(
      (acc, [lat, lng], i) =>
        i === 0 ? 0 : acc + haversineKm(routeCoords[i - 1][0], routeCoords[i - 1][1], lat, lng),
      0
    )
  }, [routeCoords])

  const showDistance = roadDistance ?? distance

  return (
    <div className="relative">
      {deliveryPersonId && broadcastLocation && (
        <DeliveryPersonLocationBroadcaster
          deliveryPersonId={deliveryPersonId}
          orderId={orderId}
          enabled={true}
        />
      )}
      <div className="rounded-xl overflow-hidden border border-border">
        <ThanjavurMap
          markerPosition={deliveryPos ? [deliveryPos.lat, deliveryPos.lng] : undefined}
          kitchenPosition={[kitchenLat, kitchenLng]}
          routeCoords={routeCoords.length > 0 ? routeCoords : undefined}
          height="250px"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff5722]" />
          <span className="text-muted-foreground">Kitchen</span>
          <span className="mx-1.5 text-muted-foreground/40">|</span>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a6a32]" />
          <span className="text-muted-foreground">Delivery</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {deliveryPos && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
              </span>
              Live
            </span>
          )}
          {etaLoading && eta == null && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculating ETA...
            </span>
          )}
          {eta != null && (
            <span className="text-sm font-semibold text-foreground">
              Arriving in ~{Math.round(eta)} min
            </span>
          )}
          {showDistance != null && (
            <span className="text-xs font-medium text-muted-foreground">
              {showDistance < 1
                ? `${Math.round(showDistance * 1000)} m`
                : `${showDistance.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 px-1">
        {!deliveryPos ? (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Waiting for delivery partner location...
          </div>
        ) : showDistance != null && showDistance < 1.5 ? (
          <div className="flex items-center gap-2 text-xs font-bold text-green-700">
            <Bike className="h-3.5 w-3.5" />
            Your delivery partner is nearby
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Bike className="h-3.5 w-3.5 text-green-600" />
            Your delivery partner is on the way
          </div>
        )}
      </div>
    </div>
  )
}
