import { describe, expect, it, vi, beforeEach } from 'vitest';
import { cached, clearCache } from '@/lib/server-cache';

describe('server-cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe('cached', () => {
    it('returns data from fetcher on first call', async () => {
      const fetcher = vi.fn().mockResolvedValue('result');
      const data = await cached('key1', 1000, fetcher);
      expect(data).toBe('result');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('returns cached data within TTL', async () => {
      const fetcher = vi.fn().mockResolvedValue('result');
      await cached('key2', 60000, fetcher);
      const data = await cached('key2', 60000, fetcher);
      expect(data).toBe('result');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('calls fetcher again after TTL expires', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const fetcher = vi.fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');

      const data1 = await cached('key3', 1000, fetcher);
      expect(data1).toBe('first');
      expect(fetcher).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1001);

      const data2 = await cached('key3', 1000, fetcher);
      expect(data2).toBe('second');
      expect(fetcher).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('handles different keys independently', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('a');
      const fetcher2 = vi.fn().mockResolvedValue('b');
      const data1 = await cached('kA', 60000, fetcher1);
      const data2 = await cached('kB', 60000, fetcher2);
      expect(data1).toBe('a');
      expect(data2).toBe('b');
      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });

    it('caches complex objects', async () => {
      const obj = { items: [1, 2, 3], nested: { key: 'value' } };
      const fetcher = vi.fn().mockResolvedValue(obj);
      const result = await cached('complex', 60000, fetcher);
      expect(result).toEqual(obj);
    });

    it('returns fresh data when entry expires', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      let counter = 0;
      const fetcher = vi.fn().mockImplementation(() => Promise.resolve(++counter));

      const r1 = await cached('expiring', 500, fetcher);
      expect(r1).toBe(1);

      vi.advanceTimersByTime(501);

      const r2 = await cached('expiring', 500, fetcher);
      expect(r2).toBe(2);

      vi.useRealTimers();
    });
  });

  describe('clearCache', () => {
    it('clears all cached entries', async () => {
      const fetcher = vi.fn().mockResolvedValue('data');
      await cached('toClear', 60000, fetcher);
      clearCache();
      await cached('toClear', 60000, fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('can be called when cache is empty', () => {
      expect(() => clearCache()).not.toThrow();
    });
  });
});
