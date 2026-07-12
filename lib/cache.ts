const IMAGE_CACHE_MAX = 50;
const imageCache = new Map<string, { blob: Blob; url: string }>();

/**
 * Fetches and caches an image as a blob, returning an object URL.
 * Falls back to the original URL on fetch failure.
 * Evicts oldest entries when cache exceeds IMAGE_CACHE_MAX.
 */
export async function cacheImage(url: string): Promise<string> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!.url;
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    if (imageCache.size >= IMAGE_CACHE_MAX) {
      const oldestKey = imageCache.keys().next().value;
      if (oldestKey) {
        const oldest = imageCache.get(oldestKey);
        if (oldest) URL.revokeObjectURL(oldest.url);
        imageCache.delete(oldestKey);
      }
    }
    const objectUrl = URL.createObjectURL(blob);
    imageCache.set(url, { blob, url: objectUrl });
    return objectUrl;
  } catch {
    return url;
  }
}

/** Returns the cached object URL for a previously cached image, or null. */
export function getCachedImage(url: string): string | null {
  return imageCache.get(url)?.url ?? null;
}

/** Clears all cached image blobs and revokes their object URLs. */
export function clearImageCache(): void {
  imageCache.forEach(({ url }) => URL.revokeObjectURL(url));
  imageCache.clear();
}

const REQUEST_CACHE_MAX = 100;
const requestCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Caches the result of an async request function by key with a TTL.
 * Returns a promise immediately — if cached and still fresh, resolves
 * from cache. Evicts oldest entries when cache exceeds REQUEST_CACHE_MAX.
 */
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
    if (requestCache.size >= REQUEST_CACHE_MAX) {
      const oldestKey = requestCache.keys().next().value;
      if (oldestKey) requestCache.delete(oldestKey);
    }
    requestCache.set(key, { data, timestamp: Date.now() });
    return data;
  });
  return { data: promise, cancel: () => {} };
}

/** Invalidates cached requests, optionally matching keys against a regex pattern. */
export function invalidateRequestCache(pattern?: RegExp): void {
  if (pattern) {
    for (const key of requestCache.keys()) {
      if (pattern.test(key)) requestCache.delete(key);
    }
  } else {
    requestCache.clear();
  }
}

const DEBOUNCE_CACHE_MAX = 50;
const debounceCache = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Debounces a function call by key. Cancels any previous pending
 * invocation for the same key before scheduling a new one.
 * Evicts oldest entries when cache exceeds DEBOUNCE_CACHE_MAX.
 */
export function debounceRequest(key: string, fn: () => void, delay = 300): void {
  const existing = debounceCache.get(key);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    debounceCache.delete(key);
    fn();
  }, delay);
  debounceCache.set(key, timer);
  if (debounceCache.size > DEBOUNCE_CACHE_MAX) {
    const oldestKey = debounceCache.keys().next().value;
    if (oldestKey) {
      const oldestTimer = debounceCache.get(oldestKey);
      if (oldestTimer) clearTimeout(oldestTimer);
      debounceCache.delete(oldestKey);
    }
  }
}

/** Clears all caches — image, request, and debounce. */
export function clearAllCaches(): void {
  clearImageCache();
  requestCache.clear();
  debounceCache.forEach((timer) => clearTimeout(timer));
  debounceCache.clear();
}
