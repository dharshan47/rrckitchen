"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Star,
  Camera,
  Eye,
  Pencil,
  UtensilsCrossed,
  MapPin,
  RefreshCw,
  Building2,
  Image as ImageIcon,
  User,
  Store,
  Info,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateKitchenPhoto } from "@/actions/admin/dashboard"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TABS = [
  { label: "Profile", icon: User, target: "profile-card" },
  { label: "Address", icon: MapPin, target: "address-card" },
  { label: "Bank & Payments", icon: Building2, target: "bank-card" },
  { label: "Kitchen Details", icon: Store, target: "details-card" },
  { label: "Operating Hours", icon: Clock, target: "hours-card" },
] as const

const QUICK_ACTIONS = [
  { icon: Eye, label: "Preview Public Page", kind: "preview" },
  { icon: Camera, label: "Update Photo", kind: "upload" },
  { icon: MapPin, label: "Edit Address", kind: "scroll", target: "address-card" },
  { icon: Building2, label: "Bank Details", kind: "link", href: "/kitchen/dashboard/payments" },
  { icon: Clock, label: "Update Hours", kind: "scroll", target: "hours-card" },
  { icon: UtensilsCrossed, label: "Edit Cuisines", kind: "scroll", target: "cuisines-card" },
] as const

export default function ProfilePageClient() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>("Profile")

  const data = useKitchenDashboardData()

  const savePhotoMutation = useMutation({
    mutationFn: (imageUrl: string | null) => updateKitchenPhoto(imageUrl),
    onSuccess: (result, imageUrl) => {
      if (result.success) {
        toast.success(imageUrl ? "Kitchen photo updated" : "Kitchen photo removed")
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update photo")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  if (!data) {
    return (
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-9 w-64 rounded" />
            <Skeleton className="h-5 w-96 max-w-full mt-2 rounded" />
            <div className="flex items-center gap-4 mt-6 flex-wrap">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2 w-[200px] rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 lg:gap-8 flex-1">
            <div className="shrink-0">
              <div className="w-[140px] h-[140px] rounded-full p-1.5 border border-gray-100">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>
            <div className="flex-1 pt-2 space-y-3">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-80 max-w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="flex gap-8 pt-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Public preview card */}
          <div className="w-full lg:w-[380px] shrink-0 rounded-2xl bg-[#F8FAFC] border border-gray-100 p-4">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <Skeleton className="h-20 w-full rounded-none" />
              <div className="px-3 pb-3 flex gap-3 -mt-6 relative z-10">
                <Skeleton className="h-14 w-14 rounded-full border-2 border-white shrink-0" />
                <div className="pt-7 space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <Skeleton className="h-4 w-44 mt-3 ml-auto" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto pt-2 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-28 shrink-0" />
          ))}
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3 mt-auto" />
            </div>
          ))}
        </div>

        {/* Tip bar */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    )
  }

  const kitchen = data.kitchen
  const publicUrl = `/kitchens/${kitchen.slug}`

  const fieldsToCheck = [
    kitchen.displayName,
    kitchen.imageUrl,
    kitchen.description,
    kitchen.bankAccountNumber,
    kitchen.upiId,
    kitchen.address,
    kitchen.cuisines?.length ? kitchen.cuisines : null,
    kitchen.operatingHours,
  ]
  const filledFields = fieldsToCheck.filter(Boolean).length
  const completionPercentage = Math.round((filledFields / fieldsToCheck.length) * 100)

  const profileImage = kitchen.imageUrl || "/kitchen/profile.webp"

  const scrollToSection = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <CloudinaryUpload onUpload={(result) => savePhotoMutation.mutate(result.secure_url)}>
      {({ uploading, startUpload }) => (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
                Kitchen Profile
              </h1>
              <p className="text-[14px] text-gray-500 mt-1 font-medium">
                Manage your kitchen details, availability and account settings
              </p>

              <div className="flex items-center gap-4 mt-6 flex-wrap">
                <span className="text-[13px] font-semibold text-gray-700">Profile Completion</span>
                <Progress value={completionPercentage} className="w-[200px] h-2" />
                <span className="text-[13px] font-bold text-[#10B981]">{completionPercentage}% Complete</span>
                <span className="text-[12px] text-gray-400 flex items-center gap-1.5">
                  Real-time Sync
                  <RefreshCw className="h-3 w-3 text-[#10B981] animate-spin" />
                </span>
              </div>
            </div>

            <Button asChild variant="outline" className="hidden md:flex items-center gap-2 rounded-xl border-[#10B981] text-[#10B981] hover:bg-green-50">
              <Link href={publicUrl}>
                <Eye className="h-4 w-4" />
                Preview Public Page
              </Link>
            </Button>
          </div>

          <Card id="profile-card" className="p-6 lg:p-8 flex flex-col lg:flex-row justify-between gap-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row items-start gap-6 lg:gap-8 flex-1">
              <div className="relative shrink-0">
                <div className="w-[140px] h-[140px] rounded-full p-1.5 border border-gray-100 shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
                    {kitchen.imageUrl ? (
                      <Image src={profileImage} alt={kitchen.displayName || "Kitchen"} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="outline" onClick={startUpload} disabled={uploading} className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-white border-gray-100 shadow-md">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                    {kitchen.displayName || "Your Kitchen Name"}
                  </h2>
                  {(kitchen.status === "APPROVED" || kitchen.status === "ACTIVE") && (
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  )}
                </div>
                <p className="text-[15px] font-medium text-gray-600 mb-4">
                  {kitchen.description || "Add a description for your kitchen"}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {kitchen.cuisines?.slice(0, 2).map((c, i) => (
                    <Badge key={i} variant="secondary" className="bg-[#FFF7ED] text-[#EA580C] border border-orange-100">{c}</Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Preparation Time</p>
                      <p className="text-[14px] font-bold text-gray-900">{kitchen.estimatedPrepTime ? `${kitchen.estimatedPrepTime} mins` : "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Rating</p>
                      <p className="text-[14px] font-bold text-gray-900">
                        {kitchen.avgRating ?? "New"} <span className="text-gray-500 font-medium text-[13px]">({kitchen.totalReviews || 0} reviews)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="w-full lg:w-[380px] shrink-0 bg-[#F8FAFC] border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-gray-700">
                <Eye className="h-4 w-4 text-[#10B981]" />
                Public Preview
              </div>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-20 w-full relative bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 flex items-center justify-center">
                  <Store className="h-8 w-8 text-[#10B981]/40" />
                </div>
                <div className="px-3 pb-3 relative z-10 flex gap-3 -mt-6">
                  <div className="h-14 w-14 rounded-full border-2 border-white overflow-hidden relative shrink-0 bg-white">
                    {kitchen.imageUrl ? (
                      <Image src={profileImage} alt="Logo" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="pt-7 pb-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[13px] font-bold text-gray-900 truncate max-w-[120px]">{kitchen.displayName || "Kitchen"}</span>
                      {(kitchen.status === "APPROVED" || kitchen.status === "ACTIVE") && <CheckCircle2 className="h-3 w-3 text-[#10B981]" />}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1">
                      <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-bold text-gray-900">{kitchen.avgRating ?? "New"}</span>
                      <span>({kitchen.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button asChild variant="link" className="text-[13px] font-bold text-[#10B981] p-0 h-auto mt-3 w-full justify-end">
                <Link href={publicUrl}>
                  View Full Public Profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          </Card>

          <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto pb-0 pt-2">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setActiveTab(tab.label)
                  scrollToSection(tab.target)
                }}
                className={`flex items-center gap-2 pb-3.5 border-b-2 whitespace-nowrap text-[14px] font-semibold transition-colors ${
                  activeTab === tab.label ? "border-[#10B981] text-[#10B981]" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#10B981]" /> Profile Information
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("profile-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] font-medium text-gray-400 mb-0.5">Kitchen Name</p>
                  <p className="text-[14px] font-bold text-gray-900">{kitchen.displayName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-400 mb-0.5">Email</p>
                  <p className="text-[14px] font-bold text-gray-900">{kitchen.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-400 mb-1.5">Status</p>
                  <Badge variant={kitchen.status === "APPROVED" || kitchen.status === "ACTIVE" ? "default" : "outline"}
                    className={kitchen.status === "APPROVED" || kitchen.status === "ACTIVE" ? "bg-[#ECFDF5] text-[#059669] border-none" : "bg-orange-50 text-orange-600 border-orange-100"}>
                    {kitchen.status === "APPROVED" || kitchen.status === "ACTIVE" ? "Verified Kitchen" : "Pending Verification"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <Store className="h-4 w-4 text-[#10B981]" /> About Kitchen
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("profile-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
                {kitchen.description || "No description provided."}
              </p>
            </Card>

            <Card id="cuisines-card" className="p-6 flex flex-col scroll-mt-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-[#10B981]" /> Cuisines
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("cuisines-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {kitchen.cuisines?.length ? (
                  kitchen.cuisines.map(cuisine => (
                    <Badge key={cuisine} variant="outline" className="border-green-200 text-[#059669]">{cuisine}</Badge>
                  ))
                ) : (
                  <p className="text-[13px] text-gray-400 italic">No cuisines added yet.</p>
                )}
              </div>
              <p className="text-[12px] font-medium text-gray-500 mt-auto">Total {kitchen.cuisines?.length || 0} cuisines</p>
            </Card>

            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#10B981]" /> Kitchen Photo
                </h3>
                <Button variant="outline" size="sm" onClick={startUpload} disabled={uploading} className="text-[12px] font-bold rounded-lg">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />} {uploading ? "Uploading..." : "Edit"}
                </Button>
              </div>
              <div className="flex items-center gap-5 mt-auto">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-100 shrink-0 relative bg-gray-50">
                  {kitchen.imageUrl ? (
                    <Image src={profileImage} alt="Kitchen Photo" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={startUpload} disabled={uploading} className="text-[12px] font-bold text-[#10B981] border-green-200 hover:bg-green-50 rounded-lg">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />} {uploading ? "Uploading..." : "Change Photo"}
                  </Button>
                  {kitchen.imageUrl && (
                    <Button variant="outline" size="sm" onClick={() => savePhotoMutation.mutate(null)} disabled={savePhotoMutation.isPending || uploading} className="text-[12px] font-bold text-red-500 border-red-200 hover:bg-red-50 rounded-lg">
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card id="address-card" className="p-6 flex flex-col lg:col-span-1 md:col-span-2 scroll-mt-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#10B981]" /> Kitchen Address
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("address-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-[120px] h-[100px] rounded-xl overflow-hidden shrink-0 relative bg-[#10B981]/5 border border-gray-200 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-[#10B981]/40" />
                </div>
                <div>
                  {kitchen.address ? (
                    <>
                      <p className="text-[13px] text-gray-700 font-medium leading-[1.6]">
                        {kitchen.address.doorNo ? `${kitchen.address.doorNo}, ` : ""}
                        {kitchen.address.lineOne}<br/>
                        {kitchen.address.area ? `${kitchen.address.area}, ` : ""}
                        {kitchen.address.landmark ? `${kitchen.address.landmark}` : ""}<br/>
                      </p>
                      <Badge variant="outline" className="mt-2 bg-orange-50 border-orange-100 text-[#EE7005] font-bold">
                        Pincode: {kitchen.address.pincode}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-[13px] text-gray-400 italic">No address provided.</p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card id="hours-card" className="p-6 flex flex-col scroll-mt-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#10B981]" /> Operating Hours
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("hours-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-auto text-[13px]">
                {DAYS.map((day) => {
                  const dayLower = day.toLowerCase()
                  const hours = kitchen.operatingHours?.[dayLower]
                  return (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-500 font-medium">{day}</span>
                      <span className="font-bold text-gray-900">{hours ? `${hours.open} - ${hours.close}` : "Closed"}</span>
                    </div>
                  )
                })}
              </div>
              {kitchen.operatingHours && Object.keys(kitchen.operatingHours).length === 7 && (
                <div className="flex items-center gap-1.5 mt-4">
                  <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-[12px] font-bold text-gray-700">Open all days</span>
                </div>
              )}
            </Card>

            <Card id="bank-card" className="p-6 flex flex-col scroll-mt-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#10B981]" /> Bank & Payments
                </h3>
                <Button asChild variant="outline" size="sm" className="text-[12px] font-bold rounded-lg">
                  <Link href="/kitchen/dashboard/payments">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: "Bank Name", value: kitchen.bankName },
                  { label: "Account Holder", value: kitchen.accountHolderName },
                  { label: "Account Number", value: kitchen.bankAccountNumber ? `****${kitchen.bankAccountNumber.slice(-4)}` : null },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-[13px] font-bold text-gray-900 truncate">{item.value || "Not set"}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-auto">
                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">UPI ID</p>
                  <p className="text-[12px] font-bold text-gray-900 truncate">{kitchen.upiId || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">GPay Number</p>
                  <p className="text-[12px] font-bold text-gray-900 truncate">{kitchen.gpayNumber || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">Phone Number</p>
                  <p className="text-[12px] font-bold text-gray-900 truncate">{kitchen.phoneNumber || "Not set"}</p>
                </div>
              </div>
            </Card>

            <Card id="details-card" className="p-6 flex flex-col scroll-mt-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <Store className="h-4 w-4 text-[#10B981]" /> Kitchen Details
                </h3>
                <Button variant="outline" size="sm" onClick={() => scrollToSection("details-card")} className="text-[12px] font-bold rounded-lg">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">Preparation Time</p>
                  <p className="text-[13px] font-bold text-gray-900">{kitchen.estimatedPrepTime ? `${kitchen.estimatedPrepTime} mins` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-bold text-gray-900 capitalize">{kitchen.status?.toLowerCase() || "Pending"}</p>
                    {(kitchen.status === "APPROVED" || kitchen.status === "ACTIVE") && (
                      <Badge className="bg-green-50 text-[#10B981] text-[9px]">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 flex flex-col">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {QUICK_ACTIONS.map((action) =>
                  action.kind === "preview" || action.kind === "link" ? (
                    <Button asChild key={action.label} variant="outline" className="flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 py-2.5 rounded-xl h-auto">
                      <Link href={action.kind === "preview" ? publicUrl : action.href}>
                        <action.icon className="h-4 w-4 text-[#10B981]" />
                        {action.label}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      key={action.label}
                      variant="outline"
                      onClick={action.kind === "upload" ? startUpload : () => scrollToSection(action.target)}
                      disabled={action.kind === "upload" && uploading}
                      className="flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 py-2.5 rounded-xl h-auto"
                    >
                      {action.kind === "upload" && uploading ? <Loader2 className="h-4 w-4 text-[#10B981] animate-spin" /> : <action.icon className="h-4 w-4 text-[#10B981]" />}
                      {action.label}
                    </Button>
                  )
                )}
              </div>
            </Card>

          </div>

          <Card className="bg-[#F8FAFC] border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#10B981] shadow-sm">
                <Info className="h-4 w-4" />
              </div>
              <p className="text-[13px] font-medium text-gray-600">
                <span className="font-bold text-gray-900">Tip:</span> Keep your profile updated to attract more customers and build trust.
              </p>
            </div>
            <Button asChild variant="link" className="text-[13px] font-bold text-[#10B981] p-0 h-auto whitespace-nowrap">
              <Link href="/kitchen/dashboard/support">
                Need Help? Contact Support <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

        </div>
      )}
    </CloudinaryUpload>
  )
}
