import { getAblyRest } from "@/lib/ably/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  const kitchenId = searchParams.get("kitchenId")
  const deliveryPartnerId = searchParams.get("deliveryPartnerId")

  const capability: Record<string, string[]> = {}

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, deliveryPartnerId: true, orderItems: { select: { kitchenPartnerId: true }, take: 1 } },
    })

    if (!order) return new Response("Order not found", { status: 404 })

    const deliveryPartner = await prisma.deliveryPartner.findFirst({ where: { userId: session.user.id } })
    const kitchenPartner = await prisma.kitchenPartner.findFirst({ where: { userId: session.user.id } })

    const isOwner =
      order.userId === session.user.id ||
      (deliveryPartner && order.deliveryPartnerId === deliveryPartner.id) ||
      (kitchenPartner && order.orderItems.some((i) => i.kitchenPartnerId === kitchenPartner.id))

    if (!isOwner) return new Response("Forbidden", { status: 403 })

    capability[`order:${orderId}`] = ["subscribe"]
  }

  if (kitchenId) {
    const kitchenPartner = await prisma.kitchenPartner.findFirst({ where: { userId: session.user.id } })
    if (!kitchenPartner || kitchenPartner.id !== kitchenId) {
      return new Response("Forbidden", { status: 403 })
    }
    capability[`kitchen:${kitchenId}`] = ["subscribe"]
  }

  if (deliveryPartnerId) {
    const deliveryPartner = await prisma.deliveryPartner.findFirst({ where: { userId: session.user.id } })
    if (!deliveryPartner || deliveryPartner.id !== deliveryPartnerId) {
      return new Response("Forbidden", { status: 403 })
    }
    capability[`deliveryPartner:${deliveryPartnerId}`] = ["subscribe"]
  }

  if (Object.keys(capability).length === 0) {
    capability[`user:${session.user.id}`] = ["subscribe"]
  }

  if (!process.env.ABLY_API_KEY) {
    return new Response("Ably API key not configured", { status: 500 })
  }

  try {
    const ably = getAblyRest()
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: session.user.id,
      ttl: 15 * 60 * 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      capability: capability as any,
    })

    return Response.json(tokenRequest)
  } catch (error) {
    console.error("[Ably Token] Failed to create token request:", error)
    return new Response("Failed to create Ably token", { status: 500 })
  }
}
