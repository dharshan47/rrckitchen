import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualizedMenu } from '@/hooks/useVirtualizedMenu';
import { useVirtualizer } from '@tanstack/react-virtual';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(),
}));

describe('useVirtualizedMenu', () => {
  const mockUseVirtualizer = vi.mocked(useVirtualizer);

  const mockVirtualizer = {
    getVirtualItems: vi.fn().mockReturnValue([]),
    getTotalSize: vi.fn().mockReturnValue(0),
    scrollToIndex: vi.fn(),
    scrollToOffset: vi.fn(),
    measure: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVirtualizer.mockReturnValue(mockVirtualizer as never);
  });

  it('returns parentRef, virtualizer, visibleItems, and totalSize', () => {
    const { result } = renderHook(() =>
      useVirtualizedMenu({ items: ['a', 'b', 'c'] }),
    );

    expect(result.current.parentRef).toBeDefined();
    expect(result.current.virtualizer).toBe(mockVirtualizer);
    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.totalSize).toBe(0);
  });

  it('passes items count to useVirtualizer', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    renderHook(() => useVirtualizedMenu({ items }));

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 5,
      }),
    );
  });

  it('uses default estimateSize of 140', () => {
    const items = ['a', 'b'];
    renderHook(() => useVirtualizedMenu({ items }));

    const options = mockUseVirtualizer.mock.calls[0][0];
    expect(options.estimateSize(0)).toBe(140);
  });

  it('uses custom estimateSize', () => {
    const items = ['a', 'b'];
    renderHook(() => useVirtualizedMenu({ items, estimateSize: 200 }));

    const options = mockUseVirtualizer.mock.calls[0][0];
    expect(options.estimateSize(0)).toBe(200);
  });

  it('uses default overscan of 3', () => {
    const items = ['a', 'b'];
    renderHook(() => useVirtualizedMenu({ items }));

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        overscan: 3,
      }),
    );
  });

  it('uses custom overscan', () => {
    const items = ['a', 'b'];
    renderHook(() => useVirtualizedMenu({ items, overscan: 5 }));

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        overscan: 5,
      }),
    );
  });

  it('maps virtual items to visibleItems', () => {
    mockVirtualizer.getVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 140 },
      { index: 1, start: 140, size: 140 },
    ]);

    const items = ['a', 'b', 'c', 'd'];
    const { result } = renderHook(() => useVirtualizedMenu({ items }));

    expect(result.current.visibleItems).toEqual([
      { virtualIndex: 0, item: 'a' },
      { virtualIndex: 1, item: 'b' },
    ]);
  });

  it('returns totalSize from virtualizer', () => {
    mockVirtualizer.getTotalSize.mockReturnValue(560);

    const { result } = renderHook(() =>
      useVirtualizedMenu({ items: ['a', 'b', 'c', 'd'] }),
    );

    expect(result.current.totalSize).toBe(560);
  });

  it('passes getScrollElement function to useVirtualizer', () => {
    renderHook(() => useVirtualizedMenu({ items: ['a'] }));

    const options = mockUseVirtualizer.mock.calls[0][0];
    expect(typeof options.getScrollElement).toBe('function');
  });

  it('returns parentRef as a ref object', () => {
    const { result } = renderHook(() =>
      useVirtualizedMenu({ items: ['a'] }),
    );

    expect(result.current.parentRef).toHaveProperty('current');
  });

  it('handles empty items array', () => {
    mockVirtualizer.getVirtualItems.mockReturnValue([]);
    mockVirtualizer.getTotalSize.mockReturnValue(0);

    const { result } = renderHook(() => useVirtualizedMenu({ items: [] }));

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.totalSize).toBe(0);
  });

  it('handles object items', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    mockVirtualizer.getVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 140 },
      { index: 1, start: 140, size: 140 },
    ]);

    const { result } = renderHook(() => useVirtualizedMenu({ items }));

    expect(result.current.visibleItems).toEqual([
      { virtualIndex: 0, item: { id: 1, name: 'Item 1' } },
      { virtualIndex: 1, item: { id: 2, name: 'Item 2' } },
    ]);
  });
});
