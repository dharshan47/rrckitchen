"use client"

import { useEffect, useState } from "react"
import { Bike, DollarSign, MapPin, Star, TrendingUp, Trophy, Users } from "lucide-react"
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
import { getDeliveryDashboardData } from "@/actions/dashboard"

type DeliveryData = Awaited<ReturnType<typeof getDeliveryDashboardData>>

export default function DeliveryPartnerDashboard() {
  const [data, setData] = useState<DeliveryData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeliveryDashboardData().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Unauthorized or no delivery partner profile found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = data.stats
  const profile = data.profile

  const stats = [
    { title: "Total Deliveries", value: s.totalAssignments.toString(), icon: Bike, color: "text-blue-600" },
    { title: "Completed", value: s.completedAssignments.toString(), icon: Trophy, color: "text-green-600" },
    { title: "Pending", value: s.pendingAssignments.toString(), icon: Users, color: "text-orange-600" },
    { title: "Cancelled", value: s.cancelledAssignments.toString(), icon: MapPin, color: "text-red-600" },
    { title: "Today's Earnings", value: `₹${s.todayEarnings}`, icon: DollarSign, color: "text-emerald-600" },
    { title: "Weekly Earnings", value: `₹${s.weeklyEarnings}`, icon: DollarSign, color: "text-emerald-600" },
    { title: "Monthly Earnings", value: `₹${s.monthlyEarnings}`, icon: TrendingUp, color: "text-purple-600" },
    { title: "Rating", value: s.rating > 0 ? `${s.rating} ★` : "N/A", icon: Star, color: "text-yellow-600" },
    { title: "Distance Travelled", value: `${s.distanceTravelled} km`, icon: MapPin, color: "text-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Bike className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Delivery Partner Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Welcome, {profile.name}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Online</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {data.deliveryOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No deliveries assigned yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Delivery Hub</TableHead>
                    <TableHead>Delivery Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.deliveryOrders.map((d, i) => (
                    <TableRow key={`${d.id}-${i}`}>
                      <TableCell className="font-medium">{d.itemName}</TableCell>
                      <TableCell>{d.quantity}</TableCell>
                      <TableCell>{d.timeSlot}</TableCell>
                      <TableCell>{d.kitchenHub}</TableCell>
                      <TableCell className="max-w-xs truncate">{d.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kitchen Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {data.assignments.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No assignments yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Delivery Hub</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id.substring(0, 8)}...</TableCell>
                      <TableCell>{a.kitchen}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.status === "Delivered" ? "bg-green-100 text-green-700" :
                          a.status === "Pending" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>{a.status}</span>
                      </TableCell>
                      <TableCell>{a.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Details</p>
                <p className="font-medium">{profile.bankAccount ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UPI</p>
                <p className="font-medium">{profile.upi ?? "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
