"use client"

import { useCallback, useMemo, useState } from "react"
import {
  Users, UserMinus, UserPlus, CheckCircle, Upload,
  Search, SlidersHorizontal, RefreshCcw, MoreVertical,
  ShieldCheck, Mail, Key, Eye, Ban, Trash2, Send, ShoppingBag,
  Clock, CalendarCheck2, Unlock, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { ChartLineDots } from "@/components/ui/line-chart"
import { ChartPieDonut } from "@/components/ui/donut-chart"
import { toast } from "sonner"
import type { AdminCustomerRow, AdminCustomerOrderRow } from "@/actions/admin/admin-customers"
import {
  useAdminCustomersQuery,
  useBanCustomerMutation,
  useUnbanCustomerMutation,
  useDeleteCustomerMutation,
  useSendCustomerMessageMutation,
  useAdminSelectedUser,
  useAdminMessageTargets,
  useAdminCustomerMessage,
  useAdminCustomersActions,
} from "@/stores/adminCustomersStore"

const overviewConfig = {
  customers: {
    label: "Customers",
    color: "hsl(var(--primary))",
  },
}

const demographicsConfig = {
  Verified: { label: "Verified", color: "hsl(var(--chart-1))" },
  Unverified: { label: "Unverified", color: "hsl(var(--chart-2))" },
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A"
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return "N/A"
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatOrderStatus(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READYFORPICKUP: "Ready",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  }
  return map[status] ?? status
}

const columnHelper = createColumnHelper<AdminCustomerRow>()

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

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-[120px] rounded-md" />
        </div>
        <div className="flex justify-end mb-4 pr-6">
          <div className="text-right space-y-1.5">
            <Skeleton className="h-3 w-24 ml-auto" />
            <Skeleton className="h-5 w-14 ml-auto" />
          </div>
        </div>
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
        <Skeleton className="h-4 w-40 mb-6" />
        <Skeleton className="h-[180px] w-40 mx-auto rounded-full" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="space-y-5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
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
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 hidden md:block" />
          <Skeleton className="h-3 w-20 hidden lg:block" />
          <Skeleton className="h-3 w-10 hidden lg:block" />
          <Skeleton className="h-3 w-14 hidden lg:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AdminCustomersPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [joinedFilter, setJoinedFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)

  const selectedUser = useAdminSelectedUser()
  const messageTargets = useAdminMessageTargets()
  const message = useAdminCustomerMessage()
  const { setSelectedUser, setMessageTargets, setMessage } = useAdminCustomersActions()

  const { data, isLoading, isFetching, refetch } = useAdminCustomersQuery()

  const stats = data?.stats
  const overviewData = data?.overview ?? []
  const demographicsData = data?.demographics ?? []
  const topLocations = data?.topLocations ?? []
  const allCustomers = useMemo(() => data?.customers ?? [], [data])
  const recentOrdersByUser = data?.recentOrdersByUser ?? {}

  // --- Filters ---
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allCustomers.filter((c) => {
      if (q) {
        const haystack = [c.name, c.email, c.phone, c.id].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter !== "all" && c.status !== (statusFilter === "active" ? "Active" : "Banned")) return false
      if (verifiedFilter !== "all" && c.verified !== (verifiedFilter === "yes")) return false
      if (cityFilter !== "all" && c.city !== cityFilter) return false
      if (joinedFilter !== "all") {
        const days = joinedFilter === "7d" ? 7 : joinedFilter === "30d" ? 30 : joinedFilter === "90d" ? 90 : 0
        const cutoff = Date.now() - days * 86400000
        if (new Date(c.joined).getTime() < cutoff) return false
      }
      return true
    })
  }, [allCustomers, searchQuery, statusFilter, verifiedFilter, cityFilter, joinedFilter])

  // --- Ban / Unban mutations (server sync via store hooks) ---
  const banMutation = useBanCustomerMutation()
  const unbanMutation = useUnbanCustomerMutation()

  // --- Message + delete mutations ---
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteCustomerMutation = useDeleteCustomerMutation()
  const sendMessageMutation = useSendCustomerMessageMutation()

  const openMessage = (...users: AdminCustomerRow[]) => {
    setMessageTargets(users)
    setMessage({ title: "", body: "" })
    setMessageDialogOpen(true)
  }

  const handleBan = useCallback(async (row: AdminCustomerRow) => {
    try {
      await banMutation.mutateAsync({ userId: row.userId, reason: "Banned by admin" })
      toast.success("User banned successfully")
    } catch {
      toast.error("Failed to ban user")
    }
  }, [banMutation])

  const handleUnban = useCallback(async (row: AdminCustomerRow) => {
    try {
      await unbanMutation.mutateAsync(row.userId)
      toast.success("User unbanned successfully")
    } catch {
      toast.error("Failed to unban user")
    }
  }, [unbanMutation])

  const handleDeleteSelected = () => {
    let dialogClosed = false
    for (const c of selectedRows) {
      deleteCustomerMutation.mutateAsync(c.userId).then((res) => {
        if (res.ok) {
          toast.success("Customer deleted")
          if (!dialogClosed) {
            setDeleteDialogOpen(false)
            dialogClosed = true
          }
        } else {
          toast.error(res.error ?? "Failed to delete customer")
        }
      })
    }
  }

  const handleSendMessage = async () => {
    const res = await sendMessageMutation.mutateAsync({ targets: messageTargets, message })
    if (res.ok) {
      toast.success(`Message sent to ${res.sent} device${res.sent !== 1 ? "s" : ""}`)
      setMessageDialogOpen(false)
      setMessageTargets([])
      setMessage({ title: "", body: "" })
    } else {
      toast.error(res.error ?? "Failed to send message")
    }
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.avatarUrl ?? undefined} alt={row.original.name} />
            <AvatarFallback>{row.original.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">ID: {row.original.id}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.original.email || "—"}</span>
          <span className="text-xs text-muted-foreground">{row.original.phone || "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("joined", {
      header: "Joined On",
      cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
    }),
    columnHelper.accessor("orders", {
      header: "Orders",
      cell: ({ getValue }) => <span className="text-sm font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("spent", {
      header: "Spent",
      cell: ({ getValue }) => <span className="text-sm font-medium">{formatCurrency(getValue())}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue()
        return (
          <Badge variant={val === "Active" ? "outline" : "destructive"} className={val === "Active" ? "text-green-600 bg-green-50 border-green-200" : "bg-red-50 text-red-600 border-red-200"}>
            {val}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("verified", {
      header: "Verified",
      cell: ({ getValue }) => {
        const val = getValue()
        return (
          <Badge variant="outline" className={val ? "text-green-600 border-green-200 bg-green-50" : "text-yellow-600 border-yellow-200 bg-yellow-50"}>
            {val ? "Verified ✓" : "Unverified"}
          </Badge>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2 pr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(row.original)}>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedUser(row.original)}>View Details</DropdownMenuItem>
              {row.original.status === "Banned" ? (
                <DropdownMenuItem onClick={() => handleUnban(row.original)}>Unban User</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-destructive" onClick={() => handleBan(row.original)}>
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ], [handleBan, handleUnban, setSelectedUser])

  const table = useReactTable({
    data: filteredCustomers,
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
    .map((idx) => filteredCustomers[Number(idx)])
    .filter(Boolean) as AdminCustomerRow[]

  const totalCustomers = stats?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Phone", "Joined", "Orders", "Spent", "Status", "Verified", "City"]
    const rows = (selectedCount > 0 ? selectedRows : filteredCustomers).map((c) => [
      c.id, c.name, c.email, c.phone, c.joined, String(c.orders), String(c.spent), c.status, c.verified ? "Yes" : "No", c.city ?? "",
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "customers.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Customers exported")
  }

  const recentOrders: AdminCustomerOrderRow[] = selectedUser ? recentOrdersByUser[selectedUser.userId] ?? [] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-sm text-muted-foreground">Manage users, monitor activity and take actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={exportCSV} disabled={isLoading}>
            <Upload className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: "Total Customers", value: totalCustomers.toLocaleString("en-IN"), trend: `Active: ${(stats?.active ?? 0).toLocaleString("en-IN")}`, trendUp: null, icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
            { title: "Active Customers", value: (stats?.active ?? 0).toLocaleString("en-IN"), trend: `${totalCustomers > 0 ? Math.round(((stats?.active ?? 0) / totalCustomers) * 100) : 0}% of total`, trendUp: null, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
            { title: "Banned Customers", value: (stats?.banned ?? 0).toLocaleString("en-IN"), trend: `${totalCustomers > 0 ? ((stats?.banned ?? 0) / totalCustomers * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: UserMinus, color: "text-yellow-500", bg: "bg-yellow-50" },
            { title: "New This Week", value: (stats?.newThisWeek ?? 0).toLocaleString("en-IN"), trend: "Last 7 days", trendUp: true, icon: UserPlus, color: "text-red-500", bg: "bg-red-50" },
            { title: "Repeat Customers", value: (stats?.repeat ?? 0).toLocaleString("en-IN"), trend: `${totalCustomers > 0 ? Math.round(((stats?.repeat ?? 0) / totalCustomers) * 100) : 0}% of total`, trendUp: null, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
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
                <p className={`text-[11px] font-medium ${stat.trendUp ? "text-green-600" : "text-muted-foreground"}`}>
                  {stat.trendUp && "↑"} {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Middle Charts */}
      {isLoading ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-2 shadow-sm border-0 ring-1 ring-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Customer Overview</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarCheck2 className="h-3.5 w-3.5" /> Last 7 days
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-2 pr-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{overviewData[overviewData.length - 1]?.label ?? ""}</p>
                  <p className="text-xl font-bold">{overviewData[overviewData.length - 1]?.customers ?? 0}</p>
                </div>
              </div>
              <ChartLineDots
                data={overviewData}
                config={overviewConfig}
                title=""
                dataKeys={["customers"]}
                xKey="label"
                className="border-0 shadow-none p-0"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Customer Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartPieDonut
                data={demographicsData}
                config={demographicsConfig}
                title=""
                dataKey="count"
                nameKey="category"
                className="border-0 shadow-none h-[180px] p-0"
              />
              <div className="mt-4 space-y-2">
                {demographicsData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }}></div>
                      <span>{d.category}</span>
                    </div>
                    <span className="font-medium">{d.count.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top Cities</CardTitle>
            </CardHeader>
            <CardContent>
              {topLocations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No city data yet</p>
              ) : (
                <div className="space-y-4 mt-2">
                  {topLocations.map((city, i) => (
                    <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0 border-border/50">
                      <span className="text-xs text-muted-foreground">{city.name}</span>
                      <span className="text-sm font-medium">{city.count.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Table */}
      <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
        <div className="p-3 border-b border-border/50 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Verified: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Verified: All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[100px] h-9 text-xs"><SelectValue placeholder="City: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">City: All</SelectItem>
                {topLocations.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={joinedFilter} onValueChange={setJoinedFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Joined: All Time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Joined: All Time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 h-9 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
            </Button>
            <Button
              variant="ghost"
              className="gap-2 h-9 text-xs text-muted-foreground"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setVerifiedFilter("all")
                setCityFilter("all")
                setJoinedFilter("all")
                setRowSelection({})
              }}
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="bg-muted/30 p-2.5 px-4 border-b border-border/50 flex items-center gap-3">
            <span className="text-xs font-semibold">{selectedCount} Selected</span>
            <div className="h-4 w-px bg-border mx-1"></div>
            <Button size="sm" variant="outline" className="h-8 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100 gap-1.5" disabled={unbanMutation.isPending} onClick={() => selectedRows.forEach(handleUnban)}>
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-1.5" disabled={banMutation.isPending} onClick={() => selectedRows.forEach(handleBan)}>
              <Ban className="h-3.5 w-3.5" /> Ban
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-1.5" disabled={deleteCustomerMutation.isPending} onClick={() => { setDeleteDialogOpen(true) }}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 gap-1.5" onClick={() => openMessage(...selectedRows)}>
              <Send className="h-3.5 w-3.5" /> Send Message
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={exportCSV}>
              <Upload className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        )}

        <div className="p-0 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground">
          {isLoading ? <TableSkeleton /> : <DataTable table={table} emptyMessage={searchQuery || statusFilter !== "all" ? "No customers match your filters" : "No customers yet"} />}
        </div>

        <div className="p-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {filteredCustomers.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredCustomers.length)} of {filteredCustomers.length.toLocaleString("en-IN")} customers
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

      {/* Customer Details Side Panel */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col">
          {selectedUser && (
            <>
              <SheetHeader className="p-6 pb-0 space-y-0">
                <div className="flex justify-between items-center mb-6">
                  <SheetTitle className="text-lg">Customer Details</SheetTitle>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedUser.avatarUrl ?? undefined} alt={selectedUser.name} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{selectedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold">{selectedUser.name}</h2>
                      <Badge variant="outline" className={selectedUser.status === "Active" ? "text-green-600 border-green-200 bg-green-50 text-[10px] h-5 px-1.5" : "text-red-600 border-red-200 bg-red-50 text-[10px] h-5 px-1.5"}>{selectedUser.status}</Badge>
                      {selectedUser.verified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">ID: {selectedUser.id} • Joined on {selectedUser.joined}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center pb-6 border-b border-border/50">
                  <div>
                    <p className="text-base font-bold">{selectedUser.orders}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-base font-bold">{formatCurrency(selectedUser.spent)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-base font-bold">{selectedUser.verified ? "Yes" : "No"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Verified</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-6 line-clamp-1" title={selectedUser.city ?? "—"}>{selectedUser.city ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Location</p>
                  </div>
                </div>

                <div className="flex gap-4 border-b border-border/50 text-xs pt-4 font-medium">
                  <button className="pb-3 border-b-2 border-[#ff5e14] text-[#ff5e14]">Overview</button>
                  <button className="pb-3 text-muted-foreground hover:text-foreground">Orders</button>
                  <button className="pb-3 text-muted-foreground hover:text-foreground">Activity</button>
                  <button className="pb-3 text-muted-foreground hover:text-foreground">Support Tickets</button>
                  <button className="pb-3 text-muted-foreground hover:text-foreground">Wallet</button>
                </div>
              </SheetHeader>

              <div className="p-6 space-y-6 flex-1 bg-gray-50/30">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="shadow-sm border-0 ring-1 ring-border/50 bg-white">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold">Contact Information</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate" title={selectedUser.email}>{selectedUser.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Key className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{selectedUser.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{selectedUser.city ?? "Location not set"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Last Login: {formatDate(selectedUser.lastLogin)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-0 ring-1 ring-border/50 bg-white">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold">Account Status</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className={`flex items-center justify-between text-xs p-1.5 rounded-md border ${selectedUser.verified ? "bg-green-50 border-green-100" : "bg-yellow-50 border-yellow-100"}`}>
                        <span className={`flex items-center gap-2 font-medium ${selectedUser.verified ? "text-green-700" : "text-yellow-700"}`}><ShieldCheck className="h-3.5 w-3.5" /> {selectedUser.verified ? "Verified" : "Unverified"}</span>
                        {selectedUser.verified ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Clock className="h-3.5 w-3.5 text-yellow-600" />}
                      </div>
                      <div className={`flex items-center justify-between text-xs p-1.5 rounded-md border ${selectedUser.status === "Banned" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                        <span className={`flex items-center gap-2 font-medium ${selectedUser.status === "Banned" ? "text-red-700" : "text-green-700"}`}><Ban className="h-3.5 w-3.5" /> {selectedUser.status === "Banned" ? "Banned" : "Not Banned"}</span>
                        {selectedUser.status === "Banned" ? <Ban className="h-3.5 w-3.5 text-red-600" /> : <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 bg-green-50 rounded-md border border-green-100">
                        <span className="flex items-center gap-2 text-green-700 font-medium"><Key className="h-3.5 w-3.5" /> Account Active</span>
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xs font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-9 text-xs text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 gap-2" onClick={() => openMessage(selectedUser)}>
                      <Send className="h-3.5 w-3.5" /> Send Message
                    </Button>
                    {selectedUser.status === "Banned" ? (
                      <Button variant="outline" className="h-9 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100 gap-2" disabled={unbanMutation.isPending} onClick={() => handleUnban(selectedUser)}>
                        <Unlock className="h-3.5 w-3.5" /> Unban User
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-9 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-2" disabled={banMutation.isPending} onClick={() => handleBan(selectedUser)}>
                        {banMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />} Ban User
                      </Button>
                    )}
<a href="/admin/orders" className="inline-flex items-center justify-center h-9 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100 gap-2 rounded-md border px-4 py-2 transition-colors">
                      <Eye className="h-3.5 w-3.5" /> View Orders
                    </a>

                </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold">Recent Orders</h3>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentOrders.map((order, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-border/50 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md"><ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" /></div>
                            <div>
                              <p className="text-xs font-bold">{order.id}</p>
                              <p className="text-[10px] text-muted-foreground">{order.date} • {order.items} item{order.items !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold mb-1">{formatCurrency(order.amount)}</p>
                            <Badge variant="outline" className={order.status === "COMPLETED" ? "text-green-600 bg-green-50 border-green-200 text-[9px] h-4 px-1.5 py-0" : order.status === "CANCELLED" || order.status === "REFUNDED" ? "text-red-600 bg-red-50 border-red-200 text-[9px] h-4 px-1.5 py-0" : "text-blue-600 bg-blue-50 border-blue-200 text-[9px] h-4 px-1.5 py-0"}>
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a push notification to {messageTargets.length} customer{messageTargets.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="msg-title">Title</Label>
              <Input
                id="msg-title"
                placeholder="Notification title"
                value={message.title}
                onChange={(e) => setMessage({ ...message, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg-body">Message</Label>
              <Textarea
                id="msg-body"
                placeholder="Message body"
                rows={4}
                value={message.body}
                onChange={(e) => setMessage({ ...message, body: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#ff5e14] hover:bg-[#ff5e14]/90 text-white"
              disabled={sendMessageMutation.isPending || !message.body.trim()}
              onClick={handleSendMessage}
            >
              {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount > 0 ? `${selectedCount} Customer${selectedCount !== 1 ? "s" : ""}` : "Customers"}?</DialogTitle>
            <DialogDescription>
              This will revoke all sessions and soft-delete the selected account(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteCustomerMutation.isPending}
              onClick={handleDeleteSelected}
            >
              {deleteCustomerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
