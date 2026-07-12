import { redis } from "@/lib/redis"
import { getAblyRest } from "@/lib/ably/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { deliveryPersonId, orderId, lat, lng } = await req.json()
  if (!deliveryPersonId || !orderId || lat == null || lng == null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  await redis.geoadd("deliveryPersons:live", lng, lat, deliveryPersonId)
  await redis.set(`deliveryPerson:${deliveryPersonId}:lastPing`, Date.now(), { ex: 120 })

  const ably = getAblyRest()
  await Promise.all([
    ably.channels.get(`order:${orderId}`).publish("rider:location", { lat, lng }),
    ably.channels.get(`deliveryPartner:${deliveryPersonId}`).publish("location:updated", { lat, lng }),
  ])

  return Response.json({ ok: true })
}
