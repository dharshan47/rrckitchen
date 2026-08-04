"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryIsOnline, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import { signOut } from "@/lib/auth-client"
import { getDeliveryDashboardData } from "@/actions/admin/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner"
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init"
import { LayoutDashboard, User, Wallet, LogOut, Truck, Ticket, Bell, ChevronDown, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/delivery-partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/delivery-partner/dashboard/deliveries", label: "Deliveries", icon: Truck },
  { href: "/delivery-partner/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/delivery-partner/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/delivery-partner/dashboard/support", label: "Support", icon: Ticket },
  { href: "/delivery-partner/dashboard/profile", label: "Profile", icon: User },
]

function SidebarNav() {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  return (
    <SidebarMenu className="gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} className={cn(
              "h-12 rounded-xl transition-all duration-200 px-4",
              isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            )}>
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isOnline = useDeliveryIsOnline()
  const { setData, setOnline } = useDeliveryActions()

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-dashboard"],
    queryFn: getDeliveryDashboardData,
    refetchInterval: 20_000,
  })

  useEffect(() => {
    if (data) setData(data)
  }, [data, setData])

  const onlineMutation = useMutation({
    mutationFn: async (online: boolean) => {
      const res = await fetch("/api/delivery/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online }),
      })
      if (!res.ok) throw new Error("Failed to update status")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
    },
    onError: (err, online) => {
      toast.error(err.message)
      setOnline(!online)
    },
  })

  const handleOnlineToggle = useCallback((checked: boolean) => {
    setOnline(checked)
    onlineMutation.mutate(checked)
  }, [setOnline, onlineMutation])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  useEffect(() => {
    if (!data && !isLoading) {
      router.push("/delivery-partner/login")
    }
  }, [data, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex" role="status" aria-label="Loading delivery partner dashboard">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-white">
          {/* Logo */}
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 px-4 space-y-2">
            {navItems.map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>

          {/* Online status toggle */}
          <div className="px-4 pb-4">
            <Skeleton className="h-[72px] w-full rounded-2xl" />
          </div>

          {/* User profile widget */}
          <div className="px-4 pb-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </aside>

        {/* Main Column Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <header className="sticky top-0 z-30 bg-[#f9fafb] px-4 md:px-8 h-20 flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex items-center gap-3 md:gap-5">
              <Skeleton className="hidden sm:block h-9 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto px-4 pb-12 md:px-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
              <div className="space-y-3">
                <Skeleton className="h-9 w-72 max-w-full" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
              <div className="grid lg:grid-cols-5 gap-6">
                <Skeleton className="lg:col-span-3 h-80 rounded-3xl" />
                <Skeleton className="lg:col-span-2 h-80 rounded-3xl" />
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-3xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const profile = data.profile
  const profileImage = profile.imageUrl ?? "/delivery/profile.webp"

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-[#f9fafb] flex w-full font-sans text-slate-900">
          <Sidebar collapsible="offcanvas" side="left" className="border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] bg-white w-72">
            <div className="flex flex-col h-full bg-white">
              {/* Sidebar Header Logo */}
              <div className="px-6 pt-8 pb-6">
                <div className="flex items-center gap-3">
                  <Image src="/delivery/sidebar-delivery-header.webp" alt="Delivery Partner" width={48} height={48} className="object-contain" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-emerald-600 tracking-tight">Delivery Partner</span>
                    <span className="text-[11px] font-medium text-slate-500">Your Earnings, Our Priority</span>
                  </div>
                </div>
              </div>

              <SidebarContent className="px-4 flex-1">
                <SidebarNav />
              </SidebarContent>

              {/* Sidebar Footer Elements */}
              <div className="px-4 pb-6 mt-auto space-y-4">
                {/* Online Status Toggle Widget */}
                <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100/50">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-400")} />
                      <span className={cn("text-sm font-semibold", isOnline ? "text-emerald-700" : "text-slate-600")}>
                        {isOnline ? "You are Online" : "You are Offline"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {isOnline ? "You are receiving delivery requests" : "Go online to start earning"}
                    </span>
                  </div>
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleOnlineToggle}
                    disabled={onlineMutation.isPending}
                    className="data-[state=checked]:bg-emerald-500"
                    aria-label="Toggle online status"
                  />
                </div>

                {/* User Profile Widget */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
<Image src={profileImage} alt={profile.name ?? "Delivery Partner"} width={40} height={40} className="object-cover h-full w-full" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-slate-900 truncate">{profile.name}</span>
                      <span className="text-[11px] font-medium text-slate-500 truncate">Delivery Partner</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-4">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-900 font-bold">{data.stats.rating > 0 ? data.stats.rating : "4.8"}</span>
                    <span className="text-slate-500 font-normal">({data.reviews.length > 0 ? data.reviews.length : "128"} reviews)</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-white hover:text-red-600 hover:border-red-200 transition-all bg-white shadow-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>

            </div>
          </Sidebar>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-[#f9fafb] px-4 md:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="flex h-10 w-10 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-slate-600 [&>svg]:w-5 [&>svg]:h-5" />
              </div>
              
              <div className="flex items-center gap-3 md:gap-5">
                {/* Status Dropdown Indicator */}
                <div className={cn("hidden sm:flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer", isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" : "bg-gray-50 text-slate-500 border-gray-200")}>
                  <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-400")} />
                  <span className="text-sm font-semibold pr-1">{isOnline ? "Online" : "Offline"}</span>
                  <ChevronDown className={isOnline ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-slate-400"} />
                </div>
                
                {/* Notifications */}
                <button className="relative h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Profile Dropdown Indicator */}
                <div className="flex items-center gap-3 cursor-pointer pl-2">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-bold text-slate-900">{profile.name}</span>
                    <span className="text-xs text-slate-500 font-medium">Delivery Partner</span>
                  </div>
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                     <Image src={profileImage} alt={profile.name ?? "Delivery Partner"} width={40} height={40} className="object-cover h-full w-full" />
                  </div>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-12 md:px-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
      <SwUpdateBanner />
      <PushSubscriptionInit />
    </>
  )
}
