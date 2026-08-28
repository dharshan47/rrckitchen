"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  Clock,
  Star,
  Camera,
  Eye,
  Pencil,
  UtensilsCrossed,
  MapPin,
  Landmark,
  UserRound,
  ChefHat,
  BadgeCheck,
  Calendar,
  ArrowRight,
  Loader2,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Save,
  X,
  Timer,
  Settings2,
  Check,
  Mail,
  Phone,
  ChevronRight,
  Sparkles,
  CircleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateKitchenPhoto, updateKitchenAddress, updateKitchenCoverPhoto } from "@/actions/admin/dashboard"
import {
  getAvailableCuisines,
  updateKitchenCuisines,
  updateKitchenDescription,
  updateKitchenDisplayName,
  updateKitchenOperatingHours,
  updateKitchenPrepTime,
} from "@/actions/kitchen/kitchen-profile"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"
import { getKitchenStatus } from "@/components/kitchen/kitchen-timing-display"

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

const TABS = [
  { label: "Profile", icon: UserRound, target: "profile-info" },
  { label: "Address", icon: MapPin, target: "address-card" },
  { label: "Bank & Payments", icon: Landmark, target: "bank-card" },
  { label: "Kitchen Details", icon: ChefHat, target: "details-card" },
  { label: "Operating Hours", icon: Clock, target: "hours-card" },
  { label: "Preferences", icon: Star, target: "preferences-card" },
] as const

function to12h(t?: string | null) {
  if (!t) return "—"
  if (/am|pm/i.test(t)) return t
  const [h, m] = t.split(":").map((n) => parseInt(n, 10))
  if (Number.isNaN(h)) return t
  const suffix = h >= 12 ? "PM" : "AM"
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}${m !== undefined && !Number.isNaN(m) ? ":" + String(m).padStart(2, "0") : ""} ${suffix}`
}

function to24h(t: string) {
  const trimmed = t.trim()
  if (/am|pm/i.test(trimmed)) {
    const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
    if (!match) return trimmed
    let h = parseInt(match[1], 10)
    const m = match[2] ?? "00"
    const suffix = (match[3] || "").toLowerCase()
    if (suffix === "pm" && h !== 12) h += 12
    if (suffix === "am" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:${m}`
  }
  return trimmed.slice(0, 5)
}

function EditDialog({
  open,
  onOpenChange,
  title,
  description,
  saving,
  onSave,
  children,
  submitLabel = "Save Changes",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  saving: boolean
  onSave: () => void
  children: React.ReactNode
  submitLabel?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[12px] bg-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[#087A3E]" /> {title}
          </DialogTitle>
          {description && <DialogDescription className="text-[12px] text-[#6B7280]">{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">{children}</div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-[36px] px-5 rounded-[7px] border-[#D9DEE3] text-[#374151] font-medium bg-[#FFFFFF] hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1.5" /> Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="h-[36px] px-5 rounded-[7px] bg-[#087A3E] hover:bg-[#065F30] text-[#FFFFFF] font-medium gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfilePageClient() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>("Profile")
  const [editing, setEditing] = useState<
    null | "name" | "description" | "cuisines" | "address" | "hours" | "preptime"
  >(null)
  const data = useKitchenDashboardData()

  const [nameValue, setNameValue] = useState("")
  const [descriptionValue, setDescriptionValue] = useState("")
  const [selectedCuisineIds, setSelectedCuisineIds] = useState<string[]>([])
  const [prepTimeValue, setPrepTimeValue] = useState("")
  const [addressForm, setAddressForm] = useState({
    lineOne: "",
    doorNo: "",
    area: "",
    landmark: "",
    pincode: "",
    latitude: "",
    longitude: "",
  })
  const [hoursForm, setHoursForm] = useState<Record<string, { open: string; close: string }>>(() => {
    const next: Record<string, { open: string; close: string }> = {}
    for (const day of DAY_KEYS) next[day] = { open: "09:00", close: "21:00" }
    return next
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })

  const savePhotoMutation = useMutation({
    mutationFn: (imageUrl: string | null) => updateKitchenPhoto(imageUrl),
    onSuccess: (result, imageUrl) => {
      if (result.success) {
        toast.success(imageUrl ? "Kitchen photo updated" : "Kitchen photo removed")
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update photo")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveCoverPhotoMutation = useMutation({
    mutationFn: (imageUrl: string | null) => updateKitchenCoverPhoto(imageUrl),
    onSuccess: (result, imageUrl) => {
      if (result.success) {
        toast.success(imageUrl ? "Cover photo updated" : "Cover photo removed")
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update cover photo")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveNameMutation = useMutation({
    mutationFn: (displayName: string) => updateKitchenDisplayName(displayName),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Kitchen name updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update name")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveDescriptionMutation = useMutation({
    mutationFn: (description: string | null) => updateKitchenDescription(description),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Description updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update description")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveCuisinesMutation = useMutation({
    mutationFn: (categoryIds: string[]) => updateKitchenCuisines(categoryIds),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cuisines updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update cuisines")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveAddressMutation = useMutation({
    mutationFn: (a: {
      lineOne: string
      doorNo?: string
      area?: string
      landmark?: string
      pincode: string
      latitude: number
      longitude: number
    }) => updateKitchenAddress(a),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Address updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update address")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const saveHoursMutation = useMutation({
    mutationFn: (hours: Record<string, { open: string; close: string }> | null) =>
      updateKitchenOperatingHours(hours),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Operating hours updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update hours")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const savePrepTimeMutation = useMutation({
    mutationFn: (mins: number | null) => updateKitchenPrepTime(mins),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Preparation time updated")
        setEditing(null)
        invalidate()
      } else {
        toast.error(result.error ?? "Failed to update prep time")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const { data: availableCuisines } = useQuery({
    queryKey: ["available-cuisines"],
    queryFn: getAvailableCuisines,
    staleTime: 5 * 60_000,
  })

  const [prevKitchen, setPrevKitchen] = useState(data?.kitchen)

  if (data?.kitchen && data.kitchen !== prevKitchen) {
    setPrevKitchen(data.kitchen)
    const k = data.kitchen
    setNameValue(k.displayName || "Your Kitchen")
    setDescriptionValue(k.description ?? "")
    setSelectedCuisineIds(k.cuisineIds ?? [])
    setPrepTimeValue(k.estimatedPrepTime != null ? String(k.estimatedPrepTime) : "")
    setAddressForm({
      lineOne: k.address?.lineOne ?? "",
      doorNo: k.address?.doorNo ?? "",
      area: k.address?.area ?? "",
      landmark: k.address?.landmark ?? "",
      pincode: k.address?.pincode ?? "",
      latitude: k.address?.latitude != null ? String(k.address.latitude) : "",
      longitude: k.address?.longitude != null ? String(k.address.longitude) : "",
    })
    const next: Record<string, { open: string; close: string }> = {}
    for (const day of DAY_KEYS) {
      const existing = k.operatingHours?.[day]
      next[day] = {
        open: existing ? to24h(existing.open) : "09:00",
        close: existing ? to24h(existing.close) : "21:00",
      }
    }
    setHoursForm(next)
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-96" /></div>
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <div className="flex gap-4 border-b border-[#E5E7EB] pb-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-24" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const kitchen = data.kitchen
  const publicUrl = `/kitchens/${kitchen.slug}`
  const profileImage = kitchen.imageUrl || "/kitchen/profile.webp"
  const coverImage = kitchen.coverImageUrl || "/kitchen/smartphone.webp"

  const displayName = kitchen.displayName || "Your Kitchen"
  const description = kitchen.description
  const cuisines = kitchen.cuisines ?? []
  const avgRating = kitchen.avgRating
  const totalReviews = kitchen.totalReviews ?? 0
  const prepTime = kitchen.estimatedPrepTime
  const address = kitchen.address
  const operatingHours = kitchen.operatingHours as Record<string, { open: string; close: string }> | null
  const status = getKitchenStatus(operatingHours)
  const isVerified = kitchen.status === "APPROVED" || kitchen.status === "ACTIVE"

  const filledCount = [
    kitchen.displayName,
    kitchen.description,
    kitchen.imageUrl,
    address,
    operatingHours,
    kitchen.estimatedPrepTime,
    (kitchen.cuisines?.length ?? 0) > 0,
    kitchen.bankName,
  ].filter(Boolean).length
  const completionPct = Math.round((filledCount / 8) * 100)


  const submitEdit = () => {
    if (editing === "name") {
      if (!nameValue.trim()) {
        toast.error("Kitchen name cannot be empty")
        return
      }
      saveNameMutation.mutate(nameValue.trim())
    } else if (editing === "description") {
      saveDescriptionMutation.mutate(descriptionValue.trim() || null)
    } else if (editing === "cuisines") {
      saveCuisinesMutation.mutate(selectedCuisineIds)
    } else if (editing === "address") {
      if (!addressForm.lineOne.trim() || !addressForm.pincode.trim()) {
        toast.error("Address line and pincode are required")
        return
      }
      const latitude = parseFloat(addressForm.latitude)
      const longitude = parseFloat(addressForm.longitude)
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        toast.error("Please enter valid latitude and longitude")
        return
      }
      saveAddressMutation.mutate({
        lineOne: addressForm.lineOne.trim(),
        doorNo: addressForm.doorNo.trim() || undefined,
        area: addressForm.area.trim() || undefined,
        landmark: addressForm.landmark.trim() || undefined,
        pincode: addressForm.pincode.trim(),
        latitude,
        longitude,
      })
    } else if (editing === "hours") {
      const next: Record<string, { open: string; close: string }> = {}
      for (const day of DAY_KEYS) {
        const row = hoursForm[day]
        if (row.open && row.close) {
          next[day] = { open: to24h(row.open), close: to24h(row.close) }
        }
      }
      saveHoursMutation.mutate(Object.keys(next).length > 0 ? next : null)
    } else if (editing === "preptime") {
      const mins = parseInt(prepTimeValue, 10)
      if (prepTimeValue.trim() && (Number.isNaN(mins) || mins <= 0)) {
        toast.error("Please enter a valid preparation time in minutes")
        return
      }
      savePrepTimeMutation.mutate(prepTimeValue.trim() ? mins : null)
    }
  }

  const openEdit = (field: NonNullable<typeof editing>) => {
    if (field === "name") setNameValue(displayName)
    if (field === "description") setDescriptionValue(description ?? "")
    if (field === "cuisines") setSelectedCuisineIds(kitchen.cuisineIds ?? [])
    if (field === "preptime") setPrepTimeValue(prepTime != null ? String(prepTime) : "")
    if (field === "address") {
      setAddressForm({
        lineOne: address?.lineOne ?? "",
        doorNo: address?.doorNo ?? "",
        area: address?.area ?? "",
        landmark: address?.landmark ?? "",
        pincode: address?.pincode ?? "",
        latitude: address?.latitude != null ? String(address.latitude) : "",
        longitude: address?.longitude != null ? String(address.longitude) : "",
      })
    }
    if (field === "hours") {
      const next: Record<string, { open: string; close: string }> = {}
      for (const day of DAY_KEYS) {
        const existing = operatingHours?.[day]
        next[day] = {
          open: existing ? to24h(existing.open) : "09:00",
          close: existing ? to24h(existing.close) : "21:00",
        }
      }
      setHoursForm(next)
    }
    setEditing(field)
  }

  const hoursRows = DAY_KEYS.map((day) => ({
    day,
    label: DAY_LABELS[day],
    open: to12h(operatingHours?.[day]?.open),
    close: to12h(operatingHours?.[day]?.close),
  }))
  const allDaysOpen = !!operatingHours && DAY_KEYS.every((d) => operatingHours[d])

  const addressString = address
    ? [
        address.doorNo ? address.doorNo + ", " : "",
        address.lineOne,
        address.area ? ", " + address.area : "",
        address.landmark ? ", " + address.landmark : "",
      ].join("")
    : null

  return (
    <CloudinaryUpload onUpload={(result) => savePhotoMutation.mutate(result.secure_url)}>
      {({ uploading, startUpload }) => (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 font-sans pb-10 bg-[#FEFEFE]">

          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827] tracking-tight mb-1">
                Kitchen Profile
              </h1>
              <p className="text-[14px] text-[#4B5563]">
                Manage your kitchen details, availability and account settings
              </p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex items-center gap-2 rounded-[8px] border-[#9FC8AD] text-[#087A3E] bg-[#FFFFFF] hover:bg-[#F5FAF6] hover:text-[#087A3E] hover:border-[#087A3E] h-10 px-4 shadow-none">
              <Link href={publicUrl}>
                <Eye className="h-4 w-4" />
                <span className="font-semibold">Preview Public Page</span>
              </Link>
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[13px] font-medium text-[#4B5563]">Profile Completion</span>
            <Progress value={completionPct} className="w-[200px] h-1.5 bg-[#E5E7EB] [&>div]:bg-[#087A3E]" />
            <span className="text-[13px] font-bold text-[#087A3E]">{completionPct}% Complete</span>
            <span className="text-[13px] text-[#6B7280] ml-4 flex items-center gap-1.5">
              Auto-synced from your kitchen data
              <RefreshCw className="h-3 w-3" />
            </span>
          </div>

          {/* Top Main Card */}
          <Card className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-8">

              {/* Left Side: Photo & Info */}
              <div className="flex flex-col sm:flex-row items-start gap-6 lg:gap-8 flex-1">
                {/* Photo */}
                <div className="relative shrink-0">
                  <div className="w-[140px] h-[140px] rounded-full p-1 border border-[#E5E7EB] bg-white">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <Image src={profileImage} alt={displayName} fill className="object-cover" />
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={startUpload}
                    disabled={uploading}
                    className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_2px_8px_rgba(15,23,42,0.12)] text-[#111827] hover:bg-gray-50 hover:text-[#111827]"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-[18px] w-[18px]" />}
                  </Button>
                </div>

                {/* Info Text */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-[24px] font-bold text-[#111827]">
                      {displayName}
                    </h2>
                    {isVerified && <BadgeCheck className="h-6 w-6 text-[#087A3E]" />}
                  </div>
                  <p className="text-[14px] text-[#4B5563] mb-4 flex items-center gap-1.5">
                    Homemade Food Made with Love <span className="text-[#EF4444]">❤️</span>
                  </p>

                  <div className="flex flex-wrap gap-2.5 mb-6">
                    <Badge variant="secondary" className="bg-[#EEF8F1] hover:bg-[#EEF8F1] text-[#176B3B] border-none font-medium px-3 py-1 rounded-[8px]">
                      Home Kitchen
                    </Badge>
                    {cuisines.slice(0, 3).map((c) => (
                      <Badge key={c} variant="outline" className="bg-[#FFF7ED] hover:bg-[#FFF7ED] text-[#F97316] border-[#FED7AA] font-medium px-3 py-1 rounded-[8px]">
                        {c}
                      </Badge>
                    ))}
                    {cuisines.length === 0 && (
                      <Badge variant="outline" className="bg-[#F9FAFB] hover:bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] font-medium px-3 py-1 rounded-[8px]">
                        No cuisines added yet
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-[22px] w-[22px] text-[#4B5563] stroke-[1.5px]" />
                      <div>
                        <p className="text-[12px] text-[#6B7280] mb-0.5">Preparation Time</p>
                        <p className="text-[14px] font-bold text-[#111827]">{prepTime ? `${prepTime} mins` : "—"}</p>
                      </div>
                    </div>
                    <div className="w-[1px] h-10 bg-[#E5E7EB] hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <Star className="h-[22px] w-[22px] text-[#6B7280] stroke-[1.5px]" />
                      <div>
                        <p className="text-[12px] text-[#6B7280] mb-0.5">Rating</p>
                        <p className="text-[14px] font-bold text-[#111827]">
                          {avgRating != null ? (
                            <>
                              {avgRating} <span className="text-[#6B7280] font-normal text-[13px]">({totalReviews} reviews)</span>
                            </>
                          ) : (
                            "New"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="w-[1px] h-10 bg-[#E5E7EB] hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <Calendar className="h-[22px] w-[22px] text-[#4B5563] stroke-[1.5px]" />
                      <div>
                        <p className="text-[12px] text-[#6B7280] mb-0.5">Status</p>
                        <p className={`text-[14px] font-bold ${status.isOpen ? "text-[#087A3E]" : "text-[#D83A20]"}`}>
                          {status.isOpen ? "Open now" : "Closed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Public Preview Card */}
              <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 bg-[#F5FAF6] border border-[#E4ECE6] rounded-[12px] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#111827]">
                    <Eye className="h-4 w-4 text-[#087A3E]" />
                    Public Preview
                  </div>
                  <CloudinaryUpload onUpload={(result) => saveCoverPhotoMutation.mutate(result.secure_url)}>
                    {({ uploading, startUpload }) => (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startUpload}
                        disabled={uploading}
                        className="h-7 px-2 text-[11px] font-medium border-[#9FC8AD] text-[#087A3E] bg-[#FFFFFF] hover:bg-[#F5FAF6]"
                      >
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Camera className="h-3 w-3 mr-1" />}
                        Edit Cover
                      </Button>
                    )}
                  </CloudinaryUpload>
                </div>

                <div className="bg-[#FFFFFF] rounded-[10px] overflow-hidden border border-[#E5E7EB] shadow-sm relative">
                  <div className="h-[80px] w-full relative">
                    <Image src={coverImage} alt="Cover" fill className="object-cover opacity-60 bg-[#087A3E]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00000090] to-transparent" />
                  </div>

                  <div className="px-4 pb-4 flex gap-3 relative -mt-6">
                    <div className="h-[52px] w-[52px] rounded-full border-[2.5px] border-[#FFFFFF] bg-white relative shrink-0 z-10 overflow-hidden">
                      <Image src={profileImage} alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="pt-6 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[14px] font-bold text-[#111827] truncate">{displayName}</span>
                        {isVerified && <BadgeCheck className="h-4 w-4 text-[#087A3E]" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] mb-1">
                        <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-bold text-[#111827]">{avgRating != null ? avgRating : "New"}</span>
                        <span>({totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{cuisines.length > 0 ? cuisines.slice(0, 2).join(", ") : "Home Kitchen"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {status.isOpen
                            ? `Open now • Closes ${status.closeTime ?? ""}`
                            : status.opensNextAt
                              ? `Closed • Opens ${status.opensNextAt.time}`
                              : "See timings"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={publicUrl} className="text-[13px] font-bold text-[#087A3E] hover:underline self-end mt-4 flex items-center gap-1">
                  View Full Public Profile <ArrowRight className="h-[14px] w-[14px]" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-0 z-30 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 py-3 bg-[#FEFEFE]/95 backdrop-blur border-b border-[#E5E7EB]">
              <ScrollArea className="w-full">
                <TabsList className="flex items-center gap-2 w-max bg-transparent h-auto p-0 border-none justify-start">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.label}
                      value={tab.label}
                      className="data-[state=active]:bg-[#087A3E] data-[state=active]:text-[#FFFFFF] data-[state=active]:shadow-[0_2px_6px_rgba(8,122,62,0.2)] bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151] hover:border-[#9FC8AD] hover:text-[#087A3E] flex items-center gap-2 h-[38px] px-4 rounded-[8px] text-[13px] font-semibold transition-all whitespace-nowrap"
                    >
                      <tab.icon className="h-4 w-4" strokeWidth={1.8} />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>

            <div className="mt-6 w-full max-w-3xl mx-auto lg:max-w-none lg:w-2/3">

            {/* ===== Profile Info ===== */}
            <TabsContent value="Profile" className="mt-0">
              <Card id="profile-info" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <UserRound className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Profile Information</h3>
                      <p className="text-[12px] text-[#6B7280]">Basic details about your kitchen</p>
                    </div>
                  </div>
                  <Badge className={`border-none px-3 py-1 text-[11px] font-semibold rounded-[999px] ${isVerified ? "bg-[#EEF8F1] text-[#176B3B]" : "bg-[#FFF7ED] text-[#F97316]"}`}>
                    {isVerified ? "Verified Kitchen" : "Pending Verification"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Kitchen Name */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-[10px] border border-[#EEF0F2]">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="h-4 w-4 text-[#4B5563]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Kitchen Name</p>
                        <p className="text-[14px] font-bold text-[#111827]">{displayName}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEdit("name")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                      <Pencil className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-[10px] border border-[#EEF0F2]">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-[#4B5563]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Email Address</p>
                        <p className="text-[14px] font-bold text-[#111827]">{kitchen.email || "—"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#EEF8F1] hover:bg-[#EEF8F1] text-[#176B3B] border-none font-medium px-2.5 py-1 rounded-[999px] text-[10px]">
                      <Check className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-[10px] border border-[#EEF0F2]">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-[#4B5563]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Phone Number</p>
                        <p className="text-[14px] font-bold text-[#111827]">{kitchen.phoneNumber || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-[10px] border border-[#EEF0F2]">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-8 w-8 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-[#4B5563]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Kitchen Description</p>
                        <p className="text-[14px] text-[#374151] leading-relaxed">{description || "No description added yet."}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEdit("description")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50 shrink-0">
                      <Pencil className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            {/* ===== Operating Hours ===== */}
            <TabsContent value="Operating Hours" className="mt-0">
            <Card id="hours-card" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <Clock className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Operating Hours</h3>
                      <p className="text-[12px] text-[#6B7280]">When your kitchen serves</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit("hours")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                    <Pencil className="h-3 w-3 mr-1.5" /> Edit
                  </Button>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[999px] text-[12px] font-bold mb-5 ${status.isOpen ? "bg-[#EEF8F1] text-[#087A3E]" : "bg-[#FFF0ED] text-[#D83A20]"}`}>
                  <span className={`h-2 w-2 rounded-full ${status.isOpen ? "bg-[#087A3E]" : "bg-[#D83A20]"}`} />
                  {status.isOpen
                    ? `Open now ${status.closeTime ? `• Closes ${status.closeTime}` : ""}`
                    : status.opensNextAt
                      ? `Closed • Opens ${status.opensNextAt.time}`
                      : "Closed"}
                </div>

                <div className="space-y-2.5">
                  {hoursRows.map((row) => (
                    <div key={row.day} className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#374151]">{row.label}</span>
                      <span className="text-[#111827] font-semibold">
                        {row.open !== "—" ? `${row.open} – ${row.close}` : "Closed"}
                      </span>
                    </div>
                  ))}
                  {!allDaysOpen && (
                    <p className="text-[11px] text-[#6B7280] mt-3 flex items-center gap-1.5">
                      <CircleAlert className="h-3.5 w-3.5 text-[#F97316]" /> Some days are not configured
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            {/* ===== Address ===== */}
            <TabsContent value="Address" className="mt-0">
            <Card id="address-card" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <MapPin className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Kitchen Address</h3>
                      <p className="text-[12px] text-[#6B7280]">Pickup location</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit("address")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                    <Pencil className="h-3 w-3 mr-1.5" /> Edit
                  </Button>
                </div>

                {addressString ? (
                  <div className="flex gap-3 p-4 rounded-[10px] border border-[#EEF0F2]">
                    <MapPin className="h-5 w-5 text-[#087A3E] shrink-0 mt-0.5" strokeWidth={1.8} />
                    <div>
                      <p className="text-[13px] text-[#374151] leading-relaxed">{addressString}</p>
                      <p className="text-[12px] text-[#6B7280] mt-2">Pincode: <span className="font-semibold text-[#374151]">{address?.pincode}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-8 px-4 border border-dashed border-[#E5E7EB] rounded-[10px]">
                    <MapPin className="h-8 w-8 text-[#9CA3AF] mb-2" strokeWidth={1.5} />
                    <p className="text-[13px] font-medium text-[#6B7280]">No address added yet</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">Add your kitchen address so customers can find you</p>
                    <Button onClick={() => openEdit("address")} className="mt-4 h-[34px] px-4 rounded-[7px] bg-[#087A3E] hover:bg-[#065F30] text-[#FFFFFF] text-[12px] font-semibold">
                      Add Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            {/* ===== Kitchen Details ===== */}
            <TabsContent value="Kitchen Details" className="mt-0">
            <Card id="details-card" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <ChefHat className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Kitchen Details</h3>
                      <p className="text-[12px] text-[#6B7280]">Preparation time</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit("preptime")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                    <Pencil className="h-3 w-3 mr-1.5" /> Edit
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-[10px] border border-[#EEF0F2]">
                  <div className="h-11 w-11 rounded-[10px] bg-[#EEF8F1] flex items-center justify-center shrink-0">
                    <Timer className="h-5 w-5 text-[#087A3E]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Estimated Preparation Time</p>
                    <p className="text-[16px] font-bold text-[#111827]">{prepTime ? `${prepTime} mins` : "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-[10px] border border-[#EEF0F2] text-center">
                    <p className="text-[20px] font-bold text-[#087A3E]">{data.vegCount ?? 0}</p>
                    <p className="text-[11px] text-[#6B7280] font-medium">Veg Items</p>
                  </div>
                  <div className="p-3 rounded-[10px] border border-[#EEF0F2] text-center">
                    <p className="text-[20px] font-bold text-[#F97316]">{data.nonVegCount ?? 0}</p>
                    <p className="text-[11px] text-[#6B7280] font-medium">Non-Veg Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            {/* ===== Bank & Payments ===== */}
            <TabsContent value="Bank & Payments" className="mt-0">
            <Card id="bank-card" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <Landmark className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Bank & Payments</h3>
                      <p className="text-[12px] text-[#6B7280]">Settlement account</p>
                    </div>
                  </div>
                </div>

                {kitchen.bankName || kitchen.upiId ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-[10px] border border-[#EEF0F2] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Bank Name</p>
                        <p className="text-[14px] font-bold text-[#111827]">{kitchen.bankName || "—"}</p>
                      </div>
                      <Landmark className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    </div>
                    <div className="p-4 rounded-[10px] border border-[#EEF0F2] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">Account Number</p>
                        <p className="text-[14px] font-bold text-[#111827]">
                          {kitchen.bankAccountNumber ? "•••• " + String(kitchen.bankAccountNumber).slice(-4) : "—"}
                        </p>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div className="p-4 rounded-[10px] border border-[#EEF0F2] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-[#6B7280] mb-0.5">UPI ID</p>
                        <p className="text-[14px] font-bold text-[#111827]">{kitchen.upiId || "—"}</p>
                      </div>
                      <Landmark className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    </div>
                    <Button asChild variant="outline" className="w-full h-[36px] rounded-[7px] border-[#9FC8AD] text-[#087A3E] bg-[#FFFFFF] hover:bg-[#F5FAF6] font-semibold text-[13px]">
                      <Link href="/kitchen/dashboard/payments">
                        Manage in Payments <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-8 px-4 border border-dashed border-[#E5E7EB] rounded-[10px]">
                    <Landmark className="h-8 w-8 text-[#9CA3AF] mb-2" strokeWidth={1.5} />
                    <p className="text-[13px] font-medium text-[#6B7280]">No bank details added</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">Add your bank details to receive payouts</p>
                    <Button asChild className="mt-4 h-[34px] px-4 rounded-[7px] bg-[#087A3E] hover:bg-[#065F30] text-[#FFFFFF] text-[12px] font-semibold">
                      <Link href="/kitchen/dashboard/payments">Set Up Payments</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            {/* ===== Preferences ===== */}
            <TabsContent value="Preferences" className="mt-0">
            <Card id="preferences-card" className="rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-[#EEF8F1] flex items-center justify-center">
                      <UtensilsCrossed className="h-[18px] w-[18px] text-[#087A3E]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Preferences</h3>
                      <p className="text-[12px] text-[#6B7280]">Cuisines you offer</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit("cuisines")} className="h-[30px] px-3 rounded-[7px] border-[#D9DEE3] text-[#374151] text-[12px] font-medium bg-[#FFFFFF] hover:bg-gray-50">
                    <Pencil className="h-3 w-3 mr-1.5" /> Edit
                  </Button>
                </div>

                {cuisines.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map((c) => (
                      <Badge key={c} variant="outline" className="bg-[#FFF7ED] hover:bg-[#FFF7ED] text-[#F97316] border-[#FED7AA] font-medium px-3 py-1 rounded-[8px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-8 px-4 border border-dashed border-[#E5E7EB] rounded-[10px]">
                    <UtensilsCrossed className="h-8 w-8 text-[#9CA3AF] mb-2" strokeWidth={1.5} />
                    <p className="text-[13px] font-medium text-[#6B7280]">No cuisines selected</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">Add cuisines so customers know what you cook</p>
                    <Button onClick={() => openEdit("cuisines")} className="mt-4 h-[34px] px-4 rounded-[7px] bg-[#087A3E] hover:bg-[#065F30] text-[#FFFFFF] text-[12px] font-semibold">
                      Select Cuisines
                    </Button>
                  </div>
                )}

                {/* Quick tip */}
                <div className="mt-5 flex gap-3 p-4 rounded-[10px] bg-[#F5FAF6] border border-[#E4ECE6]">
                  <Lightbulb className="h-5 w-5 text-[#F59E0B] shrink-0" strokeWidth={1.8} />
                  <div>
                    <p className="text-[12px] font-semibold text-[#111827]">Tip</p>
                    <p className="text-[12px] text-[#4B5563] mt-0.5 leading-relaxed">
                      Kitchens with complete profiles get up to 3x more orders. Keep your details up to date!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            </div>
          </Tabs>

          {/* ===== Edit Dialogs ===== */}
          {editing === "name" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Kitchen Name" description="This name will be shown to customers on your public page." saving={saveNameMutation.isPending} onSave={submitEdit}>
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-[12px] font-semibold text-[#374151]">Kitchen Name</Label>
                <Input id="edit-name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder="e.g. Lakshmi's Homemade Kitchen" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
              </div>
            </EditDialog>
          )}

          {editing === "description" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Description" description="Tell customers about your food, ingredients and story." saving={saveDescriptionMutation.isPending} onSave={submitEdit}>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-[12px] font-semibold text-[#374151]">Description</Label>
                <Textarea id="edit-desc" value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} rows={4} placeholder="Describe your kitchen and dishes..." className="rounded-[7px] border-[#D9DEE3] text-[13px] resize-none" />
              </div>
            </EditDialog>
          )}

          {editing === "preptime" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Preparation Time" description="Approximate time in minutes to prepare an order." saving={savePrepTimeMutation.isPending} onSave={submitEdit}>
              <div className="space-y-2">
                <Label htmlFor="edit-preptime" className="text-[12px] font-semibold text-[#374151]">Preparation Time (minutes)</Label>
                <Input id="edit-preptime" type="number" min={1} value={prepTimeValue} onChange={(e) => setPrepTimeValue(e.target.value)} placeholder="e.g. 30" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
              </div>
            </EditDialog>
          )}

          {editing === "cuisines" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Cuisines" description="Select all cuisines your kitchen offers." saving={saveCuisinesMutation.isPending} onSave={submitEdit}>
              <div className="flex flex-wrap gap-2">
                {(availableCuisines ?? []).map((cuisine: { id: string; name: string }) => {
                  const selected = selectedCuisineIds.includes(cuisine.id)
                  return (
                    <button
                      key={cuisine.id}
                      type="button"
                      onClick={() =>
                        setSelectedCuisineIds((prev) =>
                          selected ? prev.filter((id) => id !== cuisine.id) : [...prev, cuisine.id]
                        )
                      }
                      className={`flex items-center gap-1.5 h-[34px] px-3.5 rounded-[999px] text-[12px] font-semibold border transition-all ${
                        selected
                          ? "bg-[#087A3E] border-[#087A3E] text-[#FFFFFF]"
                          : "bg-[#FFFFFF] border-[#D9DEE3] text-[#374151] hover:border-[#9FC8AD]"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      {cuisine.name}
                    </button>
                  )
                })}
                {(availableCuisines ?? []).length === 0 && (
                  <p className="text-[13px] text-[#6B7280] py-4 w-full text-center">Loading cuisines...</p>
                )}
              </div>
            </EditDialog>
          )}

          {editing === "address" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Kitchen Address" description="This is where customers or delivery partners pick up orders." saving={saveAddressMutation.isPending} onSave={submitEdit}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Door No <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
                    <Input value={addressForm.doorNo} onChange={(e) => setAddressForm({ ...addressForm, doorNo: e.target.value })} placeholder="12/3" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Pincode <span className="text-[#EF4444]">*</span></Label>
                    <Input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="600001" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-[#374151]">Address Line <span className="text-[#EF4444]">*</span></Label>
                  <Input value={addressForm.lineOne} onChange={(e) => setAddressForm({ ...addressForm, lineOne: e.target.value })} placeholder="Street name, building, area" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Area <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
                    <Input value={addressForm.area} onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })} placeholder="T. Nagar" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Landmark <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
                    <Input value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} placeholder="Near temple" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Latitude <span className="text-[#EF4444]">*</span></Label>
                    <Input value={addressForm.latitude} onChange={(e) => setAddressForm({ ...addressForm, latitude: e.target.value })} placeholder="13.0827" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-[#374151]">Longitude <span className="text-[#EF4444]">*</span></Label>
                    <Input value={addressForm.longitude} onChange={(e) => setAddressForm({ ...addressForm, longitude: e.target.value })} placeholder="80.2707" className="h-[38px] rounded-[7px] border-[#D9DEE3] text-[13px]" />
                  </div>
                </div>
              </div>
            </EditDialog>
          )}

          {editing === "hours" && (
            <EditDialog open onOpenChange={(o) => !o && setEditing(null)} title="Edit Operating Hours" description="Set your daily open and close times. Leave blank to mark the day closed." saving={saveHoursMutation.isPending} onSave={submitEdit}>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {DAY_KEYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-[90px] text-[13px] font-semibold text-[#374151]">{DAY_LABELS[day]}</span>
                    <Input
                      type="time"
                      value={hoursForm[day]?.open ?? ""}
                      onChange={(e) => setHoursForm((prev) => ({ ...prev, [day]: { open: e.target.value, close: prev[day]?.close ?? "" } }))}
                      className="h-[36px] rounded-[7px] border-[#D9DEE3] text-[13px] flex-1"
                    />
                    <span className="text-[12px] text-[#6B7280]">to</span>
                    <Input
                      type="time"
                      value={hoursForm[day]?.close ?? ""}
                      onChange={(e) => setHoursForm((prev) => ({ ...prev, [day]: { close: e.target.value, open: prev[day]?.open ?? "" } }))}
                      className="h-[36px] rounded-[7px] border-[#D9DEE3] text-[13px] flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2">Tip: Leave open and close empty for a day you don&apos;t serve.</p>
            </EditDialog>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-[12px] text-[#6B7280] flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" /> Changes are saved instantly to your public profile
            </p>
            <Button asChild variant="outline" className="rounded-[8px] border-[#9FC8AD] text-[#087A3E] bg-[#FFFFFF] hover:bg-[#F5FAF6] h-10 px-4 shadow-none">
              <Link href={publicUrl}>
                <Eye className="h-4 w-4" />
                <span className="font-semibold">Preview Public Page</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </CloudinaryUpload>
  )
}
