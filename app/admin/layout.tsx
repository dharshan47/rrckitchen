"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";
import { useSession, signOut } from "@/lib/auth-client";
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

const PUBLIC_ADMIN_PATHS = ["/admin/2fa-setup", "/admin/2fa"];

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/menu", label: "Menu Items", icon: Utensils },
  { href: "/admin/kitchens", label: "Kitchen Partners", icon: ChefHat },
  { href: "/admin/delivery", label: "Delivery Management", icon: Truck },
  { href: "/admin/payments", label: "Payments", icon: HandCoins },
  { href: "/admin/coupons", label: "Coupon Codes", icon: Percent },
  { href: "/admin/payment-offers", label: "Payment Offers", icon: CreditCard },
  { href: "/admin/cash-reconciliation", label: "Cash Reconciliation", icon: Wallet },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/support", label: "Support Tickets", icon: Ticket },
  { href: "/admin/cms", label: "CMS", icon: Settings },
  { href: "/admin/invite", label: "Admin Invites", icon: UserPlus },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading admin dashboard">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
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
            {children}
          </main>
        </div>
      </div>
      </SidebarProvider>
      <SwUpdateBanner />
      <PushSubscriptionInit />
    </>
  );
}
