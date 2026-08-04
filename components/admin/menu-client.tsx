"use client"

import { useCallback, useMemo, useState } from "react"
import {
  UtensilsCrossed, CheckCircle2, XCircle, ShoppingBag, Star,
  Trash2, Edit3, Eye, MoreVertical, Check, Power,
  RefreshCw, Loader2, X, Upload, Bike, Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getPaginationRowModel,
} from "@tanstack/react-table"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import { cn } from "@/lib/utils"
import {
  type AdminMenuItemRow,
  useAdminMenuItemsQuery,
  useAdminMenuItems,
  useAdminSelectedMenuItem,
  useAdminMenuActions,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useAddMenuItemPhotoMutation,
  useDeleteMenuItemPhotoMutation,
} from "@/stores/adminMenuStore"

const foodTypeLabel: Record<string, string> = { VEG: "Veg", NONVEG: "Non-Veg" }

const columnHelper = createColumnHelper<AdminMenuItemRow>()

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-14" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-24 hidden md:block" />
          <Skeleton className="h-3 w-20 hidden lg:block" />
          <Skeleton className="h-3 w-12 hidden lg:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AdminMenuPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [kitchenFilter, setKitchenFilter] = useState("all")
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [pageSize, setPageSize] = useState(10)

  const selectedItem = useAdminSelectedMenuItem()
  const { setSelectedItem } = useAdminMenuActions()

  const { isLoading, isFetching, refetch } = useAdminMenuItemsQuery()
  const menuItems = useAdminMenuItems()

  const rows: AdminMenuItemRow[] = useMemo(
    () =>
      menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        foodType: item.foodType,
        timeSlot: item.timeSlot,
        isAvailable: item.isAvailable,
        availableFor: item.availableFor,
        avgRating: item.avgRating,
        totalReviews: item.totalReviews,
        orderCount: item.orderCount,
        imageUrl: item.photos[0]?.imageUrl ?? null,
        kitchenName: item.kitchenName,
        photos: item.photos,
        createdAt: item.createdAt,
      })),
    [menuItems],
  ) as AdminMenuItemRow[]

  const updateMutation = useUpdateMenuItemMutation()
  const deleteMutation = useDeleteMenuItemMutation()

  const handleAvailabilityToggle = useCallback(async (row: AdminMenuItemRow) => {
    const res = await updateMutation.mutateAsync({ id: row.id, data: { isAvailable: !row.isAvailable } })
    if (res.success) {
      toast.success("Availability updated")
    } else {
      toast.error(res.error ?? "Failed to update")
    }
  }, [updateMutation])

  const handleBulkAvailability = async (isAvailable: boolean) => {
    const results = await Promise.all(
      selectedRows.map((r) => updateMutation.mutateAsync({ id: r.id, data: { isAvailable } })),
    )
    if (results.every((r) => r.success)) {
      toast.success("Availability updated")
    } else {
      toast.error("Failed to update some items")
    }
  }

  const handleDeleteItem = useCallback((row: AdminMenuItemRow) => {
    deleteMutation.mutateAsync(row.id).then((res) => {
      if (res.success) {
        toast.success("Menu item deleted")
      } else {
        toast.error(res.error ?? "Failed to delete")
      }
    })
  }, [deleteMutation])

  const handleDeleteSelected = () => {
    let dialogClosed = false
    selectedRows.forEach((r) => {
      deleteMutation.mutateAsync(r.id).then((res) => {
        if (res.success) {
          toast.success("Menu item deleted")
          if (!dialogClosed) {
            setDeleteDialogOpen(false)
            setRowSelection({})
            dialogClosed = true
          }
        } else {
          toast.error(res.error ?? "Failed to delete")
        }
      })
    })
  }

  // --- Real, computed stats ---
  const stats = useMemo(() => {
    const total = menuItems.length
    const available = menuItems.filter((i) => i.isAvailable).length
    const outOfStock = total - available
    const avgPrice = total > 0 ? Math.round(menuItems.reduce((s, i) => s + i.price, 0) / total) : 0
    const totalOrders = menuItems.reduce((s, i) => s + i.orderCount, 0)
    const topKitchen = menuItems
      .reduce<{ name: string; count: number }[]>((acc, i) => {
        const name = i.kitchenName ?? "Unknown"
        const found = acc.find((k) => k.name === name)
        if (found) found.count += 1
        else acc.push({ name, count: 1 })
        return acc
      }, [])
      .sort((a, b) => b.count - a.count)[0]
    return { total, available, lowStock: outOfStock, avgPrice, totalOrders, topKitchen }
  }, [menuItems])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows
      .filter((r) => {
        if (q) {
          const haystack = [r.name, r.kitchenName ?? "", r.description ?? ""].join(" ").toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (kitchenFilter !== "all" && r.kitchenName !== kitchenFilter) return false
        if (foodTypeFilter !== "all" && r.foodType !== foodTypeFilter) return false
        if (statusFilter === "available" && !r.isAvailable) return false
        if (statusFilter === "stock" && r.isAvailable) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price
        if (sortBy === "price-high") return b.price - a.price
        if (sortBy === "rating") return b.avgRating - a.avgRating
        if (sortBy === "orders") return b.orderCount - a.orderCount
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
  }, [rows, searchQuery, kitchenFilter, foodTypeFilter, statusFilter, sortBy])

  const kitchens = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.kitchenName ?? "Unknown").filter(Boolean))),
    [menuItems],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <div className="flex justify-center ml-2">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all the rows"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center ml-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select this row"
            />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Dish",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 py-1">
            {row.original.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.original.imageUrl} alt={row.original.name} className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{row.original.name}</span>
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1 w-[200px]">{row.original.description || "—"}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("kitchenName", {
        header: "Kitchen",
        cell: ({ getValue }) => <span className="text-sm">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("foodType", {
        header: "Type",
        cell: ({ getValue }) => {
          const val = getValue()
          return <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", val === "VEG" ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50")}>{foodTypeLabel[val] ?? val}</Badge>
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">₹{row.original.price}</span>
            {row.original.compareAtPrice && row.original.compareAtPrice > row.original.price && (
              <span className="text-[10px] text-muted-foreground line-through">₹{row.original.compareAtPrice}</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("avgRating", {
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1 text-orange-500">
              <Star className="h-3 w-3 fill-orange-500" /> {row.original.avgRating > 0 ? row.original.avgRating.toFixed(1) : "N/A"}
            </span>
            <span className="text-[10px] text-muted-foreground">({row.original.totalReviews})</span>
          </div>
        ),
      }),
      columnHelper.accessor("orderCount", {
        header: "Orders",
        cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
      }),
      columnHelper.accessor("isAvailable", {
        header: "Status",
        cell: ({ getValue }) => {
          const available = getValue()
          return (
            <Badge variant="outline" className={available ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}>
              {available ? "Available" : "Out of Stock"}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => { setSelectedItem(row.original) }}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => { setSelectedItem(row.original); setEditOpen(true) }}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSelectedItem(row.original); setEditOpen(true) }}>Edit Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAvailabilityToggle(row.original)}>
                  {row.original.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteItem(row.original)}>Delete Item</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [handleAvailabilityToggle, handleDeleteItem, setSelectedItem],
  )

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      rowSelection,
      pagination: { pageIndex: 0, pageSize },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length
  const selectedRows = Object.keys(rowSelection)
    .map((idx) => filteredRows[Number(idx)])
    .filter(Boolean) as AdminMenuItemRow[]

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = table.getState().pagination.pageIndex

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Monitor menu items across all kitchens</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: "Total Dishes", value: stats.total.toLocaleString("en-IN"), trend: `${stats.available > 0 ? Math.round((stats.available / Math.max(stats.total, 1)) * 100) : 0}% available`, trendUp: null, icon: UtensilsCrossed, color: "text-green-600", bg: "bg-green-50" },
            { title: "Available", value: stats.available.toLocaleString("en-IN"), trend: `${stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% of total`, trendUp: null, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Out of Stock", value: stats.lowStock.toLocaleString("en-IN"), trend: `${stats.total > 0 ? ((stats.lowStock / stats.total) * 100).toFixed(1) : 0}% of total`, trendUp: null, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
            { title: "Avg Price", value: `₹${stats.avgPrice.toLocaleString("en-IN")}`, trend: "Across all dishes", trendUp: null, icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
            { title: "Total Orders", value: stats.totalOrders.toLocaleString("en-IN"), trend: "All-time order items", trendUp: null, icon: Bike, color: "text-green-600", bg: "bg-green-50" },
            { title: "Top Kitchen", value: stats.topKitchen?.name ?? "—", trend: `${(stats.topKitchen?.count ?? 0)} dishes`, trendUp: null, icon: UtensilsCrossed, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-xl font-bold mt-1 truncate">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-[10px] font-medium ${stat.trendUp ? "text-green-600" : "text-muted-foreground"} truncate`}>
                  {stat.trendUp && "↑"} {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
        <div className="p-3 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative min-w-[220px] flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="All Kitchens" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kitchens</SelectItem>
                {kitchens.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Veg / Non Veg" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VEG">Veg</SelectItem>
                <SelectItem value="NONVEG">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Availability" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="gap-2 h-9 text-xs text-muted-foreground"
              onClick={() => {
                setSearchQuery("")
                setKitchenFilter("all")
                setFoodTypeFilter("all")
                setStatusFilter("all")
                setRowSelection({})
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="orders">Most Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="bg-muted/30 p-2.5 px-4 border-b border-border flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold">{selectedCount} Selected</span>
            <div className="h-4 w-px bg-border mx-1"></div>
            <Button size="sm" variant="outline" className="h-8 text-xs text-green-600 border-green-200 bg-white hover:bg-green-50 gap-1.5" disabled={updateMutation.isPending} onClick={() => handleBulkAvailability(true)}>
              <Check className="h-3.5 w-3.5" /> Set Available
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-200 bg-white hover:bg-orange-50 gap-1.5" disabled={updateMutation.isPending} onClick={() => handleBulkAvailability(false)}>
              <Power className="h-3.5 w-3.5" /> Mark Out of Stock
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 bg-white hover:bg-red-50 gap-1.5" disabled={deleteMutation.isPending} onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}

        <div className="p-0 [&_th]:text-[11px] [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:py-2">
          {isLoading ? <TableSkeleton /> : <DataTable table={table} emptyMessage={searchQuery || kitchenFilter !== "all" || foodTypeFilter !== "all" || statusFilter !== "all" ? "No menu items match your filters" : "No menu items yet"} />}
        </div>

        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {filteredRows.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredRows.length)} of {filteredRows.length.toLocaleString("en-IN")} items
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[60px] h-7 text-xs"><SelectValue placeholder="10" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 w-7 p-0 text-xs ${i === currentPage ? "bg-[#ff5e14] hover:bg-[#ff5e14]/90 text-white" : ""}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-xs text-muted-foreground px-1">...</span>}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Menu Item Side Panel */}
      <Sheet open={editOpen && !!selectedItem} onOpenChange={(open) => { if (!open) { setEditOpen(false); setSelectedItem(null) } }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col bg-white">
          {selectedItem && <MenuEditMode item={selectedItem} onClose={() => { setEditOpen(false); setSelectedItem(null) }} />}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount > 0 ? `${selectedCount} item${selectedCount !== 1 ? "s" : ""}` : "item"}?</DialogTitle>
            <DialogDescription>
              This will soft-delete the selected menu item(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={handleDeleteSelected}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuEditMode({ item, onClose }: { item: AdminMenuItemRow; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? "")
  const [price, setPrice] = useState(String(item.price))
  const [compareAtPrice, setCompareAtPrice] = useState(item.compareAtPrice ? String(item.compareAtPrice) : "")
  const [foodType, setFoodType] = useState(item.foodType)
  const [timeSlot, setTimeSlot] = useState(item.timeSlot)
  const [availableFor, setAvailableFor] = useState(item.availableFor)
  const [isAvailable, setIsAvailable] = useState(item.isAvailable)

  const saveMutation = useUpdateMenuItemMutation()
  const addPhotoMutation = useAddMenuItemPhotoMutation()
  const deletePhotoMutation = useDeleteMenuItemPhotoMutation()

  const handleSave = async () => {
    const res = await saveMutation.mutateAsync({
      id: item.id,
      data: {
        name,
        description,
        price: parseFloat(price) || item.price,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        foodType,
        timeSlot,
        availableFor: availableFor as "TODAY" | "TOMORROW" | "BOTH",
        isAvailable,
      },
    })
    if (res.success) {
      toast.success("Menu item updated")
      onClose()
    } else {
      toast.error(res.error ?? "Failed to update")
    }
  }

  const handleAddPhoto = (imageUrl: string) => {
    addPhotoMutation.mutateAsync({ menuItemId: item.id, imageUrl }).then((res) => {
      if (res.success) {
        toast.success("Photo added")
      } else {
        toast.error(res.error ?? "Failed to add photo")
      }
    })
  }

  const handleDeletePhoto = (photoId: string) => {
    deletePhotoMutation.mutateAsync(photoId).then((res) => {
      if (res.success) {
        toast.success("Photo removed")
      } else {
        toast.error(res.error ?? "Failed to remove photo")
      }
    })
  }

  return (
    <>
      <SheetHeader className="p-5 pb-0 border-b border-border bg-white">
        <div className="flex justify-between items-center mb-4">
          <SheetTitle className="text-lg">Edit Menu Item</SheetTitle>
          <Badge variant="outline" className={isAvailable ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}>
            {isAvailable ? "Available" : "Out of Stock"}
          </Badge>
        </div>
      </SheetHeader>

      <div className="p-5 space-y-5 flex-1">
        <div className="flex items-center gap-4 pb-2">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">{item.name}</span>
            <span className="text-xs text-muted-foreground">{item.kitchenName ?? "Unknown kitchen"}</span>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-orange-500"><Star className="h-3 w-3 fill-orange-500" /> {item.avgRating > 0 ? item.avgRating.toFixed(1) : "N/A"}</span>
              <span>{item.orderCount} orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="text-sm font-medium">Available for orders</Label>
            <p className="text-xs text-muted-foreground">Toggle availability of this dish</p>
          </div>
          <Switch checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-[#ff5e14]" />
        </div>

        <div className="space-y-2">
          <Label>Dish Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] text-sm resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
          </div>
          <div className="space-y-2">
            <Label>MRP (₹)</Label>
            <Input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Food Type</Label>
            <Select value={foodType} onValueChange={setFoodType}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VEG">Veg</SelectItem>
                <SelectItem value="NONVEG">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="LUNCH">Lunch</SelectItem>
                <SelectItem value="EVENINGSNACKS">Evening</SelectItem>
                <SelectItem value="DINNER">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Available For</Label>
            <Select value={availableFor} onValueChange={setAvailableFor}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="TOMORROW">Tomorrow</SelectItem>
                <SelectItem value="BOTH">Today & Tomorrow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-2">
            {item.photos.map((p) => (
              <div key={p.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover border" />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Remove this photo?")) {
                      handleDeletePhoto(p.id)
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <CloudinaryUpload onUpload={(result) => handleAddPhoto(result.secure_url)}>
              {({ uploading, startUpload }) => (
                <button
                  type="button"
                  onClick={startUpload}
                  disabled={uploading}
                  className="h-14 w-14 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </button>
              )}
            </CloudinaryUpload>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-white flex gap-3">
        <Button variant="outline" className="flex-1 text-xs h-9" onClick={onClose}>Cancel</Button>
        <Button className="flex-1 bg-[#ff5e14] hover:bg-[#ff5e14]/90 text-white text-xs h-9" disabled={saveMutation.isPending} onClick={handleSave}>
          {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </>
  )
}