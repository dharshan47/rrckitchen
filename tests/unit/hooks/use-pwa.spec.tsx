import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWA } from '@/hooks/usePWA';

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      addEventListener,
      removeEventListener,
    } as unknown as Window & typeof globalThis);
    vi.stubGlobal('navigator', {
      onLine: true,
      serviceWorker: { register: vi.fn().mockResolvedValue({
        installing: null, waiting: null, active: null,
        addEventListener: vi.fn(),
      }) },
      userAgent: 'Mozilla/5.0',
    } as unknown as Navigator);
  });

  it('returns app installed status', async () => {
    const { result } = renderHook(() => usePWA());
    await act(async () => {});
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.isInstallable).toBe(false);
  });

  it('returns can install status when beforeinstallprompt fires', async () => {
    const { result } = renderHook(() => usePWA());

    const beforeInstallHandler = (window.addEventListener as ReturnType<typeof vi.fn>).mock.calls.find(
      ([event]: string[]) => event === 'beforeinstallprompt',
    )?.[1] as ((e: Event) => void) | undefined;

    const mockEvent = { preventDefault: vi.fn() } as unknown as Event;
    act(() => {
      beforeInstallHandler?.(mockEvent);
    });

    await act(async () => {});
    expect(result.current.isInstallable).toBe(true);
  });

  it('returns online status', async () => {
    const { result } = renderHook(() => usePWA());
    await act(async () => {});
    expect(result.current.isOnline).toBe(true);
  });
});
