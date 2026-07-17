"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useKitchenData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateKitchenBankDetails, updateKitchenAddress } from "@/actions/admin/dashboard"
import { updateProfileNameEmail } from "@/actions/onboarding/profile"
import { LocationAutocomplete } from "@/components/location/location-autocomplete"
import { MapPin, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ThanjavurMap = dynamic(
  () => import("@/components/map/thanjavur-map").then((m) => m.ThanjavurMap),
  { ssr: false },
)

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
})

type ProfileForm = z.infer<typeof profileSchema>

const addressSchema = z.object({
  lineOne: z.string().min(1, "Please select a location"),
  doorNo: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  pincode: z.string(),
})

type AddressForm = z.infer<typeof addressSchema>

const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  bankAccountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  upiId: z.string(),
  gpayNumber: z.string(),
  phoneNumber: z.string(),
})

type BankForm = z.infer<typeof bankSchema>

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const data = useKitchenData()
  const kitchen = data.kitchen
  const [editingBank, setEditingBank] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: kitchen.userName ?? "",
      email: kitchen.email ?? "",
    },
  })

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      lineOne: kitchen.address?.lineOne ?? "",
      doorNo: kitchen.address?.doorNo ?? "",
      area: kitchen.address?.area ?? "",
      landmark: kitchen.address?.landmark ?? "",
      latitude: kitchen.address?.latitude ?? 0,
      longitude: kitchen.address?.longitude ?? 0,
      pincode: "613001",
    },
  })

  const formLat = useWatch({ control: addressForm.control, name: "latitude" })
  const formLng = useWatch({ control: addressForm.control, name: "longitude" })

  const handleMapSelect = useCallback(async (lat: number, lng: number) => {
    addressForm.setValue("latitude", lat, { shouldValidate: true })
    addressForm.setValue("longitude", lng, { shouldValidate: true })
    setGeocoding(true)
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`)
      if (res.ok) {
        const data = await res.json()
        addressForm.setValue("lineOne", data.display_name ?? `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { shouldValidate: true })
      } else {
        addressForm.setValue("lineOne", `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { shouldValidate: true })
      }
    } catch {
      addressForm.setValue("lineOne", `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { shouldValidate: true })
    } finally {
      setGeocoding(false)
    }
  }, [addressForm])

  const bankForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: kitchen.bankName ?? "",
      bankAccountNumber: kitchen.bankAccountNumber ?? "",
      ifscCode: kitchen.ifscCode ?? "",
      accountHolderName: kitchen.accountHolderName ?? "",
      upiId: kitchen.upiId ?? "",
      gpayNumber: kitchen.gpayNumber ?? "",
      phoneNumber: kitchen.phoneNumber ?? "",
    },
  })

  const addressMutation = useMutation({
    mutationFn: (data: AddressForm) =>
      updateKitchenAddress({
        lineOne: data.lineOne,
        doorNo: data.doorNo || undefined,
        area: data.area || undefined,
        landmark: data.landmark || undefined,
        pincode: "613001",
        latitude: data.latitude,
        longitude: data.longitude,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Address updated")
        setEditingAddress(false)
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const bankMutation = useMutation({
    mutationFn: (data: BankForm) =>
      updateKitchenBankDetails({
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        ifscCode: data.ifscCode,
        accountHolderName: data.accountHolderName,
        upiId: data.upiId ?? "",
        gpayNumber: data.gpayNumber ?? "",
        phoneNumber: data.phoneNumber ?? "",
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Bank details updated successfully")
        setEditingBank(false)
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      updateProfileNameEmail({ name: data.name, email: data.email }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Profile updated")
        setEditingProfile(false)
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update profile")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!editingProfile && (
            <Button variant="outline" size="sm" onClick={() => {
              profileForm.reset({ name: kitchen.userName ?? "", email: kitchen.email ?? "" })
              setEditingProfile(true)
            }}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingProfile ? (
            <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="kh-name">Name</Label>
                <Input id="kh-name" {...profileForm.register("name")} placeholder="Your name" />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kh-email">Email</Label>
                <Input id="kh-email" type="email" {...profileForm.register("email")} placeholder="Your email" />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button type="submit" size="sm" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { profileForm.reset(); setEditingProfile(false) }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kitchen Name</Label>
                <p className="font-medium">{kitchen.displayName}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge variant="secondary" className="bg-green-100 text-green-700 font-medium">
                  {kitchen.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="font-medium">{kitchen.email ?? "Not set"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kitchen Address</CardTitle>
          <Button variant="outline" size="sm" onClick={() => {
            if (kitchen.address) {
              addressForm.reset({
                lineOne: kitchen.address.lineOne,
                doorNo: kitchen.address.doorNo ?? "",
                area: kitchen.address.area ?? "",
                landmark: kitchen.address.landmark ?? "",
                latitude: kitchen.address.latitude,
                longitude: kitchen.address.longitude,
                pincode: "613001",
              })
            }
            setEditingAddress(true)
          }}>
            {kitchen.address ? "Edit" : "Add Address"}
          </Button>
        </CardHeader>
        <CardContent>
          {kitchen.address ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border">
                <ThanjavurMap
                  height="180px"
                  interactive={false}
                  markerPosition={[kitchen.address.latitude, kitchen.address.longitude]}
                />
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1">
                  {[kitchen.address.doorNo, kitchen.address.area].filter(Boolean).length > 0 && (
                    <p className="font-medium">
                      {[kitchen.address.doorNo, kitchen.address.area].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="text-sm">{kitchen.address.lineOne}</p>
                  {kitchen.address.landmark && (
                    <p className="text-xs text-muted-foreground">Near: {kitchen.address.landmark}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Pincode: {kitchen.address.pincode}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border">
                <ThanjavurMap
                  height="180px"
                  interactive={false}
                />
              </div>
              <p className="text-sm text-muted-foreground">No address set yet. Click &ldquo;Add Address&rdquo; to set your kitchen location.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editingAddress} onOpenChange={(o) => { if (!o) { addressForm.reset(); setEditingAddress(false) } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{kitchen.address ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={addressForm.handleSubmit((data) => addressMutation.mutate(data))} className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border">
              <ThanjavurMap
                height="220px"
                onLocationSelect={handleMapSelect}
                interactive
                markerPosition={formLat && formLng ? [formLat, formLng] : undefined}
              />
            </div>

            <div className="grid gap-2">
              <Label>Search your kitchen location</Label>
              <LocationAutocomplete
                onPlaceSelect={(place) => {
                  addressForm.setValue("lineOne", place.address, { shouldValidate: true })
                  addressForm.setValue("latitude", place.lat, { shouldValidate: true })
                  addressForm.setValue("longitude", place.lng, { shouldValidate: true })
                }}
                defaultValue={kitchen.address?.lineOne ?? ""}
              />
            </div>
            {addressForm.formState.errors.lineOne && (
              <p className="text-xs text-destructive">{addressForm.formState.errors.lineOne.message}</p>
            )}
            {geocoding && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Getting address...
              </div>
            )}
            <div className="grid gap-3">
              <Input
                placeholder="Door / Flat No."
                {...addressForm.register("doorNo")}
              />
              <Input
                placeholder="Area"
                {...addressForm.register("area")}
              />
              <Input
                placeholder="Landmark (optional)"
                {...addressForm.register("landmark")}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addressMutation.isPending || geocoding}>
                {addressMutation.isPending ? "Saving..." : "Save Address"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { addressForm.reset(); setEditingAddress(false) }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bank & UPI Details</CardTitle>
          {!editingBank && (
            <Button variant="outline" size="sm" onClick={() => setEditingBank(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingBank ? (
            <form onSubmit={bankForm.handleSubmit((data) => bankMutation.mutate(data))} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Bank Account
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="kh-bankName">Bank Name</Label>
                    <Input id="kh-bankName" {...bankForm.register("bankName")} placeholder="Enter bank name" />
                    {bankForm.formState.errors.bankName && (
                      <p className="text-xs text-destructive">{bankForm.formState.errors.bankName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-accountHolderName">Account Holder Name</Label>
                    <Input id="kh-accountHolderName" {...bankForm.register("accountHolderName")} placeholder="Enter account holder name" />
                    {bankForm.formState.errors.accountHolderName && (
                      <p className="text-xs text-destructive">{bankForm.formState.errors.accountHolderName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-bankAccountNumber">Bank Account Number</Label>
                    <Input id="kh-bankAccountNumber" {...bankForm.register("bankAccountNumber")} placeholder="Enter bank account number" />
                    {bankForm.formState.errors.bankAccountNumber && (
                      <p className="text-xs text-destructive">{bankForm.formState.errors.bankAccountNumber.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-ifscCode">IFSC Code</Label>
                    <Input id="kh-ifscCode" {...bankForm.register("ifscCode")} placeholder="Enter IFSC code" />
                    {bankForm.formState.errors.ifscCode && (
                      <p className="text-xs text-destructive">{bankForm.formState.errors.ifscCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  UPI & Payment Apps
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="kh-upiId">UPI ID</Label>
                    <Input id="kh-upiId" {...bankForm.register("upiId")} placeholder="e.g. name@upi" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-gpayNumber">Google Pay Number</Label>
                    <Input id="kh-gpayNumber" {...bankForm.register("gpayNumber")} placeholder="Phone number for GPay" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-phoneNumber">PhonePe / Other UPI Number</Label>
                    <Input id="kh-phoneNumber" {...bankForm.register("phoneNumber")} placeholder="Phone number for PhonePe" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={bankMutation.isPending}>
                  {bankMutation.isPending ? "Saving..." : "Save Bank Details"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { bankForm.reset(); setEditingBank(false) }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Bank Account
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{kitchen.bankName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Holder</p>
                    <p className="font-medium">{kitchen.accountHolderName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium">{kitchen.bankAccountNumber ? kitchen.bankAccountNumber.replace(/\d(?=\d{4})/g, "*") : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">IFSC Code</p>
                    <p className="font-medium">{kitchen.ifscCode ?? "Not set"}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  UPI & Payment Apps
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">UPI ID</p>
                    <p className="font-medium">{kitchen.upiId ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Google Pay</p>
                    <p className="font-medium">{kitchen.gpayNumber ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PhonePe</p>
                    <p className="font-medium">{kitchen.phoneNumber ?? "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
