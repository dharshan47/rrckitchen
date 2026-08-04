"use server"

import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  format,
  endOfDay,
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns"

export async function getDeliveryPaymentsData(params?: { from?: string; to?: string }) {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      kyc: true,
    }
  })

  if (!deliveryPartner) {
    return null
  }

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const monthStart = startOfMonth(now)

  const allPayouts = await prisma.deliveryPartnerPayout.findMany({
    where: {
      deliveryPartnerId: deliveryPartner.id,
    },
    orderBy: { createdAt: "desc" },
  })

  const rangeFrom = params?.from ? startOfDay(new Date(params.from)) : weekStart
  const rangeTo = params?.to ? endOfDay(new Date(params.to)) : now

  const rangePayouts = allPayouts.filter(
    (p) => p.createdAt >= rangeFrom && p.createdAt <= rangeTo
  )

  const rangeEarnings = rangePayouts.reduce((sum, p) => sum + Number(p.amount), 0)
  const rangeCommission = Math.round(rangeEarnings * 0.10)
  const rangeSettledPayouts = rangePayouts
    .filter((p) => p.status === "SETTLED")
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const rangeCount = rangePayouts.length

  const spanDays = differenceInCalendarDays(rangeTo, rangeFrom) + 1
  const prevRangeFrom = addDays(rangeFrom, -spanDays)
  const prevRangeEarnings = allPayouts
    .filter((p) => p.createdAt >= prevRangeFrom && p.createdAt < rangeFrom)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Aggregate earnings for default (this week / this month) view
  const [
    thisWeekPayouts,
    thisMonthPayouts,
    totalPayouts,
    lastWeekPayouts,
    lastMonthPayouts,
  ] = await Promise.all([
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: weekStart },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        status: "SETTLED",
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: subDays(weekStart, 7), lt: weekStart },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: startOfMonth(subDays(monthStart, 1)), lt: monthStart },
      },
      _sum: { amount: true },
    }),
  ])

  const thisWeekEarnings = Number(thisWeekPayouts._sum.amount || 0)
  const thisMonthEarnings = Number(thisMonthPayouts._sum.amount || 0)
  const totalSettledPayouts = Number(totalPayouts._sum.amount || 0)

  const totalAllTimeEarnings = allPayouts.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalCommission = Math.round(totalAllTimeEarnings * 0.10)

  // Chart data bucketed by day (short ranges) or by week (long ranges)
  const weeklyEarningsTrend: { name: string; value: number }[] = []
  if (spanDays <= 31) {
    for (const day of eachDayOfInterval({ start: rangeFrom, end: rangeTo })) {
      const dayEnd = endOfDay(day)
      const dayTotal = rangePayouts
        .filter((p) => p.createdAt >= day && p.createdAt <= dayEnd)
        .reduce((sum, p) => sum + Number(p.amount), 0)
      weeklyEarningsTrend.push({
        name: format(day, "EEE"),
        value: dayTotal
      })
    }
  } else {
    for (const week of eachWeekOfInterval({ start: rangeFrom, end: rangeTo }, { weekStartsOn: 1 })) {
      const weekEnd = addDays(week, 6)
      const weekTotal = rangePayouts
        .filter((p) => p.createdAt >= week && p.createdAt <= weekEnd)
        .reduce((sum, p) => sum + Number(p.amount), 0)
      weeklyEarningsTrend.push({
        name: format(week, "dd MMM"),
        value: weekTotal
      })
    }
  }

  // Payout Summary for doughnut chart
  const paidCount = rangePayouts.filter((p) => p.status === "SETTLED").reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingCount = rangePayouts.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0)
  const failedCount = rangePayouts.filter((p) => p.status === "FAILED").reduce((sum, p) => sum + Number(p.amount), 0)

  const payoutSummary = [
    { name: "Paid", value: paidCount, color: "#16a34a" },
    { name: "Pending", value: pendingCount, color: "#f97316" },
    { name: "Failed", value: failedCount, color: "#9333ea" },
  ]

  // Recent Payouts
  const kyc = deliveryPartner.kyc
  const payoutMethod = kyc?.upiId || kyc?.googlePayNumber || kyc?.phonePeNumber ? "UPI" : kyc?.bankAccountNumber ? "Bank Transfer" : "Not configured"
  const recentPayouts = rangePayouts.slice(0, 5).map(p => ({
    id: `PAYOUT-${format(p.createdAt, "yyMM")}-${p.id.substring(p.id.length - 3).toUpperCase()}`,
    amount: Number(p.amount),
    date: format(p.createdAt, "dd MMM yyyy, hh:mm a"),
    status: p.status === "SETTLED" ? "Paid" : p.status === "PENDING" ? "Pending" : "Failed",
    method: payoutMethod,
  }))

  // Transaction History
  const transactions = rangePayouts.slice(0, 10).map((p, index) => {
    const balance = rangePayouts.slice(index).reduce((sum, curr) => sum + Number(curr.amount), 0)

    return {
      id: p.id,
      date: format(p.createdAt, "dd MMM yyyy, hh:mm a"),
      description: `Delivery Earnings - ${p.orderId ? `Order #${p.orderId.substring(p.orderId.length - 6).toUpperCase()}` : "Payout"}`,
      type: "Earning",
      amount: Number(p.amount),
      balance: balance
    }
  })

  return {
    stats: {
      thisWeekEarnings,
      thisMonthEarnings,
      totalCommission,
      totalSettledPayouts,
      lastWeekEarnings: Number(lastWeekPayouts._sum.amount || 0),
      lastMonthEarnings: Number(lastMonthPayouts._sum.amount || 0),
      rangeEarnings,
      rangeCommission,
      rangeSettledPayouts,
      rangeCount,
      prevRangeEarnings,
    },
    weeklyEarningsTrend,
    kyc: deliveryPartner.kyc,
    recentPayouts,
    payoutSummary,
    transactions: transactions.slice(0, 6)
  }
}
