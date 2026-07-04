"use client"

import {
  Users,
  ShoppingBag,
  ChefHat,
  Truck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { getAdminDashboardData } from "@/actions/dashboard"

export default function AdminCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
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
    { title: "Total Customers", value: s.activeCustomers.toString(), icon: Users, color: "text-indigo-600" },
    { title: "Today's Orders", value: s.todayOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { title: "Kitchen Partners", value: s.kitchenPartners.toString(), icon: ChefHat, color: "text-purple-600" },
    { title: "Delivery Partners", value: s.deliveryPartners.toString(), icon: Truck, color: "text-cyan-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Customer Management</h1>
        <p className="text-sm text-muted-foreground">Overview of customers and platform activity</p>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
    </div>
  )
}
