"use client"

import { useCallback, useMemo, useState } from "react"
import {
  UtensilsCrossed, XCircle, ShoppingBag, Star,
  Trash2, Eye, MoreVertical, Check, Power, Plus, UploadCloud,
  RefreshCw, Loader2, X, MoveRight, Search, IndianRupee, Users, ShieldCheck, Pencil
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import Image from 'next/image';
import {
  type AdminMenuItemRow,
  useAdminMenuItemsQuery,
  useAdminMenuItems,
  useAdminSelectedMenuItem,
  useAdminMenuActions,
  useAdminKitchensWithMenusQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useAddMenuItemPhotoMutation,
  useDeleteMenuItemPhotoMutation,
} from "@/stores/adminMenuStore"

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

const columnHelper = createColumnHelper<AdminMenuItemRow>()

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-14 w-14 rounded-[10px]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-20 hidden lg:block" />
          <Skeleton className="h-6 w-24 rounded-md" />
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
  const [createOpen, setCreateOpen] = useState(false)
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [bulkPrice, setBulkPrice] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [kitchenFilter, setKitchenFilter] = useState("all")
  const [cuisineFilter, setCuisineFilter] = useState("all")
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")
  const [timeSlotFilter, setTimeSlotFilter] = useState("all")
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
        menuId: item.menuId,
        menuName: item.menuName,
        cuisine: item.cuisine,
        photos: item.photos,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
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
      setRowSelection({})
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

  const stats = useMemo(() => {
    const total = menuItems.length
    const available = menuItems.filter((i) => i.isAvailable).length
    const outOfStock = total - available
    const avgPrice = total > 0 ? Math.round(menuItems.reduce((s, i) => s + i.price, 0) / total) : 0
    const totalOrders = menuItems.reduce((s, i) => s + i.orderCount, 0)
    const topItem = menuItems.reduce<typeof menuItems[number] | null>(
      (best, i) => (!best || i.orderCount > best.orderCount ? i : best),
      null,
    )
    const kitchenCount = new Set(menuItems.map((i) => i.kitchenName ?? "Unknown").filter((n) => n !== "Unknown")).size
    return { total, available, lowStock: outOfStock, avgPrice, totalOrders, topItem, kitchenCount }
  }, [menuItems])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows
      .filter((r) => {
        if (q) {
          const haystack = [r.name, r.kitchenName ?? "", r.cuisine ?? "", r.description ?? ""].join(" ").toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (kitchenFilter !== "all" && r.kitchenName !== kitchenFilter) return false
        if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false
        if (foodTypeFilter !== "all" && r.foodType !== foodTypeFilter) return false
        if (timeSlotFilter !== "all" && r.timeSlot !== timeSlotFilter) return false
        if (statusFilter === "available" && !r.isAvailable) return false
        if (statusFilter === "stock" && r.isAvailable) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price
        if (sortBy === "price-high") return b.price - a.price
        if (sortBy === "rating") return b.avgRating - a.avgRating
        if (sortBy === "orders") return b.orderCount - a.orderCount
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      })
  }, [rows, searchQuery, kitchenFilter, cuisineFilter, foodTypeFilter, timeSlotFilter, statusFilter, sortBy])

  const kitchens = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.kitchenName ?? "Unknown").filter(Boolean))),
    [menuItems],
  )

  const cuisines = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.cuisine).filter((c): c is string => !!c))),
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
              className="rounded-[4px] border-[#D1D5DB] data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center ml-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select this row"
              className="rounded-[4px] border-[#D1D5DB] data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
            />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Dish",
        cell: ({ row }) => (
          <div className="flex items-center gap-4 py-2 min-w-[280px]">
            {row.original.imageUrl ? (
              <Image src={row.original.imageUrl} alt={row.original.name} width={56} height={56} className="h-14 w-14 rounded-[10px] object-cover border border-[#E5E7EB]" />
            ) : (
              <div className="h-14 w-14 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
                <UtensilsCrossed className="h-5 w-5 text-[#9CA3AF]" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[14px] text-[#111827] leading-tight">{row.original.name}</span>
                {row.original.avgRating > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#16A34A]">
                    <Star className="h-3 w-3 fill-[#16A34A]" /> {row.original.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium text-[#6B7280] line-clamp-1">{row.original.description || "—"}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("kitchenName", {
        header: "Kitchen",
        cell: ({ getValue }) => <span className="text-[13px] font-extrabold text-[#374151]">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("timeSlot", {
        header: "Category",
        cell: ({ getValue }) => <span className="text-[13px] font-medium text-[#6B7280] capitalize">{getValue().toLowerCase()}</span>,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-[14px] font-extrabold text-[#111827]">₹{row.original.price}</span>
            {row.original.compareAtPrice && row.original.compareAtPrice > row.original.price && (
              <span className="text-[12px] font-medium text-[#9CA3AF] line-through">₹{row.original.compareAtPrice}</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("isAvailable", {
        header: "Status",
        cell: ({ getValue }) => {
          const available = getValue()
          return (
            <Badge className={available ? "bg-[#DCFCE7] text-[#166534] border-0 hover:bg-[#DCFCE7] shadow-none font-bold px-2.5 py-0.5 text-[11px] rounded uppercase" : "bg-[#FEE2E2] text-[#DC2626] border-0 hover:bg-[#FEE2E2] shadow-none font-bold px-2.5 py-0.5 text-[11px] rounded uppercase"}>
              {available ? "Available" : "Out of Stock"}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("orderCount", {
        header: "Orders",
        cell: ({ getValue }) => <span className="text-[13px] font-medium text-[#6B7280]">{getValue()}</span>,
      }),
      columnHelper.display({
        id: "updated",
        header: "Updated",
        cell: ({ row }) => <span className="text-[13px] font-medium text-[#6B7280]">{timeAgo(row.original.updatedAt)}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-[10px] border-[#E5E7EB] bg-white text-[#9CA3AF] hover:text-[#111827] shadow-none" onClick={() => { setSelectedItem(row.original); setEditOpen(true) }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-[10px] border-[#E5E7EB] bg-white text-[#9CA3AF] hover:text-[#111827] shadow-none" onClick={() => { setSelectedItem(row.original); setEditOpen(true) }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-[10px] border-[#E5E7EB] bg-white text-[#9CA3AF] hover:text-[#111827] shadow-none">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => { setSelectedItem(row.original); setEditOpen(true) }}>Edit Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAvailabilityToggle(row.original)}>
                  {row.original.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteItem(row.original)}>Delete Item</DropdownMenuItem>
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
    },
    initialState: {
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
    <div className="space-y-6 pb-12 bg-[#F9FAFB] min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Menu Management</h1>
          <p className="text-[13px] font-medium text-[#6B7280] mt-1">Create, update and manage menu items across all kitchens</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-[12px] h-11 px-5 font-bold text-[#374151] border-[#D1D5DB] bg-white shadow-none" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button className="bg-[#15803D] hover:bg-[#166534] text-white rounded-[12px] h-11 px-6 font-bold shadow-none gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Add New Dish
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
          {[
            { title: "Total Dishes", value: stats.total.toLocaleString("en-IN"), subtitle: stats.kitchenCount > 0 ? `${stats.kitchenCount} kitchen${stats.kitchenCount !== 1 ? "s" : ""} live` : "no kitchens yet", icon: Users, color: "text-[#F97316]", bg: "bg-[#FFF7ED]" },
            { title: "Available", value: stats.available.toLocaleString("en-IN"), subtitle: `${stats.total} total dishes`, icon: ShieldCheck, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
            { title: "Out of Stock", value: stats.lowStock.toLocaleString("en-IN"), subtitle: stats.lowStock > 0 ? "items need attention" : "all items in stock", icon: XCircle, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
            { title: "Avg Price", value: `₹${stats.avgPrice.toLocaleString("en-IN")}`, subtitle: "across all dishes", icon: IndianRupee, color: "text-[#F59E0B]", bg: "bg-[#FFF7ED]" },
            { title: "Total Orders", value: stats.totalOrders.toLocaleString("en-IN"), subtitle: "lifetime order items", icon: ShoppingBag, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
            { title: "Most Ordered", value: stats.topItem?.name ?? "—", subtitle: stats.topItem ? `${stats.topItem.orderCount.toLocaleString("en-IN")} orders` : "no orders yet", icon: Star, color: "text-[#22C55E]", bg: "bg-[#F0FDF4]" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-[16px] bg-white overflow-hidden">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className={`h-[48px] w-[48px] rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[12px] font-bold text-[#6B7280] leading-tight mb-1">{stat.title}</p>
                    <h3 className="text-[22px] font-extrabold text-[#111827] leading-none truncate">{stat.value}</h3>
                  </div>
                </div>
                <p className="text-[12px] font-bold text-center mt-1 text-[#9CA3AF] truncate">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <div className="mt-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden">
        <div className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#F3F4F6]">
          <ScrollArea className="w-full xl:flex-1 min-w-0 max-w-full pb-2 xl:pb-0">
            <div className="flex flex-nowrap items-center gap-3 w-max pr-4">
              <div className="relative min-w-[220px] shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#9CA3AF]" />
              <Input
                placeholder="Search dishes..."
                className="pl-10 h-11 rounded-[12px] bg-white border-[#D1D5DB] text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-[#15803D]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="All Kitchens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kitchens</SelectItem>
                {kitchens.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.length > 0 ? (
                  cuisines.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
                ) : (
                  <SelectItem value="indian">Indian</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Veg / Non Veg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VEG">Veg</SelectItem>
                <SelectItem value="NONVEG">Non-Veg</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeSlotFilter} onValueChange={setTimeSlotFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Time Slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Slots</SelectItem>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="LUNCH">Lunch</SelectItem>
                <SelectItem value="EVENINGSNACKS">Evening</SelectItem>
                <SelectItem value="DINNER">Dinner</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="flex items-center shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-11 rounded-[12px] text-[13px] font-bold border-[#D1D5DB] bg-white text-[#374151]">
                <span className="text-[#6B7280] font-medium mr-2">Sort:</span> <SelectValue placeholder="Recently Updated" />
              </SelectTrigger>
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

        <ScrollArea className="w-full bg-white border-b border-[#F3F4F6]">
          <div className="flex items-center gap-3 p-3 px-6 w-max">
            <div className="flex items-center gap-4 mr-3 shrink-0">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              className="rounded-[4px] border-[#D1D5DB] data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
            />
            <span className="text-[13px] font-extrabold text-[#111827]">{selectedCount} Selected</span>
          </div>

          <Button size="sm" variant="outline" className="h-10 rounded-[10px] font-bold text-[#15803D] border-[#BBF7D0] bg-[#DCFCE7] hover:bg-green-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateMutation.isPending || selectedCount === 0} onClick={() => handleBulkAvailability(true)}>
            <Check className="h-4 w-4" /> Activate
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-[10px] font-bold text-[#EA580C] border-[#FED7AA] bg-[#FFF7ED] hover:bg-orange-100 gap-2 px-4 shrink-0 shadow-none" disabled={updateMutation.isPending || selectedCount === 0} onClick={() => handleBulkAvailability(false)}>
            <Power className="h-4 w-4" /> Deactivate
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-[10px] font-bold text-[#F97316] border-[#F97316] bg-white hover:bg-orange-50 gap-2 px-4 shrink-0 shadow-none" disabled={selectedCount === 0} onClick={() => { setBulkPrice(""); setPriceDialogOpen(true) }}>
            <IndianRupee className="h-4 w-4" /> Change Price
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-[10px] font-bold text-[#15803D] border-[#15803D] bg-white hover:bg-green-50 gap-2 px-4 shrink-0 shadow-none" disabled={selectedCount === 0} onClick={() => setMoveDialogOpen(true)}>
            <MoveRight className="h-4 w-4" /> Move Kitchen
          </Button>
          <Button size="sm" variant="outline" className="h-10 rounded-[10px] font-bold text-[#DC2626] border-[#DC2626] bg-white hover:bg-red-50 gap-2 px-4 shrink-0 shadow-none" disabled={deleteMutation.isPending || selectedCount === 0} onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <ScrollArea className="w-full">
          <div className="min-w-[1200px] [&_th]:text-[12px] [&_th]:font-bold [&_th]:text-[#6B7280] [&_th]:bg-white [&_th]:py-4 [&_th]:px-4 [&_th]:border-b [&_th]:border-[#F3F4F6] [&_td]:py-2 [&_td]:px-4 [&_td]:border-b [&_td]:border-[#F3F4F6]">
            {isLoading ? <TableSkeleton /> : <DataTable table={table} emptyMessage={searchQuery || kitchenFilter !== "all" || foodTypeFilter !== "all" || statusFilter !== "all" ? "No menu items match your filters" : "No menu items yet"} />}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <p className="text-[13px] font-medium text-[#6B7280]">
            Showing {filteredRows.length === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredRows.length)} of {filteredRows.length.toLocaleString("en-IN")} menu items
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{"<"}</Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 rounded-md p-0 text-[13px] font-extrabold ${i === currentPage ? "bg-[#15803D] text-white shadow-none" : "text-[#6B7280] hover:bg-gray-100"}`}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-[13px] font-extrabold text-gray-500 px-1">...</span>}
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md p-0 border-[#E5E7EB] bg-white text-[#6B7280]" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{">"}</Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-[#6B7280]">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => { const n = Number(v); setPageSize(n); table.setPageSize(n) }}>
                <SelectTrigger className="w-[70px] h-9 rounded-lg text-[13px] font-bold border-[#E5E7EB]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="p-4 px-6 bg-[#F9FAFB] border-t border-[#F3F4F6] flex items-center gap-2 text-[12px] font-bold text-[#166534]">
          <div className="h-4 w-4 rounded-full border border-[#166534] flex items-center justify-center"><Check className="h-3 w-3" /></div>
          All changes are saved automatically. {rows.length > 0 ? <>Last updated {timeAgo(rows.reduce((max, r) => (r.updatedAt > max ? r.updatedAt : max), rows[0].updatedAt))}.</> : "No data loaded yet."}
        </div>
      </div>

      {/* Edit Menu Item Side Panel */}
      <Sheet open={editOpen && !!selectedItem} onOpenChange={(open) => { if (!open) { setEditOpen(false); setSelectedItem(null) } }}>
        <SheetContent className="w-full sm:max-w-[850px] p-0 flex flex-col bg-white border-l-0 shadow-2xl z-[100]">
          {selectedItem && <MenuEditMode item={selectedItem} onClose={() => { setEditOpen(false); setSelectedItem(null) }} />}
        </SheetContent>
      </Sheet>

      {/* Create Menu Item */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-extrabold text-[#111827] tracking-tight">Add New Dish</DialogTitle>
            <DialogDescription>
              Create a new menu item and it will appear live across all kitchens.
            </DialogDescription>
          </DialogHeader>
          <CreateMenuItemForm onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Bulk Change Price */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Price for {selectedCount} item{selectedCount !== 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Set a new price for all selected menu items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">New Price (₹) <span className="text-[#DC2626]">*</span></Label>
            <Input
              type="number"
              min={0}
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="e.g. 249"
              className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={updateMutation.isPending || !bulkPrice || Number(bulkPrice) <= 0 || selectedCount === 0}
              onClick={async () => {
                const price = Number(bulkPrice)
                const results = await Promise.all(
                  selectedRows.map((r) => updateMutation.mutateAsync({ id: r.id, data: { price } })),
                )
                if (results.every((r) => r.success)) {
                  toast.success(`Price updated for ${results.length} item${results.length !== 1 ? "s" : ""}`)
                  setPriceDialogOpen(false)
                  setRowSelection({})
                } else {
                  toast.error("Failed to update some items")
                }
              }}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Kitchen */}
      <MoveKitchenDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen} rows={selectedRows} onDone={() => setRowSelection({})} />

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

function CreateMenuItemForm({ onClose }: { onClose: () => void }) {
  const { data: kitchenData, isLoading: kitchensLoading } = useAdminKitchensWithMenusQuery()
  const createMutation = useCreateMenuItemMutation()

  const [kitchenId, setKitchenId] = useState("")
  const [menuId, setMenuId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [foodType, setFoodType] = useState("VEG")
  const [timeSlot, setTimeSlot] = useState("LUNCH")
  const [availableFor, setAvailableFor] = useState("BOTH")
  const [cuisine, setCuisine] = useState("")

  const selectedKitchen = kitchenData?.find((k) => k.id === kitchenId)

  const handleSubmit = async () => {
    if (!menuId || !name.trim() || !price || Number(price) <= 0) {
      toast.error("Please fill in Kitchen, Menu, Dish Name and Price")
      return
    }
    const res = await createMutation.mutateAsync({
      menuId,
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      foodType,
      timeSlot,
      availableFor: availableFor as "TODAY" | "TOMORROW" | "BOTH",
      cuisine: cuisine.trim() || undefined,
    })
    if (res.success) {
      toast.success("Menu item created")
      onClose()
    } else {
      toast.error(res.error ?? "Failed to create menu item")
    }
  }

  return (
    <div className="space-y-5 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Kitchen <span className="text-[#DC2626]">*</span></Label>
          <Select value={kitchenId} onValueChange={(v) => { setKitchenId(v); setMenuId("") }}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4">
              <SelectValue placeholder={kitchensLoading ? "Loading kitchens..." : "Select kitchen"} />
            </SelectTrigger>
            <SelectContent>
              {kitchenData?.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Menu <span className="text-[#DC2626]">*</span></Label>
          <Select value={menuId} onValueChange={setMenuId} disabled={!kitchenId}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4">
              <SelectValue placeholder={!kitchenId ? "Select kitchen first" : "Select menu"} />
            </SelectTrigger>
            <SelectContent>
              {(selectedKitchen?.menus ?? []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[13px] font-extrabold text-[#374151]">Dish Name <span className="text-[#DC2626]">*</span></Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
      </div>

      <div className="space-y-2">
        <Label className="text-[13px] font-extrabold text-[#374151]">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[90px] text-[14px] font-medium text-[#374151] rounded-[12px] border-[#D1D5DB] resize-none p-4 leading-relaxed" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Price (₹) <span className="text-[#DC2626]">*</span></Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0} className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">MRP (₹)</Label>
          <Input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" min={0} className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Food Type</Label>
          <Select value={foodType} onValueChange={setFoodType}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="VEG">Veg</SelectItem>
              <SelectItem value="NONVEG">Non-Veg</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Time Slot</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4 capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MORNING">Morning</SelectItem>
              <SelectItem value="LUNCH">Lunch</SelectItem>
              <SelectItem value="EVENINGSNACKS">Evening</SelectItem>
              <SelectItem value="DINNER">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Available For</Label>
          <Select value={availableFor} onValueChange={setAvailableFor}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="TOMORROW">Tomorrow</SelectItem>
              <SelectItem value="BOTH">Today & Tomorrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[13px] font-extrabold text-[#374151]">Cuisine</Label>
        <Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Indian, Chinese" className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
      </div>

      <div className="pt-2 flex justify-end gap-3 border-t border-[#F3F4F6]">
        <Button variant="outline" onClick={onClose} className="h-11 px-8 text-[14px] font-bold text-[#374151] border-[#D1D5DB] rounded-[12px] bg-white shadow-none">Cancel</Button>
        <Button className="h-11 px-8 text-[14px] font-bold bg-[#15803D] hover:bg-[#166534] text-white rounded-[12px] shadow-none gap-2" disabled={createMutation.isPending} onClick={handleSubmit}>
          {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Create Dish
        </Button>
      </div>
    </div>
  )
}

function MoveKitchenDialog({ open, onOpenChange, rows, onDone }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: AdminMenuItemRow[]
  onDone: () => void
}) {
  const { data: kitchenData, isLoading: kitchensLoading } = useAdminKitchensWithMenusQuery()
  const updateMutation = useUpdateMenuItemMutation()
  const [kitchenId, setKitchenId] = useState("")
  const [menuId, setMenuId] = useState("")

  const selectedKitchen = kitchenData?.find((k) => k.id === kitchenId)

  const handleMove = async () => {
    if (!menuId || rows.length === 0) return
    const results = await Promise.all(
      rows.map((r) => updateMutation.mutateAsync({ id: r.id, data: { menuId } })),
    )
    if (results.every((r) => r.success)) {
      toast.success(`Moved ${results.length} item${results.length !== 1 ? "s" : ""} to new kitchen`)
      onDone()
      onOpenChange(false)
    } else {
      toast.error("Failed to move some items")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setKitchenId(""); setMenuId("") } }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Move {rows.length} item{rows.length !== 1 ? "s" : ""} to another kitchen</DialogTitle>
          <DialogDescription>
            Items will be moved under the selected kitchen&apos;s menu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Target Kitchen <span className="text-[#DC2626]">*</span></Label>
            <Select value={kitchenId} onValueChange={(v) => { setKitchenId(v); setMenuId("") }}>
              <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4">
                <SelectValue placeholder={kitchensLoading ? "Loading kitchens..." : "Select kitchen"} />
              </SelectTrigger>
              <SelectContent>
                {kitchenData?.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Target Menu <span className="text-[#DC2626]">*</span></Label>
            <Select value={menuId} onValueChange={setMenuId} disabled={!kitchenId}>
              <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4">
                <SelectValue placeholder={!kitchenId ? "Select kitchen first" : "Select menu"} />
              </SelectTrigger>
              <SelectContent>
                {(selectedKitchen?.menus ?? []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={updateMutation.isPending || !menuId || rows.length === 0} onClick={handleMove}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Move Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MenuEditMode({ item, onClose }: { item: AdminMenuItemRow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("basic")
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? "")
  const [price, setPrice] = useState(String(item.price))
  const [compareAtPrice, setCompareAtPrice] = useState(item.compareAtPrice ? String(item.compareAtPrice) : "")
  const [foodType, setFoodType] = useState(item.foodType)
  const [timeSlot, setTimeSlot] = useState(item.timeSlot)
  const [availableFor, setAvailableFor] = useState(item.availableFor)
  const [isAvailable, setIsAvailable] = useState(item.isAvailable)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isChefSpecial, setIsChefSpecial] = useState(false)
  const [cuisine, setCuisine] = useState(item.cuisine ?? "")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const discount = useMemo(() => {
    const p = parseFloat(price)
    const mrp = parseFloat(compareAtPrice)
    if (p > 0 && mrp > p) return Math.round((1 - p / mrp) * 100)
    return 0
  }, [price, compareAtPrice])

  const saveMutation = useUpdateMenuItemMutation()
  const addPhotoMutation = useAddMenuItemPhotoMutation()
  const deletePhotoMutation = useDeleteMenuItemPhotoMutation()

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput("")
  }

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
        cuisine: cuisine.trim() || null,
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
      <SheetHeader className="p-8 pb-0 space-y-0 text-left bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <SheetTitle className="text-[24px] font-extrabold text-[#111827] tracking-tight">Edit Menu Item</SheetTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6B7280] hover:bg-gray-100" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        
        <ScrollArea className="w-full mt-1">
          <div className="flex gap-7 text-[13px] font-bold w-max pr-4">
            {(["basic", "pricing", "availability", "images", "more"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-4 capitalize transition-colors ${activeTab === tab ? "border-b-[3px] border-[#15803D] text-[#15803D]" : "text-[#6B7280] hover:text-[#111827] border-b-[3px] border-transparent"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </SheetHeader>

      <ScrollArea className="flex-1 bg-white w-full">
        <div className="p-6 sm:p-8 space-y-7 min-w-[280px]">
        {activeTab === "images" && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {item.photos.map((p, idx) => (
            <div key={p.id} className="relative group">
              <Image src={p.imageUrl} alt="" className={`w-full aspect-square rounded-[16px] object-cover bg-gray-100 ${idx === 0 ? "border-2 border-[#15803D]" : "border border-[#E5E7EB]"}`} />
              {idx === 0 && (
                <span className="absolute top-4 left-4 bg-[#16A34A] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wide">Cover</span>
              )}
              <button
                type="button"
                onClick={() => {
                  toast("Remove this photo?", {
                    action: {
                      label: "Remove",
                      onClick: () => handleDeletePhoto(p.id)
                    },
                  })
                }}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 hover:bg-red-50 text-red-600 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <CloudinaryUpload onUpload={(result) => handleAddPhoto(result.secure_url)}>
            {({ uploading, startUpload }) => (
              <div 
                onClick={startUpload}
                className={`w-full aspect-square rounded-[16px] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center bg-[#F9FAFB] hover:bg-gray-50 transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-[#9CA3AF] mb-3 animate-spin" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-[#9CA3AF] mb-3" />
                )}
                <span className="text-[14px] font-extrabold text-[#111827] mb-1">Upload Image</span>
                <span className="text-[12px] font-medium text-[#6B7280]">Drag & drop or click</span>
              </div>
            )}
          </CloudinaryUpload>
        </div>
        </>
        )}

        {activeTab === "basic" && (
        <>
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Dish Name <span className="text-[#DC2626]">*</span></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
        </div>
        
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[110px] text-[14px] font-medium text-[#374151] rounded-[12px] border-[#D1D5DB] resize-none p-4 leading-relaxed" />
        </div>
        
        <div className="space-y-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Cuisine</Label>
          <Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Indian, Chinese" className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Food Type</Label>
            <Select value={foodType} onValueChange={setFoodType}>
              <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VEG">Veg</SelectItem>
                <SelectItem value="NONVEG">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4 capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="LUNCH">Lunch</SelectItem>
                <SelectItem value="EVENINGSNACKS">Evening</SelectItem>
                <SelectItem value="DINNER">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </>
        )}

        {activeTab === "pricing" && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Price (₹) <span className="text-[#DC2626]">*</span></Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">MRP (₹)</Label>
            <Input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-extrabold text-[#374151]">Discount</Label>
            <div className="h-11 rounded-[12px] border border-[#D1D5DB] bg-[#F9FAFB] text-[14px] font-bold text-[#15803D] px-4 flex items-center">
              {discount > 0 ? `${discount}% OFF` : "—"}
            </div>
          </div>
        </div>
        <p className="text-[12px] font-medium text-[#6B7280] -mt-3">Discount is auto-calculated from Price and MRP.</p>
        </>
        )}

        {activeTab === "availability" && (
        <>
        <div className="flex items-center gap-4">
          <Label className="text-[13px] font-extrabold text-[#111827] flex-1">Available for ordering</Label>
          <Switch checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-[#16A34A] shrink-0" />
        </div>
        <div className="space-y-2 pt-2">
          <Label className="text-[13px] font-extrabold text-[#374151]">Available For</Label>
          <Select value={availableFor} onValueChange={setAvailableFor}>
            <SelectTrigger className="h-11 rounded-[12px] border-[#D1D5DB] text-[14px] font-bold text-[#111827] px-4"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="TOMORROW">Tomorrow</SelectItem>
              <SelectItem value="BOTH">Today & Tomorrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </>
        )}

        {activeTab === "more" && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-extrabold text-[#111827] flex-1">Featured</Label>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} className="data-[state=checked]:bg-[#16A34A] shrink-0" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-[13px] font-extrabold text-[#111827] flex-1">Chef Special</Label>
            <Switch checked={isChefSpecial} onCheckedChange={setIsChefSpecial} className="data-[state=checked]:bg-[#16A34A] shrink-0" />
          </div>
        </div>

        <div className="space-y-2 pb-6">
          <Label className="text-[13px] font-extrabold text-[#374151]">Tags</Label>
          <div className="flex flex-wrap items-center gap-2 p-2 px-3 border border-[#D1D5DB] rounded-[12px] min-h-[46px]">
            {tags.map((tag) => (
              <span key={tag} className="bg-[#F3F4F6] text-[#374151] text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#E5E7EB]">
                {tag}
                <X className="h-3 w-3 text-[#9CA3AF] cursor-pointer" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} />
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }}
              placeholder="Type a tag and press Enter"
              className="flex-1 outline-none text-[14px] font-medium bg-transparent min-w-[50px] px-1"
            />
          </div>
          <p className="text-[12px] font-medium text-[#6B7280]">Tags are for reference only and are not saved to the database yet.</p>
        </div>
        </>
        )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="p-6 border-t border-[#E5E7EB] bg-white flex flex-wrap-reverse sm:flex-nowrap justify-end gap-3 sticky bottom-0 z-20">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-11 px-8 text-[14px] font-bold text-[#374151] border-[#D1D5DB] rounded-[12px] bg-white shadow-none mt-2 sm:mt-0">Cancel</Button>
        <Button className="w-full sm:w-auto h-11 px-8 text-[14px] font-bold bg-[#15803D] hover:bg-[#166534] text-white rounded-[12px] shadow-none gap-2" disabled={saveMutation.isPending} onClick={handleSave}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Save Changes
        </Button>
      </div>
    </>
  )
}