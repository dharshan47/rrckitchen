"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { User, ShoppingCart, Home, LayoutGrid, MapPin, ChevronDown, LogOut, Package, HelpCircle, Search, Store, ClipboardList, Menu } from "lucide-react";
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
    <Link href={href} className={cn("flex flex-col items-center justify-center gap-1 px-3 py-1.5 relative min-h-12 min-w-12 transition-colors", active ? "text-[#c03a00]" : "text-[#6B7280] hover:text-gray-900")}>
      {icon}
      <span className="text-[11px] font-medium tracking-wide mt-0.5 capitalize">{label}</span>
      {badge !== undefined && badge !== 0 && (
        <span className="absolute top-1 right-2 h-4 min-w-4 flex items-center justify-center rounded-full bg-[#c03a00] p-0 px-1 text-[9px] font-bold text-white border border-white shadow-sm">{badge}</span>
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const cartHref = isLoggedIn ? "/cart" : "/login";

  const isHomePage = pathname === "/";
  const isSearchPage = pathname === "/search";
  const isCartPage = pathname === "/cart";
  const isHelpPage = pathname === "/help";
  const isSupportPage = pathname === "/support";
  const isCategoriesPage = pathname.startsWith("/categories");
  const hideNav = isHelpPage || isSearchPage;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
        <header className="sticky top-0 z-50 border-b border-[#E7E7E7] bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8 h-14 md:h-16">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-[#6B7280]">SECURE CHECKOUT</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#c03a00] transition-colors">
                <HelpCircle className="h-4 w-4" />
                Help
              </Link>
              {isLoggedIn ? (
                <Link href="/account/profile" className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#c03a00] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Profile</span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#c03a00] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </header>
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E7E7E7] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <MobileNavItem href="/" icon={<Home className="h-[22px] w-[22px]" strokeWidth={2} />} label="Home" active={false} />
          <MobileNavItem href="/categories" icon={<LayoutGrid className="h-[22px] w-[22px]" strokeWidth={2} />} label="Categories" active={false} />
          <MobileNavItem href="/kitchens" icon={<Store className="h-[22px] w-[22px]" strokeWidth={2} />} label="Kitchens" active={false} />
          <MobileNavItem href={isLoggedIn ? "/account/orders" : "/login"} icon={<ClipboardList className="h-[22px] w-[22px]" strokeWidth={2} />} label="Orders" active={false} />
          <MobileNavItem href={isLoggedIn ? "/account/profile" : "/login"} icon={<User className="h-[22px] w-[22px]" strokeWidth={2} />} label="Profile" active={false} />
        </nav>
      </>
    );
  }

  if (isHelpPage) {
    return (
      <>
        <header className="sticky top-0 z-50 border-b border-[#E7E7E7] bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex flex-col items-start leading-none group">
              <Image src="/logo.webp" alt="RRC Kitchen" width={120} height={40} className="h-9 w-auto group-hover:opacity-90 transition-opacity" priority />
            </Link>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="User menu" className="h-9 w-9 flex items-center justify-center rounded-full border border-[#E7E7E7] text-[#4B5563] hover:bg-[#FEFEFE] transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40 font-medium">
                  <DropdownMenuItem asChild><Link href="/account/profile" className="flex items-center gap-2 cursor-pointer text-[#4B5563]"><User className="h-4 w-4" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders" className="flex items-center gap-2 cursor-pointer text-[#4B5563]"><Package className="h-4 w-4" />My Orders</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-[#DC2626] focus:text-[#B91C1C]"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 rounded-full border border-[#E7E7E7] px-4 py-1.5 text-xs font-bold text-[#4B5563] hover:border-[#FFB18D] hover:text-[#c03a00] transition-colors">
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
          isScrolled ? "shadow-md border-b border-transparent" : "border-b border-[#EEEEEE]"
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
              <div className="flex items-center justify-between w-full mb-3">
                {/* Search and Location */}
                <div className="flex items-center gap-4 xl:gap-6 flex-1 max-w-4xl">
                  <button onClick={() => setLocationOpen(true)} className="flex items-center gap-2 text-left group hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap">
                    <div className="relative text-[#c03a00] flex items-center justify-center shrink-0">
                      <MapPin className="h-[26px] w-[26px]" strokeWidth={2.2} />
                      <div className="absolute top-[7px] left-[50%] -translate-x-[50%] w-[5px] h-[5px] bg-[#c03a00] rounded-full"></div>
                    </div>
                    <div className="flex flex-col justify-center pt-0.5">
                      <span className="text-[12px] text-[#6B7280] font-medium leading-none mb-1">Deliver to</span>
                      <div className="flex items-center gap-1 text-[#111111] group-hover:text-[#c03a00] transition-colors">
                        <span className="text-[14px] font-bold truncate max-w-[200px] xl:max-w-[260px] leading-none">{mounted && deliveryAddress ? deliveryAddress : "Select Location"}</span>
                        <ChevronDown className="h-[15px] w-[15px]" strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>

                  <div className="flex-1 w-full relative">
                    <SearchAutocomplete
                      mobileModal={false}
                      placeholder="Search for meals, kitchens, cuisines..."
                      inputClassName="h-[42px] w-full rounded-lg text-[13px] pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-gray-300 bg-white hover:bg-[#FEFEFE] transition-colors text-gray-900 border border-solid border-gray-300 placeholder:text-[#9CA3AF]"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                      <Search className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 xl:gap-8 shrink-0 ml-8">
                  {isLoggedIn ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 text-[14px] font-bold text-[#111111] hover:text-[#c03a00] transition-colors group outline-none focus:outline-none focus:ring-0 border-none bg-transparent">
                          <User className="h-[20px] w-[20px] text-[#111111] group-hover:text-[#c03a00]" strokeWidth={2.2} />
                          <span>Hello, {session?.user?.name ? session.user.name.split(" ")[0] : "User"}</span>
                          <ChevronDown className="h-4 w-4 text-[#111111] group-hover:text-[#c03a00]" strokeWidth={2.5} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 font-medium">
                        <DropdownMenuItem asChild><Link href="/account/profile" className="flex items-center gap-2.5 cursor-pointer text-[#4B5563] py-2"><User className="h-4 w-4 text-[#6B7280]" />Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/account/orders" className="flex items-center gap-2.5 cursor-pointer text-[#4B5563] py-2"><Package className="h-4 w-4 text-[#6B7280]" />My Orders</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2.5 cursor-pointer text-red-600 focus:text-red-700 py-2"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/login" className="flex items-center gap-2.5 text-[14px] font-bold text-[#111111] hover:text-[#c03a00] transition-colors group">
                      <User className="h-[20px] w-[20px] text-[#111111] group-hover:text-[#c03a00]" strokeWidth={2.2} />
                      <span>Login / Signup</span>
                    </Link>
                  )}

                  <div className="h-5 w-[1px] bg-[#E7E7E7]"></div>

                  <Link href={cartHref} className="flex items-center justify-center relative group" aria-label="Cart">
                    <ShoppingCart className="h-6 w-6 text-[#111111] group-hover:text-[#c03a00] transition-colors" strokeWidth={2} />
                    {mounted && cartCount > 0 ? (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c03a00] text-[10px] font-bold text-white px-1 shadow-sm">
                        {cartCount}
                      </span>
                    ) : (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c03a00] text-[10px] font-bold text-white px-1 shadow-sm">
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
                      pathname === link.href ? "text-[#B83A00]" : "text-[#111111] hover:text-[#B83A00]"
                    )}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#B83A00]" />
                    )}
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile navbar top row */}
        {!hideNav && (
          <div className="lg:hidden px-4 py-3.5 bg-white">
            <div className="flex items-center justify-between">
              {/* Logo Mobile */}
              {pathname === "/account/profile" ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => window.dispatchEvent(new CustomEvent("toggle-profile-sidebar"))} className="flex items-center justify-center text-[#111111]" aria-label="Open menu">
                    <Menu className="h-6 w-6" strokeWidth={2} />
                  </button>
                  <Link href="/" className="flex flex-col items-start leading-none group">
                    <Image src="/logo.webp" alt="RRC Kitchen" width={140} height={42} className="h-[36px] w-auto group-hover:opacity-90 transition-opacity" priority />
                  </Link>
                </div>
              ) : (
                <Link href="/" className="flex flex-col items-start leading-none group">
                  <Image src="/logo.webp" alt="RRC Kitchen" width={180} height={55} className="h-[46px] w-auto group-hover:opacity-90 transition-opacity" priority />
                </Link>
              )}

              <div className="flex items-center gap-4 sm:gap-5 pr-1">
                <button onClick={() => setLocationOpen(true)} className="flex items-center justify-center text-[#c03a00]" aria-label="Set delivery location">
                  <MapPin className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden="true" />
                </button>
                <Link href="/search" className="flex items-center justify-center text-[#111111]" aria-label="Search meals and kitchens">
                  <Search className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden="true" />
                </Link>
                


                <Link href={cartHref} className="flex items-center justify-center relative text-[#111111]" aria-label={`Shopping cart, ${mounted ? cartCount : 0} items`}>
                  <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden="true" />
                  {mounted && cartCount > 0 ? (
                    <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c03a00] text-[10px] font-bold text-white px-1 shadow-sm">
                      {cartCount}
                    </span>
                  ) : (
                    <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c03a00] text-[10px] font-bold text-white px-1 shadow-sm">
                      0
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        {!hideNav && (
          <div className="lg:hidden w-full bg-white border-b border-[#EEEEEE] overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6 px-5 h-11 min-w-max">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-black tracking-widest uppercase transition-colors relative h-full flex items-center",
                    pathname === link.href ? "text-[#B83A00]" : "text-[#003015]"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#B83A00] rounded-t-sm" />
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-[#E7E7E7] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
          <MobileNavItem href="/" icon={<Home className="h-[22px] w-[22px]" strokeWidth={2} fill={pathname === "/" ? "currentColor" : "none"} />} label="Home" active={pathname === "/"} />
          <MobileNavItem href="/categories" icon={<LayoutGrid className="h-[22px] w-[22px]" strokeWidth={2} />} label="Categories" active={pathname.startsWith("/categories")} />
          <MobileNavItem href="/kitchens" icon={<Store className="h-[22px] w-[22px]" strokeWidth={2} />} label="Kitchens" active={pathname.startsWith("/kitchens")} />
          <MobileNavItem href={isLoggedIn ? "/account/orders" : "/login"} icon={<ClipboardList className="h-[22px] w-[22px]" strokeWidth={2} />} label="Orders" active={pathname.startsWith("/account/orders")} />
          <MobileNavItem href={isLoggedIn ? "/account/profile" : "/login"} icon={<User className="h-[22px] w-[22px]" strokeWidth={2} />} label="Profile" active={pathname.startsWith("/account/profile")} />
        </nav>
      )}

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
