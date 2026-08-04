"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X, Eye, Save, Search, Plus,
  ChevronLeft, ChevronRight, Star,
  Trash2, Image as ImageIcon, CheckCircle2,
  Clock, Leaf, UtensilsCrossed, ShieldCheck,
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
  toggleAdminMenuItemAvailability,
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
  ACTIVE: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
  APPROVED: { label: "Approved", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PENDINGAPPROVAL: { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200" },
  SUSPENDED: { label: "Suspended", className: "bg-red-50 text-red-700 border-red-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
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

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      toggleAdminMenuItemAvailability(id, isAvailable),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || "Failed to update availability")
        updateDraft(vars.id, { isAvailable: !vars.isAvailable })
        return
      }
      toast.success("Availability updated")
      queryClient.invalidateQueries({ queryKey: ["admin-menu-overview"] })
    },
  })

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

  const handleToggleAvailability = (id: string, next: boolean) => {
    updateDraft(id, { isAvailable: next })
    toggleMutation.mutate({ id, isAvailable: next })
  }

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
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 relative">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15C38.9543 15 30 23.9543 30 35C30 38.3585 30.8285 41.5235 32.285 44.3315C29.6231 46.5492 28 49.9142 28 53.6667C28 60.4782 33.5218 66 40.3333 66H59.6667C66.4782 66 72 60.4782 72 53.6667C72 49.9142 70.3769 46.5492 67.715 44.3315C69.1715 41.5235 70 38.3585 70 35C70 23.9543 61.0457 15 50 15Z" fill="#ff4500" fillOpacity="0.1" stroke="#ff4500" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35 80H65" stroke="#ff4500" strokeWidth="6" strokeLinecap="round"/>
                <path d="M42 85H58" stroke="#ff4500" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-[#ff4500]">RRC <span className="text-green-700">Kitchen</span></span>
              <p className="text-[10px] font-medium text-slate-500">Every Homemaker is a Chef</p>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-border"></div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Menu Detail Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage and update menu details of your kitchens</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {kitchenSlug && (
            <Link href={`/kitchens/${kitchenSlug}`} target="_blank">
              <Button variant="outline" className="hidden sm:flex text-green-700 border-green-200 bg-green-50 hover:bg-green-100 font-semibold h-10 shadow-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview Live Page
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="hidden sm:flex font-semibold h-10 shadow-sm"
            onClick={() => {
              clearDrafts()
              onClose()
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Discard Changes
          </Button>
          <Button
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold h-10 shadow-sm px-6"
            onClick={saveAll}
            disabled={dirtyIds.length === 0 || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Changes{dirtyIds.length > 0 ? ` (${dirtyIds.length})` : ""}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-600">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Secondary Top Bar */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-20">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <div className="flex items-center gap-3 shrink-0">
            <Avatar className="h-10 w-10 border border-green-800">
              <AvatarFallback className="bg-green-800 text-white text-xs font-bold">
                {kitchenName.slice(0, 2).toUpperCase() || "—"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Select Kitchen</p>
              <div className="flex items-center gap-3">
                <Select
                  value={kitchenId ?? ""}
                  onValueChange={(v) => {
                    const k = options?.kitchens.find((x) => x.id === v)
                    openEditor(v, k?.name ?? "")
                  }}
                >
                  <SelectTrigger className="h-8 w-[220px] text-sm font-bold border-none bg-transparent shadow-none p-0 focus:ring-0">
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
                  className={`h-6 shrink-0 font-semibold ${kitchenStatusBadge?.className ?? "bg-slate-50 text-slate-500 border-slate-200"}`}
                >
                  {kitchenStatusBadge ? (
                    <>
                      <span className={`h-2 w-2 rounded-full mr-1 ${kitchenStatusBadge.className.includes("green") ? "bg-green-600" : kitchenStatusBadge.className.includes("red") ? "bg-red-500" : kitchenStatusBadge.className.includes("amber") ? "bg-amber-500" : "bg-blue-500"}`} />
                      {kitchenStatusBadge.label}
                    </>
                  ) : (
                    "—"
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-10 hidden md:block" />
          <div className="flex items-center gap-8 shrink-0 px-2">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Total Menu Items</p>
                <p className="font-bold text-lg leading-none mt-1 text-slate-900">{items?.length ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="text-xs font-medium text-slate-500">Active Items</p>
                <p className="font-bold text-lg leading-none mt-1 text-slate-900">{statActive}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Inactive Items</p>
                <p className="font-bold text-lg leading-none mt-1 text-slate-900">{statInactive}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search menu items..." className="pl-9 h-10 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px] border-slate-200 text-slate-600 shadow-sm bg-white font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-10 bg-green-800 hover:bg-green-700 font-semibold px-5" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar - Menu List */}
        <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col hidden lg:flex">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Menu Items ({items?.length ?? 0})</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">Sort: A to Z</SelectItem>
                <SelectItem value="za">Sort: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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
              <p className="text-sm text-slate-400 text-center py-8">No menu items found</p>
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
                    className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? "bg-green-50/50 border-green-200 shadow-sm" : "hover:bg-slate-50 border-transparent hover:border-slate-200"}`}
                  >
                    <div className="h-12 w-12 rounded-md bg-slate-200 overflow-hidden shrink-0">
                      {item.photos[0]?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photos[0].imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm truncate flex items-center gap-1.5 ${isSelected ? "text-green-900" : "text-slate-900"}`}>
                        {item.name}
                        {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500] shrink-0" title="Unsaved changes" />}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-700">₹{Number(item.price)}</span>
                        <span className="text-slate-300 text-xs">•</span>
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={(v) => handleToggleAvailability(item.id, v)}
                          onClick={(e) => e.stopPropagation()}
                          className="scale-[0.65] origin-left data-[state=checked]:bg-green-600"
                        />
                        <span className={`text-[10px] font-medium ${item.isAvailable ? "text-green-700" : "text-red-500"}`}>
                          {item.isAvailable ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {item.avgRating > 0 ? (
                        <div className="flex items-center gap-0.5 text-green-700 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current" />
                          {Number(item.avgRating).toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Right Content - Edit Form */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-8">

            {!selectedItemId || !draft ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-900">Select a menu item to edit</h2>
                    <p className="text-sm text-slate-500">Choose an item from the list on the left, or create a new one.</p>
                    <Button className="mt-2 h-10 bg-green-800 hover:bg-green-700 font-semibold" onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add New Item
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Form Header */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">Editing: {draft.name || "Untitled Item"}</h2>
                      {draft.isAvailable ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-2.5 py-0.5"><div className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5" /> Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2.5 py-0.5"><div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" /> Inactive</Badge>
                      )}
                      {dirtyIds.includes(selectedItemId) && (
                        <Badge className="bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/10 border-none px-2.5 py-0.5">Unsaved</Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 border rounded-md shadow-sm">
                      Item ID: <span className="text-slate-900 font-bold">{selectedItemId.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Anchor Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b pb-0.5">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? "border-green-600 text-green-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                      >
                        {tab === "Basic Information" && <Leaf className="h-3.5 w-3.5 inline mr-1.5" />}
                        {tab === "Images" && <ImageIcon className="h-3.5 w-3.5 inline mr-1.5" />}
                        {tab === "Pricing & Availability" && <span className="inline mr-1.5 text-xs font-bold text-current">₹</span>}
                        {tab === "Delivery & Service" && <Package className="h-3.5 w-3.5 inline mr-1.5" />}
                        {tab === "Highlights" && <Star className="h-3.5 w-3.5 inline mr-1.5" />}
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
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Item Images</CardTitle>
                          <p className="text-xs text-slate-500 mt-1 font-medium">({draft.photos.length} Images)</p>
                        </div>
                        <CloudinaryUpload onUpload={handleUpload}>
                          {({ uploading, startUpload }) => (
                            <Button variant="outline" className="h-8 text-xs font-semibold shadow-sm" onClick={startUpload} disabled={uploading}>
                              {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ImagePlus className="h-3 w-3 mr-1" />}
                              {uploading ? "Uploading..." : "Upload Images"}
                            </Button>
                          )}
                        </CloudinaryUpload>
                      </CardHeader>
                      <CardContent>
                        {draft.photos.length > 0 ? (
                          <>
                            <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden mb-3 border">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={draft.photos[previewIndex]?.imageUrl}
                                alt="Main"
                                className="w-full h-full object-cover"
                              />
                              {draft.bestseller && (
                                <Badge className="absolute top-3 left-3 bg-[#ff4500] hover:bg-[#ff4500] text-white border-none shadow-sm">Bestseller</Badge>
                              )}
                              <button
                                onClick={() => removePhotoFromDraft(selectedItemId, draft.photos[previewIndex].id ?? previewIndex.toString())}
                                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                                title="Remove image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {draft.photos.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setPreviewIndex((i) => (i > 0 ? i - 1 : draft.photos.length - 1))}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setPreviewIndex((i) => (i < draft.photos.length - 1 ? i + 1 : 0))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
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
                                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === 0 ? "border-green-600" : "border-transparent opacity-70 hover:opacity-100"}`}
                                  title={i === 0 ? "Main image" : "Double-click to set as main"}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              Recommended: 1200x900px or higher. First image is the main one — double-click a thumbnail to change it.
                            </p>
                          </>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center gap-3 text-slate-400">
                            <ImageIcon className="h-10 w-10" />
                            <p className="text-sm font-medium">No images yet — upload photos for this dish</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-slate-700">Item Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Input
                            value={draft.name}
                            onChange={(e) => updateDraft(selectedItemId, { name: e.target.value.slice(0, 100) })}
                            className="font-semibold text-slate-900 border-slate-200 h-10 shadow-sm pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{draft.name.length}/100</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-slate-700">Description <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Textarea
                            value={draft.description}
                            onChange={(e) => updateDraft(selectedItemId, { description: e.target.value.slice(0, 300) })}
                            className="min-h-[100px] text-sm text-slate-700 border-slate-200 shadow-sm resize-none pb-6"
                          />
                          <span className="absolute bottom-2 right-3 text-xs text-slate-400 font-medium">{draft.description.length}/300</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Kitchen <span className="text-red-500">*</span></label>
                          <div className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500 flex items-center truncate">
                            {kitchenName}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Category</label>
                          <Select
                            value={draft.categoryId ?? ""}
                            onValueChange={(v) => updateDraft(selectedItemId, { categoryId: v || null })}
                          >
                            <SelectTrigger className="h-10 text-sm font-semibold border-slate-200 shadow-sm">
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
                          <label className="text-xs font-bold text-slate-700">Cuisine</label>
                          <Input
                            value={draft.cuisine}
                            onChange={(e) => updateDraft(selectedItemId, { cuisine: e.target.value })}
                            placeholder="e.g. Hyderabadi"
                            className="h-10 text-sm font-semibold border-slate-200 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Food Type</label>
                          <Select
                            value={draft.foodType}
                            onValueChange={(v) => updateDraft(selectedItemId, { foodType: v as "VEG" | "NONVEG" })}
                          >
                            <SelectTrigger className="h-10 text-sm font-semibold border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FOOD_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Time Slot</label>
                          <Select
                            value={draft.timeSlot}
                            onValueChange={(v) => updateDraft(selectedItemId, { timeSlot: v as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER" })}
                          >
                            <SelectTrigger className="h-10 text-sm font-semibold border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Available For</label>
                          <Select
                            value={draft.availableFor}
                            onValueChange={(v) => updateDraft(selectedItemId, { availableFor: v as "TODAY" | "TOMORROW" | "BOTH" })}
                          >
                            <SelectTrigger className="h-10 text-sm font-semibold border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_FOR.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 shadow-sm">
                        <span className="text-sm font-bold text-slate-700">Mark as Bestseller</span>
                        <Switch
                          checked={draft.bestseller}
                          onCheckedChange={(v) => updateDraft(selectedItemId, { bestseller: v })}
                          className="data-[state=checked]:bg-[#ff4500]"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {draft.cuisine && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1.5 px-3 font-semibold shadow-sm">
                            <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" /> {draft.cuisine}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 py-1.5 px-3 font-semibold shadow-sm">
                          <span className="h-3 w-3 rounded-sm border border-red-500 bg-red-100 flex items-center justify-center mr-1.5 text-[8px]">NV</span> {draft.foodType === "NONVEG" ? "Non-Veg" : "Veg"}
                        </Badge>
                        {draft.bestseller && (
                          <Badge variant="outline" className="bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/30 py-1.5 px-3 font-semibold shadow-sm">
                            <Star className="h-3.5 w-3.5 mr-1.5" /> Bestseller
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Pricing */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <label className="text-xs font-bold text-slate-700">Selling Price (₹) <span className="text-red-500">*</span></label>
                              <Input
                                type="number"
                                min={0}
                                value={draft.price || ""}
                                onChange={(e) => updateDraft(selectedItemId, { price: numOrNull(e.target.value) ?? 0 })}
                                className="font-bold text-slate-900 h-10 border-slate-200 shadow-sm"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs font-bold text-slate-700">MRP / Compare at Price (₹)</label>
                              <Input
                                type="number"
                                min={0}
                                value={draft.compareAtPrice ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { compareAtPrice: numOrNull(e.target.value) })}
                                className="font-bold text-slate-500 h-10 border-slate-200 shadow-sm"
                              />
                            </div>
                          </div>
                          {draft.compareAtPrice && draft.compareAtPrice > draft.price && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                You Save: ₹{draft.compareAtPrice - draft.price} ({Math.round(((draft.compareAtPrice - draft.price) / draft.compareAtPrice) * 100)}%)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 shadow-sm">
                            <span className="text-sm font-bold text-slate-700">Availability Status</span>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={draft.isAvailable}
                                onCheckedChange={(v) => updateDraft(selectedItemId, { isAvailable: v })}
                                className="data-[state=checked]:bg-green-600"
                              />
                              <span className={`text-sm font-bold ${draft.isAvailable ? "text-green-700" : "text-red-500"}`}>
                                {draft.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Dish Info quick */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-lg">Dish Info</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-700" />
                              <span className="text-sm font-semibold text-slate-700">Serves</span>
                            </div>
                            <Input
                              type="number"
                              min={1}
                              className="h-8 w-20 text-xs font-bold border-slate-200 text-right"
                              value={draft.serves ?? ""}
                              onChange={(e) => updateDraft(selectedItemId, { serves: numOrNull(e.target.value) })}
                              placeholder="Persons"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-green-700" />
                              <span className="text-sm font-semibold text-slate-700">Portion Size</span>
                            </div>
                            <Input
                              className="h-8 w-36 text-xs font-bold border-slate-200 text-right"
                              value={draft.portionSize}
                              onChange={(e) => updateDraft(selectedItemId, { portionSize: e.target.value })}
                              placeholder="e.g. 400 - 450 gms"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-700" />
                              <span className="text-sm font-semibold text-slate-700">Shelf Life</span>
                            </div>
                            <Input
                              className="h-8 w-36 text-xs font-bold border-slate-200 text-right"
                              value={draft.shelfLife}
                              onChange={(e) => updateDraft(selectedItemId, { shelfLife: e.target.value })}
                              placeholder="e.g. Best consumed hot"
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-[#ff4500]" />
                              <span className="text-sm font-semibold text-slate-700">Allergens</span>
                            </div>
                            <Input
                              className="h-8 w-36 text-xs font-bold border-slate-200 text-right"
                              value={draft.allergens}
                              onChange={(e) => updateDraft(selectedItemId, { allergens: e.target.value })}
                              placeholder="e.g. May contain nuts"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* About This Dish */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">About This Dish</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Title</label>
                          <div className="relative">
                            <Input
                              value={draft.aboutTitle}
                              onChange={(e) => updateDraft(selectedItemId, { aboutTitle: e.target.value.slice(0, 100) })}
                              placeholder="e.g. About this dish"
                              className="font-semibold text-slate-900 h-10 border-slate-200 shadow-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">{draft.aboutTitle.length}/100</span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold text-slate-700">Description</label>
                          <div className="relative">
                            <Textarea
                              value={draft.aboutDescription}
                              onChange={(e) => updateDraft(selectedItemId, { aboutDescription: e.target.value.slice(0, 500) })}
                              placeholder="Describe the story, ingredients and taste of this dish..."
                              className="min-h-[120px] text-sm text-slate-700 border-slate-200 shadow-sm resize-none pb-6"
                            />
                            <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium">{draft.aboutDescription.length}/500</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delivery & Service */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Delivery & Service</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-xs font-bold text-slate-700">Delivery Time (mins)</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min={0}
                                value={draft.deliveryTimeMin ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { deliveryTimeMin: numOrNull(e.target.value) })}
                                placeholder="Min"
                                className="h-10 text-sm font-semibold border-slate-200 shadow-sm"
                              />
                              <Input
                                type="number"
                                min={0}
                                value={draft.deliveryTimeMax ?? ""}
                                onChange={(e) => updateDraft(selectedItemId, { deliveryTimeMax: numOrNull(e.target.value) })}
                                placeholder="Max"
                                className="h-10 text-sm font-semibold border-slate-200 shadow-sm"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-bold text-slate-700">Delivery Fee (₹)</label>
                            <Input
                              type="number"
                              min={0}
                              value={draft.deliveryFee ?? ""}
                              onChange={(e) => updateDraft(selectedItemId, { deliveryFee: numOrNull(e.target.value) })}
                              placeholder="e.g. 49"
                              className="h-10 text-sm font-semibold border-slate-200 shadow-sm"
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
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Ratings & Social Proof</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Average Rating</label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 bg-slate-50">
                              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                              <span className="font-bold text-slate-900">{selectedRow?.avgRating ? Number(selectedRow.avgRating).toFixed(1) : "—"}</span>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Total Reviews</label>
                            <div className="flex items-center border rounded-md px-3 h-10 bg-slate-50">
                              <span className="font-bold text-slate-900">{selectedRow?.totalReviews ?? 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Total Orders</label>
                          <div className="flex items-center border rounded-md px-3 h-10 bg-slate-50">
                            <span className="font-bold text-slate-900">{selectedRow?.orderCount ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 text-green-800 p-2.5 rounded-lg border border-green-100">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-bold">Ratings & orders update automatically</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Highlights */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Highlights</CardTitle>
                        <span className="text-xs font-medium text-slate-500">(Why you&apos;ll love it)</span>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {draft.highlights.length === 0 && (
                          <p className="text-sm text-slate-400">No highlights yet — add the reasons customers will love this dish.</p>
                        )}
                        {draft.highlights.map((h, i) => (
                          <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                value={h.title}
                                onChange={(e) => updateHighlight(i, { title: e.target.value.slice(0, 40) })}
                                placeholder="Title (e.g. 100% Homemade)"
                                className="h-8 text-xs font-bold border-slate-200"
                              />
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Switch
                                  checked={h.enabled}
                                  onCheckedChange={(v) => updateHighlight(i, { enabled: v })}
                                  className="data-[state=checked]:bg-green-600 scale-75 origin-right"
                                />
                                <button onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <Input
                              value={h.description}
                              onChange={(e) => updateHighlight(i, { description: e.target.value.slice(0, 60) })}
                              placeholder="Short description"
                              className="h-8 text-xs border-slate-200"
                            />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed border-[#ff4500]/50 text-[#ff4500] hover:bg-[#ff4500]/10 font-bold bg-white" onClick={addHighlight}>
                          <Plus className="h-4 w-4 mr-2" /> Add Highlight
                        </Button>
                      </CardContent>
                    </Card>

                    {/* You May Also Like */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">You May Also Like</CardTitle>
                        <span className="text-xs font-medium text-slate-500">({draft.relatedItemIds.length} items)</span>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                          {(options?.menuItems ?? [])
                            .filter((m) => m.id !== selectedItemId)
                            .map((m) => {
                              const checked = draft.relatedItemIds.includes(m.id)
                              return (
                                <label
                                  key={m.id}
                                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${checked ? "bg-green-50/60 border-green-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={() => toggleRelated(m.id)}
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <div className="min-w-0">
                                      <span className={`font-semibold text-xs truncate block ${checked ? "text-green-900" : "text-slate-900"}`}>{m.name}</span>
                                      <span className="text-[10px] text-slate-400 font-medium block truncate">{m.kitchenName || "—"}</span>
                                    </div>
                                  </div>
                                  {!m.isAvailable && (
                                    <Badge variant="outline" className="h-5 text-[10px] text-slate-400 border-slate-200 shrink-0">Hidden</Badge>
                                  )}
                                </label>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO & Visibility */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">SEO & Visibility</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Title</label>
                          <div className="relative">
                            <Input
                              value={draft.metaTitle}
                              onChange={(e) => updateDraft(selectedItemId, { metaTitle: e.target.value.slice(0, 60) })}
                              placeholder={`${draft.name} | ${kitchenName}`}
                              className="text-xs font-semibold h-10 border-slate-200 shadow-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">{draft.metaTitle.length}/60</span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Description</label>
                          <div className="relative">
                            <Textarea
                              value={draft.metaDescription}
                              onChange={(e) => updateDraft(selectedItemId, { metaDescription: e.target.value.slice(0, 160) })}
                              placeholder="Short SEO description shown in search results..."
                              className="min-h-[80px] text-xs font-medium text-slate-700 border-slate-200 shadow-sm resize-none pb-5"
                            />
                            <span className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-medium">{draft.metaDescription.length}/160</span>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create an item in {kitchenName}&apos;s menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editor-item-name">Item Name</Label>
              <Input
                id="editor-item-name"
                placeholder="e.g. Chicken Biryani"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editor-item-price">Selling Price (₹)</Label>
              <Input
                id="editor-item-price"
                type="number"
                min={0}
                placeholder="e.g. 189"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
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
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
