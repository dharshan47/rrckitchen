"use client";

import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import { useIntersectionObserver } from "./useIntersectionObserver";

interface UseVirtualizedMenuOptions<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  rootMargin?: string;
}

interface UseVirtualizedMenuResult<T> {
  parentRef: React.RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  visibleItems: Array<{ virtualIndex: number; item: T }>;
  totalSize: number;
}

export function useVirtualizedMenu<T>({
  items,
  estimateSize = 140,
  overscan = 3,
  rootMargin = "200px",
}: UseVirtualizedMenuOptions<T>): UseVirtualizedMenuResult<T> {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Use IntersectionObserver to detect which items are actually visible
  const { ref: sentinelRef, isIntersecting: isSentinelVisible } = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
  });

  const visibleItems = useMemo(() => {
    const start = Math.max(0, virtualItems[0]?.index ?? 0);
    const end = virtualItems[virtualItems.length - 1]?.index ?? items.length;
    return virtualItems.map((vi) => ({
      virtualIndex: vi.index,
      item: items[vi.index],
    }));
  }, [virtualItems, items]);

  const totalSize = virtualizer.getTotalSize();

  return {
    parentRef,
    virtualizer,
    visibleItems,
    totalSize,
  };
}
