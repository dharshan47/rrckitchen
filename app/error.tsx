"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const MAX_AUTO_RETRIES = 3;

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [autoRetries, setAutoRetries] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Transient failures (e.g. platform 503s, flaky network) usually clear up
  // on their own - retry automatically a few times with backoff before
  // asking the user to hit "Try Again".
  useEffect(() => {
    if (autoRetries >= MAX_AUTO_RETRIES) return;
    const delay = 1200 * 2 ** autoRetries;
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      setAutoRetries((n) => n + 1);
      unstable_retry();
    }, delay);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [autoRetries, unstable_retry]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive/60" />
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error.
        {autoRetries < MAX_AUTO_RETRIES ? " Retrying automatically..." : " Please try again."}
      </p>
      <Button onClick={unstable_retry}>Try Again</Button>
    </div>
  );
}
