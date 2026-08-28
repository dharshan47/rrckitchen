"use client"

import { Bike, Clock3, CircleX, MapPin, HeadphonesIcon, ArrowUp, ShieldCheck, Trophy, ArrowRight, IndianRupee, HardHat, UserRound, TrafficCone, Send, CircleCheck, WalletCards, TrendingDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData, useDeliveryIsOnline, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const ratingRowConfig: Record<number, { colorClass: string }> = {
  5: { colorClass: "bg-[#087B2B]" },
  4: { colorClass: "bg-[#55AA68]" },
  3: { colorClass: "bg-[#FF9000]" },
  2: { colorClass: "bg-[#EF2020]" },
  1: { colorClass: "bg-[#EF2020]" },
}

export default function DashboardPageClient() {
  const data = useDeliveryData()
  const isOnline = useDeliveryIsOnline()
  const { setOnline } = useDeliveryActions()
  const queryClient = useQueryClient()

  const onlineMutation = useMutation({
    mutationFn: async (online: boolean) => {
      const res = await fetch("/api/delivery/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online }),
      })
      if (!res.ok) throw new Error("Failed to update status")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
    },
    onError: (err, online) => {
      toast.error(err.message)
      setOnline(!online)
    },
  })

  const handleOnlineToggle = () => {
    setOnline(!isOnline)
    onlineMutation.mutate(!isOnline)
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8" role="status" aria-label="Loading delivery dashboard">
        {/* Welcome Section */}
        <div className="space-y-3">
          <Skeleton className="h-[25px] sm:h-[28px] w-72 max-w-full" />
          <Skeleton className="h-4 w-56" />
        </div>
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-none">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
                <Skeleton className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full shrink-0" />
                <div className="flex flex-col items-start overflow-hidden w-full">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-[23px] w-12 mb-1" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Charts Section */}
        <div className="grid xl:grid-cols-5 gap-6">
          <Card className="xl:col-span-3 bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-none overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F3]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-24 rounded-[7px]" />
            </div>
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 p-4 sm:p-6">
              <div className="flex flex-col justify-center min-w-[140px]">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-28 mb-6" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="flex-1 h-[180px] sm:h-[200px]" />
            </div>
          </Card>
          <Card className="xl:col-span-2 bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-none">
            <div className="p-4 sm:p-5 flex items-center gap-2 border-b border-[#F0F2F3]">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-4 sm:p-6">
              <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full" />
              <div className="flex-1 w-full space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-3 w-[50px]" />
                    <Skeleton className="flex-1 h-[6px] rounded-full mx-3" />
                    <Skeleton className="h-3 w-[60px]" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        {/* Bottom Section */}
        <div className="grid xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-none overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#F0F2F3]">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full rounded-[9px]" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const s = data.stats
  const profile = data.profile

  const totalDeliveries = s.totalAssignments
  const completedDeliveries = s.completedAssignments
  const pendingDeliveries = s.pendingAssignments
  const cancelledDeliveries = s.cancelledAssignments
  const todayEarnings = s.todayEarnings
  const monthlyEarnings = s.monthlyEarnings
  const rating = s.rating
  const distance = s.distanceTravelled

  const earningsData = data.weeklyEarningsTrend
  const weeklyTotal = earningsData.reduce((sum, d) => sum + d.value, 0)
  const weeklyTrips = s.weeklyTrips

  const todayChange = s.yesterdayEarnings > 0
    ? Math.round(((todayEarnings - s.yesterdayEarnings) / s.yesterdayEarnings) * 100)
    : null
  const monthChange = s.lastMonthEarnings > 0
    ? Math.round(((monthlyEarnings - s.lastMonthEarnings) / s.lastMonthEarnings) * 100)
    : null

  const distribution = data.ratingDistribution
  const distTotal = distribution.reduce((sum, r) => sum + r.count, 0)
  const ratingRows = distribution.map((r) => {
    const percent = distTotal > 0 ? Math.round((r.count / distTotal) * 100) : 0
    return {
      stars: `${r.stars} Star${r.stars > 1 ? "s" : ""}`,
      count: r.count,
      percent,
      ...ratingRowConfig[r.stars],
    }
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500 px-4 sm:px-6 lg:px-8">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold text-[#111827] flex items-center gap-2">
          {greeting}, {profile.name?.split(' ')[0] || "Partner"}! <span className="text-2xl sm:text-3xl animate-wave origin-[70%_70%] inline-block">👋</span>
        </h1>
        <p className="text-[#374151] text-[13px] sm:text-[14px] mt-1 font-medium">Let&apos;s make today another successful day.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Deliveries */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#E8F6EB] flex items-center justify-center shrink-0">
              <Bike className="h-5 w-5 sm:h-6 sm:w-6 text-[#087B2B]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">Total Deliveries</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">{totalDeliveries}</span>
              <span className="text-[11px] sm:text-[12px] text-[#6B7280] truncate w-full">All time</span>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#E5F6E9] flex items-center justify-center shrink-0">
              <CircleCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#087B2B]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">Completed</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">{completedDeliveries}</span>
              <span className="text-[11px] sm:text-[12px] text-[#6B7280] truncate w-full">This month</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#FFF0DD] flex items-center justify-center shrink-0">
              <Clock3 className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF8500]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">Pending</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">{pendingDeliveries}</span>
              <span className="text-[11px] sm:text-[12px] text-[#6B7280] truncate w-full">Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#FFE7E7] flex items-center justify-center shrink-0">
              <CircleX className="h-5 w-5 sm:h-6 sm:w-6 text-[#EF2020]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">Cancelled</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">{cancelledDeliveries}</span>
              <span className="text-[11px] sm:text-[12px] text-[#6B7280] truncate w-full">This month</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Earnings */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#E8F2FF] flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-[#1677E8]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">Today&apos;s Earnings</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">₹{todayEarnings.toLocaleString('en-IN')}</span>
              <div className="text-[10px] sm:text-[12px] font-medium flex items-center truncate w-full">
                {todayChange === null ? (
                  <span className="text-[#6B7280]">New</span>
                ) : todayChange >= 0 ? (
                  <span className="text-[#087B2B] flex items-center font-semibold">
                    <ArrowUp className="h-3 w-3 mr-0.5" strokeWidth={2.5} /> {todayChange}% <span className="text-[#6B7280] font-normal ml-1 hidden sm:inline">vs y&apos;day</span>
                  </span>
                ) : (
                  <span className="text-[#EF2020] flex items-center font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" strokeWidth={2.5} /> {Math.abs(todayChange)}% <span className="text-[#6B7280] font-normal ml-1 hidden sm:inline">vs y&apos;day</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)]">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
            <div className="h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-full bg-[#F0E9FF] flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-[#7C3AED]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#111827] mb-0.5 truncate w-full">This Month</span>
              <span className="text-[20px] sm:text-[23px] font-bold text-[#111827] leading-none mb-1">₹{monthlyEarnings.toLocaleString('en-IN')}</span>
              <div className="text-[10px] sm:text-[12px] font-medium flex items-center truncate w-full">
                {monthChange === null ? (
                  <span className="text-[#6B7280]">New</span>
                ) : monthChange >= 0 ? (
                  <span className="text-[#087B2B] flex items-center font-semibold">
                    <ArrowUp className="h-3 w-3 mr-0.5" strokeWidth={2.5} /> {monthChange}% <span className="text-[#6B7280] font-normal ml-1 hidden sm:inline">vs last</span>
                  </span>
                ) : (
                  <span className="text-[#EF2020] flex items-center font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" strokeWidth={2.5} /> {Math.abs(monthChange)}% <span className="text-[#6B7280] font-normal ml-1 hidden sm:inline">vs last</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid xl:grid-cols-5 gap-6">
        {/* Earnings Overview */}
        <Card className="xl:col-span-3 bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)] flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 sm:pt-5 px-4 sm:px-6 border-b-0">
            <div className="flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-[#087B2B]" strokeWidth={1.8} />
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">Earnings Overview</h2>
            </div>
            <div className="flex items-center gap-1 border border-[#E8EAED] rounded-[7px] px-2 sm:px-3 py-1 sm:py-1.5">
              <span className="text-[12px] sm:text-[13px] font-medium text-[#374151]">This Week</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 sm:gap-8 pt-2 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col justify-center min-w-[140px]">
              <span className="text-[12px] font-medium text-[#374151] mb-1">Total Earnings</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-[#111827] mb-6 sm:mb-8">₹{weeklyTotal.toLocaleString('en-IN')}</span>
              
              <div className="flex items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-[12px] font-medium text-[#374151] mb-1">Trips</div>
                  <div className="text-[15px] sm:text-[16px] font-bold text-[#111827]">{weeklyTrips}</div>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-[#374151] mb-1">Distance</div>
                  <div className="text-[15px] sm:text-[16px] font-bold text-[#111827]">{distance} km</div>
                </div>
                <div>
                   <div className="text-[12px] font-medium text-[#374151] mb-1">Incentives</div>
                   <div className="text-[15px] sm:text-[16px] font-bold text-[#111827]">₹0</div>
                </div>
              </div>
            </div>
            <div className="flex-1 h-[180px] sm:h-[200px] md:h-auto min-h-[180px] sm:min-h-[200px] -mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#087B2B" stopOpacity={0.16}/>
                      <stop offset="100%" stopColor="#087B2B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E8EAED', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#087B2B' }}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                    dy={10}
                  />
                  <Area type="monotone" dataKey="value" stroke="#087B2B" strokeWidth={2} fillOpacity={1} fill="url(#earningsGradient)" activeDot={{ r: 5, fill: '#087B2B', stroke: '#fff', strokeWidth: 2 }} dot={{ r: 3, fill: '#087B2B', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="xl:col-span-2 bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)] flex flex-col">
          <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-4 sm:pt-5 px-4 sm:px-6 border-b-0">
            <Trophy className="h-5 w-5 text-[#087B2B]" strokeWidth={1.8} />
            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">Performance Summary</h2>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 flex-1 pt-4 sm:pt-6 px-4 sm:px-6 pb-6">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E8ECEA" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#087B2B" strokeWidth="10" strokeDasharray="264" strokeDashoffset={`${264 - (264 * (rating / 5))}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[28px] sm:text-[32px] font-semibold text-[#111827] leading-none">{rating}</span>
                <span className="text-[11px] sm:text-[12px] font-medium text-[#374151] mt-1">Rating</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5 sm:space-y-3">
              {ratingRows.map((row, i) => (
                <div key={i} className="flex items-center text-[11px] sm:text-[12px]">
                  <span className="w-[45px] sm:w-[50px] font-medium text-[#374151] whitespace-nowrap">{row.stars}</span>
                  <div className="flex-1 h-[5px] sm:h-[6px] bg-[#E9E9E9] rounded-full mx-2 sm:mx-3 overflow-hidden">
                    <div className={`h-full rounded-full ${row.colorClass}`} style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="w-[55px] sm:w-[60px] text-right text-[#374151]">
                     {row.count} <span className="text-[#6B7280]">({row.percent}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)] flex flex-col">
          <CardHeader className="pt-4 sm:pt-5 px-4 sm:px-6 pb-3 sm:pb-4 border-b-0">
             <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">Quick Actions</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
            <button onClick={handleOnlineToggle} disabled={onlineMutation.isPending} className="bg-[#EEF8F0] rounded-[9px] p-3 sm:p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start border-none disabled:opacity-70">
              <div className="bg-[#E1F2E5] rounded-full p-2 mb-2 sm:mb-3">
                 <Bike className="h-4 w-4 sm:h-5 sm:w-5 text-[#087B2B]" strokeWidth={2} />
              </div>
              <div className="font-semibold text-[#087B2B] text-[13px] sm:text-[14px] mb-1">{isOnline ? "Go Offline" : "Go Online"}</div>
              <div className="text-[11px] sm:text-[12px] text-[#087B2B] opacity-80 leading-tight">
                {isOnline ? <>Stop receiving<br className="hidden sm:block"/> requests</> : <>Start receiving<br className="hidden sm:block"/> requests</>}
              </div>
            </button>
            <Link href="/delivery-partner/dashboard/deliveries" className="bg-[#EDF5FF] rounded-[9px] p-3 sm:p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start">
              <div className="bg-[#E1EEFF] rounded-full p-2 mb-2 sm:mb-3">
                 <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#1677E8]" strokeWidth={2} />
              </div>
              <div className="font-semibold text-[#1677E8] text-[13px] sm:text-[14px] mb-1">View Map</div>
              <div className="text-[11px] sm:text-[12px] text-[#1677E8] opacity-80 leading-tight">Check delivery<br className="hidden sm:block"/> hotspots</div>
            </Link>
            <Link href="/delivery-partner/dashboard/payments" className="bg-[#F4EEFF] rounded-[9px] p-3 sm:p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start">
              <div className="bg-[#EAE1FF] rounded-full p-2 mb-2 sm:mb-3">
                 <WalletCards className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C3AED]" strokeWidth={2} />
              </div>
              <div className="font-semibold text-[#7C3AED] text-[13px] sm:text-[14px] mb-1">Earnings</div>
              <div className="text-[11px] sm:text-[12px] text-[#7C3AED] opacity-80 leading-tight">View earnings<br className="hidden sm:block"/> summary</div>
            </Link>
            <Link href="/delivery-partner/dashboard/support" className="bg-[#FFF6E8] rounded-[9px] p-3 sm:p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start">
              <div className="bg-[#FFEAD0] rounded-full p-2 mb-2 sm:mb-3">
                 <HeadphonesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF8500]" strokeWidth={2} />
              </div>
              <div className="font-semibold text-[#FF8500] text-[13px] sm:text-[14px] mb-1">Support</div>
              <div className="text-[11px] sm:text-[12px] text-[#FF8500] opacity-80 leading-tight">Get help and<br className="hidden sm:block"/> contact</div>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)] flex flex-col">
          <CardHeader className="pt-4 sm:pt-5 px-4 sm:px-6 pb-3 sm:pb-4 border-b-0">
             <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">Today&apos;s Summary</h2>
          </CardHeader>
          <CardContent className="space-y-0 flex-1 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col">
            <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-[#E9ECEF] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F5F6F7] flex items-center justify-center">
                  <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827]" />
                </div>
                <span className="text-[13px] sm:text-[14px] font-medium text-[#111827]">Earnings</span>
              </div>
              <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">₹{todayEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-[#E9ECEF] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F5F6F7] flex items-center justify-center">
                  <Bike className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827]" />
                </div>
                <span className="text-[13px] sm:text-[14px] font-medium text-[#111827]">Deliveries</span>
              </div>
              <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">{pendingDeliveries + completedDeliveries}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-[#E9ECEF] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F5F6F7] flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827]" />
                </div>
                <span className="text-[13px] sm:text-[14px] font-medium text-[#111827]">Distance</span>
              </div>
              <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">{distance} km</span>
            </div>
            <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-[#E9ECEF] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F5F6F7] flex items-center justify-center">
                  <WalletCards className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827]" />
                </div>
                <span className="text-[13px] sm:text-[14px] font-medium text-[#111827]">Incentives</span>
              </div>
                <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">₹0</span>
            </div>
            
            <div className="mt-auto pt-4 sm:pt-5">
              <Link href="/delivery-partner/dashboard/payments">
                <Button variant="outline" className="w-full h-9 sm:h-10 rounded-[7px] bg-[#FFFFFF] border-[#DCE5E0] text-[#087B2B] text-[13px] sm:text-[14px] font-medium hover:bg-[#F5FAF6] shadow-none flex items-center justify-center transition-colors">
                  View Detailed Summary <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Safety */}
        <Card className="bg-[#FFFFFF] border border-[#E8EAED] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.03)] flex flex-col relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-3 sm:pb-4 pt-4 sm:pt-5 px-4 sm:px-6 border-b-0">
            <ShieldCheck className="h-5 w-5 text-[#087B2B]" strokeWidth={1.8} />
            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">Tips & Safety</h2>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 sm:gap-6 relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4 sm:space-y-6 flex-1">
              <div className="flex gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#F0F7F1] flex items-center justify-center flex-shrink-0">
                  <HardHat className="h-4 w-4 sm:h-5 sm:w-5 text-[#087B2B]" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Always wear your helmet</div>
                  <div className="text-[11px] sm:text-[12px] text-[#374151] mt-0.5">Safety is our top priority</div>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#F0F7F1] flex items-center justify-center flex-shrink-0">
                  <UserRound className="h-4 w-4 sm:h-5 sm:w-5 text-[#087B2B]" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Verify customer details</div>
                  <div className="text-[11px] sm:text-[12px] text-[#374151] mt-0.5">Confirm before delivery</div>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#F0F7F1] flex items-center justify-center flex-shrink-0">
                  <TrafficCone className="h-4 w-4 sm:h-5 sm:w-5 text-[#087B2B]" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Follow traffic rules</div>
                  <div className="text-[11px] sm:text-[12px] text-[#374151] mt-0.5">Drive safe, arrive safe</div>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#F0F7F1] flex items-center justify-center flex-shrink-0">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 text-[#087B2B]" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Keep customer updated</div>
                  <div className="text-[11px] sm:text-[12px] text-[#374151] mt-0.5">Share live location</div>
                </div>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="hidden md:flex flex-col justify-end w-40 lg:w-48 relative">
               <Image 
                src="/delivery/delivery-person-green.webp" 
                alt="Safety illustration" 
                width={192} 
                height={192} 
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}