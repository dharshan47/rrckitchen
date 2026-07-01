import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="flex flex-col gap-8">
          <Link href="/" className="text-4xl font-extrabold tracking-tighter text-foreground">
            RrcKitchen
          </Link>
          <div className="text-muted-foreground text-sm space-y-1">
            <p>&copy; RrcKitchen Marketplace Private Limited</p>
            <p>fssai lic no : 11224999000872</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/menu">Tomorrow&rsquo;s Menu</FooterLink>
          <FooterLink href="/login/kitchen">Kitchen Partner Login</FooterLink>
          <FooterLink href="/login/delivery-partner">Delivery Partner Login</FooterLink>
          <FooterLink href="/admin/login">Admin Login</FooterLink>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FooterLink href="#">Privacy Policy</FooterLink>
          <FooterLink href="#">Terms of Use</FooterLink>
          <FooterLink href="#">Sell on RrcKitchen</FooterLink>
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
