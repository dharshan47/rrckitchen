"use client"

import { Bike, Clock, XCircle, TrendingUp, TrendingDown, MapPin, Wallet, HeadphonesIcon, ArrowUp, ChevronDown, CheckCircle2, Shield, UserCheck, Navigation, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts"
import { useDeliveryData } from "@/stores/deliveryDashboardStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

const ratingRowConfig: Record<number, { color: string; colorClass: string }> = {
  5: { color: "bg-green-600", colorClass: "[&>div]:bg-green-600" },
  4: { color: "bg-green-400", colorClass: "[&>div]:bg-green-400" },
  3: { color: "bg-orange-400", colorClass: "[&>div]:bg-orange-400" },
  2: { color: "bg-red-500", colorClass: "[&>div]:bg-red-500" },
  1: { color: "bg-red-600", colorClass: "[&>div]:bg-red-600" },
}

export default function DashboardPageClient() {
  const data = useDeliveryData()

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300" role="status" aria-label="Loading delivery dashboard">
        {/* Welcome header */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-none border-slate-100 rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Earnings Overview */}
          <Card className="lg:col-span-3 shadow-none border-slate-100 rounded-3xl flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 pt-4">
              <div className="flex flex-col justify-center min-w-[140px] space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-36" />
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 mt-4">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
              <div className="flex-1 h-[240px] md:h-auto min-h-[240px] px-2">
                <div className="w-full h-full flex items-end gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-t-md"
                      style={{ height: `${25 + ((i * 37) % 65)}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="flex items-center gap-8 flex-1 pt-6">
              <div className="relative h-40 w-40 flex-shrink-0">
                <Skeleton className="h-full w-full rounded-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
                  <Skeleton className="h-9 w-12 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-3 w-[45px]" />
                    <Skeleton className="h-2 flex-1 mx-3 rounded-full" />
                    <Skeleton className="h-3 w-[50px]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="shadow-none border-slate-100 rounded-3xl">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 space-y-3 border border-slate-100">
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-2.5 w-full" />
                    <Skeleton className="h-2.5 w-3/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-5 flex-1 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
            <div className="px-6 pb-6">
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          </Card>

          {/* Tips & Safety */}
          <Card className="shadow-none border-slate-100 rounded-3xl">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          {greeting}, {profile.name?.split(' ')[0] || "Partner"}! <span className="text-3xl animate-wave origin-[70%_70%] inline-block">👋</span>
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Let&apos;s make today another successful day.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Deliveries */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Bike className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Total Deliveries</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">{totalDeliveries}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">All time</div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Completed</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">{completedDeliveries}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">This month</div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Pending</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">{pendingDeliveries}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">Today</div>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Cancelled</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">{cancelledDeliveries}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">This month</div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Earnings */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">₹</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">Today&apos;s Earnings</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">₹{todayEarnings.toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold flex items-center mt-1">
                {todayChange === null ? (
                  <span className="text-slate-400 font-medium">New</span>
                ) : todayChange >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> {todayChange}% <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-0.5" /> {Math.abs(todayChange)}% <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="shadow-none border-slate-100 rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">₹</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">This Month</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">₹{monthlyEarnings.toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold flex items-center mt-1">
                {monthChange === null ? (
                  <span className="text-slate-400 font-medium">New</span>
                ) : monthChange >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> {monthChange}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-0.5" /> {Math.abs(monthChange)}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Earnings Overview */}
        <Card className="lg:col-span-3 shadow-none border-slate-100 rounded-3xl flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Earnings Overview</h2>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-slate-600 border-slate-200 rounded-xl px-3 hover:bg-slate-50 shadow-sm">
              This Week <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col md:flex-row gap-8 pt-4">
            <div className="flex flex-col justify-center min-w-[140px]">
              <span className="text-sm font-semibold text-slate-500 mb-1">This Week Earnings</span>
              <span className="text-4xl font-extrabold text-slate-900 mb-8">₹{weeklyTotal.toLocaleString('en-IN')}</span>
              
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Trips</div>
                  <div className="text-lg font-bold text-slate-800">{weeklyTrips}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Distance</div>
                  <div className="text-lg font-bold text-slate-800">{distance} km</div>
                </div>
              </div>
            </div>
            <div className="flex-1 h-[240px] md:h-auto min-h-[240px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                    dy={10}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="lg:col-span-2 shadow-none border-slate-100 rounded-3xl flex flex-col">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Performance Summary</h2>
          </CardHeader>
          <CardContent className="flex items-center gap-8 flex-1 pt-6">
            <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8" strokeDasharray="264" strokeDashoffset="12" strokeLinecap="round" className="drop-shadow-[0_2px_8px_rgba(22,163,74,0.3)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-slate-900">{rating}</span>
                <span className="text-xs font-bold text-slate-400 mt-1">Rating</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {ratingRows.map((row, i) => (
                <div key={i} className="flex items-center text-xs">
                  <span className="w-[45px] font-semibold text-slate-600">{row.stars}</span>
                  <Progress value={row.percent} className={cn("h-2 mx-3", row.colorClass)} />
                  <span className="w-[50px] text-right font-medium text-slate-500">
                    {row.count} <span className="text-[10px] text-slate-400">({row.percent}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
          <CardHeader>
             <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 flex-1 pt-2">
            <button className="bg-emerald-50 rounded-2xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-100/50 flex flex-col focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <Bike className="h-6 w-6 text-emerald-600 mb-3" />
              <div className="font-bold text-emerald-700 text-sm mb-1">Go Online</div>
              <div className="text-[11px] text-emerald-600/70 font-medium leading-tight">Start receiving<br/>delivery requests</div>
            </button>
            <button className="bg-blue-50 rounded-2xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] border border-blue-100/50 flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <MapPin className="h-6 w-6 text-blue-600 mb-3" />
              <div className="font-bold text-blue-700 text-sm mb-1">View Map</div>
              <div className="text-[11px] text-blue-600/70 font-medium leading-tight">Check delivery<br/>hotspots</div>
            </button>
            <button className="bg-purple-50 rounded-2xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] border border-purple-100/50 flex flex-col focus:outline-none focus:ring-2 focus:ring-purple-500/20">
              <Wallet className="h-6 w-6 text-purple-600 mb-3" />
              <div className="font-bold text-purple-700 text-sm mb-1">Earnings</div>
              <div className="text-[11px] text-purple-600/70 font-medium leading-tight">View earnings<br/>summary</div>
            </button>
            <button className="bg-orange-50 rounded-2xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] border border-orange-100/50 flex flex-col focus:outline-none focus:ring-2 focus:ring-orange-500/20">
              <HeadphonesIcon className="h-6 w-6 text-orange-600 mb-3" />
              <div className="font-bold text-orange-700 text-sm mb-1">Support</div>
              <div className="text-[11px] text-orange-600/70 font-medium leading-tight">Get help and<br/>contact support</div>
            </button>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col">
          <CardHeader>
             <h2 className="text-base font-bold text-slate-900">Today&apos;s Summary</h2>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <span className="font-bold text-slate-500">₹</span>
                </div>
                <span className="font-semibold text-sm text-slate-700">Earnings</span>
              </div>
              <span className="font-extrabold text-slate-900">₹{todayEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <Bike className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-semibold text-sm text-slate-700">Deliveries</span>
              </div>
              <span className="font-extrabold text-slate-900">{pendingDeliveries + completedDeliveries}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-semibold text-sm text-slate-700">Distance</span>
              </div>
              <span className="font-extrabold text-slate-900">{distance} km</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-semibold text-sm text-slate-700">Incentives</span>
              </div>
              <span className="font-extrabold text-slate-900">—</span>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button variant="outline" className="w-full h-12 rounded-xl border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 shadow-sm">
              View Detailed Summary <span className="text-lg leading-none ml-2">&rarr;</span>
            </Button>
          </div>
        </Card>

        {/* Tips & Safety */}
        <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Tips & Safety</h2>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 relative z-10 pt-2">
            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Always wear your helmet</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Safety is our top priority</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Verify customer details</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Confirm before delivery</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Follow traffic rules</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Drive safe, arrive safe</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Keep customer updated</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Share live location</div>
                </div>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="hidden md:flex flex-col justify-end w-40 relative">
               <Image 
                src="/delivery/delivery-person-green.webp" 
                alt="Safety illustration" 
                width={160} 
                height={160} 
                className="object-contain drop-shadow-xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}