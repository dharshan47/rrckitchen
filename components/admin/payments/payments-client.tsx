"use client"

import React, { useMemo, useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Search,
  Download,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Clock3,
  CircleX,
  RotateCcw,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Settings,
  Landmark,
  WalletCards,
  CalendarDays,
  X
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell } from "recharts"
import {
  useAdminPaymentsQuery,
  useAdminPayments,
  useAdminSelectedPayment,
  useAdminPaymentsActions,
  type AdminPaymentRow,
} from "@/stores/adminPaymentsStore"

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIAL_REFUND: "Partially Refunded",
}

const STATUS_BADGE: Record<string, string> = {
  SUCCESS: "bg-[#ECFDF3] text-[#15803D] border-[#BBE7C9]",
  PENDING: "bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]",
  FAILED: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  REFUNDED: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
  PARTIAL_REFUND: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
}

const DEFAULT_BADGE = "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"

const METHOD_LABELS: Record<string, string> = {
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net Banking",
  WALLET: "Wallet",
  EMI: "EMI",
  PAYLATER: "Pay Later",
  BANK_TRANSFER: "Bank Transfer",
}

const METHOD_COLORS: Record<string, string> = {
  UPI: "#16A34A",
  CARD: "#F97316",
  NETBANKING: "#2563EB",
  WALLET: "#7C3AED",
  EMI: "#0EA5E9",
  PAYLATER: "#8B5CF6",
  BANK_TRANSFER: "#64748B",
}

const CHART_COLORS = {
  Successful: "#16A34A",
  Pending: "#F59E0B",
  Failed: "#DC2626",
  Refunded: "#6366F1",
}

const EMPTY_PIE_DATA = [{ name: 'Empty', value: 1, color: '#F1F5F9' }]

const REFUND_STATUS_LABELS: Record<string, string> = {
  INITIATED: "Initiated",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  FAILED: "Failed",
}

function formatINR(value: number) {
  return "₹" + value.toLocaleString("en-IN")
}

function formatDate(iso?: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(iso?: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function normalizeMethod(method?: string | null) {
  return method ? METHOD_LABELS[method.toUpperCase()] ?? method : "—"
}

function methodKey(method?: string | null) {
  return method ? method.toUpperCase() : "OTHER"
}

function methodIcon(method?: string | null, className = "h-4 w-4") {
  const key = methodKey(method)
  if (key === "UPI") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} text-[#16A34A]`} fill="currentColor">
        <path d="M14 6V11H18V13H14V18H12V13H8V11H12V6H14Z" />
      </svg>
    )
  }
  if (key === "NETBANKING" || key === "BANK_TRANSFER") return <Landmark className={`${className} text-[#4F46E5]`} />
  if (key === "WALLET" || key === "PAYLATER") return <WalletCards className={`${className} text-[#7C3AED]`} />
  return <CreditCard className={`${className} text-[#2563EB]`} />
}

function methodBg(key: string) {
  if (key === "UPI") return "bg-[#ECFDF3]"
  if (key === "NETBANKING" || key === "BANK_TRANSFER") return "bg-[#EEF2FF]"
  if (key === "WALLET" || key === "PAYLATER") return "bg-[#F5F3FF]"
  return "bg-[#EFF6FF]"
}

function providerLabel(provider?: string | null) {
  if (!provider) return "—"
  if (provider === "RAZORPAY") return "Razorpay"
  if (provider === "UPI_COLLECT") return "Smart Collect"
  return provider
}

function statusLabel(status?: string) {
  return STATUS_LABELS[status ?? ""] ?? status ?? "—"
}

function shortId(id?: string | null) {
  if (!id) return "—"
  return id.length > 10 ? `...${id.slice(-8)}` : id
}

function kitchenName(payment: AdminPaymentRow) {
  return payment.kitchen || "Unknown Kitchen"
}

function isRefundedStatus(status?: string) {
  return status === "REFUNDED" || status === "PARTIAL_REFUND"
}

function withinPeriod(iso: string | undefined, period: string) {
  if (!iso || period === "all") return true
  const date = new Date(iso)
  const now = new Date()
  if (period === "today") {
    return date.toDateString() === now.toDateString()
  }
  if (period === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo
  }
  if (period === "month") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return date >= monthAgo
  }
  return true
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-start gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 mt-4" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-[280px] rounded-lg" />
        <Skeleton className="h-10 w-[140px] rounded-lg" />
        <Skeleton className="h-10 w-[140px] rounded-lg" />
        <Skeleton className="h-10 w-[140px] rounded-lg" />
      </div>
      <div className="rounded-[10px] border border-[#E5E7EB] bg-white overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F5F9] last:border-b-0">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24 flex-1" />
            <Skeleton className="h-3 w-28 flex-1" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-24 flex-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PaymentsClient() {
  const { isLoading, isFetching, refetch } = useAdminPaymentsQuery()
  const payments = useAdminPayments()
  const selectedPayment = useAdminSelectedPayment()
  const { setSelectedPayment } = useAdminPaymentsActions()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [kitchenFilter, setKitchenFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [overviewPeriod, setOverviewPeriod] = useState("week")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("10")

  const kitchens = useMemo(() => {
    const set = new Set<string>()
    payments.forEach((p) => set.add(kitchenName(p)))
    return Array.from(set).sort()
  }, [payments])

  const methods = useMemo(() => {
    const map = new Map<string, string>()
    payments.forEach((p) => map.set(methodKey(p.paymentMethod), normalizeMethod(p.paymentMethod)))
    return Array.from(map.entries())
  }, [payments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (statusFilter !== "all") {
        const matches = statusFilter === "refunded" ? isRefundedStatus(p.status) : p.status === statusFilter
        if (!matches) return false
      }
      if (methodFilter !== "all" && methodKey(p.paymentMethod) !== methodFilter) return false
      if (kitchenFilter !== "all" && kitchenName(p) !== kitchenFilter) return false
      if (periodFilter !== "all" && !withinPeriod(p.createdAt, periodFilter)) return false
      if (q) {
        const haystack = [
          p.orderId,
          p.customer?.name,
          p.customer?.phone,
          kitchenName(p),
          p.providerPaymentId,
          p.providerOrderId,
        ].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [payments, search, statusFilter, methodFilter, kitchenFilter, periodFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / Number(pageSize)))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const size = Number(pageSize)
    return filtered.slice((safePage - 1) * size, safePage * size)
  }, [filtered, safePage, pageSize])

  const stats = useMemo(() => {
    const successful = payments.filter((p) => p.status === "SUCCESS")
    const pending = payments.filter((p) => p.status === "PENDING")
    const failed = payments.filter((p) => p.status === "FAILED")
    const refunded = payments.filter((p) => isRefundedStatus(p.status))
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const refundTotal = payments.reduce((sum, p) => sum + p.refunds.reduce((s, r) => s + (r.amount || 0), 0), 0)
    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      totalAmount,
      refundTotal,
      successRate: payments.length ? Math.round((successful.length / payments.length) * 1000) / 10 : 0,
      pendingPct: payments.length ? Math.round((pending.length / payments.length) * 1000) / 10 : 0,
      failedPct: payments.length ? Math.round((failed.length / payments.length) * 1000) / 10 : 0,
      refundedPct: payments.length ? Math.round((refunded.length / payments.length) * 1000) / 10 : 0,
    }
  }, [payments])

  const overviewData = useMemo(() => {
    const inPeriod = payments.filter((p) => withinPeriod(p.createdAt, overviewPeriod))
    const sumFor = (pred: (s: string | undefined) => boolean) =>
      inPeriod.filter((p) => pred(p.status)).reduce((sum, p) => sum + (p.amount || 0), 0)
    return {
      total: inPeriod.reduce((sum, p) => sum + (p.amount || 0), 0),
      successful: sumFor((s) => s === "SUCCESS"),
      pending: sumFor((s) => s === "PENDING"),
      failed: sumFor((s) => s === "FAILED"),
      refunded: sumFor((s) => isRefundedStatus(s)),
    }
  }, [payments, overviewPeriod])

  const chartData = useMemo(() => {
    return [
      { name: "Successful", value: overviewData.successful, color: CHART_COLORS.Successful },
      { name: "Pending", value: overviewData.pending, color: CHART_COLORS.Pending },
      { name: "Failed", value: overviewData.failed, color: CHART_COLORS.Failed },
      { name: "Refunded", value: overviewData.refunded, color: CHART_COLORS.Refunded },
    ].filter((d) => d.value > 0)
  }, [overviewData])

  const methodStats = useMemo(() => {
    const counts = new Map<string, { count: number; amount: number }>()
    payments.forEach((p) => {
      const key = methodKey(p.paymentMethod)
      const entry = counts.get(key) ?? { count: 0, amount: 0 }
      entry.count += 1
      entry.amount += p.amount || 0
      counts.set(key, entry)
    })
    return Array.from(counts.entries())
      .map(([key, v]) => ({
        key,
        label: METHOD_LABELS[key] ?? key,
        count: v.count,
        amount: v.amount,
        pct: payments.length ? Math.round((v.count / payments.length) * 1000) / 10 : 0,
        color: METHOD_COLORS[key] ?? "#64748B",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [payments])

  const recentRefunds = useMemo(() => {
    return payments
      .filter((p) => p.refunds.length > 0)
      .slice(0, 3)
  }, [payments])

  const exportCSV = () => {
    const header = ["Order ID", "Customer", "Phone", "Kitchen", "Amount", "Method", "Status", "Paid At"]
    const rows = filtered.map((p) => [
      p.orderId,
      p.customer?.name ?? "",
      p.customer?.phone ?? "",
      kitchenName(p),
      p.amount,
      normalizeMethod(p.paymentMethod),
      statusLabel(p.status),
      p.paidAt ?? p.createdAt,
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setMethodFilter("all")
    setKitchenFilter("all")
    setPeriodFilter("all")
    setPage(1)
  }

  const tabCounts = useMemo(() => {
    const successful = payments.filter((p) => p.status === "SUCCESS").length
    const pending = payments.filter((p) => p.status === "PENDING").length
    const failed = payments.filter((p) => p.status === "FAILED").length
    const refunded = payments.filter((p) => isRefundedStatus(p.status)).length
    return { total: payments.length, successful, pending, failed, refunded }
  }, [payments])

  const tabButton = (
    active: boolean,
    label: string,
    count: number,
    hoverClasses: string,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shadow-sm ${
        active ? "bg-[#ECFDF3] border border-[#BBE7C9] text-[#15803D]" : `bg-white border border-[#E2E8F0] text-[#475569] ${hoverClasses}`
      }`}
    >
      {label} <span className={`px-1.5 py-0.5 rounded text-[11px] ${active ? "bg-white/50" : "bg-[#F1F5F9]"}`}>{count.toLocaleString()}</span>
    </button>
  )

  const pageNumbers = useMemo(() => {
    const nums: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i)
      return nums
    }
    nums.push(1)
    if (safePage > 3) nums.push("...")
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) nums.push(i)
    if (safePage < totalPages - 2) nums.push("...")
    nums.push(totalPages)
    return nums
  }, [totalPages, safePage])

  const from = filtered.length === 0 ? 0 : (safePage - 1) * Number(pageSize) + 1
  const to = Math.min(safePage * Number(pageSize), filtered.length)

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Payment Management</h1>
            <p className="text-[#475569] mt-1 text-sm">Track, monitor and manage all payment transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm h-10">
              <Download className="h-4 w-4 text-[#334155]" />
              Export
            </Button>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-[#008A3D] text-white rounded-lg font-medium text-sm hover:bg-[#006B2F] transition-colors shadow-sm h-10 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-start gap-4 h-[120px]">
              <div className="h-11 w-11 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
                <CreditCard className="h-[22px] w-[22px] text-[#16A34A]" strokeWidth={2} />
              </div>
              <div className="flex flex-col h-full justify-between w-full">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Total Transactions</p>
                  <h3 className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{stats.total.toLocaleString()}</h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A] mt-auto">
                  <span className="text-[#64748B] font-normal">{formatINR(stats.totalAmount)} total value</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-start gap-4 h-[120px]">
              <div className="h-11 w-11 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-[22px] w-[22px] text-[#16A34A]" strokeWidth={2} />
              </div>
              <div className="flex flex-col h-full justify-between w-full">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Successful Payments</p>
                  <h3 className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{stats.successful.toLocaleString()}</h3>
                </div>
                <div className="text-[11px] text-[#64748B] mt-auto">
                  {stats.successRate}% success rate
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-start gap-4 h-[120px]">
              <div className="h-11 w-11 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
                <Clock3 className="h-[22px] w-[22px] text-[#F59E0B]" strokeWidth={2} />
              </div>
              <div className="flex flex-col h-full justify-between w-full">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Pending Payments</p>
                  <h3 className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{stats.pending.toLocaleString()}</h3>
                </div>
                <div className="text-[11px] text-[#64748B] mt-auto">
                  {stats.pendingPct}% of total
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-start gap-4 h-[120px]">
              <div className="h-11 w-11 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <CircleX className="h-[22px] w-[22px] text-[#EF4444]" strokeWidth={2} />
              </div>
              <div className="flex flex-col h-full justify-between w-full">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Failed Payments</p>
                  <h3 className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{stats.failed.toLocaleString()}</h3>
                </div>
                <div className="text-[11px] text-[#64748B] mt-auto">
                  {stats.failedPct}% of total
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] p-5 border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-start gap-4 h-[120px]">
              <div className="h-11 w-11 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0">
                <RotateCcw className="h-[22px] w-[22px] text-[#8B5CF6]" strokeWidth={2} />
              </div>
              <div className="flex flex-col h-full justify-between w-full">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Refunds Processed</p>
                  <h3 className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{stats.refunded.toLocaleString()}</h3>
                </div>
                <div className="text-[11px] text-[#64748B] mt-auto">
                  {formatINR(stats.refundTotal)} refunded
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#64748B]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by order ID, customer, payment ID..."
              className="w-full pl-9 pr-4 h-[40px] text-sm text-[#334155] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus-visible:ring-1 focus-visible:ring-[#16A34A] focus-visible:border-[#16A34A] transition-colors shadow-none"
            />
          </div>

          <div className="relative min-w-[140px]">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-sm rounded-lg h-[40px] focus:ring-[#16A34A] font-medium shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="SUCCESS">Successful</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-[140px]">
            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-sm rounded-lg h-[40px] focus:ring-[#16A34A] font-medium shadow-none">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Method: All</SelectItem>
                {methods.map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-[140px]">
            <Select value={kitchenFilter} onValueChange={(v) => { setKitchenFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-sm rounded-lg h-[40px] focus:ring-[#16A34A] font-medium shadow-none">
                <SelectValue placeholder="Kitchen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kitchen: All</SelectItem>
                {kitchens.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-[140px]">
            <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-sm rounded-lg h-[40px] focus:ring-[#16A34A] font-medium shadow-none">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2 px-4 h-[40px] bg-white border border-[#E2E8F0] text-[#475569] rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-none">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col 2xl:flex-row gap-6">

          {/* Left Column - Transactions */}
          <div className="flex-1 min-w-0 flex flex-col space-y-4">

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabButton(statusFilter === "all", "All Transactions", tabCounts.total, "hover:bg-[#F0FDF4] hover:text-[#15803D] hover:border-[#BBE7C9]", () => { setStatusFilter("all"); setPage(1) })}
              {tabButton(statusFilter === "SUCCESS", "Successful", tabCounts.successful, "hover:bg-[#F0FDF4] hover:text-[#15803D] hover:border-[#BBE7C9]", () => { setStatusFilter("SUCCESS"); setPage(1) })}
              {tabButton(statusFilter === "PENDING", "Pending", tabCounts.pending, "hover:bg-[#FFF7ED] hover:text-[#D97706] hover:border-[#FED7AA]", () => { setStatusFilter("PENDING"); setPage(1) })}
              {tabButton(statusFilter === "FAILED", "Failed", tabCounts.failed, "hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FECACA]", () => { setStatusFilter("FAILED"); setPage(1) })}
              {tabButton(statusFilter === "refunded", "Refunded", tabCounts.refunded, "hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:border-[#DDD6FE]", () => { setStatusFilter("refunded"); setPage(1) })}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col flex-1 overflow-hidden">
              {isLoading ? (
                <div className="p-4"><TableSkeleton /></div>
              ) : (
                <>
                  <ScrollArea className="w-full">
                    <Table className="w-full text-left min-w-[950px]">
                      <TableHeader>
                        <TableRow className="bg-white border-b border-[#E5E7EB] hover:bg-transparent">
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Order ID</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Customer</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Kitchen</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Amount</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Method</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Status</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Paid At</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] whitespace-nowrap">Payment ID</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-[#F1F5F9]">
                        {paginated.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="py-14 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <CircleX className="h-8 w-8 text-[#CBD5E1]" />
                                <p className="text-sm font-medium text-[#475569]">No payments found</p>
                                <p className="text-[12px] text-[#94A3B8]">Try adjusting your search or filters</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((p) => {
                            const key = methodKey(p.paymentMethod)
                            return (
                              <TableRow key={p.id} className="hover:bg-[#F8FAFC] transition-colors bg-white">
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 bg-white border border-[#E2E8F0] rounded"><CreditCard className="h-3.5 w-3.5 text-[#64748B]" /></div>
                                    <div>
                                      <p className="text-[13px] font-semibold text-[#0F172A] truncate max-w-[120px]" title={p.orderPublicCode ?? p.orderId}>{p.orderPublicCode ?? shortId(p.orderId)}</p>
                                      <p className="text-[12px] text-[#64748B] mt-0.5">{formatDate(p.createdAt)}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="text-[13px] font-semibold text-[#0F172A]">{p.customer?.name || "—"}</div>
                                  <div className="text-[12px] text-[#475569] mt-0.5">{p.customer?.phone || "—"}</div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                      {(kitchenName(p)).substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-[13px] font-semibold text-[#0F172A]">{kitchenName(p)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="text-[13px] font-semibold text-[#0F172A]">{formatINR(p.amount || 0)}</div>
                                  <div className={`text-[12px] mt-0.5 font-medium ${p.status === "SUCCESS" ? "text-[#15803D]" : p.status === "FAILED" ? "text-[#DC2626]" : p.status === "PENDING" ? "text-[#D97706]" : isRefundedStatus(p.status) ? "text-[#7C3AED]" : "text-[#475569]"}`}>
                                    {statusLabel(p.status)}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full ${methodBg(key)} flex items-center justify-center shrink-0`}>
                                      {methodIcon(p.paymentMethod)}
                                    </div>
                                    <div>
                                      <div className="text-[13px] font-semibold text-[#0F172A]">{normalizeMethod(p.paymentMethod)}</div>
                                      <div className="text-[12px] text-[#475569] mt-0.5">{providerLabel(p.provider)}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <span className={`inline-flex items-center justify-center px-2.5 py-1 border rounded-md text-[11px] font-semibold h-6 ${STATUS_BADGE[p.status ?? ""] ?? DEFAULT_BADGE}`}>
                                    {statusLabel(p.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top text-[12px] text-[#475569]">
                                  <div>{formatDate(p.paidAt ?? p.createdAt)}</div>
                                  <div className="mt-0.5">{formatTime(p.paidAt ?? p.createdAt)}</div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top text-[12px] text-[#475569]">
                                  <div className="truncate max-w-[120px]" title={p.providerPaymentId ?? ""}>{shortId(p.providerPaymentId)}</div>
                                  <div className="mt-0.5 truncate max-w-[120px]" title={p.providerOrderId ?? ""}>{shortId(p.providerOrderId)}</div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="icon" onClick={() => setSelectedPayment(p)} className="h-8 w-8 rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-none">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-none">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {/* Pagination */}
                  <div className="p-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-white mt-auto">
                    <span className="text-[#64748B]">Showing {from} to {to} of {filtered.length.toLocaleString()} transactions</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled={safePage === 1} onClick={() => setPage(Math.max(1, safePage - 1))} className="h-8 w-8 rounded-lg text-[#94A3B8] hover:bg-gray-50 transition-colors shadow-none">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {pageNumbers.map((num, idx) =>
                          num === "..." ? (
                            <span key={`ellipsis-${idx}`} className="text-[#94A3B8] px-1">...</span>
                          ) : (
                            <Button
                              key={num}
                              variant={num === safePage ? "default" : "ghost"}
                              onClick={() => setPage(num)}
                              className={`h-8 w-8 rounded-lg px-0 shadow-none ${num === safePage ? "bg-[#16A34A] hover:bg-[#15803D] text-white font-medium" : "text-[#334155] hover:border-[#E2E8F0] border border-transparent transition-colors"}`}
                            >
                              {num}
                            </Button>
                          )
                        )}
                        <Button variant="ghost" size="icon" disabled={safePage === totalPages} onClick={() => setPage(Math.min(totalPages, safePage + 1))} className="h-8 w-8 rounded-lg text-[#475569] hover:bg-gray-50 transition-colors shadow-none">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative border-l border-[#E2E8F0] pl-4 hidden sm:flex items-center gap-2">
                        <span className="text-[#64748B]">Rows per page</span>
                        <div className="relative w-[70px]">
                          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(1) }}>
                            <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-sm h-8 px-3 font-medium shadow-none">
                              <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="w-full 2xl:w-[340px] shrink-0 flex flex-col gap-5">

            {/* Payment Overview */}
            <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[#0F172A]">Payment Overview</h3>
                <div className="relative w-[110px]">
                  <Select value={overviewPeriod} onValueChange={setOverviewPeriod}>
                    <SelectTrigger className="bg-white border-[#E2E8F0] text-[#475569] text-[13px] h-7 px-2 font-medium shadow-none">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-[130px] h-[130px] shrink-0 flex items-center justify-center">
                  <PieChart width={130} height={130}>
                    <Pie
                      data={chartData.length > 0 ? chartData : EMPTY_PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={65}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {(chartData.length > 0 ? chartData : EMPTY_PIE_DATA).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[15px] font-bold text-[#0F172A] leading-tight mt-1">{formatINR(overviewData.total)}</span>
                    <span className="text-[10px] text-[#64748B]">Total Amount</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2.5">
                  {[
                    { label: "Successful", color: "#16A34A", value: overviewData.successful },
                    { label: "Pending", color: "#F59E0B", value: overviewData.pending },
                    { label: "Failed", color: "#EF4444", value: overviewData.failed },
                    { label: "Refunded", color: "#7C3AED", value: overviewData.refunded },
                  ].map((row) => {
                    const pct = overviewData.total > 0 ? Math.round((row.value / overviewData.total) * 1000) / 10 : 0
                    return (
                      <div key={row.label} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-1.5 text-[#0F172A]">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }}></div>
                          {row.label}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#0F172A]">{formatINR(row.value)}</span>
                          <span className="text-[#64748B] text-[10px]">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Popular Payment Methods */}
            <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-[#0F172A]">Popular Payment Methods</h3>
              </div>

              <div className="space-y-4">
                {methodStats.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8]">No payment data yet</p>
                ) : (
                  methodStats.map((m) => (
                    <div key={m.key} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${methodBg(m.key)} flex items-center justify-center shrink-0`}>
                        {methodIcon(m.key.toLowerCase())}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[#0F172A]">{m.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[12px] font-semibold text-[#0F172A]">{m.count.toLocaleString()}</span>
                            <span className="text-[11px] text-[#64748B]">({m.pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: m.color, width: `${m.pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Refunds */}
            <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0F172A]">Recent Refunds</h3>
                <button className="text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]" onClick={() => { setStatusFilter("refunded"); setPage(1) }}>View All</button>
              </div>

              <div className="space-y-4">
                {recentRefunds.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8]">No refunds yet</p>
                ) : (
                  recentRefunds.map((p, i) => {
                    const refund = p.refunds[0]
                    return (
                      <React.Fragment key={p.id}>
                        {i > 0 && <div className="h-[1px] w-full bg-[#F1F5F9]" />}
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="mt-0.5 p-1.5 bg-white border border-[#E2E8F0] rounded-lg">
                              <CalendarDays className="h-4 w-4 text-[#64748B]" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-[#0F172A]">{p.orderPublicCode ?? shortId(p.orderId)}</p>
                              <p className="text-[11px] text-[#64748B] mt-0.5">{formatDate(refund?.processedAt ?? refund?.initiatedAt ?? p.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[13px] font-bold text-[#0F172A]">{formatINR(refund?.amount ?? p.amount ?? 0)}</span>
                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] rounded text-[10px] font-semibold">
                              {REFUND_STATUS_LABELS[refund?.status ?? ""] ?? refund?.status ?? "Refunded"}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const target = payments.find((p) => p.status === "SUCCESS") ?? payments[0]
                    if (target) setSelectedPayment(target)
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#16A34A] hover:shadow-sm transition-all group text-left"
                >
                  <div className="h-7 w-7 rounded bg-[#ECFDF3] flex items-center justify-center shrink-0">
                    <RotateCcw className="h-3.5 w-3.5 text-[#16A34A]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[#0F172A] leading-tight">Process<br />Refund</span>
                </button>

                <button onClick={exportCSV} className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#F97316] hover:shadow-sm transition-all group text-left">
                  <div className="h-7 w-7 rounded bg-[#FFF7ED] flex items-center justify-center shrink-0">
                    <Download className="h-3.5 w-3.5 text-[#F97316]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[#0F172A] leading-tight">Download<br />Report</span>
                </button>

                <button className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-sm transition-all group text-left">
                  <div className="h-7 w-7 rounded bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[#0F172A] leading-tight">Reconcile<br />Payments</span>
                </button>

                <button className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#7C3AED] hover:shadow-sm transition-all group text-left">
                  <div className="h-7 w-7 rounded bg-[#F5F3FF] flex items-center justify-center shrink-0">
                    <Settings className="h-3.5 w-3.5 text-[#7C3AED]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[#0F172A] leading-tight">Payment<br />Settings</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Payment Details Sheet */}
      <Sheet open={!!selectedPayment} onOpenChange={(open) => { if (!open) setSelectedPayment(null) }}>
        <SheetContent side="right" className="w-full sm:max-w-[460px] p-0 bg-[#FFFFFF] overflow-y-auto">
          {selectedPayment && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Payment Details</h3>
                  <p className="text-[12px] text-[#64748B] mt-0.5">{selectedPayment.id}</p>
                </div>
                <button onClick={() => setSelectedPayment(null)} className="h-8 w-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors">
                  <X className="h-4 w-4 text-[#475569]" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC]">
                <div>
                  <p className="text-[11px] text-[#64748B] font-medium">Amount</p>
                  <p className="text-[22px] font-bold text-[#0F172A] mt-0.5">{formatINR(selectedPayment.amount || 0)}</p>
                </div>
                <span className={`inline-flex items-center justify-center px-2.5 py-1 border rounded-md text-[11px] font-semibold h-6 ${STATUS_BADGE[selectedPayment.status ?? ""] ?? DEFAULT_BADGE}`}>
                  {statusLabel(selectedPayment.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Customer</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{selectedPayment.customer?.name || "—"}</p>
                  <p className="text-[12px] text-[#475569] mt-0.5">{selectedPayment.customer?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Kitchen</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{kitchenName(selectedPayment)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-7 w-7 rounded-full ${methodBg(methodKey(selectedPayment.paymentMethod))} flex items-center justify-center shrink-0`}>
                      {methodIcon(selectedPayment.paymentMethod, "h-3.5 w-3.5")}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F172A]">{normalizeMethod(selectedPayment.paymentMethod)}</p>
                      <p className="text-[11px] text-[#475569]">{providerLabel(selectedPayment.provider)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Order Status</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{selectedPayment.orderStatus || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Created</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{formatDate(selectedPayment.createdAt)}</p>
                  <p className="text-[12px] text-[#475569] mt-0.5">{formatTime(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Paid At</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1">{selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : "—"}</p>
                  <p className="text-[12px] text-[#475569] mt-0.5">{selectedPayment.paidAt ? formatTime(selectedPayment.paidAt) : "Not paid yet"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-[#64748B]">Order ID</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1 break-all">{selectedPayment.orderPublicCode ?? selectedPayment.orderId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-[#64748B]">Payment ID</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1 break-all">{selectedPayment.providerPaymentId || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-[#64748B]">Provider Order ID</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-1 break-all">{selectedPayment.providerOrderId || "—"}</p>
                </div>
              </div>

              {selectedPayment.refunds.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A] mb-3">Refunds</p>
                  <div className="space-y-2">
                    {selectedPayment.refunds.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC]">
                        <div>
                          <p className="text-[12px] font-semibold text-[#0F172A]">{formatINR(r.amount || 0)}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">{formatDate(r.initiatedAt)}</p>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] rounded text-[10px] font-semibold">
                          {REFUND_STATUS_LABELS[r.status ?? ""] ?? r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
