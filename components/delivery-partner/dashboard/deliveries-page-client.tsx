"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "@/stores/deliveryDashboardStore"
import type { getDeliveryDashboardData } from "@/actions/admin/dashboard"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { haversineDistance } from "@/lib/geo/haversine"
import { 
  Bike, Truck, CircleCheck, CircleX, Clock3, RefreshCw, 
  MapPin, UserRound, Phone, Map, ClipboardList, Landmark, 
  ShieldAlert, Check, X, ArrowRight, PackageCheck, Navigation 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

const KITCHEN_FALLBACK_IMAGE = "/kitchen/profile.webp"

type DeliveryOrderData = Omit<
  NonNullable<Awaited<ReturnType<typeof getDeliveryDashboardData>>>["deliveryOrders"][number],
  "orderStatus"
> & { orderStatus: string }

interface MergedDeliveryOrder extends DeliveryOrderData {
  itemList: string[]
  totalQuantity: number
}

function orderJourneyKm(o: DeliveryOrderData): number | null {
  const kLat = Number(o.kitchenLat)
  const kLng = Number(o.kitchenLng)
  const cLat = Number(o.customerLat)
  const cLng = Number(o.customerLng)
  if (!Number.isFinite(kLat) || !Number.isFinite(kLng) || !Number.isFinite(cLat) || !Number.isFinite(cLng)) return null
  if (kLat === 0 && kLng === 0) return null
  if (cLat === 0 && cLng === 0) return null
  return haversineDistance(kLat, kLng, cLat, cLng)
}

function getPaymentDisplay(status: unknown): string {
  if (status === "PENDING") return "Payment Pending"
  if (status === "FAILED") return "Payment Failed"
  if (status === "REFUNDED") return "Payment Refunded"
  return "Online Payment"
}

export default function DeliveriesPageClient() {
  const data = useDeliveryData()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch("/api/delivery/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
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

  const mergedOrders = useMemo<MergedDeliveryOrder[]>(() => {
    if (!data) return []
    const byId = new globalThis.Map<string, MergedDeliveryOrder>()
    for (const o of data.deliveryOrders) {
      const id = o.id as string
      if (!id) continue
      const itemLabel = `${(o.itemName as string) || "Item"}${(o.quantity as number) > 1 ? ` ×${o.quantity}` : ""}`
      const existing = byId.get(id)
      if (existing) {
        if (!existing.itemList.includes(itemLabel)) existing.itemList.push(itemLabel)
        existing.totalQuantity += Number(o.quantity) || 0
        existing.amount = (Number(existing.amount) || 0) + (Number(o.amount) || 0)
      } else {
        byId.set(id, {
          ...o,
          itemList: [itemLabel],
          totalQuantity: Number(o.quantity) || 0,
        })
      }
    }
    return Array.from(byId.values())
  }, [data])

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 pb-12 px-4 sm:px-6 lg:px-8 bg-[#FBFCFB] min-h-screen" role="status" aria-label="Loading deliveries">
        {/* Header */}
        <div className="pt-2 sm:pt-0 space-y-3">
          <Skeleton className="h-[30px] w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] p-5 flex items-center gap-4 shadow-none">
              <Skeleton className="h-[50px] w-[50px] rounded-full shrink-0" />
              <div className="flex flex-col">
                <Skeleton className="h-[23px] w-14 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-36 rounded-t-[7px]" />
            <Skeleton className="h-10 w-40 rounded-t-[7px]" />
          </div>
          <div className="flex items-center gap-3 pb-3 sm:pb-0">
            <Skeleton className="h-9 w-28 rounded-[6px]" />
            <Skeleton className="h-9 w-24 rounded-[6px]" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Orders List */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] overflow-hidden shadow-none">
                <div className="px-5 py-4 flex items-center justify-between border-b border-[#E9ECEF]">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-[6px]" />
                    <Skeleton className="h-6 w-24 rounded-[6px]" />
                  </div>
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="p-5 grid md:grid-cols-[1.5fr_1fr_auto] gap-6 items-center">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-[52px] w-[52px] rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Skeleton className="h-[18px] w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-[#E9ECEF] flex items-center justify-between gap-5">
                  <Skeleton className="flex-1 h-[16px] max-w-[320px]" />
                  <Skeleton className="h-9 w-24 rounded-[6px]" />
                </div>
              </Card>
            ))}

            {/* Bottom Banner */}
            <Skeleton className="h-[68px] w-full rounded-[8px]" />
          </div>

          {/* Sticky Details Sidebar */}
          <div className="xl:sticky xl:top-6 space-y-6">
            <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-none overflow-hidden">
              <div className="bg-[#F0F8F1] py-4 px-5">
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="p-5 border-b border-[#E9ECEF] space-y-3">
                <Skeleton className="h-3 w-24 mb-4" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))}
              </div>
              <div className="p-5 space-y-3">
                <Skeleton className="h-3 w-24 mb-4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-48" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Skeleton className="h-9 rounded-[6px]" />
                  <Skeleton className="h-9 rounded-[6px]" />
                </div>
              </div>
            </Card>
            <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-none overflow-hidden">
              <div className="py-4 px-5 flex items-center gap-3 border-b border-[#E9ECEF]">
                <Skeleton className="h-8 w-8 rounded-[6px]" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-[220px] w-full" />
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const activeOrders = mergedOrders.filter(
    (o) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED" && o.orderStatus !== "FAILED" && o.orderStatus !== "DELIVERED"
  )

  const completedOrders = mergedOrders.filter(
    (o) => o.orderStatus === "COMPLETED" || o.orderStatus === "CANCELLED" || o.orderStatus === "FAILED" || o.orderStatus === "DELIVERED"
  )

  const displayOrders = activeTab === "active" ? activeOrders : completedOrders
  const selectedOrder = displayOrders.find((o) => o.id === selectedOrderId) || displayOrders[0]

  const stats = data.stats
  const activeCount = activeOrders.length
  const totalCount = stats.totalAssignments
  const completedCount = stats.completedAssignments
  const inProgressCount = stats.pendingAssignments
  const cancelledCount = stats.cancelledAssignments

  const selectedKitchenLat = Number(selectedOrder?.kitchenLat)
  const selectedKitchenLng = Number(selectedOrder?.kitchenLng)
  const selectedCustomerLat = Number(selectedOrder?.customerLat)
  const selectedCustomerLng = Number(selectedOrder?.customerLng)
  const hasKitchenCoords = selectedOrder
    ? Number.isFinite(selectedKitchenLat) && Number.isFinite(selectedKitchenLng) && !(selectedKitchenLat === 0 && selectedKitchenLng === 0)
    : false
  const hasCustomerCoords = selectedOrder
    ? Number.isFinite(selectedCustomerLat) && Number.isFinite(selectedCustomerLng) && !(selectedCustomerLat === 0 && selectedCustomerLng === 0)
    : false

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
    toast.success("Deliveries refreshed")
  }

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "PREPARING": return { label: "Preparing", badge: "bg-[#FFF1DF] text-[#FF8500]", num: "bg-[#FFF1DF] text-[#FF8500]" }
      case "READYFORPICKUP": return { label: "Ready for Pickup", badge: "bg-[#EAF6EC] text-[#087B2B]", num: "bg-[#EAF6EC] text-[#087B2B]" }
      case "PICKEDUP": return { label: "Picked Up", badge: "bg-[#FFF1DF] text-[#FF8500]", num: "bg-[#FFF1DF] text-[#FF8500]" }
      case "INTRANSIT": return { label: "In Transit", badge: "bg-[#EAF3FF] text-[#1677E8]", num: "bg-[#EAF3FF] text-[#1677E8]" }
      case "DELIVERED": case "COMPLETED": return { label: "Delivered", badge: "bg-[#EAF6EC] text-[#087B2B]", num: "bg-[#EAF6EC] text-[#087B2B]" }
      case "CANCELLED": case "FAILED": return { label: "Cancelled", badge: "bg-[#FFE8E8] text-[#EF2020]", num: "bg-[#FFE8E8] text-[#EF2020]" }
      default: return { label: "Confirmed", badge: "bg-[#F3F4F6] text-[#374151]", num: "bg-[#F3F4F6] text-[#374151]" }
    }
  }

  const TimelineNode = ({ label, state, type }: { label: string, state: "done" | "active" | "pending", type: "green" | "orange" | "blue" }) => {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {state === "done" && <div className="h-[16px] w-[16px] rounded-full bg-[#087B2B] flex items-center justify-center"><Check className="h-[10px] w-[10px] text-white" strokeWidth={3} /></div>}
        {state === "active" && type === "green" && <div className="h-[16px] w-[16px] rounded-full bg-[#087B2B] flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white rounded-full" /></div>}
        {state === "active" && type === "orange" && <div className="h-[16px] w-[16px] rounded-full bg-[#FF8500] flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white rounded-full" /></div>}
        {state === "active" && type === "blue" && <div className="h-[16px] w-[16px] rounded-full bg-[#1677E8] flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white rounded-full" /></div>}
        {state === "pending" && <div className="h-[16px] w-[16px] rounded-full border border-[#9CA3AF] bg-white" />}
        <span className={cn("text-[11px] font-bold", 
          state === "done" ? "text-[#111827]" :
          state === "active" && type === "green" ? "text-[#087B2B]" :
          state === "active" && type === "orange" ? "text-[#FF8500]" :
          state === "active" && type === "blue" ? "text-[#1677E8]" :
          "text-[#6B7280]"
        )}>{label}</span>
      </div>
    )
  }

  const TimelineDash = ({ state }: { state: "done" | "pending" }) => (
    <div className={cn("flex-1 h-[2px] mx-1.5 sm:mx-2", state === "done" ? "bg-[#087B2B]" : "bg-[#DDE3E0]")} />
  )

  const OrderTimeline = ({ status }: { status: string }) => {
    let step = 0;
    if (status === "PREPARING") step = 0;
    if (status === "READYFORPICKUP") step = 1;
    if (status === "PICKEDUP") step = 2;
    if (status === "INTRANSIT") step = 3;
    if (status === "DELIVERED" || status === "COMPLETED") step = 4;

    return (
      <div className="flex items-center justify-between w-full flex-1 min-w-[320px] max-w-[500px]">
        <TimelineNode label="Confirmed" state={step >= 0 ? "done" : "pending"} type="green" />
        <TimelineDash state={step >= 1 ? "done" : "pending"} />
        <TimelineNode label="Ready" state={step >= 1 ? "done" : "pending"} type="green" />
        <TimelineDash state={step >= 2 ? "done" : "pending"} />
        <TimelineNode label="Pickup" state={step > 2 ? "done" : step === 2 ? "active" : "pending"} type="orange" />
        <TimelineDash state={step >= 3 ? "done" : "pending"} />
        <TimelineNode label="In Transit" state={step > 3 ? "done" : step === 3 ? "active" : "pending"} type="blue" />
        <TimelineDash state={step >= 4 ? "done" : "pending"} />
        <TimelineNode label="Delivered" state={step >= 4 ? "done" : "pending"} type="green" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12 px-4 sm:px-6 lg:px-8 bg-[#FBFCFB] min-h-screen">
      
      {/* Header */}
      <div className="pt-2 sm:pt-0">
        <h1 className="text-[25px] font-bold text-[#111827]">Deliveries</h1>
        <p className="text-[#374151] mt-1 font-medium text-[14px]">Manage your deliveries and track progress</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: "Active Deliveries", value: activeCount, icon: Bike, iconColor: "text-[#087B2B]", iconBg: "bg-[#E8F5EA]" },
          { label: "Total Deliveries", value: totalCount, icon: Truck, iconColor: "text-[#1677E8]", iconBg: "bg-[#EAF3FF]" },
          { label: "Completed Deliveries", value: completedCount, icon: CircleCheck, iconColor: "text-[#087B2B]", iconBg: "bg-[#E4F4E7]" },
          { label: "In Progress Deliveries", value: inProgressCount, icon: Clock3, iconColor: "text-[#FF8500]", iconBg: "bg-[#FFF1DF]" },
          { label: "Cancelled Deliveries", value: cancelledCount, icon: CircleX, iconColor: "text-[#EF2020]", iconBg: "bg-[#FFE8E8]" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
            <div className={cn("h-[50px] w-[50px] rounded-full flex items-center justify-center shrink-0", stat.iconBg)}>
              <stat.icon className={cn("h-[22px] w-[22px]", stat.iconColor)} strokeWidth={1.8} />
            </div>
            <div className="flex flex-col">
              <span className="text-[23px] font-bold text-[#111827] leading-none mb-1">{stat.value}</span>
              <span className="text-[12px] font-medium text-[#374151] leading-tight pr-2">{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9ECEF]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-5 py-3 text-[14px] font-bold transition-colors border-b-2",
              activeTab === "active"
                ? "text-[#087B2B] bg-[#EEF8F0] rounded-t-[7px] border-[#087B2B]"
                : "text-[#374151] border-transparent hover:text-[#111827]"
            )}
          >
            Active Deliveries
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-5 py-3 text-[14px] font-bold transition-colors border-b-2",
              activeTab === "completed"
                ? "text-[#087B2B] bg-[#EEF8F0] rounded-t-[7px] border-[#087B2B]"
                : "text-[#374151] border-transparent hover:text-[#111827]"
            )}
          >
            Completed Deliveries
          </button>
        </div>
        <div className="flex items-center gap-3 pb-3 sm:pb-0">
          <Button onClick={handleRefresh} variant="outline" className="bg-[#FFFFFF] border-[#E6EAEC] text-[#111827] hover:bg-[#F7FAF8] h-9 rounded-[6px] px-4 shadow-none text-[13px] font-medium">
            <RefreshCw className="h-[16px] w-[16px] mr-2" strokeWidth={1.8} /> Refresh
          </Button>
        </div>
      </div>


      <div className={cn("grid gap-6 items-start", selectedOrder ? "xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_420px]" : "grid-cols-1")}>
        {/* Orders List */}
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <Card className="bg-[#FFFFFF] rounded-[10px] p-12 text-center border border-[#E6EAEC] shadow-[0_1px_3px_rgba(17,24,39,0.025)]">
              <PackageCheck className="h-12 w-12 text-[#6B7280] mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#374151] font-medium text-[14px]">No deliveries found.</p>
            </Card>
          ) : (
            displayOrders.map((d, idx) => {
              const statusDisplay = getStatusDisplay(d.orderStatus as string)
              const orderIdStr = (d.publicCode as string) ?? (d.id as string).substring(0, 8).toUpperCase()
              const isSelected = selectedOrderId === d.id || (!selectedOrderId && idx === 0)
              
              return (
                <Card 
                  key={d.id as string} 
                  className={cn(
                    "bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] overflow-hidden transition-all cursor-pointer shadow-[0_1px_2px_rgba(17,24,39,0.02)]",
                    isSelected && "border-[#B9DDBF] ring-1 ring-[#EEF8F0] shadow-[0_4px_12px_rgba(17,24,39,0.05)]"
                  )}
                  onClick={() => setSelectedOrderId(d.id as string)}
                >
                  {/* Order Header */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E9ECEF] gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-7 w-7 rounded-[6px] font-bold text-[13px] flex items-center justify-center", statusDisplay.num)}>
                        {idx + 1}
                      </div>
                      <Badge variant="outline" className={cn("px-3 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 border-none shadow-none", statusDisplay.badge)}>
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {statusDisplay.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full px-1 sm:px-0">
                      <div className="text-[13px] font-bold text-[#111827]">#{orderIdStr}</div>
                      <div className="text-[13px] font-medium text-[#374151] flex items-center gap-1.5">
                        <Clock3 className="h-[14px] w-[14px] text-[#374151]" strokeWidth={1.8} />
                        {d.timeSlot as string || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-5 grid md:grid-cols-[1.5fr_1fr_auto] gap-6 items-center">
                    
                    {/* Kitchen Info */}
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-[52px] w-[52px] rounded-full border border-[#E6EAEC] shadow-sm shrink-0">
                        <AvatarImage src={(d.kitchenImageUrl as string) || KITCHEN_FALLBACK_IMAGE} alt={d.kitchenName as string} />
                        <AvatarFallback className="bg-[#EEF8F0] text-[#087B2B] font-bold text-lg">{(d.kitchenName as string).charAt(0).toUpperCase() || "K"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-[#111827] text-[15px] mb-1 truncate">{d.kitchenName as string}</div>
                        <div className="flex items-start gap-1.5 text-[12px] text-[#374151] mb-1.5">
                          <MapPin className="h-[15px] w-[15px] shrink-0 mt-0.5" strokeWidth={1.8} />
                          <span className="truncate block">{d.kitchenAddress as string}</span>
                        </div>
                        {orderJourneyKm(d) !== null && (
                          <div className="text-[11px] font-medium text-[#6B7280] ml-[21px]">
                            {orderJourneyKm(d)!.toFixed(1)} km from you
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col">
                        <div className="text-[12px] font-medium text-[#374151] mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                          <UserRound className="h-[14px] w-[14px]" strokeWidth={1.8} /> Customer
                        </div>
                        <div className="font-bold text-[#111827] text-[14px] mb-1 truncate">{d.customerName as string}</div>
                        <div className="text-[12px] text-[#374151]">{d.customerPhone as string}</div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="md:text-right flex flex-col justify-center items-start md:items-end mt-2 md:mt-0">
                      <div className="font-bold text-[18px] text-[#111827] mb-1">₹{(d.amount as number).toLocaleString('en-IN')}</div>
                      <div className="text-[12px] text-[#374151]">
                        {getPaymentDisplay(d.paymentStatus)}
                      </div>
                    </div>

                  </div>

                  {/* Order Footer & Actions */}
                  <div className="px-5 py-4 border-t border-[#E9ECEF] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#FFFFFF]">
                    <div className="flex-1 overflow-x-auto pb-3 xl:pb-0 scrollbar-hide flex items-center w-full">
                      <OrderTimeline status={d.orderStatus as string} />
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 self-end xl:self-auto">
                       {/* Buttons */}
                       {d.orderStatus === "READYFORPICKUP" && (
                         <Button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "PICKEDUP" })}} className="bg-[#FFFDFC] border border-[#FFD39E] text-[#FF8500] hover:bg-[#FFF1DF] rounded-[6px] h-9 px-4 font-bold text-[13px] shadow-none">
                           Picked Up
                         </Button>
                       )}
                       {d.orderStatus === "PICKEDUP" && (
                         <>
                           <Button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "INTRANSIT" })}} className="bg-[#F5FBF6] border border-[#B9DDBF] text-[#087B2B] hover:bg-[#EEF8F0] rounded-[6px] h-9 px-4 font-bold text-[13px] shadow-none">
                             <Truck className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> In Transit
                           </Button>
                           <Button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "FAILED" })}} className="bg-[#FFF5F5] border border-[#FFCACA] text-[#EF2020] hover:bg-[#FFE8E8] rounded-[6px] h-9 px-4 font-bold text-[13px] shadow-none">
                             <X className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Failed
                           </Button>
                         </>
                       )}
                       {d.orderStatus === "INTRANSIT" && (
                         <>
                           <Button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "DELIVERED" })}} className="bg-[#F5FBF6] border border-[#B9DDBF] text-[#087B2B] hover:bg-[#EEF8F0] rounded-[6px] h-9 px-4 font-bold text-[13px] shadow-none">
                             <CircleCheck className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Delivered
                           </Button>
                           <Button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "FAILED" })}} className="bg-[#FFF5F5] border border-[#FFCACA] text-[#EF2020] hover:bg-[#FFE8E8] rounded-[6px] h-9 px-4 font-bold text-[13px] shadow-none">
                             <X className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Failed
                           </Button>
                         </>
                       )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}

          {/* Bottom Banner */}
          <Link href="/delivery-partner/dashboard/support" className="bg-[#F0F8F1] rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between border-none mt-6 gap-3 hover:bg-[#E4F4E7] transition-colors">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-[20px] w-[20px] text-[#087B2B] shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium text-[#374151]">Keep customers happy by following safety guidelines and delivering on time.</span>
            </div>
            <div className="flex items-center text-[13px] font-bold text-[#087B2B] whitespace-nowrap ml-[32px] sm:ml-0">
              View Guidelines <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Sticky Details Sidebar */}
        {selectedOrder && (
          <div className="xl:sticky xl:top-6 space-y-6">
            <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] overflow-hidden">
              
              <div className="bg-[#F0F8F1] py-4 px-5 flex items-center gap-3">
                <ClipboardList className="h-[20px] w-[20px] text-[#087B2B]" strokeWidth={1.8} />
                <h3 className="font-bold text-[#111827] text-[15px]">Assignment Details</h3>
              </div>
              
              {/* Order Details */}
              <div className="p-5 border-b border-[#E9ECEF]">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-[16px] w-[16px] text-[#111827]" strokeWidth={1.8} />
                  <h4 className="text-[13px] font-medium text-[#374151]">Order Details</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#374151]">Order ID</span>
                    <span className="font-bold text-[#111827]">#{(selectedOrder.publicCode as string) ?? (selectedOrder.id as string).substring(0,8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#374151]">Item</span>
                    <span className="font-bold text-[#111827] max-w-[150px] text-right truncate">{(selectedOrder.itemList as string[]).join(", ") || (selectedOrder.itemName as string) || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#374151]">Quantity</span>
                    <span className="font-bold text-[#111827]">{selectedOrder.totalQuantity || (selectedOrder.quantity as number) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#374151]">Payment Method</span>
                    <span className="font-bold text-[#111827]">{getPaymentDisplay(selectedOrder.paymentStatus)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#374151]">Order Time</span>
                    <span className="font-bold text-[#111827]">{selectedOrder.timeSlot || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Kitchen Details */}
              <div className="p-5 border-b border-[#E9ECEF]">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="h-[16px] w-[16px] text-[#111827]" strokeWidth={1.8} />
                  <h4 className="text-[13px] font-medium text-[#374151]">Kitchen Details</h4>
                </div>
                <div className="mb-5">
                  <div className="font-bold text-[#111827] text-[14px] mb-1.5">{selectedOrder.kitchenName as string}</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#087B2B] mb-2">
                    <Phone className="h-[15px] w-[15px]" strokeWidth={2} /> {selectedOrder.kitchenPhone as string}
                  </div>
                  <div className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <MapPin className="h-[15px] w-[15px] shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>{selectedOrder.kitchenAddress as string}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${selectedOrder.kitchenPhone}`}>
                    <Button className="w-full bg-[#EEF8F0] hover:bg-[#E4F4E7] text-[#087B2B] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                      <Check className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Call Kitchen
                    </Button>
                  </a>
                  {hasKitchenCoords ? (
                    <a href={`https://maps.google.com/?q=${selectedKitchenLat},${selectedKitchenLng}`} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#EEF8F0] hover:bg-[#E4F4E7] text-[#087B2B] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                        <Map className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Open in Map
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="w-full bg-[#F3F4F6] text-[#9CA3AF] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                      <Map className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Open in Map
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserRound className="h-[16px] w-[16px] text-[#111827]" strokeWidth={1.8} />
                  <h4 className="text-[13px] font-medium text-[#374151]">Customer Details</h4>
                </div>
                <div className="mb-5">
                  <div className="font-bold text-[#111827] text-[14px] mb-1.5">{selectedOrder.customerName as string}</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#087B2B] mb-2">
                    <Phone className="h-[15px] w-[15px]" strokeWidth={2} /> {selectedOrder.customerPhone as string}
                  </div>
                  <div className="flex items-start gap-1.5 text-[13px] text-[#374151]">
                    <MapPin className="h-[15px] w-[15px] shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>{selectedOrder.customerAddress as string}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <a href={`tel:${selectedOrder.customerPhone}`}>
                    <Button className="w-full bg-[#EEF8F0] hover:bg-[#E4F4E7] text-[#087B2B] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                      <Check className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Call Customer
                    </Button>
                  </a>
                  {hasCustomerCoords ? (
                    <a href={`https://maps.google.com/?q=${selectedCustomerLat},${selectedCustomerLng}`} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#EEF8F0] hover:bg-[#E4F4E7] text-[#087B2B] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                        <Map className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Open in Map
                      </Button>
                    </a>
                  ) : (
                    <Button disabled className="w-full bg-[#F3F4F6] text-[#9CA3AF] rounded-[6px] font-bold h-9 text-[13px] shadow-none border-none">
                      <Map className="h-[16px] w-[16px] mr-1.5" strokeWidth={2} /> Open in Map
                    </Button>
                  )}
                </div>
                
                {/* Warning Box */}
                <div className="bg-[#FFF6E8] border border-[#FFD9A8] rounded-[8px] p-4 flex gap-3">
                  <ShieldAlert className="h-[20px] w-[20px] text-[#FF8500] shrink-0" strokeWidth={1.8} />
                  <p className="text-[#8A4B00] text-[13px] font-medium leading-snug">
                    Please handle orders carefully and maintain good customer service.
                  </p>
                </div>
              </div>
            </Card>

            {/* Live Order Tracking */}
            {hasKitchenCoords && (
              <Card className="bg-[#FFFFFF] border border-[#E6EAEC] rounded-[10px] shadow-[0_1px_3px_rgba(17,24,39,0.025)] overflow-hidden">
                <div className="py-4 px-5 flex items-center gap-3 border-b border-[#E9ECEF]">
                  <div className="h-8 w-8 rounded-[6px] bg-[#EAF3FF] flex items-center justify-center border border-[#C9DEFA]">
                    <Navigation className="h-4 w-4 text-[#1677E8]" />
                  </div>
                  <h3 className="font-bold text-[#111827] text-[15px]">Live Order Tracking</h3>
                </div>
                <div className="p-4">
                  <LiveOrderTrackingMap
                    orderId={selectedOrder.id as string}
                    kitchenLat={selectedKitchenLat}
                    kitchenLng={selectedKitchenLng}
                    customerLat={hasCustomerCoords ? selectedCustomerLat : undefined}
                    customerLng={hasCustomerCoords ? selectedCustomerLng : undefined}
                    deliveryPersonId={data.profile.id}
                    broadcastLocation
                  />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
