"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Camera, Clock, ShieldCheck, X, Star, MapPin, UtensilsCrossed, Settings2 } from "lucide-react"
import Image from "next/image"

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { KitchenPartnerRow } from "./columns"
import {
  useUpdateKitchenDetailsMutation,
  useUpdateKitchenStatusMutation,
  useUpdateKitchenImageMutation,
  useUpdateKitchenCoverImageMutation,
  useUpdateKitchenOfferTextMutation,
  useUpdateKitchenCuisinesMutation,
} from "@/stores/adminKitchensStore"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import { getAdminMenuItemsByKitchen } from "@/actions/admin/admin-menu-cms"
import { getAllCategories } from "@/actions/admin/admin-cms"
import { cn } from "@/lib/utils"

interface KitchenDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kitchen: KitchenPartnerRow | null
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]",
  APPROVED: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]",
  PENDINGAPPROVAL: "bg-[#FFF4D6] text-[#D97706] border-none",
  SUSPENDED: "bg-[#FFE8E8] text-[#DC2626] border-none",
  REJECTED: "bg-[#F1F5F9] text-[#475569] border-none",
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

type OperatingHours = Record<string, { open: string; close: string }>

function normalizeHours(hours: OperatingHours | null | undefined): OperatingHours {
  const out: OperatingHours = {}
  for (const day of DAYS) {
    const match = hours ? Object.entries(hours).find(([k]) => k.toLowerCase() === day) : undefined
    out[day] = match
      ? { open: match[1].open, close: match[1].close }
      : { open: "09:00", close: "21:00" }
  }
  return out
}

function kitchenName(kitchen: KitchenPartnerRow) {
  return kitchen.displayName || kitchen.name || "Unknown Kitchen"
}

export function KitchenDetailsSheet({ open, onOpenChange, kitchen }: KitchenDetailsSheetProps) {
  if (!kitchen) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[700px] p-0 overflow-hidden flex flex-col bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <KitchenDetailsBody
          key={kitchen.id}
          kitchen={kitchen}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

export function KitchenDetailsBody({ kitchen, onClose }: { kitchen: KitchenPartnerRow; onClose: () => void }) {
  const [displayName, setDisplayName] = useState(kitchen.displayName || kitchen.name || "")
  const [email] = useState(kitchen.email || "")
  const [phoneNumber] = useState(kitchen.phoneNumber || "")
  const [description, setDescription] = useState(kitchen.description ?? "")
  const [offerText, setOfferText] = useState(kitchen.customOfferText || "")
  const [prepTime, setPrepTime] = useState(String(kitchen.estimatedPrepTime ?? 25))
  const [minOrder, setMinOrder] = useState(kitchen.minOrder != null ? String(kitchen.minOrder) : "99")
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(
    kitchen.deliveryRadiusKm != null ? String(kitchen.deliveryRadiusKm) : "2.1"
  )
  const [fssaiNumber, setFssaiNumber] = useState(kitchen.kyc?.fssaiNumber ?? "")
  const [fssaiValidTill, setFssaiValidTill] = useState(
    kitchen.kyc?.fssaiValidTill
      ? new Date(kitchen.kyc.fssaiValidTill).toISOString().slice(0, 10)
      : ""
  )
  const [gstNumber, setGstNumber] = useState(kitchen.kyc?.gstNumber ?? "")

  const address = kitchen.address
  const [lineOne, setLineOne] = useState(address?.lineOne ?? "")
  const [doorNo, setDoorNo] = useState(address?.doorNo ?? "")
  const [area, setArea] = useState(address?.area ?? "")
  const [landmark, setLandmark] = useState(address?.landmark ?? "")
  const [pincode, setPincode] = useState(address?.pincode ?? "")
  const [latitude, setLatitude] = useState(address?.latitude != null ? String(address.latitude) : "")
  const [longitude, setLongitude] = useState(address?.longitude != null ? String(address.longitude) : "")

  const [operatingHours, setOperatingHours] = useState<OperatingHours>(() =>
    normalizeHours(kitchen.operatingHours)
  )

  const [selectedCuisineIds, setSelectedCuisineIds] = useState<string[]>(
    () => kitchen.cuisines?.map((c) => c.id) ?? []
  )

  const [statusBusy, setStatusBusy] = useState<string | null>(null)

  const detailsMutation = useUpdateKitchenDetailsMutation()
  const offerTextMutation = useUpdateKitchenOfferTextMutation()
  const imageMutation = useUpdateKitchenImageMutation()
  const coverImageMutation = useUpdateKitchenCoverImageMutation()
  const statusMutation = useUpdateKitchenStatusMutation()
  const cuisinesMutation = useUpdateKitchenCuisinesMutation()

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["admin-kitchen-menu-items", kitchen.id],
    queryFn: () => getAdminMenuItemsByKitchen(kitchen.id),
    enabled: !!kitchen.id,
    staleTime: 60_000,
  })

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAllCategories,
    staleTime: 60_000,
  })

  const availableCount = menuItems.filter((m) => m.isAvailable).length

  const name = kitchenName(kitchen)
  const initials = name.substring(0, 2).toUpperCase()

  const handleSaveGeneral = () => {
    detailsMutation
      .mutateAsync({
        kitchenId: kitchen.id,
        details: {
          displayName,
          description,
          estimatedPrepTime: parseInt(prepTime, 10) || 25,
          minOrder: parseInt(minOrder, 10) || null,
          deliveryRadiusKm: parseFloat(deliveryRadiusKm) || null,
          fssaiNumber: fssaiNumber.trim() || null,
          fssaiValidTill: fssaiValidTill || null,
          gstNumber: gstNumber.trim() || null,
        },
      })
      .then((result) => {
        if (result.success) {
          toast.success("Kitchen details updated")
        } else {
          toast.error(result.error ?? "Failed to update details")
        }
      })
    offerTextMutation
      .mutateAsync({
        kitchenId: kitchen.id,
        customOfferText: offerText,
      })
      .then((result) => {
        if (!result.success) {
          toast.error(result.error ?? "Failed to update offer text")
        }
      })
  }

  const handleSaveLocation = () => {
    detailsMutation
      .mutateAsync({
        kitchenId: kitchen.id,
        details: {
          lineOne,
          doorNo,
          area,
          landmark,
          pincode,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        },
      })
      .then((result) => {
        if (result.success) {
          toast.success("Location updated")
        } else {
          toast.error(result.error ?? "Failed to update location")
        }
      })
  }

  const handleSaveTimings = () => {
    detailsMutation
      .mutateAsync({
        kitchenId: kitchen.id,
        details: { operatingHours },
      })
      .then((result) => {
        if (result.success) {
          toast.success("Timings updated")
        } else {
          toast.error(result.error ?? "Failed to update timings")
        }
      })
  }

  const handleSaveCuisines = () => {
    cuisinesMutation
      .mutateAsync({ kitchenId: kitchen.id, categoryIds: selectedCuisineIds })
      .then((result) => {
        if (result.success) {
          toast.success("Cuisines updated")
        } else {
          toast.error(result.error ?? "Failed to update cuisines")
        }
      })
  }

  const handleStatusChange = (status: string) => {
    setStatusBusy(status)
    statusMutation
      .mutateAsync({ id: kitchen.id, status })
      .then((result) => {
        if (result.success) {
          toast.success(`Kitchen status updated to ${status}`)
        } else {
          toast.error(result.error ?? "Failed to update status")
        }
      })
      .finally(() => setStatusBusy(null))
  }

  const toggleCuisine = (id: string) => {
    setSelectedCuisineIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const totalRevenue = useMemo(
    () => menuItems.reduce((sum, m) => sum + (m.orderCount ?? 0), 0),
    [menuItems]
  )

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header section */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[20px] font-bold text-[#111827]">Edit Kitchen Details</h2>
              <p className="text-[13px] text-[#475569] mt-1">Update all information for this kitchen partner</p>
            </div>
            <button 
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="flex items-start gap-5 mb-6">
            <div className="relative w-[140px] h-[140px] rounded-[8px] overflow-hidden shrink-0 border border-[#E2E8F0]">
              {kitchen.coverImageUrl ? (
                <Image src={kitchen.coverImageUrl} alt="Banner" fill className="object-cover" sizes="140px" />
              ) : (
                <div className="w-full h-full bg-[#FAFBFC] flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[#94A3B8]" />
                </div>
              )}
              
              <div className="absolute bottom-2 left-2 right-2">
                <CloudinaryUpload
                  onUpload={(result) =>
                    coverImageMutation
                      .mutateAsync({ kitchenId: kitchen.id, coverImageUrl: result.secure_url })
                      .then((res) => {
                        if (res.success) {
                          toast.success("Cover image updated successfully")
                        } else {
                          toast.error(res.error ?? "Failed to update cover image")
                        }
                      })
                  }
                >
                  {({ uploading, startUpload }) => (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={startUpload} 
                      disabled={uploading} 
                      className="w-full h-[32px] gap-2 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#334155] rounded-[7px] text-[12px] font-medium shadow-sm backdrop-blur-sm border-[#E2E8F0]"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#475569]" /> : <Camera className="w-3.5 h-3.5 text-[#475569]" />}
                      {uploading ? "Uploading..." : "Change Image"}
                    </Button>
                  )}
                </CloudinaryUpload>
              </div>
            </div>

            <div className="flex flex-col pt-1">
              <div className="flex items-center gap-3 mb-1.5">
                <CloudinaryUpload
                  onUpload={(result) =>
                    imageMutation
                      .mutateAsync({ kitchenId: kitchen.id, imageUrl: result.secure_url })
                      .then((res) => {
                        if (res.success) {
                          toast.success("Profile image updated")
                        } else {
                          toast.error(res.error ?? "Failed to update profile image")
                        }
                      })
                  }
                >
                  {({ uploading, startUpload }) => (
                    <button type="button" onClick={startUpload} disabled={uploading} className="relative group rounded-full overflow-hidden h-9 w-9">
                      <Avatar className="h-9 w-9 rounded-full border border-[#E2E8F0] bg-[#F8FAFC]">
                        <AvatarImage src={kitchen.imageUrl ?? ""} alt={name} className="object-cover" />
                        <AvatarFallback className="rounded-full bg-[#F8FAFC] text-[#475569] text-[14px] font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  )}
                </CloudinaryUpload>
                <h3 className="text-[18px] font-bold text-[#111827]">{name}</h3>
                <Badge variant="outline" className={`uppercase font-bold tracking-wide px-2 py-0.5 text-[10px] rounded-[6px] ${statusStyles[kitchen.status]}`}>
                  {kitchen.status === "PENDINGAPPROVAL" ? "PENDING" : kitchen.status}
                </Badge>
              </div>
              
              <p className="text-[12px] text-[#64748B] mb-3">
                ID: KITCHEN_{kitchen.id.substring(0, 5).toUpperCase()} • Joined on {kitchen.createdAt ? new Date(kitchen.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "New"}
              </p>

              <div className="flex items-center gap-1.5 mb-5">
                <Star className="h-[14px] w-[14px] text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-[13px] font-bold text-[#111827]">{kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "New"}</span>
                <span className="text-[12px] text-[#64748B]">({(kitchen.orders ?? 0).toLocaleString()} orders)</span>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#111827]">{prepTime}-{parseInt(prepTime, 10) + 15} mins</span>
                  <span className="text-[12px] text-[#64748B]">Prep Time</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#111827]">₹{minOrder}</span>
                  <span className="text-[12px] text-[#64748B]">Min Order</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#111827]">₹{totalRevenue.toLocaleString()}</span>
                  <span className="text-[12px] text-[#64748B]">Items Sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full flex-1 flex flex-col">
          <div className="px-6 border-b border-[#EEF2F6]">
            <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 space-x-6 overflow-x-auto custom-scrollbar flex-nowrap">
              <TabsTrigger value="general" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">General</TabsTrigger>
              <TabsTrigger value="menu" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">Menu & Cuisines</TabsTrigger>
              <TabsTrigger value="location" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">Location</TabsTrigger>
              <TabsTrigger value="timings" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">Timings</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">Documents</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-[#07883F] data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none text-[13px] text-[#64748B] data-[state=active]:text-[#07883F] font-medium whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6">
            <TabsContent value="general" className="py-6 space-y-8 mt-0 outline-none">
              
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155]">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Kitchen Name <span className="text-[#DC2626]">*</span></Label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Email <span className="text-[#DC2626]">*</span></Label>
                    <Input 
                      value={email} 
                      disabled 
                      className="h-[40px] bg-[#FAFBFC] border-[#DCE3EA] rounded-[8px] text-[#64748B] disabled:opacity-100" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Phone Number <span className="text-[#DC2626]">*</span></Label>
                    <Input 
                      value={phoneNumber} 
                      disabled 
                      className="h-[40px] bg-[#FAFBFC] border-[#DCE3EA] rounded-[8px] text-[#64748B] disabled:opacity-100" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Alternate Phone</Label>
                    <Input 
                      value={phoneNumber} 
                      disabled 
                      className="h-[40px] bg-[#FAFBFC] border-[#DCE3EA] rounded-[8px] text-[#64748B] disabled:opacity-100" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-[#334155]">Description</Label>
                  <Textarea 
                    rows={4} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this kitchen..."
                    className="bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)] resize-none p-3"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[11px] text-[#64748B]">{description.length}/500</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-[#334155]">Custom Offer Text</Label>
                  <Input 
                    value={offerText} 
                    onChange={(e) => setOfferText(e.target.value)} 
                    placeholder="20% OFF on all orders above ₹299" 
                    className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">This will be displayed on the kitchen page</p>
                </div>

                <div className="space-y-1.5 w-[200px]">
                  <Label className="text-[12px] font-semibold text-[#334155]">Estimated Preparation Time (mins) <span className="text-[#DC2626]">*</span></Label>
                  <Input 
                    value={prepTime} 
                    onChange={(e) => setPrepTime(e.target.value)} 
                    type="number" 
                    className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155]">Additional Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Minimum Order Value (₹)</Label>
                    <Input
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      type="number"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Delivery Radius (km)</Label>
                    <Input
                      value={deliveryRadiusKm}
                      onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                      type="number"
                      step="0.1"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="menu" className="py-6 space-y-6 mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155]">Cuisines</h3>
                <p className="text-[12px] text-[#64748B] -mt-2">Select the cuisines this kitchen serves.</p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.length === 0 && (
                    <span className="text-[12px] text-[#94A3B8]">Loading categories...</span>
                  )}
                  {categoryOptions.map((cat) => {
                    const active = selectedCuisineIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCuisine(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors",
                          active
                            ? "bg-[#07883F] text-[#FFFFFF] border-[#07883F]"
                            : "bg-[#FFFFFF] text-[#334155] border-[#DCE3EA] hover:border-[#07883F] hover:text-[#07883F]"
                        )}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
                <Button
                  onClick={handleSaveCuisines}
                  disabled={cuisinesMutation.isPending}
                  className="h-[36px] px-4 bg-[#07883F] hover:bg-[#057333] text-[#FFFFFF] rounded-[7px] text-[13px] font-medium"
                >
                  {cuisinesMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Cuisines
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#334155]">Menu Items</h3>
                  <span className="text-[12px] text-[#64748B]">
                    {availableCount}/{menuItems.length} available
                  </span>
                </div>

                {menuLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 rounded-[8px] bg-[#F8FAFC] animate-pulse" />
                    ))}
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-8 text-[#94A3B8] text-[13px]">
                    No menu items found for this kitchen.
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-[#E5E7EB] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[#FAFBFC]">
                        <TableRow className="hover:bg-transparent border-b border-[#EEF2F6]">
                          <TableHead className="text-[11px] font-semibold text-[#334155] h-10">Item</TableHead>
                          <TableHead className="text-[11px] font-semibold text-[#334155] h-10">Category</TableHead>
                          <TableHead className="text-[11px] font-semibold text-[#334155] h-10 text-right">Price</TableHead>
                          <TableHead className="text-[11px] font-semibold text-[#334155] h-10 text-right">Orders</TableHead>
                          <TableHead className="text-[11px] font-semibold text-[#334155] h-10 text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItems.slice(0, 20).map((item) => (
                          <TableRow key={item.id} className="border-b border-[#EEF2F6] hover:bg-[#FAFCFB]">
                            <TableCell className="py-2.5 text-[13px] font-medium text-[#111827]">{item.name}</TableCell>
                            <TableCell className="py-2.5 text-[12px] text-[#64748B]">{item.categoryName ?? "—"}</TableCell>
                            <TableCell className="py-2.5 text-[13px] font-semibold text-[#111827] text-right">₹{item.price}</TableCell>
                            <TableCell className="py-2.5 text-[12px] text-[#64748B] text-right">{item.orderCount}</TableCell>
                            <TableCell className="py-2.5 text-right">
                              <Badge variant="outline" className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-[5px]",
                                item.isAvailable
                                  ? "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]"
                                  : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
                              )}>
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {menuItems.length > 20 && (
                      <div className="px-4 py-2.5 text-[12px] text-[#64748B] border-t border-[#EEF2F6]">
                        Showing first 20 of {menuItems.length} items. Edit them from the Menu CMS.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="location" className="py-6 space-y-6 mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#07883F]" /> Address Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-full">
                    <Label className="text-[12px] font-semibold text-[#334155]">Street Address</Label>
                    <Input
                      value={lineOne}
                      onChange={(e) => setLineOne(e.target.value)}
                      placeholder="House / street address"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Door No</Label>
                    <Input
                      value={doorNo}
                      onChange={(e) => setDoorNo(e.target.value)}
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Area</Label>
                    <Input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Woraiyur"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Landmark</Label>
                    <Input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Pincode</Label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Latitude</Label>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      type="number"
                      step="0.000001"
                      placeholder="10.7895"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">Longitude</Label>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      type="number"
                      step="0.000001"
                      placeholder="79.1392"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveLocation}
                  disabled={detailsMutation.isPending}
                  className="h-[36px] px-4 bg-[#07883F] hover:bg-[#057333] text-[#FFFFFF] rounded-[7px] text-[13px] font-medium"
                >
                  {detailsMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Location
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="timings" className="py-6 space-y-6 mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#07883F]" /> Operating Hours
                </h3>
                <p className="text-[12px] text-[#64748B] -mt-2">
                  Set the opening and closing time for each day.
                </p>

                <div className="space-y-2">
                  {DAYS.map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-24 text-[13px] font-medium text-[#334155] capitalize">{day}</span>
                      <Input
                        type="time"
                        value={operatingHours[day].open}
                        onChange={(e) =>
                          setOperatingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], open: e.target.value },
                          }))
                        }
                        className="h-[36px] w-[130px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[7px] text-[#1E293B] text-[13px] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 px-2"
                      />
                      <span className="text-[12px] text-[#64748B]">to</span>
                      <Input
                        type="time"
                        value={operatingHours[day].close}
                        onChange={(e) =>
                          setOperatingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], close: e.target.value },
                          }))
                        }
                        className="h-[36px] w-[130px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[7px] text-[#1E293B] text-[13px] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 px-2"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveTimings}
                  disabled={detailsMutation.isPending}
                  className="h-[36px] px-4 bg-[#07883F] hover:bg-[#057333] text-[#FFFFFF] rounded-[7px] text-[13px] font-medium"
                >
                  {detailsMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Timings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="py-6 space-y-6 mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#07883F]" /> License & Compliance Documents
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">FSSAI License No.</Label>
                    <Input
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="12345678901234"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">FSSAI Valid Till</Label>
                    <Input
                      value={fssaiValidTill}
                      onChange={(e) => setFssaiValidTill(e.target.value)}
                      type="date"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#334155]">GST Number</Label>
                    <Input
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="33ABCDE1234F1Z5"
                      className="h-[40px] bg-[#FFFFFF] border-[#DCE3EA] rounded-[8px] text-[#1E293B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="py-6 space-y-6 mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold text-[#334155] flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-[#07883F]" /> Kitchen Status
                </h3>
                <p className="text-[12px] text-[#64748B] -mt-2">
                  Change the approval status of this kitchen partner.
                </p>

                <div className="space-y-2">
                  {[
                    { value: "ACTIVE", label: "Active", desc: "Kitchen is live on the website", color: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]" },
                    { value: "APPROVED", label: "Approved", desc: "Approved but not yet live", color: "bg-[#E7F6EA] text-[#15803D] border-[#D2EBD8]" },
                    { value: "PENDINGAPPROVAL", label: "Pending Approval", desc: "Awaiting review", color: "bg-[#FFF4D6] text-[#D97706] border-none" },
                    { value: "SUSPENDED", label: "Suspended", desc: "Temporarily disabled", color: "bg-[#FFE8E8] text-[#DC2626] border-none" },
                    { value: "REJECTED", label: "Rejected", desc: "Application rejected", color: "bg-[#F1F5F9] text-[#475569] border-none" },
                  ].map((option) => {
                    const isCurrent = kitchen.status === option.value
                    const isBusy = statusBusy === option.value
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center justify-between gap-3 p-3 rounded-[8px] border transition-colors",
                          isCurrent ? "border-[#07883F] bg-[#F4FAF6]" : "border-[#E5E7EB] bg-[#FFFFFF]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn("uppercase font-bold tracking-wide px-2 py-0.5 text-[10px] rounded-[6px]", option.color)}>
                            {option.label}
                          </Badge>
                          <span className="text-[12px] text-[#64748B]">{option.desc}</span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[12px] font-semibold text-[#07883F]">Current</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(option.value)}
                            disabled={!!statusBusy}
                            className="h-[30px] px-3 text-[12px] font-semibold text-[#07883F] border-[#9BD5B2] hover:bg-[#F0FDF4] rounded-[7px]"
                          >
                            {isBusy && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                            Set
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[8px] border border-[#E5E7EB] bg-[#FAFBFC] p-3 flex items-start gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-[#64748B] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#64748B]">
                    Public code: <span className="font-semibold text-[#334155]">{kitchen.publicCode ?? "—"}</span> •
                    Rating: <span className="font-semibold text-[#334155]">{kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "New"}</span> •
                    Reviews: <span className="font-semibold text-[#334155]">{kitchen.totalReviews ?? 0}</span>
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="p-5 border-t border-[#EEF2F6] bg-[#FFFFFF] flex items-center justify-end gap-3 mt-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-[40px] px-6 bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] rounded-[8px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveGeneral} 
              disabled={detailsMutation.isPending || offerTextMutation.isPending}
              className="h-[40px] px-6 bg-[#07883F] hover:bg-[#057333] active:bg-[#04652D] text-[#FFFFFF] rounded-[8px] border border-[#07883F]"
            >
              {(detailsMutation.isPending || offerTextMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Kitchen
            </Button>
          </div>
        </Tabs>
      </div>
    </>
  )
}