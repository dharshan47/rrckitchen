import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let intersectionCallback: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null;

  beforeEach(() => {
    intersectionCallback = null;
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    function MockIntersectionObserver(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
      intersectionCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
      };
    }
    MockIntersectionObserver.prototype = IntersectionObserver.prototype;

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('returns isIntersecting based on IntersectionObserver mock', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.reset).toBe('function');
  });

  it('updates isIntersecting when entry intersects', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useIntersectionObserver({ enabled }),
      { initialProps: { enabled: false } },
    );

    const div = document.createElement('div');
    (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = div;

    rerender({ enabled: true });

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  it('handles ref changes', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useIntersectionObserver({ enabled }),
      { initialProps: { enabled: false } },
    );

    const div = document.createElement('div');
    (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = div;

    rerender({ enabled: true });

    expect(observeMock).toHaveBeenCalledWith(div);
  });
});
