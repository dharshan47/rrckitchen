import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cachedRequest, invalidateRequestCache, cacheImage, clearImageCache, clearAllCaches, getCachedImage, debounceRequest } from '@/lib/cache';

describe('Image Cache', () => {
  it('returns blank URL on fetch failure', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('network error')));
    const result = await cacheImage('https://example.com/img.jpg');
    expect(result).toBe('https://example.com/img.jpg');
    vi.unstubAllGlobals();
  });

  it('caches and retrieves image', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', () => Promise.resolve(new Response(mockBlob)));
    const result = await cacheImage('https://example.com/cached.jpg');
    expect(result).toContain('blob:');
    const cached = getCachedImage('https://example.com/cached.jpg');
    expect(cached).toBe(result);
    vi.unstubAllGlobals();
  });

  it('clears image cache', async () => {
    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', () => Promise.resolve(new Response(mockBlob)));
    await cacheImage('https://example.com/clear.jpg');
    clearImageCache();
    expect(getCachedImage('https://example.com/clear.jpg')).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('Request Cache', () => {
  it('returns data from fetcher', async () => {
    const { data } = cachedRequest('key1', () => Promise.resolve('hello'));
    expect(await data).toBe('hello');
  });

  it('caches repeated requests within TTL', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    };

    const { data: data1 } = cachedRequest('key2', fetcher, 60000);
    expect(await data1).toBe('result-1');

    const { data: data2 } = cachedRequest('key2', fetcher, 60000);
    expect(await data2).toBe('result-1');
    expect(callCount).toBe(1);
  });

  it('invalidates specific cache keys', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return Promise.resolve('data');
    };

    await cachedRequest('key3', fetcher, 60000).data;
    invalidateRequestCache(/key3/);
    await cachedRequest('key3', fetcher, 60000).data;
    expect(callCount).toBe(2);
  });

  it('invalidates all cache', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return Promise.resolve('data');
    };

    await cachedRequest('key4', fetcher, 60000).data;
    invalidateRequestCache();
    await cachedRequest('key4', fetcher, 60000).data;
    expect(callCount).toBe(2);
  });

  it('handles fetcher errors', async () => {
    const { data } = cachedRequest('key-error', () => Promise.reject(new Error('fail')));
    await expect(data).rejects.toThrow('fail');
  });
});

describe('Debounce Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces function calls', () => {
    const fn = vi.fn();
    debounceRequest('test-key', fn, 300);
    debounceRequest('test-key', fn, 300);
    debounceRequest('test-key', fn, 300);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls function after delay', () => {
    const fn = vi.fn();
    debounceRequest('unique-key', fn, 500);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('Clear All Caches', () => {
  it('clears all caches without error', () => {
    expect(() => clearAllCaches()).not.toThrow();
  });
});
