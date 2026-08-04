"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

/**
 * Debounces a value via the TanStack Query cache. Every change starts a fresh
 * query whose promise resolves `delay` ms later, so the returned value only
 * updates `delay` ms after the last change. Abandoned queries are GC'd
 * immediately, so rapid updates never settle stale values.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [initialValue] = useState(value);

  const { data } = useQuery<T>({
    queryKey: ["use-debounced", value],
    queryFn: () =>
      new Promise<T>((resolve) => {
        window.setTimeout(() => resolve(value), delay);
      }),
    enabled: typeof window !== "undefined",
    placeholderData: keepPreviousData,
    staleTime: delay,
    gcTime: 0,
  });

  return data ?? initialValue;
}
