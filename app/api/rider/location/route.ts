import { redis } from "@/lib/redis"
import { getAblyRest } from "@/lib/ably/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const DB_WRITE_THROTTLE_MS = 5000
const LAST_LOC_TTL = 3600

interface LocationPayload {
  lat: number
  lng: number
  accuracy: number | null
  speed: number | null
  heading: number | null
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { deliveryPersonId, orderId, lat, lng, accuracy, speed, heading } = await req.json()
    if (!deliveryPersonId || !orderId || lat == null || lng == null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (
      typeof lat !== "number" || !Number.isFinite(lat) ||
      typeof lng !== "number" || !Number.isFinite(lng)
    ) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 })
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!partner || partner.id !== deliveryPersonId) {
      return new Response("Forbidden", { status: 403 })
    }

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { orderId, deliveryPartnerId: deliveryPersonId },
      select: { id: true },
    })
    if (!assignment) {
      return new Response("Forbidden", { status: 403 })
    }

    const now = Date.now()
    const locPayload: LocationPayload = {
      lat,
      lng,
      accuracy: typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null,
      speed: typeof speed === "number" && Number.isFinite(speed) ? speed : null,
      heading: typeof heading === "number" && Number.isFinite(heading) ? heading : null,
    }

    const lastWrite = await redis.get<number>(`locWrite:${orderId}`)
    if (lastWrite == null || now - Number(lastWrite) >= DB_WRITE_THROTTLE_MS) {
      await Promise.allSettled([
        redis.set(`locWrite:${orderId}`, now, { ex: DB_WRITE_THROTTLE_MS / 1000 + 60 }),
        prisma.deliveryLocation.create({
          data: {
            orderId,
            deliveryPartnerId: deliveryPersonId,
            latitude: lat,
            longitude: lng,
            accuracy: locPayload.accuracy,
          },
        }),
      ])
    }

    await Promise.allSettled([
      redis.geoadd("deliveryPersons:live", { longitude: lng, latitude: lat, member: deliveryPersonId }),
      redis.set(`deliveryPerson:${deliveryPersonId}:lastPing`, now, { ex: 120 }),
      redis.set(`deliveryOrder:${orderId}:lastLoc`, JSON.stringify({ ...locPayload, ts: now }), {
        ex: LAST_LOC_TTL,
      }),
      getAblyRest()
        .channels.get(`order:${orderId}`)
        .publish("rider:location", locPayload),
      getAblyRest()
        .channels.get(`deliveryPartner:${deliveryPersonId}`)
        .publish("location:updated", locPayload),
    ])

    return Response.json({ ok: true })
  } catch (error) {
    console.error("[rider/location] POST failed", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const orderId = url.searchParams.get("orderId")
    if (!orderId) {
      return Response.json({ error: "Missing orderId" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    })
    if (!order) {
      return Response.json({ location: null })
    }

    if (order.userId !== session.user.id) {
      const partner = await prisma.deliveryPartner.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (!partner) {
        return new Response("Forbidden", { status: 403 })
      }
      const assignment = await prisma.deliveryAssignment.findFirst({
        where: { orderId, deliveryPartnerId: partner.id },
        select: { id: true },
      })
      if (!assignment) {
        return new Response("Forbidden", { status: 403 })
      }
    }

    const raw = await redis.get<string>(`deliveryOrder:${orderId}:lastLoc`)
    if (!raw) {
      return Response.json({ location: null })
    }
    try {
      return Response.json({ location: JSON.parse(raw) })
    } catch {
      return Response.json({ location: null })
    }
  } catch (error) {
    console.error("[rider/location] GET failed", error)
    return Response.json({ location: null })
  }
}
