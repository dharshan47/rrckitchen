"use client"

import { useCallback, useMemo, useState } from "react"
import {
  AdminDeliveryPartner,
  useAdminDeliveryPartners,
  useAdminDeliveryPartnersQuery,
  useAdminSelectedPartner,
  useAdminDeliveryActions,
  useUpdateDeliveryPartnerStatusMutation,
} from "@/stores"
import {
  Users, ShieldCheck, Ban, Bike, Check,
  Search, RefreshCw, MoreVertical, Phone, Mail, Star, Eye,
  CheckCircle, X, Landmark, Upload, Clock, Loader2,
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
import { toast } from "sonner"

function partnerName(p: AdminDeliveryPartner) {
  return p.name 
}

function partnerInitials(p: AdminDeliveryPartner) {
  return (p.name ?? "DP").substring(0, 2).toUpperCase()
}

function formatDate(dateString: string | Date | null) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const ACTIVE_STATUSES = ["ACTIVE", "APPROVED"]

const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Active</Badge>
    case "PENDINGAPPROVAL":
    case "PENDING":
      return <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Pending</Badge>
    case "SUSPENDED":
      return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Suspended</Badge>
    case "REJECTED":
      return <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">Rejected</Badge>
    default:
      return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50/50 shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded">{status}</Badge>
  }
}

const getKycBadge = (verifiedAt: Date | null, status: string) => {
  if (verifiedAt) {
    return <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 border border-green-200 bg-green-50/50 px-2 h-5 rounded">Verified <Check className="h-2.5 w-2.5" /></span>
  }
  if (status.toUpperCase() === "REJECTED") {
    return <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 border border-red-200 bg-red-50/50 px-2 h-5 rounded">Rejected</span>
  }
  return <span className="flex items-center gap-1 text-[10px] font-medium text-orange-500 border border-orange-200 bg-orange-50/50 px-2 h-5 rounded">Under Review</span>
}

const columnHelper = createColumnHelper<AdminDeliveryPartner>()

const STATUS_CHIPS = [
  { key: "all", label: "All Partners", icon: null },
  { key: "pending", label: "Pending Approval", icon: null },
  { key: "active", label: "Active", icon: null },
  { key: "suspended", label: "Suspended", icon: null },
  { key: "rejected", label: "Rejected", icon: null },
] as const

// --- Exact-shape animated skeletons ---

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-32" />
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
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 hidden md:block" />
          <Skeleton className="h-3 w-14 hidden lg:block" />
          <Skeleton className="h-3 w-10 hidden lg:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDeliveryPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kycFilter, setKycFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)

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

  // --- Real stats computed from data ---
  const stats = useMemo(() => {
    const total = partners.length
    const active = partners.filter((p) => ACTIVE_STATUSES.includes(p.status.toUpperCase())).length
    const pending = partners.filter((p) => p.status.toUpperCase() === "PENDINGAPPROVAL" || p.status.toUpperCase() === "PENDING").length
    const suspended = partners.filter((p) => p.status.toUpperCase() === "SUSPENDED").length
    const rejected = partners.filter((p) => p.status.toUpperCase() === "REJECTED").length
    const deliveries = partners.reduce((sum, p) => sum + (p.orders ?? 0), 0)
    return { total, active, pending, suspended, rejected, deliveries }
  }, [partners])

  // --- Filters ---
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
            className="border-gray-300 text-green-600 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-300 text-green-600 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
          />
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "PARTNER",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-zinc-100 text-xs text-zinc-600 font-medium">{partnerInitials(row.original)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs">{partnerName(row.original)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">ID: {row.original.userId.slice(0, 8)}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "contact",
      header: "CONTACT",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-xs">{row.original.phoneNumber || "N/A"}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email || "N/A"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("orders", {
      header: "DELIVERIES",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-xs">{row.original.orders ?? 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor("avgRating", {
      header: "RATING",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-xs text-orange-500 flex items-center gap-1"><Star className="h-3 w-3 fill-orange-500" /> {row.original.avgRating > 0 ? row.original.avgRating.toFixed(1) : "N/A"}</span>
          <span className="text-[10px] text-muted-foreground">({row.original.totalReviews})</span>
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
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{formatDate(getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setSelectedPartner(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPartner(row.original)}>View Profile</DropdownMenuItem>
              {ACTIVE_STATUSES.includes(row.original.status.toUpperCase()) ? (
                <DropdownMenuItem className="text-orange-600" onClick={() => handleStatus(row.original, "SUSPENDED")}>Suspend Partner</DropdownMenuItem>
              ) : row.original.status.toUpperCase() === "SUSPENDED" ? (
                <DropdownMenuItem className="text-green-700" onClick={() => handleStatus(row.original, "ACTIVE")}>Re-activate Partner</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-green-700" onClick={() => handleStatus(row.original, "ACTIVE")}>Approve Partner</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => handleStatus(row.original, "REJECTED")}>Remove Partner</DropdownMenuItem>
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

  const countFilter = (key: string) => {
    if (key === "all") return stats.total
    if (key === "active") return stats.active
    if (key === "pending") return stats.pending
    if (key === "suspended") return stats.suspended
    if (key === "rejected") return stats.rejected
    return 0
  }

  const chipClass = (key: string) => {
    const active = statusFilter === key
    switch (key) {
      case "active": return active ? "text-green-700 bg-green-100 border-green-300" : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
      case "pending": return active ? "text-orange-700 bg-orange-100 border-orange-300" : "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100"
      case "suspended": return active ? "text-red-700 bg-red-100 border-red-300" : "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
      case "rejected": return active ? "text-gray-700 bg-gray-200 border-gray-300" : "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
      default: return active ? "text-green-700 bg-green-100 border-green-300" : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
    }
  }

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Phone", "Deliveries", "Rating", "Reviews", "Status", "KYC Verified", "Joined"]
    const rows = (selectedCount > 0 ? selectedRows : filteredPartners).map((p) => [
      p.id, p.name ?? "", p.email ?? "", p.phoneNumber ?? "", String(p.orders ?? 0), p.avgRating > 0 ? p.avgRating.toFixed(1) : "", String(p.totalReviews), p.status, p.kyc?.verifiedAt ? "Yes" : "No", formatDate(p.createdAt),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Management</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all delivery partners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={exportCSV} disabled={isLoading}>
            <Upload className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: "Total Partners", value: stats.total.toLocaleString("en-IN"), trend: `${stats.active > 0 ? Math.round((stats.active / Math.max(stats.total, 1)) * 100) : 0}% active`, trendUp: null, icon: Users, color: "text-green-600", bg: "bg-green-50" },
            { title: "Active", value: stats.active.toLocaleString("en-IN"), trend: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`, trendUp: null, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Pending Approval", value: stats.pending.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
            { title: "Suspended", value: stats.suspended.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.suspended / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: Ban, color: "text-red-500", bg: "bg-red-50" },
            { title: "Total Deliveries", value: stats.deliveries.toLocaleString("en-IN"), trend: `Across ${stats.total} partners`, trendUp: null, icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-[11px] font-medium ${stat.trendUp === true ? "text-green-600" : stat.trendUp === false ? "text-red-500" : "text-muted-foreground"}`}>
                  {stat.trendUp === true && "↑"} {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
        <div className="p-3 border-b border-border/50 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="KYC: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">KYC: All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="under">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="gap-2 h-9 text-xs text-muted-foreground"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setKycFilter("all")
                setRowSelection({})
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="bg-muted/30 p-2.5 px-4 border-b border-border/50 flex items-center gap-3">
            <span className="text-xs font-semibold">{selectedCount} Selected</span>
            <div className="h-4 w-px bg-border mx-1"></div>
            <Button size="sm" variant="outline" className="h-8 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100 gap-1.5" disabled={statusMutation.isPending} onClick={() => selectedRows.forEach((p) => handleStatus(p, "ACTIVE"))}>
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 gap-1.5" disabled={statusMutation.isPending} onClick={() => selectedRows.forEach((p) => handleStatus(p, "SUSPENDED"))}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          </div>
        )}

        <div className="p-3 border-b border-border/50 flex flex-wrap items-center gap-2">
          {STATUS_CHIPS.map((chip) => (
            <Button
              key={chip.key}
              variant="outline"
              className={`h-7 text-xs font-medium gap-1.5 px-3 ${chipClass(chip.key)}`}
              onClick={() => setStatusFilter(chip.key)}
            >
              {chip.label} <span className="bg-white/60 border border-border/40 px-1 rounded text-[10px]">{countFilter(chip.key)}</span>
            </Button>
          ))}
        </div>

        <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-3 border-b border-border/50">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable table={table} emptyMessage={searchQuery || statusFilter !== "all" || kycFilter !== "all" ? "No partners match your filters" : "No delivery partners yet"} />
          )}
        </div>

        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
          <p className="text-xs text-muted-foreground">
            Showing {filteredPartners.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredPartners.length)} of {filteredPartners.length.toLocaleString("en-IN")} partners
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

      {/* Partner Details Side Panel */}
      <Sheet open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col bg-slate-50/50">
          {selectedPartner && (
            <>
              <SheetHeader className="p-5 pb-0 border-b border-border/50 sticky top-0 bg-white z-10 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <SheetTitle className="text-lg">Partner Details</SheetTitle>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedPartner.status)}
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-green-100 p-0.5">
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">{partnerInitials(selectedPartner)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-base font-bold flex items-center gap-1.5">
                      {partnerName(selectedPartner)}
                      {ACTIVE_STATUSES.includes(selectedPartner.status.toUpperCase()) && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </h3>
                    <span className="text-[10px] text-muted-foreground mt-0.5">ID: {selectedPartner.userId}</span>
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold flex items-center gap-1 text-orange-500"><Star className="h-3 w-3 fill-orange-500" /> {selectedPartner.avgRating > 0 ? selectedPartner.avgRating.toFixed(1) : "N/A"}</span>
                        <span className="text-[9px] text-muted-foreground">Rating</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-900">{selectedPartner.orders ?? 0}</span>
                        <span className="text-[9px] text-muted-foreground">Deliveries</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-900">{selectedPartner.totalReviews ?? 0}</span>
                        <span className="text-[9px] text-muted-foreground">Reviews</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-900">{selectedPartner.isOnline ? "Online" : "Offline"}</span>
                        <span className="text-[9px] text-muted-foreground">Status</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-5 space-y-4 flex-1">
                {/* Contact Details */}
                <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-4">
                  <h4 className="text-[11px] font-semibold text-gray-900">Contact Information</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {selectedPartner.phoneNumber || "Not provided"}</span>
                      {selectedPartner.phoneNumber && (
                        <a href={`tel:${selectedPartner.phoneNumber}`}>
                          <Button variant="outline" size="sm" className="h-5 px-1.5 text-[9px] text-green-700 border-green-200 bg-green-50 hover:bg-green-100 gap-1"><Phone className="h-2.5 w-2.5" /> Call</Button>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate w-[140px]">{selectedPartner.email || "Not provided"}</span></span>
                      {selectedPartner.email && (
                        <a href={`mailto:${selectedPartner.email}`}>
                          <Button variant="outline" size="sm" className="h-5 px-1.5 text-[9px] text-green-700 border-green-200 bg-green-50 hover:bg-green-100 gap-1"><Mail className="h-2.5 w-2.5" /> Email</Button>
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-start gap-2"><Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Joined on {formatDate(selectedPartner.createdAt)}</span>
                  </div>
                </div>

                {/* KYC Status */}
                <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold text-gray-900">KYC Status</h4>
                    {selectedPartner.kyc?.verifiedAt ? (
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-orange-400 flex items-center justify-center text-white"><Clock className="h-3 w-3" /></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      {getKycBadge(selectedPartner.kyc?.verifiedAt ?? null, selectedPartner.status)}
                    </div>
                    {selectedPartner.kyc?.verifiedAt && (
                      <span className="text-[9px] text-muted-foreground">Verified on: {formatDate(selectedPartner.kyc.verifiedAt)}</span>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-4">
                  <h4 className="text-[11px] font-semibold text-gray-900">Bank Details</h4>
                  {selectedPartner.kyc ? (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold">{selectedPartner.kyc.bankName || "Not provided"}</span>
                        {selectedPartner.kyc.bankAccountNumber && <span className="text-[10px] text-muted-foreground">Acc. No: **** **** {selectedPartner.kyc.bankAccountNumber.slice(-4)}</span>}
                        {selectedPartner.kyc.ifscCode && <span className="text-[10px] text-muted-foreground">IFSC: {selectedPartner.kyc.ifscCode}</span>}
                        {selectedPartner.kyc.accountHolderName && <span className="text-[10px] text-muted-foreground">Name: {selectedPartner.kyc.accountHolderName}</span>}
                        <span className="text-[10px] text-muted-foreground mt-1">UPI: {selectedPartner.kyc.upiId || selectedPartner.kyc.googlePayNumber || selectedPartner.kyc.phonePeNumber || "Not provided"}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No bank details provided yet.</span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-4 rounded-lg border border-border/50 flex flex-col gap-4">
                  <h4 className="text-[11px] font-semibold text-gray-900">Quick Actions</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {!ACTIVE_STATUSES.includes(selectedPartner.status.toUpperCase()) && (
                      <Button variant="outline" className="h-8 text-[11px] text-green-700 border-green-200 bg-green-50 hover:bg-green-100 gap-1.5 shadow-none" disabled={statusMutation.isPending} onClick={() => handleStatus(selectedPartner, "ACTIVE")}>
                        {statusMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                      </Button>
                    )}
                    <Button variant="outline" className="h-8 text-[11px] text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 gap-1.5 shadow-none" disabled={statusMutation.isPending || selectedPartner.status.toUpperCase() === "SUSPENDED"} onClick={() => handleStatus(selectedPartner, "SUSPENDED")}>
                      <Ban className="h-3.5 w-3.5" /> Suspend
                    </Button>
                    <Button variant="outline" className="h-8 text-[11px] text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-1.5 shadow-none" disabled={statusMutation.isPending || selectedPartner.status.toUpperCase() === "REJECTED"} onClick={() => handleStatus(selectedPartner, "REJECTED")}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}