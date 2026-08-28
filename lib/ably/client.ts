"use client"

import * as Ably from "ably"

type AblyMessage = { name: string; data: unknown }
type AblyHandler = (msg: AblyMessage) => void

let ablyClient: Ably.Realtime | null = null

// Channels the current client's token must cover. Kept across client
// rebuilds so a new token always includes every channel the page uses.
const requestedChannels = new Set<string>()

// Every active listener per channel. Kept across client rebuilds so no
// subscription is lost when the client is recreated with a wider token.
const listeners = new Map<string, Set<AblyHandler>>()

const CHANNEL_RE = /^(order|kitchen|deliveryPartner|user):[a-zA-Z0-9_-]+$/

function buildAuthUrl() {
  const qs = new URLSearchParams()
  const channels = [...requestedChannels].filter((c) => CHANNEL_RE.test(c))
  if (channels.length > 0) qs.set("channels", channels.join(","))
  return `/api/ably-token?${qs.toString()}`
}

function createClient() {
  const client = new Ably.Realtime({
    authUrl: buildAuthUrl(),
    authMethod: "GET",
  })
  ablyClient = client

  client.connection.on((stateChange) => {
    if (stateChange.previous === "connecting" && stateChange.current === "disconnected") {
      console.warn("[Ably] Connection failed, will retry on next request")
    }
    // Reset the singleton so the next subscriber creates a fresh client and
    // re-requests a token instead of staying stuck in a failed state. Only
    // touch the singleton if it still points at this client: a rebuilt
    // client must not be closed by a stale event from the previous one.
    if (stateChange.current === "failed") {
      console.error("[Ably] Connection failed permanently")
      client.close()
      if (ablyClient === client) ablyClient = null
    }
  })
}

function resubscribeAll() {
  if (!ablyClient) return
  listeners.forEach((handlers, channelName) => {
    const channel = ablyClient!.channels.get(channelName)
    handlers.forEach((handler) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Promise.resolve(channel.subscribe(handler as any)).catch(() => {
        // Connection not ready yet; Ably re-attaches listeners on reconnect.
      })
    })
  })
}

/**
 * Subscribes to an Ably channel. The token endpoint is called with the full
 * list of channels the page needs, so the token always covers the channel.
 * If a channel is requested that the current client's token doesn't cover,
 * the client is rebuilt with the wider channel list and every existing
 * listener is re-attached, so no subscription is ever dropped.
 */
export function subscribeAbly(channelName: string, handler: AblyHandler) {
  if (!CHANNEL_RE.test(channelName)) return

  if (!requestedChannels.has(channelName)) {
    requestedChannels.add(channelName)
    destroyAblyClient()
    createClient()
    resubscribeAll()
  } else if (!ablyClient) {
    createClient()
    resubscribeAll()
  }

  if (!ablyClient) return

  const channel = ablyClient.channels.get(channelName)
  let handlers = listeners.get(channelName)
  if (!handlers) {
    handlers = new Set()
    listeners.set(channelName, handlers)
  }
  handlers.add(handler)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Promise.resolve(channel.subscribe(handler as any)).catch(() => {
    // Connection down (token auth failing or network blip). Swallow it: the
    // listener is re-attached when the client reconnects or is rebuilt.
  })
}

export function unsubscribeAbly(channelName: string, handler: AblyHandler) {
  const handlers = listeners.get(channelName)
  if (handlers) {
    handlers.delete(handler)
    if (handlers.size === 0) listeners.delete(channelName)
  }
  if (!ablyClient) return
  const channel = ablyClient.channels.get(channelName)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Promise.resolve(channel.unsubscribe(handler as any)).catch(() => {})
}

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

    const client = new Ably.Realtime({
      authUrl: `/api/ably-token?${qs.toString()}`,
      authMethod: "GET",
    })
    ablyClient = client

    client.connection.on((stateChange) => {
      if (stateChange.previous === "connecting" && stateChange.current === "disconnected") {
        console.warn("[Ably] Connection failed, will retry on next request")
      }
      if (stateChange.current === "failed") {
        console.error("[Ably] Connection failed permanently")
        client.close()
        if (ablyClient === client) ablyClient = null
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
