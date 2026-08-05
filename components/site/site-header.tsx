"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { User, ShoppingCart, Home, LayoutGrid, MapPin, ChevronDown, LogOut, Package, Bell , HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useMenuDeliveryAddress } from "@/stores";
import { useSession, signOut } from "@/lib/auth-client";
import dynamic from "next/dynamic";
const LocationDialog = dynamic(() => import("@/components/location").then(m => m.LocationDialog), { ssr: false });
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { HeroCarousel } from "@/components/home/hero-carousel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function MobileNavItem({ href, icon, label, active = false, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: number | string }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center justify-center gap-1 px-3 py-1.5 relative min-h-12 min-w-12 transition-colors", active ? "text-[#EE7005]" : "text-gray-500 hover:text-gray-900")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {badge !== undefined && badge !== 0 && (
        <span className="absolute top-1 right-2 h-4 min-w-4 flex items-center justify-center rounded-full bg-[#EE7005] p-0 px-1 text-[9px] font-bold text-white border border-white shadow-sm">{badge}</span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [locationOpen, setLocationOpen] = useState(false);
  const cartCount = useCartStore((s) => s.cart.reduce((t, i) => t + i.qty, 0));
  const deliveryAddress = useMenuDeliveryAddress();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const cartHref = isLoggedIn ? "/cart" : "/login";

  const isHomePage = pathname === "/";
  const isAccountPage = pathname.startsWith("/account/");
  const isMenuDetailPage = pathname.startsWith("/menu/");
  const isSearchPage = pathname === "/search";
  const isCartPage = pathname === "/cart";
  const isHelpPage = pathname === "/help";
  const isSupportPage = pathname === "/support";
  const isCategoriesPage = pathname.startsWith("/categories");
  const hideNav = isMenuDetailPage || isAccountPage || isHelpPage || isSupportPage || isSearchPage || isCategoriesPage;

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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const check = () => setCategoryFilterActive(document.body.dataset.categoryFilterActive === "true");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-category-filter-active"] });
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "CATEGORIES", href: "/categories" },
    { label: "KITCHENS", href: "/kitchens" },
    { label: "ABOUT US", href: "/about-us" },
    { label: "CONTACT US", href: "/contact" },
  ];

  if (isCartPage) {
    return (
      <>
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8 h-14 md:h-16">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-gray-500">SECURE CHECKOUT</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#EE7005] transition-colors">
                <HelpCircle className="h-4 w-4" />
                Help
              </Link>
              {isLoggedIn ? (
                <Link href="/account/profile" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#EE7005] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Profile</span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#EE7005] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </header>
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <MobileNavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" active={false} />
          <MobileNavItem href="/categories" icon={<LayoutGrid className="h-5 w-5" />} label="Categories" active={false} />
          <MobileNavItem href={cartHref} icon={<ShoppingCart className="h-5 w-5" />} label="Cart" badge={cartCount} active={true} />
          <MobileNavItem href="/help" icon={<HelpCircle className="h-5 w-5" />} label="Help" active={false} />
        </nav>
        <div className="h-14 md:hidden" />
      </>
    );
  }

  if (isHelpPage) {
    return (
      <>
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex flex-col items-start leading-none group">
              <Image src="/logo.webp" alt="RRC Kitchen" width={120} height={40} className="h-9 w-auto group-hover:opacity-90 transition-opacity" priority />
            </Link>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="User menu" className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40 font-medium">
                  <DropdownMenuItem asChild><Link href="/account/profile" className="flex items-center gap-2 cursor-pointer text-gray-700"><User className="h-4 w-4" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders" className="flex items-center gap-2 cursor-pointer text-gray-700"><Package className="h-4 w-4" />My Orders</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-bold text-gray-700 hover:border-[#EE7005] hover:text-[#EE7005] transition-colors">
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-white",
          isScrolled ? "shadow-md border-b border-transparent" : "border-b border-gray-100",
          categoryFilterActive ? "hidden md:block" : ""
        )}
      >
        {/* Desktop navbar */}
        <div className="hidden lg:block py-3">
          <div className="mx-auto flex max-w-[1400px] items-center gap-8 xl:gap-12 px-4 sm:px-6 lg:px-8">
            
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex flex-col items-center leading-none group">
                <Image src="/logo.webp" alt="RRC Kitchen" width={220} height={70} className="h-[75px] w-auto group-hover:opacity-90 transition-opacity object-contain" priority />
              </Link>
            </div>

            {/* Right content: Top Row and Bottom Row */}
            <div className="flex-1 flex flex-col justify-between h-[75px] pt-1">
              
              {/* Top Row */}
              <div className="flex items-center justify-between w-full">
                {/* Search and Location */}
                <div className="flex items-center gap-4 xl:gap-6 flex-1 max-w-4xl">
                  <button onClick={() => setLocationOpen(true)} className="flex items-center gap-1.5 text-[15px] font-bold text-black hover:text-[#FF4B00] transition-colors shrink-0 whitespace-nowrap">
                    <MapPin className="h-[18px] w-[18px] text-[#FF4B00]" strokeWidth={2.5} />
                    <span className="truncate max-w-[160px]">{deliveryAddress || "Select Location"}</span>
                    <ChevronDown className="h-4 w-4 text-black" strokeWidth={2.5} />
                  </button>

                  <div className="flex-1 w-full relative">
                    <SearchAutocomplete
                      mobileModal={false}
                      placeholder="Search for meals, kitchens, cuisines..."
                      inputClassName="h-[42px] w-full rounded-lg text-[13px] pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-900 border border-gray-200 placeholder:text-gray-400"
                    />
                   
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 xl:gap-8 shrink-0 ml-8">
                  {isLoggedIn ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 text-[14px] font-bold text-black hover:text-[#FF4B00] transition-colors group">
                          <User className="h-[20px] w-[20px] text-black group-hover:text-[#FF4B00]" strokeWidth={2.2} />
                          <span>Account</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 font-medium">
                        <DropdownMenuItem asChild><Link href="/account/profile" className="flex items-center gap-2.5 cursor-pointer text-gray-700 py-2"><User className="h-4 w-4 text-gray-500" />Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/account/orders" className="flex items-center gap-2.5 cursor-pointer text-gray-700 py-2"><Package className="h-4 w-4 text-gray-500" />My Orders</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2.5 cursor-pointer text-red-600 focus:text-red-700 py-2"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/login" className="flex items-center gap-2.5 text-[14px] font-bold text-black hover:text-[#FF4B00] transition-colors group">
                      <User className="h-[20px] w-[20px] text-black group-hover:text-[#FF4B00]" strokeWidth={2.2} />
                      <span>Login / Signup</span>
                    </Link>
                  )}

                  <div className="h-5 w-[1px] bg-gray-200"></div>

                  <Link href={cartHref} className="flex items-center justify-center relative group" aria-label="Cart">
                    <ShoppingCart className="h-6 w-6 text-black group-hover:text-[#FF4B00] transition-colors" strokeWidth={2} />
                    {cartCount > 0 ? (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF4B00] text-[10px] font-bold text-white px-1 shadow-sm">
                        {cartCount}
                      </span>
                    ) : (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF4B00] text-[10px] font-bold text-white px-1 shadow-sm">
                        0
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Bottom Row Links */}
              <div className="flex items-center gap-6 xl:gap-8 mt-auto mb-0.5">
                {navLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className={cn(
                      "text-[12.5px] font-bold uppercase transition-colors relative pb-[4px]",
                      pathname === link.href ? "text-[#FF4B00]" : "text-black hover:text-[#FF4B00]"
                    )}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#FF4B00]" />
                    )}
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile navbar top row */}
        {!hideNav && (
          <div className="lg:hidden px-4 py-3 bg-white">
            <div className="flex items-center justify-between">
              {/* Logo Mobile */}
              <Link href="/" className="flex flex-col items-start leading-none group">
                <Image src="/logo.webp" alt="RRC Kitchen" width={180} height={55} className="h-14 w-auto group-hover:opacity-90 transition-opacity" priority />
              </Link>

              <button onClick={() => setLocationOpen(true)} className="flex flex-1 mx-4 items-center justify-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200">
                <MapPin className="h-3.5 w-3.5 text-[#EE7005]" />
                <span className="truncate max-w-[100px]">{deliveryAddress || "Location"}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button aria-label="User menu" className="h-9 w-9 flex items-center justify-center rounded-full bg-[#FFF5EC] text-[#EE7005] transition-colors border border-[#FADCBF]">
                        <User className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40 font-medium">
                      <DropdownMenuItem asChild>
                        <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer text-gray-700"><User className="h-4 w-4" />Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders" className="flex items-center gap-2 cursor-pointer text-gray-700"><Package className="h-4 w-4" />My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={requestNotification} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <Bell className={`h-4 w-4 ${notifGranted ? "fill-[#168846] text-[#168846]" : ""}`} />
                        {notifGranted ? "Notifications On" : "Enable Notifications"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-red-600"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login" className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#EE7005] hover:border-[#EE7005]/30 transition-colors">
                    <User className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile search bar */}
        {!hideNav && (
          <div className="lg:hidden px-4 pb-3 bg-white relative">
            <SearchAutocomplete
              mobileModal
              placeholder="Search for meals, kitchens, cuisines..."
              inputClassName="h-10 w-full rounded-lg  text-xs pl-5 pr-10 focus-visible:ring-1 focus-visible:ring-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-900 border border-gray-200 placeholder:text-gray-400"
            />
           
          </div>
        )}

        {/* Mobile Tabs */}
        {!hideNav && (
          <div className="lg:hidden w-full bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6 px-5 h-11 min-w-max">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-black tracking-widest uppercase transition-colors relative h-full flex items-center",
                    pathname === link.href ? "text-[#EE7005]" : "text-[#0A3D24]"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#EE7005] rounded-t-sm" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Carousel ── */}
      {isHomePage && <HeroCarousel />}

      {(!hideNav || isSupportPage || isCategoriesPage) && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
            <MobileNavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" active={pathname === "/"} />
            <MobileNavItem href="/categories" icon={<LayoutGrid className="h-5 w-5" />} label="Categories" active={pathname.startsWith("/categories")} />
            <MobileNavItem href={cartHref} icon={<ShoppingCart className="h-5 w-5" />} label="Cart" badge={cartCount} active={pathname === "/cart"} />
            <MobileNavItem href="/help" icon={<HelpCircle className="h-5 w-5" />} label="Help" active={pathname.startsWith("/help")} />
          </nav>
          <div className="h-[60px] lg:hidden" />
        </>
      )}

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
