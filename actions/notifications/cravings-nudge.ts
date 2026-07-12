"use server"

import prisma from "@/lib/prisma"
import { sendPushNotification } from "@/lib/notification"

export interface CravingNudgeResult {
  notified: number
  skipped: number
}

export async function processCravingsNudge(daysSinceLastOrder = 3): Promise<CravingNudgeResult> {
  const daysAgo = new Date()
  daysAgo.setDate(daysAgo.getDate() - daysSinceLastOrder)

  const candidates = await prisma.user.findMany({
    where: {
      isActive: true,
      pushSubscriptions: { some: {} },
      orders: {
        none: { createdAt: { gte: daysAgo } },
      },
    },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          orderItems: {
            include: {
              kitchenPartner: {
                include: { kitchenAlias: true },
              },
            },
            take: 1,
          },
        },
      },
      pushSubscriptions: true,
    },
  })

  let notified = 0
  let skipped = 0

  for (const user of candidates) {
    const lastKitchenName = user.orders[0]?.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName

    const title = "Missing your favorite tiffin?"
    const body = lastKitchenName
      ? `${lastKitchenName} has today's menu ready`
      : "See what's cooking near you today"

    try {
      for (const sub of user.pushSubscriptions) {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url: "/menu" }),
        )
      }
      notified++
    } catch {
      skipped++
    }
  }

  return { notified, skipped }
}

export async function getUserCravingBanner(userId: string) {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const recentOrder = await prisma.order.findFirst({
    where: {
      userId,
      createdAt: { gte: threeDaysAgo },
      payment: { status: "SUCCESS" },
    },
    select: { id: true },
  })

  if (recentOrder) {
    return null
  }

  const lastOrder = await prisma.order.findFirst({
    where: {
      userId,
      payment: { status: "SUCCESS" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        take: 1,
        include: {
          kitchenPartner: {
            include: { kitchenAlias: true },
          },
        },
      },
    },
  })

  if (!lastOrder) return null

  const now = new Date()
  const currentHour = now.getHours()
  let timeSlot: string | null = null
  if (currentHour >= 6 && currentHour < 11) timeSlot = "MORNING"
  else if (currentHour >= 11 && currentHour < 16) timeSlot = "LUNCH"
  else if (currentHour >= 16 && currentHour < 20) timeSlot = "EVENINGSNACKS"
  else if (currentHour >= 20 || currentHour < 2) timeSlot = "DINNER"

  if (!timeSlot) return null

  const kitchenName = lastOrder.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName

  return {
    show: true,
    message: kitchenName
      ? `Reorder your usual from ${kitchenName}?`
      : "Time to order — check today's menu",
    kitchenId: lastOrder.orderItems[0]?.kitchenPartnerId ?? null,
    timeSlot,
  }
}
