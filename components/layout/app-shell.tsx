"use client";

import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/site/site-header";

const SiteFooter = dynamic(() => import("@/components/site/site-footer").then(m => m.SiteFooter), { ssr: false });
const SwUpdateBanner = dynamic(() => import("@/components/patterns/sw-update-banner").then(m => m.SwUpdateBanner), { ssr: false });
const PushSubscriptionInit = dynamic(() => import("@/components/patterns/push-subscription-init").then(m => m.PushSubscriptionInit), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/patterns/install-prompt").then(m => m.InstallPrompt), { ssr: false });

const HIDE_HEADER_FOOTER_PATHS = [
  "/login", "/signup", "/admin", "/kitchen", "/delivery-partner",
  "/privacy-policy", "/terms-of-use", "/contact",
];

function shouldHideShell(pathname: string) {
  return HIDE_HEADER_FOOTER_PATHS.some((p) => pathname.startsWith(p));
}

export const AppShell = memo(function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = useMemo(() => shouldHideShell(pathname), [pathname]);
  const isCartPage = pathname === "/cart";
  const isSearchPage = pathname === "/search";

  if (hideShell) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      {children}
      {!isCartPage && !isSearchPage && <SiteFooter />}
      <SwUpdateBanner />
      <PushSubscriptionInit />
      <InstallPrompt />
    </>
  );
});
