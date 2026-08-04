import { describe, expect, it, vi, afterEach } from 'vitest';

afterEach(() => { vi.useRealTimers(); });

describe('debug timers', () => {
  it('window.setTimeout faked?', () => {
    vi.useFakeTimers();
    let fired = false;
    window.setTimeout(() => { fired = true; }, 100);
    vi.advanceTimersByTime(100);
    expect(fired).toBe(true);
  });

  it('global setTimeout faked?', () => {
    vi.useFakeTimers();
    let fired = false;
    setTimeout(() => { fired = true; }, 100);
    vi.advanceTimersByTime(100);
    expect(fired).toBe(true);
  });
});
