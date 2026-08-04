"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { DeliveryRatingDialog } from "@/components/delivery-partner/delivery-rating-dialog"
import { TrackOrderSkeleton } from "@/components/order/track-order-skeleton"
import { useSession } from "@/lib/auth-client"
import Image from "next/image"
import Link from "next/link"
import {
  Package, Check, ChefHat, Bike, Loader2, XCircle,
  MapPin, Star, User, Truck, Clock, ShieldCheck,
  ChevronRight, Headphones, RefreshCcw, Home, CheckCircle2, Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  useOrderTrackingQuery,
  useOrderTracking,
  useRatingOrder,
  useOrderTrackingActions,
} from "@/stores/orderTrackingStore"

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

const deliveryStatusLabels: Record<string, string> = {
  ASSIGNED: "Delivery Partner Assigned",
  ACCEPTED: "Delivery Partner Accepted",
  PICKEDUP: "Order Picked Up",
  INTRANSIT: "Out for Delivery",
  DELIVERED: "Delivered",
  FAILED: "Delivery Failed",
}

const deliveryStatusIcons: Record<string, typeof Bike> = {
  ASSIGNED: User,
  ACCEPTED: Bike,
  PICKEDUP: Package,
  INTRANSIT: Truck,
  DELIVERED: Check,
  FAILED: XCircle,
}

function getStatusIndex(status: string): number {
  return statusFlow.findIndex((s) => s.key === status)
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function getInitials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DP"
  )
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])

  return now
}

function useLiveEta({
  enabled,
  personLat,
  personLng,
  customerLat,
  customerLng,
}: {
  enabled: boolean
  personLat: number | null | undefined
  personLng: number | null | undefined
  customerLat: number | null | undefined
  customerLng: number | null | undefined
}) {
  const coordsValid =
    enabled &&
    personLat != null &&
    personLng != null &&
    customerLat != null &&
    customerLng != null

  const coordsKey = coordsValid
    ? `${personLat},${personLng},${customerLat},${customerLng}`
    : null

  const etaSec = useMemo(() => {
    if (!coordsValid) return null
    const km = haversineKm(personLat as number, personLng as number, customerLat as number, customerLng as number)
    return Math.max(Math.round((km / 20) * 60), 10)
  }, [coordsValid, personLat, personLng, customerLat, customerLng])

  const [now, setNow] = useState(() => Date.now())
  const [etaInfo, setEtaInfo] = useState<{ target: number; etaSec: number; coordsKey: string } | null>(null)

  useEffect(() => {
    if (!coordsValid || etaSec == null || coordsKey == null) return
    const t = setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      setEtaInfo((prev) =>
        prev && prev.etaSec === etaSec && prev.coordsKey === coordsKey
          ? prev
          : { target: tick + etaSec * 1000, etaSec, coordsKey }
      )
    }, 1000)
    return () => clearInterval(t)
  }, [coordsValid, etaSec, coordsKey])

  const info = coordsValid && etaSec != null ? etaInfo : null

  if (!info) return null

  const remainingSec = Math.max(0, Math.round((info.target - now) / 1000))
  return {
    minutes: Math.floor(remainingSec / 60),
    seconds: remainingSec % 60,
  }
}

function formatEtaText(eta: { minutes: number; seconds: number } | null) {
  if (!eta) return null
  if (eta.minutes === 0 && eta.seconds === 0) return "Your order is arriving now"
  if (eta.minutes === 0) return "Your order will be delivered in less than a minute"
  if (eta.minutes === 1) return "Your order will be delivered in 1 min"
  return `Your order will be delivered in ~${eta.minutes} mins`
}

export function TrackOrderClient({ orderId }: { orderId: string }) {
  const { data: session, isPending: sessionLoading } = useSession()
  const queryClient = useQueryClient()
  const ratingOrder = useRatingOrder()
  const { setRatingOrder } = useOrderTrackingActions()

  const {
    isLoading,
    isError,
    refetch,
  } = useOrderTrackingQuery(orderId, !!session?.user)

  const order = useOrderTracking()

  useAblyOrderChannel(
    orderId,
    useCallback(
      (msg: { name: string }) => {
        if (
          msg.name === "order:confirmation-code" ||
          msg.name === "order:status" ||
          msg.name === "delivery:status"
        ) {
          queryClient.invalidateQueries({ queryKey: ["order-tracking", orderId] })
        }
      },
      [orderId, queryClient]
    ),
    !!session?.user && !!orderId
  )

  const orderStatus = order?.status
  const orderDeliveryStatus = order?.deliveryStatus || order?.deliveryAssignmentStatus
  const orderInTransit =
    !!order &&
    !["CANCELLED", "REFUNDED", "COMPLETED"].includes(orderStatus || "") &&
    (orderDeliveryStatus === "PICKEDUP" || orderDeliveryStatus === "INTRANSIT")

  const eta = useLiveEta({
    enabled: orderInTransit,
    personLat: order?.deliveryPersonLat,
    personLng: order?.deliveryPersonLng,
    customerLat: order?.customerLat,
    customerLng: order?.customerLng,
  })

  const now = useNow()

  if (sessionLoading || isLoading) {
    return <TrackOrderSkeleton />
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
  const isDelivered = order.status === "COMPLETED"
  const deliveryStatus = order.deliveryStatus || order.deliveryAssignmentStatus
  const DeliveryIcon = deliveryStatus ? (deliveryStatusIcons[deliveryStatus] ?? Bike) : Bike

  const inTransit =
    !isCancelled &&
    !isDelivered &&
    (deliveryStatus === "PICKEDUP" || deliveryStatus === "INTRANSIT")

  const preBooked =
    !isCancelled &&
    !isDelivered &&
    order.serviceDate &&
    new Date(order.serviceDate).getTime() > now

  let etaTitle = ""
  let etaSubtitle: string | null = null
  if (inTransit) {
    etaTitle = "Out for delivery"
    etaSubtitle = eta
      ? `${formatEtaText(eta)} · ETA ${String(eta.minutes).padStart(2, "0")}:${String(eta.seconds).padStart(2, "0")}`
      : "Tracking your delivery partner live"
  } else if (order.status === "READYFORPICKUP") {
    etaTitle = "Ready for pickup"
    etaSubtitle = "Your order is packed and waiting for the delivery partner"
  } else if (order.status === "PREPARING") {
    etaTitle = "Being prepared"
    etaSubtitle = "Your order is being cooked fresh by the kitchen"
  } else if (preBooked) {
    etaTitle = "Pre-booked order"
    etaSubtitle = `Your order will be prepared on ${formatDateTime(order.serviceDate!)} · ${(order.timeSlot || "").toLowerCase()}`
  } else if (deliveryStatus === "ASSIGNED" || deliveryStatus === "ACCEPTED") {
    etaTitle = "Delivery partner on the way"
    etaSubtitle = "Your delivery partner is heading to the kitchen to pick up your order"
  } else {
    etaTitle = "Order confirmed"
    etaSubtitle = "The kitchen will start preparing your order soon"
  }

  const itemTotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0
  )

  return (
    <div className="bg-[#FAF9F8] min-h-screen text-foreground pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <div className="text-[13px] font-medium text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/account" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/account/orders" className="hover:text-gray-800 transition-colors">
            My Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-800 font-bold">Track Order</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 leading-tight tracking-tight">
              Track Your Order
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-[15px] font-bold text-gray-800">
                Order ID: #{order.publicCode ?? orderId}
              </span>
              <Badge
                className={cn(
                  "text-xs font-semibold",
                  statusColors[order.status] || ""
                )}
              >
                {order.status === "READYFORPICKUP"
                  ? "Ready for Pickup"
                  : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="mt-2 text-[14px] text-gray-600 font-medium">
              Ordered on:{" "}
              <span className="font-bold text-gray-800">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="bg-orange-50/70 border border-orange-100/80 rounded-[20px] p-4 flex items-center justify-between gap-6 md:min-w-[320px] shadow-sm">
            <div className="flex items-center gap-3">
              <Headphones className="w-6 h-6 text-gray-700" />
              <div>
                <h4 className="font-black text-[14px] text-gray-900 leading-tight">
                  Need Help?
                </h4>
                <p className="text-[12px] text-gray-600 font-medium mt-0.5">
                  We&apos;re here to help you.
                </p>
              </div>
            </div>
            <Link href="/account/support">
              <button
                type="button"
                className="px-5 py-2.5 bg-white border border-orange-200 text-[#EE7005] font-bold text-[13px] rounded-xl shadow-sm hover:bg-orange-50 transition-colors"
              >
                Contact Support
              </button>
            </Link>
          </div>
        </div>
      </div>

      {!isCancelled && !isDelivered && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6">
          <div className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 to-[#F0FBF2] p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-green-200 relative">
              <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <Truck className="w-5 h-5 text-green-700 relative" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-[15px] text-gray-900 tracking-tight">
                {etaTitle}
              </h4>
              {etaSubtitle && (
                <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                  {etaSubtitle}
                </p>
              )}
            </div>
            {eta && (
              <div className="shrink-0 text-center sm:text-right">
                <div className="text-[24px] font-black text-green-700 tabular-nums leading-none">
                  {String(eta.minutes).padStart(2, "0")}:
                  {String(eta.seconds).padStart(2, "0")}
                </div>
                <p className="text-[10px] text-green-700/80 font-bold mt-1 tracking-wide">
                  ETA TO YOUR DOOR
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:order-2 flex-1">
            {order.kitchenLat != null && order.kitchenLng != null ? (
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <LiveOrderTrackingMap
                  orderId={orderId}
                  kitchenLat={order.kitchenLat}
                  kitchenLng={order.kitchenLng}
                  customerLat={order.customerLat ?? undefined}
                  customerLng={order.customerLng ?? undefined}
                  deliveryPersonLat={order.deliveryPersonLat ?? undefined}
                  deliveryPersonLng={order.deliveryPersonLng ?? undefined}
                />
              </div>
            ) : (
              <div className="h-[300px] lg:h-[400px] rounded-3xl bg-[#F0EBE1] border border-gray-200 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500 font-medium">
                    Map not available for this order
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-[420px] shrink-0 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col order-2">
            <h3 className="font-black text-[18px] text-gray-900 mb-8 tracking-tight">
              Order Progress
            </h3>

            {!isCancelled ? (
              <div className="relative flex-1 px-2">
                <div className="absolute top-4 bottom-12 left-6 w-0.5 bg-gray-200" />
                {!isDelivered && (
                  <div
                    className="absolute top-4 left-6 w-0.5 bg-green-600 transition-all duration-700"
                    style={{
                      height: `${currentIdx > 0
                        ? (currentIdx / (statusFlow.length - 1)) * 100
                        : 0
                        }%`,
                    }}
                  />
                )}

                <div className="space-y-8 relative">
                  {statusFlow.map((step, idx) => {
                    const done = idx <= currentIdx
                    const current = idx === currentIdx && !isCancelled
                    const StepIcon = step.icon

                    return (
                      <div key={step.key} className="flex gap-5 relative">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center relative z-10 shrink-0 shadow-[0_0_0_4px_white]",
                            done
                              ? "bg-green-600"
                              : current
                                ? "bg-[#EE7005]"
                                : "bg-white border-2 border-gray-300"
                          )}
                        >
                          {done && idx < currentIdx ? (
                            <Check className="w-5 h-5 text-white stroke-[3]" />
                          ) : current ? (
                            <StepIcon className="w-5 h-5 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <div className={cn(!done && !current && "opacity-60")}>
                          <h4
                            className={cn(
                              "font-black text-[15px] leading-tight",
                              done && !current && "text-green-700",
                              current && "text-[#EE7005]",
                              !done && !current && "text-gray-900"
                            )}
                          >
                            {step.label}
                          </h4>
                          {current && (
                            <p className="text-[12px] text-gray-500 font-bold mt-1 tracking-wide">
                              In progress
                            </p>
                          )}
                          <p className="text-[13px] text-gray-600 font-medium mt-1">
                            {idx === 0 && "Your order has been confirmed"}
                            {idx === 1 && "Your order is being prepared"}
                            {idx === 2 && "Your order is on the way"}
                            {idx === 3 && "Enjoy your meal!"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <XCircle className="h-10 w-10 text-red-500" />
                <p className="font-black text-[16px] text-gray-900">
                  {order.status === "REFUNDED"
                    ? "Refund Processed"
                    : "Order Cancelled"}
                </p>
                <p className="text-[13px] text-gray-500 font-medium text-center">
                  {order.status === "REFUNDED"
                    ? "Your refund has been processed."
                    : "This order has been cancelled."}
                </p>
                <Link href="/account/orders">
                  <Button variant="outline" size="sm" className="mt-2">
                    View All Orders
                  </Button>
                </Link>
              </div>
            )}

            {isDelivered && (
              <div className="mt-8 bg-green-50/80 border border-green-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-green-200">
                  <ShieldCheck className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-black text-[13px] text-green-800 leading-tight tracking-wide">
                    Your order is safe with us!
                  </h4>
                  <p className="text-[11px] text-green-700/80 font-bold mt-1">
                    100% contactless delivery
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isCancelled && !isDelivered && deliveryStatus && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6">
          <Card className="border-primary/20">
            <div className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DeliveryIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {deliveryStatusLabels[deliveryStatus] || deliveryStatus}
                </p>
                {order.deliveryPersonName && (
                  <p className="text-xs text-muted-foreground">
                    Delivery partner:{" "}
                    <span className="font-medium">{order.deliveryPersonName}</span>
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {isDelivered && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6">
          <Card className="border-green-200 bg-green-50">
            <div className="p-4 text-center space-y-1">
              <Check className="h-6 w-6 text-green-600 mx-auto" />
              <p className="text-sm font-semibold text-green-700">
                Order Delivered!
              </p>
              <p className="text-xs text-green-600">
                Enjoy your meal! Share your feedback below.
              </p>
            </div>
          </Card>
        </div>
      )}

      {order.deliveryPersonName && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6">
          <Card>
            <div className="p-4 flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0 border border-gray-100">
                {order.deliveryPartner?.image && (
                  <AvatarImage
                    src={order.deliveryPartner.image}
                    alt={order.deliveryPersonName || "Delivery Partner"}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {getInitials(order.deliveryPartner?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{order.deliveryPersonName}</p>
                <p className="text-xs text-muted-foreground">
                  {deliveryStatus
                    ? deliveryStatusLabels[deliveryStatus] || deliveryStatus
                    : "Delivery Partner"}
                </p>
              </div>
              {!isDelivered && !isCancelled && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" /> Live
                </Badge>
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative">
            <div>
              <h3 className="font-black text-[16px] text-gray-900 mb-5">
                Order Details
              </h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        width={56}
                        height={56}
                        alt={item.name}
                        className="rounded-xl object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-black text-[14px] text-gray-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-bold mt-1 leading-[1.4]">
                        {item.kitchenName && `${item.kitchenName} \u00B7 `}
                        Qty: {item.quantity}
                      </p>
                      <p className="text-[12px] font-black text-gray-900 mt-1">
                        ₹{parseFloat(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block w-px bg-gray-100 absolute left-[25%] top-0 bottom-0" />

            <div>
              <h3 className="font-black text-[16px] text-gray-900 mb-5">
                Delivery Partner
              </h3>
              {order.deliveryPartner ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 shrink-0 border border-gray-100">
                    {order.deliveryPartner.image && (
                      <AvatarImage
                        src={order.deliveryPartner.image}
                        alt={order.deliveryPartner.name || "Delivery Partner"}
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                      {getInitials(order.deliveryPartner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-[15px] text-gray-900 leading-tight flex items-center gap-1.5">
                      {order.deliveryPartner.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    </h4>
                    <p className="text-[13px] text-gray-600 font-bold mt-1.5">
                      Delivery Partner
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0 border border-gray-100">
                    <Truck className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {isDelivered
                        ? "Delivery completed"
                        : "No delivery partner assigned yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block w-px bg-gray-100 absolute left-[50%] top-0 bottom-0" />

            <div>
              <h3 className="font-black text-[16px] text-gray-900 mb-5">
                Delivery Address
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-gray-600" />
                <span className="text-[13px] font-black text-green-700">{order.customerAddressLabel || "Delivery Address"}</span>
              </div>
              <p className="text-[13px] text-gray-600 font-bold leading-[1.6]">
                {order.customerAddress || "Address not available"}
              </p>
            </div>

            <div className="hidden lg:block w-px bg-gray-100 absolute left-[75%] top-0 bottom-0" />

            <div>
              <h3 className="font-black text-[16px] text-gray-900 mb-5">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px] font-bold text-gray-500">
                  <span>Item Total</span>
                  <span>₹{itemTotal.toFixed(2)}</span>
                </div>
                {order.paymentProvider && (
                  <div className="flex justify-between text-[13px] font-bold text-gray-500">
                    <span>Payment</span>
                    <span className="capitalize">{order.paymentProvider}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-black text-[15px] text-gray-900">
                    Total Paid
                  </span>
                  <span className="font-black text-[16px] text-green-700">
                    ₹{parseFloat(order.totalAmount).toFixed(2)}
                  </span>
                </div>
                {order.serviceDate && (
                  <div className="flex justify-between text-[13px] font-bold text-gray-500">
                    <span>Delivery Date</span>
                    <span>{formatDateTime(order.serviceDate)}</span>
                  </div>
                )}
                {order.timeSlot && (
                  <div className="flex justify-between text-[13px] font-bold text-gray-500">
                    <span>Time Slot</span>
                    <span className="capitalize">{order.timeSlot.toLowerCase()}</span>
                  </div>
                )}
                {order.paymentStatus && (
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "text-[10px] font-black px-2 py-1 rounded border",
                        order.paymentStatus === "SUCCESS"
                          ? "text-green-700 bg-green-50 border-green-100"
                          : order.paymentStatus === "REFUNDED" || order.paymentStatus === "PARTIAL_REFUND"
                            ? "text-purple-700 bg-purple-50 border-purple-100"
                            : "text-amber-700 bg-amber-50 border-amber-100"
                      )}
                    >
                      {order.paymentStatus === "SUCCESS" ? "PAID" : order.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDelivered && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() =>
              setRatingOrder(
                order.deliveryPartner
                  ? {
                    id: orderId,
                    deliveryPartnerId: order.deliveryPartner.id,
                    deliveryPartnerName: order.deliveryPartner.name ?? "Delivery Partner",
                  }
                  : null
              )
            }
          >
            <Star className="h-4 w-4" /> Rate Delivery
          </Button>
        </div>
      )}

      <DeliveryRatingDialog
        open={!!ratingOrder && !!ratingOrder.deliveryPartnerId}
        onOpenChange={(open) => {
          if (!open) setRatingOrder(null)
        }}
        orderId={ratingOrder?.id ?? ""}
        deliveryPartnerId={ratingOrder?.deliveryPartnerId ?? ""}
        deliveryPartnerName={
          ratingOrder?.deliveryPartnerName ?? "Delivery Partner"
        }
      />

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-sm flex flex-wrap lg:grid lg:grid-cols-5 gap-4 md:gap-6 justify-center">
          <div className="flex gap-4 items-center w-[45%] lg:w-auto">
            <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center shrink-0 border border-[#F2EAE1] shadow-sm">
              <ChefHat className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="font-black text-[13px] md:text-[14px] text-gray-900 tracking-tight">
                100% Homemade
              </h4>
              <p className="text-[11px] md:text-[12px] text-gray-500 font-bold mt-0.5">
                Made with love &amp; care
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center w-[45%] lg:w-auto">
            <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center shrink-0 border border-[#F2EAE1] shadow-sm">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-black text-[13px] md:text-[14px] text-gray-900 tracking-tight">
                Hygienic &amp; Safe
              </h4>
              <p className="text-[11px] md:text-[12px] text-gray-500 font-bold mt-0.5">
                Verified home kitchens
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center w-[45%] lg:w-auto">
            <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center shrink-0 border border-[#F2EAE1] shadow-sm">
              <Clock className="w-6 h-6 text-[#EE7005]" />
            </div>
            <div>
              <h4 className="font-black text-[13px] md:text-[14px] text-gray-900 tracking-tight">
                On-time Delivery
              </h4>
              <p className="text-[11px] md:text-[12px] text-gray-500 font-bold mt-0.5">
                Always on time, every time
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center w-[45%] lg:w-auto">
            <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center shrink-0 border border-[#F2EAE1] shadow-sm">
              <RefreshCcw className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h4 className="font-black text-[13px] md:text-[14px] text-gray-900 tracking-tight">
                Easy Returns
              </h4>
              <p className="text-[11px] md:text-[12px] text-gray-500 font-bold mt-0.5">
                Hassle-free refunds
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center w-[45%] lg:w-auto mx-auto lg:mx-0">
            <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center shrink-0 border border-[#F2EAE1] shadow-sm">
              <Lock className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h4 className="font-black text-[13px] md:text-[14px] text-gray-900 tracking-tight">
                Secure Payments
              </h4>
              <p className="text-[11px] md:text-[12px] text-gray-500 font-bold mt-0.5">
                100% secure transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
