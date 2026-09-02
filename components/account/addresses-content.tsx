"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Loader2, 
  Home, 
  ChevronRight, 
  Briefcase, 
  Heart, 
  Star, 
  ShieldCheck, 
  Zap, 
  Building, 
  Map, 
  Crosshair, 
  PenLine,
  Save
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth-client"
import {
  useUserAddressesQuery,
  useUserAddresses,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from "@/stores/userProfileStore"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

const addressSchema = z.object({
  label: z.string().optional(),
  lineOne: z.string().min(3, "Address is required"),
  lineTwo: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
})

type AddressForm = z.infer<typeof addressSchema>

function AddressesSkeleton() {
  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-6 md:pt-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* BANNER */}
      <div className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-6 border border-[#E4E8E4] bg-white shadow-[0_12px_40px_rgba(30,40,35,0.06)]">
        <div className="relative z-10 flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
          <Skeleton className="h-[36px] md:h-[48px] w-3/4 rounded-lg mb-2" />
          <Skeleton className="h-[20px] md:h-[24px] w-2/3 max-w-md rounded-md mb-8" />
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 w-full md:w-fit">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-32 md:w-48 rounded-full" />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[200px] h-[200px] md:w-[320px] md:h-[240px] flex-shrink-0 flex items-center justify-center md:justify-end">
          <Skeleton className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full" />
        </div>
      </div>

      {/* ADD BUTTON ROW */}
      <div className="flex justify-end mb-6">
        <Skeleton className="h-[44px] w-[180px] rounded-[10px]" />
      </div>

      {/* ADDRESS LIST TITLE */}
      <Skeleton className="h-[20px] w-48 rounded-lg mb-4" />
      
      {/* ADDRESS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="group relative bg-[#FEFEFE] rounded-[18px] p-5 md:p-6 border border-[#E4E8E4] flex items-start gap-4 shadow-[0_4px_12px_rgba(20,30,30,0.03)]"
          >
            <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0" />
            
            <div className="flex-1 flex flex-col gap-2 min-w-0 pr-16">
              <Skeleton className="h-[18px] w-24 rounded" />
              <div className="flex flex-col gap-1.5 mt-1">
                <Skeleton className="h-[14px] w-full max-w-[240px] rounded" />
                <Skeleton className="h-[14px] w-3/4 max-w-[180px] rounded" />
              </div>
              <Skeleton className="h-[20px] w-20 rounded mt-1" />
            </div>

            <div className="absolute top-5 right-5 flex gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AddressesContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const { isLoading: addressesLoading } = useUserAddressesQuery(isLoggedIn)
  const addresses = useUserAddresses()
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const addMutation = useAddAddressMutation(() => {
    reset()
    setShowAddForm(false)
  })
  const deleteMutation = useDeleteAddressMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (isPending || addressesLoading) {
    return <AddressesSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) })
  }

  const getLabelIcon = (label?: string | null) => {
    const l = label?.toLowerCase() || ""
    if (l.includes('home')) return Home
    if (l.includes('work') || l.includes('office')) return Briefcase
    if (l.includes('parent') || l.includes('family')) return Heart
    if (l.includes('friend')) return Star
    return MapPin
  }

  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-6 md:pt-8">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#8C96A5] mb-4">
        <span className="hover:text-[#065F11] cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-[#065F11] cursor-pointer transition-colors">Account</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E293B] font-bold">Address</span>
      </div>

      {/* BANNER */}
      <div 
        className="relative w-full rounded-[20px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-6 border border-[#E4E8E4] shadow-[0_12px_40px_rgba(30,40,35,0.06)]"
        style={{
          background: `
            radial-gradient(circle at 88% 75%, rgba(255, 204, 121, 0.38), transparent 24%),
            radial-gradient(circle at 70% 30%, rgba(181, 224, 184, 0.18), transparent 30%),
            linear-gradient(135deg, #FFFFFF 0%, #F9FBF8 55%, #FFF8EB 100%)
          `
        }}
      >
        <div className="relative z-10 flex-1 w-full text-center md:text-left">
          <h1 className="text-[28px] md:text-[38px] font-extrabold text-[#142036] leading-tight mb-2 tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#4F5C70] font-medium mb-8 max-w-md mx-auto md:mx-0">
            Manage your delivery addresses <br className="hidden md:block" />for a faster checkout experience
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 w-full md:w-fit mx-auto md:mx-0">
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full p-2 px-4 border border-white/50 shadow-[0_4px_12px_rgba(20,30,30,0.05)]">
               <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#277C36]" />
               <span className="text-[12px] md:text-[13px] font-bold text-[#1E293B]">Secure & Private</span>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full p-2 px-4 border border-white/50 shadow-[0_4px_12px_rgba(20,30,30,0.05)]">
               <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#277C36]" />
               <span className="text-[12px] md:text-[13px] font-bold text-[#1E293B]">Quick Checkout</span>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full p-2 px-4 border border-white/50 shadow-[0_4px_12px_rgba(20,30,30,0.05)]">
               <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#277C36]" />
               <span className="text-[12px] md:text-[13px] font-bold text-[#1E293B]">Deliver to your favourite places</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[200px] h-[200px] md:w-[320px] md:h-[240px] flex-shrink-0">
          <Image 
            src="/account/map.webp" 
            alt="Map" 
            fill 
            className="object-contain drop-shadow-[0_10px_30px_rgba(237,100,9,0.12)]"
          />
        </div>
      </div>

      {/* ADD BUTTON ROW */}
      {!showAddForm && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#09762D] hover:bg-[#065F11] text-white rounded-[10px] font-bold text-[14px] h-[44px] px-6 transition-colors shadow-[0_4px_12px_rgba(9,118,45,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>
      )}

      {/* ADD FORM */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit((data) => addMutation.mutate(data))}
          className="bg-[#FEFEFE] rounded-[18px] p-6 md:p-8 border border-[#E4E8E4] shadow-[0_8px_30px_rgba(25,40,35,0.05)] mb-8 space-y-6"
        >
          <div className="flex items-center gap-2 text-[#277C36]">
            <MapPin className="w-5 h-5" />
            <h2 className="text-[16px] font-extrabold text-[#142036]">Add New Address</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="text-[13px] font-bold text-[#4F5C70] mb-2 block">Label (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Home className="h-[18px] w-[18px] text-[#AAB1BC]" />
                </div>
                <Input
                  placeholder="e.g. Home, Work, Others"
                  {...register("label")}
                  className="h-[46px] text-[14px] font-medium border-[#E4E8E4] rounded-[10px] pl-10 focus-visible:ring-[#277C36] text-[#1E293B] placeholder:text-[#AAB1BC]"
                />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-[#4F5C70] mb-2 block">Pincode <span className="text-[#D70806]">*</span></label>
              <div className="relative">
                <Input
                  placeholder="6-digit pincode"
                  maxLength={6}
                  {...register("pincode")}
                  className="h-[46px] text-[14px] font-medium border-[#E4E8E4] rounded-[10px] pr-10 focus-visible:ring-[#277C36] text-[#1E293B] placeholder:text-[#AAB1BC]"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <Crosshair className="h-[18px] w-[18px] text-[#AAB1BC]" />
                </div>
              </div>
              {errors.pincode && <p className="text-[12px] font-medium text-[#D70806] mt-1.5">{errors.pincode.message}</p>}
            </div>
            <div>
              <label className="text-[13px] font-bold text-[#4F5C70] mb-2 block">Address Line 1 <span className="text-[#D70806]">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-[18px] w-[18px] text-[#AAB1BC]" />
                </div>
                <Input
                  placeholder="Door / Flat No., Street, Area"
                  {...register("lineOne")}
                  className="h-[46px] text-[14px] font-medium border-[#E4E8E4] rounded-[10px] pl-10 focus-visible:ring-[#277C36] text-[#1E293B] placeholder:text-[#AAB1BC]"
                />
              </div>
              {errors.lineOne && <p className="text-[12px] font-medium text-[#D70806] mt-1.5">{errors.lineOne.message}</p>}
            </div>
            <div>
              <label className="text-[13px] font-bold text-[#4F5C70] mb-2 block">Address Line 2 (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Map className="h-[18px] w-[18px] text-[#AAB1BC]" />
                </div>
                <Input
                  placeholder="Landmark, Nearby place, Society"
                  {...register("lineTwo")}
                  className="h-[46px] text-[14px] font-medium border-[#E4E8E4] rounded-[10px] pl-10 focus-visible:ring-[#277C36] text-[#1E293B] placeholder:text-[#AAB1BC]"
                />
              </div>
            </div>
          </div>
          
          {addMutation.isError && (
            <p className="text-[13px] font-bold text-[#D70806] bg-[#FCE8E7] p-3 rounded-lg border border-[#F0A39F]">{addMutation.error?.message ?? "Could not save address"}</p>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); addMutation.reset() }}
              className="px-6 h-[44px] rounded-[10px] border border-[#E4E8E4] bg-white text-[#4F5C70] text-[14px] font-bold hover:bg-[#F6F8F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="flex items-center gap-2 px-6 h-[44px] rounded-[10px] bg-[#09762D] text-white text-[14px] font-bold hover:bg-[#065F11] transition-colors shadow-[0_4px_12px_rgba(9,118,45,0.2)] disabled:opacity-70"
            >
              {addMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Address</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ADDRESS LIST */}
      <h3 className="text-[16px] font-extrabold text-[#142036] mb-4">Your Saved Addresses</h3>
      
      {addresses.length === 0 && !showAddForm ? (
        <div className="bg-[#FFFFFF] rounded-[18px] p-12 text-center border border-dashed border-[#B8D9BF]">
          <div className="relative w-20 h-20 mx-auto mb-5 opacity-80">
             <Image src="/account/map.webp" alt="No addresses" fill className="object-contain" />
          </div>
          <h3 className="text-[18px] font-bold text-[#263247] mb-2">No addresses yet</h3>
          <p className="text-[14px] text-[#667085] font-medium mb-6">Add your first address to enjoy a seamless delivery experience.</p>
          <button 
             onClick={() => setShowAddForm(true)}
             className="px-6 py-2.5 bg-[#FFFFFF] border border-[#277C36] text-[#16632A] rounded-[10px] font-bold text-[14px] hover:bg-[#F2F9F3] transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {addresses.map((addr) => {
            const Icon = getLabelIcon(addr.label);
            return (
              <div
                key={addr.id}
                className="group relative bg-[#FEFEFE] rounded-[18px] p-5 md:p-6 border border-[#E4E8E4] shadow-[0_4px_12px_rgba(20,30,30,0.03)] hover:shadow-[0_8px_30px_rgba(25,40,35,0.06)] hover:border-[#C4DFC8] transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#F3FAF4] flex items-center justify-center shrink-0 border border-[#E7F6E8]">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#277C36]" />
                </div>
                
                <div className="flex-1 min-w-0 pr-16">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-extrabold text-[15px] md:text-[16px] text-[#142036] truncate">{addr.label || "Address"}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold tracking-wide uppercase text-[#09762D] bg-[#E7F6E8] px-2 py-0.5 rounded-md">Default</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] md:text-[14px] text-[#4F5C70] font-medium leading-[1.6]">
                      {addr.lineOne}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#8C96A5] font-medium flex-wrap">
                      <span className="truncate">{addr.lineTwo || "City, State"}</span>
                      <span className="text-[#C4DFC8] font-light">---</span>
                      <span className="text-[#09762D] bg-[#E7F6E8] px-2 py-0.5 rounded font-bold">{addr.pincode}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-5 right-5 flex gap-2">
                  <button
                    className="w-8 h-8 rounded-lg bg-white border border-[#E4E8E4] text-[#667085] flex items-center justify-center hover:bg-[#F6F8F9] hover:text-[#1E293B] shadow-sm transition-colors"
                    aria-label="Edit address"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="w-8 h-8 rounded-lg border border-[#F0A39F] bg-[#FCE8E7] text-[#D70806] flex items-center justify-center hover:bg-[#FEE2E2] shadow-sm transition-colors disabled:opacity-50"
                    aria-label="Delete address"
                  >
                    {deletingId === addr.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}