import Link from "next/link";
import { Share2, Globe, Users, ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Left Column: Branding & Socials */}
        <div className="flex flex-col gap-8">
          <h2 className="text-4xl font-extrabold tracking-tighter text-foreground font-heading">
            RrcKitchen
          </h2>
          <div className="flex gap-5">
            <Share2 className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            <Globe className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            <Users className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            <ExternalLink className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
          <div className="text-muted-foreground text-sm space-y-1">
            <p>© RrcKitchen Marketplace Private Limited</p>
            <p>fssai lic no : 11224999000872</p>
          </div>
        </div>

        {/* Middle Column: Links */}
        <div className="grid grid-cols-1 gap-4">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/menu">Tomorrow&rsquo;s Menu</FooterLink>
          <FooterLink href="/login/kitchen">Kitchen Partner Login</FooterLink>
          <FooterLink href="/login/supplier">Supplier Login</FooterLink>
          <FooterLink href="/admin/login">Admin Login</FooterLink>
          <FooterLink href="#">Customer Support</FooterLink>
        </div>

        {/* Right Column: Policies */}
        <div className="grid grid-cols-1 gap-4">
          <FooterLink href="#">Privacy Policy</FooterLink>
          <FooterLink href="#">Terms of Use</FooterLink>
          <FooterLink href="#">Responsible Disclosure Policy</FooterLink>
          <FooterLink href="#">Sell on RrcKitchen</FooterLink>
          <FooterLink href="#">Deliver with RrcKitchen</FooterLink>
          <FooterLink href="#">Franchise with RrcKitchen</FooterLink>
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
