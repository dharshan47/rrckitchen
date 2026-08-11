"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import {
  Check, CheckCircle2, Copy, Calendar, ShoppingBag,
  ChefHat, XCircle, MapPin, Phone, Clock
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
  { key: "PREPARING", label: "Preparing Your Order" },
  { key: "READYFORPICKUP", label: "Out for Delivery" },
  { key: "COMPLETED", label: "Delivery Completed" },
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
  if (status === "READYFORPICKUP") return "Out for Delivery"
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()
  return `${dateStr}, ${timeStr}`
}

function formatTimelineDate(iso: string) {
  const d = new Date(iso)
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()
  return `${dateStr}, ${timeStr}`
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

function TimelineIcon({ type, state }: { type: 'check' | 'chef' | 'bike' | 'cancel', state: 'active' | 'inactive' | 'error' | 'success' }) {
  const isError = state === 'error'
  const isSuccess = state === 'success'
  const isActive = state === 'active'

  const colorClass = isError ? 'text-red-500 border-red-500' : (isSuccess || isActive ? 'text-[#168846] border-[#168846]' : 'text-gray-400 border-gray-300')
  const iconColor = isError ? 'text-red-500' : (isSuccess || isActive ? 'text-[#168846]' : 'text-gray-400')

  return (
    <div className={cn("w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center bg-white z-10", colorClass)}>
      {type === 'check' && <Check className={cn("w-4 h-4", iconColor)} strokeWidth={2.5} />}
      {type === 'chef' && <ChefHat className={cn("w-4 h-4", iconColor)} strokeWidth={1.5} />}
      {type === 'bike' && (
        <svg className={cn("w-4 h-4", iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 17a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0zm4.5-9h4l2 4h-2M8 12h8m-8 0V8a2 2 0 00-2-2H5a2 2 0 00-2 2v4m4 0H5" />
        </svg>
      )}
      {type === 'cancel' && <XCircle className={cn("w-4 h-4", iconColor)} strokeWidth={1.5} />}
    </div>
  )
}

function HorizontalTimeline({ currentStep, category, history }: { currentStep: number; category: string; history?: { status: string, changedAt: string, note?: string | null }[] }) {
  const isCancelled = category === "cancelled"

  return (
    <div className="relative flex items-start justify-between w-full px-4">
      {/* Progress Bar Background */}
      <div className="absolute left-[12%] right-[12%] top-[15px] h-[1.5px] bg-gray-200 z-0" />
      
      {/* Active Progress */}
      {!isCancelled && (
        <div
          className="absolute left-[12%] top-[15px] h-[1.5px] bg-[#168846] z-0 transition-all duration-500"
          style={{ width: `${Math.min((currentStep / 3) * 76, 76)}%` }}
        />
      )}
      {isCancelled && (
        <div className="absolute left-[12%] top-[15px] h-[1.5px] bg-red-500 z-0 transition-all duration-500" style={{ width: '25%' }} />
      )}

      {/* Step 1: Order Confirmed */}
      <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
        <TimelineIcon type="check" state={isCancelled ? "error" : "success"} />
        <div className="text-center">
          <p className={cn("text-[11px] font-bold leading-tight", isCancelled ? "text-red-500" : "text-[#168846]")}>
            Order Confirmed
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
            {history?.find(h => h.status === "CONFIRMED")?.changedAt 
              ? formatTimelineDate(history.find(h => h.status === "CONFIRMED")!.changedAt)
              : ""}
          </p>
        </div>
      </div>

      {/* Step 2: Preparing / Cancelled */}
      <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
        {isCancelled ? (
          <>
            <TimelineIcon type="cancel" state="error" />
            <div className="text-center">
              <p className="text-[11px] font-bold leading-tight text-red-500">Cancelled</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {history?.find(h => h.status === "CANCELLED")?.changedAt 
                  ? formatTimelineDate(history.find(h => h.status === "CANCELLED")!.changedAt)
                  : ""}
              </p>
            </div>
          </>
        ) : (
          <>
            <TimelineIcon type={currentStep > 1 ? "check" : "chef"} state={currentStep >= 1 ? "success" : "inactive"} />
            <div className="text-center">
              <p className={cn("text-[11px] font-bold leading-tight", currentStep >= 1 ? "text-[#168846]" : "text-gray-500")}>
                Preparing Your Order
              </p>
              {currentStep >= 1 && (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {history?.find(h => h.status === "PREPARING")?.changedAt 
                    ? formatTimelineDate(history.find(h => h.status === "PREPARING")!.changedAt)
                    : ""}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Step 3: Out for Delivery */}
      <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
        <TimelineIcon type={currentStep > 2 && !isCancelled ? "check" : "bike"} state={isCancelled ? "inactive" : (currentStep >= 2 ? "success" : "inactive")} />
        <div className="text-center">
          <p className={cn("text-[11px] font-bold leading-tight", currentStep >= 2 && !isCancelled ? "text-[#168846]" : "text-gray-500")}>
            Out for Delivery
          </p>
          {currentStep >= 2 && !isCancelled && (
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
              {history?.find(h => h.status === "READYFORPICKUP")?.changedAt 
                ? formatTimelineDate(history.find(h => h.status === "READYFORPICKUP")!.changedAt)
                : ""}
            </p>
          )}
        </div>
      </div>

      {/* Step 4: Delivery Completed */}
      <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
        <TimelineIcon type="check" state={isCancelled ? "inactive" : (currentStep >= 3 ? "success" : "inactive")} />
        <div className="text-center">
          <p className={cn("text-[11px] font-bold leading-tight", currentStep >= 3 && !isCancelled ? "text-[#168846]" : "text-gray-500")}>
            Delivery Completed
          </p>
          {currentStep >= 3 && !isCancelled && (
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
              {history?.find(h => h.status === "COMPLETED")?.changedAt 
                ? formatTimelineDate(history.find(h => h.status === "COMPLETED")!.changedAt)
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function OrderCard({ order }: { order: UserOrder & { statusHistory?: { status: string, changedAt: string, note?: string | null }[] } }) {
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

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 flex flex-col mb-4">
      
      {/* Top Section: Details & Buttons */}
      <div className="flex flex-col md:flex-row justify-between w-full gap-6">
        
        {/* Left: Image & Details */}
        <div className="flex gap-5 flex-1 min-w-0">
          <div className="relative w-[110px] h-[110px] md:w-[120px] md:h-[120px] shrink-0 bg-gray-50 rounded-[12px] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={order.kitchenName || "Order"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 110px, 120px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <ChefHat className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center flex-1 min-w-0">
            {/* Row 1: Order ID & Status Badge */}
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className="text-[13px] font-bold text-gray-900">
                Order ID: #{order.id.slice(-6).toUpperCase()}
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
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <span className={cn(
                "text-[11px] font-bold px-2.5 py-0.5 rounded",
                isOngoing && "bg-red-50 text-red-500",
                isCompleted && "bg-[#e8f5ed] text-[#168846]",
                isCancelled && "bg-red-50 text-red-500",
                category === "refunds" && "bg-purple-50 text-purple-700"
              )}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            {/* Row 2: Kitchen Name */}
            <div className="flex items-center gap-1.5 mb-2">
              <h3 className="text-[18px] font-bold text-gray-900 truncate">
                {order.kitchenName || order.items[0]?.kitchenName || "Kitchen"}
              </h3>
              <CheckCircle2 className="h-[18px] w-[18px] text-white fill-green-600 shrink-0" />
            </div>

            {/* Row 3: Items string */}
            <p className="text-[13px] text-gray-500 mb-3 line-clamp-1">{itemsStr}</p>

            {/* Row 4: Icons for Items and Price */}
            <div className="flex items-center gap-5 text-[13px] font-bold text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-[15px] h-[15px] text-gray-400" /> {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </div>
              <div className="flex items-center gap-2">
                <div className="border border-gray-400 text-gray-500 rounded-full w-[15px] h-[15px] flex items-center justify-center text-[10px] leading-none">₹</div>
                {parseFloat(order.totalAmount).toFixed(2)}
              </div>
            </div>

            {/* Row 5: Date */}
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-3.5">
              <Calendar className="w-4 h-4 text-gray-400" /> {formatDateTime(order.createdAt)}
            </div>

            {/* Row 6: Payment */}
            <div className="flex items-center gap-3">
              {order.paymentProvider && (
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded text-[12px] font-bold text-gray-700">
                  <span className="italic font-serif text-gray-800 font-black">P</span>
                  Paid via {formatProvider(order.paymentProvider)}
                </div>
              )}
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded", payStatus.color)}>
                {payStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-[150px]">
          {isOngoing && (
            <>
              <Button asChild className="w-full bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white rounded-md h-[40px] text-[13px] font-bold gap-2">
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
                    className="w-full border-[#FF5A00] text-[#FF5A00] bg-white hover:bg-orange-50 rounded-md h-[40px] text-[13px] font-bold"
                  >
                    Cancel Order
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
          )}

          {(isCompleted || isCancelled || category === "refunds") && (
            <Button
              type="button"
              variant="outline"
              onClick={orderAgain}
              className="w-full border-[#FF5A00] text-[#FF5A00] bg-white hover:bg-orange-50 rounded-md h-[40px] text-[13px] font-bold"
            >
              Order Again
            </Button>
          )}
        </div>
      </div>

      {/* Middle Section: Timeline */}
      <div className="mt-6 border border-gray-100 rounded-[12px] p-6 w-full hidden md:block">
        <HorizontalTimeline currentStep={currentStep} category={category} history={order.statusHistory} />
      </div>

      {/* Mobile Timeline */}
      <div className="mt-5 md:hidden">
         <HorizontalTimeline currentStep={currentStep} category={category} history={order.statusHistory} />
      </div>

      {/* Bottom Section: Address & Info */}
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
        
        {/* Delivery Address */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[13px] font-bold text-gray-900">Delivery Address</span>
            <span className="bg-[#e8f5ed] text-[#168846] text-[10px] font-bold px-2 py-0.5 rounded">
              {order.addressLabel || "Home"} {order.addressIsDefault ? "• Primary" : ""}
            </span>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed md:max-w-[70%]">
            {order.address || "Address not available"}
          </p>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 mt-2.5">
            <Phone className="w-4 h-4 text-gray-400" /> {formatPhone(phoneNumber)}
          </div>
        </div>

        {/* Expected Delivery or Cancelled Reason */}
        <div className="flex flex-col items-start w-full md:w-[300px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-8">
          {isCancelled ? (
            <>
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-1.5">
                <Clock className="w-4 h-4 text-gray-900" /> Cancelled on
              </div>
              <p className="text-[13px] text-gray-600 pl-6 mb-1.5">
                {order.statusHistory?.find(h => h.status === "CANCELLED")?.changedAt 
                  ? formatDateTime(order.statusHistory.find(h => h.status === "CANCELLED")!.changedAt) 
                  : "Date unknown"}
              </p>
              <p className="text-[13px] text-red-500 font-bold pl-6">
                Reason: {order.statusHistory?.find(h => h.status === "CANCELLED")?.note || "Order cancelled"}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-1.5">
                <Clock className="w-4 h-4 text-gray-900" /> Expected Delivery
              </div>
              <p className="text-[13px] text-gray-600 pl-6">
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
    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 flex flex-col mb-4">
      <div className="flex flex-col md:flex-row justify-between w-full gap-6">
        <div className="flex gap-5 flex-1 min-w-0">
          <Skeleton className="w-[110px] h-[110px] md:w-[120px] md:h-[120px] rounded-[12px] shrink-0" />
          <div className="flex flex-col justify-center flex-1 min-w-0 gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-[150px]">
          <Skeleton className="h-[40px] w-full rounded-md" />
          <Skeleton className="h-[40px] w-full rounded-md" />
        </div>
      </div>
      <div className="mt-6 border border-gray-100 rounded-[12px] p-6 w-full">
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
        <div className="flex flex-col flex-1 gap-2.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col items-start w-full md:w-[300px] shrink-0 md:border-l border-gray-100 md:pl-8 gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  )
}
