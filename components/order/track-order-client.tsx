"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { TrackOrderSkeleton } from "@/components/order/track-order-skeleton"
import { useSession } from "@/lib/auth-client"
import { assignNearestDeliveryPerson } from "@/actions/dispatch/dispatch-actions"
import Image from "next/image"
import Link from "next/link"
import {
  Package, Check, ChefHat, Bike, Loader2, XCircle,
  ShieldCheck,
  ChevronRight, Headphones, Home, Phone,
  Clock3, Wallet, CreditCard, BadgeCheck
} from "lucide-react"
import { RazorpayIcon } from "@/components/icons/razorpay"
import { PhonePeIcon } from "@/components/icons/phonepe"
import { UpiIcon } from "@/components/icons/upi"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  useOrderTrackingQuery,
  useOrderTracking,
} from "@/stores/orderTrackingStore"

const statusFlow: { key: string; label: string; icon: typeof Check, desc: string }[] = [
  { key: "CONFIRMED", label: "Order Confirmed", icon: Check, desc: "Your order has been confirmed." },
  { key: "PREPARING", label: "Preparing Your Order", icon: ChefHat, desc: "Shanthi's Kitchen is preparing your delicious meal." },
  { key: "READYFORPICKUP", label: "Out for Delivery", icon: Bike, desc: "Your order is on the way." },
  { key: "COMPLETED", label: "Delivered", icon: Package, desc: "Enjoy your meal!" },
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

function getStatusLabel(status: string | undefined): string {
  if (!status) return "Confirmed"
  const step = statusFlow.find((s) => s.key === status)
  if (step) return step.label
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function formatPaymentStatus(status: string | null | undefined): { label: string; color: string } {
  if (status === "SUCCESS") return { label: "PAID", color: "bg-[#E6F4EC] text-[#15803D]" }
  if (status === "REFUNDED" || status === "PARTIAL_REFUND") return { label: status === "PARTIAL_REFUND" ? "PARTIAL REFUND" : "REFUNDED", color: "bg-[#F1EDFB] text-[#7C4DFF]" }
  if (status === "FAILED") return { label: "FAILED", color: "bg-[#FDE8E8] text-[#DC2626]" }
  return { label: "PENDING", color: "bg-[#FEF3E2] text-[#B45309]" }
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

function formatDateOnly(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

  const {
    isLoading,
    isError,
    refetch,
  } = useOrderTrackingQuery(orderId, !!session?.user)

  const order = useOrderTracking()

  useAblyOrderChannel(
    order?.id ?? "",
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
    !!session?.user && !!order?.id
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

  const [assignError, setAssignError] = useState<string | null>(null)
  const assignRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const assignMutation = useMutation({
    mutationFn: () =>
      assignNearestDeliveryPerson(
        order?.id ?? "",
        order?.kitchenLat ?? order?.customerLat ?? 0,
        order?.kitchenLng ?? order?.customerLng ?? 0
      ),
    onSuccess: () => {
      setAssignError(null)
      queryClient.invalidateQueries({ queryKey: ["order-tracking", orderId] })
    },
    onError: () => {
      setAssignError("No delivery partner available right now. We'll keep looking.")
    },
  })

  useEffect(() => {
    const shouldAssign =
      !!order &&
      order.status === "READYFORPICKUP" &&
      !order.deliveryPartner &&
      !order.deliveryStatus &&
      !order.deliveryAssignmentStatus

    if (!shouldAssign) return

    const attempt = () => {
      if (
        !assignMutation.isPending &&
        order.status === "READYFORPICKUP" &&
        !order.deliveryPartner &&
        !order.deliveryStatus &&
        !order.deliveryAssignmentStatus
      ) {
        assignMutation.mutate()
      }
      assignRetryRef.current = setTimeout(attempt, 30_000)
    }

    attempt()

    return () => {
      if (assignRetryRef.current) clearTimeout(assignRetryRef.current)
      assignRetryRef.current = null
    }
  }, [order, assignMutation])

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

  const inTransit =
    !isCancelled &&
    !isDelivered &&
    (deliveryStatus === "PICKEDUP" || deliveryStatus === "INTRANSIT")

  const preBooked =
    !isCancelled &&
    !isDelivered &&
    order.serviceDate &&
    new Date(order.serviceDate).getTime() > now

  let etaSubtitle: string | null = null
  if (inTransit) {
    etaSubtitle = eta
      ? `${formatEtaText(eta)} · ETA ${String(eta.minutes).padStart(2, "0")}:${String(eta.seconds).padStart(2, "0")}`
      : "Tracking your delivery partner live"
  } else if (order.status === "READYFORPICKUP") {
    etaSubtitle = "Your order is packed and waiting for the delivery partner"
  } else if (order.status === "PREPARING") {
    etaSubtitle = "Your order is being cooked fresh by the kitchen"
  } else if (preBooked) {
    etaSubtitle = `Your order will be prepared on ${formatDateTime(order.serviceDate!)} · ${(order.timeSlot || "").toLowerCase()}`
  } else if (deliveryStatus === "ASSIGNED" || deliveryStatus === "ACCEPTED") {
    etaSubtitle = "Your delivery partner is heading to the kitchen to pick up your order"
  } else {
    etaSubtitle = "The kitchen will start preparing your order soon"
  }

  const itemTotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0
  )

  const discount = order.discountAmount != null ? parseFloat(order.discountAmount) : 0
  const feesAndTaxes = Math.max(
    parseFloat(order.totalAmount) - itemTotal + discount,
    0
  )
  const payStatus = formatPaymentStatus(order.paymentStatus)
  const statusColor = statusColors[order.status] || "text-blue-600 bg-blue-100"
  const cancelledHistory = order.statusHistory?.find((h) => h.status === "CANCELLED")

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-[#374151] pb-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        
        {/* Breadcrumb */}
        <div className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2 mb-8">
          <Link href="/account/profile" className="hover:text-[#111827] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/account/orders" className="hover:text-[#111827] transition-colors">My Orders</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#111827] font-semibold">Track Order</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-[#111827] leading-tight tracking-tight mb-2">Track Your Order</h1>
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-semibold text-[#111827]">Order ID: {order.publicCode ?? `#${order.id.slice(-6).toUpperCase()}`}</span>
              <span className={cn("text-[12px] font-bold px-3 py-1 rounded-full", statusColor)}>{getStatusLabel(order.status)}</span>
            </div>
            <div className="text-[15px] text-[#6B7280] mt-2 font-medium">
              Estimated Delivery: <span className="text-[#F97316] font-semibold">{order.timeSlot ? `${formatDateOnly(order.serviceDate || new Date().toISOString())}, ${order.timeSlot}` : "ASAP"}</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#eef1f5] rounded-[26px] p-4 flex flex-wrap sm:flex-nowrap items-center gap-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] shrink-0 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <Headphones className="w-7 h-7 text-[#6B7280]" strokeWidth={1.5} />
              <div>
                <h4 className="font-semibold text-[15px] text-[#111827] leading-tight mb-1">Need Help?</h4>
                <p className="text-[13px] text-[#6B7280]">We&apos;re here to help you.</p>
              </div>
            </div>
            <Link href="/account/support" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED] hover:text-[#EA580C] h-10 font-bold text-[15px] rounded-[12px] shadow-none">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Middle Section (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column: Timeline */}
          <div className="order-2 lg:order-1 lg:col-span-3 bg-[#FFFFFF] rounded-[26px] p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col relative h-full">
            <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-8">Order Progress</h3>
            <div className="relative flex-1">
              <div className="absolute top-5 bottom-16 left-[19px] w-[2px] bg-[#eef1f5]" />
              {!isDelivered && !isCancelled && (
                <div 
                  className="absolute top-5 left-[19px] w-[2px] bg-[#15803D] transition-all duration-700" 
                  style={{ height: `${currentIdx > 0 ? (currentIdx / (statusFlow.length - 1)) * 100 : 0}%` }} 
                />
              )}
              {isCancelled && (
                <div className="absolute top-5 left-[19px] w-[2px] bg-[#DC2626] transition-all duration-700" style={{ height: "25%" }} />
              )}
              <div className="space-y-8 relative">
                {statusFlow.map((step, idx) => {
                  const done = idx < currentIdx;
                  const current = idx === currentIdx && !isCancelled;
                  const isFuture = !done && !current;
                  const StepIcon = step.icon;
                  const stepDate = order.statusHistory?.find(h => h.status === step.key)?.changedAt;

                  let colorClass = "";
                  if (isCancelled && idx === 0) colorClass = "bg-[#EF4444] text-white border-transparent shadow-[0_0_0_4px_#FEE2E2]";
                  else if (done) colorClass = "bg-[#15803D] text-white border-transparent shadow-[0_0_0_4px_#DCFCE7]";
                  else if (current) colorClass = "bg-[#F97316] text-white border-transparent shadow-[0_0_0_4px_#FFEDD5]";
                  else colorClass = "bg-white border-2 border-[#E5E7EB] text-[#9CA3AF]";

                  return (
                    <div key={step.key} className="flex gap-5 relative group">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center relative z-10 shrink-0", colorClass)}>
                        {isCancelled && idx === 0 ? <XCircle className="w-5 h-5 stroke-[2]" />
                        : done ? <Check className="w-5 h-5 stroke-[3]" />
                        : current ? <StepIcon className="w-5 h-5 stroke-[2]" />
                        : <div className="w-2 h-2 rounded-full border-2 border-[#9CA3AF]" />}
                      </div>
                      <div>
                        <p className={cn("text-[16px] font-semibold leading-tight", isCancelled && idx === 0 ? "text-[#DC2626]" : (done || current ? "text-[#111827]" : "text-[#9CA3AF]"))}>
                          {isCancelled && idx === 1 ? "Cancelled" : step.label}
                        </p>
                        {isFuture && <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">Pending</p>}
                        {!isFuture && (
                          <p className="text-[13px] text-[#6B7280] mt-1 font-medium">
                            {stepDate ? formatDateTime(stepDate) : (idx === 0 ? formatDateTime(order.createdAt) : (cancelledHistory && idx === 1 ? formatDateTime(cancelledHistory.changedAt) : ""))} 
                          </p>
                        )}
                        {isCancelled && idx === 1 && (
                          <p className="text-[13px] text-[#DC2626] font-medium mt-1">Reason: {cancelledHistory?.note || "Order cancelled"}</p>
                        )}
                        <p className={cn("text-[13px] mt-1 leading-[1.5]", isFuture ? "text-[#9CA3AF]" : "text-[#6B7280]")}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Safe Shield */}
            <div className="mt-8 bg-[#F0F8F3] rounded-[16px] p-4 flex items-center gap-3 border border-[#D9EBDD]">
              <ShieldCheck className="w-6 h-6 text-[#15803D]" strokeWidth={1.5} />
              <div>
                 <p className="text-[13px] font-semibold text-[#166534]">Your order is safe with us!</p>
                 <p className="text-[13px] text-[#15803D] mt-0.5">100% contactless delivery</p>
              </div>
            </div>
          </div>

          {/* Center Column: Live Map */}
          <div className="order-1 lg:order-2 lg:col-span-9 relative rounded-[26px] overflow-hidden border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] bg-[#F8FAFC] w-full min-h-[400px]">
            <LiveOrderTrackingMap
              orderId={order?.id ?? ""}
              kitchenLat={order.kitchenLat ?? undefined}
              kitchenLng={order.kitchenLng ?? undefined}
              customerLat={order.customerLat ?? undefined}
              customerLng={order.customerLng ?? undefined}
              deliveryPersonLat={order.deliveryPersonLat ?? undefined}
              deliveryPersonLng={order.deliveryPersonLng ?? undefined}
              height="100%"
              showFooter={false}
            />

            {/* Map Overlay: Live Tracking */}
            {orderInTransit && (
              <div className="absolute top-6 left-6 bg-[#FFFFFF] rounded-[16px] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <div>
                  <p className="text-[15px] font-semibold text-[#111827] leading-tight mb-1">Live Tracking</p>
                  <p className="text-[13px] text-[#6B7280]">{etaSubtitle || "Fetching location..."}</p>
                </div>
              </div>
            )}

            {/* Map Overlay: Estimated Delivery Time */}
            {order.timeSlot && (
              <div className="absolute top-6 right-6 bg-[#FFFFFF] rounded-[16px] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] text-right">
                <p className="text-[13px] text-[#6B7280] mb-1">Estimated Delivery Time</p>
                <p className="text-[20px] font-bold text-[#F97316] mb-1">{order.timeSlot}</p>
                <p className="text-[13px] text-[#9CA3AF]">{formatDateOnly(order.serviceDate || new Date().toISOString())}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#FFFFFF] rounded-[26px] border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
          {/* Order Details */}
          <div className="p-6 border-b lg:border-b-0 md:border-r border-[#eef1f5]">
            <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-5">Order Details</h3>
            <div className="flex gap-4 items-start">
              {order.items[0]?.imageUrl ? (
                <Image src={order.items[0].imageUrl} width={64} height={64} alt="Food" className="rounded-[16px] w-16 h-16 object-cover shrink-0 border border-[#F1F5F9]" />
              ) : (
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center shrink-0 border border-[#F1F5F9]">
                  <Package className="w-6 h-6 text-[#9CA3AF]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[15px] text-[#111827] flex items-center gap-1.5 leading-tight mb-1">
                  {order.items[0]?.kitchenName || "Restaurant"} <BadgeCheck className="w-4 h-4 text-[#15803D]" />
                </h4>
                <p className="text-[13px] text-[#6B7280] truncate mb-2">
                  {order.items.map(i => i.name).join(", ")}
                </p>
                <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
                  <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
                  <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> ₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#111827] flex items-center gap-2">
                {order.paymentProvider && order.paymentProvider.toLowerCase() === 'razorpay' ? (
                  <RazorpayIcon className="h-[12px] w-auto" />
                ) : order.paymentProvider && order.paymentProvider.toLowerCase() === 'phonepe' ? (
                  <PhonePeIcon className="h-[14px] w-auto" />
                ) : order.paymentProvider && order.paymentProvider.toLowerCase() === 'upi' ? (
                  <UpiIcon className="h-[12px] w-auto" />
                ) : (
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                )}
                Paid via {order.paymentProvider ? order.paymentProvider.charAt(0).toUpperCase() + order.paymentProvider.slice(1) : "Online"}
              </span>
              <span className={cn("text-[12px] font-bold px-2.5 py-1 rounded-full", payStatus.color)}>{payStatus.label}</span>
            </div>
          </div>

          {/* Delivery Partner */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#eef1f5]">
            <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-5">Delivery Partner</h3>
            {order.deliveryPartner ? (
              <div className="flex gap-4 items-center">
                <Avatar className="w-14 h-14 shrink-0 rounded-[16px] border border-[#eef1f5]">
                  {order.deliveryPartner.image && <AvatarImage src={order.deliveryPartner.image} />}
                  <AvatarFallback className="bg-[#F8FAFC] text-[#6B7280] text-[15px] font-semibold">{getInitials(order.deliveryPartner.name)}</AvatarFallback>
                </Avatar>
                <div>
                   <h4 className="font-semibold text-[15px] text-[#111827] flex items-center gap-1.5 mb-1">{order.deliveryPartner.name} <BadgeCheck className="w-4 h-4 text-[#15803D]" /></h4>
                   <p className="text-[13px] text-[#6B7280] flex items-center gap-1.5 mb-1"><Phone className="w-3.5 h-3.5" /> {order.deliveryPartner.phone || "Phone not available"}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[16px] bg-[#F8FAFC] flex items-center justify-center border border-[#eef1f5]">
                  <Bike className="w-6 h-6 text-[#9CA3AF]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#111827] mb-0.5">
                    {assignError
                      ? "No delivery partner yet"
                      : assignMutation.isPending
                        ? "Assigning partner..."
                        : "Finding a delivery partner"}
                  </p>
                  <p className="text-[13px] text-[#6B7280]">
                    {assignError ?? "We'll assign the nearest available partner as soon as one is online"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#eef1f5]">
            <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-5">Delivery Address</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-[15px] text-[#111827] flex items-center gap-2"><Home className="w-4 h-4 text-[#15803D]" /> {order.customerAddressLabel || "Home"}</span>
            </div>
            <p className="text-[15px] text-[#6B7280] leading-[1.6] mb-3 pr-4">{order.customerAddress || "Address not available"}</p>
            <p className="text-[13px] text-[#6B7280] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {order.customerPhone || "Phone not available"}</p>
          </div>

          {/* Order Summary */}
          <div className="p-6">
            <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-5">Order Summary</h3>
            <div className="space-y-3 text-[15px] text-[#6B7280]">
              <div className="flex justify-between"><span>Item Total</span> <span>₹{itemTotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-[#15803D]"><span>Discount</span> <span>-₹{discount.toFixed(2)}</span></div>
              )}
              {feesAndTaxes > 0 && (
                <div className="flex justify-between"><span>Delivery & Platform Fees</span> <span>₹{feesAndTaxes.toFixed(2)}</span></div>
              )}
            </div>
            <div className="mt-5 pt-5 border-t border-[#eef1f5] flex justify-between items-center">
              <span className="font-semibold text-[16px] text-[#111827]">Total Paid</span>
              <span className="font-bold text-[20px] text-[#15803D]">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer: Trust Badges */}
        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap bg-[#FFFFFF] rounded-[26px] py-8 px-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] w-full gap-y-6">
          {[
            { title: "100% Homemade", desc: "Made with love & care", icon: <ChefHat className="w-8 h-8 text-[#F97316] shrink-0" strokeWidth={1.5} /> },
            { title: "Hygienic & Safe", desc: "Verified home kitchens", icon: <ShieldCheck className="w-8 h-8 text-[#15803D] shrink-0" strokeWidth={1.5} /> },
            { title: "On-time Delivery", desc: "Always on time, every time", icon: <Clock3 className="w-8 h-8 text-[#F97316] shrink-0" strokeWidth={1.5} /> },
            { title: "Secure Payments", desc: "100% secure transactions", icon: <Wallet className="w-8 h-8 text-[#15803D] shrink-0" strokeWidth={1.5} /> },
          ].map((badge, i, arr) => (
            <div key={i} className={`flex-1 flex items-center justify-start sm:justify-center gap-4 sm:px-6 ${i !== arr.length - 1 ? 'sm:border-r border-[#eef1f5]' : ''}`}>
              {badge.icon}
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#111827] leading-tight mb-1">{badge.title}</span>
                <span className="text-[13px] text-[#6B7280] leading-tight">{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
