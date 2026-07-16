import type { Metadata } from "next";
import PrivacyPolicyContent from "@/content/privacy-policy.mdx";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "RRC Kitchen Privacy Policy - Learn how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Version 1.0 | Last updated: 1st July 2026
      </p>

      <PrivacyPolicyContent />

      <div className="border-t border-border pt-6 mt-10">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 RRC Kitchen. All rights reserved.
        </p>
      </div>
    </div>
  );
}
