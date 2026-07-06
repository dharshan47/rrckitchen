"use client"

import { useKitchenData } from "../layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone } from "lucide-react"
import { updateOrderStatus } from "@/actions/orders"
import { toast } from "sonner"

export default function OrdersPage() {
  const data = useKitchenData()

  return (
    <section aria-label="Orders for pickup">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {data.orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "Completed" ? "bg-green-100 text-green-700" :
                          order.status === "Preparing" ? "bg-blue-100 text-blue-700" :
                          order.status === "Confirmed" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-sm font-medium">{order.itemName} × {order.quantity}</p>
                      <p className="text-xs text-muted-foreground">{order.timeSlot} • {order.time} • ₹{order.amount}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "Confirmed" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" aria-label={`Accept order ${order.id.substring(0, 8)}`} onClick={async () => {
                            const res = await updateOrderStatus(order.id, "PREPARING");
                            if (res.success) { toast.success("Order accepted"); } else { toast.error(res.error); }
                          }}>Accept</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" aria-label={`Reject order ${order.id.substring(0, 8)}`} onClick={async () => {
                            const res = await updateOrderStatus(order.id, "CANCELLED");
                            if (res.success) { toast.success("Order rejected"); } else { toast.error(res.error); }
                          }}>Reject</Button>
                        </>
                      )}
                      {order.status === "Preparing" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" aria-label={`Mark order ${order.id.substring(0, 8)} as ready for pickup`} onClick={async () => {
                          const res = await updateOrderStatus(order.id, "READYFORPICKUP");
                          if (res.success) { toast.success("Order ready for pickup"); } else { toast.error(res.error); }
                        }}>Ready for Pickup</Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">Customer:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline">{order.customerPhone}</a>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      <span>{order.customerAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
