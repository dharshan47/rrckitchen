"use client"

import { useState, useMemo, useCallback } from "react"
import {
  AdminCoupon,
  useAdminCoupons,
  useAdminCouponsQuery,
  useAdminCouponKitchensQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponMutation,
} from "@/stores"
import {
  Search, Download, Plus, Pencil, Trash2, Globe, Store,
  TicketPercent, Ticket, ShoppingCart, Medal, Clock,
  RefreshCw, Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

type Coupon = AdminCoupon

type CouponForm = {
  code: string
  description: string
  discountType: "FLAT" | "PERCENTAGE"
  discountValue: number
  maxDiscount: number
  minOrderValue: number
  scope: "PLATFORM" | "KITCHEN_SPECIFIC"
  kitchenPartnerId: string
  validFrom: string
  validTo: string
  usageLimitTotal: number
  usageLimitPerUser: number
  isActive: boolean
}

function formatDateStr(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
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

const columnHelper = createColumnHelper<Coupon>()

// --- Exact-shape animated skeletons ---

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm h-[100px] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-20 self-end" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-1.5 w-[100px]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-7 w-14" />
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-border/50">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="p-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-5 flex-b border-b border-border/50">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function AdminCouponsPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [pageSize, setPageSize] = useState(10)

  const [formData, setFormData] = useState<CouponForm>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscount: 100,
    minOrderValue: 200,
    scope: "PLATFORM",
    kitchenPartnerId: "",
    validFrom: new Date().toISOString().slice(0, 16),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usageLimitTotal: 1000,
    usageLimitPerUser: 1,
    isActive: true,
  })

  const { isLoading, isFetching, refetch } = useAdminCouponsQuery()
  const coupons = useAdminCoupons()

  const { data: kitchenData = [] } = useAdminCouponKitchensQuery()
  const kitchens = useMemo<{ id: string; name: string | null }[]>(() => (Array.isArray(kitchenData) ? kitchenData : []) as { id: string; name: string | null }[], [kitchenData])

  const createMutation = useCreateCouponMutation()
  const updateMutation = useUpdateCouponMutation()
  const deleteMutation = useDeleteCouponMutation()
  const toggleMutation = useToggleCouponMutation()

  const handleOpenDialog = useCallback((coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description ?? "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount ?? 0,
        minOrderValue: coupon.minOrderValue ?? 0,
        scope: coupon.scope,
        kitchenPartnerId: coupon.kitchenPartnerId ?? "",
        validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
        validTo: new Date(coupon.validTo).toISOString().slice(0, 16),
        usageLimitTotal: coupon.usageLimitTotal ?? 0,
        usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
        isActive: coupon.isActive,
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscount: 100,
        minOrderValue: 200,
        scope: "PLATFORM",
        kitchenPartnerId: "",
        validFrom: new Date().toISOString().slice(0, 16),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        usageLimitTotal: 1000,
        usageLimitPerUser: 1,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }, [])

  const handleSave = () => {
    if (!formData.code.trim()) {
      toast.error("Coupon code is required")
      return
    }
    if (editingCoupon) {
      updateMutation.mutateAsync({ id: editingCoupon.id, data: formData }).then((res) => {
        if (res.success) {
          toast.success("Coupon updated successfully")
          setIsDialogOpen(false)
        } else {
          toast.error(res.error ?? "Failed to update coupon")
        }
      })
    } else {
      createMutation.mutateAsync(formData).then((res) => {
        if (res.success) {
          toast.success("Coupon created successfully")
          setIsDialogOpen(false)
        } else {
          toast.error(res.error ?? "Failed to create coupon")
        }
      })
    }
  }

  const handleDelete = useCallback((coupon: Coupon) => {
    if (confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
      deleteMutation.mutateAsync(coupon.id).then((res) => {
        if (res.success) {
          toast.success("Coupon deleted successfully")
        } else {
          toast.error(res.error ?? "Failed to delete coupon")
        }
      })
    }
  }, [deleteMutation])

  // --- Real stats computed from coupons ---
  const stats = useMemo(() => {
    const now = Date.now()
    const inSevenDays = now + 7 * 24 * 60 * 60 * 1000
    let totalRedemptions = 0
    let activeCount = 0
    let expiringSoon = 0
    for (const c of coupons) {
      totalRedemptions += c.redemptionCount
      if (c.isActive) {
        const from = new Date(c.validFrom).getTime()
        const to = new Date(c.validTo).getTime()
        if (now >= from && now <= to) activeCount += 1
        if (to > now && to <= inSevenDays) expiringSoon += 1
      }
    }
    return { total: coupons.length, active: activeCount, redemptions: totalRedemptions, expiringSoon }
  }, [coupons])

  // --- Filters ---
  const filteredCoupons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const now = Date.now()
    return coupons
      .filter((c) => {
        if (q) {
          const haystack = [c.code, c.description ?? "", c.kitchenName ?? ""].join(" ").toLowerCase()
          if (!haystack.includes(q)) return false
        }
        const from = new Date(c.validFrom).getTime()
        const to = new Date(c.validTo).getTime()
        if (statusFilter === "active" && !(c.isActive && now >= from && now <= to)) return false
        if (statusFilter === "expired" && !(to < now)) return false
        if (statusFilter === "scheduled" && !(from > now)) return false
        if (statusFilter === "inactive" && c.isActive) return false
        if (scopeFilter !== "all" && c.scope !== scopeFilter) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "code") return a.code.localeCompare(b.code)
        if (sortBy === "redemptions") return b.redemptionCount - a.redemptionCount
        if (sortBy === "value") return b.discountValue - a.discountValue
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [coupons, searchQuery, statusFilter, scopeFilter, sortBy])

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
    columnHelper.accessor("code", {
      header: "COUPON CODE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-gray-900 border px-1.5 py-0.5 rounded shadow-sm bg-white tracking-wide">{row.original.code}</span>
          {Date.now() - new Date(row.original.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
            <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 px-1 py-0 h-4 text-[9px] font-semibold rounded-sm">New</Badge>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "details",
      header: "DETAILS",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[150px]">
          <span className="font-semibold text-xs text-gray-900 truncate max-w-[200px]">
            {row.original.discountType === "FLAT" ? `Flat ₹${row.original.discountValue} off` : `${row.original.discountValue}% off`}
            {row.original.description ? ` on ${row.original.description.toLowerCase()}` : " on orders"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {row.original.minOrderValue ? `Min. order ₹${row.original.minOrderValue}` : "No minimum order"}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("scope", {
      header: "SCOPE",
      cell: ({ row }) =>
        row.original.scope === "PLATFORM" ? (
          <div className="flex items-center gap-1.5 border border-green-200 bg-green-50 text-green-700 px-2 h-6 rounded-md w-fit"><Globe className="h-3 w-3" /><span className="text-[10px] font-medium">Platform</span></div>
        ) : (
          <div className="flex items-center gap-1.5 border border-orange-200 bg-orange-50 text-orange-700 px-2 h-6 rounded-md w-fit"><Store className="h-3 w-3" /><span className="text-[10px] font-medium max-w-[100px] truncate">{row.original.kitchenName ?? "Kitchen"}</span></div>
        ),
    }),
    columnHelper.display({
      id: "validity",
      header: "VALIDITY",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-900 font-medium">{formatDateStr(row.original.validFrom)}</span>
          <span className="text-xs text-gray-900 font-medium">{formatDateStr(row.original.validTo)}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "usage",
      header: "USAGE",
      cell: ({ row }) => {
        const limit = row.original.usageLimitTotal ?? 0
        const redemptions = row.original.redemptionCount
        const unlimited = row.original.usageLimitTotal === null
        const pct = unlimited ? 100 : limit > 0 ? Math.min(100, Math.round((redemptions / limit) * 100)) : 0
        return (
          <div className="flex flex-col gap-1.5 w-[100px]">
            <span className="font-semibold text-[11px] text-gray-900 tracking-tight">
              {redemptions} / {unlimited ? "∞" : limit}
            </span>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-700 rounded-full" style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("isActive", {
      header: "STATUS",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) => {
            toggleMutation.mutateAsync({ id: row.original.id, isActive: checked }).then((res) => {
              if (!res.success) toast.error(res.error ?? "Failed to update status")
            })
          }}
          disabled={toggleMutation.isPending}
          className="data-[state=checked]:bg-green-700 scale-75 origin-left"
        />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 text-gray-600 border-gray-200" onClick={() => handleOpenDialog(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 text-red-500 border-red-100 bg-red-50 hover:bg-red-100 hover:text-red-600" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    }),
  ], [handleOpenDialog, handleDelete, toggleMutation])

  const table = useReactTable({
    data: filteredCoupons,
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
    .map((idx) => filteredCoupons[Number(idx)])
    .filter(Boolean) as Coupon[]

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  // --- Sidebar top performers (real) ---
  const topCoupons = useMemo(
    () => [...coupons].sort((a, b) => b.redemptionCount - a.redemptionCount).slice(0, 5),
    [coupons],
  )

  const exportCSV = () => {
    const header = ["Code", "Description", "Discount Type", "Discount Value", "Max Discount", "Min Order", "Scope", "Kitchen", "Valid From", "Valid To", "Limit", "Per User", "Redemptions", "Active"]
    const rows = (selectedCount > 0 ? selectedRows : filteredCoupons).map((c) => [
      c.code,
      c.description ?? "",
      c.discountType,
      String(c.discountValue),
      c.maxDiscount ? String(c.maxDiscount) : "",
      c.minOrderValue ? String(c.minOrderValue) : "",
      c.scope,
      c.kitchenName ?? "",
      formatDateStr(c.validFrom),
      formatDateStr(c.validTo),
      c.usageLimitTotal ? String(c.usageLimitTotal) : "",
      String(c.usageLimitPerUser ?? 1),
      String(c.redemptionCount),
      c.isActive ? "Yes" : "No",
    ])
    downloadCSV("coupons.csv", header, rows)
    toast.success("Coupons exported")
  }

  const filtersActive = searchQuery !== "" || statusFilter !== "all" || scopeFilter !== "all"

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons &amp; Offers</h1>
          <p className="text-sm text-muted-foreground">Create, manage and monitor all coupon campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-sm shadow-sm bg-white h-9" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" className="gap-2 text-sm shadow-sm bg-white h-9" onClick={exportCSV} disabled={isLoading}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2 text-sm shadow-sm bg-green-700 hover:bg-green-800 text-white h-9" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" /> Create Coupon
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: "Total Coupons", value: stats.total.toLocaleString("en-IN"), trend: `${stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% active now` : "No active coupons"}`, trendUp: null, icon: TicketPercent, color: "text-purple-600", bg: "bg-purple-50" },
            { title: "Active Now", value: stats.active.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: Ticket, color: "text-green-600", bg: "bg-green-50" },
            { title: "Total Redemptions", value: stats.redemptions.toLocaleString("en-IN"), trend: `Across ${stats.total} coupons`, trendUp: null, icon: ShoppingCart, color: "text-orange-500", bg: "bg-orange-50" },
            { title: "Expiring Soon", value: stats.expiringSoon.toLocaleString("en-IN"), trend: "Within next 7 days", trendUp: null, icon: Clock, color: "text-red-500", bg: "bg-red-50" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden relative">
              <CardContent className="p-4 flex flex-col h-[100px]">
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold leading-none mt-1">{stat.value}</h3>
                        <span className={`text-[10px] font-medium ${stat.trendUp ? "text-green-600" : "text-muted-foreground"}`}>{stat.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Column */}
        <div className="flex-1 min-w-0">
          {/* Filters & Table */}
          <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[220px] max-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by code or description..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground font-semibold uppercase">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground font-semibold uppercase">Scope</Label>
                  <Select value={scopeFilter} onValueChange={setScopeFilter}>
                    <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="All Scope" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scope</SelectItem>
                      <SelectItem value="PLATFORM">Platform</SelectItem>
                      <SelectItem value="KITCHEN_SPECIFIC">Kitchen Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground font-semibold uppercase">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Recently Created" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Created</SelectItem>
                      <SelectItem value="code">Code (A-Z)</SelectItem>
                      <SelectItem value="redemptions">Most Used</SelectItem>
                      <SelectItem value="value">Highest Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  className="gap-2 h-9 text-xs text-muted-foreground"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setScopeFilter("all")
                    setSortBy("recent")
                    setRowSelection({})
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </div>

            <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-4 border-b border-border/50">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <DataTable table={table} emptyMessage={filtersActive ? "No coupons match your filters" : "No coupons yet"} />
              )}
            </div>

            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
              <p className="text-xs text-muted-foreground">
                Showing {filteredCoupons.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredCoupons.length)} of {filteredCoupons.length.toLocaleString("en-IN")} coupons
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
        <div className="w-full xl:w-[340px] shrink-0 space-y-4">
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <>
              {/* Top Performing Coupons (real) */}
              <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/50">
                  <CardTitle className="text-sm font-bold">Top Performing Coupons</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col">
                  {topCoupons.length === 0 && <div className="p-4 text-xs text-muted-foreground">No coupons yet.</div>}
                  {topCoupons.map((c, i) => (
                    <div key={c.id} className="p-4 flex items-center justify-between border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-4 text-center">
                          {i === 0 ? <Medal className="h-4 w-4 text-yellow-500 fill-yellow-100" /> : <span className="text-xs font-bold text-gray-500">{i + 1}</span>}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{c.code}</span>
                      </div>
                      <span className="text-[11px] font-medium text-green-700">{c.redemptionCount.toLocaleString("en-IN")} redemptions</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions (functional) */}
              <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader className="p-5 pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-purple-100 transition-colors" onClick={exportCSV}>
                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs"><Download className="h-3.5 w-3.5" /> Export Coupons</div>
                    <p className="text-[9px] text-purple-700/80 leading-tight">Download all coupons</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => handleOpenDialog()}>
                    <div className="flex items-center gap-2 text-green-700 font-semibold text-xs"><Plus className="h-3.5 w-3.5" /> New Coupon</div>
                    <p className="text-[9px] text-green-700/80 leading-tight">Create a coupon</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update the details of the coupon campaign." : "Configure a new discount coupon campaign."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Coupon Code</Label>
                <Input
                  placeholder="e.g. SUMMER50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="h-9 text-sm font-semibold uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Scope</Label>
                <Select value={formData.scope} onValueChange={(v) => setFormData({ ...formData, scope: v as "PLATFORM" | "KITCHEN_SPECIFIC" })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">Platform (All Kitchens)</SelectItem>
                    <SelectItem value="KITCHEN_SPECIFIC">Kitchen Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.scope === "KITCHEN_SPECIFIC" && (
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Select Kitchen Partner</Label>
                <Select value={formData.kitchenPartnerId} onValueChange={(v) => setFormData({ ...formData, kitchenPartnerId: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select a kitchen..." /></SelectTrigger>
                  <SelectContent>
                    {kitchens.map((k) => (
                      <SelectItem key={k.id} value={k.id}>{k.name ?? "Unnamed Kitchen"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                placeholder="e.g. 50% off on all pizzas"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Discount Type</Label>
                <Select value={formData.discountType} onValueChange={(v) => setFormData({ ...formData, discountType: v as "FLAT" | "PERCENTAGE" })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Max Discount (₹) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  className="h-9 text-sm"
                  disabled={formData.discountType === "FLAT"}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Min Order Value (₹) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  type="number"
                  value={formData.minOrderValue || ""}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Valid From</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Valid To</Label>
                <Input
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Total Usage Limit <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.usageLimitTotal || ""}
                  onChange={(e) => setFormData({ ...formData, usageLimitTotal: Number(e.target.value) })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Usage Per User <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.usageLimitPerUser || ""}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 p-3 border rounded-lg bg-gray-50/50">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                className="data-[state=checked]:bg-green-700"
              />
              <div className="flex flex-col gap-0.5">
                <Label className="text-sm font-semibold">Coupon is Active</Label>
                <span className="text-[10px] text-muted-foreground">Customers can apply this coupon during checkout.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-9 text-xs">Cancel</Button>
            <Button
              onClick={handleSave}
              className="h-9 text-xs bg-green-700 hover:bg-green-800 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}