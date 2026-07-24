"use client"

import { useKitchenData } from "./layout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartBarLabel } from "@/components/ui/bar-chart"
import { ChartLineDots } from "@/components/ui/line-chart"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import type { ChartConfig } from "@/components/ui/chart"
import { DollarSign, ShoppingBag, ChefHat, Utensils, TrendingUp, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const data = useKitchenData()
  const s = data.stats

  const revenueConfig = {
    revenue: { label: "Revenue (₹)", color: "var(--chart-1)" },
    orders: { label: "Orders", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const ordersConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const popularFoodConfig = {
    orders: { label: "Orders", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const vegNonVegConfig = {
    count: { label: "Count" },
    veg: { label: "Veg", color: "var(--chart-1)" },
    nonveg: { label: "Non-Veg", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const weeklySalesConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
    target: { label: "Target", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const vegNonVegData: Array<Record<string, string | number>> = [
    { type: "Veg", count: data.vegCount, fill: "var(--color-veg)" },
    { type: "Non-Veg", count: data.nonVegCount ?? 0, fill: "var(--color-nonveg)" },
  ]

  return (
    <div className="space-y-6">
      <section aria-label="Kitchen statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card role="group" aria-label={`Today's Orders: ${s.todayOrders}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayOrders}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`Completed: ${s.todayCompleted}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <ChefHat className="h-4 w-4 text-green-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayCompleted}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`Pending: ${s.todayPending}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Utensils className="h-4 w-4 text-orange-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.todayPending}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`Today's Revenue: ₹${s.todayRevenue.toLocaleString()}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{s.todayRevenue.toLocaleString()}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`This Month Revenue: ₹${s.monthRevenue.toLocaleString()}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{s.monthRevenue.toLocaleString()}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`Customers: ${s.customers}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.customers}</div></CardContent>
          </Card>
          <Card role="group" aria-label={`Menu Items: ${s.menuItems}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-rose-600" aria-hidden="true" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.menuItems}</div></CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartLineDots
          data={data.monthlyRevenue}
          config={revenueConfig}
          title="Revenue"
          description="Monthly"
          dataKeys={["revenue", "orders"]}
          xKey="period"
        />
        <ChartBarLabel
          data={data.weeklySales}
          config={ordersConfig}
          title="Orders"
          description="This week"
          dataKey="sales"
          xKey="day"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartBarLabel
          data={data.popularFood}
          config={popularFoodConfig}
          title="Popular Food"
          description="Most ordered items"
          dataKey="orders"
          xKey="item"
        />
        <ChartPieDonut
          data={vegNonVegData}
          config={vegNonVegConfig}
          title="Veg vs Non-Veg"
          description="Menu distribution"
          dataKey="count"
          nameKey="type"
        />
        <ChartLineDots
          data={data.weeklySales}
          config={weeklySalesConfig}
          title="Weekly Sales"
          description="vs Target"
          dataKeys={["sales", "target"]}
          xKey="day"
        />
      </div>

      <section aria-label="Customer reviews">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.reviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {data.reviews.slice(0, 10).map((review: { id: string; customerName: string; itemName: string; rating: number; tasteRating: number | null; packagingRating: number | null; portionSizeRating: number | null; comment: string | null; createdAt: string }) => {
                  const avgRating = review.tasteRating || review.rating
                  return (
                    <div key={review.id} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{review.customerName || "Customer"}</span>
                          <span className="text-[10px] text-muted-foreground">on {review.itemName}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={cn("h-3 w-3", i < avgRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        {review.tasteRating != null && <span>Taste: {review.tasteRating}/5</span>}
                        {review.packagingRating != null && <span>Packaging: {review.packagingRating}/5</span>}
                        {review.portionSizeRating != null && <span>Portion: {review.portionSizeRating}/5</span>}
                      </div>
                      {review.comment && <p className="text-xs text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>}
                      <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>


    </div>
  )
}
