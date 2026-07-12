"use client"

/* eslint-disable react-hooks/incompatible-library */
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserPlus, Link2, Check, Loader2, Copy, ShieldBan, Users } from "lucide-react"
import { Button, Card, Label, Badge } from "@/components/ui"
import { DataTable } from "@/components/ui/data-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { getCurrentAdminPermissions, getActiveAdmins, deactivateAdmin } from "@/actions/admin/admin-actions"
import type { AdminPermission } from "@/lib/generated/prisma/client"

type AdminRow = {
  id: string
  userId: string
  name: string
  email: string | null
  phoneNumber: string | null
  permissions: AdminPermission[]
  banned: boolean
  invitedByName: string | null
  createdAt: string
  canDeactivate: boolean
}

const columnHelper = createColumnHelper<AdminRow>()

const ALL_PERMISSIONS: { value: AdminPermission; label: string }[] = [
  { value: "MANAGE_ADMINS", label: "Manage Admins" },
  { value: "APPROVE_KYC", label: "Approve KYC" },
  { value: "MANAGE_CATALOG", label: "Manage Catalog" },
  { value: "ISSUE_REFUNDS", label: "Issue Refunds" },
  { value: "MANAGE_PAYOUTS", label: "Manage Payouts" },
  { value: "MANAGE_COUPONS", label: "Manage Coupons" },
  { value: "VIEW_FINANCIALS", label: "View Financials" },
  { value: "MANAGE_SUPPORT", label: "Manage Support" },
  { value: "BAN_USERS", label: "Ban Users" },
  { value: "MANAGE_CMS", label: "Manage CMS" },
]

async function createInvite(permissions: AdminPermission[]) {
  const res = await fetch("/api/admin/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissions }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to create invite")
  }
  return res.json()
}

async function fetchInvites() {
  const res = await fetch("/api/admin/invite")
  if (!res.ok) throw new Error("Failed to fetch invites")
  return res.json()
}

export default function AdminInvitePage() {
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([])
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const { data: permissions = [] } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
  })

  const canManageAdmins = permissions.includes("MANAGE_ADMINS")

  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: fetchInvites,
    enabled: canManageAdmins,
    refetchInterval: 30_000,
  })

  const { data: activeAdmins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["active-admins"],
    queryFn: getActiveAdmins,
  })

  const createMutation = useMutation({
    mutationFn: () => createInvite(selectedPermissions),
    onSuccess: (data) => {
      setInviteLink(data.link)
      setSelectedPermissions([])
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] })
      toast.success("Invite created")
    },
    onError: (err) => toast.error(err.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-admins"] })
      toast.success("Admin deactivated")
    },
    onError: (err) => toast.error(err.message),
  })

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name}</span>
          {row.original.banned && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue, row }) => getValue() ?? row.original.phoneNumber ?? "—",
    }),
    columnHelper.accessor("permissions", {
      header: "Permissions",
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue().map((p) => (
            <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("invitedByName", {
      header: "Invited By",
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) =>
        canManageAdmins ? (
          <div className="text-right">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-destructive"
              disabled={!row.original.canDeactivate || deactivateMutation.isPending}
              onClick={() => {
                if (confirm("Deactivate this admin?")) {
                  deactivateMutation.mutate(row.original.userId)
                }
              }}
            >
              <ShieldBan className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null,
    }),
  ], [canManageAdmins, deactivateMutation])

  const table = useReactTable({
    data: activeAdmins,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const togglePermission = (perm: AdminPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast.success("Link copied")
    }
  }

  return (
    <div className="space-y-6">
      {canManageAdmins && (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5" /> Create Admin Invite
            </h2>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <Badge
                    key={perm.value}
                    variant={selectedPermissions.includes(perm.value) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => togglePermission(perm.value)}
                  >
                    {selectedPermissions.includes(perm.value) && <Check className="h-3 w-3 mr-1" />}
                    {perm.label}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={selectedPermissions.length === 0 || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2" /> Generate Invite Link</>
                )}
              </Button>
            </div>

            {inviteLink && (
              <div className="mt-4 p-3 rounded-lg bg-muted flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <code className="text-xs flex-1 truncate">{inviteLink}</code>
                <Button size="sm" variant="ghost" className="h-7 shrink-0" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
            {invitesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : invites.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No pending invites</p>
            ) : (
              <div className="space-y-3">
                {invites.map((inv: { id: string; token: string; permissions: AdminPermission[]; createdAt: string; consumedAt: string | null; revokedAt: string | null }) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-muted-foreground">{inv.token.slice(0, 16)}...</code>
                        {inv.consumedAt ? (
                          <Badge variant="secondary" className="text-[10px]">Consumed</Badge>
                        ) : inv.revokedAt ? (
                          <Badge variant="destructive" className="text-[10px]">Revoked</Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px]">Active</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {inv.permissions.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Created {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" /> Active Admins
        </h3>
        {adminsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeAdmins.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No active admins</p>
        ) : (
          <DataTable table={table} emptyMessage="No active admins" />
        )}
      </Card>
    </div>
  )
}
