import webpush from "web-push"
import prisma from "@/lib/prisma"

const VAPID_PUBLIC_KEY = "BBvp12rYqnzDQQmVl4QEpXocatjIT4Dnhuv3olmjjuopnlmzDfCsCmLM2y0Sr1s1NQhritJ1EyfnCkYyVsgUfLQ"
const VAPID_PRIVATE_KEY = "PTtnmeOzioEB1JTeNWQekduMFuYaV4NqG9O2fU9u_mI"

webpush.setVapidDetails("mailto:support@rrckitchen.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

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

export async function sendPushToDeliveryPartners(kitchenPartnerId: string, title: string, body: string, url: string) {
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
    } catch {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
    }
  }
}
