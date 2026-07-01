const imageCache = new Map<string, { blob: Blob; url: string }>();

export async function cacheImage(url: string): Promise<string> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!.url;
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    imageCache.set(url, { blob, url: objectUrl });
    return objectUrl;
  } catch {
    return url;
  }
}

export function getCachedImage(url: string): string | null {
  return imageCache.get(url)?.url ?? null;
}

export function clearImageCache(): void {
  imageCache.forEach(({ url }) => URL.revokeObjectURL(url));
  imageCache.clear();
}

const requestCache = new Map<string, { data: unknown; timestamp: number }>();

export function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000
): { data: Promise<T>; cancel: () => void } {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return { data: Promise.resolve(cached.data as T), cancel: () => {} };
  }
  const promise = fetcher().then((data) => {
    requestCache.set(key, { data, timestamp: Date.now() });
    return data;
  });
  return { data: promise, cancel: () => {} };
}

export function invalidateRequestCache(pattern?: RegExp): void {
  if (pattern) {
    for (const key of requestCache.keys()) {
      if (pattern.test(key)) requestCache.delete(key);
    }
  } else {
    requestCache.clear();
  }
}
