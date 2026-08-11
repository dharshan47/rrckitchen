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
          <Avatar className="h-[42px] w-[42px]">
            <AvatarImage src={logoUrl ?? undefined} alt={kitchenName} className="object-cover" />
            <AvatarFallback className="bg-green-800 text-white text-xs font-semibold">
              {kitchenName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[14px] text-[#111827] truncate">{kitchenName}</span>
            <span className="text-[12px] text-[#64748B] truncate">
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
          <MapPin className="h-4 w-4 text-[#64748B] mt-0.5 shrink-0" strokeWidth={1.8} />
          <div className="flex flex-col">
            <span className="text-[14px] text-[#475569]">{row.original.locationArea || "—"}</span>
            <span className="text-[12px] text-[#64748B]">{row.original.locationCity || ""}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "totalMenuItems",
    header: "Total Menu Items",
    cell: ({ row }) => {
      return <div className="text-[14px] font-semibold text-[#111827] ml-4">{row.original.totalMenuItems}</div>
    },
  },
  {
    accessorKey: "activeItems",
    header: "Active Items",
    cell: ({ row }) => {
      return <div className="text-[14px] font-semibold text-[#087A36] ml-2">{row.original.activeItems}</div>
    },
  },
  {
    accessorKey: "avgRating",
    header: "Avg Rating",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-1 font-semibold text-[14px] text-[#1F2937]">
            <div className="bg-[#FFF7E8] p-0.5 rounded-sm">
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" strokeWidth={1.8} />
            </div>
            {row.original.avgRating.toFixed(1)}
          </div>
          <span className="text-[12px] text-[#64748B] ml-5">({formatCompact(row.original.reviewCount)})</span>
        </div>
      )
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
    cell: ({ row }) => {
      return <div className="text-[14px] font-semibold text-[#111827]">{formatCompact(row.original.totalOrders)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "Active"
      return (
        <div className={`inline-flex items-center gap-1.5 font-medium text-[13px] px-2.5 py-1 rounded-full ${isActive ? "bg-[#EFF8F2] text-[#087A36]" : "bg-[#FFF1F2] text-[#C81E3A]"}`}>
          <div className={`h-[6px] w-[6px] rounded-full ${isActive ? "bg-[#008A3D]" : "bg-[#DC2626]"}`} />
          {row.original.status}
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
          <span className="text-[13px] font-medium text-[#475569]">{date}</span>
          {time && <span className="text-[12px] text-[#64748B]">{time}</span>}
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
            className="h-8 bg-[#FFFFFF] border border-[#FF7A55] text-[#F04417] hover:bg-[#FFF3EE] hover:border-[#FF4B16] hover:text-[#F04417] font-medium text-[13px] px-3 gap-1.5 rounded-[8px]"
            onClick={() => meta?.onEditMenu?.(kitchen.id)}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} /> Edit Menu
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-[34px] w-[34px] p-0 bg-[#FFFFFF] border-[#DDE3E8] text-[#475569] rounded-[7px] hover:bg-slate-50">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" strokeWidth={1.8} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/kitchens/${kitchen.slug}`} className="outline-none">
                <DropdownMenuItem className="cursor-pointer text-[13px]">
                  <Eye className="h-3.5 w-3.5 mr-2" strokeWidth={1.8} /> View Live Kitchen
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-[13px]" onClick={() => meta?.onEditMenu?.(kitchen.id)}>
                <Pencil className="h-3.5 w-3.5 mr-2" strokeWidth={1.8} /> Edit Menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
