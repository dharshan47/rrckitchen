import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventBus, globalEventBus, AppEvents } from '@/lib/patterns/event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on / emit', () => {
    it('calls listener when event is emitted', () => {
      const listener = vi.fn();
      bus.on('test', listener);
      bus.emit('test', 'payload');
      expect(listener).toHaveBeenCalledWith('payload');
    });

    it('supports multiple listeners for same event', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      bus.on('test', l1);
      bus.on('test', l2);
      bus.emit('test', 'data');
      expect(l1).toHaveBeenCalledWith('data');
      expect(l2).toHaveBeenCalledWith('data');
    });

    it('returns an unsubscribe function', () => {
      const listener = vi.fn();
      const unsub = bus.on('test', listener);
      unsub();
      bus.emit('test', 'data');
      expect(listener).not.toHaveBeenCalled();
    });

    it('does not call listeners for different events', () => {
      const listener = vi.fn();
      bus.on('eventA', listener);
      bus.emit('eventB', 'data');
      expect(listener).not.toHaveBeenCalled();
    });

    it('silently ignores listener errors', () => {
      bus.on('test', () => { throw new Error('boom'); });
      expect(() => bus.emit('test', 'data')).not.toThrow();
    });
  });

  describe('once', () => {
    it('calls listener only once', () => {
      const listener = vi.fn();
      bus.once('test', listener);
      bus.emit('test', 'first');
      bus.emit('test', 'second');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('does not affect regular listeners', () => {
      const onceListener = vi.fn();
      const regularListener = vi.fn();
      bus.once('test', onceListener);
      bus.on('test', regularListener);
      bus.emit('test', 'data');
      bus.emit('test', 'data');
      expect(onceListener).toHaveBeenCalledTimes(1);
      expect(regularListener).toHaveBeenCalledTimes(2);
    });

    it('silently ignores once listener errors', () => {
      bus.once('test', () => { throw new Error('boom'); });
      expect(() => bus.emit('test', 'data')).not.toThrow();
    });
  });

  describe('off', () => {
    it('removes a specific listener', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      bus.on('test', l1);
      bus.on('test', l2);
      bus.off('test', l1);
      bus.emit('test', 'data');
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalled();
    });

    it('removes a once listener', () => {
      const listener = vi.fn();
      bus.once('test', listener);
      bus.off('test', listener);
      bus.emit('test', 'data');
      expect(listener).not.toHaveBeenCalled();
    });

    it('does nothing for non-existent event', () => {
      expect(() => bus.off('nonexistent', vi.fn())).not.toThrow();
    });
  });

  describe('clear', () => {
    it('clears listeners for a specific event', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      bus.on('eventA', l1);
      bus.on('eventB', l2);
      bus.clear('eventA');
      bus.emit('eventA', 'data');
      bus.emit('eventB', 'data');
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalled();
    });

    it('clears all listeners when no event specified', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      bus.on('eventA', l1);
      bus.on('eventB', l2);
      bus.clear();
      bus.emit('eventA', 'data');
      bus.emit('eventB', 'data');
      expect(l1).not.toHaveBeenCalled();
      expect(l2).not.toHaveBeenCalled();
    });
  });

  describe('globalEventBus', () => {
    it('is an instance of EventBus', () => {
      expect(globalEventBus).toBeInstanceOf(EventBus);
    });

    it('works as a shared bus', () => {
      const listener = vi.fn();
      globalEventBus.on('global-test', listener);
      globalEventBus.emit('global-test', 'hello');
      expect(listener).toHaveBeenCalledWith('hello');
      globalEventBus.clear('global-test');
    });
  });

  describe('AppEvents', () => {
    it('has all expected event constants', () => {
      expect(AppEvents.CART_UPDATED).toBe('cart:updated');
      expect(AppEvents.AUTH_CHANGED).toBe('auth:changed');
      expect(AppEvents.MENU_FILTER_CHANGED).toBe('menu:filter-changed');
      expect(AppEvents.ORDER_PLACED).toBe('order:placed');
      expect(AppEvents.NETWORK_STATUS_CHANGED).toBe('network:status-changed');
      expect(AppEvents.RIDER_LOCATION_UPDATED).toBe('rider:location-updated');
      expect(AppEvents.ORDER_STATUS_CHANGED).toBe('order:status-changed');
      expect(AppEvents.UPSELL_TRIGGERED).toBe('order:upsell-triggered');
      expect(AppEvents.NOTIFICATION_SENT).toBe('notification:sent');
    });
  });
});
