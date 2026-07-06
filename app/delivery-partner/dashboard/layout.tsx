"use client"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getDeliveryDashboardData } from "@/actions/dashboard"
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
import { Bike, LayoutDashboard, UserCircle, Wallet, LogOut } from "lucide-react"

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

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-dashboard"],
    queryFn: getDeliveryDashboardData,
    refetchInterval: 20_000,
  })

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading delivery partner dashboard">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const profile = data.profile

  return (
    <SidebarProvider defaultOpen={true}>
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
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mt-0.5">
                  Online
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
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px]">
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
  )
}
