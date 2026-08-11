"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#why-partner", label: "Why Partner With Us" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#requirements", label: "Requirements" },
  { href: "#faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
];

export function KitchenNavbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
        <Link href="/" className="flex items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold font-serif italic text-[#FD4F03] leading-none">RRC <span className="text-[#006F3D]">Kitchen</span></span>
            <p className="text-[10px] sm:text-xs italic text-[#222222] mt-0.5 font-serif leading-none">Every Homemaker is a Chef</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#222222] hover:text-[#006F3D] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {isLoggedIn ? (
            <Button asChild className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-[7px] px-6 shadow-[0_3px_12px_rgba(253,79,3,0.2)]">
              <Link href="/kitchen/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="border-[1.5px] border-[#006F3D] text-[#006F3D] bg-[#FFFFFF] hover:bg-[#F1F8F3] hover:text-[#006F3D] rounded-[7px] px-6">
                <Link href="/kitchen/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-[7px] px-6 shadow-[0_3px_12px_rgba(253,79,3,0.2)]">
                <Link href="/kitchen/signup">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-[#222222]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E8E8E8] bg-[#FFFFFF] px-4 sm:px-6 py-4 space-y-2 shadow-[0_6px_18px_rgba(0,0,0,0.09)] absolute w-full left-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-semibold text-[#222222] hover:text-[#006F3D] py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 pb-2 border-t border-[#E8E8E8]">
            {isLoggedIn ? (
              <Button asChild className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] w-full rounded-[7px]">
                <Link href="/kitchen/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="border-[1.5px] border-[#006F3D] text-[#006F3D] bg-[#FFFFFF] hover:bg-[#F1F8F3] hover:text-[#006F3D] w-full rounded-[7px]">
                  <Link href="/kitchen/login">Login</Link>
                </Button>
                <Button asChild className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] w-full rounded-[7px]">
                  <Link href="/kitchen/signup">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
