"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { User, ShoppingCart, Home, LayoutDashboard, MapPin, ChevronDown, LogOut, Package } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useCartStore, useMenuDeliveryAddress } from "@/stores";
import { useSession, signOut } from "@/lib/auth-client";
import { LocationDialog } from "@/components/location";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const pathname = usePathname();
  const [locationOpen, setLocationOpen] = useState(false);
  const cartCount = useCartStore((s) => s.cart.reduce((t, i) => t + i.qty, 0));
  const deliveryAddress = useMenuDeliveryAddress();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const cartHref = isLoggedIn ? "/cart" : "/login";

  const isCartPage = pathname === "/cart";
  const isAccountPage = pathname.startsWith("/account/");
  const isMenuDetailPage = pathname.startsWith("/menu/") && pathname !== "/menu";
  const isMenuSlugPage = pathname.startsWith("/menu/category/");
  const hideNav = isCartPage || isMenuDetailPage || isMenuSlugPage || isAccountPage;

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hidden md:block border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-20">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-foreground">
              RRC Kitchen
            </Link>
            <button
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-32">
                {deliveryAddress || "Select location"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 max-w-2xl mx-12">
            <SearchAutocomplete navigateOnFocus />
          </div>

          <div className="flex items-center gap-8">
            {isLoggedIn ? (
              <Link href="/account/profile" className="flex flex-col items-center gap-0.5 group" aria-label="Profile">
                <User className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Profile</span>
              </Link>
            ) : (
              <Link href="/login" className="flex flex-col items-center gap-0.5 group" aria-label="Login">
                <User className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Login</span>
              </Link>
            )}
            <Link href={cartHref} className="flex flex-col items-center gap-0.5 group relative" aria-label="Shopping cart">
              <ShoppingCart className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[10px] font-bold">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      {!hideNav && (
        <header className="sticky top-0 z-50 md:hidden bg-background border-b border-border px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate max-w-40">{deliveryAddress || "Select location"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} variant="destructive" className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="h-8 px-4 rounded-sm font-semibold">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
          <SearchAutocomplete
            navigateOnFocus
            placeholder="Search meals..."
            inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1"
          />
        </header>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border px-2 py-2 flex items-center justify-around shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <MobileNavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" active />
        <MobileNavItem href="/menu" icon={<LayoutDashboard className="h-6 w-6" />} label="Menu" />
        <MobileNavItem href={cartHref} icon={<ShoppingCart className="h-6 w-6" />} label="Cart" badge={cartCount} />
      </nav>
      <div className="h-16 md:hidden" />
        </>
      )}

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}

function MobileNavItem({ href, icon, label, active = false, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: number }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 px-3 py-1 relative",
      active ? "text-primary" : "text-muted-foreground"
    )}>
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge className="absolute top-0 right-2 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[9px] font-bold">
          {badge}
        </Badge>
      )}
    </Link>
  );
}


