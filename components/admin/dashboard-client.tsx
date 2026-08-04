"use client"

import {
  Banknote,
  CheckCircle,
  ChefHat,
  ShoppingBag,
  Users,
  Truck,
  TrendingUp,
  Package,
  ShieldAlert,
  AlertCircle,
  Settings,
  Percent,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartLineDots } from "@/components/ui/line-chart"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAdminDashboardData, useAdminDashboardDataQuery } from "@/stores/adminStore"

function pctChange(prev: number | undefined, last: number | undefined): number | null {
  if (prev === undefined || prev === null || last === undefined || last === null || prev === 0)
    return null
  return ((last - prev) / prev) * 100
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = 100 / (data.length - 1)
  const points = data
    .map((v, i) => `${(i * stepX).toFixed(1)},${(18 - ((v - min) / range) * 18).toFixed(1)}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ------------------------- Skeleton components ------------------------- */

function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="text-right flex flex-col items-end gap-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-3 w-14 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

function RevenueCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-[1fr_200px] gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-48 w-full rounded-xl mt-2" />
        </div>
        <div className="flex flex-col items-center gap-4 border-l border-slate-100 pl-8">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-[140px] w-[140px] rounded-full" />
          <div className="w-full space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentOrdersSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BottomRowSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_1fr]">
      {/* Top Kitchens skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-3.5 w-12 rounded-md" />
                <Skeleton className="h-3.5 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System overview skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <Skeleton className="h-5 w-36 rounded-md mb-6" />
        <div className="space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Grow banner skeleton */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-6">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-3.5 w-48 rounded-md mt-2" />
        <div className="mt-10 space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */

export default function AdminOverview() {
  const dashboardData = useAdminDashboardData()
  const { isLoading } = useAdminDashboardDataQuery()

  const data = dashboardData ?? undefined

  if (isLoading && !data) {
    return (
      <div className="space-y-6 pb-10">
        <div>
          <Skeleton className="h-7 w-64 rounded-md" />
          <Skeleton className="h-4 w-80 rounded-md mt-2" />
        </div>
        <StatCardsSkeleton />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <RevenueCardSkeleton />
          <RecentOrdersSkeleton />
        </div>
        <BottomRowSkeleton />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    )
  }

  if (!data) {
    notFound()
  }

  const s = data.stats
  const trend = data.revenueTrend
  const revenueSeries = trend.map((t) => t.revenue)
  const orderSeries = trend.map((t) => t.orders)
  const revenueMoM = pctChange(revenueSeries[revenueSeries.length - 2], revenueSeries[revenueSeries.length - 1])
  const ordersMoM = pctChange(orderSeries[orderSeries.length - 2], orderSeries[orderSeries.length - 1])

  const totalOrderCount = data.orderStatusDist.reduce((sum, d) => sum + d.count, 0) || 1
  const statusTotal = data.orderStatusDist.reduce((sum, d) => sum + d.count, 0) || 1

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrderCount.toLocaleString(),
      badge: ordersMoM,
      sub: `${s.todayOrders} today`,
      icon: Package,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      sparklineColor: "stroke-emerald-500",
      sparkColor: "#10b981",
      series: orderSeries,
    },
    {
      title: "Total Revenue",
      value: `₹${s.totalRevenue.toLocaleString()}`,
      badge: revenueMoM,
      sub: `₹${s.todayRevenue.toLocaleString()} today`,
      icon: Banknote,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      sparklineColor: "stroke-orange-400",
      sparkColor: "#f97316",
      series: revenueSeries,
    },
    {
      title: "Kitchen Partners",
      value: s.kitchenPartners.toLocaleString(),
      badge: null,
      sub: `${s.pendingKyc} pending KYC`,
      icon: ChefHat,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      sparklineColor: "stroke-emerald-500",
      sparkColor: "#10b981",
      series: [],
    },
    {
      title: "Active Customers",
      value: s.activeCustomers.toLocaleString(),
      badge: null,
      sub: `${s.deliveryPartners} delivery partners`,
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      sparklineColor: "stroke-emerald-500",
      sparkColor: "#10b981",
      series: [],
    },
  ]

  const revenueTrendConfig = {
    revenue: { label: "Total Revenue", color: "#10b981" },
  } satisfies ChartConfig

  const orderStatusConfig = {
    count: { label: "Count" },
    confirmed: { label: "Confirmed", color: "#f59e0b" },
    preparing: { label: "Preparing", color: "#3b82f6" },
    completed: { label: "Completed", color: "#10b981" },
    cancelled: { label: "Cancelled", color: "#ef4444" },
  } satisfies ChartConfig

  const systemOverview = [
    { label: "Active Users", value: s.activeCustomers, icon: Users, alert: false },
    { label: "Active Kitchens", value: s.kitchenPartners, icon: ChefHat, alert: false },
    { label: "Active Delivery Partners", value: s.deliveryPartners, icon: Truck, alert: false },
    { label: "Pending KYC Approvals", value: s.pendingKyc, icon: ShieldAlert, alert: s.pendingKyc > 0 },
    { label: "Open Support Tickets", value: s.openSupportTickets, icon: AlertCircle, alert: s.openSupportTickets > 0 },
    { label: "Low Stock Items", value: s.lowStockItems, icon: AlertCircle, alert: s.lowStockItems > 0 },
  ]

  const issues = [
    { label: "Pending KYC approvals", count: s.pendingKyc },
    { label: "Open support tickets", count: s.openSupportTickets },
    { label: "Low stock items", count: s.lowStockItems },
  ].filter((i) => i.count > 0)

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, Admin! 👋</h2>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your platform today.</p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", stat.iconBg)}>
                <stat.icon className={cn("h-6 w-6", stat.iconColor)} strokeWidth={2} />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                {stat.badge !== null && stat.badge !== undefined ? (
                  <p
                    className={cn(
                      "text-xs font-semibold flex items-center justify-end mt-1",
                      stat.badge >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    <TrendingUp className={cn("h-3 w-3 mr-1", stat.badge < 0 && "rotate-180")} />
                    {Math.abs(stat.badge).toFixed(1)}%
                    <span className="text-slate-400 font-medium ml-1">MoM</span>
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    {stat.sub}
                  </p>
                )}
              </div>
            </div>
            <div className="h-10 mt-4 w-full relative flex items-end">
              {stat.series.length >= 2 ? (
                <Sparkline data={stat.series} color={stat.sparkColor} />
              ) : (
                <p className="text-[10px] font-medium text-slate-300">
                  {stat.series.length === 0 ? "—" : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Revenue Overview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
            </div>
            <span className="text-sm font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              Last 6 months
            </span>
          </div>
          <div className="grid grid-cols-[1fr_200px] gap-8 flex-1">
            <div className="flex flex-col">
              <h2 className="text-3xl font-extrabold text-slate-900">
                ₹{s.totalRevenue.toLocaleString()}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-medium text-slate-500">Total Revenue</span>
                {revenueMoM !== null && (
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full flex items-center",
                      revenueMoM >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}
                  >
                    <TrendingUp className={cn("h-3 w-3 mr-1", revenueMoM < 0 && "rotate-180")} />
                    {Math.abs(revenueMoM).toFixed(1)}% MoM
                  </span>
                )}
              </div>
              <div className="flex-1 mt-6 min-h-[200px]">
                <ChartLineDots
                  data={trend}
                  config={revenueTrendConfig}
                  title=""
                  description=""
                  dataKeys={["revenue"]}
                  xKey="period"
                />
              </div>
            </div>

            {/* Donut Chart — real order status distribution */}
            <div className="flex flex-col justify-center items-center border-l border-slate-100 pl-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4 self-start">Orders by Status</h4>
              <div className="h-[140px] w-full">
                <ChartPieDonut
                  data={data.orderStatusDist}
                  config={orderStatusConfig}
                  title=""
                  description=""
                  dataKey="count"
                  nameKey="status"
                />
              </div>
              <div className="w-full mt-6 space-y-3">
                {data.orderStatusDist.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="font-semibold text-slate-600">{item.status}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {Math.round((item.count / statusTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            </div>
            <Link href="/admin/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent orders</p>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.customer || order.id}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{order.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {order.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">₹{order.amount}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_1fr]">
        {/* Top Kitchen Partners */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">Top Kitchen Partners</h3>
            </div>
            <Link href="/admin/kitchens" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          <div className="space-y-1">
            {data.topKitchens.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No kitchen partners yet</p>
            ) : (
              data.topKitchens.slice(0, 5).map((kitchen, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-slate-900 w-4">{idx + 1}</span>
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                      {kitchen.name ? kitchen.name.charAt(0) : "?"}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{kitchen.name ?? "Unnamed"}</span>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-900">{kitchen.rating?.toFixed(1) ?? "—"}</span>
                      <span className="text-orange-500 text-sm">★</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 w-20 text-right">
                      {kitchen.orders} Orders
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900">System Overview</h3>
          </div>

          <div className="space-y-4">
            {systemOverview.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn("h-4 w-4", item.alert ? "text-rose-500" : "text-slate-500")}
                  />
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                </div>
                <span className={cn("text-sm font-bold", item.alert ? "text-rose-600" : "text-slate-900")}>
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grow Your Platform */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
          <h3 className="text-lg font-bold text-emerald-900">Grow Your Platform</h3>
          <p className="text-sm font-medium text-emerald-700 mt-1">More users, more orders, more growth!</p>

          <div className="absolute right-[-20px] top-10 h-32 w-32 opacity-90 rotate-12">
            <Image src="/admin/rocket.webp" alt="Rocket" fill className="object-contain" />
          </div>

          <div className="mt-auto space-y-3 relative z-10 pt-16">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Invite Kitchen Partners</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Expand your network and offer more variety.</p>
              <Button variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-9 text-xs font-bold">
                Invite Now
              </Button>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-bold text-slate-900">Run Special Offers</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Increase orders with exciting offers & discounts.</p>
              <Link href="/admin/payments/payment-offers">
                <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 h-9 text-xs font-bold">
                  Create Offer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Health Banner */}
      {issues.length > 0 ? (
        <div className="bg-rose-50/70 rounded-xl border border-rose-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-sm font-semibold text-rose-700">
              {issues.length} item{issues.length > 1 ? "s" : ""} need your attention:{" "}
              {issues.map((i) => `${i.count} ${i.label}`).join(", ")}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">
              All systems are running smoothly! No critical issues at the moment.
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 h-9 text-sm font-bold"
          >
            View System Health <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}