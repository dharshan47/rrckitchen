"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, MapPin } from "lucide-react"
import type { getAdminKitchenPartners } from "@/actions/admin/admin-partners"

export type KitchenPartnerRow = NonNullable<
  Awaited<ReturnType<typeof getAdminKitchenPartners>>[number]
>

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 hover:bg-green-100",
  APPROVED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  PENDINGAPPROVAL: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  SUSPENDED: "bg-red-100 text-red-700 hover:bg-red-100",
  REJECTED: "bg-gray-100 text-gray-700 hover:bg-gray-100",
}

function kitchenDisplayName(kitchen: KitchenPartnerRow) {
  return kitchen.displayName || kitchen.name || "Unknown Kitchen"
}

export const columns = (
  onEdit: (kitchen: KitchenPartnerRow) => void,
  onView: (kitchen: KitchenPartnerRow) => void
): ColumnDef<KitchenPartnerRow>[] => [
  {
    accessorKey: "name",
    header: "Kitchen",
    cell: ({ row }) => {
      const kitchen = row.original
      const name = kitchenDisplayName(kitchen)
      const initials = name.substring(0, 2).toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md border">
            <AvatarImage src={kitchen.imageUrl ?? ""} alt={name} className="object-cover" />
            <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm truncate max-w-[150px]">{name}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{kitchen.email ?? "No email"}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const kitchen = row.original
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[120px]">{kitchen.name ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{kitchen.phoneNumber ?? "No phone"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.original.address
      if (!address) return <span className="text-sm text-muted-foreground">—</span>
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {address.area || address.lineOne || "Unknown Area"}
          </span>
          <span className="text-xs text-muted-foreground pl-4">{address.pincode || "No Pincode"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "cuisines",
    header: "Cuisines",
    cell: ({ row }) => {
      const cuisines = row.original.cuisines
      if (!cuisines || cuisines.length === 0) return <span className="text-sm text-muted-foreground">—</span>
      return (
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {cuisines.slice(0, 1).map((c) => (
            <Badge key={c.id} variant="secondary" className="text-[10px] font-medium px-1.5 py-0 bg-primary/10 text-primary border-none">
              {c.name}
            </Badge>
          ))}
          {cuisines.length > 1 && (
            <span className="text-[10px] text-muted-foreground ml-1 self-center">+{cuisines.length - 1} more</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant="outline" className={`font-semibold border-none ${statusStyles[status] || "bg-gray-100 text-gray-700"}`}>
          {status === "PENDINGAPPROVAL" ? "PENDING" : status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "menuCount",
    header: "Menu",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{row.original.menuCount.toLocaleString()}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{row.original.orders.toLocaleString()}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const kitchen = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onView(kitchen)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(kitchen)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]