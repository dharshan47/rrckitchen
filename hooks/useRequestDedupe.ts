"use client";

import { useRef, useCallback } from "react";

interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();

export function useRequestDedupe(dedupeMs = 5000) {
  const dedupeRef = useRef(dedupeMs);
  dedupeRef.current = dedupeMs;

  const dedupe = useCallback(async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    const existing = pendingRequests.get(key);
    if (existing && Date.now() - existing.timestamp < dedupeRef.current) {
      return existing.promise as Promise<T>;
    }
    const promise = fetcher().finally(() => {
      setTimeout(() => pendingRequests.delete(key), dedupeRef.current);
    });
    pendingRequests.set(key, { promise, timestamp: Date.now() });
    return promise;
  }, []);

  const invalidate = useCallback((pattern?: string) => {
    if (pattern) {
      for (const key of pendingRequests.keys()) {
        if (key.includes(pattern)) pendingRequests.delete(key);
      }
    } else {
      pendingRequests.clear();
    }
  }, []);

  return { dedupe, invalidate };
}
