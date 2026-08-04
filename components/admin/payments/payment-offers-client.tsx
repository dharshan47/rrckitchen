"use client"

import { useState, useMemo, useEffect } from "react"
import {
  AdminPaymentOffer,
  useAdminPaymentOffers,
  useAdminPaymentOffersQuery,
  useCreatePaymentOfferMutation,
  useUpdatePaymentOfferMutation,
  useDeletePaymentOfferMutation,
} from "@/stores"
import {
  Search,
  Download,
  RefreshCcw,
  Tag,
  CheckCircle2,
  Clock,
  Plus,
  XCircle,
  Calendar,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Zap,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PaymentOffer = AdminPaymentOffer

type OfferStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "INACTIVE"

function getOfferStatus(o: PaymentOffer): OfferStatus {
  const now = Date.now()
  if (!o.isActive) return "INACTIVE"
  if (now > new Date(o.validTo).getTime()) return "EXPIRED"
  if (now < new Date(o.validFrom).getTime()) return "UPCOMING"
  return "ACTIVE"
}

function formatDateRange(from: string, to: string) {
  const f = new Date(from)
  const t = new Date(to)
  const formatStr = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
  return `${formatStr(f)} - ${formatStr(t)}`
}

const getOfferTypeBadge = (type: string) => {
  switch (type) {
    case "UPI":
      return (
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-blue-50">
            <Smartphone className="h-3 w-3 text-blue-600" />
          </div>
          <span className="text-[11px] font-medium text-gray-900">UPI</span>
        </div>
      )
    case "CARDS":
      return (
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-orange-50">
            <CreditCard className="h-3 w-3 text-orange-600" />
          </div>
          <span className="text-[11px] font-medium text-gray-900">Cards</span>
        </div>
      )
    case "NETBANKING":
      return (
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-indigo-50">
            <Landmark className="h-3 w-3 text-indigo-600" />
          </div>
          <span className="text-[11px] font-medium text-gray-900">Net Banking</span>
        </div>
      )
    case "WALLET":
      return (
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-purple-50">
            <Wallet className="h-3 w-3 text-purple-600" />
          </div>
          <span className="text-[11px] font-medium text-gray-900">Wallet</span>
        </div>
      )
    case "ALL":
      return (
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-green-50">
            <Zap className="h-3 w-3 text-green-600" />
          </div>
          <span className="text-[11px] font-medium text-gray-900">All Methods</span>
        </div>
      )
    default:
      return <span className="text-[11px] font-medium text-gray-900">{type}</span>
  }
}

const statusMeta: Record<OfferStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "text-green-600 border-green-200 bg-green-50/50",
  },
  UPCOMING: {
    label: "Upcoming",
    className: "text-orange-500 border-orange-200 bg-orange-50/50",
  },
  EXPIRED: {
    label: "Expired",
    className: "text-red-500 border-red-200 bg-red-50/50",
  },
  INACTIVE: {
    label: "Inactive",
    className: "text-gray-500 border-gray-200 bg-gray-50/50",
  },
}

const columnHelper = createColumnHelper<PaymentOffer>()

function offersToCSV(offers: PaymentOffer[]) {
  const header = [
    "Name",
    "Description",
    "Offer Type",
    "Discount Type",
    "Discount Value",
    "Max Discount",
    "Min Order",
    "Valid From",
    "Valid To",
    "Status",
  ]
  const rows = offers.map((o) => [
    `"${o.name.replace(/"/g, '""')}"`,
    `"${(o.description ?? "").replace(/"/g, '""')}"`,
    o.offerType,
    o.discountType,
    o.discountValue,
    o.maxDiscount ?? "",
    o.minOrderValue ?? "",
    o.validFrom,
    o.validTo,
    getOfferStatus(o),
  ])
  return [header, ...rows].map((r) => r.join(",")).join("\n")
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/* ------------------------- Skeleton components ------------------------- */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-2"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="text-right flex flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-28 rounded-md mt-1" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="border-t border-border/50 animate-pulse">
      {/* header */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-border/50">
        <Skeleton className="h-3.5 w-5 rounded-md" />
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-16 rounded-md" />
        <Skeleton className="h-3.5 w-14 rounded-md" />
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-12 rounded-md" />
        <Skeleton className="h-3.5 w-14 rounded-md" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-4 py-3.5 border-b border-border/50"
        >
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <Skeleton className="h-3 w-40 rounded-md" />
            <Skeleton className="h-2.5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-2.5 w-12 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-14 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------------ */

export default function PaymentOffersPage() {
  const [rowSelection, setRowSelection] = useState({})

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<PaymentOffer | null>(null)

  // Filters State
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState<"ALL" | OfferStatus>("ALL")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offerType: "ALL",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscount: 100,
    minOrderValue: 200,
    validFrom: new Date().toISOString().slice(0, 16),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
  })

  const { refetch, isFetching, isLoading } = useAdminPaymentOffersQuery()
  const offers = useAdminPaymentOffers()

  const createMutation = useCreatePaymentOfferMutation()
  const updateMutation = useUpdatePaymentOfferMutation()
  const deleteMutation = useDeletePaymentOfferMutation()

  const handleOpenDialog = (offer?: PaymentOffer) => {
    if (offer) {
      setEditingOffer(offer)
      setFormData({
        name: offer.name,
        description: offer.description || "",
        offerType: offer.offerType,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        maxDiscount: offer.maxDiscount || 0,
        minOrderValue: offer.minOrderValue || 0,
        validFrom: new Date(offer.validFrom).toISOString().slice(0, 16),
        validTo: new Date(offer.validTo).toISOString().slice(0, 16),
        isActive: offer.isActive,
      })
    } else {
      setEditingOffer(null)
      setFormData({
        name: "",
        description: "",
        offerType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscount: 100,
        minOrderValue: 200,
        validFrom: new Date().toISOString().slice(0, 16),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Offer name is required")
      return
    }
    if (formData.discountValue <= 0) {
      toast.error("Discount value must be positive")
      return
    }
    if (formData.maxDiscount <= 0 && formData.discountType === "PERCENTAGE") {
      toast.error("Max discount must be positive")
      return
    }
    const from = new Date(formData.validFrom)
    const to = new Date(formData.validTo)
    if (!from.getTime() || !to.getTime()) {
      toast.error("Enter valid offer dates")
      return
    }
    if (to <= from) {
      toast.error("Valid To must be after Valid From")
      return
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      offerType: formData.offerType as "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL",
      discountType: formData.discountType as "FLAT" | "PERCENTAGE",
      discountValue: formData.discountValue,
      maxDiscount: formData.discountType === "FLAT" ? null : formData.maxDiscount,
      minOrderValue: formData.minOrderValue || null,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      isActive: formData.isActive,
    }

    if (editingOffer) {
      updateMutation.mutateAsync({ id: editingOffer.id, data: payload }).then((res) => {
        if (res.success) {
          toast.success("Offer updated successfully")
          setIsDialogOpen(false)
        } else {
          toast.error(res.error || "Failed to update offer")
        }
      })
    } else {
      createMutation.mutateAsync(payload).then((res) => {
        if (res.success) {
          toast.success("Offer created successfully")
          setIsDialogOpen(false)
        } else {
          toast.error(res.error || "Failed to create offer")
        }
      })
    }
  }

  const handleExport = () => {
    if (filteredOffers.length === 0) {
      toast.error("No offers to export")
      return
    }
    downloadCSV("payment-offers.csv", offersToCSV(filteredOffers))
    toast.success(`${filteredOffers.length} offers exported`)
  }

  const resetFilters = () => {
    setSearch("")
    setStatusTab("ALL")
    setStatusFilter("all")
    setMethodFilter("all")
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  // Real derived stats
  const totalOffers = offers.length
  const statuses = offers.map(getOfferStatus)
  const activeCount = statuses.filter((s) => s === "ACTIVE").length
  const now = Date.now()
  const expiringSoon = offers.filter((o) => {
    const st = getOfferStatus(o)
    if (st !== "ACTIVE") return false
    return new Date(o.validTo).getTime() - now > 0 && new Date(o.validTo).getTime() - now <= 7 * 24 * 60 * 60 * 1000
  }).length
  const newThisMonth = offers.filter((o) => {
    const created = new Date(o.createdAt ?? o.validFrom)
    const m = new Date()
    return created.getMonth() === m.getMonth() && created.getFullYear() === m.getFullYear()
  }).length

  const stats = [
    {
      title: "Total Offers",
      value: totalOffers,
      trend: `${newThisMonth} new this month`,
      trendUp: true,
      icon: Tag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Offers",
      value: activeCount,
      trend: totalOffers > 0 ? `${Math.round((activeCount / totalOffers) * 100)}% of total` : "No offers yet",
      trendUp: null,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      trend: "Within 7 days",
      trendUp: expiringSoon > 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Expired",
      value: statuses.filter((s) => s === "EXPIRED").length,
      trend: "Past validity",
      trendUp: null,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ]

  // Filtering
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const st = getOfferStatus(o)
      if (statusTab !== "ALL" && statusTab !== st) return false
      if (statusFilter !== "all" && statusFilter !== st) return false
      if (methodFilter !== "all" && methodFilter !== o.offerType) return false
      if (
        search.trim() &&
        !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !(o.description || "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [offers, statusTab, statusFilter, methodFilter, search])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredOffers.length / pagination.pageSize) - 1)
    if (pagination.pageIndex > maxPage) {
      setPagination((p) => ({ ...p, pageIndex: maxPage }))
    }
  }, [filteredOffers.length, pagination.pageSize, pagination.pageIndex])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <div className="flex justify-center ml-2">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="border-gray-300 text-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center ml-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="border-gray-300 text-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
            />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "OFFER DETAILS",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="font-semibold text-xs text-gray-900 tracking-tight">
              {row.original.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate w-full max-w-[250px]">
              {row.original.description || "No description"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("offerType", {
        header: "PAYMENT METHOD",
        cell: ({ getValue }) => getOfferTypeBadge(getValue()),
      }),
      columnHelper.display({
        id: "discount",
        header: "DISCOUNT",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-green-700">
              {row.original.discountType === "FLAT"
                ? `₹${row.original.discountValue} OFF`
                : `${row.original.discountValue}% OFF`}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {row.original.maxDiscount ? `Up to ₹${row.original.maxDiscount}` : "No max limit"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("minOrderValue", {
        header: "MIN ORDER",
        cell: ({ row }) => (
          <span className="font-medium text-xs text-gray-900">
            {row.original.minOrderValue ? `₹${row.original.minOrderValue}` : "None"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "validity",
        header: "VALIDITY",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-gray-700">
              {formatDateRange(row.original.validFrom, row.original.validTo)}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "STATUS",
        cell: ({ row }) => {
          const meta = statusMeta[getOfferStatus(row.original)]
          return (
            <Badge
              variant="outline"
              className={cn(
                "shadow-none font-medium px-2 py-0 h-6 text-[10px] tracking-wide rounded",
                meta.className
              )}
            >
              {meta.label}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={() => handleOpenDialog(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenDialog(row.original)}>
                  Edit Offer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateMutation.mutateAsync({
                      id: row.original.id,
                      data: { isActive: !row.original.isActive },
                    }).then((res) => {
                      if (res.success) {
                        toast.success("Offer updated successfully")
                        setIsDialogOpen(false)
                      } else {
                        toast.error(res.error || "Failed to update offer")
                      }
                    })
                  }
                >
                  Toggle Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this offer?"))
                      deleteMutation.mutateAsync(row.original.id).then((res) => {
                        if (res.success) {
                          toast.success("Offer deleted successfully")
                        } else {
                          toast.error(res.error || "Failed to delete offer")
                        }
                      })
                  }}
                >
                  Delete Offer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data: filteredOffers,
    columns,
    state: {
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageStart = Math.max(0, Math.min(currentPage - 2, totalPages - 5))
  const pageEnd = Math.min(totalPages, pageStart + 5)

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Offers</h1>
          <p className="text-sm text-muted-foreground">
            Manage discounts and promotional payment offers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 text-sm shadow-sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-sm shadow-sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            className="gap-2 text-sm shadow-sm bg-green-700 hover:bg-green-800 text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4" /> Create Offer
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="shadow-sm border-0 ring-1 ring-border/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-full ${stat.bg} shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold leading-none">{stat.value}</h3>
                  </div>
                </div>
                <p
                  className={`text-[10px] font-medium mt-1 ${
                    stat.trendUp === true
                      ? "text-green-600"
                      : stat.trendUp === false
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Table */}
      <Card className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
        <div className="p-3 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
                placeholder="Search offers..."
                className="pl-8 h-8 text-xs bg-gray-50/50 rounded-md"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50/50 rounded-md">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={methodFilter}
              onValueChange={(v) => {
                setMethodFilter(v)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
            >
              <SelectTrigger className="w-[150px] h-8 text-xs bg-gray-50/50 rounded-md">
                <SelectValue placeholder="Method: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Method: All</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CARDS">Cards</SelectItem>
                <SelectItem value="NETBANKING">Net Banking</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="ALL">All Methods</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-1.5 h-8 text-xs bg-white rounded-md"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3 w-3 text-muted-foreground" /> Reset
            </Button>
          </div>
        </div>

        <div className="p-3 border-b border-border/50 flex flex-wrap items-center gap-3">
          {(
            [
              { key: "ALL", label: "All Offers" },
              { key: "ACTIVE", label: "Active" },
              { key: "EXPIRED", label: "Expired" },
              { key: "INACTIVE", label: "Inactive" },
            ] as { key: "ALL" | OfferStatus; label: string }[]
          ).map((tab) => {
            const count =
              tab.key === "ALL"
                ? offers.length
                : offers.filter((o) => getOfferStatus(o) === tab.key).length
            const active = statusTab === tab.key
            return (
              <Button
                key={tab.key}
                variant="outline"
                onClick={() => {
                  setStatusTab(tab.key)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5 px-3",
                  active
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-gray-600 bg-white border-transparent shadow-none"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "px-1 rounded text-[10px]",
                    active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {count}
                </span>
              </Button>
            )
          })}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="p-0 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_td]:py-3 border-b border-border/50">
              <DataTable table={table} emptyMessage="No offers found" />
            </div>

            <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
              <p className="text-xs text-muted-foreground">
                Showing {filteredOffers.length === 0 ? 0 : currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, filteredOffers.length)} of{" "}
                {filteredOffers.length} offers
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: pageEnd - pageStart }).map((_, idx) => {
                    const page = pageStart + idx
                    return (
                      <Button
                        key={page}
                        variant="default"
                        size="sm"
                        onClick={() => table.setPageIndex(page)}
                        className={cn(
                          "h-7 w-7 p-0 font-medium",
                          currentPage === page
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none"
                        )}
                      >
                        {page + 1}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                  <span className="text-xs text-muted-foreground">Rows per page</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) =>
                      setPagination({ pageIndex: 0, pageSize: Number(v) })
                    }
                  >
                    <SelectTrigger className="w-[70px] h-7 text-xs border bg-transparent">
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
          </>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Payment Offer" : "Create New Offer"}</DialogTitle>
            <DialogDescription>
              {editingOffer
                ? "Update the details of the promotional offer."
                : "Configure a new promotional payment offer."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Offer Name</Label>
              <Input
                placeholder="e.g. SUPER10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Offer details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Payment Method</Label>
                <Select
                  value={formData.offerType}
                  onValueChange={(v) => setFormData({ ...formData, offerType: v })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARDS">Cards</SelectItem>
                    <SelectItem value="NETBANKING">Net Banking</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value) })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Max Discount (₹)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                  }
                  className="h-9 text-sm"
                  disabled={formData.discountType === "FLAT"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Valid From</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Valid To</Label>
                <Input
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2 mt-2">
              <Label className="text-xs font-semibold">Minimum Order Value (₹)</Label>
              <Input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                }
                className="h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 mt-4 p-3 border rounded-lg bg-gray-50/50">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                className="data-[state=checked]:bg-green-600"
              />
              <div className="flex flex-col gap-0.5">
                <Label className="text-sm font-semibold">Offer is Active</Label>
                <span className="text-[10px] text-muted-foreground">
                  Customers can apply this offer during checkout.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-9 text-xs bg-green-700 hover:bg-green-800 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}