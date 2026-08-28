import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

describe('fake timer repro', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resolves window.setTimeout with fake timers', async () => {
    let resolved = false;
    const p = new Promise((r) => window.setTimeout(() => { resolved = true; r(1); }, 300));
    await act(async () => { vi.advanceTimersByTime(300); });
    await p;
    expect(resolved).toBe(true);
  });

  it('query resolves and data updates', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay?: number }) => {
        return useQuery<string>({
          queryKey: ['repro', value],
          queryFn: () => new Promise<string>((resolve) => {
            window.setTimeout(() => resolve(value), delay);
          }),
          enabled: true,
          placeholderData: (() => {}) as never,
          staleTime: delay,
          gcTime: 0,
        }).data;
      },
      { initialProps: { value: 'hello', delay: 300 }, wrapper }
    );
    expect(result.current).toBe('hello');
    rerender({ value: 'world', delay: 300 });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('world');
  });
});
