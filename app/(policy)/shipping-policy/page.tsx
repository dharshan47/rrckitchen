import type { Metadata } from "next";
import ShippingPolicyContent from "@/content/shipping-policy.mdx";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "RRC Kitchen Shipping Policy - Learn about our delivery areas, times, and fees.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Shipping Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Version 1.0 | Last updated: 1st September 2026
      </p>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
        <ShippingPolicyContent />
      </div>

      <div className="border-t border-border pt-6 mt-10">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 RRC Kitchen. All rights reserved.
        </p>
      </div>
    </div>
  );
}
