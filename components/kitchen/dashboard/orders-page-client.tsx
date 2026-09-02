"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Filter, CalendarDays, ClipboardList, Clock3, Leaf, Drumstick, ImageIcon, Sun, Headset, ChevronRight, ChevronDown } from "lucide-react"
import { updateOrderStatus } from "@/actions/orders/orders"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type OrderRow = {
  id: string
  publicCode: string | null
  itemName: string
  timeSlot?: string | null
  quantity: number
  amount?: number | null
  status?: string | null
  serviceDateType?: string | null
  serviceDate?: string | null
  paymentStatus?: string | null
  time?: string | null
  date?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  deliveryPartner?: { name?: string | null; phone?: string | null } | null
}

type MenuItemRow = {
  id: string
  name: string
  price: number
  foodType?: string | null
  menuName?: string | null
  image?: string | null
}

function getTimeSlotName(slot?: string | null) {
  const s = (slot || "").toLowerCase()
  if (s.includes("morning") || s.includes("breakfast")) return "Breakfast"
  if (s.includes("lunch")) return "Lunch"
  if (s.includes("dinner")) return "Dinner"
  if (s.includes("evening") || s.includes("snacks")) return "Snacks"
  return s || "—"
}

const quickFilters = ["All Status", "Confirmed", "Preparing", "Ready for Pickup", "Completed", "Cancelled"]

export default function OrdersPageClient() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<string>("All Status")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "today" | "tomorrow">("all")
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: (res, { status }) => {
      if (res.success) {
        const messages: Record<string, string> = {
          PREPARING: "Order accepted and is now preparing",
          CANCELLED: "Order rejected",
          READYFORPICKUP: "Order is ready for pickup",
          DELIVERED: "Order marked as completed",
        }
        toast.success(messages[status] ?? "Order updated")
        invalidate()
      } else {
        toast.error(res.error ?? "Failed to update order")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const data = useKitchenDashboardData()

  const allOrders = useMemo<OrderRow[]>(() => data?.orders ?? [], [data])
  const menuItems = useMemo<MenuItemRow[]>(() => data?.menuItems ?? [], [data])

  const tabOrders = useMemo(() => {
    if (activeTab === "all") return allOrders
    if (activeTab === "today") return allOrders.filter(o => o.serviceDateType === "TODAY")
    if (activeTab === "tomorrow") return allOrders.filter(o => o.serviceDateType === "TOMORROW")
    return allOrders
  }, [allOrders, activeTab])

  const filteredOrders = useMemo(() => {
    return tabOrders.filter((o) => {
      let matchesFilter = true
      const orderStatus = (o.status || "").toLowerCase()
      if (filter !== "All Status") {
        if (filter === "Confirmed" && !orderStatus.includes("confirm")) matchesFilter = false
        else if (filter === "Preparing" && !orderStatus.includes("prepar")) matchesFilter = false
        else if (filter === "Ready for Pickup" && !orderStatus.includes("ready")) matchesFilter = false
        else if (filter === "Completed" && !(orderStatus.includes("complet") || orderStatus.includes("deliver"))) matchesFilter = false
        else if (filter === "Cancelled" && !orderStatus.includes("cancel")) matchesFilter = false
      }
      let matchesSearch = true
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        matchesSearch = o.id.toLowerCase().includes(q) ||
          (o.customerName || "").toLowerCase().includes(q) ||
          (o.customerPhone || "").includes(q) ||
          (o.itemName || "").toLowerCase().includes(q)
      }
      let matchesDate = true
      if (pickedDate) {
        const label = pickedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        if (o.serviceDate !== label) matchesDate = false
      }
      return matchesFilter && matchesSearch && matchesDate
    })
  }, [tabOrders, filter, searchQuery, pickedDate])

  const allCounts = useMemo(() => {
    return {
      all: allOrders.length,
      today: allOrders.filter(o => o.serviceDateType === "TODAY").length,
      tomorrow: allOrders.filter(o => o.serviceDateType === "TOMORROW").length,
    }
  }, [allOrders])

  const counts = useMemo(() => {
    return {
      total: allCounts.all,
      today: allCounts.today,
      tomorrow: allCounts.tomorrow,
      preparing: allOrders.filter((o) => (o.status || "").toLowerCase().includes("prepar") || (o.status || "").toLowerCase().includes("confirm")).length,
      ready: allOrders.filter((o) => (o.status || "").toLowerCase().includes("ready")).length,
      completed: allOrders.filter((o) => (o.status || "").toLowerCase().includes("complet") || (o.status || "").toLowerCase().includes("deliver")).length,
      cancelled: allOrders.filter((o) => (o.status || "").toLowerCase().includes("cancel")).length,
    }
  }, [allOrders, allCounts])

  if (!data) {
    return (
      <div className="space-y-6 pb-20 p-6 bg-[#FEFEFE] min-h-screen">
        <Skeleton className="h-20 w-full rounded-[10px]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-[600px] rounded-[10px]" />
          <Skeleton className="h-[600px] rounded-[10px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 animate-in fade-in duration-500 bg-[#FEFEFE] min-h-screen pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[24px] font-[700] text-[#111827] tracking-tight flex items-center gap-2">
              Orders <ClipboardList className="h-5 w-5 text-[#4B5563]" />
            </h1>
            <p className="text-[13px] text-[#4B5563] font-[400] mt-1">Manage and track all your customer orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-[#FFFFFF] border-[#E3E7EB] text-[#18212B] hover:bg-gray-50 rounded-[8px] h-[36px] px-3 shadow-[0_1px_2px_rgba(16,24,40,0.02)] font-medium">
                <CalendarDays className="h-[16px] w-[16px] text-[#4B5563]" />
                <span className="text-[13px]">
                  {pickedDate
                    ? pickedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "All Dates"}
                </span>
                <ChevronDown className="h-[16px] w-[16px] text-[#4B5563]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0 rounded-[8px] border-[#E3E7EB]">
              <Calendar
                mode="single"
                selected={pickedDate ?? undefined}
                onSelect={(d) => {
                  setPickedDate(d ?? null)
                  setDatePickerOpen(false)
                }}
              />
              <div className="border-t border-[#E7E9EC] p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[#00601E] font-semibold"
                  onClick={() => {
                    setPickedDate(null)
                    setDatePickerOpen(false)
                  }}
                >
                  All Dates
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`h-[44px] px-4 rounded-[8px] shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all flex items-center gap-2 font-[600] text-[13px] ${
              activeTab === "all" 
                ? "bg-[#00601E] text-[#FFFFFF] shadow-[0_2px_5px_rgba(0,96,30,0.12)] border border-[#00601E]" 
                : "bg-[#FFFFFF] border border-[#E7E9EC] text-[#18212B]"
            }`}
          >
            <CalendarDays className={`h-[16px] w-[16px] ${activeTab === "all" ? "text-[#FFFFFF]" : "text-[#4B5563]"}`} /> All Orders
            <Badge className={`px-1.5 py-0.5 rounded-[8px] ml-1 text-[11px] hover:bg-transparent ${activeTab === "all" ? "bg-[#FFFFFF] text-[#18212B]" : "bg-[#F3F4F6] text-[#18212B]"}`}>
              {allCounts.all}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("today")}
            className={`h-[44px] px-4 rounded-[8px] shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all flex items-center gap-2 font-[600] text-[13px] ${
              activeTab === "today" 
                ? "bg-[#00601E] text-[#FFFFFF] shadow-[0_2px_5px_rgba(0,96,30,0.12)] border border-[#00601E]" 
                : "bg-[#FFFFFF] border border-[#E7E9EC] text-[#18212B]"
            }`}
          >
            <Sun className={`h-[16px] w-[16px] ${activeTab === "today" ? "text-[#FFFFFF]" : "text-[#FF9D00]"}`} /> Today&apos;s Orders
            <Badge className={`px-1.5 py-0.5 rounded-[8px] ml-1 text-[11px] hover:bg-transparent ${activeTab === "today" ? "bg-[#FFFFFF] text-[#18212B]" : "bg-[#F3F4F6] text-[#18212B]"}`}>
              {allCounts.today}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("tomorrow")}
            className={`h-[44px] px-4 rounded-[8px] shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all flex items-center gap-2 font-[600] text-[13px] ${
              activeTab === "tomorrow" 
                ? "bg-[#00601E] text-[#FFFFFF] shadow-[0_2px_5px_rgba(0,96,30,0.12)] border border-[#00601E]" 
                : "bg-[#FFFFFF] border border-[#E7E9EC] text-[#18212B]"
            }`}
          >
            <CalendarDays className={`h-[16px] w-[16px] ${activeTab === "tomorrow" ? "text-[#FFFFFF]" : "text-[#00852A]"}`} /> Pre-Orders (Tomorrow)
            <Badge className={`px-1.5 py-0.5 rounded-[8px] ml-1 text-[11px] hover:bg-transparent ${activeTab === "tomorrow" ? "bg-[#FFFFFF] text-[#18212B]" : "bg-[#F3F4F6] text-[#18212B]"}`}>
              {allCounts.tomorrow}
            </Badge>
          </button>
        </div>
        
        <div className="flex w-full lg:w-auto items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[#8A939D]" />
            <Input 
              placeholder="Search by Order ID, Customer, Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-[40px] w-full rounded-[8px] border-[#E2E6EA] bg-[#FFFFFF] text-[13px] font-medium placeholder:text-[#8A939D] focus-visible:ring-1 focus-visible:ring-[#00601E] focus-visible:border-[#00601E]" 
            />
          </div>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`h-[40px] px-3 sm:px-4 w-auto rounded-[8px] border-[#E2E6EA] shrink-0 font-medium text-[13px] shadow-none ${filter !== "All Status" ? "bg-[#EAF5ED] text-[#16702E] border-[#65A878] hover:bg-[#EAF5ED]" : "bg-[#FFFFFF] text-[#374151] hover:bg-gray-50"}`}>
                <Filter className={`h-[16px] w-[16px] mr-1.5 sm:mr-2 shrink-0 ${filter !== "All Status" ? "text-[#16702E]" : "text-[#374151]"}`} /> 
                <span className="truncate max-w-[70px] sm:max-w-[120px]">{filter !== "All Status" ? filter : "Filter"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-2 rounded-[8px] border-[#E3E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
              <div className="space-y-1">
                {quickFilters.map((f) => (
                  <Button
                    key={f}
                    variant="ghost"
                    className={`w-full justify-start text-[13px] h-[36px] font-medium px-3 rounded-[6px] ${filter === f ? "bg-[#F0F7F1] text-[#287844]" : "text-[#4B5563] hover:bg-gray-50 hover:text-[#18212B]"}`}
                    onClick={() => {
                      setFilter(f)
                      setFilterOpen(false)
                    }}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] px-6">
        {/* Left Column: Order Cards */}
        <div className="min-w-0">
          <ScrollArea className="h-[800px] lg:h-[calc(100vh-220px)] rounded-[10px]">
            <div className="space-y-4 pr-3 lg:min-w-[850px]">
              {filteredOrders.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-[#E7E9EC]">
                  <ClipboardList className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="text-[14px] font-medium text-gray-500">No orders match your filter.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const menuItem = menuItems.find((mi) => mi.name === order.itemName)
                  const isVeg = menuItem?.foodType === "VEG"
                  
                  const isConfirmed = (order.status || "").toLowerCase() === "confirmed"
                  const isPreparing = (order.status || "").toLowerCase() === "preparing"
                  const isReady = (order.status || "").toLowerCase().includes("ready")
                  const isCompleted = (order.status || "").toLowerCase().includes("complet") || (order.status || "").toLowerCase().includes("deliver")
                  const isCancelled = (order.status || "").toLowerCase().includes("cancel")

                  let statusBadgeClass = "bg-gray-100 text-gray-600"
                  if (isConfirmed) statusBadgeClass = "bg-[#FFF3E4] text-[#F57C00]"
                  else if (isPreparing) statusBadgeClass = "bg-[#EAF3FF] text-[#1677FF]"
                  else if (isReady) statusBadgeClass = "bg-[#EDF7EF] text-[#287844]"
                  else if (isCompleted) statusBadgeClass = "bg-[#EAF5ED] text-[#287844]"
                  else if (isCancelled) statusBadgeClass = "bg-[#FFF0F0] text-[#FF2929]"

                  const displayStatus = isReady ? "Ready for Pickup" : order.status

                  const isTomorrow = order.serviceDateType === "TOMORROW"
                  const isToday = order.serviceDateType === "TODAY"

                  const isPaid = (order.paymentStatus || "").toLowerCase() === "paid"

                  return (
                    <div key={order.id} className="bg-[#FFFFFF] border border-[#E7E9EC] rounded-[9px] shadow-[0_1px_2px_rgba(16,24,40,0.025),0_2px_6px_rgba(16,24,40,0.015)] overflow-hidden transition-all hover:shadow-[0_2px_6px_rgba(16,24,40,0.04)]">
                      <div className="flex flex-col lg:flex-row p-4 gap-4 lg:gap-0">
                        
                        {/* Column 1: Meta Info */}
                        <div className="flex-none lg:w-[130px] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#EEF0F2] pb-3 lg:pb-0 lg:pr-3">
                          <div className="text-[14px] font-[600] text-[#18212B] leading-tight">
                            {order.publicCode ?? `#${order.id.slice(0, 8).toUpperCase()}`}
                          </div>
                          <div className="text-[12px] text-[#5F6975] flex items-center gap-1.5 mt-2">
                            <CalendarDays className="h-[13px] w-[13px] text-[#68727D]" /> {order.date || "—"}
                          </div>
                          <div className="text-[12px] text-[#5F6975] flex items-center gap-1.5 mt-1">
                            <Clock3 className="h-[13px] w-[13px] text-[#68727D]" /> {order.time || "—"}
                          </div>
                          <div className="mt-2.5">
                            {isTomorrow && (
                              <Badge className="bg-[#F3EBFF] hover:bg-[#F3EBFF] text-[#8756D6] border-none px-2 py-0.5 text-[10px] font-medium rounded-[999px]">
                                Pre-Order
                              </Badge>
                            )}
                            {isToday && (
                              <Badge className="bg-[#EAF7EF] hover:bg-[#EAF7EF] text-[#3C9A63] border-none px-2 py-0.5 text-[10px] font-medium rounded-[999px]">
                                Today
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Column 2: Item Details */}
                        <div className="flex-1 flex gap-3 items-center border-b lg:border-b-0 lg:border-r border-[#EEF0F2] pb-3 lg:pb-0 lg:px-4">
                          <div className="h-[84px] w-[84px] rounded-[8px] overflow-hidden bg-gray-50 shrink-0 relative">
                            {menuItem?.image ? (
                              <Image src={menuItem.image} alt={order.itemName} fill sizes="84px" className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[14px] font-[600] text-[#111827] leading-tight">{order.itemName}</h3>
                              <Badge variant="outline" className={`h-5 px-1.5 rounded-[999px] text-[9px] font-bold border-none shrink-0 ${isVeg ? 'bg-[#EAF5ED] text-[#287844]' : 'bg-[#FFF0E8] text-[#F05A1A]'}`}>
                                {isVeg ? <Leaf className="h-2.5 w-2.5 mr-1 text-[#287844]" /> : <Drumstick className="h-2.5 w-2.5 mr-1 text-[#F05A1A]" />}
                                {isVeg ? "Veg" : "Non-Veg"}
                              </Badge>
                            </div>
                            <p className="text-[12px] text-[#4B5563] mt-1 truncate">{menuItem?.menuName || "Menu"}</p>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#4B5563] mt-1.5">
                              <span>Qty: {order.quantity}</span>
                              <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                              <span>{getTimeSlotName(order.timeSlot)}</span>
                              <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                              <span>{isTomorrow ? "Pre-Order (Tomorrow)" : "Today"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Price */}
                        <div className="flex-none lg:w-[100px] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#EEF0F2] pb-3 lg:pb-0 lg:px-4">
                          <div className="text-[16px] font-[600] text-[#006B22]">₹{(order.amount ?? order.quantity * (menuItem?.price ?? 0)).toLocaleString()}</div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className={`h-[6px] w-[6px] rounded-full ${isPaid ? "bg-[#006B22]" : "bg-amber-500"}`} />
                            <span className="text-[11px] text-[#4B5563] whitespace-nowrap">{order.paymentStatus || "—"}</span>
                          </div>
                        </div>

                        {/* Column 4: Customer */}
                        <div className="flex-none lg:w-[180px] flex gap-3 items-center border-b lg:border-b-0 lg:border-r border-[#EEF0F2] pb-3 lg:pb-0 lg:px-4">
                          <Avatar className="h-[32px] w-[32px] bg-[#E8F2EA] text-[#176B2F] shrink-0">
                            <AvatarFallback className="font-[600] text-xs bg-[#E8F2EA]">
                              {order.customerName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-[600] text-[#18212B] truncate">{order.customerName}</h4>
                            <div className="text-[12px] text-[#4B5563] mt-0.5 truncate">
                              {order.customerPhone}
                            </div>
                            <div className="text-[11px] text-[#5F6975] flex items-start gap-1 mt-1">
                              <MapPin className="h-[12px] w-[12px] shrink-0 text-[#68727D] mt-[2px]" /> 
                              <span className="truncate whitespace-normal line-clamp-2">{order.customerAddress}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 5: Status & Actions */}
                        <div className="flex-none lg:w-[140px] flex flex-col justify-center gap-2 pt-2 lg:pt-0 lg:pl-4 items-center">
                          <Badge className={`border-none px-4 py-1 text-[11px] font-[600] rounded-[999px] whitespace-nowrap ${statusBadgeClass}`}>
                            {displayStatus}
                          </Badge>

                          <div className="flex flex-row lg:flex-col gap-2 w-full mt-1">
                            {isConfirmed && (
                              <>
                                <Button
                                  variant="outline"
                                  className="h-[28px] rounded-[7px] border-[#65A878] text-[#16702E] bg-[#FFFFFF] hover:bg-gray-50 font-[500] text-[11px] px-3 w-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                  onClick={() => statusMutation.mutate({ id: order.id, status: "PREPARING" })}
                                  disabled={statusMutation.isPending}
                                >
                                  Accept Order
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-[28px] rounded-[7px] border-[#FF6B6B] text-[#FF2929] bg-[#FFFFFF] hover:bg-red-50 font-[500] text-[11px] px-3 w-full shadow-none"
                                  onClick={() => statusMutation.mutate({ id: order.id, status: "CANCELLED" })}
                                  disabled={statusMutation.isPending}
                                >
                                  Reject Order
                                </Button>
                              </>
                            )}
                            {isPreparing && (
                              <Button
                                variant="outline"
                                className="h-[28px] rounded-[7px] border-[#2683FF] text-[#1677FF] bg-[#FFFFFF] hover:bg-blue-50 font-[500] text-[11px] px-3 w-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                onClick={() => statusMutation.mutate({ id: order.id, status: "READYFORPICKUP" })}
                                disabled={statusMutation.isPending}
                              >
                                Ready for Pickup
                              </Button>
                            )}
                            {isReady && (
                              <Button
                                variant="outline"
                                className="h-[28px] rounded-[7px] border-[#65A878] text-[#16702E] bg-[#FFFFFF] hover:bg-green-50 font-[500] text-[11px] px-3 w-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                onClick={() => statusMutation.mutate({ id: order.id, status: "DELIVERED" })}
                                disabled={statusMutation.isPending}
                              >
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <ScrollBar />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-4">
          
          {/* Order Summary */}
          <Card className="rounded-[10px] border border-[#E7E9EC] shadow-[0_1px_3px_rgba(16,24,40,0.025)] bg-[#FFFFFF]">
            <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center gap-2">
              <div className="h-[32px] w-[32px] rounded-full bg-[#EAF5ED] flex items-center justify-center shrink-0">
                <ClipboardList className="h-[16px] w-[16px] text-[#287844]" />
              </div>
              <CardTitle className="text-[15px] font-[600] text-[#111827]">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 space-y-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#167A32]" /> Total Orders
                </div>
                <span className="font-[600] text-[#18212B]">{counts.total}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#287FF0]" /> Today&apos;s Orders
                </div>
                <span className="font-[600] text-[#18212B]">{counts.today}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#8B5BD6]" /> Pre-Orders (Tomorrow)
                </div>
                <span className="font-[600] text-[#18212B]">{counts.tomorrow}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] pt-1.5">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#FF7900]" /> Preparing
                </div>
                <span className="font-[600] text-[#18212B]">{counts.preparing}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#46A978]" /> Ready for Pickup
                </div>
                <span className="font-[600] text-[#18212B]">{counts.ready}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#31A982]" /> Completed
                </div>
                <span className="font-[600] text-[#18212B]">{counts.completed}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <span className="h-[7px] w-[7px] rounded-full bg-[#FF2525]" /> Cancelled
                </div>
                <span className="font-[600] text-[#18212B]">{counts.cancelled}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card className="rounded-[10px] border border-[#E7E9EC] shadow-[0_1px_3px_rgba(16,24,40,0.025)] bg-[#FFFFFF]">
            <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center gap-2">
              <div className="h-[32px] w-[32px] rounded-full bg-[#EAF5ED] flex items-center justify-center shrink-0">
                <Filter className="h-[16px] w-[16px] text-[#287844]" />
              </div>
              <CardTitle className="text-[15px] font-[600] text-[#111827]">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 flex flex-wrap gap-2.5">
              {quickFilters.map((f) => {
                const isActive = filter === f
                let colorClass = "text-[#4B5563] border-[#E2E6EA] hover:bg-gray-50 bg-[#FFFFFF]"
                
                if (f === "All Status") {
                  if (isActive) colorClass = "bg-[#F0F7F1] text-[#287844] border-[#E2EEE4]"
                  else colorClass = "text-[#287844] border-[#E2EEE4] hover:bg-[#F0F7F1] bg-[#FFFFFF]"
                }
                else if (f === "Confirmed") {
                  if (isActive) colorClass = "bg-[#FFF3E4] text-[#F57C00] border-[#FFD6A3]"
                  else colorClass = "text-[#F57C00] border-[#FFE0BD] hover:bg-[#FFF3E4] bg-[#FFFFFF]"
                }
                else if (f === "Preparing") {
                  if (isActive) colorClass = "bg-[#EAF3FF] text-[#1677FF] border-[#B9D8FF]"
                  else colorClass = "text-[#1677FF] border-[#D4E7FF] hover:bg-[#EAF3FF] bg-[#FFFFFF]"
                }
                else if (f === "Ready for Pickup") {
                  if (isActive) colorClass = "bg-[#EDF7EF] text-[#169C9C] border-[#CBEDED]"
                  else colorClass = "text-[#169C9C] border-[#CBEDED] hover:bg-[#F4FAFA] bg-[#FFFFFF]"
                }
                else if (f === "Completed") {
                  if (isActive) colorClass = "bg-[#EAF5ED] text-[#287844] border-[#A8D2B2]"
                  else colorClass = "text-[#287844] border-[#D7E9DB] hover:bg-[#EAF5ED] bg-[#FFFFFF]"
                }
                else if (f === "Cancelled") {
                  if (isActive) colorClass = "bg-[#FFF0F0] text-[#FF2929] border-[#FFB5B5]"
                  else colorClass = "text-[#FF2929] border-[#FFD1D1] hover:bg-[#FFF0F0] bg-[#FFFFFF]"
                }
                
                return (
                  <Button 
                    key={f}
                    variant="outline" 
                    className={`h-[32px] rounded-[8px] px-3.5 text-[12px] font-[500] transition-all border ${colorClass}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Keep it Up! */}
          <Card className="rounded-[10px] border border-[#EDF2EE] shadow-sm bg-gradient-to-br from-[#F7FBF7] to-[#EFF7F0]">
            <CardContent className="px-5 py-5 text-left">
              <h4 className="text-[15px] font-[600] text-[#18212B] flex items-center gap-1.5">
                Keep it Up! <span className="text-[16px]">🎉</span>
              </h4>
              <p className="text-[12px] text-[#4B5563] mt-1.5 leading-relaxed pr-4">
                You have completed {counts.completed} orders today.<br/>Great service!
              </p>
              <div className="flex justify-center mt-3">
                <div className="h-[100px] w-[140px] relative">
                  <Image src="/kitchen/shield.webp" alt="Keep it Up Shield" fill sizes="140px" className="object-contain" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Need Help? */}
          <div className="bg-[#FFFFFF] rounded-[10px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.025)] border border-[#E7E9EC] flex flex-col sm:flex-row lg:flex-col sm:items-start gap-4">
            <div className="h-[40px] w-[40px] rounded-full bg-[#EAF5ED] flex items-center justify-center shrink-0">
              <Headset className="h-[20px] w-[20px] text-[#16702E]" />
            </div>
            <div>
              <h4 className="text-[14px] font-[600] text-[#18212B]">Need Help?</h4>
              <p className="text-[12px] text-[#4B5563] mt-1 mb-4">Facing issues with orders?</p>
              <Button asChild variant="outline" className="h-[36px] w-full sm:w-auto lg:w-full text-[13px] font-[500] border-[#65A878] text-[#16702E] bg-[#FFFFFF] hover:bg-[#EAF5ED] rounded-[7px] shadow-none">
                <Link href="/kitchen/dashboard/support">Contact Support <ChevronRight className="h-[14px] w-[14px] ml-1 text-[#16702E]" /></Link>
              </Button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
