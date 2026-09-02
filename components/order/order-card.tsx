"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import {
  Check, CheckCircle2, Copy, Calendar, ShoppingBag,
  ChefHat, XCircle, MapPin, Phone, Clock, Bike
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RazorpayIcon } from "@/components/icons/razorpay"
import { PhonePeIcon } from "@/components/icons/phonepe"
import { UpiIcon } from "@/components/icons/upi"
import { GooglePayIcon } from "@/components/icons/googlepay"
import { PaytmIcon } from "@/components/icons/paytm"
import { RupayCardIcon } from "@/components/icons/rupaycard"
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
  if (status === "SUCCESS") return { label: "PAID", color: "bg-[#ECFDF3] text-[#15803D]" }
  if (status === "REFUNDED" || status === "PARTIAL_REFUND") return { label: status === "PARTIAL_REFUND" ? "PARTIAL REFUND" : "REFUNDED", color: "bg-[#ECFDF3] text-[#166534]" }
  return { label: status || "PENDING", color: "bg-[#FEF3C7] text-[#B45309]" }
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

function HorizontalTimeline({ currentStep, category, history }: { currentStep: number; category: string; history?: { status: string, changedAt: string, note?: string | null }[] }) {
  const isCancelled = category === "cancelled"

  const steps = [
    { label: "Order Confirmed", key: "CONFIRMED", icon: Check },
    { label: "Preparing Your Order", key: "PREPARING", icon: ChefHat },
    { label: "Out for Delivery", key: "READYFORPICKUP", icon: Bike },
    { label: "Delivery Completed", key: "COMPLETED", icon: Check },
  ]

  return (
    <div className="w-full relative px-2 lg:px-8 py-6">
      <div className="flex justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-[16px] left-[10%] right-[10%] h-[2px] bg-[#D1D5DB] z-0" />
        
        {/* Active Progress */}
        {!isCancelled && (
          <div
            className="absolute top-[16px] left-[10%] h-[2px] bg-[#15803D] z-0 transition-all duration-500"
            style={{ width: `${Math.min((currentStep / 3) * 80, 80)}%` }}
          />
        )}
        {isCancelled && (
          <div
            className="absolute top-[16px] left-[10%] h-[2px] bg-[#EF4444] z-0 transition-all duration-500"
            style={{ width: `10%` }}
          />
        )}

        {steps.map((step, idx) => {
          const isActive = !isCancelled && currentStep >= idx
          const isError = isCancelled && idx === 1 // Display cancelled at step 2
          const Icon = isError ? XCircle : step.icon

          // Determine date to show
          const hist = history?.find(h => h.status === (isError ? "CANCELLED" : step.key))
          const dateStr = hist?.changedAt ? formatTimelineDate(hist.changedAt) : ""

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
              <div className={cn(
                "w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center border-2 mb-2 transition-colors duration-500",
                isError ? "border-[#EF4444] text-[#EF4444]" : (isActive ? "border-[#15803D] text-[#15803D]" : "border-[#D1D5DB] text-[#D1D5DB]")
              )}>
                <Icon className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <p className={cn(
                "text-[12px] lg:text-[13px] font-[600] text-center mb-1 leading-tight",
                isError ? "text-[#EF4444]" : (isActive ? "text-[#15803D]" : "text-[#6B7280]")
              )}>
                {isError ? "Cancelled" : step.label}
              </p>
              {isActive && !isError && dateStr && (
                <p className="text-[11px] lg:text-[12px] font-[400] text-[#6B7280] text-center">
                  {dateStr}
                </p>
              )}
              {isError && dateStr && (
                <p className="text-[11px] lg:text-[12px] font-[400] text-[#6B7280] text-center">
                  {dateStr}
                </p>
              )}
            </div>
          )
        })}
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
    <div className="bg-[#FFFFFF] rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] border border-[#E5E7EB] flex flex-col mb-6 overflow-hidden w-full max-w-4xl mx-auto">
      
      {/* Row 1: Image, Details, and Buttons */}
      <div className="flex flex-col md:flex-row p-5 lg:p-6 gap-6 relative">
        {/* Column 1: Image */}
        <div className="relative w-full md:w-[130px] h-[200px] md:h-[130px] shrink-0 bg-[#FAFAFA] rounded-[20px] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={order.kitchenName || "Order"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 130px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#9CA3AF]">
              <ChefHat className="h-10 w-10" />
            </div>
          )}
        </div>

        {/* Column 2: Order Details */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="flex items-start md:items-center justify-between gap-3 mb-2 flex-col md:flex-row">
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-[600] text-[#111827]">
                Order ID: {order.publicCode ?? `#${order.id.slice(-6).toUpperCase()}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    .writeText(order.publicCode ?? order.id)
                    .then(() => toast.success("Order ID copied"))
                    .catch(() => toast.error("Failed to copy"))
                }}
                className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                <Copy className="h-[16px] w-[16px]" />
              </button>
            </div>
            
            <div className="flex items-center">
              <span className={cn(
                "text-[13px] font-[600] px-3 py-1 rounded-full",
                isOngoing && "bg-[#FFF1E8] text-[#F97316]",
                isCompleted && "bg-[#ECFDF3] text-[#15803D]",
                isCancelled && "bg-[#FEE2E2] text-[#B91C1C]",
                category === "refunds" && "bg-[#ECFDF3] text-[#15803D]"
              )}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-[22px] font-[800] text-[#111827] leading-tight truncate">
              {order.kitchenName || order.items[0]?.kitchenName || "Kitchen"}
            </h3>
            <CheckCircle2 className="h-[18px] w-[18px] text-white fill-[#15803D] shrink-0" />
          </div>

          <p className="text-[15px] font-[500] text-[#6B7280] mb-3 line-clamp-1">{itemsStr}</p>

          <div className="flex items-center gap-4 text-[14px] font-[500] text-[#6B7280] mb-3">
            <div className="flex items-center gap-1.5 bg-[#F9FAFB] px-2 py-1 rounded">
              <ShoppingBag className="w-[14px] h-[14px] text-[#9CA3AF]" /> {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </div>
            <div className="flex items-center gap-1.5 bg-[#F9FAFB] px-2 py-1 rounded">
              <div className="border border-[#9CA3AF] text-[#6B7280] rounded-full w-[14px] h-[14px] flex items-center justify-center text-[9px] leading-none">₹</div>
              {parseFloat(order.totalAmount).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[14px] font-[500] text-[#6B7280] mb-3">
            <Calendar className="w-[16px] h-[16px] text-[#9CA3AF]" /> {formatDateTime(order.createdAt)}
          </div>

          <div className="flex items-center gap-3">
            {order.paymentProvider && (
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#F1F5F9] px-3 py-1.5 rounded-full text-[13px] font-[600] text-[#334155]">
                {order.paymentProvider.toLowerCase() === 'razorpay' ? (
                  <RazorpayIcon className="h-[12px] w-auto" />
                ) : order.paymentProvider.toLowerCase() === 'phonepe' ? (
                  <PhonePeIcon className="h-[14px] w-auto" />
                ) : order.paymentProvider.toLowerCase() === 'upi' ? (
                  <UpiIcon className="h-[12px] w-auto" />
                ) : order.paymentProvider.toLowerCase() === 'googlepay' ? (
                  <GooglePayIcon className="h-[12px] w-auto" />
                ) : order.paymentProvider.toLowerCase() === 'paytm' ? (
                  <PaytmIcon className="h-[12px] w-auto" />
                ) : order.paymentProvider.toLowerCase() === 'rupay' ? (
                  <RupayCardIcon className="h-[12px] w-auto" />
                ) : (
                  <span className="italic font-serif text-[#111827] font-black">P</span>
                )}
                Paid via {formatProvider(order.paymentProvider)}
              </div>
            )}
            <span className={cn("text-[12px] font-[700] px-3 py-1.5 rounded-full tracking-wide", payStatus.color)}>
              {payStatus.label}
            </span>
          </div>
        </div>

        {/* Column 3: Buttons */}
        <div className="flex flex-col md:w-[160px] lg:w-[180px] shrink-0 gap-3 mt-4 md:mt-0">

          {isOngoing && (
            <>
              <Button asChild className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white rounded-[12px] h-[48px] text-[15px] font-[600] gap-2 transition-colors shadow-[0_4px_12px_rgba(249,115,22,0.2)]">
                <Link href={`/account/orders/${order.publicCode ?? order.id}/track`}>
                  <MapPin className="w-[18px] h-[18px]" /> Track Order
                </Link>
              </Button>
              <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={cancelMutation.isPending}
                    className="w-full border-[#F97316] text-[#F97316] bg-white hover:bg-[#FFF7ED] rounded-[12px] h-[48px] text-[15px] font-[600] transition-colors"
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
                      className="bg-[#EF4444] hover:bg-red-700 text-white"
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
              className="w-full border-[#F97316] text-[#F97316] bg-white hover:bg-[#FFF7ED] rounded-[12px] h-[48px] text-[15px] font-[600] transition-colors"
            >
              Order Again
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Horizontal Timeline */}
      <div className="w-full border-y border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-center">
        <HorizontalTimeline currentStep={currentStep} category={category} history={order.statusHistory} />
      </div>

      {/* Row 3: Address & Expected Delivery */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#F3F4F6]">
        <div className="flex-1 p-5 lg:p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[14px] font-[600] text-[#111827]">Delivery Address</span>
            {order.addressIsDefault && (
              <span className="bg-[#ECFDF3] text-[#15803D] text-[11px] font-[600] px-2 py-0.5 rounded-full">
                Home • Primary
              </span>
            )}
          </div>
          <p className="text-[13px] font-[500] text-[#6B7280] leading-relaxed max-w-[90%] mb-2">
            {order.address || "Address not available"}
          </p>
          <div className="flex items-center gap-1.5 text-[13px] font-[500] text-[#6B7280]">
            <Phone className="w-[14px] h-[14px] text-[#9CA3AF]" /> {formatPhone(phoneNumber)}
          </div>
        </div>

        <div className="flex-1 p-5 lg:p-6 flex flex-col justify-center">
          {isCancelled ? (
            <>
              <div className="flex items-center gap-2 text-[14px] font-[600] text-[#111827] mb-2">
                <Clock className="w-[16px] h-[16px] text-[#111827]" /> Cancelled on
              </div>
              <p className="text-[13px] font-[500] text-[#6B7280] pl-[26px] mb-2">
                {order.statusHistory?.find(h => h.status === "CANCELLED")?.changedAt 
                  ? formatDateTime(order.statusHistory.find(h => h.status === "CANCELLED")!.changedAt) 
                  : "Date unknown"}
              </p>
              <p className="text-[13px] text-[#EF4444] font-[600] pl-[26px]">
                Reason: {order.statusHistory?.find(h => h.status === "CANCELLED")?.note || "Order cancelled by you"}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[14px] font-[600] text-[#111827] mb-2">
                <Clock className="w-[16px] h-[16px] text-[#111827]" /> {isCompleted ? "Delivered on" : "Expected Delivery"}
              </div>
              <p className="text-[13px] font-[500] text-[#6B7280] pl-[26px]">
                {isCompleted && order.statusHistory?.find(h => h.status === "COMPLETED")?.changedAt ? (
                  formatDateTime(order.statusHistory.find(h => h.status === "COMPLETED")!.changedAt)
                ) : (
                  <>
                    {formatDateOnly(serviceDate)}, {formatTimeSlot(timeSlot)}
                  </>
                )}
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
    <div className="bg-[#FFFFFF] rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] border border-[#E5E7EB] flex flex-col mb-6 overflow-hidden w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row p-5 lg:p-6 gap-6">
        <Skeleton className="w-full md:w-[130px] h-[200px] md:h-[130px] rounded-[20px] shrink-0" />
        <div className="flex flex-col justify-center flex-1 min-w-0 gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col md:w-[160px] lg:w-[180px] shrink-0 gap-3">
          <Skeleton className="h-[48px] w-full rounded-[12px]" />
          <Skeleton className="h-[48px] w-full rounded-[12px]" />
        </div>
      </div>
      
      <div className="w-full h-[120px] bg-[#FAFAFA] border-y border-[#F3F4F6]" />
      
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#F3F4F6]">
        <div className="flex-1 p-5 lg:p-6 flex flex-col gap-3">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="h-3 w-full" />
           <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex-1 p-5 lg:p-6 flex flex-col gap-3">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  )
}
