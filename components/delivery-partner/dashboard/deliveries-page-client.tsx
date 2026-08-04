"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "@/stores/deliveryDashboardStore"
import { LiveOrderTrackingMap } from "@/components/map/live-order-tracking-map"
import { haversineDistance } from "@/lib/geo/haversine"
import { Bike, Truck, CheckCircle2, Clock, XCircle, RefreshCw, Filter, MapPin, Phone, User, Check, Store, Navigation, AlertTriangle, ChevronRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

const KITCHEN_FALLBACK_IMAGE = "/kitchen/profile.webp"

function orderJourneyKm(o: Record<string, unknown>): number | null {
  const kLat = Number(o.kitchenLat)
  const kLng = Number(o.kitchenLng)
  const cLat = Number(o.customerLat)
  const cLng = Number(o.customerLng)
  if (!Number.isFinite(kLat) || !Number.isFinite(kLng) || !Number.isFinite(cLat) || !Number.isFinite(cLng)) return null
  if (kLat === 0 && kLng === 0) return null
  if (cLat === 0 && cLng === 0) return null
  return haversineDistance(kLat, kLng, cLat, cLng)
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

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-card p-6 space-y-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activeOrders = data.deliveryOrders.filter(
    (o: Record<string, unknown>) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED" && o.orderStatus !== "FAILED" && o.orderStatus !== "DELIVERED"
  )

  const completedOrders = data.deliveryOrders.filter(
    (o: Record<string, unknown>) => o.orderStatus === "COMPLETED" || o.orderStatus === "CANCELLED" || o.orderStatus === "FAILED" || o.orderStatus === "DELIVERED"
  )

  const displayOrders = activeTab === "active" ? activeOrders : completedOrders

  const selectedOrder = displayOrders.find((o: Record<string, unknown>) => o.id === selectedOrderId) || displayOrders[0]

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
      case "PREPARING": return { label: "Preparing", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" }
      case "READYFORPICKUP": return { label: "Ready for Pickup", color: "bg-green-100 text-green-700", dot: "bg-green-500" }
      case "PICKEDUP": return { label: "Picked Up", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" }
      case "INTRANSIT": return { label: "In Transit", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" }
      case "DELIVERED": case "COMPLETED": return { label: "Delivered", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" }
      case "CANCELLED": case "FAILED": return { label: "Cancelled", color: "bg-red-100 text-red-700", dot: "bg-red-500" }
      default: return { label: "Confirmed", color: "bg-slate-100 text-slate-700", dot: "bg-slate-500" }
    }
  }

  const TimelineNode = ({ label, state }: { label: string, state: "done" | "active-orange" | "active-blue" | "pending" }) => {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {state === "done" && <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div>}
        {state === "active-orange" && <div className="h-4 w-4 rounded-full bg-orange-100 border-[4px] border-orange-500" />}
        {state === "active-blue" && <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div>}
        {state === "pending" && <div className="h-4 w-4 rounded-full border border-slate-300 bg-white" />}
        <span className={cn("text-[10px] font-bold uppercase", 
          state === "done" ? "text-slate-700" :
          state === "active-orange" ? "text-orange-600" :
          state === "active-blue" ? "text-blue-600" :
          "text-slate-400"
        )}>{label}</span>
      </div>
    )
  }

  const TimelineDash = ({ state }: { state: "done" | "active" | "pending" }) => (
    <div className={cn("flex-1 h-[1.5px] mx-1", 
      state === "done" ? "bg-green-600" : 
      state === "active" ? "border-t-[1.5px] border-dashed border-orange-400" : 
      "bg-slate-200"
    )} />
  )

  const OrderTimeline = ({ status }: { status: string }) => {
    const steps = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "PICKEDUP", "INTRANSIT", "DELIVERED", "COMPLETED"]
    const currentIndex = Math.max(0, steps.indexOf(status))

    return (
      <div className="flex items-center justify-between w-full flex-1 max-w-md">
        <TimelineNode label="Confirmed" state="done" />
        <TimelineDash state="done" />
        <TimelineNode label="Ready" state={currentIndex === 2 ? "active-orange" : (currentIndex > 2 ? "done" : "pending")} />
        <TimelineDash state={currentIndex === 2 ? "pending" : (currentIndex > 2 ? "done" : "pending")} />
        <TimelineNode label="Pickup" state={currentIndex === 3 ? "active-orange" : (currentIndex > 3 ? "done" : "pending")} />
        <TimelineDash state={currentIndex === 3 ? "active" : (currentIndex > 3 ? "done" : "pending")} />
        <TimelineNode label="In Transit" state={currentIndex === 4 ? "active-blue" : (currentIndex > 4 ? "done" : "pending")} />
        <TimelineDash state={currentIndex === 4 ? "pending" : (currentIndex > 4 ? "done" : "pending")} />
        <TimelineNode label="Delivered" state={currentIndex >= 5 ? "done" : "pending"} />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Deliveries</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Manage your deliveries and track progress</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Active Deliveries", value: activeCount, icon: Bike, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "Total Deliveries", value: totalCount, icon: Truck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Completed Deliveries", value: completedCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "In Progress Deliveries", value: inProgressCount, icon: Clock, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
          { label: "Cancelled Deliveries", value: cancelledCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-none border-slate-100 rounded-2xl flex flex-col items-center justify-center py-6">
             <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shadow-sm", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{stat.value}</span>
                    <span className="text-xs font-semibold text-slate-500 mt-1 leading-tight w-16">{stat.label}</span>
                  </div>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-px">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
              activeTab === "active"
                ? "border-green-600 text-green-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Active Deliveries
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
              activeTab === "completed"
                ? "border-green-600 text-green-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Completed Deliveries
          </button>
        </div>
        <div className="flex items-center gap-3 px-2 sm:px-0">
          <Button variant="outline" onClick={handleRefresh} className="h-9 rounded-xl border-slate-200 text-slate-700 font-semibold text-xs shadow-sm">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </Button>
          <Button variant="outline" className="h-9 rounded-xl border-slate-200 text-slate-700 font-semibold text-xs shadow-sm">
            <Filter className="h-3.5 w-3.5 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {displayOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No deliveries found.</p>
            </div>
          ) : (
            displayOrders.map((d: Record<string, unknown>, idx: number) => {
              const statusDisplay = getStatusDisplay(d.orderStatus as string)
              const orderIdStr = (d.publicCode as string) ?? (d.id as string).substring(0, 8).toUpperCase()
              const isSelected = selectedOrderId === d.id || (!selectedOrderId && idx === 0)
              
              return (
                <Card 
                  key={d.id as string} 
                  className={cn(
                    "shadow-sm border-slate-200 rounded-3xl overflow-hidden transition-all cursor-pointer hover:border-slate-300 hover:shadow-md",
                    isSelected && "border-green-300 shadow-[0_4px_20px_rgba(34,197,94,0.1)] ring-1 ring-green-100"
                  )}
                  onClick={() => setSelectedOrderId(d.id as string)}
                >
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <Badge variant="secondary" className={cn("rounded-md border-none font-bold text-[10px] px-2 py-0.5", statusDisplay.color)}>
                          <div className={cn("h-1.5 w-1.5 rounded-full mr-1.5", statusDisplay.dot)} />
                          {statusDisplay.label}
                        </Badge>
                      </div>
                      <div className="text-xs font-bold text-slate-500">#{orderIdStr}</div>
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {d.timeSlot as string}
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-6 grid md:grid-cols-[1fr_1fr_auto] gap-6 items-center">
                      
                      {/* Kitchen Info */}
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 border-2 border-green-700/30 shadow-sm">
                          <AvatarImage
                            src={(d.kitchenImageUrl as string) || KITCHEN_FALLBACK_IMAGE}
                            alt={d.kitchenName as string}
                          />
                          <AvatarFallback className="bg-green-900 text-white font-extrabold text-sm">
                            {(d.kitchenName as string).charAt(0).toUpperCase() || "K"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm mb-1">{d.kitchenName as string}</div>
                          <div className="flex items-start gap-1.5 text-xs text-slate-500 font-medium mb-1">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                            <span>{d.kitchenAddress as string}</span>
                          </div>
                          {orderJourneyKm(d) !== null && (
                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Navigation className="h-3 w-3" /> {orderJourneyKm(d)!.toFixed(1)} km journey
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex gap-4 md:border-l border-slate-100 md:pl-6">
                        <Avatar className="h-12 w-12 border border-slate-200">
                          <AvatarFallback className="bg-slate-100 text-slate-400">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <User className="h-3 w-3" /> Customer
                          </div>
                          <div className="font-bold text-slate-900 text-sm mb-1">{d.customerName as string}</div>
                          <div className="text-xs text-slate-500 font-bold">{d.customerPhone as string}</div>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="md:text-right">
                        <div className="font-extrabold text-2xl text-slate-900 mb-1">₹{(d.amount as number).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md inline-block">
                          {d.paymentStatus === "SUCCESS" ? "Online Payment" : "Payment Pending"}
                        </div>
                      </div>

                    </div>

                    {/* Order Footer & Actions */}
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      {/* Timeline */}
                      <OrderTimeline status={d.orderStatus as string} />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                        {d.orderStatus === "READYFORPICKUP" && (
                          <Button 
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs h-9 rounded-xl border-none shadow-none px-4"
                            onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "PICKEDUP" })}}
                            disabled={statusMutation.isPending}
                          >
                            <Truck className="h-3.5 w-3.5 mr-1.5" /> Picked Up
                          </Button>
                        )}
                        {d.orderStatus === "PICKEDUP" && (
                          <>
                            <Button 
                              variant="outline"
                              className="border-green-200 text-green-700 font-bold text-xs h-9 rounded-xl px-4 hover:bg-green-50"
                              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "INTRANSIT" })}}
                              disabled={statusMutation.isPending}
                            >
                              <Truck className="h-3.5 w-3.5 mr-1.5" /> In Transit
                            </Button>
                            <Button 
                              variant="outline"
                              className="border-red-200 text-red-600 font-bold text-xs h-9 rounded-xl px-4 hover:bg-red-50"
                              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "FAILED" })}}
                              disabled={statusMutation.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Failed
                            </Button>
                          </>
                        )}
                        {d.orderStatus === "INTRANSIT" && (
                          <>
                            <Button 
                              className="bg-green-100 hover:bg-green-200 text-green-700 font-bold text-xs h-9 rounded-xl border-none shadow-none px-4"
                              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "DELIVERED" })}}
                              disabled={statusMutation.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Delivered
                            </Button>
                            <Button 
                              variant="outline"
                              className="border-red-200 text-red-600 font-bold text-xs h-9 rounded-xl px-4 hover:bg-red-50"
                              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ orderId: d.id as string, status: "FAILED" })}}
                              disabled={statusMutation.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Failed
                            </Button>
                          </>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}

          {/* Bottom Banner */}
          <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100/50 mt-6 cursor-pointer hover:bg-emerald-100/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <AlertTriangle className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Keep customers happy by following safety guidelines and delivering on time.</span>
            </div>
            <div className="flex items-center text-[13px] font-bold text-emerald-700">
              View Guidelines <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Sticky Details Sidebar */}
        {selectedOrder && (
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 py-4 px-6 flex flex-row items-center gap-3">
                <div className="h-8 w-8 rounded bg-white flex items-center justify-center border border-emerald-100 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-slate-900">Assignment Details</h3>
              </CardHeader>
              <CardContent className="p-0">
                
                {/* Order Details */}
                <div className="p-6 border-b border-slate-200/60 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Order ID</span>
                      <span className="font-bold text-slate-900">#{(selectedOrder.publicCode as string) ?? (selectedOrder.id as string).substring(0,8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Item</span>
                      <span className="font-bold text-slate-900 max-w-[150px] text-right truncate">{selectedOrder.itemName as string}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Quantity</span>
                      <span className="font-bold text-slate-900">{selectedOrder.quantity as number}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Payment Method</span>
                      <span className="font-bold text-slate-900">{selectedOrder.paymentStatus === "SUCCESS" ? "Online Payment" : "Payment Pending"}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-medium">Order Time</span>
                      <span className="font-bold text-slate-900">{selectedOrder.timeSlot || "08:45 AM"}</span>
                    </div>
                  </div>
                </div>

                {/* Kitchen Details */}
                <div className="p-6 border-b border-slate-200/60 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kitchen Details</h4>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-green-100 shadow-sm">
                      <AvatarImage
                        src={(selectedOrder.kitchenImageUrl as string) || KITCHEN_FALLBACK_IMAGE}
                        alt={selectedOrder.kitchenName as string}
                      />
                      <AvatarFallback className="bg-green-50 text-green-700 font-extrabold text-base rounded-2xl">
                        {(selectedOrder.kitchenName as string).charAt(0).toUpperCase() || "K"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-extrabold text-slate-900 text-[15px] mb-1">{selectedOrder.kitchenName as string}</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                        <Phone className="h-3 w-3" /> {selectedOrder.kitchenPhone as string}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                    <span>{selectedOrder.kitchenAddress as string}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <a href={`tel:${selectedOrder.kitchenPhone}`}>
                      <Button variant="outline" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 rounded-xl font-bold h-9 text-xs">
                        <Check className="h-3.5 w-3.5 mr-1.5" /> Call Kitchen
                      </Button>
                    </a>
                    {hasKitchenCoords ? (
                      <a href={`https://maps.google.com/?q=${selectedKitchenLat},${selectedKitchenLng}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 rounded-xl font-bold h-9 text-xs">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-green-600" /> Open in Map
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" disabled className="w-full bg-slate-50 text-slate-400 border-slate-200 rounded-xl font-bold h-9 text-xs">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" /> Open in Map
                      </Button>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Details</h4>
                  </div>
                  <div className="mb-4">
                    <div className="font-extrabold text-slate-900 text-[15px] mb-1">{selectedOrder.customerName as string}</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">
                      <Phone className="h-3 w-3" /> {selectedOrder.customerPhone as string}
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>{selectedOrder.customerAddress as string}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${selectedOrder.customerPhone}`}>
                      <Button variant="outline" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 rounded-xl font-bold h-9 text-xs">
                        <Check className="h-3.5 w-3.5 mr-1.5" /> Call Customer
                      </Button>
                    </a>
                    {hasCustomerCoords ? (
                      <a href={`https://maps.google.com/?q=${selectedCustomerLat},${selectedCustomerLng}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 rounded-xl font-bold h-9 text-xs">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-green-600" /> Open in Map
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" disabled className="w-full bg-slate-50 text-slate-400 border-slate-200 rounded-xl font-bold h-9 text-xs">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" /> Open in Map
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Order Tracking */}
            {hasKitchenCoords && (
              <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="py-4 px-6 flex flex-row items-center gap-3 border-b border-slate-100">
                  <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Navigation className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-extrabold text-slate-900">Live Order Tracking</h3>
                </CardHeader>
                <CardContent className="p-4">
                  <LiveOrderTrackingMap
                    orderId={selectedOrder.id as string}
                    kitchenLat={selectedKitchenLat}
                    kitchenLng={selectedKitchenLng}
                    customerLat={hasCustomerCoords ? selectedCustomerLat : undefined}
                    customerLng={hasCustomerCoords ? selectedCustomerLng : undefined}
                    deliveryPersonId={data.profile.id}
                    broadcastLocation
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Warning Banner */}
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-start gap-3 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-orange-200 flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-[13px] font-bold text-orange-800 leading-snug">
                Please handle orders carefully and maintain good customer service.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
