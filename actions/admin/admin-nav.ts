"use server"

import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { startOfDay, subDays } from "date-fns"

export async function getAdminNavData() {
  try {
    await requireAdmin()
  } catch {
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const yesterdayStart = startOfDay(subDays(now, 1))
  const weekStart = startOfDay(subDays(now, 6))

  const [todayAgg, yesterdayAgg, weekPayments, pendingOrders, openTickets, pendingKyc, lowStock] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: "SUCCESS", paidAt: { gte: todayStart, lt: todayEnd } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", paidAt: { gte: yesterdayStart, lt: todayStart } },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: "SUCCESS", paidAt: { gte: weekStart } },
        select: { amount: true, paidAt: true },
      }),
      prisma.order.count({
        where: { status: { in: ["CONFIRMED", "PREPARING", "READYFORPICKUP"] } },
      }),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.kitchenPartner.count({
        where: { status: { in: ["PENDINGAPPROVAL"] } },
      }),
      prisma.menuItem.count({ where: { isAvailable: false, deletedAt: null } }),
    ])

  const todayRevenue = Number(todayAgg._sum.amount ?? 0)
  const yesterdayRevenue = Number(yesterdayAgg._sum.amount ?? 0)
  const trend =
    yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : null

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dayIdx = (d: Date) => {
    const idx = Math.floor((d.getTime() - weekStart.getTime()) / 86400000)
    return idx >= 0 && idx <= 6 ? idx : 0
  }
  const weeklyTrend = dayNames.map(() => ({ value: 0 }))
  for (const p of weekPayments) {
    if (p.paidAt) {
      weeklyTrend[dayIdx(p.paidAt)].value += Number(p.amount)
    }
  }

  return {
    todayRevenue,
    yesterdayRevenue,
    trend,
    weeklyTrend,
    pendingOrders,
    openTickets,
    attentionCount: pendingKyc + openTickets + lowStock,
  }
}