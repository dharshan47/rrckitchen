"use client";

import { useQuery } from "@tanstack/react-query";
import { cacheImage } from "@/lib/cache";

interface UseProgressiveImageOptions {
  placeholder?: string;
  lowResUrl?: string;
  highResUrl: string;
}

export function useProgressiveImage({ lowResUrl, highResUrl, placeholder }: UseProgressiveImageOptions) {
  const { data: cachedUrl, isLoading, isError } = useQuery({
    queryKey: ["progressive-image", highResUrl],
    queryFn: () => cacheImage(highResUrl),
    enabled: !!highResUrl,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const src = cachedUrl ?? lowResUrl ?? placeholder ?? "";

  return { src, isLoaded: !isLoading, isError };
}
