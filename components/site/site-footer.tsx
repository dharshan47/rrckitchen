"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa6";

const SOCIAL_LINKS = [
  { href: "#", icon: FaFacebookF, label: "Facebook", bgClass: "bg-[#1877F2]" },
  { href: "#", icon: FaInstagram, label: "Instagram", bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
  { href: "#", icon: FaYoutube, label: "YouTube", bgClass: "bg-[#FF0000]" },
  { href: "#", icon: FaWhatsapp, label: "WhatsApp", bgClass: "bg-[#25D366]" },
];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Kitchens" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms & Conditions" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

const HELP_LINKS = [
  { href: "/help", label: "FAQs" },
  { href: "/support", label: "Support" },
];

export function SiteFooter() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;

  const isDeliveryPartner = role === "deliverypartner";
  const isKitchenPartner = role === "kitchenpartner";

  const PARTNER_LINKS = [
    { href: isKitchenPartner ? "/kitchen/dashboard" : "/kitchen/signup", label: "Become a Home Chef" },
    { href: isDeliveryPartner ? "/delivery-partner/dashboard" : "/delivery-partner/signup", label: "Become a Delivery Partner" },
  ];

  return (
    <footer role="contentinfo" aria-label="Site Footer" className="bg-[#003015] w-full flex flex-col mt-auto relative z-10 text-white font-sans">
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-4 xl:gap-8">
          
          {/* Logo & Social */}
          <div className="flex flex-col gap-4 lg:w-[22%]">
            <Link href="/" className="flex flex-col items-start leading-none group w-fit" aria-label="RRC Kitchen Home">
              <Image src="/logo.webp" alt="" width={180} height={60} aria-hidden="true" className="h-14 w-auto brightness-0 invert group-hover:opacity-90 transition-opacity" />
            </Link>
            <p className="font-serif italic text-base text-white/80">Every Homemaker is a Chef</p>
            <nav aria-label="Social Media Links" className="flex items-center gap-3 mt-1">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`h-8 w-8 rounded-full ${social.bgClass} flex items-center justify-center text-white hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003015]`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links Navigation" className="flex flex-col lg:w-[13%]">
            <h3 id="quick-links-heading" className="text-sm font-bold uppercase text-white mb-4">
              Quick Links
            </h3>
            <ul aria-labelledby="quick-links-heading" className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* For Partners */}
          <nav aria-label="Partner Links Navigation" className="flex flex-col lg:w-[15%]">
            <h3 id="partner-links-heading" className="text-sm font-bold uppercase text-white mb-4">
              For Partners
            </h3>
            <ul aria-labelledby="partner-links-heading" className="flex flex-col gap-2.5">
              {PARTNER_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Policies */}
          <nav aria-label="Policy Links Navigation" className="flex flex-col lg:w-[13%]">
            <h3 id="policy-links-heading" className="text-sm font-bold uppercase text-white mb-4">
              Policies
            </h3>
            <ul aria-labelledby="policy-links-heading" className="flex flex-col gap-2.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help */}
          <nav aria-label="Help Links Navigation" className="flex flex-col lg:w-[12%]">
            <h3 id="help-links-heading" className="text-sm font-bold uppercase text-white mb-4">
              Help
            </h3>
            <ul aria-labelledby="help-links-heading" className="flex flex-col gap-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <section aria-labelledby="newsletter-heading" className="flex flex-col lg:w-[25%] max-w-sm">
            <h3 id="newsletter-heading" className="text-sm font-bold uppercase text-white mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-white/80 mb-4 leading-snug">
              Subscribe to get updates<br />and exclusive offers.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter Subscription Form"
            >
              <label htmlFor="newsletter-email" className="sr-only">Enter your email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-10 px-3 min-w-0 rounded bg-[#FFFFFF] text-[#111111] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#003015] focus-visible:ring-white"
                required
                aria-required="true"
              />
              <button 
                type="submit" 
                className="h-10 px-6 bg-[#F04E00] text-[#FFFFFF] font-bold rounded hover:bg-[#FF5A00] transition-colors uppercase text-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003015]"
                aria-label="Subscribe to Newsletter"
              >
                Subscribe
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-4 pb-20 lg:pb-4 text-center">
        <p className="text-xs text-white/60" aria-label="Copyright">
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
      className="text-sm text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#003015] rounded-sm"
    >
      {children}
    </Link>
  );
}
