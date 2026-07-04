"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { User, Mail, Phone, MapPin, Plus, Trash2, LogOut, Package, ChevronRight, Pencil, X, Check, Loader2 } from "lucide-react"
import { Button, Input, Card } from "@/components/ui"
import { useSession, signOut } from "@/lib/auth-client"
import { addAddress, deleteAddress, getUserAddresses } from "@/actions/address"
import { updateProfileNameEmail } from "@/actions/profile"

type UserProfile = { id: string; name: string; email: string; phoneNumber: string | null }

const addressSchema = z.object({
  label: z.string().optional(),
  lineOne: z.string().min(3, "Address is required"),
  lineTwo: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
})

type AddressForm = z.infer<typeof addressSchema>

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function AccountProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, isPending, refetch: refetchSession } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/account/profile")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json() as Promise<UserProfile>
    },
    enabled: !!session?.user,
  })

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: getUserAddresses,
    enabled: !!session?.user,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || session?.user?.name || "",
      email: profile?.email || session?.user?.email || "",
    },
  })

  const addMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      reset()
      setShowAddForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })

  const profileMutation = useMutation({
    mutationFn: updateProfileNameEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      refetchSession({ query: { disableCookieCache: true } })
      setEditingProfile(false)
    },
  })

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const onProfileSubmit = (data: ProfileForm) => {
    profileMutation.mutate({ name: data.name, email: data.email || undefined })
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const user = profile ?? session.user

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile, addresses, and orders</p>
        </div>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{user.name || "Customer"}</h2>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {user.phoneNumber && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {user.phoneNumber}
                    </span>
                  )}
                  {user.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!editingProfile && (
              <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {editingProfile && (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-6 space-y-4 border-t border-border pt-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input {...profileForm.register("name")} />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input type="email" placeholder="your@email.com" {...profileForm.register("email")} />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              {profileMutation.isError && (
                <p className="text-sm text-destructive">{profileMutation.error?.message ?? "Failed to update profile"}</p>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingProfile(false); profileMutation.reset() }}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-1" /> Save</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="space-y-2">
          <Link
            href="/account/orders"
            className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">My Orders</p>
                <p className="text-xs text-muted-foreground">View order history and track status</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saved Addresses</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-4">
              <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-3">
                <div>
                  <Input placeholder="Label (e.g. Home, Work)" {...register("label")} />
                </div>
                <div>
                  <Input placeholder="Address line 1 *" {...register("lineOne")} />
                  {errors.lineOne && <p className="text-xs text-destructive mt-1">{errors.lineOne.message}</p>}
                </div>
                <div>
                  <Input placeholder="Address line 2" {...register("lineTwo")} />
                </div>
                <div>
                  <Input placeholder="Pincode *" maxLength={6} {...register("pincode")} />
                  {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>}
                </div>
                {addMutation.isError && (
                  <p className="text-sm text-destructive">{addMutation.error?.message ?? "Failed to save address"}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddForm(false); addMutation.reset() }}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <Card key={addr.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      {addr.label && <span className="text-xs font-semibold uppercase text-muted-foreground">{addr.label}</span>}
                      {addr.isDefault && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">DEFAULT</span>}
                    </div>
                    <p className="text-sm">{addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{addr.pincode} — {addr.serviceZone.name}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(addr.id)}
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </main>
  )
}
