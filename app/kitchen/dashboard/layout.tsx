"use client"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getKitchenDashboardData } from "@/actions/dashboard"
import { Spinner } from "@/components/ui/spinner"
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
import { ChefHat, LayoutDashboard, ShoppingBag, Utensils, Wallet, UserCircle, LogOut } from "lucide-react"

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading dashboard">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const kitchen = data.kitchen

  return (
    <SidebarProvider defaultOpen={true}>
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
  )
}
