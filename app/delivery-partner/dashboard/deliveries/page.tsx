"use client"

import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "../layout"
import { Package, MapPin, Phone, MapPinHouse, CheckCircle, XCircle, Truck, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { CodConfirmationDialog } from "@/components/delivery-partner/cod-confirmation-dialog"

export default function DeliveriesPage() {
  const data = useDeliveryData()
  const queryClient = useQueryClient()
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null)
  const [codConfirmOrder, setCodConfirmOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status, cashCollected }: { orderId: string; status: string; cashCollected?: boolean }) => {
      const res = await fetch("/api/delivery/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, cashCollected }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to update" }))
        throw new Error(err.error || "Failed to update order status")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
      toast.success("Order status updated")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleCodSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
  }, [queryClient])

  const activeDeliveryOrders = data.deliveryOrders.filter(
    (o: Record<string, unknown>) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED"
  )

  const completedDeliveryOrders = data.deliveryOrders.filter(
    (o: Record<string, unknown>) => o.orderStatus === "COMPLETED" || o.orderStatus === "CANCELLED"
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "active"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Active Deliveries
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
            activeTab === "completed"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Completed
        </button>
      </div>

      {activeTab === "active" && (
        <section aria-label="Active delivery orders">
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {activeDeliveryOrders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No active deliveries</p>
              ) : (
                <div className="space-y-4">
                  {activeDeliveryOrders.map((d: Record<string, unknown>, i: number) => (
                    <Card key={`${d.id}-${i}`} className="border-primary/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-semibold truncate">{d.itemName as string}</span>
                              <Badge variant="secondary" className="text-[10px]">Qty: {d.quantity as number}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{d.timeSlot as string}</p>
                          </div>
                          <Badge className={
                            d.orderStatus === "PREPARING" ? "bg-amber-100 text-amber-700" :
                            d.orderStatus === "READYFORPICKUP" ? "bg-blue-100 text-blue-700" :
                            d.orderStatus === "CONFIRMED" ? "bg-purple-100 text-purple-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {d.orderStatus === "READYFORPICKUP" ? "Ready" : (d.orderStatus as string)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Customer
                            </p>
                            <p className="font-medium">{d.customerName as string}</p>
                            <a href={`tel:${d.customerPhone}`} className="flex items-center gap-1 text-primary hover:underline text-xs">
                              <Phone className="h-3 w-3" /> {d.customerPhone as string}
                            </a>
                            <p className="text-xs text-muted-foreground truncate">{d.customerAddress as string}</p>
                          </div>
                          <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <MapPinHouse className="h-3 w-3" /> Kitchen
                            </p>
                            <p className="font-medium">{d.kitchenName as string}</p>
                            <a href={`tel:${d.kitchenPhone}`} className="flex items-center gap-1 text-primary hover:underline text-xs">
                              <Phone className="h-3 w-3" /> {d.kitchenPhone as string}
                            </a>
                            <p className="text-xs text-muted-foreground truncate">{d.kitchenAddress as string}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {d.orderStatus === "READYFORPICKUP" && (
                            <Button size="sm" variant="outline" className="text-xs gap-1"
                              onClick={() => statusMutation.mutate({ orderId: d.id as string, status: "PICKEDUP" })}
                              disabled={statusMutation.isPending}
                            >
                              <Truck className="h-3 w-3" /> Picked Up
                            </Button>
                          )}
                          {d.orderStatus === "PICKEDUP" && (
                            <Button size="sm" variant="outline" className="text-xs gap-1"
                              onClick={() => statusMutation.mutate({ orderId: d.id as string, status: "INTRANSIT" })}
                              disabled={statusMutation.isPending}
                            >
                              <Truck className="h-3 w-3" /> In Transit
                            </Button>
                          )}
                          {(d.orderStatus === "INTRANSIT" || d.orderStatus === "PICKEDUP") && (
                            <>
                              <Button size="sm" variant="default" className="text-xs gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => statusMutation.mutate({
                                  orderId: d.id as string,
                                  status: "DELIVERED",
                                  cashCollected: d.paymentProvider === "CASH_ON_DELIVERY",
                                })}
                                disabled={statusMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3" /> Delivered
                              </Button>
                              {d.paymentProvider === "CASH_ON_DELIVERY" && (
                                <Button size="sm" variant="default" className="text-xs gap-1 bg-amber-600 hover:bg-amber-700"
                                  onClick={() => setCodConfirmOrder(d.id as string)}
                                  disabled={statusMutation.isPending}
                                >
                                  <HandCoins className="h-3 w-3" /> COD Confirm
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" className="text-xs gap-1"
                                onClick={() => statusMutation.mutate({ orderId: d.id as string, status: "FAILED" })}
                                disabled={statusMutation.isPending}
                              >
                                <XCircle className="h-3 w-3" /> Failed
                              </Button>
                            </>
                          )}
                          {(d.kitchenLat && d.kitchenLng) ? (
                            <Button size="sm" variant="secondary" className="text-xs gap-1"
                              onClick={() => setTrackingOrder(trackingOrder === d.id ? null : d.id as string)}
                            >
                              <MapPin className="h-3 w-3" /> {trackingOrder === d.id ? "Hide Map" : "Show Map"}
                            </Button>
                          ) : null}
                        </div>

                        {(() => {
                          const oid = d.id as string;
                          const klat = d.kitchenLat;
                          const klng = d.kitchenLng;
                          if (trackingOrder !== oid || !klat || !klng) return null;
                          return (
                            <LiveOrderTrackingMap
                              orderId={oid}
                              kitchenLat={Number(klat)}
                              kitchenLng={Number(klng)}
                              customerLat={d.customerLat ? Number(d.customerLat) : undefined}
                              customerLng={d.customerLng ? Number(d.customerLng) : undefined}
                            />
                          );
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === "completed" && (
        <section aria-label="Completed delivery orders">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {completedDeliveryOrders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No completed deliveries yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table aria-label="Completed delivery orders table">
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
                        <TableHead scope="col">Status</TableHead>
                        <TableHead scope="col">Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedDeliveryOrders.map((d: Record<string, unknown>, i: number) => (
                        <TableRow key={`${d.id}-${i}`}>
                          <TableCell className="font-medium">{d.itemName as string}</TableCell>
                          <TableCell>{d.quantity as number}</TableCell>
                          <TableCell>{d.timeSlot as string}</TableCell>
                          <TableCell>{d.customerName as string}</TableCell>
                          <TableCell>
                            <a href={`tel:${d.customerPhone}`} className="text-primary hover:underline">
                              {d.customerPhone as string}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{d.customerAddress as string}</TableCell>
                          <TableCell>{d.kitchenName as string}</TableCell>
                          <TableCell>
                            <a href={`tel:${d.kitchenPhone}`} className="text-primary hover:underline">
                              {d.kitchenPhone as string}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              d.orderStatus === "COMPLETED" ? "bg-green-100 text-green-700" :
                              d.orderStatus === "CANCELLED" ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                            }>
                              {d.orderStatus as string}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {d.paymentProvider === "CASH_ON_DELIVERY" ? (
                              <span className="flex items-center gap-1">
                                <HandCoins className="h-3 w-3 text-amber-600" /> COD
                                {d.paymentStatus === "SUCCESS" ? " ✓" : ""}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Online</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <CodConfirmationDialog
        open={!!codConfirmOrder}
        onOpenChange={(open) => { if (!open) setCodConfirmOrder(null) }}
        orderId={codConfirmOrder ?? ""}
        onSuccess={handleCodSuccess}
      />
    </div>
  )
}
