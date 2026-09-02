"use client";

import { PolicyHeader } from "@/components/policy";
import { PushSubscriptionInit } from "@/components/patterns/push-subscription-init";

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PolicyHeader />
      <main>{children}</main>
      <PushSubscriptionInit />
    </>
  );
}
