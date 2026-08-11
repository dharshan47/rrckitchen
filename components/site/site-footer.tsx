"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

export function SiteFooter() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;

  const isDeliveryPartner = role === "deliverypartner";
  const isKitchenPartner = role === "kitchenpartner";

  return (
    <footer className="bg-[#003015] w-full flex flex-col mt-auto relative z-10 text-white font-sans">
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-4 xl:gap-8">
          
          {/* Logo & Social */}
          <div className="flex flex-col gap-4 lg:w-[22%]">
            <Link href="/" className="flex flex-col items-start leading-none group w-fit">
              <Image src="/logo.webp" alt="RRC Kitchen" width={180} height={60} className="h-14 w-auto brightness-0 invert group-hover:opacity-90 transition-opacity" />
            </Link>
            <p className="font-serif italic text-base text-white/80">Every Homemaker is a Chef</p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="#"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="h-8 w-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              >
                <FaWhatsapp className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col lg:w-[13%]">
            <h3 className="text-sm font-bold uppercase text-white mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/categories">Categories</FooterLink>
              <FooterLink href="/search">Kitchens</FooterLink>
              <FooterLink href="/about-us">About Us</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </div>
          </div>

          {/* For Partners */}
          <div className="flex flex-col lg:w-[15%]">
            <h3 className="text-sm font-bold uppercase text-white mb-4">
              For Partners
            </h3>
            <div className="flex flex-col gap-2.5">
              <FooterLink
                href={
                  isKitchenPartner ? "/kitchen/dashboard" : "/kitchen/signup"
                }
              >
                Become a Home Chef
              </FooterLink>
              <FooterLink
                href={
                  isDeliveryPartner
                    ? "/delivery-partner/dashboard"
                    : "/delivery-partner/signup"
                }
              >
                Become a Delivery Partner
              </FooterLink>
            </div>
          </div>

          {/* Policies */}
          <div className="flex flex-col lg:w-[13%]">
            <h3 className="text-sm font-bold uppercase text-white mb-4">
              Policies
            </h3>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms-of-use">Terms & Conditions</FooterLink>
              <FooterLink href="/privacy-policy">Refund Policy</FooterLink>
            </div>
          </div>

          {/* Help */}
          <div className="flex flex-col lg:w-[12%]">
            <h3 className="text-sm font-bold uppercase text-white mb-4">
              Help
            </h3>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/help">FAQs</FooterLink>
              <FooterLink href="/terms-of-use">Shipping Policy</FooterLink>
              <FooterLink href="/support">Support</FooterLink>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col lg:w-[25%] max-w-sm">
            <h3 className="text-sm font-bold uppercase text-white mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-white/80 mb-4 leading-snug">
              Subscribe to get updates<br />and exclusive offers.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-10 px-3 min-w-0 rounded bg-[#FFFFFF] text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none"
              />
              <button className="h-10 px-6 bg-[#F04E00] text-[#FFFFFF] font-bold rounded hover:bg-[#FF5A00] transition-colors uppercase text-sm shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-4 text-center">
        <p className="text-xs text-white/60">
          &copy; {new Date().getFullYear()} RRC Kitchen Marketplace Pvt. Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-white/80 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
