import Link from "next/link";
import { ChefHat } from "lucide-react";

export function KitchenFooter() {
  return (
    <footer className="border-t border-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="text-lg font-extrabold">Kitchen Hub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-6 max-w-xs">
              Join RrcKitchen&apos;s network of home chefs. Reach more customers, manage orders, and grow your kitchen business.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                RrcKitchen Home
              </Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; RrcKitchen Marketplace Private Limited
          </p>
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            RrcKitchen
          </Link>
        </div>
      </div>
    </footer>
  );
}
