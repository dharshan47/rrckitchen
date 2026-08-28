"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  User, Mail, Phone, MapPin, LogOut, Package, 
  Pencil, Loader2, Heart, Trash2,
  Settings, CreditCard, Bell, HelpCircle, Star, CheckCircle2, Menu,
  ChefHat, ShieldCheck, Clock, Leaf, Users
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

  const rateableOrder = orders.find((o) => !o.kitchenReview)

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
    { icon: User, label: "My Profile", active: true, href: "/account/profile" },
    { icon: Package, label: "My Orders", href: "/account/orders" },
    { icon: Heart, label: "Favorites", href: "/account/favourites" },
    { icon: Star, label: "Loyalty Points", href: "/account/loyalty" },
    { icon: Users, label: "Referrals", href: "/account/referrals" },
    { icon: MapPin, label: "Saved Addresses", href: "/account/addresses" },
    { icon: CreditCard, label: "Payment Methods", href: "/account/payments" },
    { icon: Bell, label: "Notifications", href: "/account/notifications" },
    { icon: HelpCircle, label: "Help & Support", href: "/account/support" },
    { icon: Settings, label: "Settings", href: "/account/settings" },
  ]

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#111111] pb-12 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-[#E6E6E6] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-5 w-5 text-[#111111]" />
          </Button>
          <span className="font-semibold text-[#111111]">My Account</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 flex gap-6 relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:sticky top-0 md:top-8 left-0 h-full md:h-auto 
          w-64 bg-white md:bg-transparent shadow-xl md:shadow-none z-40 md:z-auto
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="bg-white rounded-[12px] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-[#E6E6E6] flex flex-col min-h-max">
            <nav className="flex-1 space-y-1">
              {SIDEBAR_ITEMS.map((item, idx) => {
                const isActive = item.active;
                return (
                <Link 
                  key={idx} 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[6px] text-[14px] font-semibold transition-colors ${
                    isActive 
                      ? "text-[#FF4B00] bg-[#FFF4EE]" 
                      : "text-[#4B4B4B] hover:bg-[#FAFAFA] hover:text-[#111111]"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-[#FF4B00]" : "text-[#444444]"}`} />
                  {item.label}
                </Link>
                );
              })}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[6px] text-[14px] font-semibold text-[#4B4B4B] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors mt-1"
              >
                <LogOut className="h-5 w-5 text-[#444444]" />
                Logout
              </button>
            </nav>

            <div className="mt-6 p-4 bg-[#F8FCF9] rounded-[10px] border border-[#DCEADF]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full">
                  <HelpCircle className="h-6 w-6 text-[#006B3C]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#005B32]">Need Help?</h4>
                  <p className="text-[12px] text-[#777777]">We&apos;re here to assist you</p>
                </div>
              </div>
              <Link href="/account/support">
                <Button variant="outline" className="w-full mt-3 border-[#006B3C] text-[#006B3C] hover:bg-[#EFF8F1] bg-white text-[13px] font-semibold h-9 rounded-[6px]">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Profile Header Card */}
          <Card className="p-6 md:p-8 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E7E7E7] bg-white">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                <div className="relative shrink-0">
                  <div className="h-[90px] w-[90px] rounded-full overflow-hidden bg-[#E8E8E8] relative flex items-center justify-center text-gray-400 border border-[#E7E7E7]">
                    <Image 
                      src="/icons/profile.webp" 
                      alt="Profile" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="text-center md:text-left pt-1 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h1 className="text-[24px] font-bold text-[#111111]">{user.name || "Customer"}</h1>
                    <div className="inline-flex items-center justify-center gap-1.5 bg-[#E6F4EA] text-[#006B3C] px-2.5 py-1 rounded-[999px] text-[12px] font-bold self-center md:self-auto">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 text-[13px] text-[#4B4B4B] font-medium mb-2.5">
                    {user.email && (
                      <span className="flex items-center justify-center md:justify-start gap-1.5">
                        <Mail className="h-4 w-4 shrink-0 text-[#444444]" />
                        <span className="truncate">{user.email}</span>
                      </span>
                    )}
                    {user.phoneNumber && (
                      <span className="flex items-center justify-center md:justify-start gap-1.5">
                        <Phone className="h-4 w-4 shrink-0 text-[#444444]" />
                        <span className="truncate">{user.phoneNumber}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 text-[13px] text-[#4B4B4B] font-medium">
                    {user.createdAt ? (
                      <span className="flex items-center justify-center md:justify-start gap-1.5">
                        <Package className="h-4 w-4 shrink-0 text-[#444444]" />
                        Member since {format(new Date(user.createdAt), "MMM yyyy")}
                      </span>
                    ) : null}
                    <span className="flex items-center justify-center md:justify-start gap-1.5">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[#444444]" />
                      Regular Customer
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0 shrink-0">
                {!editingProfile && (
                  <Button variant="outline" onClick={() => setEditingProfile(true)} className="w-full md:w-auto text-[13px] font-semibold text-[#FF4B00] border-transparent md:border-transparent md:hover:border-[#FF4B00] hover:bg-[#FFF4EE] rounded-[6px] h-9">
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {editingProfile && (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-8 space-y-4 border-t border-[#E6E6E6] pt-6 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="text-[13px] font-bold mb-1 block text-[#111111]">Name</label>
                  <Input {...profileForm.register("name")} className="rounded-[6px] border-[#E6E6E6] text-[13px] h-10" />
                  {profileForm.formState.errors.name && (
                    <p className="text-[11px] text-[#E53935] mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-[13px] font-bold mb-1 block text-[#111111]">Email</label>
                  <Input type="email" placeholder="your@email.com" {...profileForm.register("email")} className="rounded-[6px] border-[#E6E6E6] text-[13px] h-10" />
                  {profileForm.formState.errors.email && (
                    <p className="text-[11px] text-[#E53935] mt-1">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                {profileMutation.isError && (
                  <p className="text-[12px] text-[#E53935]">{profileMutation.error?.message ?? "Failed to update profile"}</p>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => { setEditingProfile(false); profileMutation.reset() }} className="rounded-[6px] border-[#E6E6E6] h-9 text-[13px] font-semibold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={profileMutation.isPending} className="rounded-[6px] bg-[#FF4B00] hover:bg-[#E84300] text-white h-9 text-[13px] font-semibold">
                    {profileMutation.isPending ? (
                      <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Saving...</>
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
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-[18px] w-[18px] text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Loyalty Points</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-2 mt-2">
                  <span className="text-[36px] font-bold text-[#006B3C] leading-none">{loyaltyPoints?.points ?? 0}</span>
                  <span className="text-[11px] text-[#4B4B4B] font-medium">Points Available</span>
                </div>
                {loyaltyPoints?.tier && (
                  <div className="bg-[#EFF8F1] text-[#276749] text-[10px] font-semibold px-2.5 py-1.5 rounded-[999px] inline-flex items-center gap-1.5 mt-2">
                    <Star className="h-3 w-3" />
                    {loyaltyPoints.tier} Tier
                  </div>
                )}
              </div>
              
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-40 pointer-events-none md:opacity-100 md:right-4">
                <div className="h-[90px] w-[90px] relative">
                  <Image src="/account/star-coin.webp" alt="Loyalty Star" fill sizes="90px" className="object-contain" />
                </div>
              </div>

              <Link href="/account/loyalty" className="mt-8 block relative z-10">
                <Button variant="outline" className="rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[12px] font-semibold h-8 px-4 w-auto">
                  View Rewards
                </Button>
              </Link>
            </Card>

            {/* Favorites */}
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-[18px] w-[18px] text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Favorites</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-1 mt-2">
                  <span className="text-[36px] font-bold text-[#111111] leading-none">{wishlist.length}</span>
                </div>
                <div className="text-[11px] text-[#777777] font-medium mt-1">
                  Favorite Kitchens
                </div>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="bg-[#FFF4EE] h-[90px] w-[90px] rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(255,75,0,0.08)] border-4 border-white">
                  <Heart className="h-10 w-10 text-[#FF4B00]" fill="#FF4B00" />
                </div>
              </div>

              <Link href="/account/favourites" className="mt-8 block relative z-10">
                <Button variant="outline" className="rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[12px] font-semibold h-8 px-4 w-auto">
                  View Favorites
                </Button>
              </Link>
            </Card>

            {/* Referrals */}
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white relative overflow-hidden flex flex-col justify-between h-full">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-[18px] w-[18px] text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Referrals</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-1 mt-2">
                  <span className="text-[36px] font-bold text-[#111111] leading-none">{referralStats?.totalReferrals ?? 0}</span>
                </div>
                <div className="text-[11px] text-[#777777] font-medium mb-3">
                  Friends Referred
                </div>
                <div className="text-[#006B3C] text-[11px] font-bold">
                  You earned {referralStats?.totalPointsEarned ?? 0} points
                </div>
              </div>

              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 pointer-events-none opacity-40 md:opacity-100 md:pr-4">
                 <div className="h-[90px] w-[90px] relative">
                    <Image src="/account/gift-box.webp" alt="Referral Gift" fill sizes="90px" className="object-contain" />
                 </div>
              </div>

              <div className="mt-8 relative z-10">
                <Button variant="outline" onClick={copyReferral} className="rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[12px] font-semibold h-8 px-4 w-auto">
                  Refer & Earn
                </Button>
              </div>
            </Card>
          </div>

          {/* Grid Section 2 (Recent Orders, Saved Addresses, Recent Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recent Orders */}
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Recent Orders</h3>
                </div>
                <Link href="/account/orders" className="text-[13px] font-bold text-[#FF4B00] hover:underline">
                  View All Orders
                </Link>
              </div>
              <div className="flex-1 space-y-4">
                {orders.length === 0 ? (
                  <p className="text-[13px] text-[#777777] py-4 text-center">No recent orders</p>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex gap-3 pb-4 border-b border-[#EEEEEE] last:border-0 last:pb-0">
                      <div className="h-[60px] w-[60px] rounded-[8px] overflow-hidden bg-muted shrink-0 relative">
                        {order.items[0]?.imageUrl ? (
                           <Image src={order.items[0].imageUrl} alt="Food" fill sizes="60px" className="object-cover" />
                        ) : (
                           <div className="w-full h-full bg-[#FFF4EE] flex items-center justify-center text-[#FF4B00]">
                             <Package className="h-6 w-6" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between pt-0.5">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h4 className="font-bold text-[13px] text-[#111111] truncate">{order.kitchenName}</h4>
                          <span className={`text-[10px] font-bold shrink-0 ${
                            order.status === "COMPLETED" ? "text-[#087A3D]" : "text-[#FF4B00]"
                          }`}>
                            {order.status === "COMPLETED" ? "Delivered" : order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B4B4B] truncate leading-tight">
                          {order.items.map(i => i.name).join(", ")}
                        </p>
                        <div className="flex justify-between items-end mt-1.5">
                          <span className="text-[10px] text-[#777777]">Order ID: #{order.id.slice(0, 8).toUpperCase()}</span>
                          <div className="text-right">
                             <div className="text-[9px] text-[#777777] mb-0.5">{format(new Date(order.createdAt), "dd MMM yyyy")}</div>
                             <div className="font-bold text-[12px] text-[#333333]">₹{parseFloat(order.totalAmount).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/account/orders" className="mt-5 block">
                 <Button variant="outline" className="w-full rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[13px] font-semibold h-[40px]">
                   View All Orders
                 </Button>
              </Link>
            </Card>

            {/* Saved Addresses */}
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Saved Addresses</h3>
                </div>
                <Link href="/account/addresses" className="text-[13px] font-bold text-[#FF4B00] hover:underline">
                  View All Addresses
                </Link>
              </div>

              {showAddForm ? (
                <div className="flex-1 flex flex-col justify-center">
                  <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-3 bg-[#FAFAFA] p-4 rounded-[10px] border border-[#E6E6E6]">
                    <Input placeholder="Label (e.g. Home, Work)" {...register("label")} className="h-9 text-[13px] bg-white border-[#E6E6E6] rounded-[6px]" />
                    <Input placeholder="Address line 1 *" {...register("lineOne")} className="h-9 text-[13px] bg-white border-[#E6E6E6] rounded-[6px]" />
                    {errors.lineOne && <p className="text-[10px] text-[#E53935]">{errors.lineOne.message}</p>}
                    <Input placeholder="Address line 2" {...register("lineTwo")} className="h-9 text-[13px] bg-white border-[#E6E6E6] rounded-[6px]" />
                    <Input placeholder="Pincode *" maxLength={6} {...register("pincode")} className="h-9 text-[13px] bg-white border-[#E6E6E6] rounded-[6px]" />
                    {errors.pincode && <p className="text-[10px] text-[#E53935]">{errors.pincode.message}</p>}
                    {addMutation.isError && (
                      <p className="text-[10px] text-[#E53935]">{addMutation.error?.message ?? "Could not save address"}</p>
                    )}
                    <div className="flex gap-2 justify-end pt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddForm(false); addMutation.reset() }} className="h-8 text-[12px] font-semibold text-[#777777]">Cancel</Button>
                      <Button type="submit" size="sm" disabled={addMutation.isPending} className="h-8 text-[12px] font-semibold bg-[#FF4B00] text-white hover:bg-[#E84300] rounded-[6px]">Save</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-[13px] text-[#777777] py-4 text-center">No saved addresses</p>
                  ) : (
                    addresses.slice(0, 2).map((addr) => (
                      <div key={addr.id} className="flex items-start justify-between gap-3 p-4 rounded-[10px] border border-[#E7E7E7] bg-white hover:border-[#CCCCCC] transition-colors relative">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <MapPin className="h-[18px] w-[18px] text-[#999999] shrink-0 mt-0.5" />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-extrabold text-[13px] text-[#111111]">{addr.label || "Address"}</span>
                              {addr.isDefault && <span className="text-[9px] font-bold text-[#287342] bg-[#E7F4E9] px-2 py-0.5 rounded-[999px]">Default</span>}
                            </div>
                            <p className="text-[11px] text-[#4B4B4B] leading-[1.6] truncate whitespace-normal line-clamp-2 pr-6">
                              {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""}, {addr.pincode}
                            </p>
                            <p className="text-[11px] text-[#4B4B4B] mt-1 font-medium">{user.phoneNumber && `+91 ${user.phoneNumber.replace('+91', '').trim()}`}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteMutation.mutate(addr.id)} className="absolute right-4 top-4 shrink-0 w-7 h-7 rounded-md border border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors" aria-label={`Delete address ${addr.label || ""}`}>
                          <Trash2 className="h-[13px] w-[13px]" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {!showAddForm && (
                <div className="mt-5 pt-1">
                   <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[13px] font-semibold h-[40px]">
                     Add New Address
                   </Button>
                </div>
              )}
            </Card>

            {/* Recent Reviews */}
            <Card className="p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-[#E6E6E6] bg-white flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#006B3C]" />
                  <h3 className="font-bold text-[#111111] text-[16px]">Recent Reviews</h3>
                </div>
                <Link href="/account/reviews" className="text-[13px] font-bold text-[#FF4B00] hover:underline">
                  View All Reviews
                </Link>
              </div>
              <div className="flex-1 space-y-4">
                {recentReviews.length === 0 ? (
                   <p className="text-[13px] text-[#777777] py-4 text-center">No recent reviews</p>
                ) : (
                  recentReviews.map((review) => (
                    <div key={review.id} className="flex gap-3 pb-4 border-b border-[#EEEEEE] last:border-0 last:pb-0">
                      <div className="h-[60px] w-[60px] rounded-[8px] overflow-hidden bg-muted shrink-0 relative">
                        {review.imageUrl ? (
                           <Image src={review.imageUrl} alt="Food" fill sizes="60px" className="object-cover" />
                        ) : (
                           <div className="w-full h-full bg-[#FFF4EE] flex items-center justify-center text-[#FF4B00]">
                             <Star className="h-6 w-6" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-[13px] text-[#111111] truncate mb-0.5">{review.kitchenName}</h4>
                        <p className="text-[11px] text-[#4B4B4B] truncate mb-1.5">{review.dish}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-[#FFB000]">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-[#FFB000] text-[#FFB000]" : "fill-transparent text-[#E6E6E6]"}`} />
                             ))}
                          </div>
                          <span className="text-[9px] font-medium text-[#777777] shrink-0 border-l border-[#EEEEEE] pl-2">
                            {format(new Date(review.date), "dd MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 pt-1">
                {rateableOrder ? (
                  <Link href={`/account/rating?orderId=${rateableOrder.id}`} className="block">
                    <Button variant="outline" className="w-full rounded-[6px] border-[#FF4B00] text-[#FF4B00] hover:bg-[#FFF4EE] text-[13px] font-semibold h-[40px]">
                      Write a Review
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="w-full rounded-[6px] border-[#FF4B00] text-[#FF4B00] text-[13px] font-semibold h-[40px] opacity-60">
                    All Orders Reviewed
                  </Button>
                )}
              </div>
            </Card>

          </div>
          
          {/* Footer Features */}
          <div className="mt-8 bg-[#FBF9F7] rounded-[12px] shadow-sm border border-[#E9E5E2] p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-x-0 md:divide-x divide-[#E9E5E2]">
               <div className="flex flex-col items-center gap-2 px-2">
                  <ChefHat className="h-[28px] w-[28px] text-[#FF4B00]" strokeWidth={1.5} />
                  <div>
                    <h5 className="text-[12px] font-bold text-[#111111]">100% Homemade</h5>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">Made with love & care</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <ShieldCheck className="h-[28px] w-[28px] text-[#006B3C]" strokeWidth={1.5} />
                  <div>
                    <h5 className="text-[12px] font-bold text-[#111111]">Hygienic & Safe</h5>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">Verified home kitchens</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <Clock className="h-[28px] w-[28px] text-[#FF4B00]" strokeWidth={1.5} />
                  <div>
                    <h5 className="text-[12px] font-bold text-[#111111]">Pre-book & Save Time</h5>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">Order in advance</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2">
                  <Leaf className="h-[28px] w-[28px] text-[#006B3C]" strokeWidth={1.5} />
                  <div>
                    <h5 className="text-[12px] font-bold text-[#111111]">Fresh Ingredients</h5>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">Sourced daily</p>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 px-2 col-span-2 md:col-span-1">
                  <Users className="h-[28px] w-[28px] text-[#FF4B00]" strokeWidth={1.5} />
                  <div>
                    <h5 className="text-[12px] font-bold text-[#111111]">Support Local Women</h5>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">Empowering homemakers</p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
