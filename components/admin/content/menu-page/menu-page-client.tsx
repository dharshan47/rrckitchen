"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Eye, Plus, Search, Filter, Download, XCircle,
  Loader2, RotateCcw, Utensils, ClipboardList, ChefHat, CircleAlert
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { DataTable } from "./data-table"
import { columns, type KitchenMenuDetail } from "./columns"
import { EditMenuDashboard } from "./edit-menu-dashboard"
import { getAdminKitchenMenuOverview, getAdminMenuEditorOptions, createAdminMenuItem } from "@/actions/admin/admin-menu-cms"
import { useEditorKitchenId, useEditorActions } from "@/stores/menuEditorStore"

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function downloadCSV(filename: string, rows: KitchenMenuDetail[]) {
  const header = ["Kitchen", "Cuisines", "Area", "Pincode", "Menu Items", "Active", "Rating", "Reviews", "Orders", "Status", "Last Updated"]
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${r.kitchenName.replace(/"/g, '""')}"`,
        `"${r.tags.join(" | ").replace(/"/g, '""')}"`,
        `"${r.locationArea.replace(/"/g, '""')}"`,
        `"${r.locationCity.replace(/"/g, '""')}"`,
        r.totalMenuItems,
        r.activeItems,
        r.avgRating.toFixed(1),
        r.reviewCount,
        r.totalOrders,
        r.status,
        r.lastUpdatedAt ?? "",
      ].join(",")
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-[0_1px_3px_rgba(15,23,42,0.03)] border-[#E7EBEF] rounded-[10px] bg-[#FFFFFF]">
          <CardContent className="p-6 flex items-center gap-5">
            <Skeleton className="h-[48px] w-[48px] rounded-[14px] shrink-0" />
            <div className="flex flex-col">
              <Skeleton className="h-[18px] w-[110px]" />
              <Skeleton className="h-[32px] w-[50px] mt-0.5" />
              <Skeleton className="h-[16px] w-[90px] mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <ScrollArea className="h-[calc(100vh-320px)] w-full">
      <div className="space-y-4">
        <div className="rounded-[10px] border border-[#E5E9ED] bg-[#FFFFFF] shadow-[0_1px_4px_rgba(15,23,42,0.025)] overflow-hidden">
          <ScrollArea className="w-full">
            <Table className="min-w-[1000px] w-full">
              <TableHeader className="bg-[#F7FBF8] border-b border-[#E5E9ED]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Kitchen</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Location</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Total Menu Items</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Active Items</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Avg Rating</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Total Orders</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Status</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Last Updated</TableHead>
                  <TableHead className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-[#FAFCFB] transition-colors border-b border-[#EDF0F2]">
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-[42px] w-[42px] rounded-full shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <Skeleton className="h-[18px] w-[140px]" />
                          <Skeleton className="h-[16px] w-[100px] mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <div className="flex items-start gap-1.5">
                        <Skeleton className="h-4 w-4 rounded-sm mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <Skeleton className="h-[18px] w-[120px]" />
                          <Skeleton className="h-[16px] w-[80px] mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <Skeleton className="h-[18px] w-[30px] ml-4" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <Skeleton className="h-[18px] w-[30px] ml-2" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-[18px] w-[18px] rounded-sm" />
                          <Skeleton className="h-[18px] w-[24px]" />
                        </div>
                        <Skeleton className="h-[16px] w-[32px] mt-1 ml-5" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <Skeleton className="h-[18px] w-[40px]" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <Skeleton className="h-[24px] w-[70px] rounded-full" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <div className="flex flex-col">
                        <Skeleton className="h-[18px] w-[90px]" />
                        <Skeleton className="h-[16px] w-[60px] mt-1" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top sm:align-middle border-none">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-[32px] w-[95px] rounded-[8px]" />
                        <Skeleton className="h-[34px] w-[34px] rounded-[7px]" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <Skeleton className="h-[18px] w-[200px]" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-[7px]" />
            <Skeleton className="h-8 w-8 rounded-[7px]" />
            <Skeleton className="h-8 w-8 rounded-[7px]" />
            <Skeleton className="h-8 w-8 rounded-[7px]" />
            <Skeleton className="h-8 w-8 rounded-[7px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-[18px] w-[100px]" />
            <Skeleton className="h-8 w-[70px] rounded-[8px]" />
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export function MenuPageClient() {
  const queryClient = useQueryClient()
  const kitchenId = useEditorKitchenId()
  const { openEditor, closeEditor } = useEditorActions()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("az")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemKitchenId, setNewItemKitchenId] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-menu-overview"],
    queryFn: getAdminKitchenMenuOverview,
    refetchInterval: 30_000,
  })

  const { data: options } = useQuery({
    queryKey: ["admin-menu-editor-options"],
    queryFn: getAdminMenuEditorOptions,
  })

  const createMutation = useMutation({
    mutationFn: ({ kitchenId, name, price }: { kitchenId: string; name: string; price: number }) =>
      createAdminMenuItem(kitchenId, { name, price }),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || "Failed to create menu item")
        return
      }
      queryClient.invalidateQueries({ queryKey: ["admin-menu-overview"] })
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      setAddDialogOpen(false)
      setNewItemName("")
      setNewItemPrice("")
      const kitchenName =
        rows.find((r) => r.id === vars.kitchenId)?.kitchenName ??
        options?.kitchens.find((k) => k.id === vars.kitchenId)?.name ??
        ""
      openEditor(vars.kitchenId, kitchenName)
      toast.success("Menu item created — you can now edit it")
    },
    onError: () => toast.error("Failed to create menu item"),
  })

  const rows = data?.rows ?? []
  const stats = data?.stats

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    let filtered = data?.rows ?? []
    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.kitchenName.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query)) ||
          r.locationArea.toLowerCase().includes(query) ||
          r.locationCity.toLowerCase().includes(query)
      )
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === "za") return b.kitchenName.localeCompare(a.kitchenName)
      if (sortBy === "newest") return (b.lastUpdatedAt ?? "").localeCompare(a.lastUpdatedAt ?? "")
      return a.kitchenName.localeCompare(b.kitchenName)
    })
  }, [data, searchTerm, statusFilter, sortBy])

  const handleAddItem = () => {
    if (!newItemKitchenId) {
      toast.error("Select a kitchen")
      return
    }
    if (!newItemName.trim()) {
      toast.error("Item name is required")
      return
    }
    const price = Number(newItemPrice)
    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid price")
      return
    }
    createMutation.mutate({ kitchenId: newItemKitchenId, name: newItemName.trim(), price })
  }

  // Hooks must be called before the early return
  const editorOpen = kitchenId !== null
  if (editorOpen && kitchenId) {
    return <EditMenuDashboard onClose={closeEditor} />
  }

  const statCards = [
    {
      label: "Total Kitchens",
      value: stats ? formatCompact(stats.totalKitchens) : "0",
      sub: `${stats ? formatCompact(stats.activeKitchens) : "0"} active kitchens`,
      icon: Utensils,
      iconBg: "bg-[#FFF7E8]",
      iconColor: "text-[#F59E0B]",
    },
    {
      label: "Total Menu Items",
      value: stats ? formatCompact(stats.totalMenuItems) : "0",
      sub: "Across all kitchens",
      icon: ClipboardList,
      iconBg: "bg-[#EAF7EF]",
      iconColor: "text-[#008A3D]",
      valueColor: "text-[#087A36]",
    },
    {
      label: "Active Items",
      value: stats ? formatCompact(stats.activeItems) : "0",
      sub: "Currently visible",
      icon: ChefHat,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
      valueColor: "text-[#2563EB]",
    },
    {
      label: "Inactive Items",
      value: stats ? formatCompact(stats.inactiveItems) : "0",
      sub: "Not visible",
      icon: CircleAlert,
      iconBg: "bg-[#FFF1F2]",
      iconColor: "text-[#DC2626]",
      valueColor: "text-[#C81E3A]",
    },
  ]

  return (
    <div className="p-6 lg:p-8 xl:px-10 max-w-[1600px] mx-auto space-y-8 bg-[#FEFEFE] min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#111827] tracking-tight">Menu Detail Management</h1>
          <p className="text-[15px] text-[#64748B] mt-1 font-normal">Manage and customize menu details for all kitchens</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Link href="/kitchens" className="w-full sm:w-auto block">
            <Button variant="outline" className="w-full sm:w-auto text-[#087A36] border-[#A7D9B9] bg-[#FFFFFF] hover:bg-[#F1FAF4] hover:border-[#008A3D] font-medium h-[42px] px-4 shadow-none rounded-[8px]">
              <Eye className="h-[18px] w-[18px] mr-2" strokeWidth={1.8} />
              Preview Live Menu
            </Button>
          </Link>
          <Button
            className="w-full sm:w-auto bg-[#FF4B16] hover:bg-[#E63F0D] text-[#FFFFFF] font-medium h-[42px] px-4 shadow-[0_2px_6px_rgba(255,75,22,0.12)] rounded-[8px]"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-[18px] w-[18px] mr-2" strokeWidth={1.8} />
            Add New Menu Item
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <Card key={card.label} className="shadow-[0_1px_3px_rgba(15,23,42,0.03)] border-[#E7EBEF] rounded-[10px] bg-[#FFFFFF]">
              <CardContent className="p-6 flex items-center gap-5">
                <div className={`h-[48px] w-[48px] rounded-[14px] ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                  <card.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#374151]">{card.label}</p>
                  <h3 className={`text-[26px] font-bold mt-0.5 ${card.valueColor || "text-[#111827]"}`}>{card.value}</h3>
                  <p className="text-[12px] font-medium text-[#64748B] mt-1">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E5E9ED] shadow-[0_1px_4px_rgba(15,23,42,0.025)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#EDF0F2] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">
              Kitchens ({rows.length})
              {searchTerm && <span className="ml-2 text-[14px] font-medium text-[#64748B]">filtered to {filteredRows.length}</span>}
            </h2>
            <p className="text-[14px] text-[#64748B] mt-0.5">Select a kitchen to manage its menu details</p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              variant="outline"
              className="h-[44px] border-[#A7D9B9] text-[#087A36] bg-[#FFFFFF] font-medium hover:bg-[#F1FAF4] hover:border-[#008A3D] rounded-[8px] px-4"
              onClick={() => {
                if (filteredRows.length === 0) {
                  toast.error("No kitchens to export")
                  return
                }
                downloadCSV("kitchen-menus.csv", filteredRows)
                toast.success(`${filteredRows.length} kitchens exported`)
              }}
            >
              <Download className="h-4 w-4 mr-2" strokeWidth={1.8} />
              Export
            </Button>
          </div>
        </div>

        <div className="p-4 border-b border-[#EDF0F2] flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 bg-[#FFFFFF]">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#334155]" strokeWidth={1.8} />
              <Input
                placeholder="Search kitchens..."
                className="pl-9 h-[44px] border-[#DDE3E8] bg-[#FFFFFF] text-[#374151] placeholder:text-[#64748B] rounded-[8px] focus-visible:ring-0 focus-visible:border-[#008A3D] focus-visible:shadow-[0_0_0_3px_rgba(0,138,61,0.08)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-[44px] w-full md:w-[110px] border-[#DDE3E8] text-[#1F2937] bg-[#FFFFFF] font-medium rounded-[8px] focus:ring-0 focus:border-[#008A3D]">
                  <Filter className="h-[18px] w-[18px] text-[#334155] mr-1 shrink-0" strokeWidth={1.8} />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-[44px] w-full md:w-[160px] border-[#DDE3E8] bg-[#FFFFFF] font-medium text-[#1F2937] rounded-[8px] focus:ring-0 focus:border-[#008A3D]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">Sort by: A - Z</SelectItem>
                  <SelectItem value="za">Sort by: Z - A</SelectItem>
                  <SelectItem value="newest">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <XCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-500 font-semibold">Failed to load kitchen menus</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)] w-full">
            <DataTable
              columns={columns}
              data={filteredRows}
              onEditMenu={(id) => {
                const kitchen = rows.find((r) => r.id === id)
                openEditor(id, kitchen?.kitchenName ?? "")
              }}
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {/* Add New Menu Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create an item inside a kitchen&apos;s menu, then open the editor to customize it fully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-item-kitchen">Kitchen</Label>
              <Select value={newItemKitchenId} onValueChange={setNewItemKitchenId}>
                <SelectTrigger id="new-item-kitchen" className="h-10">
                  <SelectValue placeholder="Select a kitchen" />
                </SelectTrigger>
                <SelectContent>
                  {(options?.kitchens ?? []).map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-name">Item Name</Label>
              <Input
                id="new-item-name"
                placeholder="e.g. Chicken Biryani"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-price">Selling Price (₹)</Label>
              <Input
                id="new-item-price"
                type="number"
                min={0}
                placeholder="e.g. 189"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={createMutation.isPending}
              className="bg-[#FF4B16] hover:bg-[#E63F0D] text-[#FFFFFF] gap-2 rounded-[8px]"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create & Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
