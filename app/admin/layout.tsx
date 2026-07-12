"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui";
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";
import { useSession, signIn, signOut } from "@/lib/auth-client";
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
  Mail,
  Lock,
  LogIn,
} from "lucide-react";

const PUBLIC_ADMIN_PATHS = ["/admin/2fa-setup", "/admin/2fa"];

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPending || isPublicPath) return;

    if (!session) {
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/");
    } else if (!session.user.twoFactorEnabled) {
      router.replace("/admin/2fa-setup");
    }
  }, [session, isPending, router, isPublicPath, pathname]);

  const handleLogin = async (data: LoginForm) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        setLoginError(result.error.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  };

  if (isPublicPath || isPending) {
    return <>{children}</>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-bold">Admin Sign In</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your email and password
            </p>
          </div>
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@rrckitchen.com"
                  className="pl-9"
                  disabled={loginLoading}
                  {...loginForm.register("email")}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  disabled={loginLoading}
                  {...loginForm.register("password")}
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            {loginError && (
              <p className="text-sm text-destructive text-center">{loginError}</p>
            )}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {loginLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (session.user.role !== "admin") {
    router.replace("/");
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
