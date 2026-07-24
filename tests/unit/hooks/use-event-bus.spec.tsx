import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventBus, useEventBusOnce, useEmitEvent } from '@/hooks/useEventBus';

const mockOn = vi.hoisted(() => vi.fn(() => vi.fn()));
const mockOnce = vi.hoisted(() => vi.fn());
const mockEmit = vi.hoisted(() => vi.fn());

vi.mock('@/lib/patterns/event-bus', () => ({
  globalEventBus: {
    on: mockOn,
    once: mockOnce,
    emit: mockEmit,
  },
}));

describe('useEventBus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to an event', () => {
    const handler = vi.fn();
    renderHook(() => useEventBus('test:event', handler));
    expect(mockOn).toHaveBeenCalledWith('test:event', expect.any(Function));
  });

  it('calls handler when event is emitted', () => {
    const handler = vi.fn();
    mockOn.mockImplementation((() => {
      const unsub = vi.fn();
      return unsub;
    }) as unknown as typeof mockOn);

    renderHook(() => useEventBus('test:event', handler));
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(mockOn).mockReturnValue(unsubscribe as never);

    const { unmount } = renderHook(() => useEventBus('test:event', vi.fn()));
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('useEventBusOnce', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes once to an event', () => {
    renderHook(() => useEventBusOnce('test:once', vi.fn()));
    expect(mockOnce).toHaveBeenCalledWith('test:once', expect.any(Function));
  });
});

describe('useEmitEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a function that emits events', () => {
    const { result } = renderHook(() => useEmitEvent());
    act(() => {
      result.current('test:emit', { foo: 'bar' });
    });
    expect(mockEmit).toHaveBeenCalledWith('test:emit', { foo: 'bar' });
  });
});
