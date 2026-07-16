import type { Metadata } from "next";
import TermsOfUseContent from "@/content/terms-of-use.mdx";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "RRC Kitchen Terms of Use - Terms governing your use of the RRC Kitchen Platform.",
};

export default function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Terms of Use</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Version 1.0 | Last updated: 1st July 2026
      </p>

      <TermsOfUseContent />

      <div className="border-t border-border pt-6 mt-10">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 RRC Kitchen Marketplace Private Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
}
