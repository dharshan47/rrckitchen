"use client"

import { useEffect, useRef } from "react"
import { getAblyClient } from "@/lib/ably/client"

type AblyMessage = { name: string; data: unknown }

export function useAblySubscribe(
  channelName: string,
  onMessage: (msg: AblyMessage) => void,
  enabled = true
) {
  const callbackRef = useRef(onMessage)

  useEffect(() => {
    callbackRef.current = onMessage
  })

  useEffect(() => {
    if (!enabled || !channelName) return

    const client = getAblyClient()
    const channel = client.channels.get(channelName)

    const handler = (msg: AblyMessage) => {
      callbackRef.current(msg)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.subscribe(handler as any)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      channel.unsubscribe(handler as any)
    }
  }, [channelName, enabled])
}

export function useAblyOrderChannel(
  orderId: string | undefined,
  onMessage: (msg: AblyMessage) => void,
  enabled = true
) {
  useAblySubscribe(orderId ? `order:${orderId}` : "", onMessage, enabled && !!orderId)
}

/**
 * Subscribes to the real-time channel of every order in the given list.
 * Used on the orders list page so any status/delivery/refund event pushed
 * by the backend for one of the user's orders triggers a fresh fetch.
 */
export function useAblyOrderListChannels(
  orderIds: string[],
  onMessage: (msg: AblyMessage) => void,
  enabled = true
) {
  const callbackRef = useRef(onMessage)

  useEffect(() => {
    callbackRef.current = onMessage
  })

  useEffect(() => {
    if (!enabled || orderIds.length === 0) return

    const client = getAblyClient()
    const channels = orderIds.map((id) => client.channels.get(`order:${id}`))

    const handler = (msg: AblyMessage) => {
      callbackRef.current(msg)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channels.forEach((channel) => channel.subscribe(handler as any))
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      channels.forEach((channel) => channel.unsubscribe(handler as any))
    }
  }, [orderIds, enabled])
}

export function useAblyKitchenChannel(
  kitchenId: string | undefined,
  onMessage: (msg: AblyMessage) => void,
  enabled = true
) {
  useAblySubscribe(kitchenId ? `kitchen:${kitchenId}` : "", onMessage, enabled && !!kitchenId)
}

export function useAblyDeliveryPersonChannel(
  deliveryPersonId: string | undefined,
  onMessage: (msg: AblyMessage) => void,
  enabled = true
) {
  useAblySubscribe(
    deliveryPersonId ? `deliveryPartner:${deliveryPersonId}` : "",
    onMessage,
    enabled && !!deliveryPersonId
  )
}
