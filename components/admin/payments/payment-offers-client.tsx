"use client"

import React, { useMemo, useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Settings,
  Lightbulb,
  CreditCard,
  Wallet,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Tag,
  TicketPercent,
  BadgePercent,
  Clock3,
  ShieldCheck,
  ChartNoAxesColumnIncreasing,
  X,
} from "lucide-react"
import { PieChart, Pie, Cell } from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminPaymentOffersQuery,
  useAdminPaymentOffers,
  useCreatePaymentOfferMutation,
  useUpdatePaymentOfferMutation,
  useDeletePaymentOfferMutation,
  type AdminPaymentOffer,
} from "@/stores/adminPaymentOffersStore"
import { cn } from "@/lib/utils"

type OfferStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "INACTIVE"

const METHOD_META: Record<string, { label: string; badge: string; avatar: string; color: string; avatarBg: string }> = {
  UPI: {
    label: "UPI",
    badge: "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]",
    avatar: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
    color: "#16A34A",
    avatarBg: "bg-[#F0FDF4]",
  },
  WALLET: {
    label: "Wallet",
    badge: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]",
    avatar: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]",
    color: "#2563EB",
    avatarBg: "bg-[#EFF6FF]",
  },
  CARDS: {
    label: "Cards",
    badge: "bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]",
    avatar: "bg-[#FFF7ED] text-[#F97316] border-[#FED7AA]",
    color: "#F97316",
    avatarBg: "bg-[#FFF7ED]",
  },
  NETBANKING: {
    label: "Net Banking",
    badge: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
    avatar: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
    color: "#7C3AED",
    avatarBg: "bg-[#F5F3FF]",
  },
  ALL: {
    label: "All Methods",
    badge: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
    avatar: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
    color: "#64748B",
    avatarBg: "bg-[#F8FAFC]",
  },
}

const STATUS_META: Record<OfferStatus, { label: string; badge: string; dot: string }> = {
  ACTIVE: {
    label: "Active",
    badge: "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]",
    dot: "bg-[#16A34A]",
  },
  UPCOMING: {
    label: "Upcoming",
    badge: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    dot: "bg-[#F59E0B]",
  },
  EXPIRED: {
    label: "Expired",
    badge: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
    dot: "bg-[#EF4444]",
  },
  INACTIVE: {
    label: "Inactive",
    badge: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
    dot: "bg-[#94A3B8]",
  },
}

function formatDate(iso?: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatINR(value: number | null | undefined) {
  if (value == null) return "—"
  return "₹" + value.toLocaleString("en-IN")
}

function offerStatus(o: AdminPaymentOffer): OfferStatus {
  if (!o.isActive) return "INACTIVE"
  const now = new Date()
  if (new Date(o.validTo) < now) return "EXPIRED"
  if (new Date(o.validFrom) > now) return "UPCOMING"
  return "ACTIVE"
}

function methodIcon(type: AdminPaymentOffer["offerType"], className = "h-4 w-4") {
  if (type === "UPI") {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "text-[#16A34A]")} fill="currentColor">
        <path d="M14 6V11H18V13H14V18H12V13H8V11H12V6H14Z" />
      </svg>
    )
  }
  if (type === "WALLET") return <Wallet className={cn(className, "text-[#2563EB]")} />
  if (type === "CARDS") return <CreditCard className={cn(className, "text-[#F97316]")} />
  if (type === "NETBANKING") return <Landmark className={cn(className, "text-[#7C3AED]")} />
  return <Tag className={cn(className, "text-[#475569]")} />
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[12px] p-4 border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-4">
            <Skeleton className="h-[44px] w-[44px] rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-28 mt-4" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-[38px] flex-1 min-w-[280px] rounded-[7px]" />
        <Skeleton className="h-[38px] w-[130px] rounded-[7px]" />
        <Skeleton className="h-[38px] w-[120px] rounded-[7px]" />
        <Skeleton className="h-[38px] w-[130px] rounded-[7px]" />
      </div>
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F5F9] last:border-b-0">
            <Skeleton className="h-3 w-28 flex-[2]" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-[76px]" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface OfferFormState {
  name: string
  description: string
  offerType: AdminPaymentOffer["offerType"]
  discountType: AdminPaymentOffer["discountType"]
  discountValue: string
  maxDiscount: string
  minOrderValue: string
  validFrom: string
  validTo: string
  isActive: boolean
}

const EMPTY_FORM: OfferFormState = {
  name: "",
  description: "",
  offerType: "ALL",
  discountType: "FLAT",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "",
  validFrom: "",
  validTo: "",
  isActive: true,
}

function OfferFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: AdminPaymentOffer | null
}) {
  const createMutation = useCreatePaymentOfferMutation()
  const updateMutation = useUpdatePaymentOfferMutation()
  const [form, setForm] = useState<OfferFormState>(() =>
    editing
      ? {
          name: editing.name,
          description: editing.description ?? "",
          offerType: editing.offerType,
          discountType: editing.discountType,
          discountValue: String(editing.discountValue),
          maxDiscount: editing.maxDiscount != null ? String(editing.maxDiscount) : "",
          minOrderValue: editing.minOrderValue != null ? String(editing.minOrderValue) : "",
          validFrom: toLocalInputValue(editing.validFrom),
          validTo: toLocalInputValue(editing.validTo),
          isActive: editing.isActive,
        }
      : EMPTY_FORM
  )
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof OfferFormState>(key: K, value: OfferFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Offer name is required")
      return
    }
    const discountValue = Number(form.discountValue)
    if (!discountValue || discountValue <= 0) {
      toast.error("Enter a valid discount value")
      return
    }
    if (!form.validFrom || !form.validTo) {
      toast.error("Validity dates are required")
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      offerType: form.offerType,
      discountType: form.discountType,
      discountValue,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
      validFrom: form.validFrom,
      validTo: form.validTo,
      isActive: form.isActive,
    }

    setSubmitting(true)
    try {
      const result = editing
        ? await updateMutation.mutateAsync({ id: editing.id, data: payload })
        : await createMutation.mutateAsync(payload)
      if (result?.success) {
        toast.success(editing ? "Offer updated successfully" : "Offer created successfully")
        onOpenChange(false)
      } else {
        toast.error(result?.error ?? "Something went wrong")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-[#0F172A]">
              {editing ? "Edit Payment Offer" : "Create New Offer"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#64748B]">
              {editing ? "Update the offer details below" : "Fill in the offer details to boost conversions"}
            </DialogDescription>
          </DialogHeader>
          <button onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors shrink-0">
            <X className="h-4 w-4 text-[#475569]" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[65vh] overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#334155]">Offer Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. UPI Flat ₹50 Off"
              className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#334155]">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short description shown to customers"
              rows={2}
              className="text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Offer Type</Label>
              <Select value={form.offerType} onValueChange={(v) => set("offerType", v as AdminPaymentOffer["offerType"])}>
                <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-[13px] h-[38px] rounded-[7px] focus:ring-[#FF6B00] font-medium shadow-none">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="WALLET">Wallet</SelectItem>
                  <SelectItem value="CARDS">Cards</SelectItem>
                  <SelectItem value="NETBANKING">Net Banking</SelectItem>
                  <SelectItem value="ALL">All Methods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Discount Type</Label>
              <Select value={form.discountType} onValueChange={(v) => set("discountType", v as AdminPaymentOffer["discountType"])}>
                <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-[13px] h-[38px] rounded-[7px] focus:ring-[#FF6B00] font-medium shadow-none">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Discount</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">
                {form.discountType === "FLAT" ? "Discount Amount (₹)" : "Discount (%)"}
              </Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "FLAT" ? "e.g. 50" : "e.g. 10"}
                className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Max Discount (₹)</Label>
              <Input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => set("maxDiscount", e.target.value)}
                placeholder="Optional"
                className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Min Order Value (₹)</Label>
              <Input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => set("minOrderValue", e.target.value)}
                placeholder="Optional"
                className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Valid From</Label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => set("validFrom", e.target.value)}
                className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#334155]">Valid To</Label>
              <Input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => set("validTo", e.target.value)}
                className="h-[38px] text-[13px] rounded-[7px] border-[#E2E8F0] focus-visible:ring-[#FF6B00]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC]">
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">Active Offer</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Offer is immediately live once created</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0] gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-[38px] px-4 rounded-[7px] text-[13px] font-medium border-[#E2E8F0] text-[#475569] hover:bg-gray-50 bg-white shadow-none">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="h-[38px] px-4 rounded-[7px] text-[13px] font-medium bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-none">
            {submitting ? "Saving..." : editing ? "Save Changes" : "Create Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PaymentOffersClient() {
  const { isLoading, isFetching } = useAdminPaymentOffersQuery()
  const offers = useAdminPaymentOffers()
  const deleteMutation = useDeletePaymentOfferMutation()

  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("10")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPaymentOffer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPaymentOffer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const stats = useMemo(() => {
    const counts: Record<OfferStatus, number> = { ACTIVE: 0, UPCOMING: 0, EXPIRED: 0, INACTIVE: 0 }
    offers.forEach((o) => counts[offerStatus(o)]++)
    return { total: offers.length, ...counts }
  }, [offers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return offers.filter((o) => {
      if (methodFilter !== "all" && o.offerType !== methodFilter) return false
      if (statusFilter !== "all" && offerStatus(o) !== statusFilter) return false
      if (typeFilter !== "all" && o.discountType !== typeFilter) return false
      if (q) {
        const haystack = `${o.name} ${o.description ?? ""} ${METHOD_META[o.offerType]?.label ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [offers, search, methodFilter, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / Number(pageSize)))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const size = Number(pageSize)
    return filtered.slice((safePage - 1) * size, safePage * size)
  }, [filtered, safePage, pageSize])

  const methodStats = useMemo(() => {
    const counts = new Map<AdminPaymentOffer["offerType"], number>()
    offers.forEach((o) => counts.set(o.offerType, (counts.get(o.offerType) ?? 0) + 1))
    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        label: METHOD_META[type]?.label ?? type,
        count,
        pct: offers.length ? Math.round((count / offers.length) * 1000) / 10 : 0,
        color: METHOD_META[type]?.color ?? "#64748B",
      }))
      .sort((a, b) => b.count - a.count)
  }, [offers])

  const chartData = useMemo(
    () =>
      methodStats.map((m) => ({
        name: m.label,
        value: m.count,
        color: m.color,
      })),
    [methodStats]
  )

  const recentOffers = useMemo(() => offers.slice(0, 3), [offers])

  const exportCSV = () => {
    const header = ["Name", "Description", "Method", "Discount Type", "Discount Value", "Max Discount", "Min Order", "Valid From", "Valid To", "Status"]
    const rows = filtered.map((o) => [
      o.name,
      o.description ?? "",
      METHOD_META[o.offerType]?.label ?? o.offerType,
      o.discountType,
      o.discountValue,
      o.maxDiscount ?? "",
      o.minOrderValue ?? "",
      o.validFrom,
      o.validTo,
      STATUS_META[offerStatus(o)].label,
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-offers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setSearch("")
    setMethodFilter("all")
    setStatusFilter("all")
    setTypeFilter("all")
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (offer: AdminPaymentOffer) => {
    setEditing(offer)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteMutation.mutateAsync(deleteTarget.id)
      if (result?.success) {
        toast.success("Offer deleted successfully")
      } else {
        toast.error(result?.error ?? "Failed to delete offer")
      }
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const tabButton = (
    active: boolean,
    label: string,
    count: number,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 py-2 px-2 text-[13px] font-bold whitespace-nowrap transition-colors rounded-t-md",
        active ? "text-[#15803D] border-b-2 border-[#16A34A] bg-[#F0FDF4]" : "text-[#475569] font-semibold hover:text-[#0F172A]"
      )}
    >
      {label} <Badge variant="secondary" className={cn("px-1.5 py-0 rounded text-[11px] border-none font-bold", active ? "bg-[#16A34A]/20 text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]")}>{count}</Badge>
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

  const KPI_ICONS = [
    { title: "Total Offers", icon: TicketPercent, bg: "bg-[#F0FDF4]", color: "text-[#16A34A]", value: stats.total, sub: "All active & inactive", subColor: "text-[#16A34A]" },
    { title: "Active Offers", icon: ShieldCheck, bg: "bg-[#EFF6FF]", color: "text-[#2563EB]", value: stats.ACTIVE, sub: `${offers.length ? Math.round((stats.ACTIVE / offers.length) * 1000) / 10 : 0}% of total`, subColor: "text-[#2563EB]" },
    { title: "Upcoming Offers", icon: Clock3, bg: "bg-[#FFFBEB]", color: "text-[#F59E0B]", value: stats.UPCOMING, sub: "Starts soon", subColor: "text-[#F97316]" },
    { title: "Expired Offers", icon: BadgePercent, bg: "bg-[#FEF2F2]", color: "text-[#EF4444]", value: stats.EXPIRED, sub: "Need renewal", subColor: "text-[#EF4444]" },
    { title: "Inactive Offers", icon: Tag, bg: "bg-[#F8FAFC]", color: "text-[#475569]", value: stats.INACTIVE, sub: "Paused or disabled", subColor: "text-[#64748B]" },
  ]

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] leading-tight">Payment Offers Management</h1>
            <p className="text-[#475569] mt-1 text-[13px]">Create and manage payment method offers to boost conversions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2 px-4 h-[40px] bg-white border border-[#E2E8F0] text-[#0F172A] rounded-[7px] font-medium text-[13px] hover:bg-gray-50 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <Download className="h-[16px] w-[16px] text-[#0F172A]" />
              Export Offers
            </Button>
            <Button onClick={openCreate} disabled={isFetching} className="flex items-center gap-2 px-4 h-[40px] bg-[#FF6B00] text-white rounded-[7px] font-medium text-[13px] hover:bg-[#EA580C] transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)] border-none">
              <Plus className="h-[16px] w-[16px]" strokeWidth={2.5} />
              Create New Offer
            </Button>
          </div>
        </div>

        {/* Statistic Cards */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {KPI_ICONS.map((kpi) => (
              <div key={kpi.title} className="bg-white rounded-[12px] p-4 border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-start gap-4 h-[105px]">
                <div className={`h-[44px] w-[44px] rounded-full ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`h-[22px] w-[22px] ${kpi.color}`} strokeWidth={1.8} />
                </div>
                <div className="flex flex-col h-full justify-between w-full">
                  <div>
                    <p className="text-[13px] font-semibold text-[#475569]">{kpi.title}</p>
                    <h3 className="text-[20px] font-bold text-[#0F172A] leading-tight mt-0.5">{kpi.value}</h3>
                  </div>
                  <div className={`text-[11px] font-medium mt-auto ${kpi.subColor}`}>
                    {kpi.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[#64748B]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search offers by name or method..."
              className="w-full pl-9 pr-4 h-[38px] text-[13px] text-[#334155] placeholder:text-[#94A3B8] bg-white border-[#E2E8F0] rounded-[7px] focus-visible:ring-1 focus-visible:ring-[#FF6B00] transition-colors shadow-none"
            />
          </div>

          <div className="w-[130px]">
            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#475569] text-[13px] rounded-[7px] h-[38px] focus:ring-1 focus:ring-[#FF6B00] font-medium shadow-none">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CARDS">Cards</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="NETBANKING">Net Banking</SelectItem>
                <SelectItem value="ALL">All Methods Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[120px]">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#475569] text-[13px] rounded-[7px] h-[38px] focus:ring-1 focus:ring-[#FF6B00] font-medium shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[130px]">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="bg-white border-[#E2E8F0] text-[#475569] text-[13px] rounded-[7px] h-[38px] focus:ring-1 focus:ring-[#FF6B00] font-medium shadow-none">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FLAT">Flat Discount</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2 px-3 h-[38px] bg-white border-[#E2E8F0] text-[#0F172A] rounded-[7px] font-medium text-[13px] hover:bg-gray-50 transition-colors ml-auto shadow-none">
            <RotateCcw className="h-[16px] w-[16px] text-[#475569]" />
            Reset
          </Button>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col 2xl:flex-row gap-6">

          {/* Left Column - Offers Table */}
          <div className="flex-1 min-w-0 flex flex-col space-y-4">

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide px-2">
              {tabButton(statusFilter === "all", "All Offers", stats.total, () => { setStatusFilter("all"); setPage(1) })}
              {tabButton(statusFilter === "ACTIVE", "Active", stats.ACTIVE, () => { setStatusFilter("ACTIVE"); setPage(1) })}
              {tabButton(statusFilter === "UPCOMING", "Upcoming", stats.UPCOMING, () => { setStatusFilter("UPCOMING"); setPage(1) })}
              {tabButton(statusFilter === "EXPIRED", "Expired", stats.EXPIRED, () => { setStatusFilter("EXPIRED"); setPage(1) })}
              {tabButton(statusFilter === "INACTIVE", "Inactive", stats.INACTIVE, () => { setStatusFilter("INACTIVE"); setPage(1) })}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col flex-1 overflow-hidden">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <>
                  <ScrollArea className="w-full">
                    <Table className="w-full text-left min-w-[950px]">
                      <TableHeader>
                        <TableRow className="bg-white border-b border-[#E2E8F0] hover:bg-white">
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Offer Details</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Method</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Discount</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Min. Order</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Validity</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] h-auto text-left">Status</TableHead>
                          <TableHead className="py-3 px-5 text-[12px] font-semibold text-[#475569] text-right h-auto pr-7">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-[#F1F5F9]">
                        {paginated.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="py-14 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Tag className="h-8 w-8 text-[#CBD5E1]" />
                                <p className="text-sm font-medium text-[#475569]">No offers found</p>
                                <p className="text-[12px] text-[#94A3B8]">Try adjusting your search or filters</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((o) => {
                            const meta = METHOD_META[o.offerType] ?? METHOD_META.ALL
                            const status = offerStatus(o)
                            const statusMeta = STATUS_META[status]
                            return (
                              <TableRow key={o.id} className="hover:bg-[#F8FAFC] transition-colors bg-white group border-none">
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className={`h-8 w-8 rounded-full ${meta.avatar} flex items-center justify-center shrink-0 mt-0.5 border`}>
                                      {methodIcon(o.offerType, "h-4 w-4")}
                                    </div>
                                    <div>
                                      <p className="text-[13px] font-semibold text-[#0F172A]">{o.name}</p>
                                      {o.description && <p className="text-[12px] text-[#64748B] mt-0.5">{o.description}</p>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <Badge variant="outline" className={`${meta.badge} rounded-md text-[11px] font-semibold h-[26px] hover:${meta.badge} whitespace-nowrap`}>
                                    {meta.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  {o.discountType === "FLAT" ? (
                                    <div className="text-[13px] font-bold" style={{ color: meta.color }}>{formatINR(o.discountValue)} FLAT</div>
                                  ) : (
                                    <>
                                      <div className="text-[13px] font-bold" style={{ color: meta.color }}>{o.discountValue}%</div>
                                      {o.maxDiscount != null && (
                                        <div className="text-[11px] text-[#64748B] mt-0.5">Upto {formatINR(o.maxDiscount)}</div>
                                      )}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <div className="text-[13px] font-semibold text-[#0F172A]">{o.minOrderValue != null ? formatINR(o.minOrderValue) : "—"}</div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top text-[12px] text-[#475569]">
                                  <div>{formatDate(o.validFrom)}</div>
                                  <div className="mt-0.5 text-[#94A3B8]">to {formatDate(o.validTo)}</div>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top">
                                  <Badge variant="outline" className={`flex w-fit items-center gap-1.5 ${statusMeta.badge} rounded-md text-[11px] font-semibold h-[26px] whitespace-nowrap`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`}></div>
                                    {statusMeta.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-5 align-top text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="icon" onClick={() => openEdit(o)} className="h-[36px] w-[36px] rounded-[7px] border-[#E2E8F0] text-[#475569] hover:bg-gray-50 transition-colors shadow-none">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setDeleteTarget(o)} className="h-[36px] w-[36px] rounded-[7px] border-[#FECACA] text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shadow-none">
                                      <Trash2 className="h-4 w-4" />
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
                  <div className="p-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] bg-white mt-auto">
                    <span className="text-[#64748B]">Showing {from} to {to} of {filtered.length.toLocaleString()} offers</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled={safePage === 1} onClick={() => setPage(Math.max(1, safePage - 1))} className="h-[32px] w-[32px] rounded-[7px] text-[#94A3B8] hover:bg-gray-50 transition-colors">
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
                              className={`h-[32px] w-[32px] rounded-[7px] px-0 shadow-none ${num === safePage ? "bg-[#16A34A] hover:bg-[#15803D] text-white font-medium" : "text-[#334155] hover:border-[#E2E8F0] border border-transparent transition-colors"}`}
                            >
                              {num}
                            </Button>
                          )
                        )}
                        <Button variant="ghost" size="icon" disabled={safePage === totalPages} onClick={() => setPage(Math.min(totalPages, safePage + 1))} className="h-[32px] w-[32px] rounded-[7px] text-[#475569] hover:bg-gray-50 transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative border-l border-[#E2E8F0] pl-4 hidden sm:flex items-center gap-2">
                        <span className="text-[#64748B]">Rows per page</span>
                        <div className="w-[70px]">
                          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(1) }}>
                            <SelectTrigger className="bg-white border-[#E2E8F0] text-[#334155] text-[13px] h-[32px] focus:ring-1 focus:ring-[#FF6B00] font-medium shadow-none">
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
          <div className="w-full 2xl:w-[320px] shrink-0 flex flex-col gap-5">

            {/* Offer Statistics Donut Chart */}
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-semibold text-[#0F172A]">Offers by Method</h3>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-[180px] h-[180px] shrink-0 mb-6 flex items-center justify-center">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[18px] font-bold text-[#0F172A] leading-tight mt-1">{stats.total}</span>
                    <span className="text-[11px] text-[#64748B]">Total Offers</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2.5">
                  {methodStats.length === 0 ? (
                    <p className="text-[12px] text-[#94A3B8] text-center">No offers yet</p>
                  ) : (
                    methodStats.map((m) => (
                      <div key={m.type} className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2 text-[#0F172A]">
                          <div className="h-[9px] w-[9px] rounded-full" style={{ backgroundColor: m.color }}></div>
                          {m.label}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#0F172A]">{m.count}</span>
                          <span className="text-[#64748B] text-[11px]">({m.pct}%)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Offers */}
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-semibold text-[#0F172A]">Recent Offers</h3>
              </div>

              <div className="space-y-4">
                {recentOffers.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8]">No offers yet</p>
                ) : (
                  recentOffers.map((o, i) => {
                    const meta = METHOD_META[o.offerType] ?? METHOD_META.ALL
                    const statusMeta = STATUS_META[offerStatus(o)]
                    return (
                      <React.Fragment key={o.id}>
                        {i > 0 && <div className="h-[1px] w-full bg-[#F1F5F9]" />}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-[32px] w-[32px] rounded-full ${meta.avatarBg} flex items-center justify-center text-[13px] font-semibold shrink-0`}>
                              {methodIcon(o.offerType, "h-4 w-4")}
                            </div>
                            <div>
                              <span className="text-[13px] font-semibold text-[#0F172A] block max-w-[150px] truncate">{o.name}</span>
                              <span className="text-[10px] text-[#94A3B8]">{formatDate(o.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${statusMeta.badge}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`}></div>
                              {statusMeta.label}
                            </span>
                            {o.discountType === "FLAT"
                              ? <span className="text-[11px] font-bold" style={{ color: meta.color }}>{formatINR(o.discountValue)} off</span>
                              : <span className="text-[11px] font-bold" style={{ color: meta.color }}>{o.discountValue}% off</span>}
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
              <h3 className="text-[15px] font-semibold text-[#0F172A] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-3">
                <button onClick={openCreate} className="flex items-center gap-3 p-3 rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#16A34A] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all group text-left">
                  <div className="h-9 w-9 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Plus className="h-[18px] w-[18px] text-[#16A34A]" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-semibold text-[#0F172A] leading-tight">Create New Offer</span>
                    <span className="block text-[10px] text-[#64748B] mt-0.5">Add a new payment offer</span>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-3 rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#F97316] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all group text-left">
                  <div className="h-9 w-9 rounded-full bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center shrink-0">
                    <ChartNoAxesColumnIncreasing className="h-[18px] w-[18px] text-[#F97316]" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-semibold text-[#0F172A] leading-tight">Offer Analytics</span>
                    <span className="block text-[10px] text-[#64748B] mt-0.5">View performance insights</span>
                  </div>
                </button>

                <button onClick={exportCSV} className="flex items-center gap-3 p-3 rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all group text-left">
                  <div className="h-9 w-9 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                    <Download className="h-[18px] w-[18px] text-[#2563EB]" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-semibold text-[#0F172A] leading-tight">Export Offers</span>
                    <span className="block text-[10px] text-[#64748B] mt-0.5">Download all offers list</span>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-3 rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#7C3AED] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all group text-left">
                  <div className="h-9 w-9 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0">
                    <Settings className="h-[18px] w-[18px] text-[#7C3AED]" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-semibold text-[#0F172A] leading-tight">Offer Settings</span>
                    <span className="block text-[10px] text-[#64748B] mt-0.5">Configure offer rules</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A] mb-3">Tips</h3>
              <div className="bg-[#F7FEF8] rounded-[12px] border border-[#DCFCE7] p-4 flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-[20px] w-[20px] text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#166534]">Use targeted payment offers to boost conversions.</p>
                  <p className="text-[12px] text-[#475569] mt-1">UPI offers get 35% more usage!</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <OfferFormDialog
        key={editing?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border border-[#E2E8F0] text-[#475569] rounded-[7px] shadow-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[7px] shadow-none">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}