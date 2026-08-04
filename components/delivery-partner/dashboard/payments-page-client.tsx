"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDeliveryPaymentsData } from "@/actions/delivery/payments"
import { useDeliveryPayments, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  Percent,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronDown,
  Gift,
  Heart,
  CalendarIcon,
  Star
} from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format, startOfWeek, startOfMonth, subDays, addDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

function formatRelativeTime(dateStr: number): string {
  const diff = Date.now() - dateStr
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function PaymentsPageClient() {
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const activeRange = customRange ?? { from: weekStart, to: now }
  const isCustomRange = customRange !== null
  const nextPayout = addDays(weekStart, 1)
  const nextPayoutDate = now > nextPayout ? addDays(nextPayout, 7) : nextPayout

  const payments = useDeliveryPayments()
  const { setPayments } = useDeliveryActions()

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["delivery-payments", activeRange.from.toDateString(), activeRange.to.toDateString()],
    queryFn: () =>
      getDeliveryPaymentsData({
        from: activeRange.from.toISOString(),
        to: activeRange.to.toISOString(),
      }),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (data) setPayments(data)
  }, [data, setPayments])

  const resolvedData = payments ?? data

  if (isLoading || !resolvedData) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300 pb-12" role="status" aria-label="Loading payments">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-52 rounded-xl" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none border-slate-100 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="text-right space-y-2">
                    <Skeleton className="h-3 w-28 ml-auto" />
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Overview + Payment Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-8 w-28 rounded-xl" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col md:flex-row gap-8 pt-4 px-6 pb-6">
              <div className="flex flex-col min-w-[140px] space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-32" />
                <div className="space-y-3 mt-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex-1 h-[240px] md:h-auto min-h-[240px] flex items-end gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${30 + ((i * 29) % 60)}%` }}
                  />
                ))}
              </div>
            </CardContent>
            <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>

          <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </CardHeader>
            <CardContent className="flex-1 pt-2 px-6 pb-6 space-y-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              ))}
              <Skeleton className="h-11 w-full mt-6 rounded-xl" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Payouts + Payout Summary */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="flex gap-6 px-6 py-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24 ml-auto" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-6 px-6 py-4">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-3.5 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-slate-100 rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="flex items-center justify-center gap-8 mb-8">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className="h-28 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>

        {/* Transactions + How You Earn */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-3 w-28" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="flex gap-6 px-6 py-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-6 px-6 py-4">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3.5 w-16 ml-auto" />
                  </div>
                ))}
              </div>
              <div className="p-4 flex justify-center border-t border-slate-100">
                <Skeleton className="h-10 w-40 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2 flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ))}
              <Skeleton className="h-16 w-full rounded-2xl mt-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { stats, weeklyEarningsTrend, kyc, recentPayouts, payoutSummary, transactions } = resolvedData

  const thisWeekChange = stats.lastWeekEarnings > 0 
    ? Math.round(((stats.thisWeekEarnings - stats.lastWeekEarnings) / stats.lastWeekEarnings) * 100) 
    : null
  
  const thisMonthChange = stats.lastMonthEarnings > 0
    ? Math.round(((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings) * 100)
    : null

  const rangeChange = stats.prevRangeEarnings > 0
    ? Math.round(((stats.rangeEarnings - stats.prevRangeEarnings) / stats.prevRangeEarnings) * 100)
    : null

  const earningsValue = isCustomRange ? stats.rangeEarnings : stats.thisWeekEarnings
  const earningsChange = isCustomRange ? rangeChange : thisWeekChange
  const earningsCompareLabel = isCustomRange ? "vs previous period" : "vs last week"

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Payments & Earnings</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Track your earnings, payouts and payment details from RRC Kitchen.</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 text-sm font-semibold text-slate-600 border-slate-200 rounded-xl px-4 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                {format(activeRange.from, "dd MMM yyyy")} - {format(activeRange.to, "dd MMM yyyy")}
                <ChevronDown className="h-4 w-4 ml-1 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">Select Date Range</span>
                {isCustomRange && (
                  <button
                    onClick={() => { setCustomRange(null); setPickerOpen(false) }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Reset to This Week
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { label: "This Week", range: { from: weekStart, to: now } },
                  { label: "Last 7 Days", range: { from: subDays(now, 6), to: now } },
                  { label: "This Month", range: { from: startOfMonth(now), to: now } },
                  { label: "Last 30 Days", range: { from: subDays(now, 29), to: now } },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => { setCustomRange(preset.range); setPickerOpen(false) }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                      activeRange.from.getTime() === preset.range.from.getTime() && activeRange.to.getTime() === preset.range.to.getTime()
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <Calendar
                mode="range"
                selected={{ from: activeRange.from, to: activeRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setCustomRange({ from: range.from, to: range.to })
                    setPickerOpen(false)
                  }
                }}
                numberOfMonths={2}
                className="rounded-xl border border-slate-200"
              />
            </PopoverContent>
          </Popover>
          <span className="hidden md:block text-xs font-medium text-slate-400">
            Updated {formatRelativeTime(dataUpdatedAt)}
          </span>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* This Week's Earnings */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                 <Wallet className="h-6 w-6 text-emerald-600" />
               </div>
               <div className="text-right">
                 <span className="text-xs font-semibold text-slate-500 block mb-1">{isCustomRange ? "Selected Range Earnings" : "This Week&apos;s Earnings"}</span>
                 <div className="text-3xl font-bold text-slate-900">₹{earningsValue.toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-bold flex items-center mt-auto">
               {earningsChange === null ? (
                  <span className="text-slate-400 font-medium">New</span>
                ) : earningsChange >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" /> {earningsChange}% <span className="text-slate-400 font-medium ml-1">{earningsCompareLabel}</span>
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1 rotate-180" /> {Math.abs(earningsChange)}% <span className="text-slate-400 font-medium ml-1">{earningsCompareLabel}</span>
                  </span>
                )}
             </div>
          </CardContent>
        </Card>

        {/* This Month's Earnings */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                 <Banknote className="h-6 w-6 text-blue-600" />
               </div>
               <div className="text-right">
                 <span className="text-xs font-semibold text-slate-500 block mb-1">{isCustomRange ? "Selected Range Payouts" : "This Month&apos;s Earnings"}</span>
                 <div className="text-3xl font-bold text-slate-900">₹{(isCustomRange ? stats.rangeSettledPayouts : stats.thisMonthEarnings).toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-bold flex items-center mt-auto">
               {isCustomRange ? (
                  <span className="text-slate-400 font-medium">{stats.rangeCount} payout{stats.rangeCount === 1 ? "" : "s"} in range</span>
                ) : thisMonthChange === null ? (
                  <span className="text-slate-400 font-medium">New</span>
                ) : thisMonthChange >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" /> {thisMonthChange}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1 rotate-180" /> {Math.abs(thisMonthChange)}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                  </span>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Total Commission */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                 <Percent className="h-6 w-6 text-orange-500" />
               </div>
               <div className="text-right">
                 <span className="text-xs font-semibold text-slate-500 block mb-1">{isCustomRange ? "Range Commission (10%)" : "Total Commission (10%)"}</span>
                 <div className="text-3xl font-bold text-slate-900">₹{(isCustomRange ? stats.rangeCommission : stats.totalCommission).toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-medium text-slate-400 mt-auto">
               {isCustomRange ? "In selected range" : "All time"}
             </div>
          </CardContent>
        </Card>

        {/* Total Payouts */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                 <Banknote className="h-6 w-6 text-purple-600" />
               </div>
               <div className="text-right">
                 <span className="text-xs font-semibold text-slate-500 block mb-1">Total Payouts</span>
                 <div className="text-3xl font-bold text-slate-900">₹{stats.totalSettledPayouts.toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-medium text-slate-400 mt-auto">
               All time payments
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Earnings Overview */}
        <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Earnings Overview</h2>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-slate-600 border-slate-200 rounded-xl px-3 hover:bg-slate-50 shadow-sm">
              {isCustomRange ? "Selected Range" : "This Week"} <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col md:flex-row gap-8 pt-4 px-6 pb-6">
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs font-semibold text-slate-500 mb-1">Total Earnings</span>
              <span className="text-4xl font-extrabold text-slate-900 mb-8">₹{stats.rangeEarnings.toLocaleString('en-IN')}</span>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-500 w-24">Delivery Earnings</span>
                  <span className="text-sm font-bold text-slate-800">₹{stats.rangeEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="text-xs font-medium text-slate-500 w-24">Incentives</span>
                  <span className="text-sm font-bold text-slate-800">₹0</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-xs font-medium text-slate-500 w-24">Tips</span>
                  <span className="text-sm font-bold text-slate-800">₹0</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 h-[240px] md:h-auto min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyEarningsTrend} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValuePayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value) => [`₹${Number(value ?? 0)}`, 'Earnings']}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                    dy={10}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValuePayments)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 rounded-b-3xl">
             <div className="flex items-center gap-2">
                 <AlertCircle className="h-4 w-4 text-emerald-600" />
                 Earnings are calculated after platform commission (10%).
             </div>
             <Button variant="ghost" size="sm" className="h-auto p-0 text-emerald-600 hover:text-emerald-700 hover:bg-transparent font-bold">
                 View Earnings Details &rarr;
             </Button>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
             <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Payment Details</h2>
             </div>
             <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                 <CheckCircle2 className="h-3 w-3" /> Verified
             </div>
          </CardHeader>
          <CardContent className="flex-1 pt-2 px-6 pb-6 flex flex-col justify-between">
             <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Bank Name</span>
                     <span className="font-bold text-slate-900">{kyc?.bankName || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Account Holder</span>
                     <span className="font-bold text-slate-900">{kyc?.accountHolderName || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Account Number</span>
                     <span className="font-bold text-slate-900">{kyc?.bankAccountNumber || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">IFSC Code</span>
                     <span className="font-bold text-slate-900">{kyc?.ifscCode || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">UPI ID</span>
                     <span className="font-bold text-slate-900">{kyc?.upiId || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Google Pay</span>
                     <span className="font-bold text-slate-900">{kyc?.googlePayNumber || '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">PhonePe</span>
                     <span className="font-bold text-slate-900">{kyc?.phonePeNumber || '—'}</span>
                 </div>
             </div>
             
             <Button variant="outline" className="w-full mt-6 h-11 border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl">
                 <Banknote className="h-4 w-4 mr-2" /> Manage Bank Details
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tables & Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Recent Payouts */}
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-slate-700" />
                    <h2 className="text-base font-bold text-slate-900">Recent Payouts</h2>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-emerald-600 hover:text-emerald-700 hover:bg-transparent font-bold text-xs">
                 View All Payouts &rarr;
                </Button>
             </CardHeader>
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="text-xs font-semibold text-slate-500 bg-slate-50/50">
                             <tr>
                                 <th className="px-6 py-3 font-semibold">Payout ID</th>
                                 <th className="px-6 py-3 font-semibold">Amount</th>
                                 <th className="px-6 py-3 font-semibold">Date</th>
                                 <th className="px-6 py-3 font-semibold">Status</th>
                                 <th className="px-6 py-3 font-semibold text-right">Method</th>
                                 <th className="px-6 py-3"></th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {recentPayouts.length === 0 ? (
                                 <tr><td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No recent payouts</td></tr>
                             ) : recentPayouts.map((payout, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{payout.id}</td>
                                     <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">₹{payout.amount.toLocaleString('en-IN')}</td>
                                     <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{payout.date}</td>
                                     <td className="px-6 py-4">
                                         <span className={cn(
                                             "px-2.5 py-1 rounded-md text-[11px] font-bold inline-block",
                                             payout.status === 'Paid' ? "bg-emerald-50 text-emerald-600" :
                                             payout.status === 'Pending' ? "bg-orange-50 text-orange-600" :
                                             "bg-purple-50 text-purple-600"
                                         )}>
                                             {payout.status}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-slate-500 font-medium text-right flex items-center justify-end gap-1.5 whitespace-nowrap">
                                         <Banknote className="h-3.5 w-3.5" /> {payout.method}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full">
                                             <Download className="h-4 w-4" />
                                         </Button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </CardContent>
          </Card>

          {/* Payout Summary */}
          <Card className="shadow-none border-slate-100 rounded-3xl">
             <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                 <Wallet className="h-5 w-5 text-slate-700" />
                 <h2 className="text-base font-bold text-slate-900">Payout Summary</h2>
             </CardHeader>
             <CardContent className="px-6 pb-6 pt-2">
                 <div className="flex items-center justify-center gap-8 mb-8">
                     <div className="h-32 w-32 relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={payoutSummary}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={60}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {payoutSummary.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                             </PieChart>
                          </ResponsiveContainer>
                     </div>
                     <div className="space-y-4">
                         {payoutSummary.map((item, i) => (
                             <div key={i} className="flex flex-col">
                                 <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-0.5">
                                     <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                     {item.name}
                                 </div>
                                 <div className="text-sm font-bold text-slate-900 pl-4">
                                     ₹{item.value.toLocaleString('en-IN')}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-start border border-slate-100">
                     <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                         <CalendarIcon className="h-5 w-5 text-emerald-600" />
                     </div>
                     <div>
                         <div className="font-bold text-slate-900 text-sm mb-1">Next Payout</div>
                         <div className="text-xs text-slate-500 font-medium mb-1">Expected on</div>
                         <div className="text-sm font-extrabold text-slate-900 mb-1">{format(nextPayoutDate, "dd MMM yyyy")}</div>
                         <div className="text-[11px] font-bold text-emerald-600">Estimated Amount: ₹{stats.rangeEarnings.toLocaleString('en-IN')}</div>
                     </div>
                 </div>
             </CardContent>
          </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Transaction History */}
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-slate-700" />
                    <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-emerald-600 hover:text-emerald-700 hover:bg-transparent font-bold text-xs">
                 View All Transactions &rarr;
                </Button>
             </CardHeader>
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="text-xs font-semibold text-slate-500 bg-slate-50/50">
                             <tr>
                                 <th className="px-6 py-3 font-semibold">Date & Time</th>
                                 <th className="px-6 py-3 font-semibold">Description</th>
                                 <th className="px-6 py-3 font-semibold">Type</th>
                                 <th className="px-6 py-3 font-semibold text-right">Amount</th>
                                 <th className="px-6 py-3 font-semibold text-right">Balance</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {transactions.length === 0 ? (
                                 <tr><td colSpan={5} className="text-center py-8 text-slate-500 font-medium">No recent transactions</td></tr>
                             ) : transactions.map((tx, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{tx.date}</td>
                                     <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{tx.description}</td>
                                     <td className="px-6 py-4 text-slate-500 font-medium">{tx.type}</td>
                                     <td className={cn(
                                         "px-6 py-4 font-bold text-right whitespace-nowrap",
                                         tx.amount > 0 ? "text-emerald-600" : "text-red-500"
                                     )}>
                                         {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                     </td>
                                     <td className="px-6 py-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                         ₹{tx.balance.toLocaleString('en-IN')}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 <div className="p-4 flex justify-center border-t border-slate-100">
                    <Button variant="outline" className="h-10 text-sm font-semibold text-slate-600 border-slate-200 rounded-xl px-6 hover:bg-slate-50 shadow-sm">
                       Load More <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
                    </Button>
                 </div>
             </CardContent>
          </Card>

          {/* How You Earn */}
          <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
             <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                 <AlertCircle className="h-5 w-5 text-slate-700" />
                 <h2 className="text-base font-bold text-slate-900">How You Earn</h2>
             </CardHeader>
             <CardContent className="px-6 pb-6 pt-2 flex flex-col gap-6">
                 <div className="flex gap-4">
                     <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                         <Wallet className="h-5 w-5 text-emerald-600" />
                     </div>
                     <div>
                         <div className="font-bold text-slate-900 text-sm mb-0.5">Delivery Earnings</div>
                         <div className="text-xs font-medium text-slate-500">Earn for every successful delivery</div>
                     </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                         <Gift className="h-5 w-5 text-orange-600" />
                     </div>
                     <div>
                         <div className="font-bold text-slate-900 text-sm mb-0.5">Incentives</div>
                         <div className="text-xs font-medium text-slate-500">Extra earnings for peak hours</div>
                     </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                         <Heart className="h-5 w-5 text-purple-600" />
                     </div>
                     <div>
                         <div className="font-bold text-slate-900 text-sm mb-0.5">Tips</div>
                         <div className="text-xs font-medium text-slate-500">Tips from happy customers</div>
                     </div>
                 </div>
                 <div className="flex gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                         <CalendarIcon className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                         <div className="font-bold text-slate-900 text-sm mb-0.5">Weekly Payouts</div>
                         <div className="text-xs font-medium text-slate-500">Get paid every Tuesday</div>
                     </div>
                 </div>

                 <div className="bg-orange-50/50 rounded-2xl p-4 flex gap-4 items-center border border-orange-100 mt-auto">
                     <Star className="h-6 w-6 text-orange-500 flex-shrink-0 fill-orange-500" />
                     <div className="font-bold text-slate-900 text-xs leading-relaxed">
                         Keep delivering great service to earn more and get tips!
                     </div>
                 </div>
             </CardContent>
          </Card>
      </div>

    </div>
  )
}
