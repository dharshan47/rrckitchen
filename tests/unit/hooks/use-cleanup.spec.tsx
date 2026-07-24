import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCleanup,
  useTimer,
  useInterval,
  useEventListener,
  useWebSocket,
} from '@/hooks/useCleanup';

describe('useCleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns addCleanup function', () => {
    const { result } = renderHook(() => useCleanup());
    expect(typeof result.current.addCleanup).toBe('function');
  });

  it('addCleanup returns an unsubscribe function', () => {
    const { result } = renderHook(() => useCleanup());
    const unsub = result.current.addCleanup(() => {});
    expect(typeof unsub).toBe('function');
  });

  it('calls cleanup functions on unmount', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { result, unmount } = renderHook(() => useCleanup());

    result.current.addCleanup(fn1);
    result.current.addCleanup(fn2);

    unmount();

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('does not call removed cleanup functions', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { result, unmount } = renderHook(() => useCleanup());

    const unsub1 = result.current.addCleanup(fn1);
    result.current.addCleanup(fn2);

    unsub1();
    unmount();

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('silently catches errors in cleanup functions', () => {
    const errorFn = vi.fn(() => {
      throw new Error('cleanup error');
    });
    const normalFn = vi.fn();
    const { result, unmount } = renderHook(() => useCleanup());

    result.current.addCleanup(errorFn);
    result.current.addCleanup(normalFn);

    expect(() => unmount()).not.toThrow();
    expect(errorFn).toHaveBeenCalledTimes(1);
    expect(normalFn).toHaveBeenCalledTimes(1);
  });

  it('clears the set after unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useCleanup());
    result.current.addCleanup(fn);
    unmount();
    fn.mockClear();

    const { result: result2, unmount: unmount2 } = renderHook(() => useCleanup());
    result2.current.addCleanup(vi.fn());
    unmount2();

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback after delay', () => {
    const callback = vi.fn();
    renderHook(() => useTimer(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useTimer(callback, 1000, false));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimer(callback, 1000));

    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up and recreates timer when delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }: { delay: number }) => useTimer(callback, delay),
      { initialProps: { delay: 1000 } },
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ delay: 2000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses latest callback reference', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    let callback = callback1;

    const { rerender } = renderHook(() => useTimer(callback, 1000));

    callback = callback2;
    rerender();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback repeatedly at interval', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 500));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 500, false));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when delay is <= 0', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 0));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 500));

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('restarts interval when delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }: { delay: number }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } },
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses latest callback reference', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    let callback = callback1;

    const { rerender } = renderHook(() => useInterval(callback, 500));

    callback = callback2;
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

describe('useEventListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds event listener on mount', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const target = { addEventListener, removeEventListener } as unknown as EventTarget;

    renderHook(() => useEventListener('click', vi.fn(), target));

    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined);
  });

  it('removes event listener on unmount', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const target = { addEventListener, removeEventListener } as unknown as EventTarget;

    const { unmount } = renderHook(() => useEventListener('click', vi.fn(), target));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined);
  });

  it('calls handler when event fires', () => {
    let listener: ((e: Event) => void) | undefined;
    const addEventListener = vi.fn((_, fn) => { listener = fn; });
    const target = { addEventListener, removeEventListener: vi.fn() } as unknown as EventTarget;

    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler, target));

    const mockEvent = new Event('click');
    listener?.(mockEvent);

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('uses latest handler reference', () => {
    let listener: ((e: Event) => void) | undefined;
    const addEventListener = vi.fn((_, fn) => { listener = fn; });
    const target = { addEventListener, removeEventListener: vi.fn() } as unknown as EventTarget;

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    let handler = handler1;

    const { rerender } = renderHook(() => useEventListener('click', handler, target));

    handler = handler2;
    rerender();

    listener?.(new Event('click'));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('passes options to addEventListener', () => {
    const addEventListener = vi.fn();
    const target = { addEventListener, removeEventListener: vi.fn() } as unknown as EventTarget;
    const options = { once: true };

    renderHook(() => useEventListener('click', vi.fn(), target, options));

    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function), options);
  });
});

describe('useWebSocket', () => {
  let mockWs: {
    onopen: (() => void) | null;
    onmessage: ((e: MessageEvent) => void) | null;
    onclose: (() => void) | null;
    onerror: ((e: Event) => void) | null;
    send: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    readyState: number;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWs = {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
    };

    vi.stubGlobal('WebSocket', vi.fn(() => mockWs) as unknown as typeof WebSocket);
  });

  it('creates WebSocket on mount with url', () => {
    renderHook(() => useWebSocket('ws://localhost:8080'));
    expect(WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
  });

  it('does not create WebSocket when url is null', () => {
    renderHook(() => useWebSocket(null));
    expect(WebSocket).not.toHaveBeenCalled();
  });

  it('calls onOpen when connection opens', () => {
    const onOpen = vi.fn();
    renderHook(() => useWebSocket('ws://localhost:8080', { onOpen }));

    mockWs.onopen?.();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onMessage with parsed JSON data', () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket('ws://localhost:8080', { onMessage }));

    const data = JSON.stringify({ type: 'test' });
    mockWs.onmessage?.({ data } as MessageEvent);

    expect(onMessage).toHaveBeenCalledWith({ type: 'test' });
  });

  it('calls onMessage with raw data when JSON parse fails', () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket('ws://localhost:8080', { onMessage }));

    mockWs.onmessage?.({ data: 'not-json' } as MessageEvent);

    expect(onMessage).toHaveBeenCalledWith('not-json');
  });

  it('calls onClose when connection closes', () => {
    const onClose = vi.fn();
    renderHook(() => useWebSocket('ws://localhost:8080', { onClose }));

    mockWs.onclose?.();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onError when error occurs', () => {
    const onError = vi.fn();
    renderHook(() => useWebSocket('ws://localhost:8080', { onError }));

    const errorEvent = new Event('error');
    mockWs.onerror?.(errorEvent);

    expect(onError).toHaveBeenCalledWith(errorEvent);
  });

  it('sends JSON data when connection is open', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    result.current.send({ type: 'message' });

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'message' }));
  });

  it('does not send data when connection is not open', () => {
    mockWs.readyState = 0; // CONNECTING
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    result.current.send({ type: 'message' });

    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it('closes WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket('ws://localhost:8080'));

    unmount();

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('exposes close function', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    result.current.close();

    expect(mockWs.close).toHaveBeenCalled();
  });
});
