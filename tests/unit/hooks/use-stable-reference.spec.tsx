import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useStableCallback,
  useStableValue,
  useEventCallback,
} from '@/hooks/useStableReference';

describe('useStableCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a function', () => {
    const { result } = renderHook(() => useStableCallback(() => {}));
    expect(typeof result.current).toBe('function');
  });

  it('calls the latest callback', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    let callback = callback1;

    const { result, rerender } = renderHook(() => useStableCallback(callback));

    result.current();
    expect(callback1).toHaveBeenCalledTimes(1);

    callback = callback2;
    rerender();

    result.current();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('returns the same function reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useStableCallback(() => {}));
    const fn1 = result.current;

    rerender();
    const fn2 = result.current;

    expect(fn1).toBe(fn2);
  });

  it('passes arguments to the callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useStableCallback(callback));

    result.current('arg1', 42);

    expect(callback).toHaveBeenCalledWith('arg1', 42);
  });

  it('returns the callback return value', () => {
    const { result } = renderHook(() => useStableCallback(() => 42));
    expect(result.current()).toBe(42);
  });
});

describe('useStableValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a ref with current value', () => {
    const { result } = renderHook(() => useStableValue('hello'));
    expect(result.current.current).toBe('hello');
  });

  it('updates ref.current on rerender', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useStableValue(value),
      { initialProps: { value: 'hello' } },
    );

    expect(result.current.current).toBe('hello');

    rerender({ value: 'world' });
    expect(result.current.current).toBe('world');
  });

  it('returns the same ref object across rerenders', () => {
    const { result, rerender } = renderHook(() => useStableValue('test'));
    const ref1 = result.current;

    rerender();
    const ref2 = result.current;

    expect(ref1).toBe(ref2);
  });

  it('handles object values', () => {
    const obj = { foo: 'bar' };
    const { result, rerender } = renderHook(
      ({ value }: { value: { foo: string } }) => useStableValue(value),
      { initialProps: { value: obj } },
    );

    expect(result.current.current).toBe(obj);

    const newObj = { foo: 'baz' };
    rerender({ value: newObj });
    expect(result.current.current).toBe(newObj);
  });

  it('handles undefined and null values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null | undefined }) => useStableValue(value),
      { initialProps: { value: undefined as string | undefined | null } },
    );

    expect(result.current.current).toBeUndefined();

    rerender({ value: null as string | undefined | null });
    expect(result.current.current).toBeNull();

    rerender({ value: 'defined' });
    expect(result.current.current).toBe('defined');
  });
});

describe('useEventCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a function', () => {
    const { result } = renderHook(() => useEventCallback(() => {}));
    expect(typeof result.current).toBe('function');
  });

  it('calls the latest function', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    let fn = fn1;

    const { result, rerender } = renderHook(() => useEventCallback(fn));

    result.current();
    expect(fn1).toHaveBeenCalledTimes(1);

    fn = fn2;
    rerender();

    result.current();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('returns the same function reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useEventCallback(() => {}));
    const fn1 = result.current;

    rerender();
    const fn2 = result.current;

    expect(fn1).toBe(fn2);
  });

  it('passes arguments correctly', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useEventCallback(callback));

    result.current('a', 'b', 'c');

    expect(callback).toHaveBeenCalledWith('a', 'b', 'c');
  });

  it('returns the callback return value', () => {
    const { result } = renderHook(() => useEventCallback((x: number) => x * 2));
    expect(result.current(5)).toBe(10);
  });
});
