"use client"

import { useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLineDots } from "@/components/ui/line-chart"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ShoppingBag, Clock, IndianRupee, Star, Users, TrendingUp, 
  ChefHat, Package, Truck, CheckCircle, ChevronRight,
  Plus, Edit, Eye, Timer, Building2, UserCircle2, Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"

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
}

type KitchenReview = {
  id: string
  rating?: number | null
  tasteRating?: number | null
  comment?: string | null
  customerName?: string | null
  createdAt: string
}

export default function DashboardPageClient() {
  const greeting = useMemo(() => getGreeting(), [])
  const router = useRouter()
  const data = useKitchenDashboardData()

  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col gap-1 mb-2">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-5 w-96 rounded mt-2" />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="px-6 pb-6 h-80">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
            <div className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="px-6 pb-6 flex-1 space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3.5 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 grid gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6 flex flex-row items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-7 w-10" />
                      <Skeleton className="h-2.5 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="px-6 pb-6 h-56">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="px-6 pb-6 space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="px-6 pb-6 space-y-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6">
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-72" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    )
  }

  const s = data.stats || {}
  const k = data.kitchen || {}

  const revenueConfig = {
    revenue: { label: "Revenue (₹)", color: "#10B981" },
    orders: { label: "Orders", color: "#F97316" },
  } satisfies ChartConfig

  const vegNonVegConfig = {
    count: { label: "Count" },
    veg: { label: "Veg", color: "#10B981" },
    nonveg: { label: "Non-Veg", color: "#FF6B00" },
  } satisfies ChartConfig

  const vegNonVegData = [
    { type: "Veg", count: data.vegCount, fill: "var(--color-veg)" },
    { type: "Non-Veg", count: data.nonVegCount ?? 0, fill: "var(--color-nonveg)" },
  ]

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-[24px] md:text-[26px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          {(() => {
            const displayName = k.userName || k.displayName
            return `${greeting}${displayName ? `, ${displayName.split(' ')[0]}` : ""}!`
          })()} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-[14px] text-gray-500 font-medium">
          Here&apos;s what&apos;s happening in your kitchen today.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Total Orders</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.todayOrders}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Pending Orders</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.todayPending}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Today&apos;s Revenue</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{s.todayRevenue.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Avg. Rating</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{k.avgRating ?? "New"}</div>
              {ratingLabel && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-600 mt-1">
                  <Star className="h-3 w-3 fill-yellow-500" /> {ratingLabel}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Total Customers</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.customers.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500">Menu Items</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.menuItems}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Charts and Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Overview Chart */}
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
            <CardTitle className="text-[16px] font-bold text-gray-900">Order Overview</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium rounded-lg" onClick={() => router.push("/kitchen/dashboard/orders")}>
              This Week <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="px-2 pb-6">
            <ChartLineDots
              data={data.monthlyRevenue}
              config={revenueConfig}
              title=""
              description=""
              dataKeys={["revenue", "orders"]}
              xKey="period"
            />
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="rounded-2xl border-none shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
            <CardTitle className="text-[16px] font-bold text-gray-900">Top Selling Items</CardTitle>
            <button className="text-xs font-bold text-green-600 hover:text-green-700" onClick={() => router.push("/kitchen/dashboard/menu")}>View All</button>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1">
            <div className="space-y-4">
              {topSelling.map((item) => (
                <div key={item.rank} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-md bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.rank}
                  </div>
                  <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name ?? ""} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500">{item.orders} orders</p>
                  </div>
                  <div className="text-[13px] font-bold text-green-600">
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
              {topSelling.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 grid gap-6">
          {/* Today at a Glance */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle className="text-[16px] font-bold text-gray-900">Today at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Preparing</p>
                    <div className="text-xl font-bold text-gray-900 leading-none">{preparingCount}</div>
                    <p className="text-[10px] text-gray-400 mt-1">Orders</p>
                  </div>
                </div>
                <div className="bg-green-50/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Ready to Pickup</p>
                    <div className="text-xl font-bold text-gray-900 leading-none">{readyCount}</div>
                    <p className="text-[10px] text-gray-400 mt-1">Orders</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Out for Delivery</p>
                    <div className="text-xl font-bold text-gray-900 leading-none">{outCount}</div>
                    <p className="text-[10px] text-gray-400 mt-1">Orders</p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Delivered</p>
                    <div className="text-xl font-bold text-gray-900 leading-none">{deliveredCount}</div>
                    <p className="text-[10px] text-gray-400 mt-1">Orders</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Performance & Customer Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-[16px] font-bold text-gray-900">Menu Composition</CardTitle>
                <button className="text-xs font-bold text-green-600 hover:text-green-700" onClick={() => router.push("/kitchen/dashboard/menu")}>View All</button>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ChartPieDonut
                  data={vegNonVegData}
                  config={vegNonVegConfig}
                  title=""
                  description=""
                  dataKey="count"
                  nameKey="type"
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-[16px] font-bold text-gray-900">Customer Feedback</CardTitle>
                <button className="text-xs font-bold text-green-600 hover:text-green-700" onClick={() => router.push("/kitchen/dashboard/reviews")}>View All</button>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {(data.reviews || []).slice(0, 2).map((review: KitchenReview) => {
                    const avgRating = review.tasteRating ?? review.rating ?? 0
                    return (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 bg-green-50 text-green-600">
                            <AvatarFallback className="font-bold text-sm bg-green-50">
                              {review.customerName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            {avgRating > 0 && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={cn("h-3.5 w-3.5", i < avgRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200")} />
                                ))}
                                <span className="ml-1">{avgRating.toFixed(1)}</span>
                              </div>
                            )}
                            {review.comment && (
                              <p className="text-[12px] text-gray-600 leading-snug">
                                {review.comment}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 pt-1">
                              {review.customerName && <span>{review.customerName} • </span>}
                              {new Date(review.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(data.reviews || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No reviews yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders & Quick Actions */}
        <div className="grid gap-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-gray-900">Recent Orders</CardTitle>
              <button className="text-xs font-bold text-green-600 hover:text-green-700" onClick={() => router.push("/kitchen/dashboard/orders")}>View All</button>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {(data.orders || []).slice(0, 5).map((order: KitchenOrder) => {
                  const status = (order.status || "").toLowerCase()
                  const isDelivered = status === "delivered" || status === "completed"
                  const isPreparing = status === "preparing" || status === "confirmed"
                  const isReady = status === "ready"
                  const isOut = status.includes("out")
                  
                  let badgeClass = "bg-gray-100 text-gray-600"
                  let displayStatus = order.status

                  if (isDelivered) {
                    badgeClass = "bg-green-100 text-green-700"
                    displayStatus = "Delivered"
                  } else if (isPreparing) {
                    badgeClass = "bg-orange-100 text-orange-700"
                    displayStatus = "Preparing"
                  } else if (isReady) {
                    badgeClass = "bg-emerald-100 text-emerald-700"
                    displayStatus = "Ready"
                  } else if (isOut) {
                    badgeClass = "bg-blue-100 text-blue-700"
                    displayStatus = "Out for Delivery"
                  }

                  return (
                    <div key={order.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="text-[12px] font-medium text-gray-500 w-16">
                        #{order.id.slice(0, 6)}
                      </div>
                      <div className="text-[13px] font-bold text-gray-900 w-20 truncate">
                        {order.customerName?.split(' ')[0]}
                      </div>
                      <div className="w-24 flex justify-start">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 hidden xl:block w-16 text-right">
                        {order.time}
                      </div>
                      <div className="text-[13px] font-bold text-gray-900 w-12 text-right">
                        ₹{order.amount}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )
                })}
                {(data.orders || []).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-green-50 hover:border-green-100 hover:text-green-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/menu")}>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Plus className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">Add Menu Item</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-orange-50 hover:border-orange-100 hover:text-orange-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/menu")}>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Edit className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">Manage Menu</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/orders")}>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Eye className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">View Orders</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/profile")}>
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Timer className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">Update Timings</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/payments")}>
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Building2 className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">Bank Details</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors px-1" onClick={() => router.push("/kitchen/dashboard/profile")}>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><UserCircle2 className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold">Kitchen Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-[#ECFDF5] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border border-[#D1FAE5]">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">Great Job! 🎉</h3>
            <p className="text-[13px] font-medium text-gray-600 mt-0.5">
              You have received {s.todayOrders} orders today and maintained an excellent rating!
            </p>
          </div>
        </div>
        <Button className="bg-white text-green-700 hover:bg-green-50 border border-green-200 rounded-xl font-bold text-[13px] shadow-sm" onClick={() => router.push("/kitchen/dashboard/orders")}>
          View Full Report <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

    </div>
  )
}
