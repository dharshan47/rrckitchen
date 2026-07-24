"use client"

/* eslint-disable react-hooks/incompatible-library */
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Users, ShoppingBag, ChefHat, Truck, Search, Ban, CheckCircle, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, Input, Badge } from "@/components/ui"
import { DataTable } from "@/components/ui/data-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { getAdminDashboardData } from "@/actions/admin/dashboard"
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions"
import { searchUsers, banUser, unbanUser } from "@/actions/admin/ban-actions"

type UserRow = {
  id: string
  name: string | null
  email: string | null
  phoneNumber: string | null
  banned: boolean
  banReason: string | null
  banExpires: string | null
  createdAt: string
}

const columnHelper = createColumnHelper<UserRow>()

export default function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("")

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
  })

  const { data: permissions = [] } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
  })

  const canBan = permissions.includes("BAN_USERS")

  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: () => searchUsers(search, page),
    enabled: canBan,
  })

  const banMutation = useMutation({
    mutationFn: async () => {
      if (!banModal) return
      await banUser(banModal.userId, banReason, banDuration || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
      toast.success("User banned")
      setBanModal(null)
      setBanReason("")
      setBanDuration("")
    },
    onError: (err) => toast.error(err.message),
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User unbanned")
    },
    onError: (err) => toast.error(err.message),
  })

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone",
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    columnHelper.accessor("banned", {
      header: "Status",
      cell: ({ row }) =>
        row.original.banned ? (
          <Badge variant="destructive" className="text-[10px]">
            Banned{row.original.banReason ? `: ${row.original.banReason}` : ""}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px]">Active</Badge>
        ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.banned ? (
          <div className="text-right">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-green-600"
              disabled={unbanMutation.isPending}
              onClick={() => unbanMutation.mutate(row.original.id)}
            >
              {unbanMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Unban</>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-right">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-destructive"
              disabled={row.original.id === session?.user?.id}
              onClick={() => setBanModal({ userId: row.original.id, name: row.original.name ?? "" })}
            >
              <Ban className="h-3.5 w-3.5 mr-1" /> Ban
            </Button>
          </div>
        ),
    }),
  ], [session?.user?.id, unbanMutation])

  const table = useReactTable({
    data: userData?.users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (dashboardLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <Skeleton className="h-6 w-44 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unauthorized. Please log in as admin.</p>
        </CardContent>
      </Card>
    )
  }

  const s = dashboard.stats

  const statsCards = [
    { title: "Total Customers", value: s.activeCustomers.toString(), icon: Users, color: "text-indigo-600" },
    { title: "Today's Orders", value: s.todayOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { title: "Kitchen Partners", value: s.kitchenPartners.toString(), icon: ChefHat, color: "text-purple-600" },
    { title: "Delivery Partners", value: s.deliveryPartners.toString(), icon: Truck, color: "text-cyan-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Customer Management</h1>
        <p className="text-sm text-muted-foreground">Overview of customers and platform activity</p>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-3.5 w-3.5 shrink-0 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canBan && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Users</h3>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="flex gap-4 pb-3 border-b border-border">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-16 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          ) : !userData || userData.users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users found</p>
          ) : (
            <>
              <DataTable table={table} emptyMessage="No users found" />

              {userData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {userData.page} of {userData.totalPages} ({userData.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= userData.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold mb-2">Ban User</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to ban <strong>{banModal.name}</strong>?
            </p>
            <div className="space-y-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Reason</label>
                <Input
                  placeholder="Reason for ban..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Duration (optional)</label>
                <Input
                  type="datetime-local"
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => { setBanModal(null); setBanReason(""); setBanDuration("") }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => banMutation.mutate()}
                  disabled={banMutation.isPending}
                >
                  {banMutation.isPending ? "Banning..." : "Ban User"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
