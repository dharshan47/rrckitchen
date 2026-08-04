"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDeliveryProfileData } from "@/actions/delivery/profile"
import { useDeliveryProfile, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import {
  User,
  CheckCircle2,
  Mail,
  Phone,
  CreditCard,
  CalendarDays,
  Truck,
  Star,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Landmark,
  ShieldCheck,
  Info,
  Lock,
  Camera,
  Edit
} from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePageClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: getDeliveryProfileData,
    refetchInterval: 60_000, // No need to refetch profile too often
  })

  const profileData = useDeliveryProfile()
  const { setProfile } = useDeliveryActions()

  useEffect(() => {
    if (data) setProfile(data)
  }, [data, setProfile])

  const resolvedData = profileData ?? data

  if (isLoading || !resolvedData) {
    return (
      <div className="max-w-[800px] mx-auto space-y-6 pb-12" role="status" aria-label="Loading profile">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        {/* Profile Card */}
        <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 md:px-8 border-b border-slate-100/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl" />
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col md:flex-row gap-8 w-full pt-2">
                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-48 mx-auto md:mx-0" />
                    <Skeleton className="h-6 w-36 mx-auto md:mx-0 rounded-md" />
                  </div>
                  <div className="space-y-3 pt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full max-w-[220px] mx-auto md:mx-0" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-6 pt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="rounded-3xl shadow-none border-slate-100 overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-6 px-6 md:px-8">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank & UPI Card */}
        <Card className="rounded-3xl shadow-none border-slate-100 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 md:px-8 border-b border-slate-100/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-44" />
            </div>
            <Skeleton className="h-8 w-36 rounded-md" />
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-44" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <Skeleton className="h-12 w-full sm:w-52 rounded-xl" />
              <Skeleton className="h-4 w-full max-w-[280px]" />
            </div>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 md:p-8">
          <div className="flex gap-4 max-w-[400px]">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { profile, stats, bankDetails } = resolvedData

  return (
    <div className="max-w-[800px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Profile & Bank Details</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Manage your personal information and payout details</p>
      </div>

      {/* Your Profile Card */}
      <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 md:px-8 border-b border-slate-100/50">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Your Profile</h2>
            </div>
            <Button variant="outline" size="sm" className="h-9 text-xs font-bold text-emerald-700 border-emerald-200 rounded-xl px-4 hover:bg-emerald-50 shadow-sm flex items-center gap-2">
               <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Button>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                {/* Avatar */}
                <div className="relative">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 relative shadow-sm">
                        <Image 
                            src={profile.image || "/delivery/profile.webp"} 
                            alt={profile.name ?? "Delivery Partner"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors text-emerald-600">
                        <Camera className="h-4 w-4" />
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col md:flex-row gap-8 w-full">
                    
                    {/* Primary Info */}
                    <div className="space-y-4 flex-1 text-center md:text-left">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-900">{profile.name}</h3>
                            <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 mt-2">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Partner
                            </div>
                        </div>
                        
                        <div className="space-y-2.5 pt-2">
                            <div className="flex items-center gap-3 justify-center md:justify-start text-sm text-slate-600 font-medium">
                                <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start text-sm text-slate-600 font-medium">
                                <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start text-sm text-slate-600 font-medium">
                                <CreditCard className="h-4 w-4 text-slate-400" /> Partner ID: <span className="font-bold text-slate-900">{profile.partnerId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Stats */}
                    <div className="flex flex-col gap-6 pt-2">
                        <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <CalendarDays className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 mb-0.5">Member Since</div>
                                <div className="text-sm font-extrabold text-slate-900">{profile.memberSince}</div>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Truck className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 mb-0.5">Total Deliveries</div>
                                <div className="text-sm font-extrabold text-slate-900">{profile.totalDeliveries}</div>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 mb-0.5">Rating</div>
                                <div className="text-sm font-extrabold text-slate-900">{profile.rating} / 5</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden">
         <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-6 px-6 md:px-8">
             <Activity className="h-5 w-5 text-emerald-600" />
             <h2 className="text-base font-bold text-slate-900">Quick Stats</h2>
         </CardHeader>
         <CardContent className="p-6 md:p-8 pt-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 
                 <div className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors">
                     <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                         <Truck className="h-5 w-5 text-emerald-600" />
                     </div>
                     <div>
                         <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Deliveries</div>
                     </div>
                 </div>

                 <div className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors">
                     <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                         <CheckCircle className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                         <div className="text-2xl font-extrabold text-slate-900">{stats.completed}</div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</div>
                     </div>
                 </div>

                 <div className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors">
                     <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                         <Clock className="h-5 w-5 text-orange-500" />
                     </div>
                     <div>
                         <div className="text-2xl font-extrabold text-slate-900">{stats.inProgress}</div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Progress</div>
                     </div>
                 </div>

                 <div className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors">
                     <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                         <XCircle className="h-5 w-5 text-red-500" />
                     </div>
                     <div>
                         <div className="text-2xl font-extrabold text-slate-900">{stats.cancelled}</div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancelled</div>
                     </div>
                 </div>

             </div>
         </CardContent>
      </Card>

      {/* Bank & UPI Details */}
      <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden">
         <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 md:px-8 border-b border-slate-100/50">
             <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                     <Landmark className="h-4 w-4 text-emerald-600" />
                 </div>
                 <h2 className="text-base font-bold text-slate-900">Bank & UPI Details</h2>
             </div>
             <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5">
                 <ShieldCheck className="h-4 w-4" /> Secured & Encrypted
             </div>
         </CardHeader>
         <CardContent className="p-6 md:p-8">
             
             {/* Bank Details Form */}
             <div className="space-y-6">
                 <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                     <h3 className="font-bold text-slate-900 text-sm text-emerald-700">Bank Account Details</h3>
                     <div className="h-px bg-emerald-100 flex-1 ml-2" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">Bank Name</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.bankName || "State Bank of India"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">Account Holder Name</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.accountHolderName || profile.name || ""} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">Bank Account Number</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.bankAccountNumber || "1234 5678 9012"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">IFSC Code</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.ifscCode || "SBIN0001234"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                 </div>

                 <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-center">
                     <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                     <p className="text-sm font-medium text-blue-800">
                         Ensure your bank account details are correct. Payments will be made to this account.
                     </p>
                 </div>
             </div>

             {/* UPI Details Form */}
             <div className="space-y-6 mt-10">
                 <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                     <h3 className="font-bold text-slate-900 text-sm text-emerald-700">UPI & Payment Apps</h3>
                     <div className="h-px bg-emerald-100 flex-1 ml-2" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">UPI ID</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.upiId || "dharshan.m@upi"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">Google Pay Number</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.googlePayNumber || "9876543210"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-bold text-slate-700">PhonePe Number</Label>
                         <Input 
                            readOnly 
                            defaultValue={bankDetails.phonePeNumber || "9876543210"} 
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium focus-visible:ring-emerald-500 text-slate-900"
                         />
                     </div>
                 </div>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <Button className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full sm:w-auto shadow-sm shadow-emerald-200">
                     <Lock className="h-4 w-4 mr-2" /> Save Bank Details
                 </Button>
                 
                 <div className="flex gap-2 items-center text-slate-500 text-xs font-medium max-w-[280px] text-center sm:text-left">
                     <ShieldCheck className="h-8 w-8 text-slate-400 flex-shrink-0" />
                     Your payment information is safe with us and will never be shared.
                 </div>
             </div>

         </CardContent>
      </Card>

      {/* Info Card Footer */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex gap-4 relative z-10 max-w-[400px]">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                  <h3 className="font-extrabold text-emerald-800 text-base mb-1">Why we need this information?</h3>
                  <p className="text-sm font-medium text-emerald-700/80 leading-relaxed">
                      We use your bank details to transfer your earnings securely. All information is encrypted and protected.
                  </p>
              </div>
          </div>
          
          <div className="hidden md:block absolute -bottom-4 -right-4 w-48 opacity-90 pointer-events-none">
              <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="40" width="100" height="90" rx="8" fill="#10b981" />
                <path d="M40 50L100 20L160 50" fill="#059669" />
                <rect x="70" y="70" width="15" height="40" rx="2" fill="#059669" />
                <rect x="115" y="70" width="15" height="40" rx="2" fill="#059669" />
                <circle cx="100" cy="45" r="10" fill="#34d399" />
                <circle cx="140" cy="110" r="25" fill="#f59e0b" />
                <path d="M132 110L138 116L148 104" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="60" cy="115" r="12" fill="#fbbf24" />
                <circle cx="50" cy="125" r="8" fill="#fbbf24" />
                <circle cx="75" cy="125" r="8" fill="#fbbf24" />
              </svg>
          </div>
      </div>

    </div>
  )
}
