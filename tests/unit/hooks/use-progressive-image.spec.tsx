import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgressiveImage } from '@/hooks/useProgressiveImage';
import { useQuery } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/lib/cache', () => ({
  cacheImage: vi.fn(),
}));

describe('useProgressiveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowResUrl as src when loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        lowResUrl: '/low-res.jpg',
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(result.current.src).toBe('/low-res.jpg');
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('returns cachedUrl as src when loaded', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: '/cached.jpg',
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        lowResUrl: '/low-res.jpg',
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(result.current.src).toBe('/cached.jpg');
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('returns placeholder when no cached or lowRes url', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        highResUrl: '/high-res.jpg',
        placeholder: 'data:image/gif;base64,...',
      }),
    );

    expect(result.current.src).toBe('data:image/gif;base64,...');
  });

  it('returns empty string when no src available', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(result.current.src).toBe('');
  });

  it('returns isError from query', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(result.current.isError).toBe(true);
  });

  it('passes correct queryKey and queryFn to useQuery', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useQuery>);

    renderHook(() =>
      useProgressiveImage({
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['progressive-image', '/high-res.jpg'],
        enabled: true,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('disables query when highResUrl is empty', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    renderHook(() =>
      useProgressiveImage({
        highResUrl: '',
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('prefers cachedUrl over lowResUrl', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: '/cached.jpg',
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    const { result } = renderHook(() =>
      useProgressiveImage({
        lowResUrl: '/low-res.jpg',
        highResUrl: '/high-res.jpg',
      }),
    );

    expect(result.current.src).toBe('/cached.jpg');
  });
});
