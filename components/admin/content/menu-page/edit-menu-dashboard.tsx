"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X, Eye, Save, Search, Plus,
  ChevronLeft, ChevronRight, Star,
  Trash2, Image as ImageIcon, CheckCircle2,
  Clock, UtensilsCrossed, ShieldCheck,
  Package, Users, Loader2, RefreshCw, ImagePlus,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import {
  getAdminMenuItemsByKitchen,
  getAdminMenuEditorOptions,
  saveAdminMenuItem,
  createAdminMenuItem,
  type SaveAdminMenuItemData,
} from "@/actions/admin/admin-menu-cms"
import {
  useEditorKitchenId,
  useEditorKitchenName,
  useEditorSelectedItemId,
  useEditorDirtyIds,
  useEditorDraft,
  useEditorActions,
  type EditorHighlight,
  menuEditorStore,
} from "@/stores/menuEditorStore"

const FOOD_TYPES = [
  { value: "VEG", label: "Veg" },
  { value: "NONVEG", label: "Non-Veg" },
] as const

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning" },
  { value: "LUNCH", label: "Lunch" },
  { value: "EVENINGSNACKS", label: "Evening Snacks" },
  { value: "DINNER", label: "Dinner" },
] as const

const AVAILABLE_FOR = [
  { value: "TODAY", label: "Today" },
  { value: "TOMORROW", label: "Tomorrow" },
  { value: "BOTH", label: "Both" },
] as const

const KITCHEN_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-[#EFF8F2] text-[#087A35] border-transparent" },
  APPROVED: { label: "Approved", className: "bg-[#EFF6FF] text-[#2563EB] border-transparent" },
  PENDINGAPPROVAL: { label: "Pending Approval", className: "bg-[#FFF7E6] text-[#B45309] border-transparent" },
  SUSPENDED: { label: "Suspended", className: "bg-[#FEF2F2] text-[#C81E3A] border-transparent" },
  REJECTED: { label: "Rejected", className: "bg-[#FEF2F2] text-[#C81E3A] border-transparent" },
}

interface EditMenuDashboardProps {
  onClose: () => void
}

function numOrNull(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export function EditMenuDashboard({ onClose }: EditMenuDashboardProps) {
  const queryClient = useQueryClient()
  const kitchenId = useEditorKitchenId()
  const kitchenName = useEditorKitchenName()
  const selectedItemId = useEditorSelectedItemId()
  const dirtyIds = useEditorDirtyIds()
  const draft = useEditorDraft(selectedItemId)
  const { selectItem, ensureDrafts, updateDraft, removePhotoFromDraft, markSaved, clearDrafts, openEditor } = useEditorActions()

  const [activeTab, setActiveTab] = useState("Basic Information")
  const tabs = ["Basic Information", "Images", "Pricing & Availability", "Delivery & Service", "Highlights", "SEO & Visibility"]
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("az")
  const [previewIndex, setPreviewIndex] = useState(0)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-menu-items", kitchenId],
    queryFn: () => getAdminMenuItemsByKitchen(kitchenId ?? ""),
    enabled: !!kitchenId,
  })

  const { data: options } = useQuery({
    queryKey: ["admin-menu-editor-options"],
    queryFn: getAdminMenuEditorOptions,
  })

  const selectedRow = useMemo(() => items?.find((i) => i.id === selectedItemId), [items, selectedItemId])
  const selectedKitchen = useMemo(
    () => options?.kitchens.find((k) => k.id === kitchenId),
    [options, kitchenId]
  )
  const kitchenStatusBadge = selectedKitchen ? KITCHEN_STATUS_BADGES[selectedKitchen.status] : null

  useEffect(() => {
    if (!items || items.length === 0) return
    ensureDrafts(items)
    if (!selectedItemId || !items.some((i) => i.id === selectedItemId)) {
      selectItem(items[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const query = searchTerm.trim().toLowerCase()
    let filtered = items
    if (query) filtered = filtered.filter((i) => i.name.toLowerCase().includes(query))
    if (statusFilter === "Active") filtered = filtered.filter((i) => i.isAvailable)
    if (statusFilter === "Inactive") filtered = filtered.filter((i) => !i.isAvailable)
    return [...filtered].sort((a, b) =>
      sortBy === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
    )
  }, [items, searchTerm, statusFilter, sortBy])

  const saveMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const d = menuEditorStore.getState().drafts[itemId]
      if (!d) throw new Error("Draft not found")
      const payload: SaveAdminMenuItemData = {
        name: d.name,
        description: d.description || null,
        price: d.price,
        compareAtPrice: d.compareAtPrice,
        foodType: d.foodType,
        timeSlot: d.timeSlot,
        availableFor: d.availableFor,
        isAvailable: d.isAvailable,
        categoryId: d.categoryId,
        cuisine: d.cuisine || null,
        bestseller: d.bestseller,
        highlights: d.highlights,
        aboutTitle: d.aboutTitle || null,
        aboutDescription: d.aboutDescription || null,
        serves: d.serves,
        portionSize: d.portionSize || null,
        shelfLife: d.shelfLife || null,
        allergens: d.allergens || null,
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        deliveryTimeMin: d.deliveryTimeMin,
        deliveryTimeMax: d.deliveryTimeMax,
        deliveryFee: d.deliveryFee,
        freeDelivery: d.freeDelivery,
        packagingType: d.packagingType || null,
        relatedItemIds: d.relatedItemIds,
        photos: d.photos.map((p, idx) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          cloudinaryPublicId: p.cloudinaryPublicId ?? null,
          sortOrder: idx,
        })),
        removedPhotoIds: d.removedPhotoIds,
      }
      return saveAdminMenuItem(itemId, payload)
    },
  })

  const saveAll = async () => {
    const ids = dirtyIds
    if (ids.length === 0) {
      toast.info("No changes to save")
      return
    }
    let failed = 0
    for (const id of ids) {
      const res = await saveMutation.mutateAsync(id)
      if (res.success) {
        markSaved(id)
      } else {
        failed += 1
        toast.error(res.error || `Failed to save ${items?.find((i) => i.id === id)?.name ?? "item"}`)
      }
    }
    queryClient.invalidateQueries({ queryKey: ["admin-menu-overview"] })
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
    if (failed === 0) toast.success(`Saved ${ids.length} item${ids.length > 1 ? "s" : ""}`)
    else toast.error(`${failed} item${failed > 1 ? "s" : ""} failed to save`)
  }

  const createMutation = useMutation({
    mutationFn: ({ name, price }: { name: string; price: number }) =>
      createAdminMenuItem(kitchenId ?? "", { name, price }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to create item")
        return
      }
      setAddDialogOpen(false)
      setNewItemName("")
      setNewItemPrice("")
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })
      queryClient.invalidateQueries({ queryKey: ["admin-menu-overview"] })
      selectItem(res.id ?? null)
      toast.success("Menu item created")
    },
    onError: () => toast.error("Failed to create menu item"),
  })

  const handleSetMainPhoto = (index: number) => {
    if (!selectedItemId || !draft) return
    const photos = [...draft.photos]
    const [moved] = photos.splice(index, 1)
    photos.unshift(moved)
    updateDraft(selectedItemId, { photos: photos.map((p, idx) => ({ ...p, sortOrder: idx })) })
    setPreviewIndex(0)
  }

  const handleUpload = ({ secure_url, public_id }: { secure_url: string; public_id: string }) => {
    if (!selectedItemId || !draft) return
    updateDraft(selectedItemId, {
      photos: [...draft.photos, { imageUrl: secure_url, cloudinaryPublicId: public_id, sortOrder: draft.photos.length }],
    })
  }

  const addHighlight = () => {
    if (!selectedItemId || !draft) return
    updateDraft(selectedItemId, { highlights: [...draft.highlights, { title: "", description: "", enabled: true }] })
  }

  const updateHighlight = (index: number, patch: Partial<EditorHighlight>) => {
    if (!selectedItemId || !draft) return
    const highlights = draft.highlights.map((h, i) => (i === index ? { ...h, ...patch } : h))
    updateDraft(selectedItemId, { highlights })
  }

  const removeHighlight = (index: number) => {
    if (!selectedItemId || !draft) return
    updateDraft(selectedItemId, { highlights: draft.highlights.filter((_, i) => i !== index) })
  }

  const toggleRelated = (id: string) => {
    if (!selectedItemId || !draft) return
    const current = draft.relatedItemIds
    updateDraft(selectedItemId, {
      relatedItemIds: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    })
  }

  const kitchenSlug = items?.[0]?.kitchenSlug

  const statActive = items?.filter((i) => i.isAvailable).length ?? 0
  const statInactive = items ? items.length - statActive : 0

  return (
    <div className="bg-[#FFFFFF] min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#EDF0F3] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <h1 className="text-[24px] font-bold text-[#111827] leading-[32px] tracking-tight">Menu Detail Management</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">Manage and update menu details of your kitchens</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {kitchenSlug && (
            <Link href={`/kitchens/${kitchenSlug}`} target="_blank">
              <Button variant="outline" className="hidden sm:flex text-[#087A35] border-[#9CCDAE] bg-[#FFFFFF] hover:bg-[#F2FAF5] font-semibold h-[40px] shadow-[0_1px_2px_rgba(15,23,42,0.025)] rounded-[7px] px-4">
                <Eye className="h-[16px] w-[16px] mr-2" strokeWidth={1.8} />
                Preview Live Page
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="hidden sm:flex font-semibold h-[40px] shadow-[0_1px_2px_rgba(15,23,42,0.025)] rounded-[7px] bg-[#FFFFFF] text-[#172033] border-[#DCE3EA] hover:bg-[#F8FAFC] px-4"
            onClick={() => {
              clearDrafts()
              onClose()
            }}
          >
            <Trash2 className="h-[16px] w-[16px] mr-2 text-[#475569]" strokeWidth={1.8} />
            Discard Changes
          </Button>
          <Button
            className="bg-[#FF4B16] hover:bg-[#E63F0C] border border-[#FF4B16] text-[#FFFFFF] font-semibold h-[40px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] px-6 rounded-[7px]"
            onClick={saveAll}
            disabled={dirtyIds.length === 0 || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-[16px] w-[16px] mr-2 animate-spin" strokeWidth={1.8} />
            ) : (
              <Save className="h-[16px] w-[16px] mr-2" strokeWidth={1.8} />
            )}
            Save All Changes{dirtyIds.length > 0 ? ` (${dirtyIds.length})` : ""}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 rounded-full h-[40px] w-[40px] bg-slate-100 hover:bg-slate-200 text-[#475569]">
            <X className="h-5 w-5" strokeWidth={1.8} />
          </Button>
        </div>
      </div>

      {/* Secondary Top Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#EDF0F3] px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] z-20 relative">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <div className="flex items-center gap-3 shrink-0">
            <Avatar className="h-[42px] w-[42px] border border-[#9CCDAE] shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
              <AvatarFallback className="bg-[#087A35] text-[#FFFFFF] text-[13px] font-bold">
                {kitchenName.slice(0, 2).toUpperCase() || "—"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Select Kitchen</p>
              <div className="flex items-center gap-3">
                <Select
                  value={kitchenId ?? ""}
                  onValueChange={(v) => {
                    const k = options?.kitchens.find((x) => x.id === v)
                    openEditor(v, k?.name ?? "")
                  }}
                >
                  <SelectTrigger className="h-[24px] w-[180px] sm:w-[220px] text-[15px] font-bold text-[#111827] border-none bg-transparent shadow-none p-0 focus:ring-0">
                    <SelectValue placeholder="Select kitchen" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.kitchens ?? []).map((k) => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  className={`h-[24px] shrink-0 font-medium rounded-full ${kitchenStatusBadge?.className ?? "bg-slate-50 text-slate-500 border-slate-200"}`}
                >
                  {kitchenStatusBadge ? (
                    <>
                      <span className={`h-2 w-2 rounded-full mr-1.5 ${kitchenStatusBadge.className.includes("green") || kitchenStatusBadge.className.includes("EFF8F2") ? "bg-[#087A35]" : kitchenStatusBadge.className.includes("red") || kitchenStatusBadge.className.includes("FEF2F2") ? "bg-[#DC2626]" : kitchenStatusBadge.className.includes("amber") || kitchenStatusBadge.className.includes("FFF7E6") ? "bg-[#F59E0B]" : "bg-[#2563EB]"}`} />
                      {kitchenStatusBadge.label}
                    </>
                  ) : (
                    "—"
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-[42px] hidden md:block bg-[#EDF0F3]" />
          <div className="flex items-center gap-8 shrink-0 px-2">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-[24px] w-[24px] text-[#FF4B16]" strokeWidth={1.8} />
              <div>
                <p className="text-[12px] font-medium text-[#64748B]">Total Menu Items</p>
                <p className="font-bold text-[18px] leading-none mt-1 text-[#111827]">{items?.length ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[20px] w-[20px] rounded-full flex items-center justify-center">
                <div className="h-[6px] w-[6px] rounded-full bg-[#087A35]" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#64748B]">Active Items</p>
                <p className="font-bold text-[18px] leading-none mt-1 text-[#111827]">{statActive}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[20px] w-[20px] rounded-full flex items-center justify-center">
                 <div className="h-[16px] w-[16px] rounded-full border-[1.8px] border-[#DC2626] flex items-center justify-center relative">
                   <div className="h-[6px] w-[1.8px] bg-[#DC2626] rounded-full absolute top-[2px]" />
                   <div className="h-[1.8px] w-[1.8px] bg-[#DC2626] rounded-full absolute bottom-[2px]" />
                 </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#64748B]">Inactive Items</p>
                <p className="font-bold text-[18px] leading-none mt-1 text-[#111827]">{statInactive}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-[#475569]" strokeWidth={1.8} />
            <Input placeholder="Search menu items..." className="pl-9 h-[40px] border-[#DCE3EA] rounded-[7px] text-[14px] text-[#172033] placeholder:text-[#94A3B8] focus-visible:ring-0 focus-visible:border-[#087A35] shadow-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-[40px] w-[100px] border-[#DCE3EA] text-[#172033] shadow-[0_1px_2px_rgba(15,23,42,0.025)] bg-[#FFFFFF] font-medium rounded-[7px] focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-[40px] bg-[#087A35] hover:bg-[#06652C] text-[#FFFFFF] font-medium px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] rounded-[7px]" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-[16px] w-[16px] mr-2" strokeWidth={1.8} />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar - Menu List */}
        <div className={`w-full lg:w-[340px] flex-shrink-0 border-r border-[#E5EAF0] bg-[#FFFFFF] flex-col ${!selectedItemId ? "flex" : "hidden lg:flex"}`}>
          <div className="p-5 border-b border-[#EDF0F3] flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">Menu Items ({items?.length ?? 0})</h3>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-[32px] w-[110px] text-[13px] border-[#DCE3EA] bg-[#FFFFFF] text-[#172033] rounded-[7px] font-medium shadow-none focus:ring-0">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">Sort: A → Z</SelectItem>
                  <SelectItem value="za">Sort: Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && isError && (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-red-500 font-semibold">Failed to load items</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
                </Button>
              </div>
            )}
            {!isLoading && !isError && filteredItems.length === 0 && (
              <p className="text-[13px] text-[#94A3B8] text-center py-8">No menu items found</p>
            )}
            {!isLoading &&
              !isError &&
              filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId
                const isDirty = dirtyIds.includes(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => selectItem(item.id)}
                    className={`px-5 py-4 border-b border-[#EDF0F3] flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? "bg-[#F1F9F4]" : "hover:bg-[#F8FBF9] bg-[#FFFFFF]"}`}
                  >
                    <div className="h-[50px] w-[50px] rounded-[8px] bg-slate-100 overflow-hidden shrink-0 border border-[#E5EAF0]">
                      {item.photos[0]?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photos[0].imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#94A3B8]">
                          <ImageIcon className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-[14px] truncate flex items-center gap-1.5 ${isSelected ? "text-[#087A35]" : "text-[#172033]"}`}>
                        {item.name}
                        {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-[#FF4B16] shrink-0" title="Unsaved changes" />}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[13px] font-medium text-[#172033]">₹{Number(item.price)}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-[6px] w-[6px] rounded-full ${item.isAvailable ? "bg-[#087A35]" : "bg-[#FF4B16]"}`} />
                          <span className={`text-[12px] font-medium ${item.isAvailable ? "text-[#087A35]" : "text-[#FF4B16]"}`}>
                            {item.isAvailable ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {item.avgRating > 0 ? (
                        <div className="flex items-center gap-1 text-[#172033] text-[13px] font-medium">
                          <Star className="h-3.5 w-3.5 fill-[#087A35] text-[#087A35]" />
                          {Number(item.avgRating).toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#64748B] mr-2">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Right Content - Edit Form */}
        <div className={`flex-1 overflow-y-auto bg-[#FAFBFC] p-4 sm:p-6 lg:p-8 ${selectedItemId ? "block" : "hidden lg:block"}`}>
          <div className="max-w-[1200px] mx-auto space-y-8">

            {!selectedItemId || !draft ? (
              <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E5EAF0] p-10 text-center space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                  </>
                ) : (
                  <>
                    <h2 className="text-[20px] font-bold text-[#111827]">Select a menu item to edit</h2>
                    <p className="text-[14px] text-[#64748B]">Choose an item from the list on the left, or create a new one.</p>
                    <Button className="mt-2 h-10 bg-green-800 hover:bg-green-700 font-semibold" onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add New Item
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Form Header */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="lg:hidden text-[#172033] mr-1" onClick={() => selectItem(null)}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <h2 className="text-[22px] font-bold text-[#111827]">Editing: {draft.name || "Untitled Item"}</h2>
                      {draft.isAvailable ? (
                        <Badge className="bg-[#EFF8F2] text-[#087A35] hover:bg-[#EFF8F2] border-none px-2.5 py-0.5 rounded-full font-medium"><div className="h-1.5 w-1.5 rounded-full bg-[#087A35] mr-1.5" /> Active</Badge>
                      ) : (
                        <Badge className="bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEF2F2] border-none px-2.5 py-0.5 rounded-full font-medium"><div className="h-1.5 w-1.5 rounded-full bg-[#DC2626] mr-1.5" /> Inactive</Badge>
                      )}
                      {dirtyIds.includes(selectedItemId) && (
                        <Badge className="bg-[#FFF1EB] text-[#FF4B16] hover:bg-[#FFF1EB] border-none px-2.5 py-0.5 rounded-full font-medium">Unsaved</Badge>
                      )}
                    </div>
                    <div className="text-[13px] font-medium text-[#64748B] flex items-center gap-2">
                      Item ID: <span className="text-[#172033] font-bold">MI-{selectedItemId.slice(0, 4).toUpperCase()}</span>
                      <button className="text-[#475569] hover:text-[#087A35] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Anchor Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-[#EDF0F3]">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-[14px] font-medium whitespace-nowrap border-b-[2px] transition-colors flex items-center ${activeTab === tab ? "border-[#087A35] text-[#087A35]" : "border-transparent text-[#475569] hover:text-[#087A35]"}`}
                      >
                        {tab === "Basic Information" && <ShieldCheck className="h-4 w-4 inline mr-2" strokeWidth={1.8} />}
                        {tab === "Images" && <ImageIcon className="h-4 w-4 inline mr-2" strokeWidth={1.8} />}
                        {tab === "Pricing & Availability" && <Package className="h-4 w-4 inline mr-2" strokeWidth={1.8} />}
                        {tab === "Delivery & Service" && <svg className="h-4 w-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="2" y="6" rx="2" ry="2"/><path d="M18 16V9l4-3v10z"/><circle cx="7.5" cy="19.5" r="2.5"/><circle cx="16.5" cy="19.5" r="2.5"/></svg>}
                        {tab === "Highlights" && <Star className="h-4 w-4 inline mr-2" strokeWidth={1.8} />}
                        {tab === "SEO & Visibility" && <svg className="h-4 w-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>}
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                  {/* Left Column (Main Form fields) */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Images Section */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3] flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-[16px] font-bold text-[#111827]">Item Images</CardTitle>
                          <p className="text-[13px] text-[#64748B] mt-0.5 font-medium">({draft.photos.length} Images)</p>
                        </div>
                        <CloudinaryUpload onUpload={handleUpload}>
                          {({ uploading, startUpload }) => (
                            <Button variant="outline" className="h-[36px] px-3 text-[13px] font-semibold border-[#DCE3EA] bg-[#FFFFFF] text-[#172033] hover:bg-[#F8FAFC] rounded-[7px] shadow-none" onClick={startUpload} disabled={uploading}>
                              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" strokeWidth={1.8} />}
                              {uploading ? "Uploading..." : "Upload Images"}
                            </Button>
                          )}
                        </CloudinaryUpload>
                      </CardHeader>
                      <CardContent className="p-5">
                        {draft.photos.length > 0 ? (
                          <>
                            <div className="relative aspect-video rounded-[8px] bg-slate-100 overflow-hidden mb-4 border border-[#E5EAF0]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={draft.photos[previewIndex]?.imageUrl}
                                alt="Main"
                                className="w-full h-full object-cover"
                              />
                              {draft.bestseller && (
                                <Badge className="absolute top-4 left-4 bg-[#FF4B16] hover:bg-[#FF4B16] text-[#FFFFFF] border-none shadow-none rounded-[6px] px-3 py-1 font-bold">Bestseller</Badge>
                              )}
                              <button
                                onClick={() => removePhotoFromDraft(selectedItemId, draft.photos[previewIndex].id ?? previewIndex.toString())}
                                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-[#FFFFFF]/90 shadow-sm flex items-center justify-center text-[#DC2626] hover:bg-[#FFFFFF] transition-colors"
                                title="Remove image"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                              </button>
                              {draft.photos.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setPreviewIndex((i) => (i > 0 ? i - 1 : draft.photos.length - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#FFFFFF]/80 shadow-sm flex items-center justify-center text-[#172033] hover:bg-[#FFFFFF] transition-colors"
                                  >
                                    <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
                                  </button>
                                  <button
                                    onClick={() => setPreviewIndex((i) => (i < draft.photos.length - 1 ? i + 1 : 0))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#FFFFFF]/80 shadow-sm flex items-center justify-center text-[#172033] hover:bg-[#FFFFFF] transition-colors"
                                  >
                                    <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                                  </button>
                                  <div className="absolute bottom-4 right-4 bg-black/60 text-[#FFFFFF] text-[11px] font-bold px-3 py-1 rounded-[6px] backdrop-blur-sm">
                                    {previewIndex + 1} / {draft.photos.length}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                              {draft.photos.map((photo, i) => (
                                <button
                                  key={photo.id ?? `new-${i}`}
                                  onClick={() => setPreviewIndex(i)}
                                  onDoubleClick={() => handleSetMainPhoto(i)}
                                  className={`relative w-[72px] h-[72px] rounded-[8px] overflow-hidden shrink-0 border-[2px] ${i === 0 ? "border-[#087A35]" : "border-transparent opacity-70 hover:opacity-100"}`}
                                  title={i === 0 ? "Main image" : "Double-click to set as main"}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                              ))}
                            </div>
                            <p className="text-[12px] text-[#64748B] mt-2 font-medium">
                              Recommended: 1200x900px or higher. First image is the main one — double-click a thumbnail to change it.
                            </p>
                          </>
                        ) : (
                          <div className="border-[2px] border-dashed border-[#DCE3EA] bg-[#F8FAFC] rounded-[8px] py-16 flex flex-col items-center gap-3 text-[#94A3B8]">
                            <ImageIcon className="h-10 w-10 text-[#CBD5E1]" strokeWidth={1.5} />
                            <p className="text-[14px] font-medium text-[#64748B]">No images yet — upload photos for this dish</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3]">
                        <CardTitle className="text-[16px] font-bold text-[#111827]">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid gap-2">
                          <label className="text-[13px] font-bold text-[#172033]">Item Name <span className="text-[#DC2626]">*</span></label>
                          <div className="relative">
                            <Input
                              value={draft.name}
                              onChange={(e) => updateDraft(selectedItemId, { name: e.target.value.slice(0, 100) })}
                              className="font-medium text-[14px] text-[#111827] border-[#DCE3EA] h-[40px] rounded-[7px] pr-12 focus-visible:ring-0 focus-visible:border-[#087A35] shadow-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] font-medium">{draft.name.length}/100</span>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="text-[13px] font-bold text-[#172033]">Description <span className="text-[#DC2626]">*</span></label>
                          <div className="relative">
                            <Textarea
                              value={draft.description}
                              onChange={(e) => updateDraft(selectedItemId, { description: e.target.value.slice(0, 300) })}
                              className="min-h-[120px] text-[14px] text-[#111827] border-[#DCE3EA] rounded-[7px] resize-none pb-8 focus-visible:ring-0 focus-visible:border-[#087A35] shadow-none"
                            />
                            <span className="absolute bottom-3 right-3 text-[12px] text-[#64748B] font-medium">{draft.description.length}/300</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Kitchen <span className="text-[#DC2626]">*</span></label>
                            <div className="h-[40px] px-3 rounded-[7px] border border-[#DCE3EA] bg-[#F8FAFC] text-[14px] font-medium text-[#64748B] flex items-center truncate">
                              {kitchenName}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Category</label>
                            <Select
                              value={draft.categoryId ?? ""}
                              onValueChange={(v) => updateDraft(selectedItemId, { categoryId: v || null })}
                            >
                              <SelectTrigger className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus:ring-0 focus:border-[#087A35]">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {(options?.categories ?? []).map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Cuisine</label>
                            <Input
                              value={draft.cuisine}
                              onChange={(e) => updateDraft(selectedItemId, { cuisine: e.target.value })}
                              placeholder="e.g. Hyderabadi"
                              className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Food Type</label>
                            <Select
                              value={draft.foodType}
                              onValueChange={(v) => updateDraft(selectedItemId, { foodType: v as "VEG" | "NONVEG" })}
                            >
                              <SelectTrigger className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus:ring-0 focus:border-[#087A35]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {FOOD_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Time Slot</label>
                            <Select
                              value={draft.timeSlot}
                              onValueChange={(v) => updateDraft(selectedItemId, { timeSlot: v as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER" })}
                            >
                              <SelectTrigger className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus:ring-0 focus:border-[#087A35]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Available For</label>
                            <Select
                              value={draft.availableFor}
                              onValueChange={(v) => updateDraft(selectedItemId, { availableFor: v as "TODAY" | "TOMORROW" | "BOTH" })}
                            >
                              <SelectTrigger className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus:ring-0 focus:border-[#087A35]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_FOR.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-[#E5EAF0] rounded-[7px] bg-[#FFFFFF]">
                          <span className="text-[14px] font-bold text-[#172033]">Mark as Bestseller</span>
                          <Switch
                            checked={draft.bestseller}
                            onCheckedChange={(v) => updateDraft(selectedItemId, { bestseller: v })}
                            className="data-[state=checked]:bg-[#087A35] data-[state=unchecked]:bg-[#CBD5E1]"
                          />
                        </div>
                      </CardContent>
                    </Card>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {draft.cuisine && (
                          <Badge variant="outline" className="bg-[#EFF8F2] text-[#087A35] border-[#9CCDAE] py-1.5 px-3 font-medium shadow-none rounded-[6px]">
                            <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.8} /> {draft.cuisine}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`${draft.foodType === "NONVEG" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]" : "bg-[#EFF8F2] text-[#087A35] border-[#9CCDAE]"} py-1.5 px-3 font-medium shadow-none rounded-[6px]`}>
                          <span className={`h-3 w-3 rounded-sm border ${draft.foodType === "NONVEG" ? "border-[#DC2626] bg-[#FEF2F2]" : "border-[#087A35] bg-[#EFF8F2]"} flex items-center justify-center mr-1.5 text-[8px]`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${draft.foodType === "NONVEG" ? "bg-[#DC2626]" : "bg-[#087A35]"}`} />
                          </span> 
                          {draft.foodType === "NONVEG" ? "Non-Veg" : "Veg"}
                        </Badge>
                        {draft.bestseller && (
                          <Badge variant="outline" className="bg-[#FFF1EB] text-[#FF4B16] border-[#FF4B16]/30 py-1.5 px-3 font-medium shadow-none rounded-[6px]">
                            <Star className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.8} /> Bestseller
                          </Badge>
                        )}
                      </div>

                    {/* Pricing & Availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                      {/* Pricing */}
                      <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                        <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">Pricing</CardTitle></CardHeader>
                        <CardContent className="p-5 space-y-5">
                          <div className="grid grid-cols-2 gap-5">
                            <div className="grid gap-2">
                              <label className="text-[13px] font-bold text-[#172033]">Selling Price (₹) <span className="text-[#DC2626]">*</span></label>
                              <Input
                                type="number"
                                min={0}
                                value={draft.price || ""}
                                onChange={(e) => updateDraft(selectedItemId, { price: numOrNull(e.target.value) ?? 0 })}
                                className="font-bold text-[14px] text-[#111827] h-[40px] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-[13px] font-bold text-[#172033]">MRP Price (₹)</label>
                              <Input
                                type="number"
                                min={0}
                                value={draft.compareAtPrice ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { compareAtPrice: numOrNull(e.target.value) })}
                                className="font-medium text-[14px] text-[#64748B] h-[40px] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                              />
                            </div>
                          </div>
                          {draft.compareAtPrice && draft.compareAtPrice > draft.price && (
                            <div className="text-right">
                              <span className="text-[12px] font-bold text-[#087A35] bg-[#EFF8F2] px-2.5 py-1.5 rounded-[6px]">
                                You Save: ₹{draft.compareAtPrice - draft.price} ({Math.round(((draft.compareAtPrice - draft.price) / draft.compareAtPrice) * 100)}% OFF)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-4 border border-[#E5EAF0] rounded-[7px] bg-[#FFFFFF]">
                            <span className="text-[14px] font-bold text-[#172033]">Availability Status</span>
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={draft.isAvailable}
                                onCheckedChange={(v) => updateDraft(selectedItemId, { isAvailable: v })}
                                className="data-[state=checked]:bg-[#087A35] data-[state=unchecked]:bg-[#CBD5E1]"
                              />
                              <span className={`text-[13px] font-bold ${draft.isAvailable ? "text-[#087A35]" : "text-[#DC2626]"}`}>
                                {draft.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Dish Info quick */}
                      <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                        <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">Dish Info</CardTitle></CardHeader>
                        <CardContent className="p-5 space-y-2">
                          <div className="flex items-center justify-between py-2 border-b border-[#EDF0F3]">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#087A35]" strokeWidth={1.8} />
                              <span className="text-[13px] font-bold text-[#172033]">Serves</span>
                            </div>
                            <Input
                              type="number"
                              min={1}
                              className="h-[32px] w-[80px] text-[13px] font-bold border-[#DCE3EA] rounded-[7px] shadow-none text-right focus-visible:ring-0 focus-visible:border-[#087A35]"
                              value={draft.serves ?? ""}
                              onChange={(e) => updateDraft(selectedItemId, { serves: numOrNull(e.target.value) })}
                              placeholder="Persons"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-[#EDF0F3]">
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-[#087A35]" strokeWidth={1.8} />
                              <span className="text-[13px] font-bold text-[#172033]">Portion Size</span>
                            </div>
                            <Input
                              className="h-[32px] w-[140px] text-[13px] font-bold border-[#DCE3EA] rounded-[7px] shadow-none text-right focus-visible:ring-0 focus-visible:border-[#087A35]"
                              value={draft.portionSize}
                              onChange={(e) => updateDraft(selectedItemId, { portionSize: e.target.value })}
                              placeholder="e.g. 400 - 450 gms"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-[#EDF0F3]">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#087A35]" strokeWidth={1.8} />
                              <span className="text-[13px] font-bold text-[#172033]">Shelf Life</span>
                            </div>
                            <Input
                              className="h-[32px] w-[140px] text-[13px] font-bold border-[#DCE3EA] rounded-[7px] shadow-none text-right focus-visible:ring-0 focus-visible:border-[#087A35]"
                              value={draft.shelfLife}
                              onChange={(e) => updateDraft(selectedItemId, { shelfLife: e.target.value })}
                              placeholder="e.g. Best consumed hot"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-[#FF4B16]" strokeWidth={1.8} />
                              <span className="text-[13px] font-bold text-[#172033]">Allergens</span>
                            </div>
                            <Input
                              className="h-[32px] w-[140px] text-[13px] font-bold border-[#DCE3EA] rounded-[7px] shadow-none text-right focus-visible:ring-0 focus-visible:border-[#087A35]"
                              value={draft.allergens}
                              onChange={(e) => updateDraft(selectedItemId, { allergens: e.target.value })}
                              placeholder="e.g. May contain nuts"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* About This Dish */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">About This Dish</CardTitle></CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid gap-2">
                          <label className="text-[13px] font-bold text-[#172033]">Title</label>
                          <div className="relative">
                            <Input
                              value={draft.aboutTitle}
                              onChange={(e) => updateDraft(selectedItemId, { aboutTitle: e.target.value.slice(0, 100) })}
                              placeholder="e.g. About this dish"
                              className="font-medium text-[14px] text-[#111827] h-[40px] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] font-medium">{draft.aboutTitle.length}/100</span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[13px] font-bold text-[#172033]">Description</label>
                          <div className="relative">
                            <Textarea
                              value={draft.aboutDescription}
                              onChange={(e) => updateDraft(selectedItemId, { aboutDescription: e.target.value.slice(0, 500) })}
                              placeholder="Describe the story, ingredients and taste of this dish..."
                              className="min-h-[120px] text-[14px] text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none resize-none pb-8 focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                            <span className="absolute bottom-3 right-3 text-[11px] text-[#64748B] font-medium">{draft.aboutDescription.length}/500</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delivery & Service */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">Delivery & Service</CardTitle></CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Delivery Time (mins)</label>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                type="number"
                                min={0}
                                value={draft.deliveryTimeMin ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { deliveryTimeMin: numOrNull(e.target.value) })}
                                placeholder="Min"
                                className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                              />
                              <Input
                                type="number"
                                min={0}
                                value={draft.deliveryTimeMax ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { deliveryTimeMax: numOrNull(e.target.value) })}
                                placeholder="Max"
                                className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[13px] font-bold text-[#172033]">Delivery Fee (₹)</label>
                            <Input
                              type="number"
                              min={0}
                              value={draft.deliveryFee ?? ""}
                              onChange={(e) => updateDraft(selectedItemId, { deliveryFee: numOrNull(e.target.value) })}
                              placeholder="e.g. 49"
                              className="h-[40px] text-[14px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 shadow-sm">
                          <span className="text-sm font-bold text-slate-700">Free Delivery</span>
                          <Switch
                            checked={draft.freeDelivery}
                            onCheckedChange={(v) => updateDraft(selectedItemId, { freeDelivery: v })}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Packaging Type</label>
                          <Input
                            value={draft.packagingType}
                            onChange={(e) => updateDraft(selectedItemId, { packagingType: e.target.value })}
                            placeholder="e.g. Secure Packaging"
                            className="h-10 text-sm font-semibold border-slate-200 shadow-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (Sidebar widgets) */}
                  <div className="space-y-6">

                    {/* Ratings & Social Proof */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">Ratings & Social Proof</CardTitle></CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="grid gap-2">
                            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Average Rating</label>
                            <div className="flex items-center gap-2 border border-[#DCE3EA] rounded-[7px] px-3 h-[40px] bg-[#F8FAFC]">
                              <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" strokeWidth={1.8} />
                              <span className="font-bold text-[14px] text-[#111827]">{selectedRow?.avgRating ? Number(selectedRow.avgRating).toFixed(1) : "—"}</span>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Reviews</label>
                            <div className="flex items-center border border-[#DCE3EA] rounded-[7px] px-3 h-[40px] bg-[#F8FAFC]">
                              <span className="font-bold text-[14px] text-[#111827]">{selectedRow?.totalReviews ?? 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Orders</label>
                          <div className="flex items-center border border-[#DCE3EA] rounded-[7px] px-3 h-[40px] bg-[#F8FAFC]">
                            <span className="font-bold text-[14px] text-[#111827]">{selectedRow?.orderCount ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#EFF8F2] text-[#087A35] p-3 rounded-[7px] border border-[#9CCDAE]">
                          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                          <span className="text-[12px] font-bold">Ratings & orders update automatically</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Highlights */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3] flex flex-row items-center justify-between">
                        <CardTitle className="text-[16px] font-bold text-[#111827]">Highlights</CardTitle>
                        <span className="text-[12px] font-medium text-[#64748B]">(Why you&apos;ll love it)</span>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4">
                        {draft.highlights.length === 0 && (
                          <p className="text-[13px] font-medium text-[#64748B]">No highlights yet — add the reasons customers will love this dish.</p>
                        )}
                        {draft.highlights.map((h, i) => (
                          <div key={i} className="border border-[#E5EAF0] rounded-[7px] p-4 space-y-3 bg-[#F8FAFC]/50">
                            <div className="flex items-center justify-between gap-3">
                              <Input
                                value={h.title}
                                onChange={(e) => updateHighlight(i, { title: e.target.value.slice(0, 40) })}
                                placeholder="Title (e.g. 100% Homemade)"
                                className="h-[32px] text-[13px] font-bold border-[#DCE3EA] rounded-[6px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                              />
                              <div className="flex items-center gap-2 shrink-0">
                                <Switch
                                  checked={h.enabled}
                                  onCheckedChange={(v) => updateHighlight(i, { enabled: v })}
                                  className="data-[state=checked]:bg-[#087A35] data-[state=unchecked]:bg-[#CBD5E1] scale-90 origin-right"
                                />
                                <button onClick={() => removeHighlight(i)} className="text-[#DC2626] hover:text-[#B91C1C] transition-colors">
                                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                                </button>
                              </div>
                            </div>
                            <Input
                              value={h.description}
                              onChange={(e) => updateHighlight(i, { description: e.target.value.slice(0, 60) })}
                              placeholder="Short description"
                              className="h-[32px] text-[13px] font-medium border-[#DCE3EA] rounded-[6px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full h-[40px] border-dashed border-[#087A35]/50 text-[#087A35] hover:bg-[#EFF8F2] hover:text-[#087A35] font-bold bg-[#FFFFFF] rounded-[7px] shadow-none" onClick={addHighlight}>
                          <Plus className="h-4 w-4 mr-2" strokeWidth={2} /> Add Highlight
                        </Button>
                      </CardContent>
                    </Card>

                    {/* You May Also Like */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3] flex flex-row items-center justify-between">
                        <CardTitle className="text-[16px] font-bold text-[#111827]">You May Also Like</CardTitle>
                        <span className="text-[12px] font-medium text-[#64748B]">({draft.relatedItemIds.length} items)</span>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                          {(options?.menuItems ?? [])
                            .filter((m) => m.id !== selectedItemId)
                            .map((m) => {
                              const checked = draft.relatedItemIds.includes(m.id)
                              return (
                                <label
                                  key={m.id}
                                  className={`flex items-center justify-between p-3 rounded-[7px] border cursor-pointer transition-colors ${checked ? "bg-[#EFF8F2] border-[#9CCDAE]" : "bg-[#F8FAFC] border-[#E5EAF0] hover:border-[#DCE3EA]"}`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={() => toggleRelated(m.id)}
                                      className="data-[state=checked]:bg-[#087A35] data-[state=checked]:border-[#087A35] border-[#DCE3EA]"
                                    />
                                    <div className="min-w-0">
                                      <span className={`font-bold text-[13px] truncate block ${checked ? "text-[#087A35]" : "text-[#111827]"}`}>{m.name}</span>
                                      <span className="text-[11px] text-[#64748B] font-medium block truncate">{m.kitchenName || "—"}</span>
                                    </div>
                                  </div>
                                  {!m.isAvailable && (
                                    <Badge variant="outline" className="h-[20px] px-1.5 py-0 text-[10px] text-[#94A3B8] border-[#DCE3EA] shrink-0 font-bold rounded-[4px]">Hidden</Badge>
                                  )}
                                </label>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO & Visibility */}
                    <Card className="shadow-none border-[#E5EAF0] bg-[#FFFFFF] rounded-[9px]">
                      <CardHeader className="p-5 border-b border-[#EDF0F3]"><CardTitle className="text-[16px] font-bold text-[#111827]">SEO & Visibility</CardTitle></CardHeader>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid gap-2">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Meta Title</label>
                          <div className="relative">
                            <Input
                              value={draft.metaTitle}
                              onChange={(e) => updateDraft(selectedItemId, { metaTitle: e.target.value.slice(0, 60) })}
                              placeholder={`${draft.name} | ${kitchenName}`}
                              className="text-[13px] font-semibold h-[40px] border-[#DCE3EA] rounded-[7px] shadow-none focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#94A3B8] font-medium">{draft.metaTitle.length}/60</span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Meta Description</label>
                          <div className="relative">
                            <Textarea
                              value={draft.metaDescription}
                              onChange={(e) => updateDraft(selectedItemId, { metaDescription: e.target.value.slice(0, 160) })}
                              placeholder="Short SEO description shown in search results..."
                              className="min-h-[100px] text-[13px] font-medium text-[#111827] border-[#DCE3EA] rounded-[7px] shadow-none resize-none pb-6 focus-visible:ring-0 focus-visible:border-[#087A35]"
                            />
                            <span className="absolute bottom-2 right-3 text-[11px] text-[#94A3B8] font-medium">{draft.metaDescription.length}/160</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>
              </>
            )}

          </div>
        </div>

      </div>

      {/* Add New Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[9px] border-[#E5EAF0]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#111827]">Add New Menu Item</DialogTitle>
            <DialogDescription className="text-[14px] font-medium text-[#64748B]">
              Create an item in {kitchenName}&apos;s menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2.5">
              <Label htmlFor="editor-item-name" className="text-[13px] font-bold text-[#172033]">Item Name</Label>
              <Input
                id="editor-item-name"
                placeholder="e.g. Chicken Biryani"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-[40px] text-[14px] font-medium border-[#DCE3EA] rounded-[7px] focus-visible:ring-0 focus-visible:border-[#087A35] shadow-none"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="editor-item-price" className="text-[13px] font-bold text-[#172033]">Selling Price (₹)</Label>
              <Input
                id="editor-item-price"
                type="number"
                min={0}
                placeholder="e.g. 189"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="h-[40px] text-[14px] font-medium border-[#DCE3EA] rounded-[7px] focus-visible:ring-0 focus-visible:border-[#087A35] shadow-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-[40px] text-[14px] font-bold rounded-[7px] border-[#DCE3EA] text-[#172033] hover:bg-[#F8FAFC]" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newItemName.trim()) {
                  toast.error("Item name is required")
                  return
                }
                const price = Number(newItemPrice)
                if (Number.isNaN(price) || price < 0) {
                  toast.error("Enter a valid price")
                  return
                }
                createMutation.mutate({ name: newItemName.trim(), price })
              }}
              disabled={createMutation.isPending}
              className="bg-[#087A35] hover:bg-[#087A35]/90 text-white font-bold h-[40px] text-[14px] rounded-[7px] shadow-none"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
