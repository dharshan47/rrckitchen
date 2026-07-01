import { describe, expect, it } from 'vitest';
import { cachedRequest, invalidateRequestCache } from '@/lib/cache';

describe('Cached Request', () => {
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
