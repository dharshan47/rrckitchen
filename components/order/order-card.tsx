"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle2, Copy, Calendar, FileText,
  ChefHat, Bike, XCircle, MapPin, Phone, Clock, ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { cancelOrder, type UserOrder } from "@/actions/orders/orders"
import { formatTimeSlot } from "@/lib/patterns"
import { useCartActions } from "@/stores"
import { toast } from "sonner"

const statusFlow = [
  { key: "CONFIRMED", label: "Order Confirmed" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READYFORPICKUP", label: "Out for Delivery" },
  { key: "COMPLETED", label: "Delivered" },
] as const

function getStatusCategory(status: string): "ongoing" | "completed" | "cancelled" | "refunds" {
  if (status === "CANCELLED") return "cancelled"
  if (status === "REFUNDED") return "refunds"
  if (status === "COMPLETED") return "completed"
  return "ongoing"
}

function getCurrentStep(status: string): number {
  const idx = statusFlow.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

function getStatusLabel(status: string): string {
  if (status === "READYFORPICKUP") return "Ready for Pickup"
  return status.charAt(0) + status.slice(1).toLowerCase()
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

function formatPhone(phone: string | null): string {
  if (!phone) return "Phone not available"
  return phone
}

function formatPaymentStatus(status: string | null | undefined): { label: string; color: string } {
  if (status === "SUCCESS") return { label: "PAID", color: "bg-[#e8f5ed] text-[#168846]" }
  if (status === "REFUNDED" || status === "PARTIAL_REFUND") return { label: status === "PARTIAL_REFUND" ? "PARTIAL REFUND" : "REFUNDED", color: "bg-purple-50 text-purple-700" }
  return { label: status || "PENDING", color: "bg-amber-50 text-amber-700" }
}

function formatProvider(provider: string | null): string {
  if (!provider) return ""
  return provider.charAt(0) + provider.slice(1).toLowerCase()
}

function getFirstItemPhoto(order: UserOrder): string | null {
  for (const item of order.items) {
    if (item.imageUrl) return item.imageUrl
  }
  return null
}

function getItemsSummary(order: UserOrder): string {
  return order.items.map((i) => i.name).join(", ")
}

function getTotalItems(order: UserOrder): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}



function ActionButtons({ order, mobile = false }: { order: UserOrder; mobile?: boolean }) {
  const category = getStatusCategory(order.status)
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)
  const { addToCart } = useCartActions()

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(order.id),
    onSuccess: (res) => {
      setCancelOpen(false)
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        toast.success("Order cancelled")
      } else {
        toast.error(res.error || "Failed to cancel order")
      }
    },
    onError: () => {
      setCancelOpen(false)
      toast.error("Failed to cancel order")
    },
  })

  const orderAgain = () => {
    if (order.items.length === 0) {
      toast.error("No items to reorder")
      return
    }
    order.items.forEach((item) => {
      addToCart({
        id: item.kitchenId ? `${item.kitchenId}:${item.name}` : item.name,
        name: item.name,
        price: parseFloat(item.unitPrice),
        qty: item.quantity,
        foodType: item.foodType,
        timeSlot: order.timeSlot,
        kitchenName: item.kitchenName || order.kitchenName || "Kitchen",
        kitchenId: item.kitchenId,
        imageUrl: item.imageUrl ?? undefined,
      })
    })
    toast.success("Items added to cart")
  }

  const btnBase = cn(
    "rounded-md text-[13px] font-bold tracking-wide transition-colors flex items-center justify-center gap-2",
    mobile ? "flex-1 py-2.5" : "w-full py-2"
  )

  if (category === "ongoing") {
    return (
      <>
        <Button asChild className={cn(btnBase, "bg-[#EE7005] text-white hover:bg-[#EE7005]/90")}>
          <Link href={`/account/orders/${order.id}/track`}>
            <MapPin className="w-4 h-4" /> Track Order
          </Link>
        </Button>
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
              className={cn(
                btnBase,
                "border-[#EE7005] text-[#EE7005] hover:bg-[#EE7005]/5 bg-white",
                cancelMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your order will be cancelled and any eligible refund will be processed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  if (category === "completed") {
    return (
      <>
        <Button asChild className={cn(btnBase, "bg-[#EE7005] text-white hover:bg-[#EE7005]/90")}>
          <Link href={`/account/rating?orderId=${order.id}`}>
            Rate & Review
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={orderAgain}
          className={cn(btnBase, "border-[#EE7005] text-[#EE7005] hover:bg-[#EE7005]/5 bg-white")}
        >
          <ShoppingCart className="w-4 h-4" /> Order Again
        </Button>
      </>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={orderAgain}
      className={cn(btnBase, "border-[#EE7005] text-[#EE7005] hover:bg-[#EE7005]/5 bg-white")}
    >
      <ShoppingCart className="w-4 h-4" /> Order Again
    </Button>
  )
}

function getTimelineIcon(index: number, state: "past" | "current" | "future" | "cancelled") {
  const isCancel = state === "cancelled"
  const color = isCancel ? "text-red-500" : (state === "current" ? "text-[#168846]" : (state === "past" ? "text-gray-900" : "text-gray-400"))
  const size = "w-[18px] h-[18px]"

  if (isCancel) return <XCircle className={cn(size, color)} strokeWidth={1.5} />
  if (index === 0) return <CheckCircle2 className={cn(size, color)} strokeWidth={1.5} />
  if (index === 1) return <ChefHat className={cn(size, color)} strokeWidth={1.5} />
  if (index === 2) return <Bike className={cn(size, color)} strokeWidth={1.5} />
  return <CheckCircle2 className={cn(size, color)} strokeWidth={1.5} />
}

function VerticalTimeline({ currentStep, isCancelled, history }: { currentStep: number; isCancelled: boolean; history?: { status: string, changedAt: string }[] }) {
  return (
    <div className="relative flex flex-col gap-5">
      <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-200 z-0" />
      {!isCancelled && (
        <div
          className="absolute left-[15px] top-2 w-[2px] bg-[#168846] z-0 transition-all duration-500"
          style={{ height: `${(currentStep / 3) * 100}%` }}
        />
      )}

      {statusFlow.map((step, index) => {
        const isPast = index < currentStep && !isCancelled
        const isCurrent = index === currentStep && !isCancelled
        const isCancelStep = isCancelled && index === 1
        const state = isCancelStep ? "cancelled" : (isCurrent ? "current" : (isPast ? "past" : "future"))

        const histObj = history?.find(h => h.status === step.key)
        const cancelObj = history?.find(h => h.status === "CANCELLED")

        return (
          <div key={step.key} className="relative z-10 flex items-start gap-4">
            <div className={cn(
              "bg-white w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border-[1.5px] z-10",
              isCancelStep ? "border-red-500" : ((isPast || isCurrent) ? "border-[#168846]" : "border-gray-300")
            )}>
              {getTimelineIcon(index, state)}
            </div>
            <div className="pt-1.5">
              <p className={cn(
                "text-[12px] font-bold leading-none",
                isCancelStep ? "text-red-500" : (isCurrent ? "text-[#168846]" : (isPast ? "text-gray-900" : "text-gray-400"))
              )}>
                {isCancelStep ? "Cancelled" : step.label}
              </p>
              {(isPast || isCurrent) && histObj?.changedAt && (
                <p className="text-[10px] text-gray-500 mt-1 font-medium">
                  {formatDateTime(histObj.changedAt)}
                </p>
              )}
              {isCancelStep && cancelObj?.changedAt && (
                <p className="text-[10px] text-gray-500 mt-1 font-medium">
                  {formatDateTime(cancelObj.changedAt)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HorizontalTimeline({ currentStep, isCancelled, history }: { currentStep: number; isCancelled: boolean; history?: { status: string, changedAt: string }[] }) {
  return (
    <div className="relative flex items-start justify-between">
      <div className="absolute left-[12%] right-[12%] top-[16px] h-[1.5px] bg-gray-200 z-0" />
      {!isCancelled && (
        <div
          className="absolute left-[12%] top-[16px] h-[1.5px] bg-[#168846] z-0 transition-all duration-500"
          style={{ width: `${(currentStep / 3) * 76}%` }}
        />
      )}
      {isCancelled && currentStep >= 1 && (
        <div className="absolute left-[12%] top-[16px] h-[1.5px] bg-red-500 z-0 transition-all duration-500" style={{ width: '25%' }} />
      )}

      {statusFlow.map((step, index) => {
        const isPast = index < currentStep && !isCancelled
        const isCurrent = index === currentStep && !isCancelled
        const isCancelStep = isCancelled && index === 1
        const state = isCancelStep ? "cancelled" : (isCurrent ? "current" : (isPast ? "past" : "future"))

        const histObj = history?.find(h => h.status === step.key)
        const cancelObj = history?.find(h => h.status === "CANCELLED")

        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 w-1/4">
            <div className={cn(
              "bg-white w-[32px] h-[32px] rounded-full flex items-center justify-center z-10 border-[1.5px]",
              isCancelStep ? "border-red-500" : ((isPast || isCurrent) ? "border-[#168846]" : "border-gray-300")
            )}>
              {getTimelineIcon(index, state)}
            </div>
            <p className={cn(
              "text-[9px] font-bold text-center leading-tight px-1",
              isCancelStep ? "text-red-500" : (isCurrent ? "text-[#168846]" : (isPast ? "text-gray-900" : "text-gray-400"))
            )}>
              {isCancelStep ? "Cancelled" : step.label}
            </p>
            {(isPast || isCurrent) && histObj?.changedAt && (
              <p className="text-[8px] text-gray-500 mt-0.5 font-medium text-center">
                {formatDateTime(histObj.changedAt).split(',')[0]}
                <br />
                {formatDateTime(histObj.changedAt).split(',')[1]}
              </p>
            )}
            {isCancelStep && cancelObj?.changedAt && (
              <p className="text-[8px] text-gray-500 mt-0.5 font-medium text-center">
                {formatDateTime(cancelObj.changedAt).split(',')[0]}
                <br />
                {formatDateTime(cancelObj.changedAt).split(',')[1]}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function OrderCard({ order }: { order: UserOrder & { statusHistory?: { status: string, changedAt: string }[] } }) {
  const category = getStatusCategory(order.status)
  const currentStep = getCurrentStep(order.status)
  const isCancelled = category === "cancelled"
  const isOngoing = category === "ongoing"
  const isCompleted = category === "completed"
  const imageUrl = getFirstItemPhoto(order)
  const payStatus = formatPaymentStatus(order.paymentStatus)
  const itemsStr = getItemsSummary(order)
  const totalItems = getTotalItems(order)
  const { serviceDate, timeSlot, phoneNumber } = order

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col gap-6 hover:shadow-md transition-shadow">

      {/* Top Flex Row (Desktop & Mobile) */}
      <div className="flex flex-col md:flex-row gap-6 w-full">

        {/* Column 1: Image & Details */}
        <div className="flex gap-4 md:flex-[1.2]">
          <div className="relative w-20 h-20 md:w-[100px] md:h-[100px] shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={order.kitchenName || "Order"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 100px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <ChefHat className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[12px] font-bold text-gray-900">
                Order ID: #{order.id.slice(-6)}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    .writeText(order.id)
                    .then(() => toast.success("Order ID copied"))
                    .catch(() => toast.error("Failed to copy"))
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Copy order ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded ml-auto md:ml-0",
                isOngoing && "bg-red-50 text-red-500",
                isCompleted && "bg-green-50 text-[#168846]",
                isCancelled && "bg-red-50 text-red-500",
                category === "refunds" && "bg-purple-50 text-purple-700"
              )}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <h3 className="text-[16px] font-bold text-gray-900 truncate">
                {order.kitchenName || order.items[0]?.kitchenName || "Kitchen"}
              </h3>
              <CheckCircle2 className="h-[18px] w-[18px] text-[#168846] fill-[#168846] text-white shrink-0" />
            </div>

            <p className="text-[13px] text-gray-500 mb-3 line-clamp-1">{itemsStr}</p>

            <div className="flex items-center gap-4 text-[12px] font-bold text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-400" /> {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="border-2 border-gray-300 text-gray-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">₹</div>
                {parseFloat(order.totalAmount).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 mb-4">
              <Calendar className="w-4 h-4 text-gray-400" /> {formatDateTime(order.createdAt)}
            </div>

            <div className="flex items-center gap-2">
              {order.paymentProvider && (
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded text-[11px] font-bold text-gray-700">
                  <span className="italic font-serif text-blue-600 font-black">P</span>
                  Paid via {formatProvider(order.paymentProvider)}
                </div>
              )}
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded tracking-wide", payStatus.color)}>
                {payStatus.label}
              </span>
            </div>
          </div>

          {/* Mobile Buttons (right side of top row on mobile) */}
          <div className="flex flex-col gap-2 shrink-0 w-[110px] md:hidden">
            <ActionButtons order={order} mobile />
          </div>
        </div>

        {/* Column 2: Delivery Address (Desktop) */}
        <div className="hidden md:flex flex-col flex-1 border-l border-gray-100 pl-6 min-w-[200px]">
          <h4 className="text-[14px] font-bold text-gray-900 mb-3">Delivery Address</h4>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-bold text-gray-900">{order.addressLabel || "Home"}</span>
            {order.addressIsDefault && (
              <span className="bg-green-50 text-[#168846] text-[10px] font-bold px-1.5 py-0.5 rounded">Primary</span>
            )}
          </div>

          <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
            {order.address || "Address not available"}
          </p>

          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 mb-4">
            <Phone className="w-3.5 h-3.5" /> {formatPhone(phoneNumber)}
          </div>

          <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-900 mb-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> Expected Delivery
          </div>
          <p className="text-[12px] text-gray-500 font-medium pl-5">
            {formatDateOnly(serviceDate)}, {formatTimeSlot(timeSlot)}
          </p>
        </div>

        {/* Column 3: Order Tracking (Desktop) */}
        <div className="hidden md:flex flex-col flex-[1.2] border-l border-gray-100 pl-6">
          <h4 className="text-[14px] font-bold text-gray-900 mb-4">Order Tracking</h4>
          <VerticalTimeline currentStep={currentStep} isCancelled={isCancelled} history={order.statusHistory} />
        </div>

        {/* Column 4: Buttons (Desktop) */}
        <div className="hidden md:flex flex-col shrink-0 w-[140px] justify-start gap-3 border-l border-gray-100 pl-6">
          <ActionButtons order={order} />
        </div>
      </div>

      {/* Mobile-only sections (Timeline & Address split) */}
      <div className="md:hidden pt-5 border-t border-gray-100 mt-2">
        <HorizontalTimeline currentStep={currentStep} isCancelled={isCancelled} history={order.statusHistory} />
      </div>

      <div className="md:hidden flex pt-5 mt-3 border-t border-gray-100">
        <div className="flex-[1.2] pr-3">
          <h4 className="text-[11px] font-bold text-gray-900 mb-1.5">Delivery Address</h4>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-gray-900">{order.addressLabel || "Home"}</span>
            {order.addressIsDefault && (
              <span className="bg-green-50 text-[#168846] text-[8px] font-bold px-1.5 py-0.5 rounded">Primary</span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
            {order.address || "Address not available"}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 mt-1.5">
            <Phone className="w-[10px] h-[10px]" /> {formatPhone(phoneNumber)}
          </div>
        </div>

        <div className="flex-1 border-l border-gray-100 pl-4 flex flex-col justify-center">
          {isCancelled ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-900" /> Cancelled on
              </div>
              <p className="text-[10px] text-gray-500 font-medium pl-5 mb-1">
                {order.statusHistory?.find(h => h.status === "CANCELLED")?.changedAt ? formatDateTime(order.statusHistory.find(h => h.status === "CANCELLED")!.changedAt) : "Date unknown"}
              </p>
              <p className="text-[10px] text-red-500 font-medium pl-5">
                {order.statusHistory?.find(h => h.status === "CANCELLED")?.note
                  ? `Reason: ${order.statusHistory.find(h => h.status === "CANCELLED")!.note}`
                  : "Reason: Order cancelled"}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-900" /> Expected Delivery
              </div>
              <p className="text-[10px] text-gray-500 font-medium pl-5">
                {formatDateOnly(serviceDate)}
                <br />
                {formatTimeSlot(timeSlot)}
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6 w-full">

        <div className="flex gap-4 md:flex-[1.2]">
          <Skeleton className="w-20 h-20 md:w-[100px] md:h-[100px] shrink-0 rounded-lg" />
          <div className="flex flex-col flex-1 min-w-0 gap-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-56" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <Skeleton className="h-3.5 w-36" />
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-[110px] md:hidden">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        <div className="hidden md:flex flex-col flex-1 border-l border-gray-100 pl-6 gap-2 min-w-[200px]">
          <Skeleton className="h-4 w-24 mb-1" />
          <div className="flex gap-2 mb-1"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-10 rounded" /></div>
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-4 w-28 mt-2" />
          <Skeleton className="h-3.5 w-24" />
        </div>

        <div className="hidden md:flex flex-col flex-[1.2] border-l border-gray-100 pl-6 gap-3">
          <Skeleton className="h-4 w-24 mb-1" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-2.5 w-16" /></div>
            </div>
          ))}
        </div>

        <div className="hidden md:flex flex-col shrink-0 w-[140px] gap-3 border-l border-gray-100 pl-6">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      <div className="md:hidden pt-4 border-t border-gray-100">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      <div className="md:hidden flex gap-4 mt-2">
        <Skeleton className="h-24 flex-1 rounded-lg" />
        <Skeleton className="h-24 flex-1 rounded-lg" />
      </div>
    </div>
  )
}
