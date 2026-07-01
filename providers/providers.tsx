"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { useEventBus } from "@/hooks/useEventBus";
import { AppEvents } from "@/lib/patterns/event-bus";

function PWARegistrar({ children }: { children: React.ReactNode }) {
  const { registerServiceWorker } = usePWA();

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  return <>{children}</>;
}

function EventBusLogger() {
  useEventBus(AppEvents.CART_UPDATED, (payload) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[EventBus] Cart updated:", payload);
    }
  });

  useEventBus(AppEvents.AUTH_CHANGED, (payload) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[EventBus] Auth changed:", payload);
    }
  });

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PWARegistrar>
        <EventBusLogger />
        {children}
      </PWARegistrar>
    </QueryClientProvider>
  );
}
