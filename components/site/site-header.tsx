"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { User, ShoppingCart, Home, LayoutGrid, MapPin, ChevronDown, LogOut, Package, Bell } from "lucide-react";
import { Badge } from "@/components/ui";
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

const heroCards = [
  { image: "/banners/become-chef.png", href: "/kitchen/signup", alt: "Become a Chef" },
  { image: "/banners/fresh-daily.png", href: "/", alt: "Fresh Daily" },
  { image: "/banners/delivery-with-us.png", href: "/delivery-partner/signup", alt: "Deliver With Us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [locationOpen, setLocationOpen] = useState(false);
  const cartCount = useCartStore((s) => s.cart.reduce((t, i) => t + i.qty, 0));
  const deliveryAddress = useMenuDeliveryAddress();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const cartHref = isLoggedIn ? "/cart" : "/login";

  const isHomePage = pathname === "/";
  const isCategoriesPage = pathname === "/categories";
  const isAccountPage = pathname.startsWith("/account/");
  const isMenuDetailPage = pathname.startsWith("/menu/");
  const hideNav = isMenuDetailPage || isAccountPage || isCategoriesPage;

  const [pastHero, setPastHero] = useState(!isHomePage);
  const [nearFooter, setNearFooter] = useState(false);
  const [categoryFilterActive, setCategoryFilterActive] = useState(false);
  const [notifGranted, setNotifGranted] = useState(() => {
    if (typeof Notification !== "undefined") {
      return Notification.permission === "granted";
    }
    return false;
  });

  const requestNotification = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") return;
    const permission = await Notification.requestPermission();
    setNotifGranted(permission === "granted");
  };

  useEffect(() => {
    const check = () => setCategoryFilterActive(document.body.dataset.categoryFilterActive === "true");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-category-filter-active"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHomePage) return;
    const el = document.getElementById("food-time-heading");
    if (!el) return;
    const handler = () => {
      setPastHero(el.getBoundingClientRect().top <= 0);
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setNearFooter(docHeight - scrollBottom < 150);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isHomePage]);

  const showHero = isHomePage && !pastHero;

  return (
    <>
      {/* Hero section - only visible on home page before scroll */}
      <div className={`${showHero ? '' : 'hidden '} bg-primary`}>
        <div className="hidden md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-20">
            <div className="flex items-center gap-10">
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">RRC Kitchen</Link>
              <button onClick={() => setLocationOpen(true)} className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group">
                <MapPin className="h-4 w-4 text-white/80 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-32">{deliveryAddress || "Select location"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 max-w-2xl mx-12">
              <SearchAutocomplete navigateOnFocus />
            </div>
            <div className="flex items-center gap-8">
              {isLoggedIn ? (
                <Link href="/account/profile" className="flex flex-col items-center gap-0.5 group" aria-label="Profile">
                  <User className="h-6 w-6 text-white group-hover:text-white/70 transition-colors" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white group-hover:text-white/70 transition-colors">Profile</span>
                </Link>
              ) : (
                <Link href="/login" className="flex flex-col items-center gap-0.5 group" aria-label="Login">
                  <User className="h-6 w-6 text-white group-hover:text-white/70 transition-colors" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white group-hover:text-white/70 transition-colors">Login</span>
                </Link>
              )}
              <Link href={cartHref} className="flex flex-col items-center gap-0.5 group relative" aria-label="Shopping cart">
                <ShoppingCart className="h-6 w-6 text-white group-hover:text-white/70 transition-colors" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white group-hover:text-white/70 transition-colors">Cart</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[10px] font-bold">{cartCount}</Badge>
                )}
              </Link>
            </div>
          </div>
        </div>

        {!hideNav && (
          <div className="md:hidden px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <button onClick={() => setLocationOpen(true)} className="flex items-center gap-2 text-sm font-medium text-white/80">
                <MapPin className="h-4 w-4 text-white" />
                <span className="truncate max-w-40">{deliveryAddress || "Select location"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors">
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-40">
                    {isLoggedIn ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer"><User className="h-4 w-4" />Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/orders" className="flex items-center gap-2 cursor-pointer"><Package className="h-4 w-4" />My Orders</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="flex items-center gap-2 cursor-pointer"><User className="h-4 w-4" />Sign In</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={requestNotification} className="flex items-center gap-2 cursor-pointer">
                      <Bell className={`h-4 w-4 ${notifGranted ? "fill-current" : ""}`} />
                      {notifGranted ? "Notifications On" : "Enable Notifications"}
                    </DropdownMenuItem>
                    {isLoggedIn && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} variant="destructive" className="flex items-center gap-2 cursor-pointer"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <SearchAutocomplete navigateOnFocus placeholder="Search meals..." inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1 bg-white text-foreground placeholder:text-muted-foreground border border-border" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-1 sm:pb-10 lg:pb-14">
          <div className="text-center pt-4 sm:pt-6 lg:pt-8 mb-5 sm:mb-8 lg:mb-10">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              <span className="md:whitespace-nowrap">Order fresh home-cooked meals.</span>{' '}
              <span className="text-white/70 md:whitespace-nowrap">Discover local chefs near you.</span>
            </h1>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-3 sm:gap-5">
            {heroCards.map((card) => (
              <Link key={card.alt} href={card.href}>
                <div className="relative w-full aspect-4/3">
                  <Image src={card.image} alt={card.alt} fill className="object-contain" sizes="33vw" loading="eager" />
                </div>
              </Link>
            ))}
          </div>

          <div className="md:hidden mb-3">
            <Link key={heroCards[1].alt} href={heroCards[1].href}>
              <div className="relative w-full aspect-4/3">
                  <Image src={heroCards[1].image} alt={heroCards[1].alt} fill className="object-contain" sizes="(max-width: 768px) calc(100vw - 32px)" loading="eager" />
              </div>
            </Link>
          </div>
          <div className="md:hidden grid grid-cols-2 gap-3">
            {[heroCards[0], heroCards[2]].map((card) => (
              <Link key={card.alt} href={card.href}>
                <div className="relative w-full aspect-4/3">
                  <Image src={card.image} alt={card.alt} fill className="object-contain" sizes="(max-width: 768px) calc(50vw - 22px)" loading="eager" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Desktop Header */}
      <header className={`sticky top-0 z-50 border-b border-border bg-background mb-0 lg:mb-6 ${
        showHero ? 'hidden md:hidden' : 'hidden md:block'
      } ${categoryFilterActive ? 'hidden' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-20">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary">RRC Kitchen</Link>
            <button onClick={() => setLocationOpen(true)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-32">{deliveryAddress || "Select location"}</span>
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">Profile</span>
              </Link>
            ) : (
              <Link href="/login" className="flex flex-col items-center gap-0.5 group" aria-label="Login">
                <User className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">Login</span>
              </Link>
            )}
            <Link href={cartHref} className="flex flex-col items-center gap-0.5 group relative" aria-label="Shopping cart">
              <ShoppingCart className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full p-0 text-[10px] font-bold">{cartCount}</Badge>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      {!hideNav && (
        <header className={`sticky top-0 z-50 md:hidden border-b border-border px-4 py-3 space-y-3 mb-4 ${
          isHomePage ? 'bg-primary': 'bg-background'
        } ${
          isHomePage ? 'hidden' : ''
        }`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setLocationOpen(true)} className={`flex items-center gap-2 text-sm font-medium ${isHomePage ? 'text-white/80' : 'text-muted-foreground'}`}>
              <MapPin className={`h-4 w-4 ${isHomePage ? 'text-white' : 'text-primary'}`} />
              <span className="truncate max-w-40">{deliveryAddress || "Select location"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors ${isHomePage ? 'border-white/30 text-white hover:bg-white/10' : 'border-border hover:bg-muted'}`}><User className="h-5 w-5" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem asChild><Link href="/account/profile" className="flex items-center gap-2 cursor-pointer"><User className="h-4 w-4" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders" className="flex items-center gap-2 cursor-pointer"><Package className="h-4 w-4" />My Orders</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={requestNotification} className="flex items-center gap-2 cursor-pointer">
                    <Bell className={`h-4 w-4 ${notifGranted ? "fill-current" : ""}`} />
                    {notifGranted ? "Notifications On" : "Enable Notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} variant="destructive" className="flex items-center gap-2 cursor-pointer"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${isHomePage ? 'border-white/30 text-white hover:bg-white/10' : 'border-border text-foreground hover:bg-muted'}`}>
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
          <SearchAutocomplete
            navigateOnFocus
            placeholder="Search meals..."
            inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1 bg-white text-foreground placeholder:text-muted-foreground border border-border"
          />
        </header>
      )}

      {/* Sticky Mobile Search Bar - shows after hero, hides near footer (non-home pages) */}
      {!hideNav && pastHero && !nearFooter && !isHomePage && (
        <div className="sticky top-0 z-40 md:hidden bg-background border-b border-border px-4 py-2">
          <SearchAutocomplete
            navigateOnFocus
            placeholder="Search meals..."
            inputClassName="h-10 rounded-lg text-sm pl-10 focus-visible:ring-1 bg-white border border-border"
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border px-2 py-1.5 flex items-center justify-around shadow-[0_-1px_6px_rgba(0,0,0,0.05)]">
            <MobileNavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" active={pathname === "/"} />
            <MobileNavItem href="/categories" icon={<LayoutGrid className="h-5 w-5" />} label="Categories" active={pathname.startsWith("/categories")} />
            <MobileNavItem href={cartHref} icon={<ShoppingCart className="h-5 w-5" />} label="Cart" badge={cartCount} active={pathname === "/cart"} />
          </nav>
          <div className="h-14 md:hidden" />
        </>
      )}

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}

function MobileNavItem({ href, icon, label, active = false, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: number }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-0.5 px-3 py-0.5 relative", active ? "text-primary" : "text-muted-foreground")}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge className="absolute -top-0.5 right-2 h-3.5 min-w-3.5 flex items-center justify-center rounded-full p-0 text-[8px] font-bold">{badge}</Badge>
      )}
    </Link>
  );
}


