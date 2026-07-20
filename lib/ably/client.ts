"use client"

import * as Ably from "ably"

let ablyClient: Ably.Realtime | null = null

export function getAblyClient(params?: {
  orderId?: string
  kitchenId?: string
  deliveryPartnerId?: string
}) {
  if (!ablyClient) {
    const qs = new URLSearchParams()
    if (params?.orderId) qs.set("orderId", params.orderId)
    if (params?.kitchenId) qs.set("kitchenId", params.kitchenId)
    if (params?.deliveryPartnerId) qs.set("deliveryPartnerId", params.deliveryPartnerId)

    ablyClient = new Ably.Realtime({
      authUrl: `/api/ably-token?${qs.toString()}`,
      authMethod: "GET",
    })

    ablyClient.connection.on((stateChange) => {
      if (stateChange.previous === "connecting" && stateChange.current === "disconnected") {
        console.warn("[Ably] Connection failed, will retry on next request")
      }
      if (stateChange.current === "failed") {
        console.error("[Ably] Connection failed permanently")
        ablyClient?.close()
        ablyClient = null
      }
    })
  }
  return ablyClient
}

export function destroyAblyClient() {
  if (ablyClient) {
    ablyClient.close()
    ablyClient = null
  }
}
