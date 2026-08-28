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
import { ShieldBan, ChevronRight, TrendingUp } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import Image from "next/image";
import {
  useAdminPermissions,
  useAdminNavData,
  useAdminDate,
  useAdminActions,
  useAdminPermissionsQuery,
  useAdminNavDataQuery,
} from "@/stores/adminStore";

import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Bike,
  CreditCard,
  TicketPercent,
  Gift,
  Wallet,
  Users,
  LifeBuoy,
  FileText,
  UserCog,
  Settings,
  LogOut,
  Search,
  Bell,
  CalendarDays,
  LayoutGrid,
  ClipboardList,
  Sparkles,
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
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders" },
  { href: "/admin/menu", label: "Menu Items", icon: ChefHat, permission: "MANAGE_CATALOG" },
  { href: "/admin/kitchens", label: "Kitchen Partners", icon: ChefHat, permission: "APPROVE_KYC" },
  { href: "/admin/delivery", label: "Delivery Management", icon: Bike },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
    permission: "VIEW_FINANCIALS",
    subItems: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard, permission: "VIEW_FINANCIALS" },
      { href: "/admin/payments/coupons", label: "Coupon Codes", icon: TicketPercent, permission: "MANAGE_COUPONS" },
      { href: "/admin/payments/loyalty-coupons", label: "Loyalty Coupons", icon: Gift, permission: "MANAGE_COUPONS" },
      { href: "/admin/payments/payment-offers", label: "Payment Offers", icon: Wallet, permission: "MANAGE_COUPONS" },
    ],
  },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "BAN_USERS" },
  { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy, badgeKey: "support", permission: "MANAGE_SUPPORT" },
  {
    href: "/admin/content",
    label: "CMS",
    icon: FileText,
    permission: "MANAGE_CMS",
    subItems: [
      { href: "/admin/content/categories", label: "Categories", icon: LayoutGrid, permission: "MANAGE_CMS" },
      { href: "/admin/content/category-pages", label: "Category Pages", icon: ClipboardList, permission: "MANAGE_CMS" },
      { href: "/admin/content/cravings-popup", label: "Cravings Popup", icon: Sparkles, permission: "MANAGE_CMS" },
      { href: "/admin/content/kitchen-page", label: "Kitchen Page", icon: ChefHat, permission: "MANAGE_CMS" },
      { href: "/admin/content/menu-page", label: "Menu Page", icon: ShoppingBag, permission: "MANAGE_CMS" },
      { href: "/admin/content/search-page", label: "Search Page", icon: Search, permission: "MANAGE_CMS" },
    ],
  },
  { href: "/admin/invite", label: "Admin Invites", icon: UserCog, permission: "MANAGE_ADMINS" },
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
  "/admin/content/categories": "MANAGE_CMS",
  "/admin/content/category-pages": "MANAGE_CMS",
  "/admin/content/cravings-popup": "MANAGE_CMS",
  "/admin/content/kitchen-page": "MANAGE_CMS",
  "/admin/content/menu-page": "MANAGE_CMS",
  "/admin/content/search-page": "MANAGE_CMS",
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

function LayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex w-full font-sans">
      <div className="w-[280px] border-r border-[#E5E7EB] bg-[#FFFFFF] hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-6 h-[80px] pt-6 pb-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 flex-1 px-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 h-[48px] rounded-[14px]">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-[14px]" />
          <Skeleton className="h-32 w-full rounded-[14px]" />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[80px] border-b border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between px-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-60 rounded-xl hidden md:block" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Skeleton className="h-10 w-64 rounded-md mb-6" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
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
  const { setDate, resetAdminState } = useAdminActions();

  const { isFetching: permLoading } = useAdminPermissionsQuery();
  useAdminNavDataQuery({
    enabled: !!session && session.user.role === "admin",
  });

  const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  const visibleNavItems = useMemo(() => {
    return navItems
      .map((item) => ({
        ...item,
        subItems: item.subItems
          ? item.subItems.filter((sub) => !sub.permission || permissions.includes(sub.permission))
          : undefined,
      }))
      .filter((item) => {
        if (item.permission && !permissions.includes(item.permission)) return false;
        if (item.subItems && item.subItems.length === 0) return false;
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
      <div className="min-h-screen bg-[#F9FAFB] flex w-full font-sans text-slate-900">
        <Sidebar collapsible="offcanvas" side="left" className="bg-[#FFFFFF] border-r border-[#E5E7EB] w-[280px]">
          <SidebarHeader className="h-[80px] px-6 flex-row items-center gap-3 border-none pt-[22px] pb-[10px]">
            <div className="flex items-center justify-center">
              <ChefHat className="h-[36px] w-[36px] text-[#F97316]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[24px] font-bold tracking-tight leading-none flex items-center gap-1.5">
                <span className="text-[#F97316]">RRC</span>
                <span className="text-[#15803D]">Kitchen</span>
              </span>
              <span className="text-[13px] text-[#6B7280] font-medium mt-1">Admin Panel</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-3 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full pr-2">
              <SidebarMenu className="gap-1.5">
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
                              asChild
                              isActive={isActive}
                              className={`h-[48px] px-[16px] py-[12px] rounded-[14px] font-medium text-[15px] transition-all duration-200 cursor-pointer ${
                                isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-transparent text-[#374151] hover:bg-[#F9FAFB]"
                              }`}
                            >
                              <div className="flex items-center w-full group">
                                <item.icon className={`h-[20px] w-[20px] mr-[12px] ${isActive ? "text-[#15803D]" : "text-[#6B7280]"}`} strokeWidth={2} />
                                <span>{item.label}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-[#6B7280]" />
                              </div>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="mt-1.5 gap-1.5 border-none ml-0 pl-0">
                              {item.subItems.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                  <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                      className={`h-[48px] px-[16px] py-[12px] rounded-[14px] font-medium text-[15px] transition-all duration-200 ${
                                        isSubActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-transparent text-[#374151] hover:bg-[#F9FAFB]"
                                      }`}
                                    >
                                      <Link href={subItem.href} className="flex items-center w-full">
                                        {subItem.icon && <subItem.icon className={`h-[20px] w-[20px] mr-[12px] ${isSubActive ? "text-[#15803D]" : "text-[#6B7280]"}`} strokeWidth={2} />}
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
                        className={`h-[48px] px-[16px] py-[12px] rounded-[14px] font-medium text-[15px] transition-all duration-200 ${
                          isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-transparent text-[#374151] hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <Link href={item.href} className="flex items-center w-full">
                          <item.icon className={`h-[20px] w-[20px] mr-[12px] ${isActive ? "text-[#15803D]" : "text-[#6B7280]"}`} strokeWidth={2} />
                          <span>{item.label}</span>
                          {"badge" in item && item.badge ? (
                            <div className="ml-auto flex items-center justify-center bg-white border border-[#F97316] text-[#F97316] text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[24px]">
                              {item.badge}
                            </div>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          
          <SidebarFooter className="px-3 pb-3 pt-1 border-t-0 border-transparent">
            {/* Today's Earnings Card */}
            <div className="bg-[#F0FDF4] border-none rounded-[12px] p-3 mb-2">
              <p className="text-[12px] font-medium text-[#6B7280] mb-0.5">Today&apos;s Earnings</p>
              <h4 className="text-[18px] font-bold text-slate-900 leading-tight">₹{earnings.toLocaleString('en-IN')}</h4>
              {earningsTrend !== null ? (
                <p className="text-[11px] font-bold text-[#15803D] flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" strokeWidth={3} />
                  {earningsTrend >= 0 ? "+" : ""}{earningsTrend.toFixed(1)}%
                  <span className="text-[#6B7280] font-medium ml-1">vs yesterday</span>
                </p>
              ) : (
                <p className="text-[11px] font-medium text-[#6B7280] mt-1">No yesterday data yet</p>
              )}
              <div className="h-8 mt-2 w-full bg-gradient-to-t from-[#15803D]/20 to-transparent relative rounded-b flex items-end">
                {weeklySeries.length >= 2 ? (
                  <Sparkline data={weeklySeries} color="#15803D" />
                ) : (
                  <Skeleton className="h-8 w-full rounded" />
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div className="border border-[#E5E7EB] rounded-[12px] p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8 bg-[#15803D] text-white">
                    {session.user.image ? (
                      <AvatarImage asChild src={session.user.image} alt={displayName}>
                        <Image
                          src={session.user.image}
                          alt={displayName}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </AvatarImage>
                    ) : (
                      <AvatarFallback className="bg-[#15803D] text-white font-bold text-xs">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-[#15803D] border-[2px] border-white rounded-full" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[13px] font-bold text-slate-900 truncate">{displayName}</span>
                  <span className="text-[11px] text-[#6B7280] font-medium truncate">
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>
              <div className="h-px bg-[#E5E7EB] my-3" />
              <div className="flex items-center justify-around h-6">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none hover:bg-slate-50 h-full text-[#4B5563] p-0"
                  onClick={() => router.push("/admin/invite")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-[#E5E7EB]" />
                <Button
                  variant="ghost"
                  onClick={async () => { resetAdminState(); await signOut(); router.push("/"); }}
                  className="flex-1 rounded-none hover:bg-slate-50 h-full text-[#4B5563] hover:text-red-600 p-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between px-6 h-[80px]">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="flex h-10 w-10 text-[#4B5563] hover:text-slate-900 hover:bg-slate-100 rounded-full" />
              </div>

              <div className="flex items-center gap-6">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="hidden md:flex h-[44px] border-[#E5E7EB] text-[#374151] font-semibold rounded-[12px] hover:bg-slate-50 justify-start text-left min-w-[240px]"
                    >
                      <CalendarDays className="mr-2 h-[20px] w-[20px] text-[#4B5563]" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
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

                <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#4B5563] hover:text-slate-900 rounded-full h-10 w-10"
                    onClick={() => router.push("/admin/support")}
                  >
                    <Search className="h-[20px] w-[20px]" />
                  </Button>
                  <Link href="/admin/support">
                    <div className="relative flex items-center justify-center h-10 w-10 hover:bg-slate-100 rounded-full cursor-pointer">
                      <Bell className="h-[20px] w-[20px] text-[#4B5563]" />
                      {(navData?.attentionCount ?? 0) > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-[16px] min-w-[16px] rounded-full bg-[#EF4444] text-[10px] font-bold text-white flex items-center justify-center px-1">
                          {navData?.attentionCount ?? 0}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="relative ml-2">
                    <Avatar className="h-[44px] w-[44px] bg-[#15803D] shadow-sm">
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
                        <AvatarFallback className="bg-[#15803D] text-white font-bold">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-[#15803D] border-[2px] border-white rounded-full" />
                  </div>
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