"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MapPin, Phone, Search, Filter, Calendar, ClipboardList, Clock, Leaf, Drumstick, ImageIcon, Star, ShieldCheck, Headset, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { updateOrderStatus } from "@/actions/orders/orders"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"

type OrderRow = {
  id: string
  itemName: string
  timeSlot?: string | null
  quantity: number
  amount?: number | null
  status?: string | null
  serviceDateType?: string | null
  paymentStatus?: string | null
  time?: string | null
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
  const [showFilters, setShowFilters] = useState(false)

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

  const [sorting, setSorting] = useState<SortingState>([])

  const baseOrders = useMemo(
    () => allOrders.filter((o) => o.serviceDateType === "TOMORROW"),
    [allOrders]
  )

  const filteredOrders = useMemo(() => {
    return baseOrders.filter((o) => {
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
      return matchesFilter && matchesSearch
    })
  }, [baseOrders, filter, searchQuery])

  const counts = useMemo(() => {
    return {
      total: baseOrders.length,
      preparing: baseOrders.filter((o) => (o.status || "").toLowerCase().includes("prepar") || (o.status || "").toLowerCase().includes("confirm")).length,
      ready: baseOrders.filter((o) => (o.status || "").toLowerCase().includes("ready")).length,
      completed: baseOrders.filter((o) => (o.status || "").toLowerCase().includes("complet") || (o.status || "").toLowerCase().includes("deliver")).length,
      cancelled: baseOrders.filter((o) => (o.status || "").toLowerCase().includes("cancel")).length,
    }
  }, [baseOrders])

  const columns = useMemo<ColumnDef<OrderRow>[]>(() => [
    {
      id: "order",
      accessorFn: (row) => row.id,
      header: () => <span className="inline-flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Order</span>,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="min-w-[130px]">
            <div className="text-[14px] font-bold text-gray-900 leading-tight">#{order.id.slice(0, 8)}</div>
            <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" /> Tomorrow
            </div>
            <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" /> {order.time}
            </div>
            <Badge className="mt-1.5 bg-purple-100 hover:bg-purple-100 text-purple-700 border-none px-2 py-0.5 text-[10px] font-bold rounded-md">
              Pre-Order
            </Badge>
          </div>
        )
      },
    },
    {
      id: "item",
      accessorFn: (row) => row.itemName,
      header: () => <span>Item</span>,
      cell: ({ row }) => {
        const order = row.original
        const menuItem = menuItems.find((mi) => mi.name === order.itemName)
        const isVeg = menuItem?.foodType === "VEG"
        return (
          <div className="flex gap-3 items-center min-w-[220px]">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50 relative">
              {menuItem?.image ? (
                <Image src={menuItem.image} alt={order.itemName} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">{order.itemName}</h3>
                <Badge variant="outline" className={`h-5 px-1.5 rounded text-[9px] font-bold border-gray-200 shrink-0 ${isVeg ? 'text-green-700' : 'text-[#FF6B00]'}`}>
                  {isVeg ? <Leaf className="h-2.5 w-2.5 mr-1 text-green-600" /> : <Drumstick className="h-2.5 w-2.5 mr-1 text-[#FF6B00]" />}
                  {isVeg ? "Veg" : "Non-Veg"}
                </Badge>
              </div>
              {menuItem?.menuName && (
                <p className="text-[11px] text-gray-500 font-medium truncate">{menuItem.menuName}</p>
              )}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 mt-0.5">
                <span>Qty: {order.quantity}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{getTimeSlotName(order.timeSlot)}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "customer",
      accessorFn: (row) => row.customerName,
      header: () => <span>Customer</span>,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex gap-3 items-center min-w-[180px]">
            <Avatar className="h-9 w-9 bg-green-50 text-green-600 shrink-0">
              <AvatarFallback className="font-bold text-sm bg-green-50">
                {order.customerName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-gray-900 truncate">{order.customerName}</h4>
              {order.customerPhone && (
                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 shrink-0" /> <span className="truncate">{order.customerPhone}</span>
                </div>
              )}
              {order.customerAddress && (
                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{order.customerAddress}</span>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "amount",
      accessorFn: (row) => row.amount,
      header: () => <span>Amount</span>,
      cell: ({ row }) => {
        const order = row.original
        const isPaid = (order.paymentStatus || "").toLowerCase() === "paid"
        return (
          <div className="min-w-[90px]">
            <div className="text-[16px] font-bold text-gray-900">₹{order.amount}</div>
            {order.paymentStatus && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-2 w-2 rounded-full ${isPaid ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-[10px] font-bold text-gray-500">{order.paymentStatus}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: () => <span>Status</span>,
      cell: ({ row }) => {
        const order = row.original
        const isConfirmed = (order.status || "").toLowerCase() === "confirmed"
        const isPreparing = (order.status || "").toLowerCase() === "preparing"
        const isReady = (order.status || "").toLowerCase().includes("ready")

        let statusBadgeClass = "bg-gray-100 text-gray-600"
        if (isConfirmed) statusBadgeClass = "bg-orange-50 text-orange-600"
        else if (isPreparing) statusBadgeClass = "bg-blue-50 text-blue-600"
        else if (isReady) statusBadgeClass = "bg-emerald-50 text-emerald-600"
        else if ((order.status || "").toLowerCase().includes("complet") || (order.status || "").toLowerCase().includes("deliver")) statusBadgeClass = "bg-green-50 text-green-700"
        else if ((order.status || "").toLowerCase().includes("cancel")) statusBadgeClass = "bg-red-50 text-red-600"

        return (
          <Badge className={`border-none px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap ${statusBadgeClass}`}>
            {order.status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="w-full text-right">Actions</span>,
      cell: ({ row }) => {
        const order = row.original
        const isConfirmed = (order.status || "").toLowerCase() === "confirmed"
        const isPreparing = (order.status || "").toLowerCase() === "preparing"
        const isReady = (order.status || "").toLowerCase().includes("ready")
        return (
          <div className="flex xl:flex-col gap-2 w-full min-w-[150px] justify-end">
            {isConfirmed && (
              <>
                <Button
                  variant="outline"
                  className="h-8 rounded-lg border-green-200 text-green-700 bg-green-50 hover:bg-green-100 font-bold text-[11px] px-3 w-full"
                  onClick={() => statusMutation.mutate({ id: order.id, status: "PREPARING" })}
                  disabled={statusMutation.isPending}
                >
                  Accept Order
                </Button>
                <Button
                  variant="outline"
                  className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] px-3 w-full"
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
                className="h-8 rounded-lg border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold text-[11px] px-3 w-full"
                onClick={() => statusMutation.mutate({ id: order.id, status: "READYFORPICKUP" })}
                disabled={statusMutation.isPending}
              >
                Ready for Pickup
              </Button>
            )}
            {isReady && (
              <Button
                variant="outline"
                className="h-8 rounded-lg border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px] px-3 w-full"
                onClick={() => statusMutation.mutate({ id: order.id, status: "DELIVERED" })}
                disabled={statusMutation.isPending}
              >
                Mark as Completed
              </Button>
            )}
          </div>
        )
      },
    },
  ], [menuItems, statusMutation])

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
  })

  if (!data) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-32 rounded" />
              <Skeleton className="h-5 w-56 rounded mt-1" />
            </div>
          </div>
          <Skeleton className="h-11 w-56 rounded-xl" />
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <Skeleton className="h-11 w-48 rounded-xl" />
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <Skeleton className="h-11 w-full xl:w-80 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl shrink-0" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                <div className="flex flex-col xl:flex-row">
                  <div className="w-full xl:w-[140px] p-4 xl:p-5 border-b xl:border-b-0 xl:border-r border-gray-100 bg-gray-50/50 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <div className="flex-1 p-4 xl:p-5 flex flex-col md:flex-row gap-5">
                    <div className="flex gap-4 flex-1">
                      <Skeleton className="h-16 w-16 rounded-xl" />
                      <div className="flex flex-col justify-center space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                    <div className="flex gap-5 md:w-[320px] shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="flex flex-col justify-center border-r border-gray-100 pr-5 space-y-2">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex gap-3 items-center flex-1">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full xl:w-[160px] p-4 xl:p-5 border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/30 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <div className="flex xl:flex-col gap-2 w-full sm:w-auto xl:w-full">
                      <Skeleton className="h-8 w-full rounded-lg" />
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="px-6 py-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-6" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="px-6 py-5 flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 py-6 text-center space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 mx-auto" />
                  <Skeleton className="h-3.5 w-56 mx-auto" />
                </div>
                <div className="flex justify-center py-2">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 flex items-start gap-4 border border-gray-100 bg-white shadow-sm">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-36 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-green-600 hidden sm:block" />
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Orders <ClipboardList className="h-6 w-6 text-green-600 sm:hidden" />
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-0.5">Manage and track all your pre-orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11 px-4 shadow-sm font-medium">
            <Calendar className="h-4 w-4 text-gray-500" />
            Tomorrow, {new Date(new Date().getTime() + 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Button>
        </div>
      </div>

      {/* Sub Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* We strictly only show Pre-Orders Tomorrow as per user constraint */}
          <Button className="bg-[#166534] hover:bg-[#14532D] text-white font-bold h-11 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-200" /> All Pre-Orders
            <Badge className="bg-white text-[#166534] hover:bg-white rounded-full px-2 py-0.5 ml-1 text-xs">{counts.total}</Badge>
          </Button>
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by Order ID, Customer, Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl border-gray-200 bg-white shadow-sm text-[13px] font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-green-500" 
            />
          </div>
          <Button variant="outline" className="h-11 px-4 rounded-xl border-gray-200 bg-white shadow-sm font-bold text-gray-700 hover:bg-gray-50 shrink-0" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4 mr-2 text-gray-500" /> Filter
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-bold text-gray-500 mr-1">Quick Filters:</span>
          {quickFilters.map((f) => {
            const isActive = filter === f
            let colorClass = "text-gray-600 border-gray-200 hover:bg-gray-50"
            if (isActive) {
              if (f === "Confirmed") colorClass = "bg-orange-50 text-orange-700 border-orange-200"
              else if (f === "Preparing") colorClass = "bg-blue-50 text-blue-700 border-blue-200"
              else if (f === "Ready for Pickup") colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200"
              else if (f === "Completed") colorClass = "bg-green-50 text-green-700 border-green-200"
              else if (f === "Cancelled") colorClass = "bg-red-50 text-red-700 border-red-200"
              else colorClass = "bg-gray-900 text-white border-gray-900"
            } else {
              if (f === "Confirmed") colorClass = "text-orange-600 border-orange-100 hover:bg-orange-50"
              else if (f === "Preparing") colorClass = "text-blue-600 border-blue-100 hover:bg-blue-50"
              else if (f === "Ready for Pickup") colorClass = "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
              else if (f === "Completed") colorClass = "text-green-600 border-green-100 hover:bg-green-50"
              else if (f === "Cancelled") colorClass = "text-red-500 border-red-100 hover:bg-red-50"
            }
            return (
              <Button
                key={f}
                variant="outline"
                className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all border ${colorClass}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        {/* Left Column: Orders Table */}
        <div className="min-w-0">
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              <CardTitle className="text-[16px] font-bold text-gray-900">Pre-Orders (Tomorrow)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                  <ClipboardList className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-[14px] font-medium text-gray-500">No orders found.</p>
                </div>
              ) : (
                <Table className="w-full min-w-[1000px]">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="font-bold text-[12px] text-gray-600 h-12 first:px-6 last:px-6"
                          >
                            {header.isPlaceholder ? null : (
                              <button
                                type="button"
                                className={`inline-flex items-center gap-1 hover:text-gray-900 ${
                                  header.column.getCanSort() ? "cursor-pointer select-none" : "cursor-default"
                                } ${header.column.id === "actions" ? "w-full justify-end" : ""}`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                  header.column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-3 w-3" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                                  )
                                )}
                              </button>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cell.column.id === "actions" ? "text-right px-6 py-4 align-middle" : "px-6 py-4 align-middle"}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              <CardTitle className="text-[16px] font-bold text-gray-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-3.5">
              <div className="flex items-center justify-between text-[13px] font-bold text-gray-900 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-900" /> Total Pre-Orders
                </div>
                <span>{counts.total}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> Preparing
                </div>
                <span className="font-bold text-gray-900">{counts.preparing}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" /> Ready for Pickup
                </div>
                <span className="font-bold text-gray-900">{counts.ready}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> Completed
                </div>
                <span className="font-bold text-gray-900">{counts.completed}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] font-medium text-gray-600 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Cancelled
                </div>
                <span className="font-bold text-gray-900">{counts.cancelled}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-row items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <CardTitle className="text-[16px] font-bold text-gray-900">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 flex flex-wrap gap-2">
              {quickFilters.map((f) => {
                const isActive = filter === f
                let colorClass = "text-gray-600 border-gray-200 hover:bg-gray-50"
                if (isActive) {
                   if (f === "Confirmed") colorClass = "bg-orange-50 text-orange-700 border-orange-200"
                   else if (f === "Preparing") colorClass = "bg-blue-50 text-blue-700 border-blue-200"
                   else if (f === "Ready for Pickup") colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200"
                   else if (f === "Completed") colorClass = "bg-green-50 text-green-700 border-green-200"
                   else if (f === "Cancelled") colorClass = "bg-red-50 text-red-700 border-red-200"
                   else colorClass = "bg-gray-900 text-white border-gray-900"
                } else {
                   if (f === "Confirmed") colorClass = "text-orange-600 border-orange-100 hover:bg-orange-50"
                   else if (f === "Preparing") colorClass = "text-blue-600 border-blue-100 hover:bg-blue-50"
                   else if (f === "Ready for Pickup") colorClass = "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                   else if (f === "Completed") colorClass = "text-green-600 border-green-100 hover:bg-green-50"
                   else if (f === "Cancelled") colorClass = "text-red-500 border-red-100 hover:bg-red-50"
                }
                
                return (
                  <Button 
                    key={f}
                    variant="outline" 
                    className={`h-8 rounded-lg px-3 text-[11px] font-bold transition-all border ${colorClass}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Keep it Up! */}
          <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-b from-[#F0FDF4] to-[#F8FAFC]">
            <CardContent className="px-6 py-6 text-center space-y-4">
              <div>
                <h4 className="text-[16px] font-bold text-gray-900 flex items-center justify-center gap-1.5">
                  Keep it Up! <span className="text-xl">🎉</span>
                </h4>
                <p className="text-[12px] text-gray-600 font-medium leading-relaxed mt-1">
                  You have completed <span className="font-bold text-green-700">{counts.completed} orders</span> for tomorrow so far. Great service!
                </p>
              </div>
              <div className="flex justify-center py-2">
                <div className="h-20 w-20 relative">
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
                  <div className="relative h-full w-full bg-white rounded-full shadow-sm flex items-center justify-center border-4 border-[#DCFCE7]">
                    <ShieldCheck className="h-10 w-10 text-green-500" fill="#10B981" />
                    <Star className="h-4 w-4 text-white absolute top-6" fill="currentColor" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Need Help? */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 border border-gray-100">
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-green-600 shrink-0">
              <Headset className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-gray-900">Need Help?</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 mb-3">Facing issues with orders?</p>
              <Button variant="outline" className="h-8 text-[11px] font-bold border-green-200 text-green-700 hover:bg-green-50 rounded-lg">
                Contact Support <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
