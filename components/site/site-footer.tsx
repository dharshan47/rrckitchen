"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function SiteFooter() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;

  const isDeliveryPartner = role === "deliverypartner";
  const isKitchenPartner = role === "kitchenpartner";

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-16 md:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-primary">
              RRC Kitchen
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              &copy; RRC Kitchen Marketplace Private Limited
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Partner With Us
            </h3>
            <div className="flex flex-col gap-3">
              <FooterLink href={isDeliveryPartner ? "/delivery-partner/dashboard" : "/delivery-partner/login"}>
                Become a Delivery Partner
              </FooterLink>
              <FooterLink href={isKitchenPartner ? "/kitchen/dashboard" : "/kitchen"}>
                Become a Home Chef
              </FooterLink>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Policies
            </h3>
            <div className="flex flex-col gap-3">
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms-of-use">Terms of Use</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-[15px] font-medium text-foreground hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}
