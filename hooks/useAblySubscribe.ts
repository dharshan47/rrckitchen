"use client"

import { useEffect, useRef } from "react"
import { subscribeAbly, unsubscribeAbly } from "@/lib/ably/client"

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

    const handler = (msg: AblyMessage) => {
      callbackRef.current(msg)
    }

    subscribeAbly(channelName, handler)
    return () => {
      unsubscribeAbly(channelName, handler)
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

    const handler = (msg: AblyMessage) => {
      callbackRef.current(msg)
    }

    orderIds.forEach((id) => subscribeAbly(`order:${id}`, handler))
    return () => {
      orderIds.forEach((id) => unsubscribeAbly(`order:${id}`, handler))
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
