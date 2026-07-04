"use client";

import { useState, useEffect, useCallback } from "react";

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

  const installApp = useCallback(() => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        // silently fail
      }
    }
  }, []);

  return {
    isOnline,
    isStandalone,
    isIOS,
    isInstallable: !!deferredPrompt,
    installApp,
    registerServiceWorker,
  };
}
