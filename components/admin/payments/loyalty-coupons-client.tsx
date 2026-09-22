"use client"

import { useState, useCallback, useMemo } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
  Plus, Pencil, Trash2, Download, Search, RotateCcw, Coins, ChevronLeft, ChevronRight,
  Lightbulb, Ticket, TicketPercent, CircleCheck, CircleDollarSign,
  ListFilter, Smartphone, CreditCard, WalletCards, Landmark,
  ChartNoAxesColumnIncreasing, Settings2
} from "lucide-react"
import { PieChart, Pie, Cell } from "recharts"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

function getCouponTypeLabel(coupon: LoyaltyCoupon) {
  const name = coupon.name.toLowerCase()
  if (name.includes("upi")) return "UPI"
  if (name.includes("card")) return "CARDS"
  if (name.includes("wallet")) return "WALLET"
  if (name.includes("net") || name.includes("banking")) return "NETBANKING"
  return "ALL"
}

const typeColors: Record<string, { bg: string, border: string, text: string }> = {
  UPI: { bg: "bg-[#F0FDF4]", border: "border-[#DCFCE7]", text: "text-[#15803D]" },
  CARDS: { bg: "bg-[#FFF7ED]", border: "border-[#FED7AA]", text: "text-[#EA580C]" },
  WALLET: { bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]", text: "text-[#2563EB]" },
  NETBANKING: { bg: "bg-[#F5F0FF]", border: "border-[#DDD0FF]", text: "text-[#6D3DE8]" },
  ALL: { bg: "bg-[#ECFEFF]", border: "border-[#CFFAFE]", text: "text-[#0891B2]" },
}

const typeIconColors: Record<string, { bg: string, text: string, icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  UPI: { bg: "bg-[#EAF8EE]", text: "text-[#16A34A]", icon: Smartphone },
  CARDS: { bg: "bg-[#FFF1E6]", text: "text-[#F97316]", icon: CreditCard },
  WALLET: { bg: "bg-[#EAF2FF]", text: "text-[#2563EB]", icon: WalletCards },
  NETBANKING: { bg: "bg-[#F0E9FF]", text: "text-[#6D3DE8]", icon: Landmark },
  ALL: { bg: "bg-[#E7F8FA]", text: "text-[#0F9BA8]", icon: TicketPercent },
}

const chartColors: Record<string, string> = {
  UPI: "#16A34A",
  CARDS: "#F97316",
  WALLET: "#2563EB",
  NETBANKING: "#6D3DE8",
  Others: "#EF3340",
}

const EMPTY_PIE_DATA = [{ label: 'None', points: 1, color: '#F3F4F6' }]

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

function StatsSkeleton() {
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-4 flex items-start gap-3">
          <Skeleton className="h-[52px] w-[52px] rounded-[16px] flex-shrink-0" />
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
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] overflow-hidden animate-pulse">
      <div className="flex items-center gap-8 px-4 py-3.5 border-b border-[#EEF0F3]">
        <Skeleton className="h-2.5 w-28 rounded-md" />
        <Skeleton className="h-2.5 w-12 rounded-md" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 px-4 py-4 border-b border-[#EEF0F3]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-32 rounded-md" />
              <Skeleton className="h-2 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RedemptionOverviewSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-5 animate-pulse">
      <Skeleton className="h-3.5 w-40 rounded-md mb-5" />
      <div className="flex items-center gap-5">
        <Skeleton className="h-[150px] w-[150px] rounded-full flex-shrink-0" />
      </div>
    </div>
  )
}

function SideListSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-5 animate-pulse">
      <Skeleton className="h-3.5 w-44 rounded-md mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

const columnHelper = createColumnHelper<LoyaltyCoupon>()

export default function AdminLoyaltyPointsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL_TYPES")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const { isLoading } = useAdminLoyaltyCouponsQuery()
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

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Coupon Details",
      cell: (info) => {
        const coupon = info.row.original
        const typeLabel = getCouponTypeLabel(coupon)
        const iconData = typeIconColors[typeLabel] || typeIconColors.ALL
        const IconComp = iconData.icon
        return (
          <div className="flex items-center gap-4">
            <div className={cn("h-11 w-11 rounded-[12px] flex items-center justify-center flex-shrink-0", iconData.bg)}>
              <IconComp className={cn("h-5 w-5", iconData.text)} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-bold text-[#111827] text-sm">{coupon.name}</p>
              {coupon.description && (
                <p className="text-[12px] text-[#64748B] font-medium mt-0.5 max-w-[200px] truncate">
                  {coupon.description}
                </p>
              )}
            </div>
          </div>
        )
      }
    }),
    columnHelper.accessor("discountType", {
      header: "Type",
      cell: (info) => {
        const coupon = info.row.original
        const typeLabel = getCouponTypeLabel(coupon)
        const typeClass = typeColors[typeLabel] || typeColors.ALL
        return (
          <span
            className={cn(
              "text-[10px] font-extrabold px-2.5 py-1 rounded-[6px] border",
              typeClass.bg, typeClass.border, typeClass.text
            )}
          >
            {typeLabel}
          </span>
        )
      }
    }),
    columnHelper.accessor("discountValue", {
      header: "Discount",
      cell: (info) => {
        const coupon = info.row.original
        const discountColor = "text-[#16A34A]"
        return (
          <div>
            <p className={cn("text-[13px] font-extrabold", discountColor)}>
              {coupon.discountType === "FLAT"
                ? `₹${coupon.discountValue} FLAT`
                : `${coupon.discountValue}%`}
            </p>
            {coupon.maxDiscount && (
              <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">
                Upto ₹{coupon.maxDiscount}
              </p>
            )}
          </div>
        )
      }
    }),
    columnHelper.accessor("pointsCost", {
      header: "Points Cost",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded-full bg-[#FFFBEB] flex items-center justify-center">
            <CircleDollarSign className="h-3.5 w-3.5 text-[#F59E0B]" strokeWidth={2} />
          </div>
          <span className="font-bold text-[#111827] text-[13px]">
            {info.getValue()}
          </span>
        </div>
      )
    }),
    columnHelper.accessor("minOrderValue", {
      header: "Min Order",
      cell: (info) => (
        <span className="text-[13px] font-semibold text-[#334155]">
          {info.getValue() ? `₹${info.getValue()}` : "—"}
        </span>
      )
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => {
        const coupon = info.row.original
        return (
          <Switch
            checked={coupon.isActive}
            onCheckedChange={(checked) =>
              toggleMutation.mutateAsync({ id: coupon.id, isActive: checked }).catch(() => toast.error("Failed to toggle"))
            }
            disabled={toggleMutation.isPending}
            className={cn(
              "data-[state=checked]:bg-[#16A34A] data-[state=unchecked]:bg-[#CBD5E1]",
              "rounded-[999px]"
            )}
          />
        )
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const coupon = info.row.original
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(coupon)}
              className="h-8 w-8 rounded-[8px] bg-[#FBF9FF] border border-[#E8DEFF] hover:bg-[#F3EDFF] hover:border-[#D8C7FF] flex items-center justify-center text-[#6D3DE8] transition-colors"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this loyalty coupon?"))
                  deleteMutation.mutateAsync(coupon.id).then(() => {
                    toast.success("Coupon deleted")
                  }).catch(() => toast.error("Failed to delete"))
              }}
              disabled={deleteMutation.isPending}
              className="h-8 w-8 rounded-[8px] bg-[#FFFDFD] border border-[#F2D9DC] hover:bg-[#FEF2F2] hover:border-[#FECACA] flex items-center justify-center text-[#EF3340] transition-colors"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        )
      }
    }),
  ], [openEdit, toggleMutation, deleteMutation])

  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter((c) => c.isActive).length

  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.purchaseCount || 0), 0)
  const totalPointsRedeemed = coupons.reduce(
    (sum, c) => sum + (c.pointsCost || 0) * (c.purchaseCount || 0),
    0
  )
  const activePercent = totalCoupons > 0 ? ((activeCoupons / totalCoupons) * 100).toFixed(1) : "0.0"

  const redemptionBreakdown = useMemo(() => {
    const groups = coupons.reduce((acc, c) => {
      const type = getCouponTypeLabel(c)
      acc[type] = (acc[type] || 0) + (c.pointsCost || 0) * (c.purchaseCount || 0)
      return acc
    }, {} as Record<string, number>)
    
    const total = Object.values(groups).reduce((s, v) => s + v, 0)
    
    const orderedLabels = ["UPI", "CARDS", "WALLET", "NETBANKING", "ALL"]
    
    const breakdown = Object.entries(groups)
      .map(([label, value]) => ({
        label: label === "ALL" ? "Others" : label === "CARDS" ? "Cards" : label === "WALLET" ? "Wallet" : label === "NETBANKING" ? "Net Banking" : "UPI",
        points: value,
        percent: total > 0 ? (value / total) * 100 : 0,
        color: chartColors[label] || chartColors.Others,
      }))
      .sort((a, b) => {
        const aOriginal = a.label === "Others" ? "ALL" : a.label === "Cards" ? "CARDS" : a.label === "Wallet" ? "WALLET" : a.label === "Net Banking" ? "NETBANKING" : "UPI"
        const bOriginal = b.label === "Others" ? "ALL" : b.label === "Cards" ? "CARDS" : b.label === "Wallet" ? "WALLET" : b.label === "Net Banking" ? "NETBANKING" : "UPI"
        return orderedLabels.indexOf(aOriginal) - orderedLabels.indexOf(bOriginal)
      })

    return breakdown
  }, [coupons])

  const topCoupons = [...coupons]
    .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
    .slice(0, 3)

  const filtered = useMemo(() => coupons
    .filter((c) => (activeTab === "ALL" ? true : c.isActive))
    .filter((c) =>
      typeFilter === "ALL_TYPES" ? true : c.discountType === typeFilter
    )
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase())
    ), [coupons, activeTab, typeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ), [filtered, currentPage, pageSize])

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 bg-[#FEFEFE] min-h-screen px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 md:pt-6">
        <div className="flex items-center gap-3">
          <div className="h-[52px] w-[52px] rounded-[16px] bg-[#6D3DE8] flex items-center justify-center shadow-[0_4px_12px_rgba(109,61,232,0.18)]">
            <Ticket className="h-[22px] w-[22px] text-[#FFFFFF]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-[#111827]">
              Loyalty Coupons
            </h1>
            <p className="text-[#64748B] text-sm font-medium mt-1">
              Create and manage coupon templates that customers can purchase using loyalty points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-10 rounded-[8px] px-4 text-sm font-semibold text-[#334155] border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] gap-2 shadow-none"
          >
            <Download className="h-4 w-4 text-[#334155]" strokeWidth={1.8} /> Export
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-10 rounded-[8px] px-5 text-sm font-bold bg-[#6D3DE8] hover:bg-[#6132D7] active:bg-[#5428C4] text-[#FFFFFF] gap-2 shadow-[0_4px_12px_rgba(109,61,232,0.18)] border-none"
          >
            <Plus className="h-4 w-4 text-[#FFFFFF]" strokeWidth={2} /> Create New Coupon
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1fr_320px] gap-6">
        {/* Left: Main content */}
        <div className="space-y-6 min-w-0">
          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Coupons",
                  value: totalCoupons,
                  sub: "All coupon templates",
                  tone: "purple",
                  icon: Ticket,
                  iconBg: "bg-[#F0E9FF]",
                  iconColor: "text-[#6D3DE8]",
                  border: "border-[#DDD0FF]"
                },
                {
                  label: "Active Coupons",
                  value: activeCoupons,
                  sub: `${activePercent}% of total`,
                  tone: "emerald",
                  icon: CircleCheck,
                  iconBg: "bg-[#EAF8EE]",
                  iconColor: "text-[#16A34A]",
                  border: "border-[#D8EEDD]"
                },
                {
                  label: "Total Redemptions",
                  value: totalRedemptions.toLocaleString(),
                  sub: "Coupons purchased",
                  tone: "orange",
                  icon: TicketPercent,
                  iconBg: "bg-[#FFF3D8]",
                  iconColor: "text-[#F59E0B]",
                  border: "border-[#FDE7B0]"
                },
                {
                  label: "Points Redeemed",
                  value: totalPointsRedeemed.toLocaleString(),
                  sub: "Across all coupons",
                  tone: "blue",
                  icon: Coins,
                  iconBg: "bg-[#EAF2FF]",
                  iconColor: "text-[#2563EB]",
                  border: "border-[#D4E4FF]"
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={cn("bg-[#FFFFFF] border rounded-[12px] p-4 flex items-start gap-3", card.border)}
                >
                  <div
                    className={cn(
                      "h-[48px] w-[48px] md:h-[52px] md:w-[52px] rounded-[16px] flex items-center justify-center flex-shrink-0",
                      card.iconBg
                    )}
                  >
                    <card.icon className={cn("h-[24px] w-[24px] md:h-[26px] md:w-[26px]", card.iconColor)} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[10px] md:text-[11px] font-semibold text-[#334155] truncate">
                      {card.label}
                    </p>
                    <p className="text-[20px] md:text-[26px] font-extrabold text-[#111827] leading-tight mt-1">
                      {card.value}
                    </p>
                    <p
                      className={cn(
                        "text-[9px] md:text-[10px] font-bold mt-1 truncate",
                        card.tone === "emerald"
                          ? "text-[#16A34A]"
                          : card.tone === "red"
                          ? "text-[#EF3340]"
                          : card.tone === "orange"
                          ? "text-[#F97316]"
                          : card.tone === "blue"
                          ? "text-[#2563EB]"
                          : "text-[#16A34A]"
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
            <div className="relative flex-1 w-full md:max-w-xs group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" strokeWidth={1.8} />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by coupon name or type..."
                className="pl-10 h-10 w-full rounded-[8px] bg-[#FFFFFF] border-[#E2E8F0] text-[#1F2937] placeholder:text-[#94A3B8] text-sm focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6] focus-visible:ring-offset-0 transition-shadow shadow-none hover:bg-[#FAFAFC]"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap w-full md:w-auto items-center gap-3">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-10 w-full md:w-[140px] rounded-[8px] bg-[#FFFFFF] border-[#E2E8F0] text-xs font-semibold text-[#1F2937] hover:bg-[#FAFAFC] hover:border-[#CBD5E1] shadow-none">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TYPES">All Types</SelectItem>
                  <SelectItem value="FLAT">Flat (₹)</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-1 md:flex-none rounded-[8px] bg-[#FFFFFF] border-[#E2E8F0] text-xs font-semibold text-[#334155] gap-2 hover:bg-[#FAFAFC] hover:border-[#CBD5E1] shadow-none"
              >
                <ListFilter className="h-4 w-4 text-[#475569]" strokeWidth={1.8} /> Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-1 md:flex-none rounded-[8px] bg-[#FFFFFF] border-[#E2E8F0] text-xs font-semibold text-[#334155] gap-2 hover:bg-[#FAFAFC] hover:border-[#CBD5E1] shadow-none"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4 text-[#475569]" strokeWidth={1.8} /> Reset
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 border-b border-[#EEF0F3] pb-[1px]">
            {[
              { key: "ALL", label: "All Coupons", count: totalCoupons },
              { key: "ACTIVE", label: "Active", count: activeCoupons },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setCurrentPage(1)
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold transition-all border-b-[2px] whitespace-nowrap",
                  activeTab === tab.key
                    ? tab.key === "ACTIVE"
                      ? "border-[#16A34A] text-[#16A34A] bg-[#F0FDF4] rounded-t-[8px]"
                      : "border-[#6D3DE8] text-[#6D3DE8] bg-[#F8F5FF] rounded-t-[8px]"
                    : "border-transparent text-[#64748B] hover:text-[#334155] bg-transparent"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-[6px] px-2 py-0.5 text-[11px] font-extrabold",
                    activeTab === tab.key
                      ? tab.key === "ACTIVE"
                        ? "bg-[#EAF8EE] text-[#16A34A]"
                        : "bg-[#EEE7FF] text-[#6D3DE8]"
                      : "bg-[#F3F4F6] text-[#64748B]"
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
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] shadow-none w-full">
              <ScrollArea className="w-full">
                <Table className="w-full text-sm">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b border-[#EEF0F3] bg-[#FFFFFF] hover:bg-[#FFFFFF]">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-left py-4 px-5 text-[11px] font-semibold text-[#475569] uppercase tracking-wider h-auto"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
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
                          className="border-b border-[#EEF0F3] hover:bg-[#FAFAFC] transition-colors group"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4 px-5">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center py-16 text-[#94A3B8] text-sm font-medium border-b-0">
                          No coupons found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-t border-[#EEF0F3] bg-[#FFFFFF] gap-4">
                <p className="text-[12px] font-medium text-[#64748B] text-center sm:text-left">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}{" "}
                  coupons
                </p>
                <div className="flex items-center justify-center sm:justify-end gap-1.5 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-[32px] w-[32px] p-0 rounded-[8px] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155]"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
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
                          "h-[32px] w-[32px] p-0 rounded-[8px] text-[13px] font-bold border",
                          currentPage === page
                            ? "bg-[#6D3DE8] text-[#FFFFFF] border-[#6D3DE8] hover:bg-[#6132D7]"
                            : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#F5F0FF] hover:text-[#6D3DE8] hover:border-[#DDD0FF]"
                        )}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-[12px] text-[#94A3B8] px-2 hidden sm:inline">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "h-[32px] w-[32px] p-0 rounded-[8px] text-[13px] font-bold border hidden sm:inline-flex",
                          currentPage === totalPages
                            ? "bg-[#6D3DE8] text-[#FFFFFF] border-[#6D3DE8] hover:bg-[#6132D7]"
                            : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#F5F0FF] hover:text-[#6D3DE8] hover:border-[#DDD0FF]"
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
                    className="h-[32px] w-[32px] p-0 rounded-[8px] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155]"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                  </Button>
                  <div className="ml-2 sm:ml-4 flex items-center gap-2">
                    <span className="text-[12px] text-[#64748B] font-medium hidden sm:inline">Rows per page</span>
                    <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                      <SelectTrigger className="h-[32px] w-[60px] rounded-[8px] bg-[#FFFFFF] border-[#E2E8F0] text-[13px] font-bold text-[#1F2937] shadow-none">
                        <SelectValue placeholder={pageSize} />
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
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6 w-full">
          {/* Redemption Overview */}
          {isLoading ? (
            <RedemptionOverviewSkeleton />
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-6 w-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-bold text-[#111827]">Redemption Overview</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                  <div className="relative flex-shrink-0 w-[150px] h-[150px] mx-auto sm:mx-0">
                    <PieChart width={150} height={150}>
                        <Pie
                          data={redemptionBreakdown.length > 0 ? redemptionBreakdown : EMPTY_PIE_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={0}
                          dataKey="points"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {(redemptionBreakdown.length > 0 ? redemptionBreakdown : EMPTY_PIE_DATA).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[20px] font-bold text-[#111827]">
                        {totalPointsRedeemed.toLocaleString()}
                      </p>
                      <p className="text-[11px] font-medium text-[#64748B] text-center mt-0.5 leading-tight">Points<br/>Redeemed</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3.5 w-full">
                    {redemptionBreakdown.length === 0 ? (
                      <p className="text-[12px] text-[#64748B] font-medium text-center sm:text-left">
                        No redemptions yet
                      </p>
                    ) : (
                      redemptionBreakdown.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-[8px] w-[8px] rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[12px] font-semibold text-[#334155]">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-[#64748B] whitespace-nowrap">
                            <strong className="font-bold text-[#475569] mr-1">{item.points.toLocaleString()}</strong> ({item.percent.toFixed(1)}%)
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Performing Coupons */}
          {isLoading ? (
            <SideListSkeleton />
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-6 w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-bold text-[#111827]">Top Performing Coupons</h2>
              </div>
              
              {topCoupons.length === 0 || topCoupons.every((c) => c.purchaseCount === 0) ? (
                <p className="text-[13px] text-[#64748B] text-center py-4">No redemptions yet</p>
              ) : (
                <div className="flex flex-col">
                  {topCoupons.map((coupon, i) => (
                    <div
                      key={coupon.id}
                      className={cn(
                        "flex items-center justify-between py-3",
                        i !== topCoupons.length - 1 ? "border-b border-[#EEF0F3]" : ""
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div
                          className={cn(
                            "h-[32px] w-[32px] rounded-full flex items-center justify-center text-[#FFFFFF] text-[13px] font-bold flex-shrink-0",
                            i === 0
                              ? "bg-[#16A34A]"
                              : i === 1
                              ? "bg-[#F97316]"
                              : "bg-[#2563EB]"
                          )}
                        >
                          {i + 1}
                        </div>
                        <p className="text-[13px] font-bold text-[#111827] truncate">{coupon.name}</p>
                      </div>
                      <p className="text-[12px] font-medium text-[#475569] whitespace-nowrap flex-shrink-0">
                        {coupon.purchaseCount.toLocaleString()} Redemptions
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-6 w-full">
            <h2 className="text-[15px] font-bold text-[#111827] mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Plus,
                  label: "Create Coupon",
                  desc: "Add new coupon template",
                  bg: "bg-[#FAF7FF]",
                  color: "text-[#6D3DE8]",
                  border: "border-[#E8DDFF]",
                  action: openCreate,
                },
                {
                  icon: ChartNoAxesColumnIncreasing,
                  label: "Analytics",
                  desc: "View performance",
                  bg: "bg-[#FFF9F5]",
                  color: "text-[#F97316]",
                  border: "border-[#F6E4D8]",
                  action: () => {},
                },
                {
                  icon: Download,
                  label: "Export Coupons",
                  desc: "Download coupon list",
                  bg: "bg-[#F6FCF8]",
                  color: "text-[#16A34A]",
                  border: "border-[#DCEFE2]",
                  action: handleExport,
                },
                {
                  icon: Settings2,
                  label: "Points Settings",
                  desc: "Manage points rules",
                  bg: "bg-[#F5F8FF]",
                  color: "text-[#2563EB]",
                  border: "border-[#DDE7FF]",
                  action: () => {},
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-[9px] border transition-all text-center group",
                    action.bg, action.border
                  )}
                >
                  <action.icon className={cn("h-5 w-5 mb-2.5 group-hover:scale-110 transition-transform", action.color)} strokeWidth={1.8} />
                  <p className="text-[13px] font-bold text-[#111827] mb-0.5">{action.label}</p>
                  <p className="text-[10px] font-medium text-[#64748B] leading-tight">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[#FFFDF5] border border-[#F6E8B8] rounded-[10px] p-6 w-full">
            <h3 className="text-[14px] font-bold text-[#111827] mb-4">Tips</h3>
            <div className="bg-[#FFF9E8] border border-[#F7E8B5] rounded-[8px] p-4 flex items-start gap-3 w-full">
              <Lightbulb className="h-[20px] w-[20px] text-[#F59E0B] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-[13px] font-medium text-[#4B5563] leading-relaxed">
                Create attractive offers to encourage customers to spend their loyalty points!
              </p>
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
        <DialogContent className="sm:max-w-lg rounded-[12px] bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#111827]">
              {editingId ? "Edit Loyalty Coupon" : "Create New Loyalty Coupon"}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#64748B]">
              {editingId
                ? "Update the coupon template details"
                : "Add a new coupon template customers can purchase with loyalty points"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 pt-3">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[13px] font-semibold text-[#1F2937]">
                Coupon Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. UPI Flat ₹50 Off"
                {...register("name")}
                className="h-10 rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6] text-[#111827]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[13px] font-semibold text-[#1F2937]">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional short description"
                {...register("description")}
                className="rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6] resize-none text-[#111827]"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discountType" className="text-[13px] font-semibold text-[#1F2937]">
                  Discount Type
                </Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setValue("discountType", v as "FLAT" | "PERCENTAGE")}
                >
                  <SelectTrigger className="h-10 rounded-[8px] border-[#E2E8F0] text-[#111827]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountValue" className="text-[13px] font-semibold text-[#1F2937]">
                  {discountType === "PERCENTAGE" ? "Discount (%) *" : "Discount (₹) *"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50"
                  {...register("discountValue")}
                  className="h-10 rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] text-[#111827]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount" className="text-[13px] font-semibold text-[#1F2937]">
                  Max Discount (₹)
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  {...register("maxDiscount")}
                  className="h-10 rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] text-[#111827]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrderValue" className="text-[13px] font-semibold text-[#1F2937]">
                  Min Order (₹)
                </Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  {...register("minOrderValue")}
                  className="h-10 rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] text-[#111827]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pointsCost" className="text-[13px] font-semibold text-[#1F2937]">
                Points Cost *
              </Label>
              <Input
                id="pointsCost"
                type="number"
                min="1"
                placeholder="e.g. 500"
                {...register("pointsCost")}
                className="h-10 rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#8B5CF6] text-[#111827]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingId(null)
                }}
                className="h-10 rounded-[8px] px-6 text-[14px] font-bold border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 rounded-[8px] px-6 text-[14px] font-bold bg-[#6D3DE8] hover:bg-[#6132D7] active:bg-[#5428C4] text-[#FFFFFF] shadow-[0_4px_12px_rgba(109,61,232,0.18)]"
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