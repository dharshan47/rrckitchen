import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates debounced value after delay', () => {
    const { result, rerender } = renderHook(({ value, delay }: { value: string; delay?: number }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'hello', delay: 300 },
    });
    expect(result.current).toBe('hello');
    rerender({ value: 'world', delay: 300 });
    expect(result.current).toBe('hello');
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('world');
  });

  it('cancels previous timer on rapid updates', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('c');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value), {
      initialProps: { value: 'first' },
    });
    rerender({ value: 'second' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('second');
  });

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 500), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('b');
  });
});
