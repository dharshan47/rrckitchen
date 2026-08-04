"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

export function usePWA() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, boolean>).MSStream;
  });
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    }).then((registration) => {
      setSwRegistration(registration);

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    }).catch(() => {});
  }, []);

  // VAPID public key — fetched once and cached for the session
  const { data: vapidPublicKey } = useQuery({
    queryKey: ["pwa", "vapid-public-key"],
    queryFn: async () => {
      const res = await fetch("/api/push/vapid-public-key");
      if (!res.ok) throw new Error("Failed to fetch push key");
      const { publicKey } = await res.json();
      return publicKey as string | undefined;
    },
    enabled: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
    retry: 1,
  });

  const subscribePushMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const sub = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys?.p256dh,
          auth: sub.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error("Failed to subscribe to push notifications");
    },
  });

  const activateUpdate = useCallback(() => {
    if (!swRegistration?.waiting) return;
    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }, [swRegistration]);

  const installApp = useCallback(() => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const subscribeToPush = useCallback(async () => {
    if (!swRegistration || !vapidPublicKey) return;
    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      await subscribePushMutation.mutateAsync(subscription);
    } catch {
      // silently fail - user may have denied permission
    }
  }, [swRegistration, vapidPublicKey, subscribePushMutation]);

  return {
    isOnline,
    isStandalone,
    isIOS,
    isInstallable: !!deferredPrompt,
    installApp,
    updateAvailable,
    activateUpdate,
    subscribeToPush,
    swRegistration,
  };
}
