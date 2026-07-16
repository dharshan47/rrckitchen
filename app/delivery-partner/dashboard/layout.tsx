"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getDeliveryDashboardData } from "@/actions/admin/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { DeliveryPersonLocationBroadcaster } from "@/components/delivery-partner/location-broadcaster"
import { Bike, LayoutDashboard, UserCircle, Wallet, LogOut, Wifi, WifiOff } from "lucide-react"
import { toast } from "sonner"

const DataContext = createContext<Awaited<ReturnType<typeof getDeliveryDashboardData>>>(null)

export function useDeliveryData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useDeliveryData must be used within DeliveryDashboardLayout")
  return ctx
}

const navItems = [
  { href: "/delivery-partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/delivery-partner/dashboard/profile", label: "Profile", icon: UserCircle },
  { href: "/delivery-partner/dashboard/bank-details", label: "Bank Details", icon: Wallet },
]

export default function DeliveryDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOnline, setIsOnline] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-dashboard"],
    queryFn: getDeliveryDashboardData,
    refetchInterval: 20_000,
  })

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
    onError: (err) => {
      toast.error(err.message)
      setIsOnline(!isOnline)
    },
  })

  const handleOnlineToggle = useCallback((checked: boolean) => {
    setIsOnline(checked)
    onlineMutation.mutate(checked)
  }, [onlineMutation])

  const activeOrder = data?.deliveryOrders?.[0]
  const broadcasterOrderId = activeOrder?.id

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
      <div className="min-h-screen bg-gray-50 flex" role="status" aria-label="Loading delivery partner dashboard">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white">
          <div className="border-b border-border px-4 h-16 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex-1 p-3 space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <div className="border-t border-border p-3 space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>
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

  return (
    <><SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar collapsible="offcanvas" side="left">
          <SidebarHeader className="border-b border-border px-4 h-16 flex-row items-center justify-between">
            <Link href="/delivery-partner/dashboard" className="flex items-center gap-2">
              <Bike className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">Delivery Hub</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-3">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleOnlineToggle}
                    disabled={onlineMutation.isPending}
                    aria-label="Toggle online status"
                  />
                  <span className="flex items-center gap-1 text-xs">
                    {isOnline ? (
                      <><Wifi className="h-3 w-3 text-green-600" /> Online</>
                    ) : (
                      <><WifiOff className="h-3 w-3 text-muted-foreground" /> Offline</>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SidebarFooter>
          {isOnline && broadcasterOrderId && data?.profile && (
            <DeliveryPersonLocationBroadcaster
              deliveryPersonId={data.profile.id}
              orderId={broadcasterOrderId}
              enabled={isOnline}
            />
          )}
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex" />
                <div className="hidden sm:flex items-center gap-2">
                  <Bike className="h-5 w-5 text-primary shrink-0" />
                  <h1 className="text-lg font-bold truncate">Delivery Partner Dashboard</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-37.5">
                  Welcome, {profile.name}
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex bg-green-100 text-green-700">
                  Online
                </Badge>
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <DataContext.Provider value={data}>
              {children}
            </DataContext.Provider>
          </main>
        </div>
      </div>
      </SidebarProvider>
      <SwUpdateBanner />
      <PushSubscriptionInit />
    </>
  )
}
