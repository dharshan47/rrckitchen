import { getAblyRest } from "@/lib/ably/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const CHANNEL_RE = /^(order|kitchen|deliveryPartner|user):[a-zA-Z0-9_-]+$/

function unauthorized() {
  return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } })
}

function forbidden() {
  return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } })
}

function errorResponse(body: string, status: number) {
  return new Response(body, { status, headers: { "Cache-Control": "no-store" } })
}

function jsonResponse(data: unknown) {
  return Response.json(data, { headers: { "Cache-Control": "no-store" } })
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  const user = session?.user

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  const kitchenId = searchParams.get("kitchenId")
  const deliveryPartnerId = searchParams.get("deliveryPartnerId")
  const channelsParam = searchParams.get("channels")

  const channelNames = new Set<string>()
  if (channelsParam) {
    for (const raw of channelsParam.split(",")) {
      const name = raw.trim()
      if (name && CHANNEL_RE.test(name)) channelNames.add(name)
    }
  }
  if (orderId) channelNames.add(`order:${orderId}`)
  if (kitchenId) channelNames.add(`kitchen:${kitchenId}`)
  if (deliveryPartnerId) channelNames.add(`deliveryPartner:${deliveryPartnerId}`)

  const capability: Record<string, string[]> = {}

  const kitchenChannels = [...channelNames].filter((c) => c.startsWith("kitchen:"))
  // Public channels: any visitor (logged in or not) of a kitchen page can
  // subscribe to kitchen live updates (status change, new order, stock low).
  for (const c of kitchenChannels) {
    capability[c] = ["subscribe"]
  }

  const userChannels = [...channelNames].filter((c) => c.startsWith("user:"))
  if (userChannels.length > 0) {
    if (!user) return unauthorized()
    for (const c of userChannels) {
      if (c !== `user:${user.id}`) return forbidden()
      capability[c] = ["subscribe"]
    }
  }

  const orderChannels = [...channelNames].filter((c) => c.startsWith("order:"))
  if (orderChannels.length > 0) {
    if (!user) return unauthorized()

    const orderIds = orderChannels.map((c) => c.slice("order:".length))
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        userId: true,
        deliveryPartnerId: true,
        orderItems: { select: { kitchenPartnerId: true }, take: 1 },
      },
    })

    const deliveryPartner = await prisma.deliveryPartner.findFirst({ where: { userId: user.id } })
    const kitchenPartner = await prisma.kitchenPartner.findFirst({ where: { userId: user.id } })

    for (const order of orders) {
      const isOwner =
        order.userId === user.id ||
        (deliveryPartner && order.deliveryPartnerId === deliveryPartner.id) ||
        (kitchenPartner && order.orderItems.some((i) => i.kitchenPartnerId === kitchenPartner.id))

      if (!isOwner) return forbidden()
      capability[`order:${order.id}`] = ["subscribe"]
    }
    // An order channel we couldn't look up (no permission to query) is rejected.
    const granted = new Set(orders.map((o) => o.id))
    if (orderIds.some((id) => !granted.has(id))) return errorResponse("Order not found", 404)
  }

  const deliveryChannels = [...channelNames].filter((c) => c.startsWith("deliveryPartner:"))
  if (deliveryChannels.length > 0) {
    if (!user) return unauthorized()

    const deliveryPartner = await prisma.deliveryPartner.findFirst({ where: { userId: user.id } })
    if (!deliveryPartner) return forbidden()
    for (const c of deliveryChannels) {
      if (c !== `deliveryPartner:${deliveryPartner.id}`) return forbidden()
      capability[c] = ["subscribe"]
    }
  }

  // No channels requested at all: fall back to a token for the user's own
  // personal channel. This requires authentication.
  if (channelNames.size === 0) {
    if (!user) return unauthorized()
    capability[`user:${user.id}`] = ["subscribe"]
  }

  if (Object.keys(capability).length === 0) {
    return errorResponse("Bad Request", 400)
  }

  if (!process.env.ABLY_API_KEY) {
    return errorResponse("Ably API key not configured", 500)
  }

  try {
    const ably = getAblyRest()
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: user?.id,
      ttl: 15 * 60 * 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      capability: capability as any,
    })

    return jsonResponse(tokenRequest)
  } catch (error) {
    console.error("[Ably Token] Failed to create token request:", error)
    return errorResponse("Failed to create Ably token", 500)
  }
}
