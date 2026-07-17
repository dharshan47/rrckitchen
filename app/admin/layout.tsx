"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldBan } from "lucide-react";
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";
import { useSession, signOut } from "@/lib/auth-client";
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions";
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
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  ListOrdered,
  ChefHat,
  Truck,
  Users,
  Settings,
  ShieldCheck,
  Utensils,
  LogOut,
  HandCoins,
  Wallet,
  Ticket,
  Percent,
  CreditCard,
  UserPlus,
} from "lucide-react";
import type { AdminPermission } from "@/lib/generated/prisma/client";

const PUBLIC_ADMIN_PATHS = ["/admin/2fa-setup", "/admin/2fa"];

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: AdminPermission
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/menu", label: "Menu Items", icon: Utensils, permission: "MANAGE_CATALOG" },
  { href: "/admin/kitchens", label: "Kitchen Partners", icon: ChefHat, permission: "APPROVE_KYC" },
  { href: "/admin/delivery", label: "Delivery Management", icon: Truck },
  { href: "/admin/payments", label: "Payments", icon: HandCoins, permission: "VIEW_FINANCIALS" },
  { href: "/admin/coupons", label: "Coupon Codes", icon: Percent, permission: "MANAGE_COUPONS" },
  { href: "/admin/payment-offers", label: "Payment Offers", icon: CreditCard, permission: "MANAGE_COUPONS" },
  { href: "/admin/cash-reconciliation", label: "Cash Reconciliation", icon: Wallet, permission: "MANAGE_PAYOUTS" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "BAN_USERS" },
  { href: "/admin/support", label: "Support Tickets", icon: Ticket, permission: "MANAGE_SUPPORT" },
  { href: "/admin/cms", label: "CMS", icon: Settings, permission: "MANAGE_CMS" },
  { href: "/admin/invite", label: "Admin Invites", icon: UserPlus, permission: "MANAGE_ADMINS" },
];

const routePermissionMap: Record<string, AdminPermission | undefined> = {
  "/admin/menu": "MANAGE_CATALOG",
  "/admin/kitchens": "APPROVE_KYC",
  "/admin/payments": "VIEW_FINANCIALS",
  "/admin/coupons": "MANAGE_COUPONS",
  "/admin/payment-offers": "MANAGE_COUPONS",
  "/admin/cash-reconciliation": "MANAGE_PAYOUTS",
  "/admin/customers": "BAN_USERS",
  "/admin/support": "MANAGE_SUPPORT",
  "/admin/cms": "MANAGE_CMS",
  "/admin/invite": "MANAGE_ADMINS",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: permissions = [], isFetching: permLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
    staleTime: 60_000,
  });

  const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.permission || permissions.includes(item.permission)),
    [permissions]
  );

  const currentRoute = Object.keys(routePermissionMap).find((route) => pathname.startsWith(route))
  const requiredPermission = currentRoute ? routePermissionMap[currentRoute] : undefined
  const hasPageAccess = !requiredPermission || permissions.includes(requiredPermission)

  useEffect(() => {
    if (isPending || isPublicPath) return;

    if (!session) {
      router.replace("/admin/2fa");
    } else if (session.user.role !== "admin") {
      router.replace("/");
    } else if (!session.user.twoFactorEnabled) {
      router.replace("/admin/2fa-setup");
    }
  }, [session, isPending, router, isPublicPath, pathname]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex" role="status" aria-label="Loading admin dashboard">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white">
          <div className="border-b border-border px-4 h-16 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex-1 p-3 space-y-1">
            {Array.from({ length: 13 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <div className="border-t border-border p-3">
            <Skeleton className="h-10 w-full rounded-lg" />
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
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="hidden lg:block h-9 w-20 rounded-lg" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-56" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="flex gap-4">
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  if (permLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex" role="status" aria-label="Loading permissions">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white">
          <div className="border-b border-border px-4 h-16 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex-1 p-3 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <div className="border-t border-border p-3">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <><SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar collapsible="offcanvas" side="left">
          <SidebarHeader className="border-b border-border px-4 h-16 flex-row items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">RRC Kitchen Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await signOut(); router.push("/"); }}
              className="w-full h-10 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="flex" />
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Admin</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => { await signOut(); router.push("/"); }}
                  className="hidden lg:flex h-9 px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {hasPageAccess ? children : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldBan className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-semibold text-foreground">Access Restricted</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  You don&apos;t have permission to access this section.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      </SidebarProvider>
      <SwUpdateBanner />
      <PushSubscriptionInit />
    </>
  );
}
