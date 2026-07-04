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
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartBarLabel } from "@/components/charts/bar-chart"
import { ChartLineDots } from "@/components/charts/line-chart"
import { ChartPieDonut } from "@/components/charts/donut-chart"
import { ChartPieSimple } from "@/components/charts/pie-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"
import { getAdminDashboardData } from "@/actions/dashboard"

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unauthorized. Please log in as admin.</p>
        </CardContent>
      </Card>
    )
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
