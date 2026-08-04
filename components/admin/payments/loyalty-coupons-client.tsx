"use client"

import { useState, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import {
  AdminLoyaltyCoupon,
  useAdminLoyaltyCoupons,
  useAdminLoyaltyCouponsQuery,
  useCreateLoyaltyCouponMutation,
  useUpdateLoyaltyCouponMutation,
  useDeleteLoyaltyCouponMutation,
  useToggleLoyaltyCouponActiveMutation,
} from "@/stores"
import type { DiscountType } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Search,
  RotateCcw,
  Coins,
  ChevronLeft,
  ChevronRight,
  Star,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FormData {
  name: string
  description: string
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: string
  maxDiscount: string
  minOrderValue: string
  pointsCost: string
}

type LoyaltyCoupon = AdminLoyaltyCoupon

const PAGE_SIZE = 10

// Map coupon type to a category label for display
function getCouponTypeLabel(coupon: LoyaltyCoupon) {
  const name = coupon.name.toLowerCase()
  if (name.includes("upi")) return "UPI"
  if (name.includes("card")) return "CARDS"
  if (name.includes("wallet")) return "WALLET"
  if (name.includes("net") || name.includes("banking")) return "NETBANKING"
  return "ALL"
}

const typeColors: Record<string, string> = {
  UPI: "text-violet-600 bg-violet-50 border-violet-200",
  CARDS: "text-orange-600 bg-orange-50 border-orange-200",
  WALLET: "text-teal-600 bg-teal-50 border-teal-200",
  NETBANKING: "text-blue-600 bg-blue-50 border-blue-200",
  ALL: "text-slate-600 bg-slate-100 border-slate-200",
}

const donutColors = ["#7c3aed", "#f97316", "#14b8a6", "#3b82f6", "#ef4444"]

function couponsToCSV(coupons: LoyaltyCoupon[]) {
  const header = ["Name", "Description", "Discount Type", "Discount Value", "Max Discount", "Min Order", "Points Cost", "Active", "Redemptions"]
  const rows = coupons.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.description ?? "").replace(/"/g, '""')}"`,
    c.discountType,
    c.discountValue,
    c.maxDiscount ?? "",
    c.minOrderValue ?? "",
    c.pointsCost,
    c.isActive ? "Yes" : "No",
    c.purchaseCount,
  ])
  return [header, ...rows].map((r) => r.join(",")).join("\n")
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/* ------------------------- Skeleton components ------------------------- */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm"
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 py-0.5">
            <Skeleton className="h-2.5 w-16 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-md" />
            <Skeleton className="h-2 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="flex items-center gap-8 px-4 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="h-2.5 w-28 rounded-md" />
        <Skeleton className="h-2.5 w-12 rounded-md" />
        <Skeleton className="h-2.5 w-16 rounded-md" />
        <Skeleton className="h-2.5 w-16 rounded-md" />
        <Skeleton className="h-2.5 w-16 rounded-md" />
        <Skeleton className="h-2.5 w-12 rounded-md" />
        <Skeleton className="h-2.5 w-14 rounded-md" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-8 px-4 py-4 border-b border-slate-50"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-32 rounded-md" />
              <Skeleton className="h-2 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-16 rounded-md" />
            <Skeleton className="h-2 w-12 rounded-md" />
          </div>
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-5 w-9 rounded-full" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function RedemptionOverviewSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse">
      <Skeleton className="h-3.5 w-40 rounded-md mb-5" />
      <div className="flex items-center gap-5">
        <Skeleton className="h-[130px] w-[130px] rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SideListSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse">
      <Skeleton className="h-3.5 w-44 rounded-md mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 flex-1 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */

export default function AdminLoyaltyPointsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL_TYPES")
  const [currentPage, setCurrentPage] = useState(1)

  const { register, handleSubmit, reset, setValue, control } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      discountType: "FLAT",
      discountValue: "",
      maxDiscount: "",
      minOrderValue: "",
      pointsCost: "",
    },
  })

  const discountType = useWatch({ control, name: "discountType" })

  const { isLoading, refetch } = useAdminLoyaltyCouponsQuery()
  const coupons = useAdminLoyaltyCoupons()

  const createMutation = useCreateLoyaltyCouponMutation()
  const updateMutation = useUpdateLoyaltyCouponMutation()
  const deleteMutation = useDeleteLoyaltyCouponMutation()
  const toggleMutation = useToggleLoyaltyCouponActiveMutation()

  const openCreate = useCallback(() => {
    setEditingId(null)
    reset({
      name: "",
      description: "",
      discountType: "FLAT",
      discountValue: "",
      maxDiscount: "",
      minOrderValue: "",
      pointsCost: "",
    })
    setDialogOpen(true)
  }, [reset])

  const openEdit = useCallback(
    (coupon: LoyaltyCoupon) => {
      setEditingId(coupon.id)
      setValue("name", coupon.name)
      setValue("description", coupon.description ?? "")
      setValue("discountType", coupon.discountType as "FLAT" | "PERCENTAGE")
      setValue("discountValue", String(coupon.discountValue))
      setValue("maxDiscount", coupon.maxDiscount ? String(coupon.maxDiscount) : "")
      setValue("minOrderValue", coupon.minOrderValue ? String(coupon.minOrderValue) : "")
      setValue("pointsCost", String(coupon.pointsCost))
      setDialogOpen(true)
    },
    [setValue]
  )

  const onSubmit = useCallback(
    (formData: FormData) => {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        discountType: formData.discountType as DiscountType,
        discountValue: parseFloat(formData.discountValue) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        pointsCost: parseInt(formData.pointsCost) || 0,
      }
      if (!data.name) { toast.error("Name is required"); return }
      if (data.discountValue <= 0) { toast.error("Discount must be positive"); return }
      if (data.pointsCost <= 0) { toast.error("Points cost must be positive"); return }

      if (editingId) {
        updateMutation.mutateAsync({ id: editingId, data }).then(() => {
          toast.success("Loyalty coupon updated!")
          setDialogOpen(false)
          setEditingId(null)
          reset()
        }).catch((err) =>
          toast.error(err instanceof Error ? err.message : "Failed to update")
        )
      } else {
        createMutation.mutateAsync(data).then(() => {
          toast.success("Loyalty coupon created!")
          setDialogOpen(false)
          reset()
        }).catch((err) =>
          toast.error(err instanceof Error ? err.message : "Failed to create")
        )
      }
    },
    [editingId, createMutation, updateMutation, reset]
  )

  // Derived stats (all real, from purchase counts)
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter((c) => c.isActive).length
  const inactiveCoupons = totalCoupons - activeCoupons
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.purchaseCount, 0)
  const totalPointsRedeemed = coupons.reduce(
    (sum, c) => sum + c.pointsCost * c.purchaseCount,
    0
  )
  const activePercent = totalCoupons > 0 ? ((activeCoupons / totalCoupons) * 100).toFixed(1) : "0.0"

  // Real redemption breakdown per type
  const typeGroups = coupons.reduce((acc, c) => {
    const type = getCouponTypeLabel(c)
    acc[type] = (acc[type] || 0) + c.pointsCost * c.purchaseCount
    return acc
  }, {} as Record<string, number>)
  const typeTotal = Object.values(typeGroups).reduce((s, v) => s + v, 0)
  const redemptionBreakdown = Object.entries(typeGroups)
    .map(([label, value], i) => ({
      label,
      points: value,
      percent: typeTotal > 0 ? (value / typeTotal) * 100 : 0,
      color: donutColors[i % donutColors.length],
    }))
    .sort((a, b) => b.points - a.points)

  // Top performing coupons by real redemptions
  const topCoupons = [...coupons]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 3)

  // Filtering + pagination
  const filtered = coupons
    .filter((c) =>
      activeTab === "ALL"
        ? true
        : activeTab === "ACTIVE"
        ? c.isActive
        : !c.isActive
    )
    .filter((c) =>
      typeFilter === "ALL_TYPES" ? true : c.discountType === typeFilter
    )
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase())
    )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No coupons to export")
      return
    }
    downloadCSV("loyalty-coupons.csv", couponsToCSV(filtered))
    toast.success(`${filtered.length} coupons exported`)
  }

  const resetFilters = useCallback(() => {
    setSearch("")
    setActiveTab("ALL")
    setTypeFilter("ALL_TYPES")
    setCurrentPage(1)
  }, [])

  // SVG Donut chart
  const RADIUS = 52
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const donutSegments = redemptionBreakdown.map((d, i) => {
    const dash = (d.percent / 100) * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const offset = redemptionBreakdown
      .slice(0, i)
      .reduce((sum, prev) => sum + (prev.percent / 100) * CIRCUMFERENCE, 0)
    return { ...d, dash, gap, offset }
  })

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Star className="h-5 w-5 text-violet-600 fill-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Loyalty Coupons
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Create and manage coupon templates that customers can purchase using loyalty points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-700 border-slate-200 gap-2"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-10 rounded-xl px-4 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm shadow-violet-200"
          >
            <Plus className="h-4 w-4" /> Create New Coupon
          </Button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        {/* Left: Main content */}
        <div className="space-y-6 min-w-0">
          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {
                  label: "Total Coupons",
                  value: totalCoupons,
                  sub: `${activeCoupons} active now`,
                  tone: "slate",
                  icon: Gift,
                  iconBg: "bg-violet-50",
                  iconColor: "text-violet-600",
                },
                {
                  label: "Active Coupons",
                  value: activeCoupons,
                  sub: `${activePercent}% of total`,
                  tone: "emerald",
                  icon: CheckCircle2,
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-600",
                },
                {
                  label: "Redemptions",
                  value: totalRedemptions.toLocaleString(),
                  sub: "Purchases made",
                  tone: "slate",
                  icon: Clock,
                  iconBg: "bg-orange-50",
                  iconColor: "text-orange-500",
                },
                {
                  label: "Expired / Inactive",
                  value: inactiveCoupons,
                  sub: "Needs renewal",
                  tone: "red",
                  icon: XCircle,
                  iconBg: "bg-red-50",
                  iconColor: "text-red-500",
                },
                {
                  label: "Points Redeemed",
                  value: totalPointsRedeemed.toLocaleString(),
                  sub: "Across all coupons",
                  tone: "slate",
                  icon: Coins,
                  iconBg: "bg-amber-50",
                  iconColor: "text-amber-500",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      card.iconBg
                    )}
                  >
                    <card.icon className={cn("h-5 w-5", card.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      {card.label}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900 leading-tight">
                      {card.value}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] font-semibold mt-0.5",
                        card.tone === "emerald"
                          ? "text-emerald-600"
                          : card.tone === "red"
                          ? "text-red-500"
                          : "text-slate-400"
                      )}
                    >
                      {card.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by coupon name or type..."
                className="pl-10 h-10 rounded-xl border-slate-200 text-sm font-medium"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="h-10 w-[155px] rounded-xl border-slate-200 text-xs font-semibold">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TYPES">All Types</SelectItem>
                <SelectItem value="FLAT">Flat (₹)</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl text-xs font-semibold text-slate-500 gap-1.5 hover:bg-slate-100"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
            {[
              { key: "ALL", label: "All Coupons", count: coupons.length },
              { key: "ACTIVE", label: "Active", count: activeCoupons },
              { key: "INACTIVE", label: "Expired / Inactive", count: inactiveCoupons },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setCurrentPage(1)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2",
                  activeTab === tab.key
                    ? tab.key === "ACTIVE"
                      ? "border-emerald-500 text-emerald-700"
                      : tab.key === "INACTIVE"
                      ? "border-red-400 text-red-600"
                      : "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                    activeTab === tab.key
                      ? tab.key === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : tab.key === "INACTIVE"
                        ? "bg-red-100 text-red-600"
                        : "bg-violet-100 text-violet-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isLoading ? "..." : tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40">
                      {["Coupon Details", "Type", "Discount", "Points Cost", "Min Order", "Status", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-medium">
                          No coupons found
                        </td>
                      </tr>
                    ) : (
                      paginated.map((coupon) => {
                        const typeLabel = getCouponTypeLabel(coupon)
                        const typeClass = typeColors[typeLabel] || typeColors.ALL
                        return (
                          <tr
                            key={coupon.id}
                            className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                  <Coins className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs">{coupon.name}</p>
                                  {coupon.description && (
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[180px] truncate">
                                      {coupon.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={cn(
                                  "text-[10px] font-extrabold px-2.5 py-1 rounded border",
                                  typeClass
                                )}
                              >
                                {typeLabel}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-extrabold text-emerald-700">
                                {coupon.discountType === "FLAT"
                                  ? `₹${coupon.discountValue} FLAT`
                                  : `${coupon.discountValue}%`}
                              </p>
                              {coupon.maxDiscount && (
                                <p className="text-[10px] font-medium text-slate-400">
                                  Upto ₹{coupon.maxDiscount}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Coins className="h-3 w-3 text-amber-600" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm">
                                  {coupon.pointsCost}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-semibold text-slate-700">
                                {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "—"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Switch
                                checked={coupon.isActive}
                                onCheckedChange={(checked) =>
                                  toggleMutation.mutateAsync({ id: coupon.id, isActive: checked }).catch(() => toast.error("Failed to toggle"))
                                }
                                disabled={toggleMutation.isPending}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEdit(coupon)}
                                  className="h-7 w-7 rounded-lg hover:bg-violet-50 flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this loyalty coupon?"))
                                      deleteMutation.mutateAsync(coupon.id).then(() => {
                                        toast.success("Coupon deleted")
                                      }).catch(() => toast.error("Failed to delete"))
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs font-medium text-slate-500">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
                  coupons
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
                    const page = start + i
                    return (
                      <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-xs font-bold",
                          currentPage === page
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-xs text-slate-400 px-1">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-xs font-bold",
                          currentPage === totalPages
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="ml-3 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Rows per page</span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {PAGE_SIZE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Redemption Overview */}
          {isLoading ? (
            <RedemptionOverviewSkeleton />
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-sm font-extrabold text-slate-900">Redemption Overview</h2>
              </div>

              {/* Donut Chart */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                    {donutSegments.map((seg, i) => (
                      <circle
                        key={i}
                        cx="65"
                        cy="65"
                        r={RADIUS}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={`${seg.dash} ${seg.gap}`}
                        strokeDashoffset={-seg.offset}
                        strokeLinecap="butt"
                        transform="rotate(-90 65 65)"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg font-extrabold text-slate-900">
                      {totalPointsRedeemed.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">Points{"\n"}Redeemed</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {redemptionBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">
                      No redemptions yet
                    </p>
                  ) : (
                    redemptionBreakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] font-semibold text-slate-700 truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                          {item.points.toLocaleString()} ({item.percent.toFixed(1)}%)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top Performing Coupons */}
          {isLoading ? (
            <SideListSkeleton />
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-sm font-extrabold text-slate-900">Top Performing Coupons</h2>
              </div>
              {topCoupons.length === 0 || topCoupons.every((c) => c.purchaseCount === 0) ? (
                <p className="text-sm text-slate-400 text-center py-4">No redemptions yet</p>
              ) : (
                <div className="space-y-3">
                  {topCoupons.map((coupon, i) => (
                    <div
                      key={coupon.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0",
                          i === 0
                            ? "bg-emerald-500"
                            : i === 1
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{coupon.name}</p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        {coupon.purchaseCount.toLocaleString()} Redemptions
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Plus,
                  label: "Create Coupon",
                  desc: "Add new coupon template",
                  bg: "bg-violet-50",
                  color: "text-violet-600",
                  action: openCreate,
                },
                {
                  icon: Download,
                  label: "Export Coupons",
                  desc: "Download coupon list",
                  bg: "bg-emerald-50",
                  color: "text-emerald-600",
                  action: handleExport,
                },
                {
                  icon: RotateCcw,
                  label: "Reset Filters",
                  desc: "Clear search & filters",
                  bg: "bg-orange-50",
                  color: "text-orange-500",
                  action: resetFilters,
                },
                {
                  icon: RefreshCw,
                  label: "Refresh Data",
                  desc: "Reload from backend",
                  bg: "bg-blue-50",
                  color: "text-blue-600",
                  action: () => refetch(),
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      action.bg
                    )}
                  >
                    <action.icon className={cn("h-4 w-4", action.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{action.label}</p>
                    <p className="text-[10px] font-medium text-slate-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-amber-900 mb-1">Tips</h3>
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                  Create attractive offers to encourage customers to spend their loyalty points!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false)
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {editingId ? "Edit Loyalty Coupon" : "Create New Loyalty Coupon"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingId
                ? "Update the coupon template details"
                : "Add a new coupon template customers can purchase with loyalty points"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                Coupon Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. UPI Flat ₹50 Off"
                {...register("name")}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional short description"
                {...register("description")}
                className="rounded-xl border-slate-200 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discountType" className="text-xs font-bold text-slate-700">
                  Discount Type
                </Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setValue("discountType", v as "FLAT" | "PERCENTAGE")}
                >
                  <SelectTrigger className="h-10 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountValue" className="text-xs font-bold text-slate-700">
                  {discountType === "PERCENTAGE" ? "Discount (%) *" : "Discount (₹) *"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50"
                  {...register("discountValue")}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount" className="text-xs font-bold text-slate-700">
                  Max Discount (₹)
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  {...register("maxDiscount")}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrderValue" className="text-xs font-bold text-slate-700">
                  Min Order (₹)
                </Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  {...register("minOrderValue")}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pointsCost" className="text-xs font-bold text-slate-700">
                Points Cost *
              </Label>
              <Input
                id="pointsCost"
                type="number"
                min="1"
                placeholder="e.g. 500"
                {...register("pointsCost")}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingId(null)
                }}
                className="h-10 rounded-xl px-5 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 rounded-xl px-6 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}