import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAblyOrderChannel, useAblyOrderListChannels, useAblyKitchenChannel, useAblyDeliveryPersonChannel } from '@/hooks/useAblySubscribe';

const { mockSubscribe, mockUnsubscribe } = vi.hoisted(() => ({
  mockSubscribe: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock('@/lib/ably/client', () => ({
  subscribeAbly: mockSubscribe,
  unsubscribeAbly: mockUnsubscribe,
}));

describe('useAblyOrderChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to order channel when orderId is provided', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderChannel('order-123', onMessage, true));
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() => useAblyOrderChannel('order-123', onMessage, true));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('does not subscribe when disabled', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderChannel('order-123', onMessage, false));
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('does not subscribe when orderId is undefined', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderChannel(undefined, onMessage, true));
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});

describe('useAblyOrderListChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to a channel for every order id', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderListChannels(['o-1', 'o-2', 'o-3'], onMessage, true));
    expect(mockSubscribe).toHaveBeenCalledTimes(3);
  });

  it('unsubscribes from every channel on unmount', () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() => useAblyOrderListChannels(['o-1', 'o-2'], onMessage, true));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
  });

  it('does not subscribe when disabled', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderListChannels(['o-1'], onMessage, false));
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('does not subscribe when the order list is empty', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyOrderListChannels([], onMessage, true));
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});

describe('useAblyKitchenChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to kitchen channel when kitchenId is provided', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyKitchenChannel('kitchen-456', onMessage, true));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});

describe('useAblyDeliveryPersonChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to delivery partner channel when deliveryPersonId is provided', () => {
    const onMessage = vi.fn();
    renderHook(() => useAblyDeliveryPersonChannel('dp-789', onMessage, true));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});
