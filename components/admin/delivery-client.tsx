"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AdminDeliveryPartner,
  useAdminDeliveryPartners,
  useAdminDeliveryPartnersQuery,
  useAdminSelectedPartner,
  useAdminDeliveryActions,
  useUpdateDeliveryPartnerStatusMutation,
} from "@/stores"
import {
  Users, ShieldCheck, Check, Bike,
  Search, RefreshCw, MoreVertical, Phone, Mail, Star, Eye,
  CheckCircle, X, Landmark, Clock, Plus, Pause, UserX, UserRoundCheck,
  RotateCcw, MapPin, MessageSquare, ShoppingBag, Upload
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { toast } from "sonner"

function partnerName(p: AdminDeliveryPartner) {
  return p.name ?? "Unknown Partner"
}

function partnerInitials(p: AdminDeliveryPartner) {
  return (p.name ?? "DP").substring(0, 2).toUpperCase()
}

function formatDate(dateString: string | Date | null) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(dateString: string | Date | null) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" })
}

const ACTIVE_STATUSES = ["ACTIVE", "APPROVED"]

const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
      return <Badge className="text-[#15803D] border border-[#BBF7D0] bg-[#DCFCE7] hover:bg-[#DCFCE7] shadow-none font-semibold px-2.5 py-0.5 text-[12px] rounded-[6px]">Active</Badge>
    case "PENDINGAPPROVAL":
    case "PENDING":
      return <Badge className="text-[#B45309] border border-[#FDE68A] bg-[#FEF3C7] hover:bg-[#FEF3C7] shadow-none font-semibold px-2.5 py-0.5 text-[12px] rounded-[6px]">Pending</Badge>
    case "SUSPENDED":
      return <Badge className="text-[#DC2626] border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FEE2E2] shadow-none font-semibold px-2.5 py-0.5 text-[12px] rounded-[6px]">Suspended</Badge>
    case "REJECTED":
      return <Badge className="text-[#DC2626] border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FEE2E2] shadow-none font-semibold px-2.5 py-0.5 text-[12px] rounded-[6px]">Rejected</Badge>
    default:
      return <Badge className="text-[#374151] border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F9FAFB] shadow-none font-semibold px-2.5 py-0.5 text-[12px] rounded-[6px] capitalize">{status.toLowerCase()}</Badge>
  }
}

const getKycBadge = (verifiedAt: Date | null, status: string) => {
  if (verifiedAt) {
    return <Badge className="text-[#166534] border border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#F0FDF4] shadow-none font-semibold px-2 py-0.5 text-[12px] rounded-[6px] gap-1"><Check className="h-3 w-3" /> Verified</Badge>
  }
  if (status.toUpperCase() === "REJECTED") {
    return <Badge className="text-[#DC2626] border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FEE2E2] shadow-none font-semibold px-2 py-0.5 text-[12px] rounded-[6px]">Rejected</Badge>
  }
  return <Badge className="text-[#EA580C] border border-[#FED7AA] bg-[#FFF7ED] hover:bg-[#FFF7ED] shadow-none font-semibold px-2 py-0.5 text-[12px] rounded-[6px]">Under Review</Badge>
}

const getDeliveryStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return <Badge className="text-[#166534] border border-[#BBF7D0] bg-[#DCFCE7] hover:bg-[#DCFCE7] shadow-none font-semibold px-2.5 py-0.5 text-[11px] rounded-[6px]">Delivered</Badge>
    case "CANCELLED":
      return <Badge className="text-[#DC2626] border border-[#FECACA] bg-[#FEE2E2] hover:bg-[#FEE2E2] shadow-none font-semibold px-2.5 py-0.5 text-[11px] rounded-[6px]">Cancelled</Badge>
    default:
      return <Badge className="text-[#B45309] border border-[#FDE68A] bg-[#FEF3C7] hover:bg-[#FEF3C7] shadow-none font-semibold px-2.5 py-0.5 text-[11px] rounded-[6px] capitalize">{status.toLowerCase()}</Badge>
  }
}

const columnHelper = createColumnHelper<AdminDeliveryPartner>()

// --- Skeletons ---
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2 mt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-32" />
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
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-32 hidden md:block" />
          <Skeleton className="h-4 w-20 hidden lg:block" />
          <Skeleton className="h-6 w-20 rounded-[6px]" />
          <Skeleton className="h-6 w-20 rounded-[6px]" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDeliveryPage() {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kycFilter, setKycFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<"overview" | "kyc" | "performance" | "history">("overview")

  const { isLoading, isFetching, refetch } = useAdminDeliveryPartnersQuery()
  const partners = useAdminDeliveryPartners()
  const selectedPartner = useAdminSelectedPartner()
  const { setSelectedPartner } = useAdminDeliveryActions()

  const statusMutation = useUpdateDeliveryPartnerStatusMutation()

  const handleStatus = useCallback((p: AdminDeliveryPartner, status: string) => {
    if (p.status.toUpperCase() === status.toUpperCase()) return
    statusMutation.mutateAsync({ id: p.id, status }).then((res) => {
      if (res.success) {
        toast.success(`Partner status updated to ${status}`)
      } else {
        toast.error(res.error ?? "Failed to update status")
      }
    }).catch(() => toast.error("Failed to update status"))
  }, [statusMutation])

  const stats = useMemo(() => {
    const total = partners.length
    const active = partners.filter((p) => ACTIVE_STATUSES.includes(p.status.toUpperCase())).length
    const pending = partners.filter((p) => p.status.toUpperCase() === "PENDINGAPPROVAL" || p.status.toUpperCase() === "PENDING").length
    const suspended = partners.filter((p) => p.status.toUpperCase() === "SUSPENDED").length
    const rejected = partners.filter((p) => p.status.toUpperCase() === "REJECTED").length
    const deliveries = partners.reduce((sum, p) => sum + (p.deliveredCount ?? 0), 0)
    return { total, active, pending, suspended, rejected, deliveries }
  }, [partners])

  const shareOf = (count: number) => (stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0")

  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return partners.filter((p) => {
      if (q) {
        const haystack = [p.name ?? "", p.email ?? "", p.phoneNumber ?? "", p.id].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter === "active" && !ACTIVE_STATUSES.includes(p.status.toUpperCase())) return false
      if (statusFilter === "pending" && !(p.status.toUpperCase() === "PENDINGAPPROVAL" || p.status.toUpperCase() === "PENDING")) return false
      if (statusFilter === "suspended" && p.status.toUpperCase() !== "SUSPENDED") return false
      if (statusFilter === "rejected" && p.status.toUpperCase() !== "REJECTED") return false
      if (kycFilter === "verified" && !p.kyc?.verifiedAt) return false
      if (kycFilter === "under-review" && p.kyc?.verifiedAt) return false
      return true
    })
  }, [partners, searchQuery, statusFilter, kycFilter])

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="rounded-[4px] border-[#D1D5DB] data-[state=checked]:bg-[#15803D] data-[state=checked]:border-[#15803D]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="rounded-[4px] border-[#D1D5DB] data-[state=checked]:bg-[#15803D] data-[state=checked]:border-[#15803D]"
          />
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "PARTNER",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 min-w-[200px]">
          <Avatar className="h-10 w-10 border border-[#E5E7EB]">
            <AvatarFallback className="bg-green-100 text-[#15803D] font-bold text-sm">{partnerInitials(row.original)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[14px] text-[#111827]">{partnerName(row.original)}</span>
            <span className="text-[12px] text-[#6B7280] uppercase tracking-tight">ID: {row.original.userId.slice(0, 8)}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "contact",
      header: "CONTACT",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="font-semibold text-[13px] text-[#111827]">{row.original.phoneNumber || "N/A"}</span>
          <span className="text-[12px] text-[#6B7280]">{row.original.email || "N/A"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("orders", {
      header: "DELIVERIES",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[14px] text-[#111827]">{row.original.deliveredCount ?? 0}</span>
          <span className="text-[12px] text-[#6B7280]">Completed</span>
        </div>
      ),
    }),
    columnHelper.accessor("avgRating", {
      header: "RATING",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[14px] text-[#F97316] flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-[#F97316]" /> {row.original.avgRating > 0 ? row.original.avgRating.toFixed(1) : "N/A"}</span>
          <span className="text-[12px] text-[#6B7280]">({row.original.totalReviews})</span>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: ({ getValue }) => getStatusBadge(getValue()),
    }),
    columnHelper.accessor("kyc", {
      header: "KYC",
      cell: ({ row }) => getKycBadge(row.original.kyc?.verifiedAt ?? null, row.original.status),
    }),
    columnHelper.accessor("createdAt", {
      header: "JOINED ON",
      cell: ({ getValue }) => <span className="text-[13px] font-medium text-[#374151] whitespace-nowrap">{formatDate(getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-[10px] border-[#E5E7EB] bg-white text-[#9CA3AF] hover:text-[#111827] shadow-none" onClick={() => setSelectedPartner(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-[10px] border-[#E5E7EB] bg-white text-[#9CA3AF] hover:text-[#111827] shadow-none">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setSelectedPartner(row.original)}>View Profile</DropdownMenuItem>
              {ACTIVE_STATUSES.includes(row.original.status.toUpperCase()) ? (
                <DropdownMenuItem className="text-orange-600" onClick={() => handleStatus(row.original, "SUSPENDED")}>Suspend Partner</DropdownMenuItem>
              ) : row.original.status.toUpperCase() === "SUSPENDED" ? (
                <DropdownMenuItem className="text-green-700" onClick={() => handleStatus(row.original, "ACTIVE")}>Re-activate Partner</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-green-700" onClick={() => handleStatus(row.original, "ACTIVE")}>Approve Partner</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={() => handleStatus(row.original, "REJECTED")}>Remove Partner</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ], [handleStatus, setSelectedPartner])

  const table = useReactTable({
    data: filteredPartners,
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
    .map((idx) => filteredPartners[Number(idx)])
    .filter(Boolean) as AdminDeliveryPartner[]

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Phone", "Deliveries", "Rating", "Reviews", "Status", "KYC Verified", "Joined"]
    const rows = (selectedCount > 0 ? selectedRows : filteredPartners).map((p) => [
      p.id, p.name ?? "", p.email ?? "", p.phoneNumber ?? "", String(p.deliveredCount ?? 0), p.avgRating > 0 ? p.avgRating.toFixed(1) : "", String(p.totalReviews), p.status, p.kyc?.verifiedAt ? "Yes" : "No", formatDate(p.createdAt),
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "delivery-partners.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Partners exported")
  }

  const completionRate = (p: AdminDeliveryPartner) =>
    (p.totalAssignments ?? 0) > 0 ? Math.round(((p.deliveredCount ?? 0) / p.totalAssignments) * 100) : null

  return (
    <div className="space-y-6 bg-[#F9FAFB] min-h-screen pb-12 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">Delivery Partner Management</h1>
          <p className="text-[13px] sm:text-[14px] font-normal text-[#6B7280] mt-1">Manage and monitor all delivery partners</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-1 md:mt-0">
          <Button variant="outline" className="bg-white border-[#D1D5DB] text-[#374151] rounded-[12px] h-[40px] sm:h-[44px] px-4 sm:px-5 font-semibold gap-2 shadow-none hover:bg-gray-50 flex-1 md:flex-none" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCw className={`h-4 w-4 text-[#6B7280] ${isFetching ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" className="bg-white border-[#D1D5DB] text-[#374151] rounded-[12px] h-[40px] sm:h-[44px] px-4 sm:px-5 font-semibold gap-2 shadow-none hover:bg-gray-50 flex-1 md:flex-none" onClick={exportCSV} disabled={isLoading}>
            <Upload className="h-4 w-4 text-[#6B7280]" /> <span className="hidden sm:inline">Export</span>
          </Button>
          <Button className="bg-[#15803D] hover:bg-[#166534] text-white rounded-[12px] h-[40px] sm:h-[44px] px-4 sm:px-5 font-bold shadow-[0_2px_6px_rgba(21,128,61,0.2)] gap-2 w-full md:w-auto" onClick={() => router.push("/admin/invite")}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Add New Partner
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
          {[
            { title: "Total Partners", value: stats.total.toLocaleString("en-IN"), trend: "registered", trendPercent: "Real-time", trendUp: null, icon: Users, color: "text-[#15803D]", bg: "bg-[#F0FDF4]", circle: "bg-[#DCFCE7]" },
            { title: "Active", value: stats.active.toLocaleString("en-IN"), trend: "of total", trendPercent: `${shareOf(stats.active)}%`, trendUp: null, icon: ShieldCheck, color: "text-[#2563EB]", bg: "bg-[#EFF6FF]", circle: "bg-[#DBEAFE]" },
            { title: "Pending Approval", value: stats.pending.toLocaleString("en-IN"), trend: "of total", trendPercent: `${shareOf(stats.pending)}%`, trendUp: null, icon: UserRoundCheck, color: "text-[#F59E0B]", bg: "bg-white", circle: "bg-[#FEF3C7]" },
            { title: "Suspended", value: stats.suspended.toLocaleString("en-IN"), trend: "of total", trendPercent: `${shareOf(stats.suspended)}%`, trendUp: null, icon: UserX, color: "text-[#DC2626]", bg: "bg-white", circle: "bg-[#FEE2E2]" },
            { title: "Completed Deliveries", value: stats.deliveries.toLocaleString("en-IN"), trend: "delivered", trendPercent: "Real-time", trendUp: null, icon: Bike, color: "text-[#7C3AED]", bg: "bg-white", circle: "bg-[#F3E8FF]" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-[#E5E7EB] bg-white transition-shadow overflow-hidden">
              <CardContent className="p-5 sm:p-[24px] flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className={`relative h-[48px] w-[48px] sm:h-[56px] sm:w-[56px] rounded-full flex items-center justify-center ${stat.bg} shrink-0`}>
                    <div className={`h-[36px] w-[36px] sm:h-[40px] sm:w-[40px] rounded-full flex items-center justify-center ${stat.circle}`}>
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[12px] sm:text-[13px] font-normal text-[#6B7280] leading-tight mb-1 truncate">{stat.title}</p>
                    <h3 className="text-[24px] sm:text-[30px] font-bold text-[#111827] leading-none">{stat.value}</h3>
                  </div>
                </div>
                <p className="text-[12px] sm:text-[13px] font-normal mt-1">
                  <span className="text-[#6B7280] font-bold">{stat.trendPercent}</span>
                  <span className="text-[#6B7280] ml-1.5">{stat.trend}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <div className="mt-6">
        {/* Filters Row */}
        <ScrollArea className="w-full pb-4">
          <div className="flex flex-nowrap items-center gap-3 w-max pr-4">
            <div className="relative min-w-[240px] shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input
                placeholder="Search partners..."
                className="pl-10 h-[44px] rounded-[12px] bg-white border-[#D1D5DB] text-[14px] font-medium focus-visible:ring-1 focus-visible:ring-[#15803D]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-[44px] rounded-[12px] text-[14px] font-semibold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-[120px] shrink-0 h-[44px] rounded-[12px] text-[14px] font-semibold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="KYC: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">KYC: All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-[44px] rounded-[12px] border-[#D1D5DB] bg-white text-[#374151] font-semibold gap-2 px-5 shrink-0 shadow-none" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setKycFilter("all")
            }}>
              <RotateCcw className="h-4 w-4 text-[#9CA3AF]" /> Reset
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Status Chips Row */}
        <ScrollArea className="w-full pb-4">
          <div className="flex flex-nowrap items-center gap-3 w-max pr-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`h-[36px] flex items-center gap-2 px-4 rounded-[10px] font-bold text-[13px] shrink-0 transition-colors ${statusFilter === "all" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50"}`}
            >
              All Partners <span className={`px-1.5 py-0.5 rounded-[6px] text-[11px] ${statusFilter === "all" ? "bg-white/60 text-[#15803D]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{stats.total}</span>
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`h-[36px] flex items-center gap-2 px-4 rounded-[10px] font-bold text-[13px] shrink-0 transition-colors ${statusFilter === "pending" ? "bg-[#FFF7ED] text-[#EA580C]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50"}`}
            >
              Pending Approval <span className={`px-1.5 py-0.5 rounded-[6px] text-[11px] ${statusFilter === "pending" ? "bg-[#FED7AA]/40 text-[#EA580C]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{stats.pending}</span>
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`h-[36px] flex items-center gap-2 px-4 rounded-[10px] font-bold text-[13px] shrink-0 transition-colors ${statusFilter === "active" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50"}`}
            >
              Active <span className={`px-1.5 py-0.5 rounded-[6px] text-[11px] ${statusFilter === "active" ? "bg-[#BFDBFE]/40 text-[#2563EB]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{stats.active}</span>
            </button>
            <button
              onClick={() => setStatusFilter("suspended")}
              className={`h-[36px] flex items-center gap-2 px-4 rounded-[10px] font-bold text-[13px] shrink-0 transition-colors ${statusFilter === "suspended" ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50"}`}
            >
              Suspended <span className={`px-1.5 py-0.5 rounded-[6px] text-[11px] ${statusFilter === "suspended" ? "bg-[#FECACA]/40 text-[#DC2626]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{stats.suspended}</span>
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`h-[36px] flex items-center gap-2 px-4 rounded-[10px] font-bold text-[13px] shrink-0 transition-colors ${statusFilter === "rejected" ? "bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50"}`}
            >
              Rejected <span className={`px-1.5 py-0.5 rounded-[6px] text-[11px] ${statusFilter === "rejected" ? "bg-[#E5E7EB]/50 text-[#6B7280]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{stats.rejected}</span>
            </button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Data Table */}
        <div className="shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden mt-2">
          <ScrollArea className="w-full">
            <div className="min-w-[1200px] [&_th]:text-[12px] [&_th]:font-semibold [&_th]:text-[#6B7280] [&_th]:bg-white [&_th]:py-4 [&_th]:px-4 [&_th]:border-b [&_th]:border-[#F3F4F6] [&_td]:py-3 [&_td]:px-4 [&_td]:border-b [&_td]:border-[#F3F4F6] [&_tr:hover]:bg-[#F9FAFB] [&_tr[data-state=selected]]:bg-[#F0FDF4]">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <DataTable table={table} emptyMessage={searchQuery || statusFilter !== "all" || kycFilter !== "all" ? "No partners match your filters" : "No delivery partners yet"} />
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-[13px] font-medium text-[#6B7280]">
              Showing {filteredPartners.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredPartners.length)} of {filteredPartners.length.toLocaleString("en-IN")} partners
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 rounded-md p-0 text-[13px] font-extrabold ${i === currentPage ? "bg-[#15803D] text-white shadow-none" : "text-[#6B7280] hover:bg-gray-100"}`}
                    onClick={() => table.setPageIndex(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                {totalPages > 5 && <span className="text-[13px] font-extrabold text-gray-500 px-1">...</span>}
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-[#6B7280]">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-[70px] h-9 rounded-lg text-[13px] font-bold border-[#E5E7EB]">
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
      </div>

      {/* Partner Details Side Panel */}
      <Sheet open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col bg-white border-l-0 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[100]">
          {selectedPartner && (
            <>
              <SheetHeader className="p-8 pb-0 border-b border-[#E5E7EB] bg-white z-20 sticky top-0 text-left">
                <div className="flex justify-between items-center mb-6">
                  <SheetTitle className="text-[22px] font-extrabold text-[#111827]">Partner Details</SheetTitle>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedPartner.status)}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6B7280] hover:bg-gray-100" onClick={() => setSelectedPartner(null)}><X className="h-5 w-5" /></Button>
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <Avatar className="h-[72px] w-[72px] rounded-full border border-[#E5E7EB] shadow-sm">
                    <AvatarFallback className="bg-[#DCFCE7] text-[#15803D] font-bold text-2xl">{partnerInitials(selectedPartner)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[20px] font-bold text-[#1F2937] flex items-center gap-2">
                      {partnerName(selectedPartner)}
                      {ACTIVE_STATUSES.includes(selectedPartner.status.toUpperCase()) && <CheckCircle className="h-5 w-5 text-[#2563EB] fill-[#EFF6FF]" />}
                    </h3>
                    <span className="text-[13px] text-[#6B7280] font-medium">ID: {selectedPartner.userId.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <ScrollArea className="w-full mb-6">
                  <div className="flex items-center gap-8 px-2 w-max pr-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[16px] font-bold flex items-center gap-1.5 text-[#1F2937]">
                        <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                        {selectedPartner.avgRating > 0 ? selectedPartner.avgRating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-[12px] text-[#6B7280] font-medium mt-1">Rating</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[16px] font-bold text-[#1F2937]">{selectedPartner.deliveredCount ?? 0}</span>
                      <span className="text-[12px] text-[#6B7280] font-medium mt-1">Deliveries</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[16px] font-bold text-[#1F2937]">{completionRate(selectedPartner) !== null ? `${completionRate(selectedPartner)}%` : "—"}</span>
                      <span className="text-[12px] text-[#6B7280] font-medium mt-1">Completion</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[16px] font-bold text-[#1F2937]">{selectedPartner.totalAssignments ?? 0}</span>
                      <span className="text-[12px] text-[#6B7280] font-medium mt-1">Assignments</span>
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <ScrollArea className="w-full border-b-0">
                  <div className="flex gap-7 w-max pr-4">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`pb-4 text-[14px] font-bold shrink-0 transition-colors ${activeTab === "overview" ? "text-[#15803D] border-b-[3px] border-[#15803D]" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >Overview</button>
                    <button
                      onClick={() => setActiveTab("kyc")}
                      className={`pb-4 text-[14px] font-bold shrink-0 transition-colors ${activeTab === "kyc" ? "text-[#15803D] border-b-[3px] border-[#15803D]" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >KYC & Bank</button>
                    <button
                      onClick={() => setActiveTab("performance")}
                      className={`pb-4 text-[14px] font-bold shrink-0 transition-colors ${activeTab === "performance" ? "text-[#15803D] border-b-[3px] border-[#15803D]" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >Performance</button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`pb-4 text-[14px] font-bold shrink-0 transition-colors ${activeTab === "history" ? "text-[#15803D] border-b-[3px] border-[#15803D]" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >History</button>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </SheetHeader>

              <ScrollArea className="flex-1 bg-[#F9FAFB] w-full">
                <div className="p-4 sm:p-8 space-y-6 min-w-[320px]">
                {(activeTab === "overview" || activeTab === "kyc") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <Card className="rounded-[16px] border border-[#E5E7EB] shadow-none bg-white">
                      <CardContent className="p-5 flex flex-col gap-4">
                        <h4 className="text-[14px] font-bold text-[#1F2937]">Contact Information</h4>
                        <div className="flex flex-col gap-4 mt-1">
                          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-[#374151] flex items-center gap-2"><Phone className="h-4 w-4 text-[#9CA3AF] shrink-0" /> {selectedPartner.phoneNumber || "Not provided"}</span>
                            {selectedPartner.phoneNumber && (
                              <a href={`tel:${selectedPartner.phoneNumber}`} className="w-full xl:w-auto">
                                <Button variant="outline" size="sm" className="w-full xl:w-auto h-[28px] px-3 text-[11px] font-bold text-[#15803D] border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#DCFCE7] shadow-none">Call</Button>
                              </a>
                            )}
                          </div>
                          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-[#374151] flex items-start xl:items-center gap-2"><Mail className="h-4 w-4 text-[#9CA3AF] shrink-0 mt-0.5 xl:mt-0" /> <span className="break-all">{selectedPartner.email || "Not provided"}</span></span>
                            {selectedPartner.email && (
                              <a href={`mailto:${selectedPartner.email}`} className="w-full xl:w-auto">
                                <Button variant="outline" size="sm" className="w-full xl:w-auto h-[28px] px-3 text-[11px] font-bold text-[#15803D] border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#DCFCE7] shadow-none shrink-0">Email</Button>
                              </a>
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-[#374151] flex items-center gap-2 mt-1"><MapPin className="h-4 w-4 text-[#9CA3AF] shrink-0" /> {selectedPartner.isOnline ? "Online now" : "Offline"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card className="rounded-[16px] border border-[#E5E7EB] shadow-none bg-white">
                      <CardContent className="p-5 flex flex-col gap-4">
                        <h4 className="text-[14px] font-bold text-[#1F2937]">Payment Details</h4>
                        <div className="flex flex-col gap-3 mt-1">
                          <span className="text-[13px] font-medium text-[#374151] flex items-start gap-3"><Bike className="h-[18px] w-[18px] text-[#6B7280] shrink-0 mt-0.5" /> <span className="break-all">UPI: {selectedPartner.kyc?.upiId || "Not provided"}</span></span>
                          <span className="text-[13px] font-medium text-[#374151] flex items-start gap-3 pl-[30px]"><span className="break-all">Google Pay: {selectedPartner.kyc?.googlePayNumber || "Not provided"}</span></span>
                          <span className="text-[13px] font-medium text-[#374151] flex items-start gap-3 pl-[30px]"><span className="break-all">PhonePe: {selectedPartner.kyc?.phonePeNumber || "Not provided"}</span></span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {(activeTab === "overview" || activeTab === "kyc") && (
                  <>
                    {/* KYC Status */}
                    <Card className="rounded-[16px] border border-[#E5E7EB] shadow-none bg-white">
                      <CardContent className="p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[14px] font-bold text-[#1F2937]">KYC Status</h4>
                          {selectedPartner.kyc?.verifiedAt ? (
                            <div className="h-5 w-5 rounded-full bg-[#16A34A] flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-[#F59E0B] flex items-center justify-center text-white"><Clock className="h-3 w-3" /></div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-1 gap-3">
                          <div className="flex items-center gap-4">
                            {getKycBadge(selectedPartner.kyc?.verifiedAt ?? null, selectedPartner.status)}
                            <span className="text-[13px] font-medium text-[#374151]">{selectedPartner.kyc?.verifiedAt ? "All documents verified" : "Pending verification"}</span>
                          </div>
                          {selectedPartner.kyc?.verifiedAt && (
                            <span className="text-[12px] font-medium text-[#6B7280]">Verified on: {formatDate(selectedPartner.kyc.verifiedAt)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bank Details */}
                    <Card className="rounded-[16px] border border-[#E5E7EB] shadow-none bg-white">
                      <CardContent className="p-5 flex flex-col gap-4">
                        <h4 className="text-[14px] font-bold text-[#1F2937]">Bank Details</h4>
                        {selectedPartner.kyc?.bankName ? (
                          <div className="flex gap-4">
                            <Landmark className="h-6 w-6 text-[#6B7280] mt-1" />
                            <div className="flex flex-col gap-1.5 mt-0.5">
                              <span className="text-[14px] font-bold text-[#1F2937]">{selectedPartner.kyc.bankName}</span>
                              {selectedPartner.kyc.accountHolderName && (
                                <span className="text-[13px] font-medium text-[#6B7280]">{selectedPartner.kyc.accountHolderName}</span>
                              )}
                              <span className="text-[13px] font-medium text-[#6B7280]">
                                Acc. No: {selectedPartner.kyc.bankAccountNumber
                                  ? `**** ${selectedPartner.kyc.bankAccountNumber.slice(-4)}`
                                  : "Not provided"}
                              </span>
                              <span className="text-[13px] font-medium text-[#6B7280]">IFSC: {selectedPartner.kyc.ifscCode || "Not provided"}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] font-medium text-[#6B7280]">No bank details provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {activeTab === "overview" && (
                  <Card className="rounded-[16px] border border-[#E5E7EB] shadow-none bg-white">
                    <CardContent className="p-5 flex flex-col gap-4">
                      <h4 className="text-[14px] font-bold text-[#1F2937]">Quick Actions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="outline" className="h-[44px] rounded-[12px] bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] hover:bg-[#BBF7D0]/50 font-bold text-[13px] gap-2 shadow-none" disabled={statusMutation.isPending} onClick={() => handleStatus(selectedPartner, "ACTIVE")}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button variant="outline" className="h-[44px] rounded-[12px] bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA] hover:bg-[#FED7AA]/50 font-bold text-[13px] gap-2 shadow-none" disabled={statusMutation.isPending || selectedPartner.status.toUpperCase() === "SUSPENDED"} onClick={() => handleStatus(selectedPartner, "SUSPENDED")}>
                          <Pause className="h-4 w-4" /> Suspend
                        </Button>
                        <Button variant="outline" className="h-[44px] rounded-[12px] bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] hover:bg-[#FECACA]/50 font-bold text-[13px] gap-2 shadow-none" disabled={statusMutation.isPending || selectedPartner.status.toUpperCase() === "REJECTED"} onClick={() => handleStatus(selectedPartner, "REJECTED")}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPartner.email && (
                          <a href={`mailto:${selectedPartner.email}`}>
                            <Button variant="outline" className="w-full h-[44px] rounded-[12px] bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50 font-bold text-[13px] gap-2 shadow-none">
                              <MessageSquare className="h-4 w-4 text-[#9CA3AF]" /> Send Message
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(activeTab === "performance" || activeTab === "history") && (
                  <div className="flex flex-col gap-4 pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[14px] font-bold text-[#1F2937]">Recent Deliveries</h4>
                      <Link href="/admin/orders" className="text-[13px] font-bold text-[#2563EB] hover:underline">View All</Link>
                    </div>
                    {selectedPartner.recentDeliveries && selectedPartner.recentDeliveries.length > 0 ? (
                      <div className="flex flex-col">
                        {selectedPartner.recentDeliveries.map((d, i) => (
                          <div
                            key={d.id}
                            className={`flex items-center justify-between py-4 bg-white px-4 border border-[#E5E7EB] ${i === 0 ? "rounded-t-[12px]" : "border-t-0"} ${i === selectedPartner.recentDeliveries.length - 1 ? "rounded-b-[12px]" : ""}`}
                          >
                            <div className="flex items-start gap-4">
                              <ShoppingBag className="h-5 w-5 text-[#6B7280] mt-0.5" />
                              <div className="flex flex-col gap-1">
                                <span className="text-[13px] font-bold text-[#1F2937]">{d.id}</span>
                                <span className="text-[12px] font-medium text-[#6B7280]">{formatDateTime(d.createdAt)}</span>
                              </div>
                            </div>
                            {getDeliveryStatusBadge(d.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-14 text-center bg-white border border-[#E5E7EB] rounded-[12px]">
                        <ShoppingBag className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
                        <p className="text-[14px] font-medium text-[#6B7280]">No deliveries yet</p>
                      </div>
                    )}
                  </div>
                )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
