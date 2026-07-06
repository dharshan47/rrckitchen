"use client";

import { useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";

export function SwUpdateBanner() {
  const { updateAvailable, activateUpdate } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
      <p className="text-sm font-medium">New version available</p>
      <Button size="sm" onClick={activateUpdate} className="shrink-0">
        Update
      </Button>
    </div>
  );
}
