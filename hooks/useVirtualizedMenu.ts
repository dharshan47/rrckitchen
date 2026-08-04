"use client";

import { useRef, useMemo } from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";

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
}: UseVirtualizedMenuOptions<T>): UseVirtualizedMenuResult<T> {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const visibleItems = useMemo(() => {
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
