import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300), { wrapper: createWrapper() });
    expect(result.current).toBe('hello');
  });

  it('updates debounced value after delay', async () => {
    const { result, rerender } = renderHook(({ value, delay }: { value: string; delay?: number }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'hello', delay: 300 },
      wrapper: createWrapper(),
    });
    expect(result.current).toBe('hello');
    rerender({ value: 'world', delay: 300 });
    expect(result.current).toBe('hello');
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('world');
  });

  it('cancels previous timer on rapid updates', async () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
      wrapper: createWrapper(),
    });
    rerender({ value: 'b' });
    rerender({ value: 'c' });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('c');
  });

  it('uses default delay of 300ms', async () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value), {
      initialProps: { value: 'first' },
      wrapper: createWrapper(),
    });
    rerender({ value: 'second' });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('second');
  });

  it('uses custom delay', async () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 500), {
      initialProps: { value: 'a' },
      wrapper: createWrapper(),
    });
    rerender({ value: 'b' });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('a');
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('b');
  });
});

