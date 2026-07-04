"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/menu", label: "Menu Items", icon: Utensils },
  { href: "/admin/kitchens", label: "Kitchen Partners", icon: ChefHat },
  { href: "/admin/delivery", label: "Delivery Management", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/cms", label: "CMS", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">RRC Kitchen Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    asChild
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <div className="border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-bold">Super Admin Dashboard</h1>
              <div className="ml-auto">
                <Badge variant="secondary">Super Admin</Badge>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
