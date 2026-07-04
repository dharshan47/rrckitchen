"use client"

import { createContext, useContext, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getKitchenDashboardData } from "@/actions/dashboard"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, LayoutDashboard, MenuIcon, ShoppingBag, Utensils, Wallet, UserCircle, LogOut, X } from "lucide-react"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["kitchen-dashboard"],
    queryFn: getKitchenDashboardData,
    refetchInterval: 15_000,
  })

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading dashboard">
        <Spinner className="size-8 text-muted-foreground" />
       
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Unauthorized or no kitchen partner profile found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kitchen = data.kitchen

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <Link href="/kitchen/dashboard" className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">Kitchen Hub</span>
            </Link>
            <button className="flex lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border">
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
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <button
                className="flex lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px]">
                Welcome, {kitchen.displayName}
              </span>
              <Badge variant="secondary" className="hidden sm:inline-flex bg-green-100 text-green-700">
                Active
              </Badge>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">Sign Out</span>
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
  )
}
