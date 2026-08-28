"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Plus, Trash2, Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth-client"
import {
  useUserAddressesQuery,
  useUserAddresses,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from "@/stores/userProfileStore"

const addressSchema = z.object({
  label: z.string().optional(),
  lineOne: z.string().min(3, "Address is required"),
  lineTwo: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
})

type AddressForm = z.infer<typeof addressSchema>

function AddressesSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[160px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
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

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* HEADER */}
      <div className="relative w-full h-[150px] md:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-2">
            Saved Addresses
          </h1>
          <p className="text-[14px] md:text-[15px] font-medium text-gray-700">
            Manage your delivery addresses for faster checkout
          </p>
        </div>
        <div className="absolute right-[-16px] md:right-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[190px] md:h-[190px] bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <MapPin className="w-12 h-12 md:w-16 md:h-16 text-[#F97316]" />
        </div>
      </div>

      {/* ADD BUTTON */}
      {!showAddForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[#15803D] hover:bg-[#166534] text-white rounded-xl font-bold text-[13px] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Address
          </Button>
        </div>
      )}

      {/* ADD FORM */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit((data) => addMutation.mutate(data))}
          className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm space-y-4"
        >
          <h2 className="text-[16px] font-bold text-gray-900">Add a new address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Label</label>
              <Input
                placeholder="e.g. Home, Work, Others"
                {...register("label")}
                className="h-11 text-[13px] border-[#E6E6E6] rounded-xl"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Pincode *</label>
              <Input
                placeholder="6-digit pincode"
                maxLength={6}
                {...register("pincode")}
                className="h-11 text-[13px] border-[#E6E6E6] rounded-xl"
              />
              {errors.pincode && <p className="text-[11px] text-[#DC2626] mt-1">{errors.pincode.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Address line 1 *</label>
              <Input
                placeholder="Door / Flat No., Street"
                {...register("lineOne")}
                className="h-11 text-[13px] border-[#E6E6E6] rounded-xl"
              />
              {errors.lineOne && <p className="text-[11px] text-[#DC2626] mt-1">{errors.lineOne.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Address line 2</label>
              <Input
                placeholder="Area, Landmark (optional)"
                {...register("lineTwo")}
                className="h-11 text-[13px] border-[#E6E6E6] rounded-xl"
              />
            </div>
          </div>
          {addMutation.isError && (
            <p className="text-[12px] text-[#DC2626]">{addMutation.error?.message ?? "Could not save address"}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowAddForm(false); addMutation.reset() }}
              className="rounded-xl border-[#E6E6E6] h-10 text-[13px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending}
              className="rounded-xl bg-[#15803D] hover:bg-[#166534] text-white h-10 text-[13px] font-bold"
            >
              {addMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ADDRESS LIST */}
      {addresses.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-[20px] p-10 border border-[#E5E7EB] shadow-sm text-center">
          <div className="w-16 h-16 mx-auto bg-[#FFF7ED] rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-[#F97316]" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">No saved addresses</h3>
          <p className="text-[13px] text-gray-500 font-medium">Add your first delivery address to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-extrabold text-[14px] text-gray-900">{addr.label || "Address"}</span>
                  {addr.isDefault && (
                    <span className="text-[9px] font-bold text-[#287342] bg-[#E7F4E9] px-2 py-0.5 rounded-[999px]">Default</span>
                  )}
                </div>
                <p className="text-[13px] text-gray-600 font-medium leading-[1.6]">
                  {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""}, {addr.pincode}
                </p>
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deletingId === addr.id}
                className="shrink-0 w-9 h-9 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                aria-label={`Delete address ${addr.label || ""}`}
              >
                {deletingId === addr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}