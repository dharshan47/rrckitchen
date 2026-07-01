"use client";

import { useState, useEffect, useRef } from "react";
import { cacheImage } from "@/lib/cache";

interface UseProgressiveImageOptions {
  placeholder?: string;
  lowResUrl?: string;
  highResUrl: string;
}

export function useProgressiveImage({ lowResUrl, highResUrl, placeholder }: UseProgressiveImageOptions) {
  const [src, setSrc] = useState(placeholder ?? lowResUrl ?? "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function load() {
      try {
        const cached = await cacheImage(highResUrl);
        if (!mountedRef.current || cancelled) return;
        setSrc(cached);
        setIsLoaded(true);
      } catch {
        if (!mountedRef.current || cancelled) return;
        setIsError(true);
      }
    }

    // Show low-res first if available
    if (lowResUrl) {
      setSrc(lowResUrl);
    }

    load();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [lowResUrl, highResUrl, placeholder]);

  return { src, isLoaded, isError };
}
