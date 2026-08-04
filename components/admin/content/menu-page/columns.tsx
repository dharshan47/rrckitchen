"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, Star, MoreVertical, Pencil, Eye } from "lucide-react"
import Link from "next/link"
import type { AdminKitchenMenuOverviewRow } from "@/actions/admin/admin-menu-cms"

export type KitchenMenuDetail = AdminKitchenMenuOverviewRow

function formatCompact(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
  }
  return String(value)
}

function formatUpdated(iso: string | null) {
  if (!iso) return { date: "—", time: "" }
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
  }
}

export const columns: ColumnDef<KitchenMenuDetail>[] = [
  {
    accessorKey: "kitchen",
    header: "Kitchen",
    cell: ({ row }) => {
      const kitchenName = row.original.kitchenName
      const logoUrl = row.original.logoUrl
      const tags = row.original.tags
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={logoUrl ?? undefined} alt={kitchenName} className="object-cover" />
            <AvatarFallback className="bg-green-800 text-white text-xs font-semibold">
              {kitchenName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-slate-900 truncate">{kitchenName}</span>
            <span className="text-xs text-muted-foreground truncate">
              {tags.length > 0 ? tags.join(", ") : "No cuisines"}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <div className="flex items-start gap-1.5">
          <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">{row.original.locationArea || "—"}</span>
            <span className="text-xs text-muted-foreground">{row.original.locationCity || ""}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "totalMenuItems",
    header: "Total Menu Items",
    cell: ({ row }) => {
      return <div className="text-sm font-semibold text-slate-900 ml-4">{row.original.totalMenuItems}</div>
    },
  },
  {
    accessorKey: "activeItems",
    header: "Active Items",
    cell: ({ row }) => {
      return <div className="text-sm font-semibold text-green-600 ml-2">{row.original.activeItems}</div>
    },
  },
  {
    accessorKey: "avgRating",
    header: "Avg Rating",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-1 font-semibold text-sm text-slate-900">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
            {row.original.avgRating.toFixed(1)}
          </div>
          <span className="text-xs text-muted-foreground ml-5">({formatCompact(row.original.reviewCount)})</span>
        </div>
      )
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
    cell: ({ row }) => {
      return <div className="text-sm font-semibold text-slate-700">{formatCompact(row.original.totalOrders)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "Active"
      return (
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-red-500"}`} />
          <span className={isActive ? "text-green-700" : "text-red-600"}>{row.original.status}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const { date, time } = formatUpdated(row.original.lastUpdatedAt)
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">{date}</span>
          {time && <span className="text-xs text-muted-foreground">{time}</span>}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { onEditMenu?: (id: string) => void } | undefined
      const kitchen = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-[#ff4500]/30 text-[#ff4500] hover:bg-[#ff4500]/10 hover:text-[#ff4500] font-semibold text-xs px-3 gap-1"
            onClick={() => meta?.onEditMenu?.(kitchen.id)}
          >
            <Pencil className="h-3 w-3" /> Edit Menu
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/kitchens/${kitchen.slug}`} className="outline-none">
                <DropdownMenuItem className="cursor-pointer">
                  <Eye className="h-3.5 w-3.5 mr-2" /> View Live Kitchen
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => meta?.onEditMenu?.(kitchen.id)}>Edit Menu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
