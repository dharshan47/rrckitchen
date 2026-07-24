import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects mobile based on window width', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false for desktop widths', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('handles resize events', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener,
    });
    vi.stubGlobal('matchMedia', matchMediaMock);

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    const onChange = addEventListener.mock.calls.find(
      ([event]: string[]) => event === 'change',
    )?.[1] as (() => void) | undefined;

    act(() => {
      onChange?.();
    });

    expect(result.current).toBe(false);
    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
