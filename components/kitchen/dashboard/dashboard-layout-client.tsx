"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signOut } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { getKitchenDashboardData } from "@/actions/admin/dashboard"
import type { KitchenDashboardData } from "@/actions/admin/dashboard"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner"
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init"
import { 
  UserCircle, LogOut, Ticket, Bell, 
  ChevronDown, Headset, CheckCircle2, Star,
  House, Scissors, BriefcaseBusiness, WalletCards, BadgeHelp, UserRound
} from "lucide-react"

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setData, reset } = useKitchenDashboardActions()

  const { data, isLoading } = useQuery<KitchenDashboardData>({
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
      <div className="h-screen overflow-hidden bg-[#FEFBF9] flex font-sans" role="status" aria-label="Loading dashboard">
        <aside className="hidden lg:flex w-72 flex-col border-r border-[#F0ECE7] bg-[#FEFBF9]">
          {/* Logo */}
          <div className="px-[20px] pt-[25px] pb-[10px] flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          {/* Nav items */}
          <div className="flex-1 px-[20px] mt-[34px] space-y-[10px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-[15px] px-[14px] h-[44px] rounded-[8px]">
                <Skeleton className="h-[20px] w-[20px] rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          {/* Footer: support card + user row + logout */}
          <div className="p-4 space-y-4">
            <Skeleton className="h-[105px] w-full rounded-[10px]" />
            <Skeleton className="h-[188px] w-full rounded-[11px]" />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-[#FEFBF9] border-b border-[#F1EEEA]">
            <div className="flex items-center justify-between px-6 lg:px-10 h-[82px]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="flex items-center gap-7 pr-[8px]">
                <Skeleton className="h-[21px] w-[21px] rounded-full" />
                <div className="hidden lg:flex items-center gap-3">
                  <Skeleton className="h-[42px] w-[42px] rounded-full" />
                  <div className="space-y-1.5 mr-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
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
                  <div key={i} className="rounded-xl border border-[#ECE9E5] bg-[#FFFDFC] p-5 space-y-3">
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
  const pendingOrders = (data.orders ?? []).filter(
    (o) =>
      (o.status || "").toLowerCase().includes("confirm") ||
      (o.status || "").toLowerCase().includes("prepar")
  )
  const openTickets = (data.supportTickets ?? []).filter(
    (t) => t.status === "OPEN"
  )
  
  const ordersBadge = pendingOrders.length
  const notificationCount = pendingOrders.length + openTickets.length

  const orderStatusColor = (status: string) => {
    const s = (status || "").toLowerCase()
    if (s.includes("confirm")) return "text-[#B45309] bg-[#FFF7E6]"
    if (s.includes("prepar")) return "text-[#1D4ED8] bg-[#EFF6FF]"
    if (s.includes("ready") || s.includes("complet") || s.includes("deliver")) return "text-[#086B2F] bg-[#EDF5EA]"
    if (s.includes("cancel") || s.includes("refund")) return "text-[#D83A20] bg-[#FFF0ED]"
    return "text-[#3F454A] bg-[#F1F0EE]"
  }

  const navItems = [
    { href: "/kitchen/dashboard", label: "Dashboard", icon: House },
    { href: "/kitchen/dashboard/menu", label: "Menu", icon: Scissors },
    { href: "/kitchen/dashboard/orders", label: "Orders", icon: BriefcaseBusiness, badge: ordersBadge > 0 ? String(ordersBadge) : undefined },
    { href: "/kitchen/dashboard/payments", label: "Payments", icon: WalletCards },
    { href: "/kitchen/dashboard/reviews", label: "Reviews", icon: Star },
    { href: "/kitchen/dashboard/support", label: "Support", icon: BadgeHelp },
    { href: "/kitchen/dashboard/profile", label: "Profile", icon: UserRound },
  ]

  return (
    <>
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen overflow-hidden bg-[#FEFBF9] flex w-full font-sans">
        <Sidebar collapsible="offcanvas" side="left" className="bg-[#FEFBF9] border-r border-[#F0ECE7]">
          <SidebarHeader className="px-[20px] pt-[25px] pb-[10px] h-auto flex flex-col items-center justify-center">
            <Link href="/kitchen/dashboard" className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold tracking-tight flex items-center gap-1.5" style={{ fontFamily: "cursive" }}>
                <span className="text-[#F4511E]">RRC</span>
                <span className="text-[#086B2F]">Kitchen</span>
              </div>
              <span className="text-[10px] text-[#17191C] font-normal">Every Homemaker is a Chef</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-[20px] mt-[10px] overflow-hidden flex-1">
            <ScrollArea className="h-full w-full pr-2">
            <SidebarMenu className="space-y-[10px] pt-[20px]">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-[44px] px-[14px] rounded-[8px] transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#F1F6F0] text-[#086B2F] font-medium' 
                          : 'bg-transparent text-[#17191C] hover:bg-[#F7F7F3] hover:text-[#086B2F]'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <div className={`flex items-center gap-[15px] ${isActive ? 'ml-[15px] mr-[18px]' : ''}`}>
                          <item.icon className={`h-[20px] w-[20px] stroke-[1.8px] ${isActive ? 'text-[#086B2F] fill-current' : 'text-[#3F454A] group-hover:text-[#086B2F]'}`} />
                          <span className="text-[14px] font-medium leading-[20px]">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge className="bg-[#FFF0EA] text-[#F4511E] hover:bg-[#FFF0EA] border-none w-[25px] h-[22px] flex items-center justify-center text-[11px] font-medium rounded-full p-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="px-[20px] pb-3 space-y-3">
            {/* Help Card */}
            <div className="bg-[#FCFAF7] border border-[#ECE9E5] rounded-[10px] p-[12px] flex flex-col items-center text-center space-y-[6px] w-full mx-auto" style={{ maxWidth: '207px' }}>
              <div className="h-[20px] flex items-center justify-center">
                <Headset className="h-[20px] w-[20px] text-[#086B2F] stroke-[1.8px]" />
              </div>
              <div className="mb-0.5">
                <h4 className="text-[11px] font-semibold text-[#17191C] m-0">Need Help?</h4>
              </div>
              <Button asChild variant="outline" className="w-full bg-[#FFFFFF] text-[#086B2F] border-[#8CB89B] hover:bg-[#F1F6F0] rounded-[6px] h-[26px] text-[10px] font-medium transition-all px-0 mx-auto">
                <Link href="/kitchen/dashboard/support">Contact Support</Link>
              </Button>
            </div>

            {/* Profile Card */}
            <div className="bg-[#FFFDFC] border border-[#ECE9E5] rounded-[11px] w-full mx-auto flex flex-col" style={{ maxWidth: '207px', minHeight: '160px' }}>
              <div className="p-3 pb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#E7E7E5] h-[36px] w-[36px] rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <Avatar className="h-[36px] w-[36px] rounded-full bg-[#E7E7E5]">
                      <AvatarImage src={kitchen.imageUrl ?? undefined} alt={kitchen.displayName || "Kitchen"} className="object-cover" />
                      <AvatarFallback className="bg-[#E7E7E5] text-[#17191C] font-bold text-sm">
                        {kitchen.displayName?.charAt(0) || "K"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-[#17191C] leading-tight truncate w-[100px]">{kitchen.displayName}</span>
                    <span className="text-[9px] font-normal text-[#686A6D]">Kitchen Partner</span>
                  </div>
                </div>
                <ChevronDown className="h-[13px] w-[13px] text-[#3F454A] mt-[10px]" />
              </div>
              
              <div className="px-3 pb-[12px] flex-1">
                {isVerified && (
                  <div className="inline-flex items-center justify-center gap-1 bg-[#EDF5EA] text-[#086B2F] h-[22px] px-[8px] rounded-[5px]">
                    <CheckCircle2 className="h-[10px] w-[10px] stroke-[2.5px]" />
                    <span className="text-[9px] font-medium">Verified Kitchen</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#F0ECE7]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-[6px] w-full px-3 py-[10px] text-[12px] font-medium text-[#17191C] hover:bg-gray-50 transition-all rounded-b-[11px]"
                >
                  <LogOut className="h-[16px] w-[16px] text-[#3F454A] stroke-[1.8px]" />
                  Logout
                </button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 bg-[#FEFBF9] md:bg-[#FEFBF9]/80 backdrop-blur-md border-b border-[#F1EEEA]">
            <div className="flex items-center justify-between px-6 lg:px-10 h-[82px]">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex bg-white shadow-sm border border-[#ECE9E5] h-10 w-10 rounded-lg text-[#3F454A]" />
              </div>
              
              <div className="flex items-center gap-7 pr-[8px] ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative p-2 rounded-full cursor-pointer flex items-center justify-center group" title="Notifications">
                      <Bell className="h-[21px] w-[21px] text-[#34393D] stroke-[1.8px] group-hover:text-[#17191C] transition-colors" />
                      {notificationCount > 0 && (
                        <span className="absolute top-[5px] right-[5px] bg-[#F45B2A] text-white text-[8px] font-bold h-[15px] min-w-[15px] px-0.5 flex items-center justify-center rounded-full z-10">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[340px] max-w-[calc(100vw-2rem)] bg-[#FFFDFC] border-[#ECE9E5] p-0 flex flex-col max-h-[85vh]">
                    <DropdownMenuLabel className="font-semibold text-[13px] text-[#17191C] px-4 py-3 flex items-center justify-between shrink-0">
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <Badge className="bg-[#FFF0EA] text-[#F4511E] hover:bg-[#FFF0EA] border-none h-[20px] px-2 flex items-center justify-center text-[11px] font-medium rounded-full">
                          {notificationCount} new
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#F0ECE7] shrink-0 m-0" />

                    <div className="overflow-y-auto flex-1">
                      {pendingOrders.length > 0 && (
                        <div className="px-4 pt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#686A6D] mb-1">New Orders</p>
                          {pendingOrders.slice(0, 10).map((o) => (
                            <DropdownMenuItem key={o.id} asChild className="hover:bg-[#F1F6F0] focus:bg-[#F1F6F0] px-0 py-2">
                              <Link href="/kitchen/dashboard/orders" className="flex items-start justify-between gap-3 w-full">
                                <div className="min-w-0">
                                  <p className="text-[12px] font-medium text-[#17191C] truncate">{o.itemName} <span className="text-[#686A6D] font-normal">x{o.quantity}</span></p>
                                  <p className="text-[11px] text-[#686A6D] truncate">{o.customerName || "Customer"} · {o.time}</p>
                                </div>
                                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${orderStatusColor(o.status)}`}>{o.status}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent px-0 py-1 mb-1">
                            <Link href="/kitchen/dashboard/orders" className="text-[11px] font-medium text-[#086B2F] w-full">
                              View all orders →
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      )}

                      {openTickets.length > 0 && (
                        <>
                          {pendingOrders.length > 0 && <DropdownMenuSeparator className="bg-[#F0ECE7]" />}
                          <div className="px-4 pt-2 pb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#686A6D] mb-1">Support Tickets</p>
                            {openTickets.slice(0, 5).map((t) => (
                              <DropdownMenuItem key={t.id} asChild className="hover:bg-[#F1F6F0] focus:bg-[#F1F6F0] px-0 py-2">
                                <Link href="/kitchen/dashboard/support" className="flex items-start justify-between gap-3 w-full">
                                  <p className="text-[12px] font-medium text-[#17191C] truncate">{t.subject}</p>
                                  <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full text-[#D83A20] bg-[#FFF0ED]">{t.priority}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent px-0 py-1">
                              <Link href="/kitchen/dashboard/support" className="text-[11px] font-medium text-[#086B2F] w-full">
                                View all tickets →
                              </Link>
                            </DropdownMenuItem>
                          </div>
                        </>
                      )}

                      {notificationCount === 0 && (
                        <div className="px-4 py-8 flex flex-col items-center text-center gap-2">
                          <CheckCircle2 className="h-6 w-6 text-[#086B2F] stroke-[1.8px]" />
                          <p className="text-[13px] font-medium text-[#17191C]">You&apos;re all caught up</p>
                          <p className="text-[11px] text-[#686A6D]">No new orders or open tickets right now</p>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="hidden lg:flex items-center gap-3 cursor-pointer group">
                      <div className="bg-[#E7E7E5] h-[42px] w-[42px] rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(35,35,35,0.03)]">
                        <Avatar className="h-[42px] w-[42px] rounded-full bg-[#E7E7E5]">
                          <AvatarImage src={kitchen.imageUrl ?? undefined} alt={kitchen.displayName || "Kitchen"} className="object-cover" />
                          <AvatarFallback className="bg-[#E7E7E5] text-[#17191C] font-bold text-lg">
                            {kitchen.displayName?.charAt(0) || "K"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col mr-1">
                        <span className="text-[12px] font-semibold text-[#17191C] group-hover:text-[#086B2F] transition-colors leading-tight">{kitchen.displayName}</span>
                        <span className="text-[10px] font-normal text-[#686A6D]">Kitchen Partner</span>
                      </div>
                      <ChevronDown className="h-[15px] w-[15px] text-[#3F454A] group-hover:text-[#17191C] transition-colors" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#FFFDFC] border-[#ECE9E5]">
                    <DropdownMenuLabel className="font-semibold text-[12px] text-[#17191C]">{kitchen.displayName || "Kitchen Partner"}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#F0ECE7]" />
                    <DropdownMenuItem asChild className="hover:bg-[#F1F6F0] focus:bg-[#F1F6F0]">
                      <Link href="/kitchen/dashboard/profile" className="cursor-pointer text-[#17191C] font-medium text-[12px]">
                        <UserCircle className="h-4 w-4 mr-2" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-[#F1F6F0] focus:bg-[#F1F6F0]">
                      <Link href="/kitchen/dashboard/support" className="cursor-pointer text-[#17191C] font-medium text-[12px]">
                        <Ticket className="h-4 w-4 mr-2" /> Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#F0ECE7]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#D83A20] focus:text-[#D83A20] font-medium text-[12px] hover:bg-[#FFF0ED] focus:bg-[#FFF0ED]">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
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
