"use client"

import {
  Banknote,
  CheckCircle,
  ChefHat,
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
  Utensils,
  Truck,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartBarLabel } from "@/components/ui/bar-chart"
import { ChartLineDots } from "@/components/ui/line-chart"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import { ChartPieSimple } from "@/components/ui/pie-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"
import { getAdminDashboardData } from "@/actions/admin/dashboard"
import { notFound } from "next/navigation"

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex gap-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    notFound()
  }

  const s = data.stats

  const statsCards = [
    { title: "Total Revenue", value: `₹${s.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
    { title: "Today's Revenue", value: `₹${s.todayRevenue.toLocaleString()}`, icon: Banknote, color: "text-green-600" },
    { title: "Today's Orders", value: s.todayOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { title: "Completed Orders", value: s.completedOrders.toString(), icon: CheckCircle, color: "text-green-600" },
    { title: "Pending Orders", value: s.pendingOrders.toString(), icon: Clock, color: "text-orange-600" },
    { title: "Cancelled Orders", value: s.cancelledOrders.toString(), icon: XCircle, color: "text-red-600" },
    { title: "Active Customers", value: s.activeCustomers.toString(), icon: Users, color: "text-indigo-600" },
    { title: "Kitchen Partners", value: s.kitchenPartners.toString(), icon: ChefHat, color: "text-purple-600" },
    { title: "Delivery Partners", value: s.deliveryPartners.toString(), icon: Truck, color: "text-cyan-600" },
    { title: "Menu Items", value: s.menuItems.toString(), icon: Utensils, color: "text-rose-600" },
  ]

  const revenueTrendConfig = {
    revenue: { label: "Revenue (₹)", color: "var(--chart-1)" },
    orders: { label: "Orders", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const ordersTimeSlotConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const vegNonVegConfig = {
    count: { label: "Count" },
    veg: { label: "Veg", color: "var(--chart-1)" },
    nonveg: { label: "Non-Veg", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const orderStatusConfig = {
    count: { label: "Count" },
    confirmed: { label: "Pending", color: "var(--chart-1)" },
    preparing: { label: "Preparing", color: "var(--chart-2)" },
    completed: { label: "Completed", color: "var(--chart-3)" },
    cancelled: { label: "Cancelled", color: "var(--chart-4)" },
  } satisfies ChartConfig

  const topSellingConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-3.5 w-3.5 shrink-0 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartLineDots
          data={data.revenueTrend}
          config={revenueTrendConfig}
          title="Revenue Trend"
          description="Monthly"
          dataKeys={["revenue", "orders"]}
          xKey="period"
        />
        <ChartBarLabel
          data={data.ordersByTimeSlot}
          config={ordersTimeSlotConfig}
          title="Orders by Time Slot"
          description="Breakfast / Lunch / Snacks / Dinner"
          dataKey="orders"
          xKey="slot"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ChartPieDonut
          data={data.vegNonVeg}
          config={vegNonVegConfig}
          title="Veg vs Non-Veg"
          description="Menu distribution"
          dataKey="count"
          nameKey="type"
        />
        <ChartPieSimple
          data={data.orderStatusDist}
          config={orderStatusConfig}
          title="Order Status"
          description="All orders"
          dataKey="count"
          nameKey="status"
        />
        <ChartBarLabel
          data={data.topSelling}
          config={topSellingConfig}
          title="Top Selling Foods"
          description="Most ordered items"
          dataKey="orders"
          xKey="item"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Kitchen Partners</CardTitle>
            <p className="text-sm text-muted-foreground">Based on: Orders, Revenue, Rating</p>
          </CardHeader>
          <CardContent>
            {data.topKitchens.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No kitchen data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kitchen</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topKitchens.map((k, idx) => (
                    <TableRow key={`${k.name}-${idx}`}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell>{k.orders}</TableCell>
                      <TableCell>₹{k.revenue.toLocaleString()}</TableCell>
                      <TableCell>{k.rating > 0 ? `${k.rating} ★` : "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Partner Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.deliveryPerformance.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No delivery data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Partner</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.deliveryPerformance.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.deliveries}</TableCell>
                      <TableCell>{d.rating > 0 ? `${d.rating} ★` : "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
