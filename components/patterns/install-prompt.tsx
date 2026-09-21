"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    if (!isIOSDevice && !isAndroidDevice) return;

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    if (isIOSDevice) {
      // iOS doesn't support beforeinstallprompt, so we just show our custom prompt after a delay
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsIos(true);
          setShowPrompt(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      // Android
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!dismissed) {
          setTimeout(() => {
            setIsIos(false);
            setShowPrompt(true);
          }, 5000);
        }
      };

      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, [dismissed]);

  const handleInstall = useCallback(() => {
    if (isIos) {
      // For iOS, they just have to follow the instructions in the prompt. We can just dismiss it.
      setShowPrompt(false);
      return;
    }
    
    if (!deferredPrompt) return;
    (deferredPrompt as BeforeInstallPromptEvent).prompt();
    setShowPrompt(false);
  }, [deferredPrompt, isIos]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setDismissed(true);
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] md:hidden">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 fade-in duration-300 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="pt-1">
            <p className="text-base font-bold leading-tight">Install RRC Kitchen</p>
            <p className="text-sm text-muted-foreground mt-0.5">Quick access from your home screen</p>
          </div>
        </div>
        
        {isIos ? (
          <div className="text-sm bg-muted/50 p-3 rounded-lg text-muted-foreground">
            Tap <Share className="inline h-4 w-4 mx-1" /> and select <strong>Add to Home Screen</strong>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors uppercase"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
