import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRequestDedupe } from '@/hooks/useRequestDedupe';

describe('useRequestDedupe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns dedupe and invalidate functions', () => {
    const { result } = renderHook(() => useRequestDedupe());
    expect(typeof result.current.dedupe).toBe('function');
    expect(typeof result.current.invalidate).toBe('function');
  });

  it('calls fetcher on first dedupe call', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const fetcher = vi.fn().mockResolvedValue('data');

    let res: string | undefined;
    await act(async () => {
      res = await result.current.dedupe('key1', fetcher);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(res).toBe('data');
  });

  it('returns same promise for duplicate calls within dedupe window', async () => {
    const { result } = renderHook(() => useRequestDedupe(5000));
    const fetcher = vi.fn().mockResolvedValue('data');

    const p1 = result.current.dedupe('key1', fetcher);
    const p2 = result.current.dedupe('key1', fetcher);

    expect(p1).toBe(p2);
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await p1;
    });
  });

  it('calls fetcher again after dedupe window expires', async () => {
    const { result } = renderHook(() => useRequestDedupe(1000));
    const fetcher = vi.fn().mockResolvedValue('data');

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('uses default dedupe window of 5000ms', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const fetcher = vi.fn().mockResolvedValue('data');

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    const p2 = result.current.dedupe('key1', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await p2;
    });
  });

  it('different keys do not dedupe against each other', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const fetcher1 = vi.fn().mockResolvedValue('data1');
    const fetcher2 = vi.fn().mockResolvedValue('data2');

    await act(async () => {
      await result.current.dedupe('key1', fetcher1);
    });
    await act(async () => {
      await result.current.dedupe('key2', fetcher2);
    });

    expect(fetcher1).toHaveBeenCalledTimes(1);
    expect(fetcher2).toHaveBeenCalledTimes(1);
  });

  it('invalidate clears all pending requests', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const fetcher = vi.fn().mockResolvedValue('data');

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    act(() => {
      result.current.invalidate();
    });

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidate with pattern clears matching requests', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const fetcher1 = vi.fn().mockResolvedValue('data1');
    const fetcher2 = vi.fn().mockResolvedValue('data2');

    await act(async () => {
      await result.current.dedupe('user:123', fetcher1);
    });
    await act(async () => {
      await result.current.dedupe('order:456', fetcher2);
    });

    act(() => {
      result.current.invalidate('user');
    });

    await act(async () => {
      await result.current.dedupe('user:123', fetcher1);
    });
    await act(async () => {
      await result.current.dedupe('order:456', fetcher2);
    });

    expect(fetcher1).toHaveBeenCalledTimes(2);
    expect(fetcher2).toHaveBeenCalledTimes(1);
  });

  it('propagates fetcher errors', async () => {
    const { result } = renderHook(() => useRequestDedupe());
    const error = new Error('fetch failed');
    const fetcher = vi.fn().mockRejectedValue(error);

    await expect(
      act(async () => {
        await result.current.dedupe('key1', fetcher);
      }),
    ).rejects.toThrow('fetch failed');
  });

  it('cleans up pending request after dedupe window', async () => {
    const { result } = renderHook(() => useRequestDedupe(1000));
    const fetcher = vi.fn().mockResolvedValue('data');

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('updates dedupe window on rerender', async () => {
    const { result, rerender } = renderHook(
      ({ ms }: { ms: number }) => useRequestDedupe(ms),
      { initialProps: { ms: 5000 } },
    );
    const fetcher = vi.fn().mockResolvedValue('data');

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    rerender({ ms: 1000 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await result.current.dedupe('key1', fetcher);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
