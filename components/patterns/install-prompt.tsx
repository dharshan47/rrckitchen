"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, boolean>).MSStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstall = () => {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
      setDeferredPrompt(null);
    }
  };

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-border bg-white p-4 shadow-lg md:left-auto md:right-4 md:w-80">
        <p className="text-sm text-muted-foreground">
          Install RrcKitchen: tap the share button and then &ldquo;Add to Home Screen&rdquo;.
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-border bg-white p-4 shadow-lg md:left-auto md:right-4 md:w-80">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm font-medium">Install RrcKitchen for quick access</p>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
            Not now
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
