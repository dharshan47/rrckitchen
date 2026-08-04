"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  User, Mail, Phone, MapPin, Trash2, LogOut, Package, 
  Pencil, Loader2, Heart, 
  Settings, CreditCard, Bell, HelpCircle, Star, Gift, CheckCircle2, Menu,
  ChefHat, ShieldCheck, Clock, Leaf, Users, Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ProfileSkeleton } from "@/components/account/profile-skeleton"
import { useSession, signOut } from "@/lib/auth-client"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  useUserProfileQuery,
  useUserAddressesQuery,
  useUserLoyaltyPointsQuery,
  useUserWishlistQuery,
  useUserReferralCodeQuery,
  useUserReferralStatsQuery,
  useUserOrdersQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useUpdateProfileNameEmailMutation,
  useUserProfile,
  useUserAddresses,
  useUserLoyaltyPoints,
  useUserWishlist,
  useUserReferralCode,
  useUserReferralStats,
  useUserOrders,
  type UserProfile,
} from "@/stores/userProfileStore"

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

export function ProfileContent() {
  const router = useRouter()
  const { data: session, isPending, refetch: refetchSession } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const profile = useUserProfile()
  const addresses = useUserAddresses()
  const loyaltyPoints = useUserLoyaltyPoints()
  const wishlist = useUserWishlist()
  const referralCode = useUserReferralCode()
  const referralStats = useUserReferralStats()
  const orders = useUserOrders()

  const isLoggedIn = !!session?.user

  const { isLoading: profileLoading } = useUserProfileQuery(isLoggedIn)
  const { isLoading: addressesLoading } = useUserAddressesQuery(isLoggedIn)
  useUserLoyaltyPointsQuery(isLoggedIn)
  useUserWishlistQuery(isLoggedIn)
  useUserReferralCodeQuery(isLoggedIn)
  useUserReferralStatsQuery(isLoggedIn)
  const { isLoading: ordersLoading } = useUserOrdersQuery(isLoggedIn)

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

  const addMutation = useAddAddressMutation(() => {
    reset()
    setShowAddForm(false)
  })
  const deleteMutation = useDeleteAddressMutation()
  const profileMutation = useUpdateProfileNameEmailMutation(() => {
    refetchSession({ query: { disableCookieCache: true } })
    setEditingProfile(false)
  })

  const handleLogout = async () => {
    await Promise.race([
      signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]).catch(() => {});
    router.push("/");
  }

  const onProfileSubmit = (data: ProfileForm) => {
    profileMutation.mutate({ name: data.name, email: data.email || undefined })
  }

  const referralLink = referralCode ? `https://rrckitchen.com/signup?ref=${referralCode}` : ""

  const copyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      toast.success("Referral link copied!")
    }
  }

  const contentLoading = isPending || profileLoading || addressesLoading || ordersLoading

  if (contentLoading) {
    return <ProfileSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const user = (profile as UserProfile | null) ?? session.user
  
  // Extract recent reviews from orders
  const recentReviews = orders
    .filter(o => o.kitchenReview)
    .map(o => ({
      id: o.kitchenReview!.id,
      kitchenName: o.kitchenName,
      dish: o.items[0]?.name || "Assorted Items",
      rating: o.kitchenReview!.rating,
      date: o.createdAt,
      imageUrl: o.items[0]?.imageUrl
    }))
    .slice(0, 3)

  const SIDEBAR_ITEMS = [
    { icon: User, label: "My Profile", active: true, href: "#" },
    { icon: Package, label: "My Orders", href: "/account/orders" },
    { icon: Heart, label: "Favorites", href: "/account/favourites" },
    { icon: Star, label: "Loyalty Points", href: "/account/loyalty" },
    { icon: Users, label: "Referrals", href: "#" },
    { icon: MapPin, label: "Saved Addresses", href: "#" },
    { icon: CreditCard, label: "Payment Methods", href: "#" },
    { icon: Bell, label: "Notifications", href: "#" },
    { icon: HelpCircle, label: "Help & Support", href: "/account/support" },
    { icon: Settings, label: "Settings", href: "#" },
  ]

  return (
    <div className="min-h-screen bg-muted/50 text-slate-900 pb-12">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">My Account</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 flex gap-8 relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:sticky top-0 md:top-8 left-0 h-full md:h-[calc(100vh-4rem)] 
          w-64 bg-white md:bg-transparent shadow-xl md:shadow-none z-40 md:z-auto
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex flex-col h-full md:h-auto min-h-max">
            <nav className="flex-1 space-y-1">
              {SIDEBAR_ITEMS.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    item.active 
                      ? "text-[#FF5722] bg-[#FFF0EC]" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors mt-2"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>

            <div className="mt-8 p-4 bg-[#F8FAF8] rounded-xl border border-[#E9F3EC]">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <HelpCircle className="h-5 w-5 text-[#2E7D32]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2E7D32]">Need Help?</h4>
                  <p className="text-xs text-muted-foreground">We&apos;re here to assist you</p>
                </div>
              </div>
              <Link href="/account/support">
                <Button variant="outline" className="w-full mt-3 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 bg-white text-xs h-9">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Profile Header Card */}
          <Card className="p-6 md:p-8 rounded-2xl shadow-sm border-border bg-white">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group cursor-pointer">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-muted relative">
                    <Image 
                      src="/icons/profile.webp" 
                      alt="Profile" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-[#FF5722] text-white p-2 rounded-full border-2 border-white shadow-sm">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-center md:text-left space-y-2 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <h1 className="text-2xl font-bold text-foreground">{user.name || "Customer"}</h1>
                    <div className="inline-flex items-center justify-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-full text-xs font-semibold self-center md:self-auto">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm text-muted-foreground">
                    {user.email && (
                      <span className="flex items-center justify-center md:justify-start gap-2">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </span>
                    )}
                    {user.phoneNumber && (
                      <span className="flex items-center justify-center md:justify-start gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span className="truncate">{user.phoneNumber}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center justify-center md:justify-start gap-2">
                      <User className="h-4 w-4 shrink-0" />
                      Member since Jan 2024
                    </span>
                    <span className="flex items-center justify-center md:justify-start gap-2">
                      <Star className="h-4 w-4 shrink-0" />
                      Regular Customer
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0">
                {!editingProfile && (
                  <Button variant="ghost" onClick={() => setEditingProfile(true)} className="text-[#FF5722] hover:text-[#FF5722] hover:bg-[#FFF0EC] w-full md:w-auto text-sm font-medium">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {editingProfile && (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-8 space-y-4 border-t border-border pt-6 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Name</label>
                  <Input {...profileForm.register("name")} className="rounded-xl border-border" />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Email</label>
                  <Input type="email" placeholder="your@email.com" {...profileForm.register("email")} className="rounded-xl border-border" />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                {profileMutation.isError && (
                  <p className="text-sm text-red-500">{profileMutation.error?.message ?? "Failed to update profile"}</p>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => { setEditingProfile(false); profileMutation.reset() }} className="rounded-xl border-border">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={profileMutation.isPending} className="rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white">
                    {profileMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Grid Section 1 (Loyalty, Favorites, Referrals) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Loyalty Points */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Loyalty Points</h3>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-[#116450]">{loyaltyPoints?.points || "1,250"}</span>
                  <span className="text-sm text-muted-foreground mb-1 font-medium">Points Available</span>
                </div>
                <div className="bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-medium px-3 py-1.5 rounded-lg inline-block w-full text-center">
                  250 pts will expire on 30 Jun 2024
                </div>
              </div>
              
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none md:opacity-100 md:right-4">
                <div className="bg-[#E8F5E9] h-20 w-20 rounded-full flex items-center justify-center shadow-inner">
                  <Star className="h-10 w-10 text-[#2E7D32]" />
                </div>
              </div>

              <Link href="/account/loyalty" className="mt-6 block">
                <Button variant="outline" className="w-[120px] rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] text-xs h-9">
                  View Rewards
                </Button>
              </Link>
            </Card>

            {/* Favorites */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Favorites</h3>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-foreground">{wishlist.length || "18"}</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Favorite Kitchens
                </div>
              </div>

              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none md:opacity-100 md:right-4">
                <div className="bg-[#FFF0EC] h-20 w-20 rounded-full flex items-center justify-center shadow-inner">
                  <Heart className="h-10 w-10 text-[#FF5722]" fill="#FF5722" />
                </div>
              </div>

              <Link href="/account/favourites" className="mt-6 block">
                <Button variant="outline" className="w-[120px] rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] text-xs h-9">
                  View Favorites
                </Button>
              </Link>
            </Card>

            {/* Referrals */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Referrals</h3>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-foreground">{referralStats?.totalReferrals || "6"}</span>
                </div>
                <div className="text-sm text-muted-foreground font-medium mb-1.5">
                  Friends Referred
                </div>
                <div className="text-[#2E7D32] text-xs font-semibold">
                  You earned {referralStats?.totalPointsEarned || "300"} points
                </div>
              </div>

              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none md:opacity-100 md:right-4">
                 <div className="h-20 w-20 flex items-center justify-center">
                    <Gift className="h-14 w-14 text-[#2E7D32]" />
                 </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" onClick={copyReferral} className="w-[120px] rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] text-xs h-9">
                  Refer & Earn
                </Button>
              </div>
            </Card>
          </div>

          {/* Grid Section 2 (Recent Orders, Saved Addresses, Recent Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recent Orders */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Recent Orders</h3>
                </div>
                <Link href="/account/orders" className="text-xs font-semibold text-[#FF5722] hover:underline">
                  View All Orders
                </Link>
              </div>
              <div className="flex-1 space-y-4">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent orders</p>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                        {order.items[0]?.imageUrl ? (
                           <Image src={order.items[0].imageUrl} alt="Food" fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-400">
                             <Package className="h-6 w-6" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-sm text-foreground truncate">{order.kitchenName}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase ${
                            order.status === "COMPLETED" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-orange-100 text-orange-700"
                          }`}>
                            {order.status === "COMPLETED" ? "Delivered" : order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {order.items.map(i => i.name).join(", ")}
                        </p>
                        <div className="flex justify-between items-end mt-1.5">
                          <span className="text-[10px] text-muted-foreground">Order ID: #{order.id.slice(0, 8).toUpperCase()}</span>
                          <div className="text-right">
                             <div className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy")}</div>
                             <div className="font-bold text-sm text-foreground">₹{parseFloat(order.totalAmount).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/account/orders" className="mt-4 block">
                 <Button variant="outline" className="w-full rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] h-10">
                   View All Orders
                 </Button>
              </Link>
            </Card>

            {/* Saved Addresses */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Saved Addresses</h3>
                </div>
                <Link href="#" className="text-xs font-semibold text-[#FF5722] hover:underline">
                  View All Addresses
                </Link>
              </div>

              {showAddForm ? (
                <div className="flex-1 flex flex-col justify-center">
                  <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-3 bg-muted/50 p-4 rounded-xl">
                    <Input placeholder="Label (e.g. Home, Work)" {...register("label")} className="h-9 text-xs bg-white border-border" />
                    <Input placeholder="Address line 1 *" {...register("lineOne")} className="h-9 text-xs bg-white border-border" />
                    {errors.lineOne && <p className="text-[10px] text-red-500">{errors.lineOne.message}</p>}
                    <Input placeholder="Address line 2" {...register("lineTwo")} className="h-9 text-xs bg-white border-border" />
                    <Input placeholder="Pincode *" maxLength={6} {...register("pincode")} className="h-9 text-xs bg-white border-border" />
                    {errors.pincode && <p className="text-[10px] text-red-500">{errors.pincode.message}</p>}
                    <div className="flex gap-2 justify-end pt-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddForm(false); addMutation.reset() }} className="h-7 text-xs">Cancel</Button>
                      <Button type="submit" size="sm" disabled={addMutation.isPending} className="h-7 text-xs bg-[#FF5722] text-white">Save</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No saved addresses</p>
                  ) : (
                    addresses.slice(0, 2).map((addr) => (
                      <div key={addr.id} className="flex items-start justify-between gap-3 p-4 rounded-xl border border-border bg-muted/50">
                        <div className="flex items-start gap-3 min-w-0">
                          <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">{addr.label || "Address"}</span>
                              {addr.isDefault && <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded">Default</span>}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed truncate whitespace-normal line-clamp-2">
                              {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""}, {addr.pincode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{user.phoneNumber && `+91 ${user.phoneNumber.replace('+91', '').trim()}`}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteMutation.mutate(addr.id)} className="shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {!showAddForm && (
                <div className="mt-4 pt-2">
                   <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] h-10">
                     Add New Address
                   </Button>
                </div>
              )}
            </Card>

            {/* Recent Reviews */}
            <Card className="p-6 rounded-2xl shadow-sm border-border bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#FF5722]" />
                  <h3 className="font-bold text-foreground text-lg">Recent Reviews</h3>
                </div>
                <Link href="#" className="text-xs font-semibold text-[#FF5722] hover:underline">
                  View All Reviews
                </Link>
              </div>
              <div className="flex-1 space-y-4">
                {recentReviews.length === 0 ? (
                   <p className="text-sm text-muted-foreground py-4 text-center">No recent reviews</p>
                ) : (
                  recentReviews.map((review) => (
                    <div key={review.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                        {review.imageUrl ? (
                           <Image src={review.imageUrl} alt="Food" fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-400">
                             <Star className="h-6 w-6" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{review.kitchenName}</h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{review.dish}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center text-yellow-400">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400" : "text-gray-300"}`} />
                             ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 border-l border-border pl-2">
                            {format(new Date(review.date), "dd MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-2">
                 <Button variant="outline" className="w-full rounded-xl border-[#FF5722] text-[#FF5722] hover:bg-[#FFF0EC] h-10">
                   Write a Review
                 </Button>
              </div>
            </Card>

          </div>
          
          {/* Footer Features */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-x-0 md:divide-x divide-border">
               <div className="flex flex-col items-center gap-2 px-2">
                  <ChefHat className="h-8 w-8 text-[#FF5722]" />
                  <div>
                    <h5 className="text-sm font-bold text-foreground">100% Homemade</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Made with love & care</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <ShieldCheck className="h-8 w-8 text-[#2E7D32]" />
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Hygienic & Safe</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Verified home kitchens</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <Clock className="h-8 w-8 text-[#FF9800]" />
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Pre-book & Save Time</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Order in advance</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <Leaf className="h-8 w-8 text-[#2E7D32]" />
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Fresh Ingredients</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Sourced daily</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2 col-span-2 md:col-span-1">
                  <Users className="h-8 w-8 text-[#FF5722]" />
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Support Local Women</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Empowering homemakers</p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
