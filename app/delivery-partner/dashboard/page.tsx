"use client"

import { useDeliveryData } from "./layout"
import { Bike, DollarSign, MapPin, Star, TrendingUp, Trophy, Users, Wallet, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
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
    { title: "Cash in Hand", value: `₹${data.profile.cashInHand ?? 0}`, icon: Wallet, color: "text-amber-600" },
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
                {data.reviews.slice(0, 10).map((review: { id: string; rating: number; speedRating: number | null; behaviorHygiene: boolean | null; comment: string | null; itemName: string; createdAt: string }) => (
                  <div key={review.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Delivery for {review.itemName || "an order"}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      {review.speedRating != null && <span>Speed: {review.speedRating}/5</span>}
                      {review.behaviorHygiene != null && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {review.behaviorHygiene ? "Good" : "Needs Improvement"}
                        </span>
                      )}
                    </div>
                    {review.comment && <p className="text-xs text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>}
                    <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>


    </div>
  )
}