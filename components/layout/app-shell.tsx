"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site";
import { InstallPrompt } from "@/components/patterns/install-prompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isKitchenPage = pathname.startsWith("/kitchen");
  const isDeliveryPartnerPage = pathname.startsWith("/delivery-partner");

  if (isLoginPage || isAdminPage || isKitchenPage || isDeliveryPartnerPage) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <InstallPrompt />
    </>
  );
}
