"use client";

import { useEffect, useRef } from "react";
import { usePWA } from "@/hooks/usePWA";

export function PushSubscriptionInit() {
  const { subscribeToPush, swRegistration } = usePWA();
  const subscribed = useRef(false);

  useEffect(() => {
    if (!swRegistration || subscribed.current) return;
    if (Notification.permission === "granted") {
      subscribed.current = true;
      subscribeToPush();
    }
  }, [swRegistration, subscribeToPush]);

  return null;
}
