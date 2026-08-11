"use client"

import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDeliveryProfileData, updateDeliveryPartnerImage } from "@/actions/delivery/profile"
import { useDeliveryProfile, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import {
  UserRound,
  Pencil,
  Mail,
  Phone,
  IdCard,
  CalendarDays,
  Bike,
  Star,
  BadgeCheck,
  Camera,
  CircleCheck,
  Clock3,
  CircleX,
  Landmark,
  ShieldCheck,
  Info,
  Save,
  Shield,
  Activity,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProfilePageClient() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: getDeliveryProfileData,
    refetchInterval: 60_000,
  })

  const profileData = useDeliveryProfile()
  const { setProfile } = useDeliveryActions()

  useEffect(() => {
    if (data) setProfile(data)
  }, [data, setProfile])

  const resolvedData = profileData ?? data

  const savePhotoMutation = useMutation({
    mutationFn: (imageUrl: string | null) => updateDeliveryPartnerImage(imageUrl),
    onSuccess: (result, imageUrl) => {
      if (result.success) {
        toast.success(imageUrl ? "Profile photo updated" : "Profile photo removed")
        queryClient.invalidateQueries({ queryKey: ["delivery-profile"] })
        queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update photo")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  if (isLoading || !resolvedData) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen" role="status" aria-label="Loading profile">
        <div className="max-w-[1024px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8 pb-16">
          {/* Header */}
          <div className="space-y-3">
            <Skeleton className="h-[28px] w-80 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          {/* Your Profile Card */}
          <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
            <div className="p-5 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-[18px] w-28" />
                </div>
                <Skeleton className="h-[42px] w-32 rounded-[8px]" />
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Skeleton className="h-[140px] w-[140px] md:h-[160px] md:w-[160px] rounded-full" />
                  <Skeleton className="absolute bottom-2 right-2 h-9 w-9 rounded-full" />
                </div>

                {/* Info + Stats */}
                <div className="flex-1 flex flex-col md:flex-row gap-8 lg:gap-12 w-full justify-between items-center md:items-start">
                  <div className="flex flex-col space-y-4 max-w-sm w-full text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-2">
                      <Skeleton className="h-7 w-40" />
                      <Skeleton className="h-5 w-32 rounded-[6px]" />
                    </div>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-center md:justify-start gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3.5 w-44" />
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch min-h-[160px]" />
                  <div className="block md:hidden h-px bg-[#E5E7EB] w-full" />

                  <div className="flex flex-col gap-6 lg:min-w-[200px] w-full md:w-auto px-4 md:px-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-6 w-6" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats Card */}
          <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
            <div className="p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-[18px] w-28" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border border-[#E5E7EB] rounded-[12px] p-4 md:p-5 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Bank & UPI Details Card */}
          <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
            <div className="p-5 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-[18px] w-40" />
                </div>
                <Skeleton className="h-7 w-40 rounded-[6px]" />
              </div>

              <div className="flex items-center gap-3 mb-5">
                <Skeleton className="h-[15px] w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-[44px] w-full rounded-[8px]" />
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <Skeleton className="h-[15px] w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-[44px] w-full rounded-[8px]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-6">
                <Skeleton className="h-[44px] w-52 rounded-[8px]" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </Card>

          {/* Bottom Info Card */}
          <Skeleton className="h-[120px] w-full rounded-[16px]" />
        </div>
      </div>
    )
  }

  const { profile, stats, bankDetails } = resolvedData

  return (
    <CloudinaryUpload onUpload={(result) => savePhotoMutation.mutate(result.secure_url)}>
      {({ uploading, startUpload }) => (
    <div className="bg-[#FAFAFA] min-h-screen font-sans text-[#4B5563]">
      <div className="max-w-[1024px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8 pb-16">
        
        {/* Header */}
        <div>
          <h1 className="text-[24px] md:text-[28px] font-[700] text-[#111827] leading-none mb-2">Profile & Bank Details</h1>
          <p className="text-[#4B5563] font-[500] text-[14px] md:text-[15px]">Manage your personal information and payout details</p>
        </div>

        {/* Your Profile Card */}
        <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
          <div className="p-5 sm:p-6 md:p-8">
             <div className="flex items-center justify-between mb-6 md:mb-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                       <UserRound className="h-5 w-5 text-[#15803D]" strokeWidth={2} />
                    </div>
                    <h2 className="text-[18px] font-[700] text-[#111827]">Your Profile</h2>
                 </div>
                 <Button variant="outline" className="h-[42px] px-4 md:px-5 text-[13px] md:text-[14px] font-[600] text-[#15803D] border-[#22C55E] bg-[#FFFFFF] hover:bg-[#F0FDF4] rounded-[8px] shadow-sm">
                    <Pencil className="h-4 w-4 mr-2" strokeWidth={2.5} /> Edit Profile
                 </Button>
             </div>
             
             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
                 {/* Avatar */}
                 <div className="relative shrink-0">
                    <div className="h-[140px] w-[140px] md:h-[160px] md:w-[160px] rounded-full overflow-hidden bg-[#E5E7EB] relative border-4 border-[#F9FAFB] shadow-sm">
                       <Image 
                           src={profile.image || "/delivery/delivery-person-green.webp"} 
                           alt={profile.name ?? "Delivery Partner"}
                           fill
                           className="object-cover"
                           sizes="160px"
                       />
                    </div>
                    <button
                      onClick={startUpload}
                      disabled={uploading}
                      className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-[#FFFFFF] shadow-sm flex items-center justify-center hover:bg-[#F9FAFB] text-[#15803D] border border-[#E5E7EB] transition-colors disabled:opacity-70"
                      aria-label="Upload profile photo"
                    >
                       {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" strokeWidth={2.5} />}
                    </button>
                 </div>

                 {/* Info Container */}
                 <div className="flex-1 flex flex-col md:flex-row gap-8 lg:gap-12 w-full justify-between items-center md:items-start">
                    
                    {/* Primary Info */}
                    <div className="flex flex-col space-y-5 max-w-sm w-full text-center md:text-left">
                       <div>
                          <h3 className="text-[24px] md:text-[28px] font-[700] text-[#111827]">{profile.name}</h3>
                          <div className="bg-[#DCFCE7] text-[#166534] px-2.5 py-1 rounded-[6px] text-[12px] font-[600] inline-flex items-center gap-1.5 mt-2 shadow-sm">
                             <BadgeCheck className="h-4 w-4 text-[#166534]" strokeWidth={2.5} /> Verified Partner
                          </div>
                       </div>
                       <div className="flex flex-col gap-3.5 pt-2">
                           <div className="flex items-center justify-center md:justify-start gap-3 text-[14px] md:text-[15px] text-[#4B5563] font-[500]">
                              <Mail className="h-4 w-4 text-[#374151] shrink-0" strokeWidth={2} /> {profile.email}
                           </div>
                           <div className="flex items-center justify-center md:justify-start gap-3 text-[14px] md:text-[15px] text-[#4B5563] font-[500]">
                              <Phone className="h-4 w-4 text-[#374151] shrink-0" strokeWidth={2} /> {profile.phone}
                           </div>
                           <div className="flex items-center justify-center md:justify-start gap-3 text-[14px] md:text-[15px] text-[#4B5563] font-[500]">
                              <IdCard className="h-4 w-4 text-[#374151] shrink-0" strokeWidth={2} /> Partner ID: {profile.partnerId}
                           </div>
                       </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch min-h-[160px]" />
                    <div className="block md:hidden h-px bg-[#E5E7EB] w-full" />

                    {/* Stats */}
                    <div className="flex flex-col gap-6 lg:min-w-[200px] w-full md:w-auto px-4 md:px-0">
                        <div className="flex gap-4 items-center">
                            <CalendarDays className="h-6 w-6 text-[#374151] shrink-0" strokeWidth={1.5} />
                            <div className="flex flex-col">
                               <span className="text-[12px] font-[500] text-[#6B7280]">Member Since</span>
                               <span className="text-[14px] md:text-[15px] font-[700] text-[#111827]">{profile.memberSince}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <Bike className="h-6 w-6 text-[#374151] shrink-0" strokeWidth={1.5} />
                            <div className="flex flex-col">
                               <span className="text-[12px] font-[500] text-[#6B7280]">Total Deliveries</span>
                               <span className="text-[14px] md:text-[15px] font-[700] text-[#111827]">{profile.totalDeliveries}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <Star className="h-6 w-6 text-[#F59E0B] fill-[#F59E0B] shrink-0" strokeWidth={1.5} />
                            <div className="flex flex-col">
                               <span className="text-[12px] font-[500] text-[#6B7280]">Rating</span>
                               <span className="text-[14px] md:text-[15px] font-[700] text-[#111827]">{profile.rating} / 5</span>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
           <div className="p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-5 w-5 text-[#15803D]" strokeWidth={2} />
                  <h2 className="text-[18px] font-[700] text-[#111827]">Quick Stats</h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                 {[
                   { icon: Bike, val: stats.total, label: "Total Deliveries", color: "text-[#16A34A]", bg: "bg-[#DCFCE7]" },
                   { icon: CircleCheck, val: stats.completed, label: "Completed", color: "text-[#2563EB]", bg: "bg-[#DBEAFE]" },
                   { icon: Clock3, val: stats.inProgress, label: "In Progress", color: "text-[#F97316]", bg: "bg-[#FFEDD5]" },
                   { icon: CircleX, val: stats.cancelled, label: "Cancelled", color: "text-[#EF4444]", bg: "bg-[#FEE2E2]" },
                 ].map((stat, i) => (
                    <div key={i} className="border border-[#E5E7EB] rounded-[12px] p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 bg-[#FFFFFF] hover:shadow-sm transition-shadow">
                        <div className={cn("h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center shrink-0", stat.bg)}>
                            <stat.icon className={cn("h-5 w-5 md:h-6 md:w-6", stat.color)} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[20px] md:text-[24px] font-[700] text-[#111827] leading-tight">{stat.val}</span>
                            <span className="text-[11px] md:text-[12px] font-[500] text-[#6B7280]">{stat.label}</span>
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        </Card>

        {/* Bank & UPI Details */}
        <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-[#E5E7EB] rounded-[16px] overflow-hidden bg-[#FFFFFF]">
           <div className="p-5 sm:p-6 md:p-8">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                          <Landmark className="h-5 w-5 text-[#15803D]" strokeWidth={2} />
                      </div>
                      <h2 className="text-[18px] font-[700] text-[#111827]">Bank & UPI Details</h2>
                  </div>
                  <div className="bg-[#DCFCE7] text-[#166534] px-3 py-1.5 rounded-[6px] text-[12px] font-[600] inline-flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="h-4 w-4" strokeWidth={2.5} /> <span className="hidden sm:inline">Secured & Encrypted</span>
                  </div>
              </div>

              {/* Bank Account Details */}
              <div className="space-y-5 md:space-y-6">
                  <div>
                     <h3 className="inline-block text-[14px] md:text-[15px] font-[700] text-[#15803D] pb-2 border-b-2 border-[#15803D] mb-0">Bank Account Details</h3>
                     <div className="h-px bg-[#E5E7EB] w-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">Bank Name</Label>
                          <Input readOnly defaultValue={bankDetails.bankName || "State Bank of India"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">Account Holder Name</Label>
                          <Input readOnly defaultValue={bankDetails.accountHolderName || profile.name || ""} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">Bank Account Number</Label>
                          <Input readOnly defaultValue={bankDetails.bankAccountNumber || "1234 5678 9012"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">IFSC Code</Label>
                          <Input readOnly defaultValue={bankDetails.ifscCode || "SBIN0001234"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                  </div>

                  <div className="bg-[#EFF6FF] rounded-[8px] p-4 flex gap-3 items-center mt-2 border border-[#DBEAFE]">
                      <Info className="h-5 w-5 text-[#2563EB] shrink-0" strokeWidth={2} />
                      <p className="text-[13px] font-[500] text-[#2563EB] leading-tight">
                          Ensure your bank account details are correct. Payments will be made to this account.
                      </p>
                  </div>
              </div>

              {/* UPI Details */}
              <div className="space-y-5 md:space-y-6 mt-10">
                  <div>
                     <h3 className="inline-block text-[14px] md:text-[15px] font-[700] text-[#15803D] pb-2 border-b-2 border-[#15803D] mb-0">UPI & Payment Apps</h3>
                     <div className="h-px bg-[#E5E7EB] w-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">UPI ID</Label>
                          <Input readOnly defaultValue={bankDetails.upiId || "dharshan.m@upi"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">Google Pay Number</Label>
                          <Input readOnly defaultValue={bankDetails.googlePayNumber || "9876543210"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                      <div className="flex flex-col space-y-2">
                          <Label className="text-[12px] font-[700] text-[#374151]">PhonePe Number</Label>
                          <Input readOnly defaultValue={bankDetails.phonePeNumber || "9876543210"} className="h-[44px] rounded-[8px] border-[#D1D5DB] text-[#111827] bg-[#FFFFFF] focus-visible:border-[#22C55E] focus-visible:ring-1 focus-visible:ring-[#22C55E] shadow-sm font-[500]" />
                      </div>
                  </div>
              </div>

              {/* Action Footer */}
              <div className="mt-10 pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-6">
                  <Button className="h-[44px] px-8 rounded-[8px] bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-[600] w-full md:w-auto shadow-[0_4px_12px_rgba(22,101,52,0.20)] border-none">
                      <Save className="h-4 w-4 mr-2" strokeWidth={2.5} /> Save Bank Details
                  </Button>
                  
                  <div className="flex gap-3 items-center text-[#4B5563] text-[13px] font-[500] max-w-sm text-center md:text-left">
                      <Shield className="h-5 w-5 text-[#15803D] shrink-0" strokeWidth={2} />
                      Your payment information is safe with us and will never be shared.
                  </div>
              </div>

           </div>
        </Card>

        {/* Bottom Info Card */}
        <div className="bg-gradient-to-b from-[#F0FDF4] to-[#FFFFFF] rounded-[16px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border border-[#BBF7D0] shadow-sm">
            <div className="flex gap-4 relative z-10 max-w-md w-full">
                <div className="h-12 w-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 text-[#15803D] shadow-sm border border-[#BBF7D0]">
                    <ShieldCheck className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-[700] text-[#166534] text-[16px] mb-1.5">Why we need this information?</h3>
                    <p className="text-[13px] font-[500] text-[#166534] leading-relaxed">
                        We use your bank details to transfer your earnings securely. All information is encrypted and protected.
                    </p>
                </div>
            </div>
            
            <div className="hidden md:block absolute bottom-0 right-4 w-56 lg:w-64 pointer-events-none opacity-100">
                <Image src="/delivery/bank-coins.webp" alt="Bank Info" width={256} height={150} className="w-full h-auto object-contain object-bottom" />
            </div>
        </div>

      </div>
    </div>
      )}
    </CloudinaryUpload>
  )
}
