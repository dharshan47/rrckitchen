"use client"

import { useCallback, useMemo, useState } from "react"
import {
  Users, UserMinus, UserPlus, CheckCircle, Upload,
  Search, RefreshCcw, MoreVertical,
  ShieldCheck, Mail, Eye, Ban, Trash2, Send, ShoppingBag,
  Clock, CalendarCheck2, Unlock, Loader2, Check, Phone, MapPin, ArrowUp, UserX
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
    color: "#ff5e14",
  },
}

const THANJAVUR_LOCATIONS = [
  "Achampatti", "Aiyanapuram", "Alakkudi", "Annappanpettai", "Arisikara Street", "Avarampatti", "Budalur",
  "Chennampatti", "Chitrakudi", "Co operative Buildings", "Ganapathi Nagar", "Gudalur", "Inayathukkanpatti",
  "Indalur", "Irudayapuram", "Kalimedu", "Kallaperambur", "Kalvirayanpettai", "Kangeyampatti", "Karuntattankudi",
  "Kattur", "Kilavastachavadi", "Kulichapattu", "Kurungulam Melpathi", "Kurungulam", "MGM Sanatorium",
  "Manambuchavadi", "Manangorai", "Manayeripatti", "Manojipatti", "Mariammancoil", "Marudakudi", "Marungulam",
  "Melakalakudi", "Melavasthachavadi", "Mukasa Nanjikottai", "Palayapatti South", "Pillaiyarpatti",
  "Pookkara Street", "Pudukudi", "Raja Serfoji Govt College", "Rajappa Nagar", "Ramanathapuram", "Ravusapatti",
  "Rayamundanpatti", "Royandur", "Sakkarasamandam", "Sengipatti", "Sholagampatti", "Srinivasapuram",
  "State Bank Colony", "Sydambalpuram", "TJ Busstand", "TJ Co operative Housing Colony", "Tamil University",
  "Tandankorai", "Tennangudi", "Thanjavur Bazaar", "Thanjavur City", "Thanjavur Collectorate", "Thanjavur East Gate",
  "Thanjavur East", "Thanjavur Housing Unit", "Thanjavur Medical College", "Thanjavur North Gate",
  "Thanjavur P&t Colony", "Thanjavur South", "Thanjavur West", "Thanjavur", "Thethuvasalpatti", "Tirukanurpatti",
  "Tirumalaisamudram East", "Tirumalaisamudram", "Valamarkottai", "Vallam East", "Vallam Pudur", "Vallam TJ",
  "Vannarapettai", "Vendayampatti", "Vennamangalam", "Vennar Bank", "Vilar", "Voc Nagar"
].sort()

const demographicsConfig = {
  Male: { label: "Male", color: "#ff9800" },
  Female: { label: "Female", color: "#4caf50" },
  Others: { label: "Others", color: "#2196f3" },
  Verified: { label: "Verified", color: "#4caf50" },
  Unverified: { label: "Unverified", color: "#ff9800" },
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
    COMPLETED: "Delivered", // Matched with UI image
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    PROCESSING: "Processing",
  }
  return map[status] ?? status
}

const columnHelper = createColumnHelper<AdminCustomerRow>()

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-2 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mt-6">
      <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-[100px] rounded-lg" />
        </div>
        <Skeleton className="h-[240px] w-full rounded-lg" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-[140px] w-[140px] mx-auto rounded-full" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-24 mb-6" />
        <div className="space-y-5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 hidden md:block" />
          <Skeleton className="h-3 w-20 hidden lg:block" />
          <Skeleton className="h-3 w-10 hidden lg:block" />
          <Skeleton className="h-3 w-14 hidden lg:block" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-12" />
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
  const [locationFilter, setLocationFilter] = useState("all")
  const [joinedFilter, setJoinedFilter] = useState("all")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const selectedUser = useAdminSelectedUser()
  const messageTargets = useAdminMessageTargets()
  const message = useAdminCustomerMessage()
  const { setSelectedUser, setMessageTargets, setMessage } = useAdminCustomersActions()

  const { data, isLoading } = useAdminCustomersQuery()

  const stats = data?.stats
  const overviewData = data?.overview ?? []
  const demographicsData = data?.demographics ?? []
  const topLocations = data?.topLocations ?? []
  const allCustomers = useMemo(() => data?.customers ?? [], [data])
  const recentOrdersByUser = data?.recentOrdersByUser ?? {}

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allCustomers.filter((c) => {
      if (q) {
        const haystack = [c.name, c.email, c.phone, c.id].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter !== "all" && c.status !== (statusFilter === "active" ? "Active" : "Banned")) return false
      if (verifiedFilter !== "all" && c.verified !== (verifiedFilter === "yes")) return false
      if (locationFilter !== "all" && c.city !== locationFilter) return false
      if (joinedFilter !== "all") {
        const days = joinedFilter === "7d" ? 7 : joinedFilter === "30d" ? 30 : joinedFilter === "90d" ? 90 : 0
        const cutoff = Date.now() - days * 86400000
        if (new Date(c.joined).getTime() < cutoff) return false
      }
      return true
    })
  }, [allCustomers, searchQuery, statusFilter, verifiedFilter, locationFilter, joinedFilter])

  const banMutation = useBanCustomerMutation()
  const unbanMutation = useUnbanCustomerMutation()

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
            className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
          />
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-gray-100">
            <AvatarImage src={row.original.avatarUrl ?? undefined} alt={row.original.name} />
            <AvatarFallback className="bg-green-100 text-green-700 font-bold">{row.original.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-900">{row.original.name}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-0.5">ID: {row.original.id}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700">{row.original.email || "—"}</span>
          <span className="text-[11px] font-medium text-gray-500 mt-0.5">{row.original.phone || "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("joined", {
      header: "Joined On",
      cell: ({ getValue }) => <span className="text-sm font-semibold text-gray-600">{getValue()}</span>,
    }),
    columnHelper.accessor("orders", {
      header: "Orders",
      cell: ({ getValue }) => <span className="text-sm font-bold text-gray-900">{getValue()}</span>,
    }),
    columnHelper.accessor("spent", {
      header: "Spent",
      cell: ({ getValue }) => <span className="text-sm font-bold text-gray-900">{formatCurrency(getValue())}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue()
        if (val === "Active") {
          return <Badge className="bg-green-50/80 text-green-700 hover:bg-green-50 border-0 shadow-none font-bold px-3 py-1 rounded-md">Active</Badge>
        }
        return <Badge className="bg-red-50/80 text-red-600 hover:bg-red-50 border-0 shadow-none font-bold px-3 py-1 rounded-md">Banned</Badge>
      },
    }),
    columnHelper.accessor("verified", {
      header: "Verified",
      cell: ({ getValue }) => {
        const val = getValue()
        if (val) {
          return <Badge className="bg-green-50/80 text-green-700 hover:bg-green-50 border border-green-200/60 shadow-none font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-max">Verified <Check className="h-3 w-3" strokeWidth={3}/></Badge>
        }
        return <Badge className="bg-orange-50/80 text-orange-600 hover:bg-orange-50 border border-orange-200/60 shadow-none font-bold px-2.5 py-1 rounded-md w-max">Unverified</Badge>
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={() => setSelectedUser(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
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
    .map((idx) => filteredCustomers[Number(idx)])
    .filter(Boolean) as AdminCustomerRow[]

  const totalCustomers = stats?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pagination.pageSize))
  const currentPage = table.getState().pagination.pageIndex

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Phone", "Joined", "Orders", "Spent", "Status", "Verified", "Location"]
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
    <div className="space-y-6 pb-12 bg-[#F9FAFB] min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage users, monitor activity and take actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white rounded-lg shadow-sm font-bold border-gray-200 h-10 px-4 text-gray-700 hover:bg-gray-50" onClick={exportCSV} disabled={isLoading}>
            <Upload className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-5 gap-4">
          {[
            { title: "Total Customers", value: totalCustomers.toLocaleString("en-IN"), trend: "new this week", trendPercent: `${totalCustomers > 0 ? ((stats?.newThisWeek ?? 0) / totalCustomers * 100).toFixed(1) : 0}%`, trendUp: true, icon: Users, color: "text-[#ff5e14]", bg: "bg-orange-50/80" },
            { title: "Active Customers", value: (stats?.active ?? 0).toLocaleString("en-IN"), trend: "of total", trendPercent: `${totalCustomers > 0 ? Math.round(((stats?.active ?? 0) / totalCustomers) * 100) : 0}%`, trendUp: null, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50/80" },
            { title: "Banned Customers", value: (stats?.banned ?? 0).toLocaleString("en-IN"), trend: "of total", trendPercent: `${totalCustomers > 0 ? ((stats?.banned ?? 0) / totalCustomers * 100).toFixed(1) : 0}%`, trendUp: null, icon: UserMinus, color: "text-yellow-600", bg: "bg-yellow-50/80" },
            { title: "New This Week", value: (stats?.newThisWeek ?? 0).toLocaleString("en-IN"), trend: "of total", trendPercent: `${totalCustomers > 0 ? ((stats?.newThisWeek ?? 0) / totalCustomers * 100).toFixed(1) : 0}%`, trendUp: null, icon: UserPlus, color: "text-red-500", bg: "bg-red-50/80" },
            { title: "Repeat Customers", value: (stats?.repeat ?? 0).toLocaleString("en-IN"), trend: "of total", trendPercent: `${totalCustomers > 0 ? Math.round(((stats?.repeat ?? 0) / totalCustomers) * 100) : 0}%`, trendUp: null, icon: Users, color: "text-blue-500", bg: "bg-blue-50/80" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border border-gray-100 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-[52px] w-[52px] rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-[26px] w-[26px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-600 truncate">{stat.title}</p>
                  <h3 className="text-[28px] font-extrabold mt-0.5 text-gray-900 leading-tight">{stat.value}</h3>
                  <p className="text-[11px] font-bold mt-1 flex items-center gap-1.5">
                    {stat.trendUp !== null ? (
                      <span className={stat.trendUp ? "text-green-600 flex items-center" : "text-red-500 flex items-center"}>
                        {stat.trendUp ? <ArrowUp className="h-3 w-3 mr-0.5" strokeWidth={3}/> : "↓"} {stat.trendPercent}
                      </span>
                    ) : (
                      <span className="text-gray-500">{stat.trendPercent}</span>
                    )}
                    <span className="text-gray-400">{stat.trend}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Middle Charts */}
      {isLoading ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mt-6">
          <Card className="xl:col-span-2 shadow-sm border border-gray-100 rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <CardTitle className="text-[17px] font-bold text-gray-900">Customer Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-6 relative">
              <ChartLineDots
                data={overviewData}
                config={overviewConfig}
                title=""
                dataKeys={["customers"]}
                xKey="label"
                className="border-0 shadow-none h-[260px]"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100 rounded-2xl bg-white">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[17px] font-bold text-gray-900">Customer Demographics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-col h-[280px]">
              <div className="flex-1 min-h-[150px] flex items-center justify-center">
                <ChartPieDonut
                  data={demographicsData}
                  config={demographicsConfig}
                  title=""
                  dataKey="count"
                  nameKey="category"
                  className="border-0 shadow-none h-full w-full p-0"
                />
              </div>
              <div className="mt-5 space-y-3">
                {demographicsData.map((d, i) => {
                  const total = demographicsData.reduce((acc, curr) => acc + curr.count, 0)
                  const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : "0"
                  return (
                    <div key={i} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }}></div>
                        <span className="text-gray-600 font-bold">{d.category}</span>
                      </div>
                      <span className="font-extrabold text-gray-900">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100 rounded-2xl bg-white">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[17px] font-bold text-gray-900">Top Locations</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-3">
              {topLocations.length === 0 ? (
                <p className="text-sm font-medium text-gray-500 py-8 text-center">No location data yet</p>
              ) : (
                <div className="space-y-5">
                  {topLocations.map((city, i) => {
                    const maxCount = Math.max(...topLocations.map(c => c.count));
                    const percentage = maxCount > 0 ? (city.count / maxCount) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-gray-700">{city.name}</span>
                          <span className="text-[13px] font-extrabold text-gray-900">{city.count.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full bg-gray-100/80 rounded-full h-[5px]">
                          <div className="bg-[#ff5e14] h-[5px] rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Table */}
      <div className="mt-6 shadow-sm border border-gray-100 rounded-2xl bg-white overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
          <div className="w-full lg:w-auto pb-2 lg:pb-0 overflow-x-auto">
            <div className="flex items-center gap-3 w-max pr-4">
              <div className="relative min-w-[260px] shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-10 h-11 rounded-lg bg-gray-50/50 border-gray-200 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#ff5e14]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-lg text-sm font-bold border-gray-200 bg-white text-gray-700">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-lg text-sm font-bold border-gray-200 bg-white text-gray-700">
                <SelectValue placeholder="Verified: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Verified: All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[150px] shrink-0 h-11 rounded-lg text-sm font-bold border-gray-200 bg-white text-gray-700">
                <SelectValue placeholder="Location: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Location: All</SelectItem>
                {THANJAVUR_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={joinedFilter} onValueChange={setJoinedFilter}>
              <SelectTrigger className="w-[160px] shrink-0 h-11 rounded-lg text-sm font-bold border-gray-200 bg-white text-gray-700">
                <SelectValue placeholder="Joined: All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Joined: All Time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="gap-2 shrink-0 h-11 rounded-lg text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-5"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setVerifiedFilter("all")
                setLocationFilter("all")
                setJoinedFilter("all")
                setRowSelection({})
              }}
            >
              <RefreshCcw className="h-4 w-4" /> Reset
            </Button>
            </div>
          </div>
        </div>

        <div className="w-full bg-white border-b border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-3 p-3 px-6 w-max">
            <div className="flex items-center gap-4 mr-3 shrink-0">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              className="rounded-[4px] border-gray-300 data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
            />
            <span className="text-[13px] font-extrabold text-gray-900">{selectedCount} Selected</span>
          </div>

          <Button size="sm" variant="outline" className="h-10 rounded-lg font-bold text-green-700 border-green-200 bg-green-50 hover:bg-green-100 gap-2.5 px-4 shrink-0 shadow-none" disabled={unbanMutation.isPending} onClick={() => selectedRows.forEach(handleUnban)}>
            <CheckCircle className="h-4 w-4" /> Activate
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-lg font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-2.5 px-4 shrink-0 shadow-none" disabled={banMutation.isPending} onClick={() => selectedRows.forEach(handleBan)}>
            <Ban className="h-4 w-4" /> Ban
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-lg font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100 gap-2.5 px-4 shrink-0 shadow-none" disabled={deleteCustomerMutation.isPending} onClick={() => { setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-lg font-bold text-[#ff5e14] border-orange-200 bg-orange-50 hover:bg-orange-100 gap-2.5 px-4 shrink-0 shadow-none" onClick={() => openMessage(...selectedRows)}>
            <Send className="h-4 w-4" /> Send Message
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-lg font-bold text-gray-700 border-gray-200 bg-white hover:bg-gray-50 gap-2.5 px-4 shrink-0 shadow-none" onClick={exportCSV}>
            <Upload className="h-4 w-4" /> Export
          </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px] [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-gray-500 [&_th]:bg-white [&_th]:py-4 [&_th]:border-b [&_th]:border-gray-100 [&_td]:py-4 [&_td]:border-b [&_td]:border-gray-50">
            {isLoading ? <TableSkeleton /> : <DataTable table={table} emptyMessage={searchQuery || statusFilter !== "all" ? "No customers match your filters" : "No customers yet"} />}
          </div>
        </div>

        <div className="p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <p className="text-[13px] font-bold text-gray-500">
            Showing {filteredCustomers.length === 0 ? 0 : currentPage * pagination.pageSize + 1} to {Math.min((currentPage + 1) * pagination.pageSize, filteredCustomers.length)} of {filteredCustomers.length.toLocaleString("en-IN")} customers
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md p-0 hover:bg-gray-100 text-gray-600" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 rounded-md p-0 text-[13px] font-extrabold ${i === currentPage ? "bg-[#ff5e14] hover:bg-[#e04f0f] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-[13px] font-extrabold text-gray-500 px-1">...</span>}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md p-0 hover:bg-gray-100 text-gray-600" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-gray-500">Rows per page</span>
              <Select value={String(pagination.pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger className="w-[70px] h-9 rounded-lg text-[13px] font-bold border-gray-200">
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

      {/* Customer Details Side Panel */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-[460px] overflow-y-auto p-0 flex flex-col bg-white border-l-0 shadow-2xl z-[100]">
          {selectedUser && (
            <>
              <SheetHeader className="p-8 pb-0 space-y-0 text-left">
                <div className="flex justify-between items-center mb-7">
                  <SheetTitle className="text-[22px] font-extrabold text-gray-900 tracking-tight">Customer Details</SheetTitle>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <Avatar className="h-[84px] w-[84px] border border-gray-100 shadow-sm">
                    <AvatarImage src={selectedUser.avatarUrl ?? undefined} alt={selectedUser.name} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">{selectedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h2 className="text-xl font-extrabold text-gray-900">{selectedUser.name}</h2>
                      <Badge className={selectedUser.status === "Banned" ? "bg-red-50/80 text-red-600 hover:bg-red-50 border-0 shadow-none px-2 py-0.5 rounded text-[11px] font-bold" : "bg-green-50/80 text-green-700 hover:bg-green-50 border-0 shadow-none px-2 py-0.5 rounded text-[11px] font-bold"}>{selectedUser.status}</Badge>
                      {selectedUser.verified && <div className="h-5 w-5 rounded-full bg-[#1da1f2] text-white flex items-center justify-center"><Check className="h-3.5 w-3.5" strokeWidth={4} /></div>}
                    </div>
                    <p className="text-[13px] font-bold text-gray-500">ID: {selectedUser.id} <span className="mx-1.5">•</span> Joined on {formatDate(selectedUser.joined)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center pb-8 border-b border-gray-100">
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{selectedUser.orders}</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{formatCurrency(selectedUser.spent)}</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{stats?.verified?.toLocaleString("en-IN") ?? "—"}</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">Verified</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 line-clamp-1" title={selectedUser.city ?? "—"}>{selectedUser.city ?? "—"}</p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">Location</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-8 space-y-8 flex-1 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="shadow-sm border border-gray-100 rounded-2xl bg-white">
                    <CardHeader className="p-5 pb-4"><CardTitle className="text-[15px] font-extrabold text-gray-900">Contact Information</CardTitle></CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                      <div className="flex items-center gap-3.5 text-[13px] font-bold text-gray-700">
                        <Mail className="h-[18px] w-[18px] text-gray-500" />
                        <span className="truncate" title={selectedUser.email}>{selectedUser.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-[13px] font-bold text-gray-700">
                        <Phone className="h-[18px] w-[18px] text-gray-500" />
                        <span>{selectedUser.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-[13px] font-bold text-gray-700">
                        <MapPin className="h-[18px] w-[18px] text-gray-500" />
                        <span className="truncate">{selectedUser.city ? `${selectedUser.city}, Tamil Nadu` : "Location not set"}</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-[13px] font-bold text-gray-700 mt-2 pt-5 border-t border-gray-100">
                        <Clock className="h-[18px] w-[18px] text-gray-500" />
                        <span>Last Login: {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border border-gray-100 rounded-2xl bg-white">
                    <CardHeader className="p-5 pb-4"><CardTitle className="text-[15px] font-extrabold text-gray-900">Account Status</CardTitle></CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3.5">
                      <div className={`flex items-center justify-between text-[13px] font-extrabold p-3 rounded-xl border ${selectedUser.verified ? "bg-green-50/50 border-green-100/60 text-green-700" : "bg-yellow-50/50 border-yellow-100/60 text-yellow-700"}`}>
                        <span className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4" /> {selectedUser.verified ? "Verified" : "Unverified"}</span>
                        {selectedUser.verified ? <div className="h-4 w-4 rounded-full bg-green-600 text-white flex items-center justify-center"><Check className="h-3 w-3" strokeWidth={4}/></div> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className={`flex items-center justify-between text-[13px] font-extrabold p-3 rounded-xl border ${selectedUser.status === "Banned" ? "bg-red-50/50 border-red-100/60 text-red-700" : "bg-green-50/50 border-green-100/60 text-green-700"}`}>
                        <span className="flex items-center gap-2.5"><Unlock className="h-4 w-4" /> {selectedUser.status === "Banned" ? "Banned" : "Not Banned"}</span>
                        {selectedUser.status === "Banned" ? <div className="h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center"><Check className="h-3 w-3" strokeWidth={4}/></div> : <div className="h-4 w-4 rounded-full bg-green-600 text-white flex items-center justify-center"><Check className="h-3 w-3" strokeWidth={4}/></div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3.5">
                    <Button variant="outline" className="h-11 text-[13px] font-extrabold text-[#ff5e14] border-orange-200 bg-white hover:bg-orange-50 gap-2.5 rounded-xl shadow-none" onClick={() => openMessage(selectedUser)}>
                      <Send className="h-4 w-4" /> Send Message
                    </Button>
                    {selectedUser.status === "Banned" ? (
                      <Button variant="outline" className="h-11 text-[13px] font-extrabold text-green-600 border-green-200 bg-white hover:bg-green-50 gap-2.5 rounded-xl shadow-none" disabled={unbanMutation.isPending} onClick={() => handleUnban(selectedUser)}>
                        <Unlock className="h-4 w-4" /> Unban User
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-11 text-[13px] font-extrabold text-red-600 border-red-200 bg-white hover:bg-red-50 gap-2.5 rounded-xl shadow-none" disabled={banMutation.isPending} onClick={() => handleBan(selectedUser)}>
                        {banMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />} Ban User
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[15px] font-extrabold text-gray-900">Recent Orders</h3>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {recentOrders.map((order, i) => (
                        <div key={i} className="flex justify-between items-center p-4 px-5 border border-gray-100 bg-white rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                              <CalendarCheck2 className="h-5 w-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-[13px] font-extrabold text-gray-900 leading-tight">{order.id}</p>
                              <p className="text-[11px] font-bold text-gray-500 mt-1">{order.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-extrabold text-gray-900 mb-2">{formatCurrency(order.amount)}</p>
                            <Badge className={order.status === "COMPLETED" || order.status === "DELIVERED" ? "bg-green-50/80 text-green-700 border border-green-200/50 shadow-none font-extrabold px-2 py-0.5 text-[10px] rounded" : order.status === "CANCELLED" || order.status === "REFUNDED" ? "bg-red-50/80 text-red-600 border border-red-200/50 shadow-none font-extrabold px-2 py-0.5 text-[10px] rounded" : "bg-blue-50/80 text-blue-600 border border-blue-200/50 shadow-none font-extrabold px-2 py-0.5 text-[10px] rounded"}>
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
              className="bg-[#ff5e14] hover:bg-[#e04f0f] text-white"
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
