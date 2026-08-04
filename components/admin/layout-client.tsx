"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ShieldBan, Calendar as CalendarIcon, ChevronRight, TrendingUp } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions";
import { getAdminNavData } from "@/actions/admin/admin-nav";
import {
  useAdminPermissions,
  useAdminNavData,
  useAdminDate,
  useAdminActions,
} from "@/stores/adminStore";

import {
  LayoutDashboard,
  ListOrdered,
  ChefHat,
  Truck,
  Users,
  Settings,
  LogOut,

  HandCoins,
  Ticket,
  Percent,
  CreditCard,
  UserPlus,
  Coins,
  MenuSquare,
  Search,
  Bell,
  ConciergeBell,
} from "lucide-react";
import type { AdminPermission } from "@/lib/generated/prisma/client";

const PUBLIC_ADMIN_PATHS = ["/admin/2fa-setup", "/admin/2fa"];

interface SubNavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  permission?: AdminPermission;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  permission?: AdminPermission;
  badgeKey?: "orders" | "support";
  badge?: number;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered, badgeKey: "orders" },
  { href: "/admin/menu", label: "Menu Items", icon: MenuSquare, permission: "MANAGE_CATALOG" },
  { href: "/admin/kitchens", label: "Kitchen Partners", icon: ChefHat, permission: "APPROVE_KYC" },
  { href: "/admin/delivery", label: "Delivery Management", icon: Truck },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: HandCoins,
    permission: "VIEW_FINANCIALS",
    subItems: [
      { href: "/admin/payments/coupons", label: "Coupon Codes", icon: Percent, permission: "MANAGE_COUPONS" },
      { href: "/admin/payments/loyalty-coupons", label: "Loyalty Coupons", icon: Coins, permission: "MANAGE_COUPONS" },
      { href: "/admin/payments/payment-offers", label: "Payment Offers", icon: CreditCard, permission: "MANAGE_COUPONS" },
    ],
  },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "BAN_USERS" },
  { href: "/admin/support", label: "Support Tickets", icon: Ticket, badgeKey: "support", permission: "MANAGE_SUPPORT" },
  {
    href: "/admin/content",
    label: "Content",
    icon: Settings,
    permission: "MANAGE_CMS",
    subItems: [
      { href: "/admin/content/categories", label: "Categories", permission: "MANAGE_CMS" },
      { href: "/admin/content/category-pages", label: "Category Pages", permission: "MANAGE_CMS" },
      { href: "/admin/content/cravings-popup", label: "Cravings Popup", icon: ConciergeBell, permission: "MANAGE_CMS" },
    ],
  },
  { href: "/admin/invite", label: "Admin Invites", icon: UserPlus, permission: "MANAGE_ADMINS" },
];

const routePermissionMap: Record<string, AdminPermission | undefined> = {
  "/admin/menu": "MANAGE_CATALOG",
  "/admin/kitchens": "APPROVE_KYC",
  "/admin/payments": "VIEW_FINANCIALS",
  "/admin/payments/coupons": "MANAGE_COUPONS",
  "/admin/payments/loyalty-coupons": "MANAGE_COUPONS",
  "/admin/payments/payment-offers": "MANAGE_COUPONS",
  "/admin/customers": "BAN_USERS",
  "/admin/support": "MANAGE_SUPPORT",
  "/admin/content": "MANAGE_CMS",
  "/admin/invite": "MANAGE_ADMINS",
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = 100 / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * stepX).toFixed(1)},${(28 - ((v - min) / range) * 26).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------- Layout Skeleton (exact shape) ------------------------- */

function LayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar skeleton */}
      <div className="w-72 border-r bg-white p-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-2 h-16 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-2.5 w-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { w: "w-36", icon: "h-8 w-8" },
            { w: "w-32", icon: "h-8 w-8" },
            { w: "w-40", icon: "h-8 w-8" },
            { w: "w-36", icon: "h-8 w-8" },
            { w: "w-44", icon: "h-8 w-8" },
            { w: "w-32", icon: "h-8 w-8" },
            { w: "w-36", icon: "h-8 w-8" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className={row.w} />
            </div>
          ))}
        </div>
        {/* earnings card skeleton */}
        <Skeleton className="h-28 w-full rounded-xl mb-4" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-2.5 w-14 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Main skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b bg-white flex items-center justify-between px-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-60 rounded-lg hidden md:block" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div>
            <Skeleton className="h-7 w-64 rounded-md" />
            <Skeleton className="h-4 w-80 rounded-md mt-2" />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="text-right space-y-2">
                    <Skeleton className="h-3 w-20 rounded-md ml-auto" />
                    <Skeleton className="h-6 w-16 rounded-md ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const permissions = useAdminPermissions();
  const navData = useAdminNavData();
  const date = useAdminDate();
  const { setDate, resetAdminState, setPermissions, setNavData } = useAdminActions();

  const { data: permissionsData, isFetching: permLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: getCurrentAdminPermissions,
    staleTime: 60_000,
  });

  const { data: navDataResponse } = useQuery({
    queryKey: ["admin-nav"],
    queryFn: getAdminNavData,
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: !!session && session.user.role === "admin",
  });

  useEffect(() => {
    if (permissionsData) setPermissions(permissionsData);
  }, [permissionsData, setPermissions]);

  useEffect(() => {
    if (navDataResponse) setNavData(navDataResponse);
  }, [navDataResponse, setNavData]);

  const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  const visibleNavItems = useMemo(() => {
    return navItems
      .filter((item) => {
        if (item.permission && !permissions.includes(item.permission)) return false;
        if (item.subItems) {
          item.subItems = item.subItems.filter(
            (sub) => !sub.permission || permissions.includes(sub.permission)
          );
          if (item.subItems.length === 0) return false;
        }
        return true;
      })
      .map((item) => {
        const badge =
          item.badgeKey === "orders"
            ? navData?.pendingOrders ?? 0
            : item.badgeKey === "support"
            ? navData?.openTickets ?? 0
            : undefined;
        if (badge === undefined) return item;
        return { ...item, badge };
      });
  }, [permissions, navData]);

  const currentRoute = Object.keys(routePermissionMap).find((route) => pathname.startsWith(route));
  const requiredPermission = currentRoute ? routePermissionMap[currentRoute] : undefined;
  const hasPageAccess = !requiredPermission || permissions.includes(requiredPermission);

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

  if (isPending || permLoading) {
    return <LayoutSkeleton />;
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  const displayName = session.user.name || "Admin";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isSuperAdmin =
    permissions.includes("MANAGE_ADMINS") &&
    permissions.includes("VIEW_FINANCIALS");

  const earnings = navData?.todayRevenue ?? 0;
  const earningsTrend = navData?.trend ?? null;
  const weeklySeries = navData?.weeklyTrend?.map((w) => w.value) ?? [];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#f9fafb] flex w-full font-sans text-slate-900">
        <Sidebar collapsible="offcanvas" side="left" className="bg-white border-r border-slate-200">
          <SidebarHeader className="h-20 px-6 flex-row items-center gap-3 border-b border-transparent">
            <div className="flex items-center justify-center p-1">
              <ChefHat className="h-8 w-8 text-[#f97316]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800">RRC Kitchen</span>
              <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-6">
            <SidebarMenu className="gap-2">
              {visibleNavItems.map((item) => {
                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

                if (item.subItems) {
                  return (
                    <Collapsible
                      key={item.label}
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`h-11 px-4 font-semibold rounded-xl transition-all duration-200 ${
                              isActive ? "bg-[#10b981]/10 text-[#10b981]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <item.icon className="h-5 w-5 mr-1" strokeWidth={2} />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mt-1 gap-1 border-l-2 border-slate-100 ml-6 pl-3">
                            {item.subItems.map((subItem) => {
                              const isSubActive = pathname === subItem.href;
                              return (
                                <SidebarMenuSubItem key={subItem.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={`h-10 px-3 font-medium rounded-lg transition-colors ${
                                      isSubActive ? "bg-[#10b981]/10 text-[#10b981]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                  >
                                    <Link href={subItem.href}>
                                      {subItem.icon && <subItem.icon className="h-4 w-4 mr-2 opacity-70" />}
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 px-4 font-semibold rounded-xl transition-all duration-200 ${
                        isActive ? "bg-[#10b981]/10 text-[#10b981] shadow-sm shadow-[#10b981]/10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5 mr-1" strokeWidth={2} />
                        <span>{item.label}</span>
                        {"badge" in item && item.badge ? (
                          <div className="ml-auto flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </div>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-transparent space-y-4">
            {/* Today's Earnings Card */}
            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 mb-1">Today&apos;s Earnings</p>
              <h4 className="text-xl font-bold text-slate-900">₹{earnings.toLocaleString()}</h4>
              {earningsTrend !== null ? (
                <p className="text-xs font-semibold text-[#10b981] flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {earningsTrend >= 0 ? "+" : ""}{earningsTrend.toFixed(1)}%
                  <span className="text-slate-400 font-medium ml-1">vs yesterday</span>
                </p>
              ) : (
                <p className="text-xs font-medium text-slate-400 mt-1">No yesterday data yet</p>
              )}
              <div className="h-10 mt-3 w-full bg-gradient-to-t from-[#10b981]/20 to-transparent relative rounded-b flex items-end">
                {weeklySeries.length >= 2 ? (
                  <Sparkline data={weeklySeries} color="#10b981" />
                ) : (
                  <Skeleton className="h-10 w-full rounded" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-[#10b981] shadow-md shadow-[#10b981]/30">
                  {session.user.image ? (
                    <AvatarImage asChild src={session.user.image} alt={displayName}>
                      <Image
                        src={session.user.image}
                        alt={displayName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </AvatarImage>
                  ) : (
                    <AvatarFallback className="bg-[#10b981] text-white font-bold">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{displayName}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-700 h-8 w-8"
                  onClick={() => router.push("/admin/invite")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => { resetAdminState(); await signOut(); router.push("/"); }}
                  className="text-slate-400 hover:text-red-600 h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 h-20">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="flex h-10 w-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full" />
              </div>

              <div className="flex items-center gap-6">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="hidden md:flex h-11 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 justify-start text-left w-[260px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="end">
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-900 rounded-full h-10 w-10"
                    onClick={() => router.push("/admin/support")}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Link href="/admin/support">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-900 rounded-full h-10 w-10"
                      >
                        <Bell className="h-5 w-5" />
                      </Button>
                      {(navData?.attentionCount ?? 0) > 0 && (
                        <span className="absolute top-1.5 right-2 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                          {navData!.attentionCount! > 9 ? "9+" : navData!.attentionCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <Avatar className="h-10 w-10 bg-[#10b981] ml-2 shadow-sm shadow-[#10b981]/30">
                    {session.user.image ? (
                      <AvatarImage asChild src={session.user.image} alt={displayName}>
                        <Image
                          src={session.user.image}
                          alt={displayName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </AvatarImage>
                    ) : (
                      <AvatarFallback className="bg-[#10b981] text-white font-bold">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {hasPageAccess ? children : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldBan className="h-16 w-16 text-slate-200 mb-6" />
                <p className="text-2xl font-bold text-slate-800">Access Restricted</p>
                <p className="text-base text-slate-500 mt-2 max-w-sm">
                  You don&apos;t have permission to access this section. Please contact your administrator.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}