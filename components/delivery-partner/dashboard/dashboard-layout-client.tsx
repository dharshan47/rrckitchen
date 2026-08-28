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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner"
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, User, Wallet, LogOut, Truck, Ticket, Bell, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/delivery-partner/dashboard", label: "Dashboard", icon: Home },
  { href: "/delivery-partner/dashboard/deliveries", label: "Deliveries", icon: Truck },
  { href: "/delivery-partner/dashboard/support", label: "Support", icon: Ticket },
  { href: "/delivery-partner/dashboard/profile", label: "Profile", icon: User },
  { href: "/delivery-partner/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/delivery-partner/dashboard/reviews", label: "Reviews", icon: Star },
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
              "h-[48px] rounded-[10px] transition-all duration-200 px-4",
              isActive
                ? "bg-[#F2F7F2] text-[#087B24] hover:bg-[#F2F7F2] hover:text-[#087B24] font-bold"
                : "text-[#111827] hover:bg-[#FBFBFB] hover:text-[#111827] font-semibold"
            )}>
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} className="flex items-center gap-3">
                <item.icon className={cn("h-[22px] w-[22px]", isActive ? "text-[#087B24]" : "text-[#111827]")} />
                <span className="text-[16px] tracking-tight">{item.label}</span>
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
    if (data) {
      setData(data)
      setOnline(data.profile.isOnline)
    }
  }, [data, setData, setOnline])

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
      <div className="min-h-screen bg-[#FBFBFB] flex" role="status" aria-label="Loading delivery partner dashboard">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex w-[18rem] flex-col border-r border-border bg-white">
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
            <Skeleton className="h-[44px] w-[44px] rounded-xl" />
            <div className="flex items-center gap-4 md:gap-6">
              <Skeleton className="hidden sm:block h-[38px] w-28 rounded-xl" />
              <Skeleton className="h-[44px] w-[44px] rounded-full" />
              <Skeleton className="h-[44px] w-[44px] rounded-full" />
            </div>
          </header>

          {/* Main content (child page renders its own matching skeleton) */}
          <main className="flex-1 overflow-y-auto px-4 pb-12 md:px-8">
            {children}
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
  const rating = profile.avgRating
  const reviewCount = profile.totalReviews
  const openTicketCount = data.supportTickets.filter((t) => t.status === "OPEN" || t.status === "INPROGRESS" || t.status === "URGENT").length

  return (
    <>
      <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
        <div className="min-h-screen bg-[#FBFBFB] flex w-full font-sans text-[#111827]">
          <Sidebar collapsible="offcanvas" side="left" className="border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] bg-[#FFFFFF]">
            <SidebarHeader className="px-6 pt-8 pb-6">
              <div className="flex items-center gap-3">
                <Image src="/delivery/sidebar-delivery-header.webp" alt="Delivery Partner" width={48} height={48} className="object-contain" />
                <div className="flex flex-col">
                  <span className="text-[20px] font-bold text-[#008F2D] tracking-tight leading-tight">Delivery Partner</span>
                  <span className="text-[12px] font-medium text-[#374151] leading-tight mt-0.5">Your Earnings, Our Priority</span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full pr-3">
                <SidebarNav />
              </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="px-4 pb-4 mt-auto space-y-3">
              {/* Online Status Toggle Widget */}
                <div className="bg-[#F2F7F2] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-[#008F3A]" : "bg-[#374151]")} />
                      <span className={cn("text-[14px] font-bold", isOnline ? "text-[#087B24]" : "text-[#374151]")}>
                        {isOnline ? "You are Online" : "You are Offline"}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-[#374151] leading-tight">
                      {isOnline ? "Receiving requests" : "Go online to earn"}
                    </span>
                  </div>
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleOnlineToggle}
                    disabled={onlineMutation.isPending}
                    className="data-[state=checked]:bg-[#087B24] scale-110 flex-shrink-0"
                    aria-label="Toggle online status"
                  />
                </div>

                {/* User Profile Widget */}
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E8EAED] overflow-hidden">
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 flex-shrink-0 border border-[#E8EAED]">
                        <AvatarImage src={profileImage} alt={profile.name ?? "Delivery Partner"} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-[#111827] font-semibold">{profile.name?.[0] ?? "D"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[15px] font-bold text-[#111827] truncate">{profile.name}</span>
                        <span className="text-[12px] font-medium text-[#374151] truncate">Delivery Partner</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#374151]">
                      <Star className="h-4 w-4 fill-[#FF9800] text-[#FF9800]" />
                      <span className="text-[#111827] font-bold text-[14px]">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                      <span>({reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"})</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-3 border-t border-[#F1F2F3]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-[8px] rounded-[8px] border border-[#E8EAED] text-[14px] font-bold text-[#111827] hover:bg-[#FBFBFB] transition-all bg-[#FFFFFF]"
                    >
                      <LogOut className="h-5 w-5 text-[#EF1717]" strokeWidth={2.5} />
                      Logout
                    </button>
                  </div>
                </div>
              </SidebarFooter>
          </Sidebar>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-[#FBFBFB] px-4 md:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="flex h-[44px] w-[44px] bg-[#FFFFFF] border border-[#E8EAED] rounded-xl shadow-sm hover:bg-[#FBFBFB] text-[#111827] [&>svg]:w-5 [&>svg]:h-5" />
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                {/* Status Indicator */}
                <div className={cn("hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 border border-[#E8EAED]", isOnline ? "bg-[#F2F7F2] text-[#087B24]" : "bg-[#FBFBFB] text-[#374151]")}>
                  <div className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-[#008F3A]" : "bg-[#374151]")} />
                  <span className="text-[14px] font-bold pr-1">{isOnline ? "Online" : "Offline"}</span>
                </div>
                
                {/* Notifications */}
                <button onClick={() => router.push("/delivery-partner/dashboard/support")} className="relative h-[44px] w-[44px] flex items-center justify-center hover:bg-[#FBFBFB] rounded-full transition-colors border border-[#E8EAED] bg-[#FFFFFF]" aria-label="Open support tickets">
                  <Bell className="h-[22px] w-[22px] text-[#111827]" />
                  {openTicketCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-[20px] w-[20px] bg-[#EF1B18] border-[2px] border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {openTicketCount}
                    </span>
                  )}
                </button>

                {/* Profile Indicator */}
                <div className="flex items-center gap-3 pl-2">
                  <Avatar className="h-[44px] w-[44px] flex-shrink-0 border border-[#E8EAED]">
                    <AvatarImage src={profileImage} alt={profile.name ?? "Delivery Partner"} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-[#111827] font-semibold">{profile.name?.[0] ?? "D"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[15px] font-bold text-[#111827] leading-tight">{profile.name}</span>
                    <span className="text-[12px] font-medium text-[#374151] leading-tight mt-0.5">Delivery Partner</span>
                  </div>
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
