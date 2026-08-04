"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Eye, Plus, Search, Filter, Download, Store, UtensilsCrossed, CheckCircle2, XCircle,
  Loader2, RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-sm border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-3 w-12 hidden md:block" />
            <Skeleton className="h-3 w-10 hidden md:block" />
            <Skeleton className="h-3 w-14 hidden md:block" />
            <Skeleton className="h-5 w-16 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden xl:block" />
          </div>
        ))}
      </div>
    </div>
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
      sub: `${stats ? formatCompact(stats.activeKitchens) : "0"} active`,
      icon: Store,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Total Menu Items",
      value: stats ? formatCompact(stats.totalMenuItems) : "0",
      sub: "Across all kitchens",
      icon: UtensilsCrossed,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Active Items",
      value: stats ? formatCompact(stats.activeItems) : "0",
      sub: "Currently visible",
      icon: CheckCircle2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Inactive Items",
      value: stats ? formatCompact(stats.inactiveItems) : "0",
      sub: "Not visible",
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-50/50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Detail Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and customize menu details for all kitchens</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/kitchens">
            <Button variant="outline" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100 font-semibold h-10 px-4 shadow-sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview Live Menu
            </Button>
          </Link>
          <Button
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold h-10 px-4 shadow-sm"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Menu Item
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Kitchens ({rows.length})
              {searchTerm && <span className="ml-2 text-sm font-medium text-slate-400">filtered to {filteredRows.length}</span>}
            </h2>
            <p className="text-sm text-slate-500">Select a kitchen to manage its menu details</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search kitchens..."
                className="pl-9 h-10 border-slate-200 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[130px] border-slate-200 text-slate-600 shadow-sm bg-white font-medium">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-[150px] border-slate-200 bg-white shadow-sm font-medium text-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">Sort by: A - Z</SelectItem>
                <SelectItem value="za">Sort by: Z - A</SelectItem>
                <SelectItem value="newest">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
            <Button
              variant="outline"
              className="h-10 border-slate-200 text-green-700 shadow-sm bg-white font-medium hover:bg-green-50 hover:text-green-800"
              onClick={() => {
                if (filteredRows.length === 0) {
                  toast.error("No kitchens to export")
                  return
                }
                downloadCSV("kitchen-menus.csv", filteredRows)
                toast.success(`${filteredRows.length} kitchens exported`)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
          <DataTable
            columns={columns}
            data={filteredRows}
            onEditMenu={(id) => {
              const kitchen = rows.find((r) => r.id === id)
              openEditor(id, kitchen?.kitchenName ?? "")
            }}
          />
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
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white gap-2"
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
