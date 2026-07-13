"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site";
import { SwUpdateBanner } from "@/components/patterns/sw-update-banner";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";
import { InstallPrompt } from "@/components/patterns/install-prompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");
  const isSignupPage = pathname.startsWith("/signup");
  const isAdminPage = pathname.startsWith("/admin");
  const isKitchenPage = pathname.startsWith("/kitchen");
  const isDeliveryPartnerPage = pathname.startsWith("/delivery-partner");
  const isPolicyPage = pathname.startsWith("/privacy-policy") || pathname.startsWith("/terms-of-use") || pathname.startsWith("/contact");

  if (isLoginPage || isSignupPage || isAdminPage || isKitchenPage || isDeliveryPartnerPage || isPolicyPage) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <SwUpdateBanner />
      <PushSubscriptionInit />
      <InstallPrompt />
    </>
  );
}
