import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAbortController } from '@/hooks/useAbortController';

describe('useAbortController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns getSignal and abort functions', () => {
    const { result } = renderHook(() => useAbortController());
    expect(typeof result.current.getSignal).toBe('function');
    expect(typeof result.current.abort).toBe('function');
  });

  it('getSignal returns an AbortSignal', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it('getSignal returns a new signal each call', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();
    const signal2 = result.current.getSignal();
    expect(signal1).not.toBe(signal2);
  });

  it('aborts the previous signal when getSignal is called again', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();
    expect(signal1.aborted).toBe(false);

    result.current.getSignal();
    expect(signal1.aborted).toBe(true);
  });

  it('abort aborts the current signal', () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    expect(signal.aborted).toBe(false);

    act(() => {
      result.current.abort();
    });
    expect(signal.aborted).toBe(true);
  });

  it('abort is safe to call when no signal has been created', () => {
    const { result } = renderHook(() => useAbortController());
    expect(() => {
      act(() => {
        result.current.abort();
      });
    }).not.toThrow();
  });

  it('aborts on unmount', () => {
    const { result, unmount } = renderHook(() => useAbortController());
    const signal = result.current.getSignal();
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('multiple getSignal calls only abort the most recent previous one', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();
    const signal2 = result.current.getSignal();
    const signal3 = result.current.getSignal();

    expect(signal1.aborted).toBe(true);
    expect(signal2.aborted).toBe(true);
    expect(signal3.aborted).toBe(false);
  });

  it('after abort, getSignal returns a fresh non-aborted signal', () => {
    const { result } = renderHook(() => useAbortController());
    const signal1 = result.current.getSignal();

    act(() => {
      result.current.abort();
    });
    expect(signal1.aborted).toBe(true);

    const signal2 = result.current.getSignal();
    expect(signal2.aborted).toBe(false);
    expect(signal2).not.toBe(signal1);
  });
});
