"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const dedupeBaseKey = ["dedupe"] as const;

/**
 * Dedupes requests via the TanStack Query cache: calling `dedupe` with the same
 * key within `dedupeMs` reuses the cached/in-flight result instead of re-running
 * the fetcher. Identical keys share one in-flight promise and the result is
 * served from cache until the window expires.
 */
export function useRequestDedupe(dedupeMs = 5000) {
  const queryClient = useQueryClient();

  const dedupe = useCallback(async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    return queryClient.fetchQuery<T>({
      queryKey: [...dedupeBaseKey, key],
      queryFn: fetcher,
      staleTime: dedupeMs,
      retry: false,
    });
  }, [queryClient, dedupeMs]);

  const invalidate = useCallback((pattern?: string) => {
    if (pattern) {
      queryClient.removeQueries({
        queryKey: dedupeBaseKey,
        predicate: (query) => typeof query.queryKey[1] === "string" && query.queryKey[1].includes(pattern),
      });
    } else {
      queryClient.removeQueries({ queryKey: dedupeBaseKey });
    }
  }, [queryClient]);

  return { dedupe, invalidate };
}
