import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExploreKitchens, useKitchenCategories } from '@/hooks/useExploreKitchens';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
};

describe('useExploreKitchens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], nextCursor: null }),
    });
    const { result } = renderHook(() => useExploreKitchens(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches kitchens successfully', async () => {
    const mockResponse = {
      data: [
        { id: '1', slug: 'test-kitchen', displayName: 'Test Kitchen', avgRating: 4.5, totalReviews: 10, imageUrl: null, cuisineTags: ['South Indian'], items: [], timeSlots: ['MORNING'] },
      ],
      nextCursor: null,
    };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    const { result } = renderHook(() => useExploreKitchens(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data?.pages[0].data).toHaveLength(1);
    expect(result.current.data?.pages[0].data[0].displayName).toBe('Test Kitchen');
  });

  it('includes category in query when provided', () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], nextCursor: null }),
    });
    renderHook(() => useExploreKitchens('south-indian'), { wrapper: createWrapper() });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('category=south-indian'));
  });
});

describe('useKitchenCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches categories successfully', async () => {
    const mockCategories = [
      { id: 'c1', name: 'South Indian', kitchenCount: 5, imageUrl: '/categories/idli.png' },
      { id: 'c2', name: 'North Indian', kitchenCount: 3, imageUrl: '/categories/naan.png' },
    ];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });
    const { result } = renderHook(() => useKitchenCategories(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe('South Indian');
  });

  it('fetches from correct endpoint', () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    renderHook(() => useKitchenCategories(), { wrapper: createWrapper() });
    expect(global.fetch).toHaveBeenCalledWith('/api/kitchen/categories');
  });

  it('handles fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });
    const { result } = renderHook(() => useKitchenCategories(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
