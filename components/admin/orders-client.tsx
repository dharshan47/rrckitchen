"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Search, Download, RefreshCw, CheckCircle2, ChefHat,
  Wallet, Eye, Pencil, MoreVertical, Bike, User, Phone, Mail, MapPin, Loader2,
  ShoppingBag, ShieldCheck, Clock3, CircleX, History, CreditCard, Navigation, StickyNote
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  type AdminOrder,
  NEXT_STATUS,
  STATUS_LABELS,
  useAdminOrdersQuery,
  useAdminOrders,
  useAdminSelectedOrder,
  useAdminOrdersActions,
  useUpdateOrderStatusMutation,
} from "@/stores/adminOrdersStore"

function formatOrderDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true }
  const time = date.toLocaleTimeString("en-US", timeOptions)

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${time}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`
  } else {
    return `${date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}, ${time}`
  }
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatLakhs(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatTimeSlot(slot?: string | null) {
  switch ((slot ?? "").toUpperCase()) {
    case "MORNING": return "Morning"
    case "LUNCH": return "Lunch"
    case "EVENINGSNACKS": return "Evening"
    case "DINNER": return "Dinner"
    default: return slot ?? "—"
  }
}

const getStatusBadge = (status?: string | null) => {
  switch ((status ?? "").toUpperCase()) {
    case "CONFIRMED": return <Badge className="bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#EFF6FF]">CONFIRMED</Badge>
    case "PREPARING": return <Badge className="bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#FFF7ED]">PREPARING</Badge>
    case "READYFORPICKUP": return <Badge className="bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#DCFCE7]">READY FOR PICKUP</Badge>
    case "COMPLETED": return <Badge className="bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#F3E8FF]">COMPLETED</Badge>
    case "CANCELLED": return <Badge className="bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#FEE2E2]">CANCELLED</Badge>
    case "REFUNDED": return <Badge className="bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-[#F3E8FF]">REFUNDED</Badge>
    default: return <Badge className="bg-gray-100 text-gray-700 border border-gray-200 shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase tracking-wide hover:bg-gray-100">{(status ?? "N/A").toUpperCase()}</Badge>
  }
}

const getPaymentBadge = (payment?: string | null) => {
  switch ((payment ?? "").toUpperCase()) {
    case "SUCCESS":
    case "PAID": return <Badge className="bg-[#DCFCE7] text-[#15803D] border-0 shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase hover:bg-[#DCFCE7]">PAID</Badge>
    case "PENDING": return <Badge className="bg-[#FEF3C7] text-[#B45309] border-0 shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase hover:bg-[#FEF3C7]">PENDING</Badge>
    case "REFUNDED": return <Badge className="bg-[#F3E8FF] text-[#7C3AED] border-0 shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase hover:bg-[#F3E8FF]">REFUNDED</Badge>
    default: return <Badge className="bg-gray-100 text-gray-600 border-0 shadow-none font-extrabold px-2.5 py-0.5 text-[10px] rounded uppercase hover:bg-gray-100">{(payment ?? "N/A").toUpperCase()}</Badge>
  }
}

const columnHelper = createColumnHelper<AdminOrder>()

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-14" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-24 hidden md:block" />
          <Skeleton className="h-3 w-20 hidden lg:block" />
          <Skeleton className="h-3 w-12 hidden lg:block" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function AdminOrdersPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [kitchenFilter, setKitchenFilter] = useState("all")
  const [deliveryFilter, setDeliveryFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)

  const selectedOrder = useAdminSelectedOrder()
  const { setSelectedOrder } = useAdminOrdersActions()

  const { isLoading, isFetching, refetch } = useAdminOrdersQuery()
  const orders = useAdminOrders()

  const updateOrderMutation = useUpdateOrderStatusMutation()

  const updateOrder = useCallback(async (orderId: string, status: string) => {
    const res = await updateOrderMutation.mutateAsync({ orderId, status })
    if (res.success) {
      toast.success(`Order marked as ${STATUS_LABELS[status] ?? status}`)
    } else {
      toast.error(res.error ?? "Failed to update order")
    }
    return res
  }, [updateOrderMutation])

  const stats = useMemo(() => {
    const total = orders.length
    const confirmed = orders.filter((o) => o.status.toUpperCase() === "CONFIRMED").length
    const preparing = orders.filter((o) => o.status.toUpperCase() === "PREPARING").length
    const ready = orders.filter((o) => o.status.toUpperCase() === "READYFORPICKUP").length
    const completed = orders.filter((o) => o.status.toUpperCase() === "COMPLETED").length
    const cancelled = orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status.toUpperCase())).length
    const revenue = orders.reduce((sum, o) => sum + o.amount, 0)
    return { total, confirmed, preparing, ready, completed, cancelled, revenue, pending: total - completed - cancelled }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return orders.filter((o) => {
      if (q) {
        const haystack = [
          o.id.slice(-6),
          o.customer.name ?? "",
          o.customer.phone ?? "",
          o.customer.email ?? "",
          o.kitchen.name ?? "",
          o.deliveryPartner?.name ?? "",
          ...o.items.map((i) => i.name),
        ].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter !== "all" && o.status.toUpperCase() !== statusFilter) return false
      if (paymentFilter !== "all" && (o.payment ?? "").toUpperCase() !== paymentFilter) return false
      if (kitchenFilter !== "all" && (o.kitchen.name ?? "Unknown") !== kitchenFilter) return false
      if (deliveryFilter === "assigned" && !o.deliveryPartner) return false
      if (deliveryFilter === "unassigned" && o.deliveryPartner) return false
      return true
    })
  }, [orders, searchQuery, statusFilter, paymentFilter, kitchenFilter, deliveryFilter])

  const kitchens = useMemo(
    () => Array.from(new Set(orders.map((o) => o.kitchen.name ?? "Unknown").filter(Boolean))),
    [orders],
  )

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
          />
        </div>
      ),
    }),
    columnHelper.accessor("id", {
      header: "ORDER",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <span className="font-extrabold text-[13px] text-[#111827] uppercase">ORD{row.original.id.slice(-6)}</span>
          <span className="text-[11px] font-medium text-[#6B7280]">{formatOrderDate(row.original.date)}</span>
        </div>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "CUSTOMER",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[140px]">
          <span className="font-extrabold text-[13px] text-[#111827]">{row.original.customer.name ?? "Anonymous"}</span>
          <span className="text-[11px] font-medium text-[#6B7280]">{row.original.customer.phone ?? "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("kitchen", {
      header: "KITCHEN",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-[160px]">
          <div className="h-8 w-8 rounded-full bg-[#111827] text-[#F59E0B] flex items-center justify-center text-[12px] font-bold shrink-0">
            {(row.original.kitchen.name ?? "??").substring(0, 2).toUpperCase()}
          </div>
          <span className="font-extrabold text-[13px] text-[#111827]">{row.original.kitchen.name ?? "Unknown Kitchen"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "AMOUNT",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[100px]">
          <span className="font-extrabold text-[13px] text-[#111827]">{formatCurrency(row.original.amount)}</span>
          <span className="text-[11px] font-medium text-[#6B7280]">{row.original.items.length} item(s)</span>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ getValue }) => <div className="min-w-[120px]">{getStatusBadge(getValue())}</div>,
    }),
    columnHelper.accessor("payment", {
      header: "PAYMENT",
      cell: ({ getValue }) => <div className="min-w-[90px]">{getPaymentBadge(getValue())}</div>,
    }),
    columnHelper.accessor("deliveryPartner", {
      header: "DELIVERY",
      cell: ({ row }) => (
        row.original.deliveryPartner ? (
          <div className="flex items-center gap-2.5 min-w-[150px]">
            <Bike className="h-[18px] w-[18px] text-[#15803D] shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-[13px] text-[#111827]">{row.original.deliveryPartner.name ?? "—"}</span>
              <span className="text-[11px] font-medium text-[#6B7280]">{row.original.deliveryPartner.phone ?? "—"}</span>
            </div>
          </div>
        ) : (
          <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2 min-w-[150px]"><span className="h-[1px] w-3 bg-[#D1D5DB]"></span> Not Assigned</span>
        )
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 min-w-[110px]">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-[8px] border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] shadow-none" onClick={() => setSelectedOrder(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-[8px] border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] shadow-none" onClick={() => setSelectedOrder(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-[8px] border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] shadow-none">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedOrder(row.original)}>View Details</DropdownMenuItem>
              {["CONFIRMED", "PREPARING", "READYFORPICKUP"].includes(row.original.status.toUpperCase()) && (
                <DropdownMenuItem onClick={() => updateOrder(row.original.id, NEXT_STATUS[row.original.status.toUpperCase()] ?? row.original.status)}>
                  Move to {STATUS_LABELS[NEXT_STATUS[row.original.status.toUpperCase()]] ?? row.original.status}
                </DropdownMenuItem>
              )}
              {!["CANCELLED", "REFUNDED", "COMPLETED"].includes(row.original.status.toUpperCase()) && (
                <DropdownMenuItem className="text-red-600" onClick={() => updateOrder(row.original.id, "CANCELLED")}>Cancel Order</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ], [updateOrder, setSelectedOrder])

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      rowSelection,
      pagination: { pageIndex: 0, pageSize },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length
  const selectedRows = Object.keys(rowSelection)
    .map((idx) => filteredOrders[Number(idx)])
    .filter(Boolean) as AdminOrder[]

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  const handleBulkStatus = useCallback((status: string) => {
    Promise.all(selectedRows.map((o) => updateOrderMutation.mutateAsync({ orderId: o.id, status })))
      .then(() => {
        toast.success(`${selectedRows.length} order(s) marked as ${STATUS_LABELS[status] ?? status}`)
        setRowSelection({})
      })
      .catch(() => toast.error("Failed to update orders"))
  }, [selectedRows, updateOrderMutation, setRowSelection])

  const exportCSV = () => {
    const header = ["Order ID", "Date", "Customer", "Phone", "Email", "Kitchen", "Items", "Amount", "Status", "Payment", "Delivery Partner"]
    const rows = (Object.keys(rowSelection).length > 0 ? selectedRows : filteredOrders).map((o) => [
      o.id,
      new Date(o.date).toLocaleString("en-IN"),
      o.customer.name ?? "",
      o.customer.phone ?? "",
      o.customer.email ?? "",
      o.kitchen.name ?? "",
      o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
      String(o.amount),
      o.status,
      o.payment ?? "",
      o.deliveryPartner?.name ?? "",
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Orders exported")
  }

  return (
    <div className="space-y-6 pb-12 bg-[#F9FAFB] min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Order Management</h1>
          <p className="text-[13px] font-medium text-[#6B7280] mt-1">Track, manage and update all customer orders in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white rounded-xl shadow-sm font-bold border-[#D1D5DB] h-10 px-4 text-[#374151] hover:bg-gray-50" onClick={exportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 text-[#6B7280]" /> Export
          </Button>
          <Button variant="outline" className="gap-2 bg-white rounded-xl shadow-sm font-bold border-[#D1D5DB] h-10 px-4 text-[#374151] hover:bg-gray-50" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 text-[#6B7280] ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
          {[
            { title: "Total Orders", value: stats.total.toLocaleString("en-IN"), trend: "vs last week", trendPercent: "12.4%", trendUp: true, icon: ShoppingBag, color: "text-[#7C3AED]", bg: "bg-[#F3E8FF]" },
            { title: "Completed", value: stats.completed.toLocaleString("en-IN"), trend: "of total", trendPercent: `${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%`, trendUp: null, icon: ShieldCheck, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
            { title: "Preparing", value: stats.preparing.toLocaleString("en-IN"), trend: "of total", trendPercent: `${stats.total > 0 ? ((stats.preparing / stats.total) * 100).toFixed(1) : 0}%`, trendUp: null, icon: ChefHat, color: "text-[#F97316]", bg: "bg-[#FFF7ED]" },
            { title: "Pending", value: stats.pending.toLocaleString("en-IN"), trend: "of total", trendPercent: `${stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%`, trendUp: null, icon: Clock3, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
            { title: "Cancelled", value: stats.cancelled.toLocaleString("en-IN"), trend: "vs last week", trendPercent: "4.2%", trendUp: false, icon: CircleX, color: "text-[#DC2626]", bg: "bg-[#FEE2E2]" },
            { title: "Total Revenue", value: formatLakhs(stats.revenue), trend: "vs last week", trendPercent: "15.8%", trendUp: true, icon: Wallet, color: "text-[#15803D]", bg: "bg-[#DCFCE7]" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-[42px] w-[42px] rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                      <stat.icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-[#374151]">{stat.title}</p>
                  <h3 className="text-[28px] font-extrabold mt-1 text-[#111827] leading-tight">{stat.value}</h3>
                  <p className="text-[11px] font-bold mt-2 flex items-center gap-1.5">
                    {stat.trendUp !== null ? (
                      <span className={stat.trendUp ? "text-[#16A34A] flex items-center" : "text-[#DC2626] flex items-center"}>
                        {stat.trendUp ? "↑" : "↓"} {stat.trendPercent}
                      </span>
                    ) : (
                      <span className="text-[#374151]">{stat.trendPercent}</span>
                    )}
                    <span className="text-[#6B7280]">{stat.trend}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <div className="mt-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#F3F4F6]">
          <ScrollArea className="w-full lg:w-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-3 w-max pr-4">
              <div className="relative min-w-[260px] shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#9CA3AF]" />
              <Input
                placeholder="Search orders..."
                className="pl-10 h-11 rounded-xl bg-white border-[#D1D5DB] text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#15803D]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-xl text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="READYFORPICKUP">Ready for Pickup</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-xl text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Payment: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Payment: All</SelectItem>
                <SelectItem value="SUCCESS">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-xl text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Kitchen: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kitchen: All</SelectItem>
                {kitchens.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-xl text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Delivery: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Delivery: All</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Not Assigned</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <ScrollArea className="w-full bg-white border-b border-[#F3F4F6]">
          <div className="flex items-center gap-3 p-3 px-6 w-max">
            <div className="flex items-center gap-4 mr-3 shrink-0">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
            />
            <span className="text-[13px] font-extrabold text-[#111827]">{selectedCount} Selected</span>
          </div>

          <Button size="sm" variant="outline" className="h-9 rounded-[10px] font-bold text-[#2563EB] border-[#BFDBFE] bg-[#EFF6FF] hover:bg-blue-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateOrderMutation.isPending || selectedCount === 0} onClick={() => handleBulkStatus("CONFIRMED")}>
            <CheckCircle2 className="h-[14px] w-[14px]" /> Mark as Confirmed
          </Button>
          <Button size="sm" variant="outline" className="h-9 rounded-[10px] font-bold text-[#EA580C] border-[#FED7AA] bg-[#FFF7ED] hover:bg-orange-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateOrderMutation.isPending || selectedCount === 0} onClick={() => handleBulkStatus("PREPARING")}>
            <ChefHat className="h-[14px] w-[14px]" /> Mark as Preparing
          </Button>
          <Button size="sm" variant="outline" className="h-9 rounded-[10px] font-bold text-[#15803D] border-[#BBF7D0] bg-[#DCFCE7] hover:bg-green-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateOrderMutation.isPending || selectedCount === 0} onClick={() => handleBulkStatus("READYFORPICKUP")}>
            <CheckCircle2 className="h-[14px] w-[14px]" /> Mark as Ready
          </Button>
          <Button size="sm" variant="outline" className="h-9 rounded-[10px] font-bold text-[#7C3AED] border-[#DDD6FE] bg-[#F3E8FF] hover:bg-purple-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateOrderMutation.isPending || selectedCount === 0} onClick={() => handleBulkStatus("COMPLETED")}>
            <CheckCircle2 className="h-[14px] w-[14px]" /> Mark as Completed
          </Button>
          <Button size="sm" variant="outline" className="h-9 rounded-[10px] font-bold text-[#DC2626] border-[#FECACA] bg-[#FEE2E2] hover:bg-red-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateOrderMutation.isPending || selectedCount === 0} onClick={() => handleBulkStatus("CANCELLED")}>
            <CircleX className="h-[14px] w-[14px]" /> Cancel Orders
          </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <ScrollArea className="w-full">
          <div className="min-w-[1200px] [&_th]:text-[12px] [&_th]:font-semibold [&_th]:text-[#6B7280] [&_th]:bg-white [&_th]:py-4 [&_th]:px-4 [&_th]:border-b [&_th]:border-[#F3F4F6] [&_th]:uppercase [&_td]:py-4 [&_td]:px-4 [&_td]:border-b [&_td]:border-[#F3F4F6]">
            {isLoading ? <TableSkeleton /> : <DataTable table={table} emptyMessage={searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"} />}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <p className="text-[13px] font-medium text-[#6B7280]">
            Showing {filteredOrders.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredOrders.length)} of {filteredOrders.length.toLocaleString("en-IN")} orders
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 rounded-md p-0 text-[13px] font-extrabold ${i === currentPage ? "bg-white border border-[#2563EB] text-[#2563EB] shadow-sm" : "text-[#6B7280] hover:bg-gray-100"}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-[13px] font-extrabold text-gray-500 px-1">...</span>}
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
            </div>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[90px] h-9 rounded-lg text-[13px] font-bold border-[#E5E7EB]">
                  <SelectValue placeholder="10 / page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Side Panel */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-[650px] overflow-y-auto overflow-x-hidden p-0 flex flex-col bg-[#F9FAFB] border-l-0 shadow-2xl z-[100]">
          {selectedOrder && (
            <OrderSheet key={selectedOrder.id} order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateOrder} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function OrderSheet({
  order,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder
  onClose: () => void
  onStatusChange: (orderId: string, status: string) => Promise<{ success: boolean; error?: string }>
}) {
  const [tab, setTab] = useState("overview")
  const [status, setStatus] = useState(order.status.toUpperCase())
  const [pending, setPending] = useState(false)

  const next = NEXT_STATUS[order.status.toUpperCase()]
  const isTerminal = ["CANCELLED", "REFUNDED", "COMPLETED"].includes(order.status.toUpperCase())
  const isUnchanged = status === order.status.toUpperCase()

  const applyStatus = async (newStatus: string) => {
    if (isUnchanged && newStatus === order.status.toUpperCase()) return
    setPending(true)
    const res = await onStatusChange(order.id, newStatus)
    setPending(false)
    if (res.success) setStatus(newStatus.toUpperCase())
  }

  const itemCount = order.items.reduce((s, item) => s + item.quantity, 0)

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "items", label: `Items (${itemCount})` },
    { id: "timeline", label: "Timeline" },
    { id: "payment", label: "Payment" },
    { id: "delivery", label: "Delivery" },
    { id: "notes", label: "Notes" },
  ]

  return (
    <>
      <SheetHeader className="p-8 pb-0 space-y-0 text-left bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <SheetTitle className="text-[22px] font-extrabold text-[#111827] tracking-tight">Order Details</SheetTitle>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-extrabold text-[#111827]">ORD{order.id.slice(-6)}</h2>
          {getPaymentBadge(order.payment)}
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-7 text-[13px] font-bold pt-1 w-max">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`pb-3 capitalize transition-colors ${tab === t.id ? "border-b-[3px] border-[#F97316] text-[#F97316]" : "text-[#6B7280] hover:text-[#111827] border-b-[3px] border-transparent"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </SheetHeader>

      <div className="p-6 space-y-6 flex-1 bg-[#F9FAFB]">
        {tab === "overview" && (
        <>
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#FFF7ED] p-4 rounded-[16px] flex flex-col justify-between h-[96px] border border-[#FED7AA]/30">
            <div className="flex items-center gap-2 text-[#374151] text-[11px] font-bold">
              <div className="h-6 w-6 rounded-full bg-[#FDE68A] flex items-center justify-center shrink-0"><ShoppingBag className="h-3 w-3 text-[#F59E0B]" /></div> Order Amount
            </div>
            <span className="font-extrabold text-[18px] text-[#111827]">{formatCurrency(order.amount)}</span>
          </div>
          <div className="bg-[#F9FAFB] p-4 rounded-[16px] flex flex-col justify-between h-[96px] border border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-[#374151] text-[11px] font-bold">
              <div className="h-6 w-6 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0"><span className="text-[9px] font-extrabold text-[#374151]">UPI</span></div> Payment Method
            </div>
            <span className="font-extrabold text-[15px] text-[#111827] uppercase">{order.paymentMethod ?? "UPI"}</span>
          </div>
          <div className="bg-[#FFF7ED] p-4 rounded-[16px] flex flex-col justify-between h-[96px] border border-[#FED7AA]/30">
            <div className="flex items-center gap-2 text-[#374151] text-[11px] font-bold">
              <div className="h-6 w-6 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0"><Clock3 className="h-3 w-3 text-[#DC2626]" /></div> Order Time
            </div>
            <span className="font-extrabold text-[13px] text-[#111827] leading-tight">{formatOrderDate(order.date)}</span>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h4 className="text-[13px] font-extrabold text-[#111827]">Customer Details</h4>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-medium text-[#374151] flex items-center gap-2.5"><User className="h-4 w-4 text-[#6B7280] shrink-0" /> {order.customer.name ?? "Anonymous"}</span>
              <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2.5"><Phone className="h-4 w-4 text-[#6B7280] shrink-0" /> {order.customer.phone ?? "—"}</span>
              <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2.5"><Mail className="h-4 w-4 text-[#6B7280] shrink-0" /> <span className="truncate">{order.customer.email ?? "—"}</span></span>
            </div>
            <a href="/admin/customers" className="text-[#2563EB] font-semibold text-[13px] mt-2">View customers &rarr;</a>
          </div>
          <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h4 className="text-[13px] font-extrabold text-[#111827] flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-[#111827] text-[#F59E0B] flex items-center justify-center text-[10px] font-bold shrink-0">{(order.kitchen.name ?? "??").substring(0, 2).toUpperCase()}</div>
              Kitchen Details
            </h4>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-extrabold text-[#111827]">{order.kitchen.name ?? "Unknown Kitchen"}</span>
              <span className="text-[13px] font-medium text-[#6B7280] flex items-start gap-2.5"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#6B7280]" /> <span className="line-clamp-2 leading-tight">{order.kitchen.address ?? "Thanjavur, Tamil Nadu"}</span></span>
              <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2.5"><Phone className="h-4 w-4 text-[#6B7280] shrink-0" /> {order.kitchen.phone ?? "+91 98765 43210"}</span>
            </div>
            <a href="/admin/kitchens" className="text-[#2563EB] font-semibold text-[13px] mt-2">View kitchens &rarr;</a>
          </div>
        </div>

        {/* Delivery Partner */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[11px] font-bold text-[#6B7280]">Delivery Partner</h4>
            {order.deliveryPartner ? (
              <>
                <span className="text-[14px] font-extrabold text-[#111827]">{order.deliveryPartner.name ?? "—"}</span>
                <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2.5"><Phone className="h-4 w-4" /> {order.deliveryPartner.phone ?? "—"}</span>
              </>
            ) : (
              <span className="text-[14px] font-extrabold text-[#111827] italic text-muted-foreground">Not Assigned</span>
            )}
          </div>
          {order.deliveryPartner && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex flex-col items-start sm:items-center gap-2 text-left sm:text-center">
                <h4 className="text-[11px] font-bold text-[#6B7280]">Delivery Status</h4>
                <div className="flex items-center gap-2 text-[#15803D] font-extrabold text-[15px] capitalize">
                  <Bike className="h-5 w-5" /> {(order.deliveryStatus ?? "ASSIGNED").replace("_", " ").toLowerCase()}
                </div>
              </div>
              <Button variant="outline" className="h-10 text-[13px] font-extrabold text-[#15803D] border-[#BBF7D0] bg-[#DCFCE7] hover:bg-green-100 gap-2 rounded-xl shadow-none w-full sm:w-auto" onClick={() => setTab("delivery")}>
                <Navigation className="h-4 w-4" /> View Delivery
              </Button>
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827]">Order Status</h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#F3F4F6] pb-5 gap-4">
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-[#6B7280]">Current Status</span>
              <div>{getStatusBadge(order.status)}</div>
            </div>
            {!isTerminal && (
              <div className="flex flex-col gap-2.5 items-start sm:items-end w-full sm:w-auto">
                <span className="text-[11px] font-bold text-[#6B7280]">Quick Actions</span>
                <div className="flex flex-wrap items-center gap-3">
                  {next && (
                    <Button variant="outline" className="h-9 text-[12px] text-[#EA580C] border-[#FED7AA] bg-[#FFF7ED] hover:bg-orange-100 px-4 font-bold rounded-[10px] shadow-none w-full sm:w-auto" disabled={pending} onClick={() => applyStatus(next)}>
                      {pending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null} Next: {STATUS_LABELS[next]}
                    </Button>
                  )}
                  <Button variant="outline" className="h-9 text-[12px] text-[#DC2626] border-[#FECACA] bg-[#FEE2E2] hover:bg-red-100 px-4 font-bold rounded-[10px] shadow-none w-full sm:w-auto" disabled={pending} onClick={() => applyStatus("CANCELLED")}>
                    Cancel Order
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-[#6B7280]">Change Status</span>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 text-[13px] font-medium flex-1 rounded-xl border-[#D1D5DB] w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="PREPARING">PREPARING</SelectItem>
                  <SelectItem value="READYFORPICKUP">READY FOR PICKUP</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-11 text-[13px] font-bold bg-[#15803D] hover:bg-green-800 text-white px-6 rounded-xl shadow-none w-full sm:w-auto" disabled={pending || isUnchanged} onClick={() => applyStatus(status)}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Status
              </Button>
            </div>
          </div>
        </div>
        </>
        )}

        {tab === "items" && (
        <>
        {/* Order Items */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827]">Order Items ({itemCount})</h4>
          <div className="flex flex-col gap-4">
            {order.items.map((item, idx) => (
              <div key={item.id ?? idx} className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-[#6B7280] w-4">{idx + 1}</span>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-[10px] object-cover border border-[#E5E7EB]" />
                  ) : (
                    <div className="h-12 w-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                      <ChefHat className="h-5 w-5 text-[#9CA3AF]" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-extrabold text-[#111827]">{item.name}</span>
                    <span className="text-[12px] font-medium text-[#6B7280]">{formatCurrency(item.price)} x {item.quantity}</span>
                  </div>
                </div>
                <span className="text-[14px] font-extrabold text-[#111827]">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
            <span className="text-[14px] font-extrabold text-[#111827]">Item Total</span>
            <span className="text-[16px] font-extrabold text-[#111827]">{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#16A34A]">Discount Applied</span>
              <span className="text-[14px] font-extrabold text-[#16A34A]">- {formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
            <span className="text-[14px] font-extrabold text-[#111827]">Total</span>
            <span className="text-[16px] font-extrabold text-[#111827]">{formatCurrency(order.amount)}</span>
          </div>
        </div>
        </>
        )}

        {tab === "timeline" && (
        <>
        {/* Status Timeline */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827] flex items-center gap-2"><History className="h-4 w-4 text-[#6B7280]" /> Status Timeline</h4>
          {order.statusHistory.length > 0 ? (
            <div className="flex flex-col">
              {order.statusHistory.map((h, idx) => (
                <div key={h.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {idx < order.statusHistory.length - 1 && <span className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-[#E5E7EB]" />}
                  <div className="h-6 w-6 rounded-full border-2 border-[#F97316] bg-white flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 bg-[#F97316] rounded-full" />
                  </div>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <span className="text-[13px] font-extrabold text-[#111827] uppercase">{STATUS_LABELS[h.status.toUpperCase()] ?? h.status}</span>
                    <span className="text-[12px] font-medium text-[#6B7280]">{new Date(h.changedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}</span>
                    {h.note && <span className="text-[12px] font-medium text-[#374151] italic">&ldquo;{h.note}&rdquo;</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] font-medium text-[#6B7280]">No status history recorded yet.</p>
          )}
        </div>
        </>
        )}

        {tab === "payment" && (
        <>
        {/* Payment Details */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827] flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#6B7280]" /> Payment Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Payment Status</span>
              <div>{getPaymentBadge(order.payment)}</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Payment Method</span>
              <span className="text-[13px] font-extrabold text-[#111827] uppercase">{order.paymentMethod ?? "UPI"}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Provider</span>
              <span className="text-[13px] font-extrabold text-[#111827] uppercase">{order.paymentProvider ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Provider Order ID</span>
              <span className="text-[13px] font-extrabold text-[#111827] truncate">{order.providerOrderId ?? "—"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-3 border-t border-[#F3F4F6]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#6B7280]">Item Total</span>
              <span className="text-[13px] font-extrabold text-[#111827]">{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#6B7280]">Discount</span>
                <span className="text-[13px] font-extrabold text-[#16A34A]">- {formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
              <span className="text-[14px] font-extrabold text-[#111827]">Total Paid</span>
              <span className="text-[16px] font-extrabold text-[#111827]">{formatCurrency(order.amount)}</span>
            </div>
          </div>
        </div>
        </>
        )}

        {tab === "delivery" && (
        <>
        {/* Delivery Details */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827] flex items-center gap-2"><Navigation className="h-4 w-4 text-[#6B7280]" /> Delivery Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Delivery Partner</span>
              {order.deliveryPartner ? (
                <>
                  <span className="text-[13px] font-extrabold text-[#111827]">{order.deliveryPartner.name ?? "—"}</span>
                  <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2"><Phone className="h-4 w-4 text-[#6B7280] shrink-0" /> {order.deliveryPartner.phone ?? "—"}</span>
                </>
              ) : (
                <span className="text-[13px] font-extrabold text-[#111827] italic text-muted-foreground">Not Assigned</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Delivery Status</span>
              <span className="text-[13px] font-extrabold text-[#111827] capitalize">{(order.deliveryStatus ?? "ASSIGNED").replace("_", " ").toLowerCase()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Service Date</span>
              <span className="text-[13px] font-extrabold text-[#111827]">{new Date(order.serviceDate).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#6B7280]">Time Slot</span>
              <span className="text-[13px] font-extrabold text-[#111827]">{formatTimeSlot(order.timeSlot)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-3 border-t border-[#F3F4F6]">
            <span className="text-[11px] font-bold text-[#6B7280]">Delivery Address</span>
            {order.deliveryAddress ? (
              <span className="text-[13px] font-medium text-[#374151] flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#6B7280]" />
                <span className="leading-relaxed">
                  {order.deliveryAddress.label && <span className="font-extrabold text-[#111827] block">{order.deliveryAddress.label}</span>}
                  {[order.deliveryAddress.lineOne, order.deliveryAddress.lineTwo, order.deliveryAddress.pincode].filter(Boolean).join(", ") || "—"}
                </span>
              </span>
            ) : (
              <span className="text-[13px] font-medium text-[#6B7280]">No delivery address on file</span>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-3 border-t border-[#F3F4F6]">
            <span className="text-[11px] font-bold text-[#6B7280]">Kitchen Address</span>
            <span className="text-[13px] font-medium text-[#374151] flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#6B7280]" />
              <span className="leading-relaxed">{order.kitchen.address ?? "—"}</span>
            </span>
          </div>
        </div>
        </>
        )}

        {tab === "notes" && (
        <>
        {/* Notes */}
        <div className="bg-white p-5 rounded-[18px] border border-[#E5E7EB] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h4 className="text-[14px] font-extrabold text-[#111827] flex items-center gap-2"><StickyNote className="h-4 w-4 text-[#6B7280]" /> Notes</h4>
          {order.statusHistory.some((h) => h.note) ? (
            <div className="flex flex-col gap-4">
              {order.statusHistory.filter((h) => h.note).map((h) => (
                <div key={h.id} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#111827]">{STATUS_LABELS[h.status.toUpperCase()] ?? h.status}</span>
                  <span className="text-[13px] font-medium text-[#374151]">{h.note}</span>
                  <span className="text-[11px] font-medium text-[#6B7280]">{new Date(h.changedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] font-medium text-[#6B7280]">No notes recorded for this order yet.</p>
          )}
        </div>
        </>
        )}
      </div>

      <div className="p-5 border-t border-[#E5E7EB] bg-white flex flex-wrap-reverse sm:flex-nowrap justify-end gap-3 sticky bottom-0 z-10 rounded-b-xl">
        <Button variant="outline" onClick={onClose} className="h-11 px-6 text-[13px] font-bold text-[#374151] border-[#D1D5DB] rounded-xl shadow-none w-full sm:w-auto mt-2 sm:mt-0">Close</Button>
        <Button className="h-11 px-6 text-[13px] font-bold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl shadow-none gap-2 w-full sm:w-auto" disabled={pending || isTerminal} onClick={() => { if (!isTerminal && next) applyStatus(next) }}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4" />} {!isTerminal && next ? `Mark ${STATUS_LABELS[next]}` : "Order Complete"}
        </Button>
      </div>
    </>
  )
}