"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
    <header className="sticky top-0 z-50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
        <Link href="/" className="flex items-center shrink-0">
          <div className="relative h-10 w-32 sm:h-12 sm:w-40">
            <Image 
              src="/icon.png" 
              alt="RRC Kitchen" 
              fill
              className="object-contain object-left" 
            />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-700 hover:text-[#EE7005] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {isLoggedIn ? (
            <Button asChild className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white rounded-full px-6 shadow-md shadow-[#EE7005]/20">
              <Link href="/kitchen/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="border-2 border-[#007A33] text-[#007A33] hover:bg-[#007A33] hover:text-white rounded-full px-6">
                <Link href="/kitchen/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white rounded-full px-6 shadow-md shadow-[#EE7005]/20">
                <Link href="/kitchen/signup">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 sm:px-6 py-4 space-y-2 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-semibold text-gray-700 hover:text-[#EE7005] py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 pb-2 border-t border-gray-100">
            {isLoggedIn ? (
              <Button asChild className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white w-full rounded-full">
                <Link href="/kitchen/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="border-2 border-[#007A33] text-[#007A33] hover:bg-[#007A33] hover:text-white w-full rounded-full">
                  <Link href="/kitchen/login">Login</Link>
                </Button>
                <Button asChild className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white w-full rounded-full">
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
