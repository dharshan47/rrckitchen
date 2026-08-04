"use client"

import { useEffect, useRef } from "react"
import { useMutation } from "@tanstack/react-query"

interface LocationPayload {
  deliveryPersonId: string
  orderId: string
  lat: number
  lng: number
  accuracy?: number
  speed?: number
  heading?: number
}

async function postLocation(payload: LocationPayload) {
  const res = await fetch("/api/rider/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to broadcast location")
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function DeliveryPersonLocationBroadcaster({
  deliveryPersonId,
  orderId,
  enabled,
}: {
  deliveryPersonId: string
  orderId: string
  enabled: boolean
}) {
  const watchIdRef = useRef<number | null>(null)
  const lastSentRef = useRef<{ lat: number; lng: number; ts: number } | null>(null)
  const { mutate } = useMutation({ mutationFn: postLocation })

  useEffect(() => {
    if (!enabled) return

    const MAX_INTERVAL_MS = 4000
    const MIN_MOVE_M = 15
    const MAX_ACCURACY_M = 150

    const sendIfNeeded = (
      lat: number,
      lng: number,
      accuracy?: number,
      speed?: number,
      heading?: number
    ) => {
      const now = Date.now()
      const last = lastSentRef.current
      if (
        last &&
        now - last.ts < MAX_INTERVAL_MS &&
        haversineMeters(last.lat, last.lng, lat, lng) < MIN_MOVE_M
      ) {
        return
      }
      lastSentRef.current = { lat, lng, ts: now }
      mutate({ deliveryPersonId, orderId, lat, lng, accuracy, speed, heading })
    }

    const onPosition = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading } = pos.coords
      if (accuracy != null && accuracy > MAX_ACCURACY_M) return
      sendIfNeeded(
        latitude,
        longitude,
        accuracy != null ? accuracy : undefined,
        speed != null ? speed : undefined,
        heading != null ? heading : undefined
      )
    }

    const onError = () => {}

    if (!navigator.geolocation) return

    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 2000,
    })

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
      lastSentRef.current = null
    }
  }, [deliveryPersonId, orderId, enabled, mutate])

  return null
}
