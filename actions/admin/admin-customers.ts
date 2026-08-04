"use server"

import prisma from "@/lib/prisma"
import { requireAdmin, logAdminAction } from "@/lib/auth-guards"
import { startOfDay, subDays, format } from "date-fns"
import { sendPushNotification } from "@/lib/notification"

interface AdminActionResult {
  ok: boolean
  error?: string
  userId?: string
}

async function adminGuard(): Promise<{ actorUserId: string }> {
  const { session } = await requireAdmin()
  return { actorUserId: session.user.id }
}

export interface AdminCustomerRow {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  joined: string
  orders: number
  spent: number
  status: "Active" | "Banned"
  verified: boolean
  avatarUrl: string | null
  city: string | null
  lastLogin: string | null
}

export interface AdminCustomerOrderRow {
  id: string
  date: string
  amount: number
  status: string
  items: number
}

export async function getAdminCustomers() {
  try {
    await requireAdmin()
  } catch {
    return null
  }

  const now = new Date()
  const weekStart = startOfDay(subDays(now, 6))

  const [total, active, banned, newThisWeek, verifiedCount, repeatCount, weekSignups, cityRows, users] =
    await Promise.all([
      prisma.user.count({ where: { role: "customer" } }),
      prisma.user.count({ where: { role: "customer", banned: false, isActive: true } }),
      prisma.user.count({ where: { role: "customer", banned: true } }),
      prisma.user.count({ where: { role: "customer", createdAt: { gte: weekStart } } }),
      prisma.user.count({
        where: { role: "customer", OR: [{ emailVerified: true }, { phoneNumberVerified: true }] },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        having: { userId: { _count: { gte: 2 } } },
        _count: { userId: true },
      }),
      prisma.user.findMany({
        where: { role: "customer", createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
      prisma.address.groupBy({
        by: ["serviceZoneId"],
        _count: { _all: true },
        orderBy: { _count: { serviceZoneId: "desc" } },
        take: 5,
      }),
      prisma.user.findMany({
        where: { role: "customer" },
        orderBy: { createdAt: "desc" },
        take: 250,
        include: {
          addresses: {
            take: 1,
            orderBy: { isDefault: "desc" },
            include: { serviceZone: { select: { name: true } } },
          },
          sessions: { take: 1, orderBy: { createdAt: "desc" }, select: { createdAt: true } },
        },
      }),
    ])

  const userIds = users.map((u) => u.id)
  const [orderCounts, spentRows, recentOrders] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { id: true },
    }),
    prisma.payment.groupBy({
      by: ["orderId"],
      where: { status: "SUCCESS", order: { userId: { in: userIds } } },
      _sum: { amount: true },
    }),
    userIds.length > 0
      ? prisma.order.findMany({
          where: { userId: { in: userIds } },
          orderBy: { createdAt: "desc" },
          take: 400,
          select: {
            id: true,
            userId: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            _count: { select: { orderItems: true } },
          },
        })
      : [],
  ])

  const orderCountMap = new Map(orderCounts.map((o) => [o.userId, o._count.id]))
  const userIdByOrderId = new Map(recentOrders.map((o) => [o.id, o.userId]))
  const spentMap = new Map<string, number>()
  for (const row of spentRows) {
    const uid = userIdByOrderId.get(row.orderId)
    if (!uid) continue
    spentMap.set(uid, (spentMap.get(uid) ?? 0) + Number(row._sum.amount ?? 0))
  }

  const customers: AdminCustomerRow[] = users.map((u) => {
    const name = u.name ?? u.fullName ?? u.phoneNumber ?? "Customer"
    return {
      id: `CUS${u.id.slice(-4).toUpperCase()}`,
      userId: u.id,
      name,
      email: u.email ?? "",
      phone: u.phoneNumber ?? "",
      joined: format(u.createdAt, "dd MMM yyyy"),
      orders: orderCountMap.get(u.id) ?? 0,
      spent: spentMap.get(u.id) ?? 0,
      status: u.banned ? "Banned" : "Active",
      verified: !!(u.emailVerified || u.phoneNumberVerified),
      avatarUrl: u.image,
      city: u.addresses[0]?.serviceZone?.name ?? null,
      lastLogin: u.sessions[0]?.createdAt?.toISOString() ?? null,
    }
  })

  // Overview trend: signups per day over last 7 days
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i)
    return {
      label: format(d, "d MMM"),
      customers: 0,
    }
  })
  for (const s of weekSignups) {
    const idx = Math.floor((s.createdAt.getTime() - weekStart.getTime()) / 86400000)
    if (idx >= 0 && idx < 7) dayLabels[idx].customers += 1
  }

  // Demographics: verified vs unverified split
  const demographics = [
    { category: "Verified", count: verifiedCount, fill: "hsl(var(--chart-1))" },
    { category: "Unverified", count: Math.max(0, total - verifiedCount), fill: "hsl(var(--chart-2))" },
  ]

  // Top cities from address service zones
  const zoneIds = cityRows.map((r) => r.serviceZoneId)
  const zones = zoneIds.length
    ? await prisma.serviceZone.findMany({ where: { id: { in: zoneIds } }, select: { id: true, name: true } })
    : []
  const zoneNameMap = new Map(zones.map((z) => [z.id, z.name]))
  const topLocations = cityRows.map((r) => ({
    name: zoneNameMap.get(r.serviceZoneId) ?? "Other",
    count: r._count._all,
  }))

  const recentOrdersByUser = new Map<string, AdminCustomerOrderRow[]>()
  for (const o of recentOrders) {
    const list = recentOrdersByUser.get(o.userId) ?? []
    if (list.length >= 5) continue
    list.push({
      id: `ORD${o.id.slice(-6).toUpperCase()}`,
      date: format(o.createdAt, "dd MMM yyyy"),
      amount: Number(o.totalAmount),
      status: o.status,
      items: o._count.orderItems,
    })
    recentOrdersByUser.set(o.userId, list)
  }

return {
    stats: {
      total,
      active,
      banned,
      newThisWeek,
      repeat: repeatCount.length,
      verified: verifiedCount,
    },
    overview: dayLabels,
    demographics,
    topLocations,
    customers,
    recentOrdersByUser: Object.fromEntries(recentOrdersByUser),
  }
}

/** Soft-delete a customer and revoke all their sessions. */
export async function adminDeleteCustomer(userId: string): Promise<AdminActionResult> {
  try {
    const { actorUserId } = await adminGuard()

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), isActive: false, banned: true, banReason: "Deleted by admin" },
      }),
    ])

    await logAdminAction({
      actorUserId,
      action: "DELETE_CUSTOMER",
      targetType: "User",
      targetId: userId,
    })

    return { ok: true, userId }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete customer" }
  }
}

/** Send a push notification message to a customer. */
export async function adminSendCustomerMessage(userId: string, title: string, body: string) {
  try {
    const { actorUserId } = await adminGuard()

    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })

    let sent = 0
    let failed = 0
    for (const sub of subscriptions) {
      try {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url: "/account" }),
        )
        sent++
        await prisma.notificationLog
          .create({
            data: {
              userId,
              channel: "PUSH",
              templateKey: "ADMIN_MESSAGE",
              title,
              body,
              status: "SENT",
            },
          })
          .catch(() => {})
      } catch {
        failed++
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
    }

    await logAdminAction({
      actorUserId,
      action: "SEND_MESSAGE",
      targetType: "User",
      targetId: userId,
      metadata: { title, sent, failed },
    })

    return { ok: true, sent, failed }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send message" }
  }
}
