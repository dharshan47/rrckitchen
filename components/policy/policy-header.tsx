"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLICY_PAGES: Record<string, string> = {
  "/terms-of-use": "Terms of Use",
  "/privacy-policy": "Privacy Policy",
  "/shipping-policy": "Shipping Policy",
  "/refund-policy": "Refund Policy",
};

export function PolicyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Normalize pathname to handle trailing slashes or subpaths if necessary
  const normalizedPath = pathname.replace(/\/$/, "");
  const pageTitle = POLICY_PAGES[normalizedPath] || "Policy";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back" className="shrink-0 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Image src="/logo.webp" alt="RRC Kitchen" width={120} height={40} className="rounded-md object-contain" priority />
        </div>
        
        <span className="font-bold text-lg">{pageTitle}</span>
      </div>
    </header>
  );
}
