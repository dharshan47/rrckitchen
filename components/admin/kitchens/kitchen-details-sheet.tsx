"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Camera, Clock, ShieldCheck } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

import { KitchenPartnerRow } from "./columns"
import {
  useUpdateKitchenDetailsMutation,
  useUpdateKitchenStatusMutation,
  useUpdateKitchenImageMutation,
  useUpdateKitchenOfferTextMutation,
} from "@/stores/adminKitchensStore"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"

interface KitchenDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kitchen: KitchenPartnerRow | null
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDINGAPPROVAL: "bg-orange-100 text-orange-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-gray-100 text-gray-700",
}

function kitchenName(kitchen: KitchenPartnerRow) {
  return kitchen.displayName || kitchen.name || "Unknown Kitchen"
}

export function KitchenDetailsSheet({ open, onOpenChange, kitchen }: KitchenDetailsSheetProps) {
  if (!kitchen) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col">
        <KitchenDetailsBody
          key={kitchen.id}
          kitchen={kitchen}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function KitchenDetailsBody({ kitchen, onClose }: { kitchen: KitchenPartnerRow; onClose: () => void }) {
  const [displayName, setDisplayName] = useState(kitchen.displayName || kitchen.name || "")
  const [email] = useState(kitchen.email || "")
  const [phoneNumber] = useState(kitchen.phoneNumber || "")
  const [offerText, setOfferText] = useState(kitchen.customOfferText || "")
  const [prepTime, setPrepTime] = useState(String(kitchen.estimatedPrepTime ?? 25))

  const detailsMutation = useUpdateKitchenDetailsMutation()
  const offerTextMutation = useUpdateKitchenOfferTextMutation()
  const imageMutation = useUpdateKitchenImageMutation()
  const statusMutation = useUpdateKitchenStatusMutation()

  const name = kitchenName(kitchen)
  const initials = name.substring(0, 2).toUpperCase()

  const handleSaveGeneral = () => {
    detailsMutation
      .mutateAsync({
        kitchenId: kitchen.id,
        details: {
          displayName,
          estimatedPrepTime: parseInt(prepTime, 10) || 25,
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

  return (
    <>
      <div className="relative h-48 w-full bg-muted">
        {kitchen.imageUrl ? (
          <Image src={kitchen.imageUrl} alt="Banner" fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-4 right-4">
          <CloudinaryUpload
            onUpload={(result) =>
              imageMutation
                .mutateAsync({ kitchenId: kitchen.id, imageUrl: result.secure_url })
                .then((res) => {
                  if (res.success) {
                    toast.success("Image updated successfully")
                  } else {
                    toast.error(res.error ?? "Failed to update image")
                  }
                })
            }
          >
            {({ uploading, startUpload }) => (
              <Button variant="secondary" size="sm" onClick={startUpload} disabled={uploading} className="h-8 gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-white/10">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {uploading ? "Uploading..." : "Change Image"}
              </Button>
            )}
          </CloudinaryUpload>
        </div>

        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg rounded-xl">
            <AvatarImage src={kitchen.imageUrl ?? ""} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="mb-2">
            <h2 className="text-xl font-bold text-white drop-shadow-md">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-none ${statusStyles[kitchen.status]}`}>
                {kitchen.status}
              </Badge>
              <span className="text-xs text-white/90 drop-shadow-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> {kitchen.createdAt ? new Date(kitchen.createdAt).toLocaleDateString() : "New"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col mt-12 px-6">
        <Tabs defaultValue="general" className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-6">
            <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none">General</TabsTrigger>
            <TabsTrigger value="location" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none">Location</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none">Documents</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 data-[state=active]:shadow-none">Settings</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <TabsContent value="general" className="py-6 space-y-8 animate-in fade-in-50 duration-300">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kitchen Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={phoneNumber} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Prep Time (mins)</Label>
                    <Input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} type="number" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Marketing</h3>
                <div className="space-y-2">
                  <Label>Custom Offer Text</Label>
                  <Input value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="e.g. 20% OFF on all orders above ₹299" />
                  <p className="text-[11px] text-muted-foreground">This will be displayed on the kitchen page.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="py-6 space-y-6">
              {kitchen.address ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Door No / Building</Label>
                      <Input value={kitchen.address.doorNo ?? ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Area</Label>
                      <Input value={kitchen.address.area ?? ""} disabled className="bg-muted" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Street / Line 1</Label>
                      <Input value={kitchen.address.lineOne} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Landmark</Label>
                      <Input value={kitchen.address.landmark ?? ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input value={kitchen.address.pincode} disabled className="bg-muted" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No location details available.</div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="py-6 space-y-6">
              {kitchen.kyc ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                    <ShieldCheck className="w-5 h-5" />
                    <div className="text-sm font-medium">KYC Details Submitted</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Account Holder</p>
                      <p className="font-medium mt-1">{kitchen.kyc.accountHolderName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Bank Name</p>
                      <p className="font-medium mt-1">{kitchen.kyc.bankName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Account Number</p>
                      <p className="font-medium mt-1">{kitchen.kyc.bankAccountNumber ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">IFSC Code</p>
                      <p className="font-medium mt-1">{kitchen.kyc.ifscCode ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No KYC documents submitted yet.</div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account Status</h3>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Active Kitchen</Label>
                    <p className="text-sm text-muted-foreground">Toggle to suspend or activate this kitchen</p>
                  </div>
                  <Switch
                    checked={kitchen.status === "ACTIVE" || kitchen.status === "APPROVED"}
                    onCheckedChange={(checked) => {
                      statusMutation
                        .mutateAsync({ id: kitchen.id, status: checked ? "ACTIVE" : "SUSPENDED" })
                        .then((res) => {
                          if (res.success) {
                            toast.success("Status updated")
                          } else {
                            toast.error(res.error ?? "Failed to update status")
                          }
                        })
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <div className="p-4 border-t bg-muted/20 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveGeneral} disabled={detailsMutation.isPending || offerTextMutation.isPending}>
          {(detailsMutation.isPending || offerTextMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </>
  )
}