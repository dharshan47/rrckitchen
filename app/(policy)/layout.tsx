"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PolicyFooter } from "@/components/policy";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <>
      <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border px-4 h-12 flex items-center">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <main>{children}</main>
      <PolicyFooter />
      <PushSubscriptionInit />
    </>
  );
}
