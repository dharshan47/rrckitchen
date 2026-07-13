"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = useCallback(() => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setDismissed(true);
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Install RRC Kitchen</p>
              <p className="text-xs text-muted-foreground">Quick access from your home screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="w-full mt-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
