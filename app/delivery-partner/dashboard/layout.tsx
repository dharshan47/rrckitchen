"use client"

import { createContext, useContext, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { signOut } from "@/lib/auth-client"
import { getDeliveryDashboardData } from "@/actions/dashboard"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bike, LayoutDashboard, UserCircle, Wallet, LogOut, X, MenuIcon } from "lucide-react"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-dashboard"],
    queryFn: getDeliveryDashboardData,
    refetchInterval: 20_000,
  })

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading delivery partner dashboard">
        <Spinner className="size-8 text-muted-foreground" />
        
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Unauthorized or no delivery partner profile found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = data.profile

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <Link href="/delivery-partner/dashboard" className="flex items-center gap-2">
              <Bike className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">Delivery Hub</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

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

          <div className="p-3 border-t border-border">
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
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
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
                className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-semibold hidden sm:inline">Sign Out</span>
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
  )
}
