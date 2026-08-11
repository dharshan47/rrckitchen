"use client"

import {
  CheckCircle,
  ChefHat,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  AlertCircle,
  Settings,
  Percent,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Wallet,
  Bike,
  ArrowUp,
  ArrowDown,
  Tag
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAdminDashboardData, useAdminDashboardDataQuery } from "@/stores/adminStore"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

function pctChange(prev: number | undefined, last: number | undefined): number | null {
  if (prev === undefined || prev === null || last === undefined || last === null || prev === 0)
    return null
  return ((last - prev) / prev) * 100
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = 100 / (data.length - 1)
  
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: 18 - ((v - min) / range) * 18
  }))

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const polygonPoints = `0,18 ${polylinePoints} 100,18`
  const gradientId = `spark-gradient-${color.replace('#', '')}`

  return (
    <svg viewBox="-2 -2 104 24" preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={polygonPoints}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

/* ------------------------- Skeleton components ------------------------- */

function StatCardsSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-[16px] p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] flex flex-col gap-4"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-[52px] w-[52px] rounded-full" />
            <div className="text-right flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-md mt-2" />
        </div>
      ))}
    </div>
  )
}

function RevenueCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-40 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-64 w-full rounded-xl mt-4" />
        </div>
        <div className="flex flex-col items-center gap-6 md:border-l md:border-[#E5E7EB] md:pl-8">
          <Skeleton className="h-5 w-32 rounded-md self-start" />
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
          <div className="w-full space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-10 rounded-md" />
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
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <Skeleton className="h-6 w-6 rounded-md" />
           <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BottomRowSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.5fr_1fr_1fr]">
      <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <Skeleton className="h-6 w-6 rounded-md" />
             <Skeleton className="h-6 w-40 rounded-md" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6">
        <div className="flex items-center gap-2 mb-8">
           <Skeleton className="h-6 w-6 rounded-md" />
           <Skeleton className="h-6 w-40 rounded-md" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#DCFCE7] rounded-[16px] border border-[#BBF7D0] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md mt-2" />
        <div className="mt-12 space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
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
      <div className="min-h-screen bg-[#FAFAFA] -m-4 p-4 md:-m-8 md:p-8">
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
          <div>
            <Skeleton className="h-10 w-72 rounded-md" />
            <Skeleton className="h-5 w-96 rounded-md mt-2" />
          </div>
          <StatCardsSkeleton />
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-[2fr_1fr]">
            <RevenueCardSkeleton />
            <RecentOrdersSkeleton />
          </div>
          <BottomRowSkeleton />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    notFound()
  }

  const s = data.stats
  const trend = data.revenueTrend || []

  const chartData = trend

  const revenueSeries = chartData.map((t) => t.revenue)
  const orderSeries = chartData.map((t) => t.orders)

  const customerSeries = data.customerTrend || []
  const kitchenSeries = data.kitchenTrend || []
  const deliverySeries = data.deliveryTrend || []

  const revenueMoM = pctChange(revenueSeries[revenueSeries.length - 2], revenueSeries[revenueSeries.length - 1])
  const ordersMoM = pctChange(orderSeries[orderSeries.length - 2], orderSeries[orderSeries.length - 1])
  const customersMoM = pctChange(customerSeries[customerSeries.length - 2], customerSeries[customerSeries.length - 1])
  const kitchensMoM = pctChange(kitchenSeries[kitchenSeries.length - 2], kitchenSeries[kitchenSeries.length - 1])
  const deliveryMoM = pctChange(deliverySeries[deliverySeries.length - 2], deliverySeries[deliverySeries.length - 1])

  const totalOrderCount = data.orderStatusDist.reduce((sum, d) => sum + d.count, 0)

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrderCount.toLocaleString(),
      badge: ordersMoM,
      sub: "vs last month",
      icon: ClipboardList,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#15803D]",
      sparkColor: "#16A34A",
      series: orderSeries,
    },
    {
      title: "Total Revenue",
      value: `₹${s.totalRevenue.toLocaleString()}`,
      badge: revenueMoM,
      sub: "vs last month",
      icon: Wallet,
      iconBg: "bg-[#FFEDD5]",
      iconColor: "text-[#EA580C]",
      sparkColor: "#F97316",
      series: revenueSeries,
    },
    {
      title: "Kitchen Partners",
      value: s.kitchenPartners.toLocaleString(),
      badge: kitchensMoM,
      sub: "vs last month",
      icon: ChefHat,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#15803D]",
      sparkColor: "#16A34A",
      series: kitchenSeries,
    },
    {
      title: "Delivery Partners",
      value: s.deliveryPartners.toLocaleString(),
      badge: deliveryMoM,
      sub: "vs last month",
      icon: Bike,
      iconBg: "bg-[#FFEDD5]",
      iconColor: "text-[#EA580C]",
      sparkColor: "#F97316",
      series: deliverySeries,
    },
    {
      title: "Total Customers",
      value: s.activeCustomers.toLocaleString(),
      badge: customersMoM,
      sub: "vs last month",
      icon: Users,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#15803D]",
      sparkColor: "#16A34A",
      series: customerSeries,
    },
  ]

  const paymentSources = data.paymentSources || []
  const paymentSourceTotal = paymentSources.reduce((sum, p) => sum + p.value, 0)
  const donutColors = ["#15803D", "#F97316", "#6B7280", "#94A3B8", "#D97706"]
  const donutData = paymentSources.slice(0, 5).map((p, i) => ({
    name: p.name,
    value: paymentSourceTotal > 0 ? Math.round((p.value / paymentSourceTotal) * 1000) / 10 : 0,
    fill: donutColors[i % donutColors.length],
  }))

  const systemOverview = [
    { label: "Active Users", value: s.activeCustomers, icon: Users, iconColor: "text-[#6B7280]", countColor: "text-[#111827]", badge: customersMoM },
    { label: "Active Kitchens", value: s.kitchenPartners, icon: ChefHat, iconColor: "text-[#6B7280]", countColor: "text-[#111827]", badge: kitchensMoM },
    { label: "Active Delivery Partners", value: s.deliveryPartners, icon: Bike, iconColor: "text-[#6B7280]", countColor: "text-[#111827]", badge: deliveryMoM },
    { label: "Pending KYC Approvals", value: s.pendingKyc, icon: Users, iconColor: "text-[#F97316]", countColor: "text-[#EA580C]" },
    { label: "Open Support Tickets", value: s.openSupportTickets, icon: AlertCircle, iconColor: "text-[#15803D]", countColor: "text-[#15803D]" },
    { label: "Low Stock Items", value: s.lowStockItems, icon: Tag, iconColor: "text-[#DC2626]", countColor: "text-[#DC2626]" },
  ]

  const getStatusDetails = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver') && !s.includes('out')) return { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', label: 'Delivered', icon: ShoppingBag, iconColor: 'text-[#15803D]', iconBg: 'bg-[#DCFCE7]' };
    if (s.includes('prepar')) return { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', label: 'Preparing', icon: ShoppingBag, iconColor: 'text-[#EA580C]', iconBg: 'bg-[#FFEDD5]' };
    if (s.includes('out')) return { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', label: 'Out for Delivery', icon: Bike, iconColor: 'text-[#15803D]', iconBg: 'bg-[#DCFCE7]' };
    if (s.includes('confirm')) return { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', label: 'Confirmed', icon: ShoppingBag, iconColor: 'text-[#EA580C]', iconBg: 'bg-[#FFEDD5]' };
    if (s.includes('cancel')) return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Cancelled', icon: Tag, iconColor: 'text-[#DC2626]', iconBg: 'bg-[#FEE2E2]' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', label: status, icon: ShoppingBag, iconColor: 'text-gray-600', iconBg: 'bg-gray-100' };
  }

  const recentOrders = data.recentOrders

  return (
    <div className="min-h-screen bg-[#FAFAFA] -m-4 p-4 md:-m-8 md:p-8 font-sans">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div>
          <h2 className="text-[28px] md:text-[40px] font-bold tracking-tight text-[#111827] flex items-center gap-2 leading-tight">Welcome back, Admin! 👋</h2>
          <p className="text-[14px] md:text-[15px] text-[#6B7280] mt-1">Here&apos;s what&apos;s happening with your platform today.</p>
        </div>

        {/* Top 5 KPI Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-[16px] p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={cn("h-[52px] w-[52px] rounded-full flex items-center justify-center shrink-0", stat.iconBg)}>
                    <stat.icon className={cn("h-6 w-6", stat.iconColor)} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[14px] md:text-[15px] font-semibold text-[#6B7280]">{stat.title}</p>
                    <h3 className="text-[28px] lg:text-[34px] font-bold text-[#111827] mt-1 leading-none">{stat.value}</h3>
                    <p
                      className={cn(
                        "text-[13px] font-bold flex items-center mt-2",
                        stat.badge !== null && stat.badge >= 0 ? "text-[#15803D]" : "text-rose-500"
                      )}
                    >
                      {stat.badge !== null ? (
                        <>
                          {stat.badge >= 0 ? <ArrowUp className="h-4 w-4 mr-1" strokeWidth={3} /> : <ArrowDown className="h-4 w-4 mr-1" strokeWidth={3} />}
                          {Math.abs(stat.badge).toFixed(1)}%
                          <span className="text-[#6B7280] font-medium ml-1.5">{stat.sub}</span>
                        </>
                      ) : (
                        <span className="text-[#6B7280] font-medium">No prior month data</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-10 mt-6 w-full relative flex items-end">
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

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[2fr_1fr]">
          {/* Revenue Overview */}
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-[#15803D]" strokeWidth={2.5} />
                <h3 className="text-[18px] md:text-[22px] font-semibold text-[#111827]">Revenue Overview</h3>
              </div>
              <button className="flex items-center gap-1 md:gap-2 text-[13px] md:text-[14px] font-semibold text-[#374151] border border-[#E5E7EB] rounded-lg px-3 py-1.5 md:px-4 md:py-2 hover:bg-gray-50 transition-colors">
                This Week <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 flex-1">
              <div className="flex flex-col">
                <h2 className="text-[28px] md:text-[34px] font-bold text-[#111827] leading-none">
                  ₹{s.totalRevenue.toLocaleString()}
                </h2>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                  <span className="text-[14px] md:text-[15px] font-medium text-[#6B7280]">Total Revenue</span>
                  {revenueMoM !== null && (
                    <span
                      className={cn(
                        "text-[13px] font-bold px-2.5 py-1 rounded-[999px] flex items-center",
                        revenueMoM >= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {revenueMoM >= 0 ? <ArrowUp className="h-3.5 w-3.5 mr-1" strokeWidth={3} /> : <ArrowDown className="h-3.5 w-3.5 mr-1" strokeWidth={3} />}
                      {Math.abs(revenueMoM).toFixed(1)}% vs last week
                    </span>
                  )}
                </div>
                <div className="flex-1 mt-8 min-h-[250px] w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgba(22,163,74,.25)" />
                          <stop offset="95%" stopColor="rgba(22,163,74,0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="period" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
                        tickFormatter={(value) => value === 0 ? '₹0' : `₹${value >= 100000 ? (value / 100000) + 'L' : value}`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: '12px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                        itemStyle={{ color: '#16A34A', fontWeight: 700 }}
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                        cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#16A34A" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="flex flex-col items-center md:border-l md:border-[#E5E7EB] md:pl-8">
                <h4 className="text-[15px] font-bold text-[#111827] self-start mb-6">Revenue by Source</h4>
                {donutData.length === 0 ? (
                  <div className="h-[160px] w-full flex flex-col items-center justify-center gap-3">
                    <Wallet className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
                    <p className="text-[13px] font-medium text-[#6B7280]">No payment data yet</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[160px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full mt-8 space-y-4">
                      {donutData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }}></div>
                            <span className="text-[13px] font-medium text-[#374151]">{item.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[#111827]">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-[#15803D]" strokeWidth={2.5} />
                <h3 className="text-[22px] font-semibold text-[#111827]">Recent Orders</h3>
              </div>
              <Link href="/admin/orders" className="text-[15px] font-bold text-[#15803D] hover:text-[#166534]">
                View All
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] font-medium text-[#6B7280]">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const details = getStatusDetails(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors group cursor-pointer border-b border-[#F3F4F6] last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", details.iconBg)}>
                          <details.icon className={cn("h-5 w-5", details.iconColor)} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[14px] md:text-[15px] font-bold text-[#111827]">{order.id}</p>
                          <p className="text-[12px] md:text-[13px] font-medium text-[#6B7280] mt-0.5 whitespace-nowrap">{order.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-6">
                        <span className={cn("text-[11px] md:text-[13px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-[999px] whitespace-nowrap", details.bg, details.text)}>
                          {details.label}
                        </span>
                        <div className="flex items-center gap-1 md:gap-3 w-12 md:w-16 justify-end">
                          <span className="text-[14px] md:text-[15px] font-bold text-[#111827]">₹{order.amount}</span>
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#9CA3AF] group-hover:text-[#15803D] transition-colors hidden sm:block" />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.5fr_1fr_1fr]">
          {/* Top Kitchen Partners */}
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-[#15803D]" strokeWidth={2.5} />
                <h3 className="text-[18px] md:text-[22px] font-semibold text-[#111827]">Top Kitchen Partners</h3>
              </div>
              <Link href="/admin/kitchens" className="text-[14px] md:text-[15px] font-bold text-[#15803D] hover:text-[#166534]">
                View All
              </Link>
            </div>

            <div className="space-y-1">
              {data.topKitchens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] font-medium text-[#6B7280]">No kitchen partners yet</p>
                </div>
              ) : (
                data.topKitchens.slice(0, 5).map((kitchen, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[15px] font-extrabold text-[#111827] w-4">{idx + 1}</span>
                      <div className="h-10 w-10 rounded-[999px] bg-[#111827] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                        {kitchen.name ? kitchen.name.charAt(0) : "?"}
                      </div>
                      <span className="text-[15px] font-bold text-[#111827]">{kitchen.name ?? "Unnamed"}</span>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-1">
                        <span className="text-[#F59E0B] text-[15px]">★</span>
                        <span className="text-[15px] font-bold text-[#111827]">{kitchen.rating?.toFixed(1) ?? "—"}</span>
                      </div>
                      <span className="text-[13px] font-medium text-[#6B7280] w-20 text-right">
                        {kitchen.orders} Orders
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Overview */}
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-[#15803D]" strokeWidth={2.5} />
              <h3 className="text-[22px] font-semibold text-[#111827]">System Overview</h3>
            </div>

            <div className="space-y-4">
              {systemOverview.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn("h-5 w-5", item.iconColor)}
                      strokeWidth={2}
                    />
                    <span className="text-[15px] font-medium text-[#374151]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.badge !== null && item.badge !== undefined ? (
                      <>
                        <span className="text-[15px] font-bold text-[#111827]">{item.value.toLocaleString()}</span>
                        <span className={cn("text-[13px] font-bold flex items-center", item.badge >= 0 ? "text-[#15803D]" : "text-rose-500")}>
                          {item.badge >= 0 ? <ArrowUp className="h-3.5 w-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDown className="h-3.5 w-3.5 mr-0.5" strokeWidth={3} />}
                          {Math.abs(item.badge).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className={cn("text-[15px] font-bold", item.countColor)}>
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grow Your Platform */}
          <div className="bg-[#DCFCE7] rounded-[16px] border border-[#BBF7D0] shadow-[0_2px_8px_rgba(15,23,42,.05)] p-6 flex flex-col relative overflow-hidden">
            <h3 className="text-[22px] font-bold text-[#15803D]">Grow Your Platform</h3>
            <p className="text-[15px] font-medium text-[#166534] mt-1">More users, more orders, more growth!</p>

            <div className="absolute right-[-10px] top-4 h-32 w-32 opacity-95">
              <Image src="/admin/rocket.webp" alt="Rocket" fill className="object-contain" />
            </div>

            <div className="mt-auto flex flex-col sm:flex-row lg:flex-col gap-4 relative z-10 pt-16">
              <div className="bg-white rounded-[14px] p-4 flex-1 shadow-[0_2px_8px_rgba(15,23,42,.05)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#DCFCE7] p-1.5 rounded-md">
                     <ChefHat className="h-4 w-4 text-[#15803D]" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#111827]">Invite Kitchen Partners</h4>
                </div>
                <p className="text-[13px] font-medium text-[#6B7280] mb-4">Expand your network and offer more variety.</p>
                <Button className="w-full bg-white text-[#15803D] border border-[#15803D] hover:bg-gray-50 h-[44px] rounded-[12px] text-[15px] font-bold shadow-sm">
                  Invite Now
                </Button>
              </div>

              <div className="bg-white rounded-[14px] p-4 flex-1 shadow-[0_2px_8px_rgba(15,23,42,.05)]">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-[#FFEDD5] p-1.5 rounded-md">
                     <Percent className="h-4 w-4 text-[#EA580C]" strokeWidth={2.5} />
                   </div>
                  <h4 className="text-[15px] font-bold text-[#111827]">Run Special Offers</h4>
                </div>
                <p className="text-[13px] font-medium text-[#6B7280] mb-4">Increase orders with exciting offers & discounts.</p>
                <Link href="/admin/payments/payment-offers">
                  <Button className="w-full bg-white text-[#EA580C] border border-[#EA580C] hover:bg-gray-50 h-[44px] rounded-[12px] text-[15px] font-bold shadow-sm">
                    Create Offer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Health Banner */}
        <div className="bg-[#FAFAFA] rounded-[16px] border border-[#E5E7EB] p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,.05)] mt-2">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-[999px] bg-[#DCFCE7] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-[#15803D]" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] font-semibold text-[#374151]">
              All systems are running smoothly! No critical issues at the moment.
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-[#374151] hover:bg-gray-100 hover:text-[#111827] h-[44px] rounded-[12px] text-[15px] font-bold border border-[#E5E7EB] px-4"
          >
            View System Health <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}