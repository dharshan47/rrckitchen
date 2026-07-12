"use client"

import { useEffect, useRef } from "react"
import { useMutation } from "@tanstack/react-query"

async function postLocation(payload: {
  deliveryPersonId: string
  orderId: string
  lat: number
  lng: number
}) {
  const res = await fetch("/api/rider/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to broadcast location")
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const { mutate } = useMutation({ mutationFn: postLocation })

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
      return
    }

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mutate({
            deliveryPersonId,
            orderId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      )
    }

    sendLocation()
    intervalRef.current = setInterval(sendLocation, 8000)

    return () => {
      if (intervalRef.current !== undefined) clearInterval(intervalRef.current)
    }
  }, [deliveryPersonId, orderId, enabled, mutate])

  return null
}
