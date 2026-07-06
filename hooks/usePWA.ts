"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function usePWA() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });
  const [isIOS, setIsIOS] = useState(() => {
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
    if (!swRegistration) return;
    try {
      const res = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await res.json();
      if (!publicKey) return;

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      const sub = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys?.p256dh,
          auth: sub.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
    } catch {
      // silently fail - user may have denied permission
    }
  }, [swRegistration]);

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
