"use client"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getKitchenDashboardData } from "@/actions/admin/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
import { ChefHat, LayoutDashboard, ShoppingBag, Utensils, Wallet, UserCircle, LogOut, Ticket } from "lucide-react"

const DataContext = createContext<Awaited<ReturnType<typeof getKitchenDashboardData>>>(null)

export function useKitchenData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useKitchenData must be used within DashboardLayout")
  return ctx
}

const navItems = [
  { href: "/kitchen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kitchen/dashboard/menu", label: "Menu", icon: Utensils },
  { href: "/kitchen/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/kitchen/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/kitchen/dashboard/support", label: "Support", icon: Ticket },
  { href: "/kitchen/dashboard/profile", label: "Profile", icon: UserCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ["kitchen-dashboard"],
    queryFn: getKitchenDashboardData,
    refetchInterval: 15_000,
  })

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  useEffect(() => {
    if (!data && !isLoading) {
      router.push("/kitchen/login")
    }
  }, [data, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex" role="status" aria-label="Loading dashboard">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white">
          <div className="border-b border-border px-4 h-16 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex-1 p-3 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <div className="border-t border-border p-3 space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="hidden sm:block h-5 w-16 rounded-full" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-40 w-full rounded-lg" />
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

  return (
    <><SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar collapsible="offcanvas" side="left">
          <SidebarHeader className="border-b border-border px-4 h-16 flex-row items-center justify-between">
            <Link href="/kitchen/dashboard" className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">Kitchen Hub</span>
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
                <p className="text-sm font-medium truncate">{kitchen.displayName}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mt-0.5">
                  Active
                </Badge>
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
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex" />
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-37.5">
                  Welcome, {kitchen.displayName}
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex bg-green-100 text-green-700">
                  Active
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

          {/* Page Content */}
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
