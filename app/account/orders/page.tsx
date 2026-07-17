"use client"

import Link from "next/link"
import Image from 'next/image';
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Package, Check, ChefHat, Bike, XCircle, RefreshCw, Loader2, Star, ShieldCheck } from "lucide-react"
import { Button, Card, Badge } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useSession } from "@/lib/auth-client"
import { getUserOrders, cancelOrder, type UserOrder } from "@/actions/orders/orders"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DeliveryRatingDialog } from "@/components/delivery-partner/delivery-rating-dialog"
import { RatingPrompt } from "@/components/order/rating-prompt"
import { CravingsPopup } from "@/components/order/cravings-popup"

const statusFlow: { key: UserOrder["status"]; label: string; icon: typeof Check }[] = [
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

function getStatusIndex(status: UserOrder["status"]): number {
  return statusFlow.findIndex((s) => s.key === status)
}

export default function AccountOrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, isPending: sessionLoading } = useSession()
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [ratingOrder, setRatingOrder] = useState<{ id: string; deliveryPartnerId: string; deliveryPartnerName: string } | null>(null)
  const [reviewOrder, setReviewOrder] = useState<{ orderId: string; kitchenId: string; deliveryPersonId?: string } | null>(null)
  const [activeOrderId] = useState<string | null>(null)

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getUserOrders,
    enabled: !!session?.user,
    refetchInterval: 30_000,
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Order cancelled successfully")
        queryClient.invalidateQueries({ queryKey: ["orders"] })
      } else {
        toast.error(result.error ?? "Failed to cancel order")
      }
      setCancellingOrder(null)
    },
    onError: () => {
      toast.error("Failed to cancel order")
      setCancellingOrder(null)
    },
  })

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/account/profile" className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-5 w-48 bg-muted rounded animate-pulse mb-3" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 space-y-4">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive text-sm">{error?.message ?? "Failed to load orders"}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="h-14 w-14 text-muted-foreground/40 mx-auto" />
            <h2 className="text-lg font-semibold">No orders yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your orders will appear here once you place them.
            </p>
            <Button asChild><Link href="/menu">Browse Menu</Link></Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={() => setCancellingOrder(order.id)}
                onRateDelivery={() => setRatingOrder({ id: order.id, deliveryPartnerId: order.deliveryPartner?.id ?? "", deliveryPartnerName: order.deliveryPartner?.name ?? "Delivery Partner" })}
                onReview={() => setReviewOrder({
                  orderId: order.id,
                  kitchenId: order.items[0]?.kitchenId ?? order.kitchenPartnerId ?? "",
                  deliveryPersonId: order.deliveryPartner?.id,
                })}
              />
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <CravingsPopup orderId={orders.filter(o => o.status !== "CANCELLED" && o.status !== "REFUNDED" && o.status !== "COMPLETED")[0]?.id || orders[0].id} />
        )}
      </div>

      <Dialog open={!!cancellingOrder} onOpenChange={(open) => { if (!open) setCancellingOrder(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingOrder(null)}>Keep Order</Button>
            <Button
              variant="destructive"
              onClick={() => cancellingOrder && cancelMutation.mutate(cancellingOrder)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeliveryRatingDialog
        open={!!ratingOrder}
        onOpenChange={(open) => { if (!open) setRatingOrder(null) }}
        orderId={ratingOrder?.id ?? ""}
        deliveryPartnerId={ratingOrder?.deliveryPartnerId ?? ""}
        deliveryPartnerName={ratingOrder?.deliveryPartnerName ?? "Delivery Partner"}
      />

      <Dialog open={!!reviewOrder} onOpenChange={(open) => { if (!open) setReviewOrder(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" /> Rate Your Order
            </DialogTitle>
            <DialogDescription>Share your experience with the food and delivery</DialogDescription>
          </DialogHeader>
          {reviewOrder && (
            <RatingPrompt
              orderId={reviewOrder.orderId}
              kitchenId={reviewOrder.kitchenId}
              deliveryPersonId={reviewOrder.deliveryPersonId}
              onComplete={() => {
                setReviewOrder(null)
                queryClient.invalidateQueries({ queryKey: ["orders"] })
                toast.success("Thank you for your review!")
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {activeOrderId && <CravingsPopup orderId={activeOrderId} />}
    </main>
  )
}

function OrderCard({ order, onCancel, onRateDelivery, onReview }: { order: UserOrder; onCancel: () => void; onRateDelivery: () => void; onReview: () => void }) {
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED"
  const canCancel = !isCancelled && (order.status === "CONFIRMED" || order.status === "PREPARING")
  const currentIdx = isCancelled ? 0 : getStatusIndex(order.status)
  const showOtp = order.status === "READYFORPICKUP" && order.deliveryOtp

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
        </div>
        <Badge className={cn("text-xs font-semibold", statusColors[order.status] || "")}>
          {order.status === "READYFORPICKUP" ? "Ready for Pickup" : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity} &middot; ₹{item.unitPrice}
              </p>
            </div>
          </div>
        ))}
        {showOtp && (
          <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3 text-center">
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
      </div>

      {isCancelled ? (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <XCircle className="h-4 w-4" />
            {order.status === "REFUNDED" ? "Refund processed" : "Order cancelled"}
          </div>
        </div>
      ) : (
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
                      "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ease-in-out",
                      done
                        ? "bg-primary text-primary-foreground scale-100"
                        : current
                          ? "bg-primary/20 text-primary ring-2 ring-primary/40 animate-pulse"
                          : "bg-muted text-muted-foreground scale-90"
                    )}
                  >
                    {done && idx < currentIdx ? <Check className="h-3.5 w-3.5 animate-in fade-in zoom-in" /> : <span className={current ? "animate-bounce" : ""}>{idx + 1}</span>}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-center leading-tight max-w-16 transition-all duration-300",
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

      <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/10">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold">Total: ₹{order.totalAmount}</p>
          {canCancel && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={onCancel}>
              Cancel Order
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {order.status === "COMPLETED" && !order.kitchenReview && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onReview}>
              <Star className="h-3 w-3" /> Rate Order
            </Button>
          )}
          {order.kitchenReview && (
            <span className="text-xs text-muted-foreground flex items-center gap-1" title="Food rating">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {order.kitchenReview.rating}/5
            </span>
          )}
          {order.status === "COMPLETED" && order.deliveryPartner && !order.deliveryReview && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onRateDelivery}>
              <Star className="h-3 w-3" /> Rate Delivery
            </Button>
          )}
          {order.deliveryReview && (
            <span className="text-xs text-muted-foreground flex items-center gap-1" title="Delivery rating">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {order.deliveryReview.rating}/5
            </span>
          )}
          {order.address && <p className="text-xs text-muted-foreground truncate max-w-48">{order.address}</p>}
        </div>
      </div>
    </Card>
  )
}
