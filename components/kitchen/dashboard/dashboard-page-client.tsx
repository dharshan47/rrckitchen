"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  ShoppingBag, Clock3, IndianRupee, Star, UsersRound, TrendingUp, 
  ChefHat, Bike, CircleCheck, ChevronRight, ArrowRight,
  Plus, Edit, Timer, Building2, UserRound, ChevronDown, CalendarDays
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good Morning"
  if (h < 17) return "Good Afternoon"
  return "Good Evening"
}

function getRatingLabel(rating: number | null | undefined) {
  if (!rating) return null
  if (rating >= 4.5) return "Excellent"
  if (rating >= 4) return "Very Good"
  if (rating >= 3) return "Good"
  if (rating >= 2) return "Average"
  return "Needs Improvement"
}

type PopularFoodItem = {
  item?: string | null
  orders: number
}

type MenuItemSummary = {
  id: string
  name: string
  price: number
  image?: string | null
}

type KitchenOrder = {
  id: string
  status?: string | null
  time?: string | null
  customerName?: string | null
  amount?: number | null
  serviceDate?: string | null
}

type KitchenReview = {
  id: string
  rating?: number | null
  tasteRating?: number | null
  comment?: string | null
  customerName?: string | null
  createdAt: string
}

const COLORS = {
  background: "#FEFDFB",
  surface: "#FFFFFF",
  surfaceSoft: "#F5F7F4",
  text: "#0E0E0F",
  textSecondary: "#3C3631",
  textMuted: "#616D64",
  textLight: "#8F9793",
  border: "#E8EBE8",
  borderSoft: "#F0F2EF",
  green: "#0D5F23",
  greenBright: "#118A36",
  greenSoft: "#EAF5ED",
  orange: "#F96307",
  orangeSoft: "#FFF1E8",
  yellow: "#ECA836",
  yellowSoft: "#FFF8E9",
  blue: "#3A91FB",
  blueSoft: "#EEF6FF",
  purple: "#6E37BA",
  purpleSoft: "#F5F0FF",
  red: "#E64A35",
  redSoft: "#FFF0ED",
}

export default function DashboardPageClient() {
  const greeting = useMemo(() => getGreeting(), [])
  const router = useRouter()
  const data = useKitchenDashboardData()
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const recentOrders = useMemo(() => {
    const orders = data?.orders ?? []
    if (!pickedDate) return orders
    const label = pickedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    return orders.filter((o) => o.serviceDate === label)
  }, [data, pickedDate])

  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20" style={{ backgroundColor: COLORS.background }}>
        <div className="flex flex-col gap-1 mb-2">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-5 w-96 rounded mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[12px] border bg-white p-5 space-y-4" style={{ borderColor: COLORS.border, boxShadow: '0 1px 4px rgba(15, 25, 18, 0.025)' }}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const s = data.stats || {}
  const k = data.kitchen || {}

  const topSelling = (data.popularFood || [])
    .filter((pf: PopularFoodItem) => pf.item)
    .slice(0, 5)
    .map((pf: PopularFoodItem, index: number) => {
      const menuItem = (data.menuItems || []).find((mi: MenuItemSummary) => mi.name === pf.item)
      return {
        rank: index + 1,
        name: pf.item,
        orders: pf.orders,
        revenue: pf.orders * (menuItem?.price || 0),
        image: menuItem?.image || ""
      }
    })

  const preparingCount = (data.orders || []).filter((o: KitchenOrder) => o.status?.toLowerCase() === "preparing").length
  const readyCount = (data.orders || []).filter((o: KitchenOrder) => o.status?.toLowerCase() === "ready").length
  const outCount = (data.orders || []).filter((o: KitchenOrder) => o.status?.toLowerCase().includes("out")).length
  const deliveredCount = s.todayCompleted

  const ratingLabel = getRatingLabel(k.avgRating)

  // Chart data formatting
  const chartData = (data.monthlyRevenue || []).map((d) => ({
    ...d,
    orders: d.orders || 0,
    revenue: d.revenue || 0
  }))

  const totalMenuItems = s.menuItems || 0
  const vegCount = data.vegCount ?? 0
  const nonVegCount = data.nonVegCount ?? 0
  const donutData = [
    { name: "Veg Items", value: vegCount, color: COLORS.green },
    { name: "Non-Veg Items", value: nonVegCount, color: COLORS.orange },
  ].filter((d) => d.value > 0)

  const growthPct = (current: number, previous: number) => {
    if (!previous || previous <= 0) return null
    return Math.round(((current - previous) / previous) * 100)
  }
  const ordersGrowth = growthPct(s.todayOrders, s.yesterdayOrders ?? 0)
  const pendingGrowth = growthPct(s.todayPending, Math.max((s.yesterdayOrders ?? 0) - (s.yesterdayCompleted ?? 0), 0))
  const revenueGrowth = growthPct(s.todayRevenue, s.yesterdayRevenue ?? 0)
  const repeatRate = s.repeatCustomers != null && s.customers ? Math.round((s.repeatCustomers / s.customers) * 100) : null

  const cardClasses = "bg-white border rounded-[12px]"
  const cardStyles = { borderColor: COLORS.border, boxShadow: '0 1px 4px rgba(15, 25, 18, 0.025)' }

  return (
    <div className="space-y-[18px] animate-in fade-in duration-500 pb-20 pt-[25px]">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2" style={{ color: COLORS.text }}>
            {(() => {
              const displayName = k.userName || k.displayName
              return `${greeting}${displayName ? `, ${displayName.split(' ')[0]}` : ""}!`
            })()} <span>👋</span>
          </h1>
          <p className="text-[12px]" style={{ color: COLORS.textMuted }}>
            Here&apos;s what&apos;s happening in your kitchen today.
          </p>
        </div>
        
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-white border cursor-pointer" style={{ borderColor: COLORS.border }}>
              <CalendarDays className="w-4 h-4" style={{ color: COLORS.textSecondary }} strokeWidth={1.8} />
              <span className="text-[12px] font-medium" style={{ color: COLORS.text }}>
                {pickedDate
                  ? pickedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : `Today, ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
              </span>
              <ChevronDown className="w-4 h-4 ml-2" style={{ color: COLORS.textMuted }} strokeWidth={1.8} />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0 rounded-[8px]">
            <Calendar
              mode="single"
              selected={pickedDate ?? undefined}
              onSelect={(d) => {
                setPickedDate(d ?? null)
                setDatePickerOpen(false)
              }}
            />
            <div className="border-t p-2" style={{ borderColor: COLORS.borderSoft }}>
              <button
                className="w-full text-[12px] font-semibold rounded-[6px] py-1.5 transition-colors"
                style={{ color: COLORS.green }}
                onClick={() => {
                  setPickedDate(null)
                  setDatePickerOpen(false)
                }}
              >
                All Dates
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Cards Row */}
      <section className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.greenSoft }}>
                <ShoppingBag size={22} color={COLORS.green} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Total Orders</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>{s.todayOrders}</div>
              <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                {ordersGrowth !== null ? (
                  <>
                    <span style={{ color: ordersGrowth >= 0 ? COLORS.green : COLORS.red }}>
                      {ordersGrowth >= 0 ? "↑" : "↓"} {Math.abs(ordersGrowth)}%
                    </span>
                    <span style={{ color: COLORS.textMuted }}>vs yesterday</span>
                  </>
                ) : (
                  <span style={{ color: COLORS.textMuted }}>orders today</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.orangeSoft }}>
                <Clock3 size={22} color={COLORS.orange} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Pending Orders</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>{s.todayPending}</div>
              <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                {pendingGrowth !== null ? (
                  <>
                    <span style={{ color: pendingGrowth >= 0 ? COLORS.green : COLORS.red }}>
                      {pendingGrowth >= 0 ? "↑" : "↓"} {Math.abs(pendingGrowth)}%
                    </span>
                    <span style={{ color: COLORS.textMuted }}>vs yesterday</span>
                  </>
                ) : (
                  <span style={{ color: COLORS.textMuted }}>needs action</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.greenSoft }}>
                <IndianRupee size={22} color={COLORS.green} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Today&apos;s Revenue</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>₹{s.todayRevenue?.toLocaleString()}</div>
              <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                {revenueGrowth !== null ? (
                  <>
                    <span style={{ color: revenueGrowth >= 0 ? COLORS.green : COLORS.red }}>
                      {revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(revenueGrowth)}%
                    </span>
                    <span style={{ color: COLORS.textMuted }}>vs yesterday</span>
                  </>
                ) : (
                  <span style={{ color: COLORS.textMuted }}>earned today</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.yellowSoft }}>
                <Star size={22} color={COLORS.yellow} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Avg. Rating</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>{k.avgRating ?? "New"}</div>
              {ratingLabel && (
                <div className="flex items-center gap-1 text-[11px] font-medium mt-1" style={{ color: COLORS.textMuted }}>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {ratingLabel}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.blueSoft }}>
                <UsersRound size={22} color={COLORS.blue} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Total Customers</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>{s.customers?.toLocaleString()}</div>
              <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                <span style={{ color: COLORS.textMuted }}>{s.repeatCustomers ?? 0} customers reordered</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cardClasses} style={cardStyles}>
          <div className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[48px] w-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.purpleSoft }}>
                <TrendingUp size={22} color={COLORS.purple} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Repeat Customers</span>
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: COLORS.text }}>{repeatRate != null ? `${repeatRate}%` : "—"}</div>
              <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                <span style={{ color: COLORS.textMuted }}>repeat customer rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Row 1 */}
      <div className="grid gap-[18px] xl:grid-cols-3">
        {/* Order Overview Chart */}
        <div className={cn(cardClasses, "col-span-1 xl:col-span-2")} style={cardStyles}>
          <div className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
            <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Order Overview</h2>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-white border cursor-pointer" style={{ borderColor: COLORS.borderSoft }}>
              <span className="text-[11px] font-medium" style={{ color: COLORS.text }}>This Week</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1" style={{ color: COLORS.textMuted }} />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-1 mb-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.green }}></span>
              <span style={{ color: COLORS.textSecondary }}>Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.orange }}></span>
              <span style={{ color: COLORS.textSecondary }}>Revenue (₹)</span>
            </div>
          </div>

          <div className="px-2 pb-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBE4D0" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#FBE4D0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke={COLORS.borderSoft} />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: COLORS.textMuted }}
                  dy={10}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: COLORS.surface, borderRadius: '8px', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}
                  itemStyle={{ color: COLORS.text, fontSize: '12px' }}
                  labelStyle={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.orange} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: COLORS.orange }}
                  dot={{ r: 3, fill: COLORS.orange, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke={COLORS.green} 
                  strokeWidth={2}
                  fill="none" 
                  activeDot={{ r: 6, fill: COLORS.green }}
                  dot={{ r: 3, fill: COLORS.green, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          {/* Top Selling Items */}
          <div className={cn(cardClasses, "flex-1")} style={cardStyles}>
            <div className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Top Selling Items</h2>
              <button className="text-[10px] font-semibold hover:underline" style={{ color: COLORS.green }} onClick={() => router.push("/kitchen/dashboard/menu")}>View All</button>
            </div>
            <div className="px-5 pb-5 flex-1">
              <div className="space-y-[16px]">
                {topSelling.map((item) => (
                  <div key={item.rank} className="flex items-center gap-3">
                    <div className="h-[30px] w-[30px] rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>
                      {item.rank}
                    </div>
                    <div className="h-[44px] w-[44px] rounded-[9px] overflow-hidden shrink-0 bg-gray-100 relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.name ?? ""} fill sizes="44px" className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate" style={{ color: COLORS.text }}>{item.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>{item.orders} orders</p>
                    </div>
                    <div className="text-[12px] font-semibold" style={{ color: COLORS.green }}>
                      ₹{item.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
                {topSelling.length === 0 && (
                  <p className="text-[12px] text-center py-4" style={{ color: COLORS.textMuted }}>No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Row 2 */}
      <div className="grid gap-[18px] xl:grid-cols-3">
        {/* Left Column (Menu & Donut) */}
        <div className="col-span-1 grid gap-[18px]">
          <div className={cardClasses} style={cardStyles}>
            <div className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Menu Performance</h2>
              <button className="text-[10px] font-semibold hover:underline" style={{ color: COLORS.green }} onClick={() => router.push("/kitchen/dashboard/menu")}>View All</button>
            </div>
            <div className="px-5 pb-5 flex items-center justify-between gap-2">
              <div className="relative h-[120px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="100%"
                      stroke="none"
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[16px] font-bold leading-tight" style={{ color: COLORS.text }}>{totalMenuItems}</span>
                  <span className="text-[9px]" style={{ color: COLORS.textMuted }}>Total Items</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 ml-4">
                {donutData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span style={{ color: COLORS.textSecondary }}>{item.name}</span>
                    </div>
                    <span style={{ color: COLORS.textMuted }}>
                      {item.value} ({totalMenuItems > 0 ? Math.round((item.value / totalMenuItems) * 100) : 0}%)
                    </span>
                  </div>
                ))}
                {donutData.length === 0 && (
                  <p className="text-[10px] text-center py-3" style={{ color: COLORS.textMuted }}>No menu items yet</p>
                )}
              </div>
            </div>
          </div>

          <div className={cardClasses} style={cardStyles}>
            <div className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Customer Feedback</h2>
              <button className="text-[10px] font-semibold hover:underline" style={{ color: COLORS.green }} onClick={() => router.push("/kitchen/dashboard/reviews")}>View All</button>
            </div>
            <div className="px-5 pb-5 space-y-[16px]">
              {(data.reviews || []).slice(0, 2).map((review: KitchenReview) => {
                const avgRating = review.tasteRating ?? review.rating ?? 0
                return (
                  <div key={review.id}>
                    <div className="flex gap-3">
                      <Avatar className="h-[42px] w-[42px]" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>
                        <AvatarFallback className="font-semibold text-sm bg-transparent">
                          {review.customerName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: COLORS.textSecondary }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < Math.floor(avgRating) ? "fill-current" : "")} style={{ color: i < Math.floor(avgRating) ? COLORS.yellow : COLORS.borderSoft }} />
                            ))}
                            <span className="ml-1">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                        {review.comment && (
                          <p className="text-[10px] mt-1.5 mb-1.5" style={{ color: COLORS.textMuted }}>
                            {review.comment}
                          </p>
                        )}
                        <p className="text-[10px]" style={{ color: COLORS.textLight }}>
                          {review.customerName && <span style={{ color: COLORS.textSecondary }}>{review.customerName} • </span>}
                          {new Date(review.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {(data.reviews || []).length === 0 && (
                <p className="text-[12px] text-center py-4" style={{ color: COLORS.textMuted }}>No reviews yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Center & Right Column */}
        <div className="col-span-1 xl:col-span-2 grid gap-[18px]">
          <div className={cardClasses} style={cardStyles}>
            <div className="pb-3 pt-5 px-5 flex flex-row items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: COLORS.green }} strokeWidth={2} />
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Today at a Glance</h2>
            </div>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="rounded-[10px] p-4 flex items-center gap-4 bg-white border" style={{ borderColor: COLORS.border }}>
                  <div className="h-[44px] w-[44px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.orangeSoft }}>
                    <ChefHat className="h-[22px] w-[22px]" style={{ color: COLORS.orange }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: COLORS.text }}>Preparing</p>
                    <div className="text-[18px] font-bold leading-none" style={{ color: COLORS.text }}>{preparingCount}</div>
                    <p className="text-[10px] mt-1" style={{ color: COLORS.textMuted }}>Orders</p>
                  </div>
                </div>
                <div className="rounded-[10px] p-4 flex items-center gap-4 bg-white border" style={{ borderColor: COLORS.border }}>
                  <div className="h-[44px] w-[44px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.greenSoft }}>
                    <ShoppingBag className="h-[22px] w-[22px]" style={{ color: COLORS.green }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: COLORS.text }}>Ready to Pickup</p>
                    <div className="text-[18px] font-bold leading-none" style={{ color: COLORS.text }}>{readyCount}</div>
                    <p className="text-[10px] mt-1" style={{ color: COLORS.textMuted }}>Orders</p>
                  </div>
                </div>
                <div className="rounded-[10px] p-4 flex items-center gap-4 bg-white border" style={{ borderColor: COLORS.border }}>
                  <div className="h-[44px] w-[44px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.blueSoft }}>
                    <Bike className="h-[22px] w-[22px]" style={{ color: COLORS.blue }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: COLORS.text }}>Out for Delivery</p>
                    <div className="text-[18px] font-bold leading-none" style={{ color: COLORS.text }}>{outCount}</div>
                    <p className="text-[10px] mt-1" style={{ color: COLORS.textMuted }}>Orders</p>
                  </div>
                </div>
                <div className="rounded-[10px] p-4 flex items-center gap-4 bg-white border" style={{ borderColor: COLORS.border }}>
                  <div className="h-[44px] w-[44px] rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.greenSoft }}>
                    <CircleCheck className="h-[22px] w-[22px]" style={{ color: COLORS.green }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: COLORS.text }}>Delivered</p>
                    <div className="text-[18px] font-bold leading-none" style={{ color: COLORS.text }}>{deliveredCount}</div>
                    <p className="text-[10px] mt-1" style={{ color: COLORS.textMuted }}>Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClasses} style={cardStyles}>
            <div className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Recent Orders</h2>
              <button className="text-[10px] font-semibold hover:underline" style={{ color: COLORS.green }} onClick={() => router.push("/kitchen/dashboard/orders")}>View All</button>
            </div>
            <div className="px-5 pb-3">
              <div className="space-y-[10px]">
                {recentOrders.slice(0, 5).map((order: KitchenOrder) => {
                  const status = (order.status || "").toLowerCase()
                  const isDelivered = status === "delivered" || status === "completed"
                  const isPreparing = status === "preparing" || status === "confirmed"
                  const isReady = status === "ready"
                  const isOut = status.includes("out")
                  
                  let badgeClass = "bg-gray-100 text-gray-600"
                  let displayStatus = order.status

                  if (isDelivered) {
                    badgeClass = "bg-[#EAF5ED] text-[#0D5F23]"
                    displayStatus = "Delivered"
                  } else if (isPreparing) {
                    badgeClass = "bg-[#FFF1E8] text-[#F96307]"
                    displayStatus = "Preparing"
                  } else if (isReady) {
                    badgeClass = "bg-[#EAF5ED] text-[#0D5F23]"
                    displayStatus = "Ready"
                  } else if (isOut) {
                    badgeClass = "bg-[#EEF6FF] text-[#3A91FB]"
                    displayStatus = "Out for Delivery"
                  }

                  return (
                    <div key={order.id} className="flex items-center justify-between gap-3 text-[12px] pb-[10px]" style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}>
                      <div className="w-16" style={{ color: COLORS.textMuted }}>
                        #{order.id.slice(0, 6)}
                      </div>
                      <div className="w-20 truncate font-medium" style={{ color: COLORS.text }}>
                        {order.customerName?.split(' ')[0]}
                      </div>
                      <div className="w-28 flex justify-center">
                        <span className={`text-[9px] h-[20px] px-2 rounded-[6px] flex items-center justify-center font-medium ${badgeClass}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <div className="w-16 text-right hidden sm:block" style={{ color: COLORS.textMuted }}>
                        {order.time}
                      </div>
                      <div className="w-12 text-right font-medium" style={{ color: COLORS.textSecondary }}>
                        ₹{order.amount}
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: COLORS.textLight }} />
                    </div>
                  )
                })}
                {recentOrders.length === 0 && (
                  <p className="text-[12px] text-center py-4" style={{ color: COLORS.textMuted }}>No orders for this date</p>
                )}
              </div>
            </div>
          </div>

          <div className={cardClasses} style={cardStyles}>
            <div className="pb-3 pt-5 px-5">
              <h2 className="text-[14px] font-semibold" style={{ color: COLORS.text }}>Quick Actions</h2>
            </div>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[14px]">
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/menu")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}><Plus className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>Add Menu Item</span>
                </button>
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/menu")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.orangeSoft, color: COLORS.orange }}><Edit className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>Manage Menu</span>
                </button>
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/orders")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.blueSoft, color: COLORS.blue }}><ShoppingBag className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>View Orders</span>
                </button>
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/profile")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}><Timer className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>Update Timings</span>
                </button>
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/payments")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}><Building2 className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>Bank Details</span>
                </button>
                <button className="flex items-center justify-start gap-3 h-[46px] rounded-[10px] bg-white border hover:bg-gray-50 transition-colors px-3" style={{ borderColor: COLORS.border }} onClick={() => router.push("/kitchen/dashboard/profile")}>
                  <div className="flex items-center justify-center h-[26px] w-[26px] rounded-[6px]" style={{ backgroundColor: COLORS.purpleSoft, color: COLORS.purple }}><UserRound className="h-[14px] w-[14px]" /></div>
                  <span className="text-[11px] font-medium" style={{ color: COLORS.textSecondary }}>Kitchen Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <div className="rounded-[12px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border" style={{ backgroundColor: COLORS.surfaceSoft, borderColor: '#DCE6E0' }}>
        <div className="flex items-center gap-4">
          <div className="relative h-[36px] w-[36px]">
             <Image src="/kitchen/trophy.webp" alt="Trophy" fill sizes="36px" className="object-contain" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: COLORS.text }}>Great Job! 🎉</h3>
            <p className="text-[10px] mt-0.5" style={{ color: COLORS.textSecondary }}>
              You have received {s.todayOrders} orders today and maintained an excellent rating!
            </p>
          </div>
        </div>
        <button className="px-4 h-[35px] rounded-[7px] font-medium text-[11px] flex items-center gap-1.5 transition-colors" 
          style={{ backgroundColor: 'transparent', border: `1px solid ${COLORS.green}`, color: COLORS.green }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.greenSoft}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => router.push("/kitchen/dashboard/orders")}>
          View Full Report <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  )
}
