"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Search, Download, RefreshCw, CheckCircle2, Timer, ChefHat,
  XCircle, ShoppingBag, Banknote, Check, Play,
  Eye, MoreVertical, Bike, User, Phone, Mail, MapPin, Clock, Loader2,
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
    return `${date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}, ${time}`
  }
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

const getStatusBadge = (status?: string | null) => {
  switch ((status ?? "").toUpperCase()) {
    case "CONFIRMED": return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">CONFIRMED</Badge>
    case "PREPARING": return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">PREPARING</Badge>
    case "READYFORPICKUP": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">READY FOR PICKUP</Badge>
    case "COMPLETED": return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">COMPLETED</Badge>
    case "CANCELLED": return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">CANCELLED</Badge>
    case "REFUNDED": return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">REFUNDED</Badge>
    default: return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">{(status ?? "N/A").toUpperCase()}</Badge>
  }
}

const getPaymentBadge = (payment?: string | null) => {
  switch ((payment ?? "").toUpperCase()) {
    case "SUCCESS":
    case "PAID": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">PAID</Badge>
    case "PENDING": return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">PENDING</Badge>
    case "REFUNDED": return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">REFUNDED</Badge>
    default: return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">{(payment ?? "N/A").toUpperCase()}</Badge>
  }
}

const columnHelper = createColumnHelper<AdminOrder>()

// --- Exact-shape animated skeletons ---

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-14" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-24 hidden md:block" />
          <Skeleton className="h-3 w-20 hidden lg:block" />
          <Skeleton className="h-3 w-12 hidden lg:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
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

  // --- Real stats computed from orders ---
  const stats = useMemo(() => {
    const total = orders.length
    const confirmed = orders.filter((o) => o.status.toUpperCase() === "CONFIRMED").length
    const preparing = orders.filter((o) => o.status.toUpperCase() === "PREPARING").length
    const ready = orders.filter((o) => o.status.toUpperCase() === "READYFORPICKUP").length
    const completed = orders.filter((o) => o.status.toUpperCase() === "COMPLETED").length
    const cancelled = orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status.toUpperCase())).length
    const revenue = orders.reduce((sum, o) => sum + o.amount, 0)
    return { total, confirmed, preparing, ready, completed, cancelled, revenue }
  }, [orders])

  // --- Filters ---
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
            aria-label="Select all the rows"
            className="border-gray-300 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-300 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
        </div>
      ),
    }),
    columnHelper.accessor("id", {
      header: "ORDER",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <span className="font-semibold text-xs tracking-tight uppercase">ORD{row.original.id.slice(-6)}</span>
          <span className="text-[10px] text-muted-foreground">{formatOrderDate(row.original.date)}</span>
        </div>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "CUSTOMER",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-xs">{row.original.customer.name ?? "Anonymous"}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.customer.phone ?? "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("kitchen", {
      header: "KITCHEN",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            {(row.original.kitchen.name ?? "??").substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-xs">{row.original.kitchen.name ?? "Unknown Kitchen"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "AMOUNT",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-xs">{formatCurrency(row.original.amount)}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.items.length} item(s)</span>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ getValue }) => getStatusBadge(getValue()),
    }),
    columnHelper.accessor("payment", {
      header: "PAYMENT",
      cell: ({ getValue }) => getPaymentBadge(getValue()),
    }),
    columnHelper.accessor("deliveryPartner", {
      header: "DELIVERY",
      cell: ({ row }) => (
        row.original.deliveryPartner ? (
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-full bg-green-100 text-green-700 shrink-0">
              <Bike className="h-3 w-3" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-xs">{row.original.deliveryPartner.name ?? "—"}</span>
              <span className="text-[10px] text-muted-foreground">{row.original.deliveryPartner.phone ?? "—"}</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-2"><span className="h-[1px] w-3 bg-gray-300"></span> Not Assigned</span>
        )
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setSelectedOrder(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                <MoreVertical className="h-3.5 w-3.5" />
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
                <DropdownMenuItem className="text-destructive" onClick={() => updateOrder(row.original.id, "CANCELLED")}>Cancel Order</DropdownMenuItem>
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

  const filtersActive = searchQuery !== "" || statusFilter !== "all" || paymentFilter !== "all" || kitchenFilter !== "all" || deliveryFilter !== "all"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-sm text-muted-foreground">Track, manage and update all customer orders in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white text-sm shadow-sm" onClick={exportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 text-muted-foreground" /> Export
          </Button>
          <Button variant="outline" className="gap-2 bg-white text-sm shadow-sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: "Total Orders", value: stats.total.toLocaleString("en-IN"), trend: `${stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}% completed` : "No data yet"}`, trendUp: null, icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-50" },
            { title: "Confirmed", value: stats.confirmed.toLocaleString("en-IN"), trend: `${stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% of total`, trendUp: null, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Preparing", value: stats.preparing.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.preparing / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: ChefHat, color: "text-orange-500", bg: "bg-orange-50" },
            { title: "Ready / Completed", value: (stats.ready + stats.completed).toLocaleString("en-IN"), trend: `${stats.ready} ready for pickup`, trendUp: null, icon: Timer, color: "text-green-600", bg: "bg-green-50" },
            { title: "Cancelled", value: stats.cancelled.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.cancelled / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
            { title: "Total Revenue", value: formatCurrency(stats.revenue), trend: "Across loaded orders", trendUp: null, icon: Banknote, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-xl font-bold mt-1 truncate">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-[10px] font-medium ${stat.trendUp ? "text-green-600" : "text-muted-foreground"} truncate`}>
                  {stat.trendUp && "↑"} {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
        <div className="p-3 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative min-w-[220px] flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Status: All" /></SelectTrigger>
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
              <SelectTrigger className="w-[135px] h-9 text-xs"><SelectValue placeholder="Payment: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Payment: All</SelectItem>
                <SelectItem value="SUCCESS">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Kitchen: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kitchen: All</SelectItem>
                {kitchens.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Delivery: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Delivery: All</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Not Assigned</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="gap-2 h-9 text-xs text-muted-foreground"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setPaymentFilter("all")
                setKitchenFilter("all")
                setDeliveryFilter("all")
                setRowSelection({})
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="bg-orange-50/30 p-2.5 px-4 border-b border-border/50 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold">{selectedCount} Selected</span>
            <div className="h-4 w-px bg-border mx-1"></div>
            <Button size="sm" variant="outline" className="h-7 text-xs text-blue-600 border-blue-200 bg-white hover:bg-blue-50 gap-1.5" onClick={() => handleBulkStatus("CONFIRMED")}>
              <Check className="h-3.5 w-3.5" /> Mark as Confirmed
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-orange-600 border-orange-200 bg-white hover:bg-orange-50 gap-1.5" onClick={() => handleBulkStatus("PREPARING")}>
              <Play className="h-3.5 w-3.5" /> Mark as Preparing
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 bg-white hover:bg-green-50 gap-1.5" onClick={() => handleBulkStatus("READYFORPICKUP")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Ready
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 gap-1.5" onClick={() => handleBulkStatus("COMPLETED")}>
              <Timer className="h-3.5 w-3.5" /> Mark as Completed
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 bg-white hover:bg-red-50 gap-1.5" onClick={() => handleBulkStatus("CANCELLED")}>
              <XCircle className="h-3.5 w-3.5" /> Cancel Orders
            </Button>
          </div>
        )}

        <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-3 border-b border-border/50">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable table={table} emptyMessage={filtersActive ? "No orders match your filters" : "No orders yet"} />
          )}
        </div>

        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
          <p className="text-xs text-muted-foreground">
            Showing {filteredOrders.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredOrders.length)} of {filteredOrders.length.toLocaleString("en-IN")} orders
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[60px] h-7 text-xs"><SelectValue placeholder="10" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 w-7 p-0 text-xs ${i === currentPage ? "bg-[#ff5e14] hover:bg-[#ff5e14]/90 text-white" : ""}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-xs text-muted-foreground px-1">...</span>}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Details Side Panel */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col bg-slate-50/50">
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

  return (
    <>
      <SheetHeader className="p-5 pb-0 border-b border-border/50 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-lg">Order Details</SheetTitle>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight uppercase">ORD{order.id.slice(-6)}</span>
              {getPaymentBadge(order.payment)}
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="p-5 space-y-4 flex-1">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-orange-600 text-[10px] font-medium">
              <div className="p-0.5 rounded-full bg-orange-100"><Banknote className="h-3 w-3" /></div> Order Amount
            </div>
            <span className="font-bold text-sm">{formatCurrency(order.amount)}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <div className="p-0.5"><Badge variant="outline" className="text-[8px] h-3 px-1 rounded-sm tracking-widest text-muted-foreground uppercase">Payment</Badge></div>
            </div>
            <span className="font-semibold text-xs uppercase truncate">{order.paymentMethod ?? "N/A"}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <div className="p-0.5 text-red-500"><Clock className="h-3 w-3" /></div> Order Time
            </div>
            <span className="font-semibold text-xs">{formatOrderDate(order.date)}</span>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground">Customer Details</h4>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {order.customer.name ?? "Anonymous"}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {order.customer.phone ?? "—"}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {order.customer.email ?? "—"}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[7px] font-bold shrink-0">{(order.kitchen.name ?? "??").substring(0, 2).toUpperCase()}</div>
              Kitchen Details
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">{order.kitchen.name ?? "Unknown Kitchen"}</span>
              <span className="text-xs text-muted-foreground flex items-start gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /> <span className="line-clamp-2 leading-tight">{order.kitchen.address ?? "—"}</span></span>
              <span className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {order.kitchen.phone ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Delivery Partner */}
        <div className="bg-white p-4 rounded-lg border border-border/50 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-medium text-muted-foreground">Delivery Partner</h4>
            {order.deliveryPartner ? (
              <>
                <span className="text-xs font-medium flex items-center gap-1.5"><Bike className="h-3.5 w-3.5 text-green-600" /> {order.deliveryPartner.name ?? "—"}</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {order.deliveryPartner.phone ?? "—"}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">Not Assigned</span>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-4">
          <h4 className="text-xs font-semibold">Order Status</h4>
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">Current Status</span>
              {getStatusBadge(order.status)}
            </div>
            {!isTerminal && (
              <div className="flex flex-col gap-1.5 items-end">
                <span className="text-[10px] text-muted-foreground font-medium">Quick Actions</span>
                <div className="flex items-center gap-2">
                  {next && (
                    <Button size="sm" variant="outline" className="h-7 text-[10px] text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 font-medium shadow-none" disabled={pending} onClick={() => applyStatus(next)}>
                      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Next: {STATUS_LABELS[next]}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-600 border-red-200 bg-red-50 hover:bg-red-100 px-3 font-medium shadow-none" disabled={pending} onClick={() => applyStatus("CANCELLED")}>
                    Cancel Order
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-muted-foreground font-medium">Change Status</span>
            <div className="flex gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="PREPARING">PREPARING</SelectItem>
                  <SelectItem value="READYFORPICKUP">READY FOR PICKUP</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-9 text-xs bg-green-700 hover:bg-green-800 text-white px-6" disabled={pending || isUnchanged} onClick={() => applyStatus(status)}>
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Update Status
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-2">
          <h4 className="text-xs font-semibold">Payment Details</h4>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium uppercase">{order.paymentProvider ?? "N/A"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Provider Ref</span>
            <span className="font-medium">{order.providerOrderId ?? "N/A"}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-4">
          <h4 className="text-xs font-semibold">Order Items ({itemCount})</h4>
          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div key={item.id ?? idx} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-3">{idx + 1}</span>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatCurrency(item.price)} x {item.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs font-bold">Total</span>
            <span className="text-sm font-bold">{formatCurrency(order.amount)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/50 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
        <Button variant="outline" onClick={onClose} className="text-xs h-9">Close</Button>
      </div>
    </>
  )
}