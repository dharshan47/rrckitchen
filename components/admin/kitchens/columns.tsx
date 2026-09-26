"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, MapPin, Star } from "lucide-react"
import type { getAdminKitchenPartners } from "@/actions/admin/admin-partners"

export type KitchenPartnerRow = NonNullable<
  Awaited<ReturnType<typeof getAdminKitchenPartners>>[number]
>

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]",
  APPROVED: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]",
  PENDINGAPPROVAL: "bg-[#FFF4D6] text-[#D97706] border-none", // Following input.txt 
  SUSPENDED: "bg-[#FFE8E8] text-[#DC2626] border-none",
  REJECTED: "bg-[#F1F5F9] text-[#475569] border-none",
}

const cuisineStyles: Record<string, string> = {
  "South Indian": "bg-[#EAF7EE] text-[#15803D] border-[#D5EEDC]",
  "North Indian": "bg-[#FFF3E5] text-[#C96A12] border-[#F9DFC2]",
  "Chinese": "bg-[#EDF5FF] text-[#2563EB] border-[#D9E8FF]",
  "Biryani": "bg-[#FFECEF] text-[#DC2626] border-[#FFD8DE]",
  "Healthy": "bg-[#EAF8EF] text-[#15803D] border-[#D5EEDC]",
  "Chettinad": "bg-[#FFF3E5] text-[#C96A12] border-[#F9DFC2]",
  "default": "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
}

function kitchenDisplayName(kitchen: KitchenPartnerRow) {
  return kitchen.displayName || kitchen.name || "Kitchen"
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
          <Avatar className="h-[40px] w-[40px] rounded-[8px]">
            <AvatarImage src={kitchen.imageUrl ?? ""} alt={name} className="object-cover" />
            <AvatarFallback className="rounded-[8px] bg-[#F8FAFC] text-[#475569] text-[12px] font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[13px] text-[#111827] truncate max-w-[150px]">{name}</span>
            <span className="text-[11px] text-[#64748B] truncate max-w-[150px]">{kitchen.phoneNumber ?? "No phone"}</span>
            <span className="text-[11px] text-[#64748B] truncate max-w-[150px]">{kitchen.email ?? "No email"}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.original.address
      if (!address) return <span className="text-[13px] text-[#64748B]">—</span>
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[#111827] flex items-center gap-1.5">
            <MapPin className="h-[14px] w-[14px] text-[#64748B]" />
            {address.area || address.lineOne || "Unknown Area"}
          </span>
          <span className="text-[11px] text-[#64748B] pl-[20px]">{address.pincode ?? "No Pincode"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "cuisines",
    header: "Cuisines",
    cell: ({ row }) => {
      const cuisines = row.original.cuisines
      if (!cuisines || cuisines.length === 0) return <span className="text-[13px] text-[#64748B]">—</span>
      return (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex flex-wrap gap-1 max-w-[140px]">
            {cuisines.slice(0, 1).map((c) => (
              <Badge key={c.id} variant="outline" className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] ${cuisineStyles[c.name] || cuisineStyles["default"]}`}>
                {c.name}
              </Badge>
            ))}
          </div>
          {cuisines.length > 1 && (
            <span className="text-[11px] text-[#64748B] font-medium">+{cuisines.length - 1} more</span>
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
      const mappedStatus = status === "PENDINGAPPROVAL" ? "PENDING" : status
      return (
        <Badge variant="outline" className={`uppercase font-bold tracking-wide px-2 py-0.5 text-[10px] rounded-[6px] ${statusStyles[status] || "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"}`}>
          {mappedStatus}
        </Badge>
      )
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const kitchen = row.original
      return (
        <div className="flex items-center gap-1.5">
          <Star className="h-[14px] w-[14px] text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-[13px] font-medium text-[#111827]">
            {kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "New"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="text-[13px] font-medium text-[#111827]">{(row.original.orders ?? 0).toLocaleString()}</span>
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
          <Button 
            variant="outline" 
            size="icon" 
            className="h-[32px] w-[32px] rounded-[7px] bg-[#FFFFFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]" 
            onClick={() => onView(kitchen)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-[32px] w-[32px] rounded-[7px] bg-[#F8FCF9] border-[#D7EBDD] text-[#07883F] hover:bg-[#EAF7EE] hover:border-[#CDEBD6]" 
            onClick={() => onEdit(kitchen)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]