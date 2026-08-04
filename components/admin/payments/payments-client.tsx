"use client"

import { useState, useMemo } from "react"
import {
  AdminPaymentRow,
  useAdminPayments,
  useAdminPaymentsQuery,
  useAdminSelectedPayment,
  useAdminPaymentsActions,
} from "@/stores"
import {
  Search, Download, RefreshCcw, Eye,
  CreditCard, CheckCircle2, Clock, XCircle, Receipt,
  Wallet, Landmark, Smartphone, Banknote, MoreVertical,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const STATUS_BUCKETS = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"] as const

const DONUT_COLORS: Record<string, { stroke: string; dot: string }> = {
  SUCCESS: { stroke: "text-green-600", dot: "bg-green-600" },
  PENDING: { stroke: "text-orange-500", dot: "bg-orange-500" },
  FAILED: { stroke: "text-red-500", dot: "bg-red-500" },
  REFUNDED: { stroke: "text-purple-600", dot: "bg-purple-600" },
}

const DONUT_LABELS: Record<string, string> = {
  SUCCESS: "Successful",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

function bucketOf(status: string | null): string {
  const up = (status ?? "").toUpperCase()
  if (up === "SUCCESS" || up === "PAID") return "SUCCESS"
  if (up === "PENDING") return "PENDING"
  if (up === "FAILED") return "FAILED"
  if (up === "REFUNDED") return "REFUNDED"
  return up || "OTHER"
}

function pctOf(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return { date: "N/A", time: "" }
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  }
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

function downloadCSV(filename: string, header: string[], rows: string[][]) {
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportReceipt(payment: AdminPaymentRow) {
  const header = ["Payment ID", "Order ID", "Amount", "Method", "Provider", "Status", "Paid At"]
  const rows = [[payment.id, payment.orderId ?? "", String(payment.amount), payment.paymentMethod ?? "", payment.provider ?? "", payment.status, payment.paidAt ? new Date(payment.paidAt).toLocaleString("en-IN") : ""]]
  downloadCSV(`payment-receipt-${payment.id.slice(0, 8)}.csv`, header, rows)
  toast.success("Receipt downloaded")
}

const getStatusBadge = (status?: string | null) => {
  switch ((status ?? "").toUpperCase()) {
    case "SUCCESS":
    case "PAID": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Paid</Badge>
    case "PENDING": return <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Pending</Badge>
    case "FAILED": return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Failed</Badge>
    case "REFUNDED": return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Refunded</Badge>
    default: return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">{(status ?? "N/A").toUpperCase()}</Badge>
  }
}

function getMethodInfo(method: string | null, provider: string | null) {
  const m = (method || "").toUpperCase()
  const p = (provider || "").toUpperCase()

  if (m === "UPI" || p.includes("PAYTM") || p.includes("PHONEPE") || p.includes("GPAY")) {
    return { icon: Smartphone, color: "text-blue-600", bg: "bg-blue-100", label: "UPI", sub: provider ?? null }
  }
  if (m === "CARD" || m.includes("CREDIT") || m.includes("DEBIT")) {
    return { icon: CreditCard, color: "text-orange-600", bg: "bg-orange-100", label: "Card", sub: provider ?? null }
  }
  if (m.includes("NET") || m.includes("BANK")) {
    return { icon: Landmark, color: "text-indigo-600", bg: "bg-indigo-100", label: "Net Banking", sub: provider ?? null }
  }
  if (m.includes("WALLET")) {
    return { icon: Wallet, color: "text-purple-600", bg: "bg-purple-100", label: "Wallet", sub: provider ?? null }
  }
  return { icon: Banknote, color: "text-gray-600", bg: "bg-gray-100", label: method || "Unknown", sub: provider ?? null }
}

const columnHelper = createColumnHelper<AdminPaymentRow>()

// --- Exact-shape animated skeletons ---

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
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
            <Skeleton className="h-9 w-9 rounded" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-24 hidden md:block" />
          <Skeleton className="h-3 w-16 hidden lg:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center justify-center gap-4 py-2">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [kitchenFilter, setKitchenFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)

  const { isLoading, isFetching, refetch } = useAdminPaymentsQuery()
  const payments = useAdminPayments()
  const selectedPayment = useAdminSelectedPayment()
  const { setSelectedPayment } = useAdminPaymentsActions()

  // --- Real stats computed from payments ---
  const stats = useMemo(() => {
    const buckets: Record<string, { count: number; amount: number }> = {
      SUCCESS: { count: 0, amount: 0 },
      PENDING: { count: 0, amount: 0 },
      FAILED: { count: 0, amount: 0 },
      REFUNDED: { count: 0, amount: 0 },
    }
    let totalAmount = 0
    for (const p of payments) {
      totalAmount += p.amount
      const key = bucketOf(p.status)
      if (key in buckets) buckets[key].count += 1
      if (key in buckets) buckets[key].amount += p.amount
    }
    return {
      total: payments.length,
      totalAmount,
      success: buckets.SUCCESS.count,
      pending: buckets.PENDING.count,
      failed: buckets.FAILED.count,
      refunded: buckets.REFUNDED.count,
      successAmount: buckets.SUCCESS.amount,
      pendingAmount: buckets.PENDING.amount,
      failedAmount: buckets.FAILED.amount,
      refundedAmount: buckets.REFUNDED.amount,
    }
  }, [payments])

  // --- Donut chart data (real percentages) ---
  const donutData = useMemo(
    () =>
      STATUS_BUCKETS.map((key) => ({
        key,
        count: key === "SUCCESS" ? stats.success : key === "PENDING" ? stats.pending : key === "FAILED" ? stats.failed : stats.refunded,
        amount: key === "SUCCESS" ? stats.successAmount : key === "PENDING" ? stats.pendingAmount : key === "FAILED" ? stats.failedAmount : stats.refundedAmount,
      })).filter((d) => d.count > 0),
    [stats],
  )

  // --- Filters ---
  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000

    return payments.filter((p) => {
      if (q) {
        const haystack = [
          p.id,
          p.orderId ?? "",
          p.customer.name ?? "",
          p.customer.phone ?? "",
          p.kitchen ?? "",
          p.providerPaymentId ?? "",
          p.providerOrderId ?? "",
        ].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter !== "all" && bucketOf(p.status) !== statusFilter) return false
      if (methodFilter !== "all" && (p.paymentMethod ?? "OTHER").toUpperCase() !== methodFilter) return false
      if (kitchenFilter !== "all" && (p.kitchen ?? "Unknown") !== kitchenFilter) return false
      if (dateFilter === "today" && new Date(p.createdAt).getTime() < startOfToday) return false
      if (dateFilter === "7d" && new Date(p.createdAt).getTime() < sevenDaysAgo) return false
      if (dateFilter === "30d" && new Date(p.createdAt).getTime() < thirtyDaysAgo) return false
      return true
    })
  }, [payments, searchQuery, statusFilter, methodFilter, kitchenFilter, dateFilter])

  const methods = useMemo(
    () => Array.from(new Set(payments.map((p) => (p.paymentMethod ?? "OTHER").toUpperCase()).filter((v) => v !== "NONE"))),
    [payments],
  )
  const kitchens = useMemo(
    () => Array.from(new Set(payments.map((p) => p.kitchen ?? "Unknown").filter(Boolean))),
    [payments],
  )

  // --- Popular method distribution ---
  const methodDist = useMemo(() => {
    const map = new Map<string, { label: string; count: number; amount: number }>()
    for (const p of payments) {
      const method = (p.paymentMethod ?? "OTHER").toUpperCase()
      const label = method === "UPI" ? "UPI" : method === "CARD" ? "Card" : method === "NETBANKING" ? "Net Banking" : method === "WALLET" ? "Wallet" : method === "NONE" ? "N/A" : method
      const entry = map.get(method) ?? { label, count: 0, amount: 0 }
      entry.count += 1
      entry.amount += p.amount
      map.set(method, entry)
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [payments])

  // --- real recent refunds ---
  const recentRefunds = useMemo(
    () =>
      payments
        .flatMap((p) =>
          (p.refunds ?? []).map((r) => ({
            paymentId: p.id,
            orderId: p.orderId,
            amount: r.amount,
            status: r.status,
            initiatedAt: r.initiatedAt,
          })),
        )
        .sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime())
        .slice(0, 4),
    [payments],
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
            className="border-gray-300 text-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-300 text-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
          />
        </div>
      ),
    }),
    columnHelper.accessor("orderId", {
      header: "ORDER ID",
      cell: ({ row }) => (
        <div className="flex items-start gap-2 min-w-[100px]">
          <div className="mt-0.5 text-gray-400 shrink-0"><Receipt className="h-3.5 w-3.5" /></div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-gray-900 tracking-tight uppercase">ORD{(row.original.orderId ?? row.original.id).slice(-6)}</span>
            <span className="text-[10px] text-muted-foreground">#{row.original.orderId ?? row.original.id.slice(0, 4)}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "CUSTOMER",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-xs text-gray-900">{row.original.customer.name ?? "Anonymous"}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.customer.phone ?? "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("kitchen", {
      header: "KITCHEN",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
            {(row.original.kitchen ?? "??").substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-xs text-gray-900">{row.original.kitchen ?? "Unknown"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "AMOUNT",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-xs text-gray-900">{formatCurrency(row.original.amount)}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{row.original.status.toLowerCase()}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "method",
      header: "METHOD",
      cell: ({ row }) => {
        const methodInfo = getMethodInfo(row.original.paymentMethod, row.original.provider)
        const Icon = methodInfo.icon
        return (
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${methodInfo.bg}`}>
              <Icon className={`h-3 w-3 ${methodInfo.color}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-xs text-gray-900">{methodInfo.label}</span>
              <span className="text-[10px] text-muted-foreground">{methodInfo.sub ?? "—"}</span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ getValue }) => getStatusBadge(getValue()),
    }),
    columnHelper.accessor("paidAt", {
      header: "PAID AT",
      cell: ({ getValue }) => {
        const dt = formatDateTime(getValue() ?? null)
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-600">{dt.date}</span>
            <span className="text-[10px] text-muted-foreground">{dt.time}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("providerPaymentId", {
      header: "PAYMENT ID",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600 font-mono truncate w-[110px]">{row.original.providerPaymentId ?? "—"}</span>
          <span className="text-[9px] text-muted-foreground font-mono truncate w-[110px]">{row.original.providerOrderId ?? "—"}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setSelectedPayment(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPayment(row.original)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReceipt(row.original)}>Download Receipt</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ], [setSelectedPayment])

  const table = useReactTable({
    data: filteredPayments,
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
  const selectedPayments = Object.keys(rowSelection)
    .map((idx) => filteredPayments[Number(idx)])
    .filter(Boolean) as AdminPaymentRow[]

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  const exportCSV = () => {
    const header = ["Payment ID", "Order ID", "Customer", "Phone", "Kitchen", "Amount", "Method", "Provider", "Status", "Paid At", "Provider Order ID", "Provider Payment ID"]
    const rows = (selectedCount > 0 ? selectedPayments : filteredPayments).map((p) => [
      p.id,
      p.orderId ?? "",
      p.customer.name ?? "",
      p.customer.phone ?? "",
      p.kitchen ?? "",
      String(p.amount),
      p.paymentMethod ?? "",
      p.provider ?? "",
      p.status,
      p.paidAt ? new Date(p.paidAt).toLocaleString("en-IN") : "",
      p.providerOrderId ?? "",
      p.providerPaymentId ?? "",
    ])
    downloadCSV("payments.csv", header, rows)
    toast.success("Payments exported")
  }

  const filterChips = [
    { key: "all", label: "All Transactions", className: "text-green-700 bg-green-50 border-green-200", count: stats.total, countClass: "bg-green-100 text-green-700" },
    { key: "SUCCESS", label: "Successful", className: "text-green-600 bg-white border-transparent", count: stats.success, countClass: "bg-green-50 text-green-700" },
    { key: "PENDING", label: "Pending", className: "text-orange-600 bg-orange-50 border-transparent", count: stats.pending, countClass: "bg-orange-200 text-orange-700" },
    { key: "FAILED", label: "Failed", className: "text-red-600 bg-red-50 border-transparent", count: stats.failed, countClass: "bg-red-200 text-red-700" },
    { key: "REFUNDED", label: "Refunded", className: "text-purple-600 bg-purple-50 border-transparent", count: stats.refunded, countClass: "bg-purple-200 text-purple-700" },
  ]

  const filtersActive = searchQuery !== "" || statusFilter !== "all" || methodFilter !== "all" || kitchenFilter !== "all" || dateFilter !== "all"

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-sm text-muted-foreground">Track, monitor and manage all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-sm shadow-sm bg-white" onClick={exportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 text-muted-foreground" /> Export
          </Button>
          <Button className="gap-2 text-sm shadow-sm bg-green-700 hover:bg-green-800 text-white" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Column */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Top Stats */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { title: "Total Transactions", value: stats.total.toLocaleString("en-IN"), trend: `${stats.total > 0 ? `${Math.round(pctOf(stats.success, stats.total))}% success rate` : "No data yet"}`, trendUp: null, icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
                { title: "Successful Payments", value: stats.success.toLocaleString("en-IN"), trend: formatCurrency(stats.successAmount), trendUp: null, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Pending Payments", value: stats.pending.toLocaleString("en-IN"), trend: `${stats.total > 0 ? pctOf(stats.pending, stats.total).toFixed(1) : 0}% of total`, trendUp: null, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
                { title: "Failed Payments", value: stats.failed.toLocaleString("en-IN"), trend: `${stats.total > 0 ? pctOf(stats.failed, stats.total).toFixed(1) : 0}% of total`, trendUp: null, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                { title: "Refunds Processed", value: stats.refunded.toLocaleString("en-IN"), trend: `${formatCurrency(stats.refundedAmount)} refunded`, trendUp: null, icon: RefreshCcw, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50">
                  <CardContent className="p-3.5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full ${stat.bg} shrink-0`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{stat.title}</p>
                        <h3 className="text-lg font-bold leading-none">{stat.value}</h3>
                      </div>
                    </div>
                    <p className={`text-[9px] font-medium mt-1 truncate ${stat.trendUp === true ? "text-green-600" : stat.trendUp === false ? "text-red-500" : "text-muted-foreground"}`}>
                      {stat.trend}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters & Table */}
          <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
            <div className="p-3 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="relative min-w-[220px] flex-1 lg:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer, payment ID..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status: All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="SUCCESS">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Method: All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Method: All</SelectItem>
                    {methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Kitchen: All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kitchen: All</SelectItem>
                    {kitchens.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Date: All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  className="gap-2 h-9 text-xs text-muted-foreground"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setMethodFilter("all")
                    setKitchenFilter("all")
                    setDateFilter("all")
                    setRowSelection({})
                  }}
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </div>

            <div className="p-3 border-b border-border/50 flex flex-wrap items-center gap-3">
              {filterChips.map((chip) => (
                <Button
                  key={chip.key}
                  variant="outline"
                  className={`h-8 text-xs font-medium gap-1.5 px-3 ${chip.className} ${statusFilter === chip.key ? "shadow-sm ring-1 ring-border" : ""}`}
                  onClick={() => setStatusFilter(chip.key)}
                >
                  {chip.label} <span className={`px-1 rounded text-[10px] ${chip.countClass}`}>{chip.count.toLocaleString("en-IN")}</span>
                </Button>
              ))}
            </div>

            <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-3 border-b border-border/50">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <DataTable table={table} emptyMessage={filtersActive ? "No payments match your filters" : "No payments yet"} />
              )}
            </div>

            <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
              <p className="text-xs text-muted-foreground">
                Showing {filteredPayments.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredPayments.length)} of {filteredPayments.length.toLocaleString("en-IN")} transactions
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
                      className={`h-7 w-7 p-0 text-xs ${i === currentPage ? "bg-green-700 hover:bg-green-800 text-white" : ""}`}
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
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0 space-y-4">
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <>
              {/* Payment Overview */}
              <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/50">
                  <CardTitle className="text-xs font-semibold">Payment Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-center gap-4">
                  <div className="relative w-[110px] h-[110px] shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="currentColor" strokeWidth="4" fill="none" />
                      {donutData.length === 0 ? (
                        <path className="text-gray-300" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="currentColor" strokeWidth="4" fill="none" />
                      ) : donutData.map((seg, i) => {
                        const offset = -(donutData.slice(0, i).reduce((s, d) => s + d.count, 0) / Math.max(stats.total, 1)) * 100
                        return <path key={seg.key} className={DONUT_COLORS[seg.key].stroke} strokeDasharray={`${pctOf(seg.count, stats.total).toFixed(1)}, 100`} strokeDashoffset={offset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="currentColor" strokeWidth="4" fill="none" />
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold">{formatCurrency(stats.totalAmount)}</span>
                      <span className="text-[8px] text-muted-foreground">Total Amount</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full">
                    {donutData.map((d) => (
                      <div key={d.key} className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5"><div className={`h-1.5 w-1.5 rounded-full ${DONUT_COLORS[d.key].dot}`}></div> {DONUT_LABELS[d.key]}</div>
                        <span className="font-semibold">{formatCurrency(d.amount)} <span className="text-gray-400 font-normal">({pctOf(d.count, stats.total).toFixed(1)}%)</span></span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Split */}
              <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/50">
                  <CardTitle className="text-xs font-semibold">Payment Method Split</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-4">
                  {methodDist.length === 0 && <span className="text-xs text-muted-foreground">No payments yet.</span>}
                  {methodDist.map((m) => {
                    const pct = pctOf(m.count, stats.total)
                    const isUpi = m.label === "UPI"
                    const isCard = m.label.toLowerCase().includes("card")
                    const isNet = m.label.toLowerCase().includes("net")
                    const isWallet = m.label.toLowerCase() === "wallet"
                    const Icon = isUpi ? Smartphone : isCard ? CreditCard : isNet ? Landmark : isWallet ? Wallet : Banknote
                    const iconClass = isUpi ? "text-green-600 bg-green-50" : isCard ? "text-orange-600 bg-orange-50" : isNet ? "text-blue-600 bg-blue-50" : isWallet ? "text-purple-600 bg-purple-50" : "text-gray-600 bg-gray-100"
                    const barClass = isUpi ? "bg-green-600" : isCard ? "bg-orange-500" : isNet ? "bg-blue-600" : isWallet ? "bg-purple-600" : "bg-gray-400"
                    return (
                      <div key={m.label} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] font-medium"><div className={`p-1 rounded ${iconClass}`}><Icon className="h-3 w-3" /></div> {m.label}</div>
                          <span className="text-[10px] font-semibold text-gray-900">{m.count.toLocaleString("en-IN")} <span className="text-gray-400 font-normal">({pct.toFixed(1)}%)</span></span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barClass}`} style={{ width: `${pct.toFixed(1)}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Recent Refunds */}
              <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/50">
                  <CardTitle className="text-xs font-semibold">Recent Refunds</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col">
                  {recentRefunds.length === 0 && <div className="p-4 text-xs text-muted-foreground">No refunds yet.</div>}
                  {recentRefunds.map((ref, idx) => (
                    <div key={`${ref.paymentId}-${idx}`} className="p-3 px-4 border-b border-border/50 last:border-0 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Receipt className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold uppercase">ORD{(ref.orderId ?? ref.paymentId).slice(-6)}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(ref.initiatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gray-900">{formatCurrency(ref.amount)}</span>
                        <span className="text-[9px] font-medium text-purple-700 bg-purple-50 px-1.5 rounded-sm">{ref.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Payment Details Side Panel */}
      <Sheet open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col bg-slate-50/50">
          {selectedPayment && (
            <PaymentSheet key={selectedPayment.id} payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MethodDetails({ payment }: { payment: AdminPaymentRow }) {
  const info = getMethodInfo(payment.paymentMethod, payment.provider)
  const Icon = info.icon
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded flex items-center justify-center ${info.bg}`}>
          <Icon className={`h-4 w-4 ${info.color}`} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{info.label}</span>
          <span className="text-xs text-muted-foreground">{info.sub ?? "—"}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Provider Order ID</span>
          <span className="font-mono text-[11px] break-all">{payment.providerOrderId ?? "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Provider Payment ID</span>
          <span className="font-mono text-[11px] break-all">{payment.providerPaymentId ?? "—"}</span>
        </div>
      </div>
    </div>
  )
}

function PaymentSheet({ payment, onClose }: { payment: AdminPaymentRow; onClose: () => void }) {
  const dt = formatDateTime(payment.paidAt ?? null)
  const created = formatDateTime(payment.createdAt)
  return (
    <>
      <SheetHeader className="p-5 pb-0 border-b border-border/50 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-lg">Payment Details</SheetTitle>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight uppercase">PAY{payment.id.slice(-6)}</span>
              {getStatusBadge(payment.status)}
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="p-5 space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-medium">
              <div className="p-0.5 rounded-full bg-green-100"><Banknote className="h-3 w-3" /></div> Amount
            </div>
            <span className="font-bold text-sm">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <div className="p-0.5 text-red-500"><Clock className="h-3 w-3" /></div> Paid At
            </div>
            <span className="font-semibold text-[11px]">{dt.date}{dt.time ? `, ${dt.time}` : ""}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border/50 flex flex-col justify-between h-[72px]">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
              <div className="p-0.5"><Receipt className="h-3 w-3" /></div> Order
            </div>
            <span className="font-semibold text-[11px] uppercase">ORD{(payment.orderId ?? payment.id).slice(-6)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-3">
          <h4 className="text-[11px] font-semibold text-muted-foreground">Payment Method</h4>
          <MethodDetails payment={payment} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-2">
            <h4 className="text-[11px] font-semibold text-muted-foreground">Customer</h4>
            <span className="text-xs font-medium">{payment.customer.name ?? "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">{payment.customer.phone ?? "—"}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-2">
            <h4 className="text-[11px] font-semibold text-muted-foreground">Kitchen</h4>
            <span className="text-xs font-medium">{payment.kitchen ?? "Unknown"}</span>
            <span className="text-xs text-muted-foreground uppercase">Order {payment.orderStatus ?? "—"}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-2">
          <h4 className="text-xs font-semibold">Timeline</h4>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{created.date}{created.time ? `, ${created.time}` : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium">{dt.date}{dt.time ? `, ${dt.time}` : "—"}</span>
            </div>
          </div>
        </div>

        {payment.refunds.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-3">
            <h4 className="text-xs font-semibold">Refunds ({payment.refunds.length})</h4>
            {payment.refunds.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium">{formatCurrency(r.amount)}</span>
                  <span className="text-[10px] text-muted-foreground">{r.reason ?? "No reason"}</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200 bg-purple-50/50 shadow-none h-5">{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
        <Button variant="outline" onClick={onClose} className="text-xs h-9">Close</Button>
        <Button className="text-xs h-9 bg-green-700 hover:bg-green-800 text-white" onClick={() => exportReceipt(payment)}>
          <Download className="h-3.5 w-3.5" /> Download Receipt
        </Button>
      </div>
    </>
  )
}