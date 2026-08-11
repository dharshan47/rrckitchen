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
  Landmark,
  CreditCard,
  CircleCheck,
  Pencil,
  WalletCards,
  Download,
  Receipt,
  Gift,
  Heart,
  ChevronDown,
  Star,
  ChartNoAxesCombined,
  ArrowRight
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
  CartesianGrid
} from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format, startOfWeek, startOfMonth, subDays, addDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

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
      <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300 pb-12 bg-[#FCFCFC]" role="status" aria-label="Loading payments">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-52 rounded-[6px]" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] p-6">
              <div className="flex justify-between items-start mb-6">
                <Skeleton className="h-[48px] w-[48px] rounded-full" />
                <div className="text-right space-y-2">
                  <Skeleton className="h-3 w-28 ml-auto" />
                  <Skeleton className="h-8 w-24 ml-auto" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-20" />
            </Card>
          ))}
        </div>

        {/* Middle Section: Earnings Overview + Payment Details */}
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#ECEFF1]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-8 w-24 rounded-[6px]" />
            </div>
            <div className="flex flex-col md:flex-row gap-8 p-6">
              <div className="flex flex-col min-w-[140px]">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-28 mb-8" />
                <div className="space-y-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="flex-1 h-[240px]" />
            </div>
            <div className="bg-[#F0F8F1] px-6 py-[14px] flex items-center justify-between">
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
          <Card className="shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] p-6">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-[6px]" />
            </div>
            <div className="space-y-[18px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-[6px] mt-8" />
          </Card>
        </div>

        {/* Recent Payouts + Payout Summary */}
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#ECEFF1]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#ECEFF1] pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] p-6">
            <div className="px-1 pb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="h-[120px] w-[120px] rounded-full" />
              <div className="flex-1 w-full space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-[#ECEFF1] rounded-[8px] p-4 flex gap-4 items-start mt-6">
              <Skeleton className="h-9 w-9 rounded-[6px]" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#ECEFF1]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#ECEFF1] pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
            <div className="p-6 flex justify-center">
              <Skeleton className="h-9 w-32 rounded-[6px]" />
            </div>
          </Card>
          <Card className="shadow-none border-[#E6EAEC] bg-[#FFFFFF] rounded-[10px] p-6">
            <div className="px-1 pb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-[10px]" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
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

  const summaryTotal = payoutSummary.reduce((sum, p) => sum + p.value, 0)
  const summaryPercent = (i: number) =>
    summaryTotal > 0 ? Math.round(((payoutSummary[i]?.value ?? 0) / summaryTotal) * 100) : 0

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12 bg-[#FCFCFC] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#111827]">Payments & Earnings</h1>
          <p className="text-[#374151] mt-1 text-[14px] md:text-[15px]">Track your earnings, payouts and payment details from RRC Kitchen.</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 text-[13px] font-medium text-[#111827] border-[#E6EAEC] bg-[#FFFFFF] rounded-[6px] px-4 hover:bg-[#F7FAF8] shadow-none flex items-center gap-2">
                <CalendarDays className="h-[15px] w-[15px] text-[#111827]" strokeWidth={1.8} />
                {format(activeRange.from, "dd MMM yyyy")} - {format(activeRange.to, "dd MMM yyyy")}
                <ChevronDown className="h-[14px] w-[14px] ml-1 text-[#111827]" strokeWidth={1.8} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-4 rounded-[10px] shadow-[0_12px_30px_rgba(17,24,39,0.10)] border-[#E6EAEC] bg-[#FFFFFF]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold text-[#111827]">Select Date Range</span>
                {isCustomRange && (
                  <button
                    onClick={() => { setCustomRange(null); setPickerOpen(false) }}
                    className="text-[12px] font-bold text-[#087B2B] hover:text-[#066B25] transition-colors"
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
                      "px-3 py-1.5 rounded-[6px] text-[12px] font-medium border transition-colors",
                      activeRange.from.getTime() === preset.range.from.getTime() && activeRange.to.getTime() === preset.range.to.getTime()
                        ? "bg-[#EEF8F0] border-[#B9DDBF] text-[#087B2B]"
                        : "bg-[#FCFCFC] border-[#E6EAEC] text-[#374151] hover:border-[#B9DDBF] hover:text-[#087B2B]"
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
                className="rounded-[8px] border border-[#E6EAEC]"
              />
            </PopoverContent>
          </Popover>
          <span className="hidden md:block text-[12px] font-medium text-[#6B7280]">
            Updated {formatRelativeTime(dataUpdatedAt)}
          </span>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* This Week's Earnings */}
        <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-[48px] w-[48px] rounded-full bg-[#E6F5E9] flex items-center justify-center shrink-0">
                 <Wallet className="h-[22px] w-[22px] text-[#087B2B]" strokeWidth={1.8} />
               </div>
               <div className="text-right">
                 <span className="text-[13px] font-medium text-[#374151] block mb-1">{isCustomRange ? "Selected Range Earnings" : "This Week's Earnings"}</span>
                 <div className="text-[24px] font-bold text-[#111827]">₹{earningsValue.toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-bold flex items-center mt-auto">
               {earningsChange === null ? (
                  <span className="text-[#6B7280] font-medium">New</span>
                ) : earningsChange >= 0 ? (
                  <span className="text-[#16A34A] flex items-center">
                    <TrendingUp className="h-[14px] w-[14px] mr-1" strokeWidth={2} /> {earningsChange}% <span className="text-[#6B7280] font-medium ml-1">{earningsCompareLabel}</span>
                  </span>
                ) : (
                  <span className="text-[#EF2020] flex items-center">
                    <TrendingUp className="h-[14px] w-[14px] mr-1 rotate-180" strokeWidth={2} /> {Math.abs(earningsChange)}% <span className="text-[#6B7280] font-medium ml-1">{earningsCompareLabel}</span>
                  </span>
                )}
             </div>
          </CardContent>
        </Card>

        {/* This Month's Earnings */}
        <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-[48px] w-[48px] rounded-full bg-[#EAF3FF] flex items-center justify-center shrink-0">
                 <Wallet className="h-[22px] w-[22px] text-[#1677E8]" strokeWidth={1.8} />
               </div>
               <div className="text-right">
                 <span className="text-[13px] font-medium text-[#374151] block mb-1">{isCustomRange ? "Selected Range Payouts" : "This Month's Earnings"}</span>
                 <div className="text-[24px] font-bold text-[#111827]">₹{(isCustomRange ? stats.rangeSettledPayouts : stats.thisMonthEarnings).toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-bold flex items-center mt-auto">
               {isCustomRange ? (
                  <span className="text-[#6B7280] font-medium">{stats.rangeCount} payout{stats.rangeCount === 1 ? "" : "s"} in range</span>
                ) : thisMonthChange === null ? (
                  <span className="text-[#6B7280] font-medium">New</span>
                ) : thisMonthChange >= 0 ? (
                  <span className="text-[#16A34A] flex items-center">
                    <TrendingUp className="h-[14px] w-[14px] mr-1" strokeWidth={2} /> {thisMonthChange}% <span className="text-[#6B7280] font-medium ml-1">vs last month</span>
                  </span>
                ) : (
                  <span className="text-[#EF2020] flex items-center">
                    <TrendingUp className="h-[14px] w-[14px] mr-1 rotate-180" strokeWidth={2} /> {Math.abs(thisMonthChange)}% <span className="text-[#6B7280] font-medium ml-1">vs last month</span>
                  </span>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Total Commission */}
        <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-[48px] w-[48px] rounded-full bg-[#FFF1DF] flex items-center justify-center shrink-0">
                 <Percent className="h-[22px] w-[22px] text-[#FF8500]" strokeWidth={1.8} />
               </div>
               <div className="text-right">
                 <span className="text-[13px] font-medium text-[#374151] block mb-1">{isCustomRange ? "Range Commission (10%)" : "Total Commission (10%)"}</span>
                 <div className="text-[24px] font-bold text-[#111827]">₹{(isCustomRange ? stats.rangeCommission : stats.totalCommission).toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-medium text-[#6B7280] mt-auto">
               {isCustomRange ? "In selected range" : "This month"}
             </div>
          </CardContent>
        </Card>

        {/* Total Payouts */}
        <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-6">
               <div className="h-[48px] w-[48px] rounded-full bg-[#F1EAFE] flex items-center justify-center shrink-0">
                 <WalletCards className="h-[22px] w-[22px] text-[#8B5CF6]" strokeWidth={1.8} />
               </div>
               <div className="text-right">
                 <span className="text-[13px] font-medium text-[#374151] block mb-1">Total Payouts</span>
                 <div className="text-[24px] font-bold text-[#111827]">₹{stats.totalSettledPayouts.toLocaleString('en-IN')}</div>
               </div>
             </div>
             <div className="text-[12px] font-medium text-[#6B7280] mt-auto">
               All time payments
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid xl:grid-cols-3 gap-6">
        
        {/* Earnings Overview */}
        <Card className="xl:col-span-2 bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6 border-b-0">
            <div className="flex items-center gap-2">
              <ChartNoAxesCombined className="h-[20px] w-[20px] text-[#087B2B]" strokeWidth={1.8} />
              <h2 className="text-[16px] font-bold text-[#111827]">Earnings Overview</h2>
            </div>
            <Button variant="outline" className="h-[32px] text-[13px] font-medium text-[#111827] border-[#E6EAEC] bg-[#FFFFFF] rounded-[6px] px-3 hover:bg-[#F7FAF8] shadow-none">
              {isCustomRange ? "Selected Range" : "This Week"} <ChevronDown className="h-[14px] w-[14px] ml-1 text-[#111827]" strokeWidth={1.8} />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col md:flex-row gap-8 pt-4 px-6 pb-6">
            <div className="flex flex-col min-w-[140px]">
              <span className="text-[13px] font-medium text-[#374151] mb-1">Total Earnings</span>
              <span className="text-[28px] font-bold text-[#111827] mb-8">₹{stats.rangeEarnings.toLocaleString('en-IN')}</span>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[8px] w-[8px] rounded-full bg-[#16A34A]" />
                  <span className="text-[13px] font-medium text-[#374151] flex-1">Delivery Earnings</span>
                  <span className="text-[14px] font-bold text-[#111827]">₹{stats.rangeEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-[8px] w-[8px] rounded-full bg-[#FFB86B]" />
                  <span className="text-[13px] font-medium text-[#F5B66D] flex-1">Incentives</span>
                  <span className="text-[14px] font-bold text-[#FF8500]">₹0</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-[8px] w-[8px] rounded-full bg-[#C9A7F7]" />
                  <span className="text-[13px] font-medium text-[#B8A3D5] flex-1">Tips</span>
                  <span className="text-[14px] font-bold text-[#111827]">₹0</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 h-[240px] md:h-auto min-h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyEarningsTrend} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValuePayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(8, 123, 43, 0.12)"/>
                      <stop offset="100%" stopColor="rgba(8, 123, 43, 0.01)"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F0F2F3" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E6EAEC', boxShadow: '0 4px 16px rgba(17,24,39,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#111827' }}
                    formatter={(value) => [`₹${Number(value ?? 0)}`, 'Earnings']}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }} 
                    dy={10}
                  />
                  <Area 
                    type="linear" 
                    dataKey="value" 
                    stroke="#087B2B" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorValuePayments)" 
                    activeDot={{ r: 5, fill: "#087B2B", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="bg-[#F0F8F1] px-6 py-[14px] flex items-center justify-between">
             <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151]">
                 <div className="h-[16px] w-[16px] rounded-full border border-[#087B2B] flex items-center justify-center text-[#087B2B] text-[10px] font-bold">i</div>
                 Earnings are calculated after platform commission (10%).
             </div>
             <Button variant="ghost" className="h-auto p-0 text-[#087B2B] hover:text-[#066B25] hover:bg-transparent text-[13px] font-medium flex items-center">
                 View Earnings Details <ArrowRight className="h-[14px] w-[14px] ml-1" strokeWidth={1.8} />
             </Button>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b-0">
             <div className="flex items-center gap-2">
                <CreditCard className="h-[20px] w-[20px] text-[#111827]" strokeWidth={1.8} />
                <h2 className="text-[16px] font-bold text-[#111827]">Payment Details</h2>
             </div>
             <Badge className="bg-[#EAF6EC] hover:bg-[#EAF6EC] text-[#087B2B] rounded-[6px] px-2.5 py-1 text-[11px] font-medium border-none flex items-center gap-1 shadow-none">
                 <CircleCheck className="h-[14px] w-[14px]" strokeWidth={2} /> Verified
             </Badge>
          </CardHeader>
          <CardContent className="flex-1 pt-2 px-6 pb-6 flex flex-col justify-between">
                 <div className="space-y-[18px]">
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">Bank Name</span>
                         <span className="font-bold text-[#111827]">{kyc?.bankName || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">Account Holder</span>
                         <span className="font-bold text-[#111827]">{kyc?.accountHolderName || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">Account Number</span>
                         <span className="font-bold text-[#111827]">{kyc?.bankAccountNumber || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">IFSC Code</span>
                         <span className="font-bold text-[#111827]">{kyc?.ifscCode || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">UPI ID</span>
                         <span className="font-bold text-[#111827]">{kyc?.upiId || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">Google Pay</span>
                         <span className="font-bold text-[#111827]">{kyc?.googlePayNumber || '—'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#374151] font-medium">PhonePe</span>
                         <span className="font-bold text-[#111827]">{kyc?.phonePeNumber || '—'}</span>
                     </div>
                 </div>
             
             <Button variant="outline" className="w-full mt-8 h-[40px] border-[#A9D5B1] text-[#087B2B] font-medium hover:bg-[#EEF8F0] hover:text-[#066B25] rounded-[6px] shadow-none bg-[#FFFFFF]">
                 <Pencil className="h-[16px] w-[16px] mr-2" strokeWidth={1.8} /> Manage Bank Details
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tables & Summary */}
      <div className="grid xl:grid-cols-3 gap-6">
          
          {/* Recent Payouts */}
          <Card className="xl:col-span-2 bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b-0">
                <div className="flex items-center gap-2">
                    <WalletCards className="h-[20px] w-[20px] text-[#111827]" strokeWidth={1.8} />
                    <h2 className="text-[16px] font-bold text-[#111827]">Recent Payouts</h2>
                </div>
                <Button variant="ghost" className="h-auto p-0 text-[#087B2B] hover:text-[#066B25] hover:bg-transparent text-[13px] font-medium flex items-center">
                 View All Payouts <ArrowRight className="h-[14px] w-[14px] ml-1" strokeWidth={1.8} />
                </Button>
             </CardHeader>
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-[13px] text-left">
                         <thead className="text-[13px] font-bold text-[#111827] border-b border-[#ECEFF1]">
                             <tr>
                                 <th className="px-6 py-4 font-bold">Payout ID</th>
                                 <th className="px-6 py-4 font-bold">Amount</th>
                                 <th className="px-6 py-4 font-bold">Date</th>
                                 <th className="px-6 py-4 font-bold">Status</th>
                                 <th className="px-6 py-4 font-bold">Method</th>
                                 <th className="px-6 py-4"></th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-[#ECEFF1]">
                             {recentPayouts.length === 0 ? (
                                 <tr><td colSpan={6} className="text-center py-8 text-[#6B7280] font-medium">No recent payouts</td></tr>
                             ) : recentPayouts.map((payout, i) => (
                                 <tr key={i} className="hover:bg-[#FCFCFC] transition-colors">
                                     <td className="px-6 py-[18px] font-bold text-[#111827] whitespace-nowrap">{payout.id}</td>
                                     <td className="px-6 py-[18px] font-bold text-[#111827] whitespace-nowrap">₹{payout.amount.toLocaleString('en-IN')}</td>
                                     <td className="px-6 py-[18px] text-[#374151] font-medium whitespace-nowrap">{payout.date}</td>
                                     <td className="px-6 py-[18px]">
                                         <Badge className={cn(
                                             "px-3 py-1 rounded-[6px] text-[12px] font-medium shadow-none border-none",
                                             payout.status === 'Paid' ? "bg-[#EAF6EC] hover:bg-[#EAF6EC] text-[#087B2B]" :
                                             payout.status === 'Pending' ? "bg-[#FFF1DF] hover:bg-[#FFF1DF] text-[#FF8500]" :
                                             "bg-[#F1EAFE] hover:bg-[#F1EAFE] text-[#8B5CF6]"
                                         )}>
                                             {payout.status}
                                         </Badge>
                                     </td>
                                     <td className="px-6 py-[18px] text-[#374151] font-medium flex items-center gap-2 whitespace-nowrap">
                                         <Landmark className="h-[15px] w-[15px] text-[#374151]" strokeWidth={1.8} /> {payout.method}
                                     </td>
                                     <td className="px-6 py-[18px] text-right">
                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-[#374151] hover:text-[#111827] rounded-full hover:bg-transparent">
                                             <Download className="h-[15px] w-[15px]" strokeWidth={1.8} />
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
          <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
             <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-5 px-6 border-b-0">
                 <Wallet className="h-[20px] w-[20px] text-[#111827]" strokeWidth={1.8} />
                 <h2 className="text-[16px] font-bold text-[#111827]">Payout Summary</h2>
             </CardHeader>
             <CardContent className="px-6 pb-6 pt-2">
                 <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8">
                     <div className="h-[120px] w-[120px] relative shrink-0 ml-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={payoutSummary}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={36}
                                    outerRadius={56}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#087B2B" />
                                    <Cell fill="#FF8500" />
                                    <Cell fill="#8B5CF6" />
                                </Pie>
                             </PieChart>
                          </ResponsiveContainer>
                     </div>
                     <div className="space-y-[14px]">
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151] mb-0.5">
                                 <div className="h-[8px] w-[8px] rounded-full bg-[#087B2B]" />
                                 Paid
                             </div>
                             <div className="text-[14px] font-bold text-[#111827] pl-4">
                                 ₹{payoutSummary[0]?.value.toLocaleString('en-IN')} ({summaryPercent(0)}%)
                             </div>
                         </div>
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151] mb-0.5">
                                 <div className="h-[8px] w-[8px] rounded-full bg-[#FF8500]" />
                                 Pending
                             </div>
                             <div className="text-[14px] font-bold text-[#111827] pl-4">
                                 ₹{payoutSummary[1]?.value.toLocaleString('en-IN')} ({summaryPercent(1)}%)
                             </div>
                         </div>
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2 text-[13px] font-medium text-[#374151] mb-0.5">
                                 <div className="h-[8px] w-[8px] rounded-full bg-[#8B5CF6]" />
                                 Failed
                             </div>
                             <div className="text-[14px] font-bold text-[#111827] pl-4">
                                 ₹{payoutSummary[2]?.value.toLocaleString('en-IN')} ({summaryPercent(2)}%)
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="border border-[#ECEFF1] rounded-[8px] p-4 flex gap-4 items-start">
                     <div className="h-[36px] w-[36px] rounded-[6px] bg-[#EAF6EC] flex items-center justify-center shrink-0">
                         <CalendarDays className="h-[18px] w-[18px] text-[#087B2B]" strokeWidth={1.8} />
                     </div>
                     <div>
                         <div className="font-bold text-[#111827] text-[14px] mb-1">Next Payout</div>
                         <div className="text-[13px] text-[#6B7280] font-medium mb-1">Expected on</div>
                         <div className="text-[15px] font-bold text-[#111827] mb-1">{format(nextPayoutDate, "dd MMMM yyyy")}</div>
                         <div className="text-[12px] font-bold text-[#087B2B]">Estimated Amount: ₹{stats.rangeEarnings.toLocaleString('en-IN')}</div>
                     </div>
                 </div>
             </CardContent>
          </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid xl:grid-cols-3 gap-6">
          
          {/* Transaction History */}
          <Card className="xl:col-span-2 bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b-0">
                <div className="flex items-center gap-2">
                    <Receipt className="h-[20px] w-[20px] text-[#111827]" strokeWidth={1.8} />
                    <h2 className="text-[16px] font-bold text-[#111827]">Transaction History</h2>
                </div>
                <Button variant="ghost" className="h-auto p-0 text-[#087B2B] hover:text-[#066B25] hover:bg-transparent text-[13px] font-medium flex items-center">
                 View All Transactions <ArrowRight className="h-[14px] w-[14px] ml-1" strokeWidth={1.8} />
                </Button>
             </CardHeader>
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-[13px] text-left">
                         <thead className="text-[13px] font-bold text-[#111827] border-b border-[#ECEFF1]">
                             <tr>
                                 <th className="px-6 py-4 font-bold">Date & Time</th>
                                 <th className="px-6 py-4 font-bold">Description</th>
                                 <th className="px-6 py-4 font-bold">Type</th>
                                 <th className="px-6 py-4 font-bold">Amount</th>
                                 <th className="px-6 py-4 font-bold">Balance</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-[#ECEFF1] border-b border-[#ECEFF1]">
                             {transactions.length === 0 ? (
                                 <tr><td colSpan={5} className="text-center py-8 text-[#6B7280] font-medium">No recent transactions</td></tr>
                             ) : transactions.map((tx, i) => (
                                 <tr key={i} className="hover:bg-[#FCFCFC] transition-colors">
                                     <td className="px-6 py-[22px] text-[#111827] font-medium whitespace-nowrap">{tx.date}</td>
                                     <td className="px-6 py-[22px] font-medium text-[#374151] whitespace-nowrap">{tx.description}</td>
                                     <td className="px-6 py-[22px] text-[#374151] font-medium">{tx.type}</td>
                                     <td className={cn(
                                         "px-6 py-[22px] font-medium whitespace-nowrap",
                                         tx.amount > 0 ? "text-[#087B2B]" : "text-[#EF2020]"
                                     )}>
                                         {tx.amount > 0 ? "+ " : "- "}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                     </td>
                                     <td className="px-6 py-[22px] font-bold text-[#111827] whitespace-nowrap">
                                         ₹{tx.balance.toLocaleString('en-IN')}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 <div className="p-6 flex justify-center">
                    <Button variant="outline" className="h-[36px] text-[13px] font-medium text-[#087B2B] border-[#B9DDBF] bg-[#FFFFFF] rounded-[6px] px-6 hover:bg-[#EEF8F0] hover:text-[#066B25] shadow-none">
                       Load More <ChevronDown className="h-[14px] w-[14px] ml-2 text-[#087B2B]" strokeWidth={1.8} />
                    </Button>
                 </div>
             </CardContent>
          </Card>

          {/* How You Earn */}
          <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] flex flex-col">
             <CardHeader className="flex flex-row items-center gap-2 pb-6 pt-5 px-6 border-b-0">
                 <WalletCards className="h-[20px] w-[20px] text-[#111827]" strokeWidth={1.8} />
                 <h2 className="text-[16px] font-bold text-[#111827]">How You Earn</h2>
             </CardHeader>
             <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-[22px]">
                 <div className="flex gap-4 items-center">
                     <div className="h-[44px] w-[44px] rounded-[10px] bg-[#EAF6EC] flex items-center justify-center shrink-0">
                         <Wallet className="h-[20px] w-[20px] text-[#087B2B]" strokeWidth={1.8} />
                     </div>
                     <div>
                         <div className="font-bold text-[#111827] text-[14px] mb-0.5">Delivery Earnings</div>
                         <div className="text-[13px] font-medium text-[#374151]">Earn for every successful delivery</div>
                     </div>
                 </div>
                 <div className="flex gap-4 items-center">
                     <div className="h-[44px] w-[44px] rounded-[10px] bg-[#FFF1DF] flex items-center justify-center shrink-0">
                         <Gift className="h-[20px] w-[20px] text-[#FF8500]" strokeWidth={1.8} />
                     </div>
                     <div>
                         <div className="font-bold text-[#111827] text-[14px] mb-0.5">Incentives</div>
                         <div className="text-[13px] font-medium text-[#374151]">Extra earnings for peak hours</div>
                     </div>
                 </div>
                 <div className="flex gap-4 items-center">
                     <div className="h-[44px] w-[44px] rounded-[10px] bg-[#F1EAFE] flex items-center justify-center shrink-0">
                         <Heart className="h-[20px] w-[20px] text-[#8B5CF6]" strokeWidth={1.8} />
                     </div>
                     <div>
                         <div className="font-bold text-[#111827] text-[14px] mb-0.5">Tips</div>
                         <div className="text-[13px] font-medium text-[#374151]">Tips from happy customers</div>
                     </div>
                 </div>
                 <div className="flex gap-4 items-center mb-4">
                     <div className="h-[44px] w-[44px] rounded-[10px] bg-[#EAF3FF] flex items-center justify-center shrink-0">
                         <CalendarDays className="h-[20px] w-[20px] text-[#1677E8]" strokeWidth={1.8} />
                     </div>
                     <div>
                         <div className="font-bold text-[#111827] text-[14px] mb-0.5">Weekly Payouts</div>
                         <div className="text-[13px] font-medium text-[#374151]">Get paid every Tuesday</div>
                     </div>
                 </div>

                 <div className="bg-[#FFF6E8] border border-[#FFD9A8] rounded-[8px] p-[14px] flex gap-3 items-center mt-auto">
                     <Star className="h-[20px] w-[20px] text-[#FF8500] shrink-0 fill-[#FF8500]" />
                     <div className="font-medium text-[#8A4B00] text-[13px] leading-[1.4]">
                         Keep delivering great service to earn more and get tips!
                     </div>
                 </div>
             </CardContent>
          </Card>
      </div>

    </div>
  )
}
