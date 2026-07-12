"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { User, ShoppingCart, Home, LayoutDashboard, MapPin, ChevronDown, Search } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useMenuStore, FoodTypeFilter, useCartStore, useMenuDeliveryAddress } from "@/stores";
import { useSession } from "@/lib/auth-client";
import { LocationDialog } from "@/components/location";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

const foodTypeOptions: { value: FoodTypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "VEG", label: "Veg" },
  { value: "NONVEG", label: "Non Veg" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [locationOpen, setLocationOpen] = useState(false);
  const selectedFoodType = useMenuStore((s) => s.selectedFoodType);
  const setSelectedFoodType = useMenuStore((s) => s.setSelectedFoodType);
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

        {!isCartPage && !isAccountPage && !isMenuDetailPage && (
          <div className="border-t border-border">
            <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-8 overflow-x-auto scrollbar-none">
              {foodTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedFoodType(opt.value)}
                  className={cn(
                    "flex items-center gap-2 h-full border-b-2 whitespace-nowrap transition-colors",
                    selectedFoodType === opt.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Header */}
      {!hideNav && (
      <header className="sticky top-0 z-50 md:hidden bg-background border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-foreground tracking-tight">
            RRC Kitchen
          </Link>
          {!isLoggedIn && (
            <Button asChild size="sm" className="h-8 px-4 rounded-sm font-semibold">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        <button
          onClick={() => setLocationOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span>{deliveryAddress || "Select location"}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <SearchAutocomplete
          navigateOnFocus
          placeholder="Search meals..."
          inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1"
        />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {foodTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedFoodType(opt.value)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  selectedFoodType === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground/70"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border px-2 py-2 flex items-center justify-around shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <MobileNavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" active />
        <MobileNavItem href="/menu" icon={<LayoutDashboard className="h-6 w-6" />} label="Menu" />
        <MobileNavItem href="/search" icon={<Search className="h-6 w-6" />} label="Search" />
        <MobileNavItem href={isLoggedIn ? "/account/profile" : "/login"} icon={<User className="h-6 w-6" />} label="Account" />
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


