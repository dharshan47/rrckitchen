import webpush from "web-push"
import prisma from "@/lib/prisma"

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? ""
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ""

let webpushInitialized = false

function ensureWebpush() {
  if (webpushInitialized) return
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT ?? "mailto:support@rrckitchen.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
  webpushInitialized = true
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY
}

async function getDeliveryPartnerSubscriptions(kitchenPartnerId: string) {
  const assignments = await prisma.deliveryPartnerKitchenAssignment.findMany({
    where: {
      kitchenPartnerId,
      status: { not: "CANCELLED" },
    },
    select: { deliveryPartnerId: true },
  })

  if (assignments.length === 0) return []

  const userIds = (
    await prisma.deliveryPartner.findMany({
      where: { id: { in: assignments.map((a) => a.deliveryPartnerId) } },
      select: { userId: true },
    })
  ).map((dp) => dp.userId)

  if (userIds.length === 0) return []

  return prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  })
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
) {
  ensureWebpush()
  if (!webpushInitialized) return
  try {
    await webpush.sendNotification(subscription, payload)
  } catch {
    // silently fail
  }
}

export async function sendPushToDeliveryPartners(kitchenPartnerId: string, title: string, body: string, url: string) {
  ensureWebpush()
  if (!webpushInitialized) return

  const subscriptions = await getDeliveryPartnerSubscriptions(kitchenPartnerId)
  if (subscriptions.length === 0) return

  const payload = JSON.stringify({ title, body, url })

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )

      await prisma.notificationLog.create({
        data: {
          userId: sub.userId,
          channel: "PUSH",
          templateKey: "ORDER_READY",
          title,
          body,
          status: "SENT",
        },
      }).catch(() => {})
    } catch {
      await prisma.notificationLog.create({
        data: {
          userId: sub.userId,
          channel: "PUSH",
          templateKey: "ORDER_READY",
          title,
          body,
          status: "FAILED",
        },
      }).catch(() => {})
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
    }
  }
}
