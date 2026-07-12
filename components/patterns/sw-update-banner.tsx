"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";

export function SwUpdateBanner() {
  const { isStandalone, updateAvailable, activateUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || !isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-100 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
      <p className="text-sm font-medium">New version available</p>
      <Button size="sm" onClick={activateUpdate} className="shrink-0">
        Update
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
