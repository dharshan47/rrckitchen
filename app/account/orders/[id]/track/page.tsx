"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Package, Check, ChefHat, Bike, Loader2, ShieldCheck, XCircle } from "lucide-react"
import { Button, Card, Badge } from "@/components/ui"
import { useSession } from "@/lib/auth-client"
import { getOrderForTracking } from "@/actions/orders/orders"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { cn } from "@/lib/utils"

const statusFlow: { key: string; label: string; icon: typeof Check }[] = [
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "READYFORPICKUP", label: "Ready for Pickup", icon: Bike },
  { key: "COMPLETED", label: "Delivered", icon: Package },
]

const statusColors: Record<string, string> = {
  CONFIRMED: "text-blue-600 bg-blue-100",
  PREPARING: "text-amber-600 bg-amber-100",
  READYFORPICKUP: "text-green-600 bg-green-100",
  COMPLETED: "text-gray-600 bg-gray-100",
  CANCELLED: "text-red-600 bg-red-100",
  REFUNDED: "text-purple-600 bg-purple-100",
}

function getStatusIndex(status: string): number {
  return statusFlow.findIndex((s) => s.key === status)
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const { data: session, isPending: sessionLoading } = useSession()

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () => getOrderForTracking(orderId),
    enabled: !!session?.user && !!orderId,
    refetchInterval: 15_000,
  })

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center space-y-4">
          <XCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-destructive text-sm">Failed to load order</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Retry
          </Button>
          <Button asChild variant="link" size="sm">
            <Link href="/account/orders">Back to orders</Link>
          </Button>
        </div>
      </main>
    )
  }

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED"
  const currentIdx = isCancelled ? 0 : getStatusIndex(order.status)
  const showOtp = order.status === "READYFORPICKUP" && order.deliveryOtp

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Live Tracking</h1>
            <p className="text-sm text-muted-foreground">#{orderId.slice(0, 8)}</p>
          </div>
          <Badge className={cn("text-xs font-semibold ml-auto", statusColors[order.status] || "")}>
            {order.status === "READYFORPICKUP" ? "Ready for Pickup" : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
          </Badge>
        </div>

        {order.kitchenLat != null && order.kitchenLng != null && (
          <LiveOrderTrackingMap
            orderId={orderId}
            kitchenLat={order.kitchenLat}
            kitchenLng={order.kitchenLng}
            customerLat={order.customerLat ?? undefined}
            customerLng={order.customerLng ?? undefined}
            deliveryPersonLat={order.deliveryPersonLat ?? undefined}
            deliveryPersonLng={order.deliveryPersonLng ?? undefined}
          />
        )}

        <Card className="overflow-hidden">
          <div className="p-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} &middot; ₹{item.unitPrice} &middot; {item.kitchenName}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {showOtp && (
            <div className="mx-4 mb-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3 text-center">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Delivery Code
              </p>
              <p className="mt-1 text-3xl font-bold tracking-[0.3em] text-amber-900 font-mono">
                {order.deliveryOtp}
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Share this code with the delivery partner when they arrive
              </p>
            </div>
          )}

          {order.deliveryOtpVerifiedAt && (
            <div className="mx-4 mb-4 rounded-lg border-2 border-green-200 bg-green-50 p-3 text-center">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> Delivery Confirmed
              </p>
              <p className="mt-1 text-xs text-green-600">
                Order delivered and verified
              </p>
            </div>
          )}

          {!isCancelled && (
            <div className="px-4 pb-4">
              <div className="flex items-start justify-between">
                {statusFlow.map((step, idx) => {
                  const done = idx <= currentIdx
                  const current = idx === currentIdx && !isCancelled
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-1.5 relative flex-1">
                      {idx > 0 && (
                        <div
                          className={cn(
                            "absolute top-3.5 -left-1/2 h-0.5 w-full -translate-y-1/2 transition-all duration-700 ease-in-out",
                            done ? "bg-primary" : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                          done
                            ? "bg-primary text-primary-foreground"
                            : current
                              ? "bg-primary/20 text-primary ring-2 ring-primary/40 animate-pulse"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done && idx < currentIdx ? <Check className="h-3.5 w-3.5" /> : <span>{idx + 1}</span>}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold text-center leading-tight max-w-16",
                          done ? "text-primary" : current ? "text-primary font-bold" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <XCircle className="h-4 w-4" />
                {order.status === "REFUNDED" ? "Refund processed" : "Order cancelled"}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/10">
            <p className="text-sm font-semibold">Total: ₹{order.totalAmount}</p>
            <p className="text-xs text-muted-foreground">{order.customerAddress}</p>
          </div>
        </Card>
      </div>
    </main>
  )
}
