"use client"

import { useDeliveryData } from "./layout"
import { Bike, DollarSign, MapPin, Star, TrendingUp, Trophy, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DeliveryPartnerDashboard() {
  const data = useDeliveryData()
  const s = data.stats

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
    <div className="space-y-4 md:space-y-6">
      <section aria-label="Delivery statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} role="group" aria-label={`${stat.title}: ${stat.value}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Delivery orders with customer and kitchen details">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {data.deliveryOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No deliveries assigned yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table aria-label="Delivery orders table">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Menu Item</TableHead>
                      <TableHead scope="col">Qty</TableHead>
                      <TableHead scope="col">Time Slot</TableHead>
                      <TableHead scope="col">Customer Name</TableHead>
                      <TableHead scope="col">Customer Phone</TableHead>
                      <TableHead scope="col">Delivery Address</TableHead>
                      <TableHead scope="col">Kitchen Name</TableHead>
                      <TableHead scope="col">Kitchen Phone</TableHead>
                      <TableHead scope="col">Kitchen Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.deliveryOrders.map((d, i) => (
                      <TableRow key={`${d.id}-${i}`}>
                        <TableCell className="font-medium">{d.itemName}</TableCell>
                        <TableCell>{d.quantity}</TableCell>
                        <TableCell>{d.timeSlot}</TableCell>
                        <TableCell>{d.customerName}</TableCell>
                        <TableCell>
                          <a href={`tel:${d.customerPhone}`} className="text-primary hover:underline">
                            {d.customerPhone}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{d.customerAddress}</TableCell>
                        <TableCell>{d.kitchenName}</TableCell>
                        <TableCell>
                          <a href={`tel:${d.kitchenPhone}`} className="text-primary hover:underline">
                            {d.kitchenPhone}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{d.kitchenAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Kitchen assignments">
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {data.assignments.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No assignments yet</p>
            ) : (
              <Table aria-label="Kitchen assignments table">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">ID</TableHead>
                    <TableHead scope="col">Delivery Hub</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Date</TableHead>
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
      </section>
    </div>
  )
}
