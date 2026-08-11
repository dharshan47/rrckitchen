"use client"

import { useState, useMemo, useCallback } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
  Search, Download, Plus, Pencil, Trash2, Globe2, Store,
  TicketPercent, TicketCheck, ShoppingCart, IndianRupee,
  Loader2, CircleCheck, ListFilter,
  Pizza, CakeSlice, Crown, Upload, Files, BarChart3, Lightbulb,
  ChevronLeft, ChevronRight, Clock
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper,
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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

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

// --- Custom Skeletons matching new design ---

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[10px] border border-[#E7EAEE] bg-[#FFFFFF] p-4 h-[100px] flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-start gap-4">
            <Skeleton className="h-[48px] w-[48px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <div className="flex items-end gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
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
          <Skeleton className="h-6 w-28 rounded-md" />
          <div className="space-y-1.5 flex-1 max-w-[200px]">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="space-y-1.5 w-[80px]">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="space-y-1.5 w-[100px]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-[#E7EAEE] bg-[#FFFFFF] overflow-hidden">
        <div className="p-5 border-b border-[#E7EAEE]"><Skeleton className="h-4 w-36" /></div>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[10px] border border-[#E7EAEE] bg-[#FFFFFF] overflow-hidden">
        <div className="p-5 border-b border-[#E7EAEE]"><Skeleton className="h-4 w-32" /></div>
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

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

  const { isLoading } = useAdminCouponsQuery()
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
    const payload = {
      ...formData,
      description: formData.description || null,
      maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : null,
      minOrderValue: formData.minOrderValue > 0 ? formData.minOrderValue : null,
      usageLimitTotal: formData.usageLimitTotal > 0 ? formData.usageLimitTotal : null,
    }
    if (editingCoupon) {
      updateMutation.mutateAsync({ id: editingCoupon.id, data: payload }).then((res) => {
        if (res.success) {
          toast.success("Coupon updated successfully")
          setIsDialogOpen(false)
        } else {
          toast.error(res.error ?? "Failed to update coupon")
        }
      })
    } else {
      createMutation.mutateAsync(payload).then((res) => {
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
    let totalDiscountGiven = 0
    for (const c of coupons) {
      totalRedemptions += c.redemptionCount
      totalDiscountGiven += c.discountGiven
      if (c.isActive) {
        const from = new Date(c.validFrom).getTime()
        const to = new Date(c.validTo).getTime()
        if (now >= from && now <= to) activeCount += 1
        if (to > now && to <= inSevenDays) expiringSoon += 1
      }
    }
    return { total: coupons.length, active: activeCount, redemptions: totalRedemptions, expiringSoon, discount: totalDiscountGiven }
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
            className="h-[15px] w-[15px] rounded-[4px] border-[#CBD5E1] text-white data-[state=checked]:bg-[#087A3E] data-[state=checked]:border-[#087A3E]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="h-[15px] w-[15px] rounded-[4px] border-[#CBD5E1] text-white data-[state=checked]:bg-[#087A3E] data-[state=checked]:border-[#087A3E]"
          />
        </div>
      ),
    }),
    columnHelper.accessor("code", {
      header: "COUPON CODE",
      cell: ({ row }) => {
        const isNew = Date.now() - new Date(row.original.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[11px] md:text-[12px] text-[#087A3E] border border-[#DDE7E1] bg-[#FFFFFF] px-2 py-1 rounded-[6px] tracking-wide">
              {row.original.code}
            </span>
            {isNew && (
              <span className="text-[#7C3AED] bg-[#F4EEFF] border border-[#E4D8FF] px-1.5 py-0.5 text-[10px] md:text-[11px] font-semibold rounded-[5px]">
                New
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: "details",
      header: "DETAILS",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <span className="font-medium text-[12px] md:text-[13px] text-[#344054] truncate max-w-[200px]">
            {row.original.discountType === "FLAT" ? `Flat ₹${row.original.discountValue} off` : `${row.original.discountValue}% off`}
            {row.original.description ? ` on ${row.original.description.toLowerCase()}` : " on orders"}
          </span>
          <span className="text-[11px] md:text-[12px] text-[#667085]">
            {row.original.minOrderValue ? `Min. order ₹${row.original.minOrderValue}` : "No minimum order"}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("scope", {
      header: "SCOPE",
      cell: ({ row }) => {
        if (row.original.scope === "PLATFORM") {
          return (
            <div className="flex items-center gap-1.5 border border-[#D4EDDD] bg-[#EAF7EF] text-[#087A3E] px-2 h-6 rounded-[6px] w-fit">
              <Globe2 className="h-[14px] w-[14px]" />
              <span className="text-[11px] md:text-[12px] font-semibold">Platform</span>
            </div>
          )
        } else {
          // Identify scope loosely via kitchenName
          const kName = (row.original.kitchenName ?? "Kitchen").toLowerCase()
          if (kName.includes("pizza")) {
            return (
              <div className="flex items-center gap-1.5 border border-[#FECACA] bg-[#FFF1F1] text-[#EF4444] px-2 h-6 rounded-[6px] w-fit">
                <Pizza className="h-[14px] w-[14px]" />
                <span className="text-[11px] md:text-[12px] font-semibold max-w-[120px] truncate">{row.original.kitchenName ?? "Kitchen"}</span>
              </div>
            )
          } else if (kName.includes("sweet") || kName.includes("corner")) {
            return (
              <div className="flex items-center gap-1.5 border border-[#FDE68A] bg-[#FFF8E7] text-[#D97706] px-2 h-6 rounded-[6px] w-fit">
                <CakeSlice className="h-[14px] w-[14px]" />
                <span className="text-[11px] md:text-[12px] font-semibold max-w-[120px] truncate">{row.original.kitchenName ?? "Kitchen"}</span>
              </div>
            )
          } else if (kName.includes("foodie") || kName.includes("hub")) {
            return (
              <div className="flex items-center gap-1.5 border border-[#C7DBFF] bg-[#EFF6FF] text-[#2563EB] px-2 h-6 rounded-[6px] w-fit">
                <Store className="h-[14px] w-[14px]" />
                <span className="text-[11px] md:text-[12px] font-semibold max-w-[120px] truncate">{row.original.kitchenName ?? "Kitchen"}</span>
              </div>
            )
          } else {
            return (
              <div className="flex items-center gap-1.5 border border-[#FED7AA] bg-[#FFF4E8] text-[#EA580C] px-2 h-6 rounded-[6px] w-fit">
                <Store className="h-[14px] w-[14px]" />
                <span className="text-[11px] md:text-[12px] font-semibold max-w-[120px] truncate">{row.original.kitchenName ?? "Kitchen"}</span>
              </div>
            )
          }
        }
      },
    }),
    columnHelper.display({
      id: "validity",
      header: "VALIDITY",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-[12px] md:text-[13px] text-[#344054] font-medium">{formatDateStr(row.original.validFrom)}</span>
          <span className="text-[12px] md:text-[13px] text-[#344054] font-medium">{formatDateStr(row.original.validTo)}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "usage",
      header: "USAGE",
      cell: ({ row }) => {
        const limit = row.original.usageLimitTotal ?? 0
        const redemptions = row.original.redemptionCount
        const unlimited = row.original.usageLimitTotal === null || limit === 0
        const pct = unlimited ? 100 : Math.min(100, Math.round((redemptions / limit) * 100))
        return (
          <div className="flex flex-col gap-1 w-[100px]">
            <span className="font-semibold text-[12px] text-[#344054] tracking-tight">
              {redemptions} / {unlimited ? "∞" : limit}
            </span>
            <div className="h-[5px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#087A3E] rounded-full" style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("isActive", {
      header: "STATUS",
      cell: ({ row }) => {
        const isChecked = row.original.isActive
        return (
          <button
            onClick={() => {
              if (toggleMutation.isPending) return
              toggleMutation.mutateAsync({ id: row.original.id, isActive: !isChecked }).then((res) => {
                if (!res.success) toast.error(res.error ?? "Failed to update status")
              })
            }}
            className={cn(
              "relative inline-flex h-[20px] w-[34px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              isChecked ? "bg-[#087A3E]" : "bg-[#D0D5DD]"
            )}
            disabled={toggleMutation.isPending}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-[#FFFFFF] shadow ring-0 transition duration-200 ease-in-out",
                isChecked ? "translate-x-[14px]" : "translate-x-0"
              )}
            />
          </button>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-[7px] text-[#344054] border-[#E2E8F0] hover:bg-[#F5F7F8] bg-[#FFFFFF] shadow-none" 
            onClick={() => handleOpenDialog(row.original)}
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-[7px] text-[#EF4444] border-[#E2E8F0] hover:border-[#FECACA] hover:bg-[#FEF2F2] bg-[#FFFFFF] shadow-none" 
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
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
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length
  const selectedRows = Object.keys(rowSelection)
    .map((idx) => filteredCoupons[Number(idx)])
    .filter(Boolean) as Coupon[]

  const pageSize = pagination.pageSize
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize))
  const currentPage = pagination.pageIndex

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

  return (
    <div className="space-y-6 pb-10 min-h-screen bg-[#FCFCFD] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[24px] font-bold tracking-tight text-[#101828]">Coupons & Offers</h1>
            <div className="hidden sm:flex items-center gap-1.5 bg-[#EAF7EF] text-[#087A3E] px-2.5 py-1 rounded-full">
              <CircleCheck className="h-[14px] w-[14px]" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold">Active offers drive more orders!</span>
            </div>
          </div>
          <p className="text-[13px] text-[#475467]">Create, manage and monitor all coupon campaigns</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            className="gap-2 text-[14px] font-semibold bg-[#087A3E] hover:bg-[#066B36] active:bg-[#055A2D] text-[#FFFFFF] h-10 rounded-[8px] border-none shadow-[0_2px_6px_rgba(8,122,62,0.16)] px-4" 
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 text-[#FFFFFF]" strokeWidth={2.5} /> Create Coupon
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {[
            { title: "Total Coupons", value: stats.total.toLocaleString("en-IN"), trend: `${stats.expiringSoon} expiring in 7 days`, trendUp: null, icon: TicketPercent, iconColor: "text-[#7C3AED]", iconBg: "bg-[#F5F0FF]", svgLine: "#7C3AED", svgArea: "rgba(124,58,237,0.06)" },
            { title: "Active Coupons", value: stats.active.toLocaleString("en-IN"), trend: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`, trendUp: null, icon: TicketCheck, iconColor: "text-[#7C3AED]", iconBg: "bg-[#F5F0FF]", svgLine: "#7C3AED", svgArea: "rgba(124,58,237,0.06)" },
            { title: "Total Redemptions", value: stats.redemptions.toLocaleString("en-IN"), trend: `${stats.total} total campaigns`, trendUp: null, icon: ShoppingCart, iconColor: "text-[#F97316]", iconBg: "bg-[#FFF4E8]", svgLine: "#F97316", svgArea: "rgba(249,115,22,0.06)" },
            { title: "Total Discount Given", value: `₹${stats.discount.toLocaleString("en-IN")}`, trend: stats.redemptions > 0 ? `Avg ₹${Math.round(stats.discount / stats.redemptions)} per redemption` : "No redemptions yet", trendUp: null, icon: IndianRupee, iconColor: "text-[#059669]", iconBg: "bg-[#ECF8F2]", svgLine: "#16A34A", svgArea: "rgba(22,163,74,0.06)" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-none border border-[#E7EAEE] hover:border-[#D0D5DD] transition-colors rounded-[10px] overflow-hidden relative group">
              <CardContent className="p-5 flex flex-col justify-between h-[110px] relative z-10">
                <div className="flex items-start gap-4">
                  <div className={cn("h-[48px] w-[48px] rounded-full flex items-center justify-center shrink-0", stat.iconBg)}>
                    <stat.icon className={cn("h-[22px] w-[22px]", stat.iconColor)} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <p className="text-[13px] font-medium text-[#475467]">{stat.title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-[24px] font-bold leading-none text-[#101828]">{stat.value}</h3>
                      <span className={cn("text-[11px] font-semibold whitespace-nowrap", stat.trendUp ? "text-[#087A3E]" : "text-[#667085]")}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Subtle sparkline simulation via SVG */}
              <div className="absolute bottom-0 left-0 w-full h-[40px] pointer-events-none opacity-80 z-0">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0,40 Q10,25 20,30 T40,20 T60,25 T80,10 T100,5 L100,40 Z" fill={stat.svgArea} />
                  <path d="M0,40 Q10,25 20,30 T40,20 T60,25 T80,10 T100,5" fill="none" stroke={stat.svgLine} strokeWidth="1.5" />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col 2xl:flex-row gap-6 items-start">
        {/* Main Column */}
        <div className="flex-1 min-w-0 w-full">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <div className="relative flex-1 w-full lg:max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-[#344054]" strokeWidth={2} />
              <Input 
                placeholder="Search by code or description..." 
                className="pl-9 h-10 text-[14px] text-[#344054] placeholder:text-[#98A2B3] border-[#E2E8F0] rounded-[7px] focus-visible:ring-[#087A3E] focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:border-[#087A3E]" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider pl-1">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-10 text-[14px] text-[#344054] border-[#E2E8F0] rounded-[7px] focus:ring-0 focus:border-[#087A3E] [&>svg]:text-[#667085] [&>svg]:h-[14px] [&>svg]:w-[14px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
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
                <Label className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider pl-1">Scope</Label>
                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger className="w-[130px] h-10 text-[14px] text-[#344054] border-[#E2E8F0] rounded-[7px] focus:ring-0 focus:border-[#087A3E] [&>svg]:text-[#667085] [&>svg]:h-[14px] [&>svg]:w-[14px]">
                    <SelectValue placeholder="All Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scope</SelectItem>
                    <SelectItem value="PLATFORM">Platform</SelectItem>
                    <SelectItem value="KITCHEN_SPECIFIC">Kitchen Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider pl-1">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-10 text-[14px] text-[#344054] border-[#E2E8F0] rounded-[7px] focus:ring-0 focus:border-[#087A3E] [&>svg]:text-[#667085] [&>svg]:h-[14px] [&>svg]:w-[14px]">
                    <SelectValue placeholder="Recently Created" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Created</SelectItem>
                    <SelectItem value="code">Code (A-Z)</SelectItem>
                    <SelectItem value="redemptions">Most Used</SelectItem>
                    <SelectItem value="value">Highest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 self-end pb-[1px]">
                <Button
                  variant="outline"
                  className="gap-2 h-10 text-[14px] font-medium text-[#344054] border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] shadow-none rounded-[7px] px-4"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setScopeFilter("all")
                    setSortBy("recent")
                    setRowSelection({})
                  }}
                >
                  <ListFilter className="h-4 w-4 text-[#344054]" strokeWidth={2} /> Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EAEE] shadow-none overflow-hidden flex flex-col">
            <ScrollArea className="w-full">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <Table className="min-w-[900px]">
                  <TableHeader className="bg-[#FFFFFF] border-b border-[#EAECF0]">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-0">
                        {headerGroup.headers.map((header) => (
                          <TableHead 
                            key={header.id} 
                            className="h-[44px] text-[11px] font-semibold text-[#344054] uppercase tracking-wider px-4"
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="border-b border-[#F0F2F4] hover:bg-[#FAFCFB] transition-colors group"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4 px-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-[13px] text-[#667085]">
                          {searchQuery || statusFilter !== "all" || scopeFilter !== "all" ? "No coupons match your filters" : "No coupons found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Pagination Footer */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAECF0] bg-[#FFFFFF]">
              <p className="text-[13px] text-[#475467]">
                Showing {filteredCoupons.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredCoupons.length)} of {filteredCoupons.length.toLocaleString("en-IN")} coupons
              </p>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-[6px] border-[#E2E8F0] text-[#475467] hover:bg-[#EFFAF3] hover:text-[#087A3E] hover:border-[#CDEBD8]" 
                  disabled={!table.getCanPreviousPage()} 
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5))
                    const page = start + i
                    return (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 text-[13px] rounded-[6px] border-[#E2E8F0] font-medium",
                          page === currentPage
                            ? "bg-[#087A3E] text-[#FFFFFF] border-[#087A3E] hover:bg-[#066B36] hover:text-[#FFFFFF]"
                            : "text-[#344054] bg-[#FFFFFF] hover:bg-[#EFFAF3] hover:text-[#087A3E] hover:border-[#CDEBD8]"
                        )}
                        onClick={() => table.setPageIndex(page)}
                      >
                        {page + 1}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 3 && <span className="text-[13px] text-[#667085] px-1">...</span>}
                  {totalPages > 5 && currentPage < totalPages - 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-[13px] rounded-[6px] border-[#E2E8F0] text-[#344054] bg-[#FFFFFF] hover:bg-[#EFFAF3] hover:text-[#087A3E] hover:border-[#CDEBD8]"
                      onClick={() => table.setPageIndex(totalPages - 1)}
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-[6px] border-[#E2E8F0] text-[#475467] hover:bg-[#EFFAF3] hover:text-[#087A3E] hover:border-[#CDEBD8]" 
                  disabled={!table.getCanNextPage()} 
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Select value={String(pageSize)} onValueChange={(v) => setPagination({ pageIndex: 0, pageSize: Number(v) })}>
                    <SelectTrigger className="w-[100px] h-8 text-[13px] text-[#344054] border-[#E2E8F0] rounded-[6px] focus:ring-0 focus:border-[#087A3E] [&>svg]:text-[#667085]">
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
        </div>

        {/* Right Sidebar */}
        <div className="w-full 2xl:w-[320px] shrink-0 space-y-4">
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <>
              {/* Top Performing Coupons */}
              <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EAEE] shadow-none flex flex-col p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#101828]">Top Performing Coupons</h3>
                  <Button variant="outline" className="h-7 text-[12px] font-semibold text-[#087A3E] bg-[#FFFFFF] border-[#CDEBD8] hover:bg-[#EFFAF3] rounded-[6px] px-3">
                    View All
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  {topCoupons.length === 0 && <div className="text-[13px] text-[#667085]">No coupons yet.</div>}
                  {topCoupons.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-5 flex justify-center">
                          {i === 0 ? <Crown className="h-4 w-4 text-[#F59E0B] fill-[#FFF8E7]" strokeWidth={2.5} /> :
                           i === 1 ? <Crown className="h-4 w-4 text-[#94A3B8] fill-[#F1F5F9]" strokeWidth={2.5} /> :
                           i === 2 ? <Crown className="h-4 w-4 text-[#F97316] fill-[#FFF4E8]" strokeWidth={2.5} /> :
                           <span className="text-[13px] font-bold text-[#344054]">{i + 1}</span>}
                        </div>
                        <div className="h-7 w-7 rounded-full bg-[#EAF7EF] flex items-center justify-center shrink-0">
                           <Globe2 className="h-3.5 w-3.5 text-[#087A3E]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-bold text-[#101828] uppercase">{c.code}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#087A3E] whitespace-nowrap">{c.redemptionCount.toLocaleString("en-IN")} redemptions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EAEE] shadow-none flex flex-col p-5">
                <h3 className="text-[15px] font-bold text-[#101828] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0FAF4] border border-[#E0F1E5] rounded-[8px] p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-[#E8F7EE] transition-colors">
                    <div className="flex items-center gap-2"><Upload className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={2} /><span className="text-[12px] font-semibold text-[#1F2937]">Bulk Upload</span></div>
                    <p className="text-[10px] text-[#667085] leading-tight">Upload multiple coupons</p>
                  </div>
                  <div className="bg-[#F7F1FF] border border-[#E9DEFF] rounded-[8px] p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-[#F0E6FF] transition-colors" onClick={exportCSV}>
                    <div className="flex items-center gap-2"><Download className="h-[18px] w-[18px] text-[#7C3AED]" strokeWidth={2} /><span className="text-[12px] font-semibold text-[#1F2937]">Export Coupons</span></div>
                    <p className="text-[10px] text-[#667085] leading-tight">Download all coupons</p>
                  </div>
                  <div className="bg-[#FFF6EC] border border-[#FDE5CE] rounded-[8px] p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-[#FFF0E0] transition-colors">
                    <div className="flex items-center gap-2"><Files className="h-[18px] w-[18px] text-[#F97316]" strokeWidth={2} /><span className="text-[12px] font-semibold text-[#1F2937]">Coupon Templates</span></div>
                    <p className="text-[10px] text-[#667085] leading-tight">Use pre-built templates</p>
                  </div>
                  <div className="bg-[#EFF6FF] border border-[#D8E7FF] rounded-[8px] p-3 flex flex-col gap-1.5 cursor-pointer hover:bg-[#E5F0FF] transition-colors">
                    <div className="flex items-center gap-2"><BarChart3 className="h-[18px] w-[18px] text-[#2563EB]" strokeWidth={2} /><span className="text-[12px] font-semibold text-[#1F2937]">Usage Report</span></div>
                    <p className="text-[10px] text-[#667085] leading-tight">View detailed analytics</p>
                  </div>
                </div>
              </div>

              {/* Tips for Better Performance */}
              <div className="bg-[#FFFDF8] rounded-[10px] border border-[#F2E8D5] shadow-none flex flex-col p-5">
                <h3 className="text-[15px] font-bold text-[#101828] mb-4">Tips for Better Performance</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: Lightbulb, title: "Keep your discounts competitive", desc: "Analyze competitor offers regularly" },
                    { icon: ShoppingCart, title: "Set minimum order value", desc: "Encourages higher order value" },
                    { icon: Clock, title: "Promote limited time offers", desc: "Creates urgency and more sales" },
                    { icon: TicketPercent, title: "Use specific coupon codes", desc: "Easier tracking and management" },
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-[8px] bg-[#FFF4D6] flex items-center justify-center shrink-0">
                        <tip.icon className="h-4 w-4 text-[#D97706]" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[13px] font-bold text-[#101828]">{tip.title}</h4>
                        <p className="text-[12px] text-[#667085]">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Dialog (Functionality preserved) */}
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

            <div className="flex items-center gap-3 mt-2 p-3 border rounded-[8px] bg-[#FAFBFC]">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                className="data-[state=checked]:bg-[#087A3E]"
              />
              <div className="flex flex-col gap-0.5">
                <Label className="text-[13px] font-semibold text-[#101828]">Coupon is Active</Label>
                <span className="text-[11px] text-[#667085]">Customers can apply this coupon during checkout.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-[#EAECF0]">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 text-[14px] text-[#344054] border-[#E2E8F0] shadow-none">Cancel</Button>
            <Button
              onClick={handleSave}
              className="h-10 text-[14px] font-semibold bg-[#087A3E] hover:bg-[#066B36] text-[#FFFFFF] shadow-none"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}