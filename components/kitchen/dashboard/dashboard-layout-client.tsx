"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signOut } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { getKitchenDashboardData } from "@/actions/admin/dashboard"
import { useKitchenDashboardActions } from "@/stores/kitchenDashboardStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/sidebar"
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner"
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init"
import { 
  LayoutDashboard, ShoppingBag, Utensils, Wallet, 
  UserCircle, LogOut, Ticket, Calendar, Bell, 
  ChevronDown, Headset, CheckCircle2, Star
} from "lucide-react"

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setData, reset } = useKitchenDashboardActions()

  const { data, isLoading } = useQuery({
    queryKey: ["kitchen-dashboard"],
    queryFn: getKitchenDashboardData,
    refetchInterval: 15_000,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data) setData(data)
  }, [data, setData])

  useEffect(() => {
    if (!data && !isLoading) {
      router.push("/kitchen/login")
    }
  }, [data, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex" role="status" aria-label="Loading dashboard">
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-white">
          {/* Logo */}
          <div className="border-b border-border px-6 h-20 flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          {/* Nav items */}
          <div className="flex-1 px-4 py-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 h-11 rounded-xl">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          {/* Footer: support card + user row + logout */}
          <div className="border-t border-border p-4 space-y-4">
            <div className="bg-[#F8FAFC] rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-6 w-full rounded-xl" />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-[#F8FAFC]">
            <div className="flex items-center justify-between px-6 lg:px-10 h-[92px]">
              <div className="flex items-center gap-3">
                <Skeleton className="lg:hidden h-10 w-10 rounded-lg" />
              </div>
              <div className="flex items-center gap-4 lg:gap-6">
                <Skeleton className="hidden lg:block h-11 w-48 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-gray-200">
                  <Skeleton className="h-[42px] w-[42px] rounded-full" />
                  <div className="space-y-1.5 mr-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
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

  const kitchen = data.kitchen

  const handleLogout = async () => {
    reset()
    await signOut()
    router.push("/")
  }

  const isVerified = kitchen.status === "APPROVED" || kitchen.status === "ACTIVE"
  const ordersBadge = data.stats.todayPending

  const navItems = [
    { href: "/kitchen/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/kitchen/dashboard/menu", label: "Menu", icon: Utensils },
    { href: "/kitchen/dashboard/orders", label: "Orders", icon: ShoppingBag, badge: ordersBadge > 0 ? String(ordersBadge) : undefined },
    { href: "/kitchen/dashboard/payments", label: "Payments", icon: Wallet },
    { href: "/kitchen/dashboard/reviews", label: "Reviews", icon: Star },
    { href: "/kitchen/dashboard/support", label: "Support", icon: Ticket },
    { href: "/kitchen/dashboard/profile", label: "Profile", icon: UserCircle },
  ]

  return (
    <>
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#F8FAFC] flex w-full font-sans">
        <Sidebar collapsible="offcanvas" side="left" className="bg-white border-r border-gray-100">
          <SidebarHeader className="px-6 py-6 h-auto flex flex-col items-center justify-center">
            <Link href="/kitchen/dashboard" className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold tracking-tight flex items-center gap-1.5">
                <span className="text-[#FF6B00]">RRC</span>
                <span className="text-[#10B981]">Kitchen</span>
              </div>
              <span className="text-[11px] text-gray-500 italic font-medium">Every Homemaker is a Chef</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4 mt-2">
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-11 px-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] hover:text-[#059669]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-[#10B981]' : 'text-gray-400'}`} />
                          <span className="font-medium text-[15px]">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge className="bg-[#FFE4D6] text-[#FF6B00] hover:bg-[#FFE4D6] border-none px-2 py-0.5 text-xs font-bold rounded-full">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4">
            <div className="bg-[#F8FAFC] rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-[#10B981] mb-1">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-gray-900">Need Help?</h4>
                <p className="text-xs text-gray-500 mt-1">We&apos;re here to support you</p>
              </div>
              <Button asChild variant="outline" className="w-full bg-white text-[#10B981] border-[#10B981] hover:bg-green-50 rounded-xl h-10 text-sm font-semibold transition-all">
                <Link href="/kitchen/dashboard/support">Contact Support</Link>
              </Button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                    <AvatarImage src={kitchen.imageUrl ?? undefined} alt={kitchen.displayName || "Kitchen"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {kitchen.displayName?.charAt(0) || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900 leading-tight">{kitchen.displayName}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Kitchen Partner</span>
                  </div>
                </div>
              </div>
              
              {isVerified && (
                <div className="px-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#ECFDF5] text-[#10B981] px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold">Verified Kitchen</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-3 mt-2 rounded-xl text-[14px] font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 bg-[#F8FAFC] md:bg-[#F8FAFC]/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 lg:px-10 h-[92px]">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex lg:hidden bg-white shadow-sm border border-gray-100 h-10 w-10 rounded-lg text-gray-600" />
              </div>
              
              <div className="flex items-center gap-4 lg:gap-6 ml-auto">
                <div className="hidden lg:flex items-center gap-2 bg-white border border-gray-200 rounded-xl h-11 px-4 shadow-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-[13px] font-medium text-gray-700">
                    Today, {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="relative p-2 rounded-full transition-colors" title="Notifications">
                  <Bell className="h-[22px] w-[22px] text-gray-600" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-gray-200 cursor-pointer group">
                      <Avatar className="h-[42px] w-[42px] border-2 border-white shadow-sm group-hover:border-gray-100 transition-all">
                        <AvatarImage src={kitchen.imageUrl ?? undefined} alt={kitchen.displayName || "Kitchen"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {kitchen.displayName?.charAt(0) || "K"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col mr-1">
                        <span className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{kitchen.displayName}</span>
                        <span className="text-[11px] text-gray-500 font-medium">Kitchen Partner</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-bold">{kitchen.displayName || "Kitchen Partner"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/kitchen/dashboard/profile" className="cursor-pointer">
                        <UserCircle className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/kitchen/dashboard/support" className="cursor-pointer">
                        <Ticket className="h-4 w-4" /> Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
        .animate-wave {
          animation: wave 2.5s infinite;
        }
      `}} />
      <SwUpdateBanner />
      <PushSubscriptionInit />
    </>
  )
}
