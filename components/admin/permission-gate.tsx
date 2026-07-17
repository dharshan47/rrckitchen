"use client"

import { useQuery } from "@tanstack/react-query"
import { ShieldBan } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions"
import type { AdminPermission } from "@/lib/generated/prisma/client"

interface PermissionGateProps {
  requiredPermission: AdminPermission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminPermissionGate({ requiredPermission, children, fallback }: PermissionGateProps) {
  const { data: permissions = [], isFetching } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
    staleTime: 60_000,
  })

  if (isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!permissions.includes(requiredPermission)) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldBan className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-semibold text-foreground">Access Restricted</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You don&apos;t have permission to access this section.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
