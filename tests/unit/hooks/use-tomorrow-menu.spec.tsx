import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTomorrowMenu, tomorrowMenuKeys } from '@/hooks/useTomorrowMenu';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { menuStore } from '@/stores';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  keepPreviousData: Symbol('keepPreviousData'),
}));

vi.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: vi.fn(),
}));

vi.mock('@/stores', () => ({
  menuStore: vi.fn(),
}));

describe('useTomorrowMenu', () => {
  const mockMenuStore = vi.mocked(menuStore);
  const mockUseQuery = vi.mocked(useQuery);
  const mockUseDebouncedValue = vi.mocked(useDebouncedValue);

  beforeEach(() => {
    vi.clearAllMocks();

    mockMenuStore.mockImplementation((selector: (state: any) => unknown) => {
      const state = {
        searchQuery: '',
        selectedFoodType: 'ALL' as const,
        selectedTimeSlot: 'ALL' as const,
        selectedTab: 'menu' as const,
        bestsellerOnly: false,
        deliveryAddress: '',
        setSearchQuery: vi.fn(),
        setSelectedFoodType: vi.fn(),
        setSelectedTimeSlot: vi.fn(),
        setSelectedTab: vi.fn(),
        setDeliveryAddress: vi.fn(),
        setBestsellerOnly: vi.fn(),
      };
      return selector(state);
    });

    mockUseDebouncedValue.mockImplementation((value: unknown) => value as string);

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  it('returns useQuery result', () => {
    const { result } = renderHook(() => useTomorrowMenu());
    expect(result.current).toBeDefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('uses keepPreviousData as placeholderData', () => {
    renderHook(() => useTomorrowMenu());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      }),
    );
  });

  it('builds query key with filter state', () => {
    renderHook(() => useTomorrowMenu());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'tomorrow-menu',
          {
            q: '',
            foodType: 'ALL',
            timeSlot: 'ALL',
            bestseller: false,
          },
        ],
      }),
    );
  });

  it('uses debounced search in query key', () => {
    mockUseDebouncedValue.mockReturnValue('pizza');

    renderHook(() => useTomorrowMenu());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'tomorrow-menu',
          {
            q: 'pizza',
            foodType: 'ALL',
            timeSlot: 'ALL',
            bestseller: false,
          },
        ],
      }),
    );
  });

  it('passes correct query options', () => {
    renderHook(() => useTomorrowMenu());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: 30_000,
        gcTime: 120_000,
        refetchOnWindowFocus: false,
      }),
    );
  });

  it('reads state from menuStore', () => {
    mockMenuStore.mockImplementation((selector: (state: any) => unknown) => {
      const state = {
        searchQuery: 'burger',
        selectedFoodType: 'VEG' as const,
        selectedTimeSlot: 'LUNCH' as const,
        selectedTab: 'menu' as const,
        bestsellerOnly: true,
        deliveryAddress: '',
        setSearchQuery: vi.fn(),
        setSelectedFoodType: vi.fn(),
        setSelectedTimeSlot: vi.fn(),
        setSelectedTab: vi.fn(),
        setDeliveryAddress: vi.fn(),
        setBestsellerOnly: vi.fn(),
      };
      return selector(state);
    });

    renderHook(() => useTomorrowMenu());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'tomorrow-menu',
          {
            q: 'burger',
            foodType: 'VEG',
            timeSlot: 'LUNCH',
            bestseller: true,
          },
        ],
      }),
    );
  });

  it('builds URL with query params', async () => {
    let queryFn: (() => Promise<unknown>) | undefined;

    mockUseQuery.mockImplementation((options: any) => {
      queryFn = options.queryFn as () => Promise<unknown>;
      return {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any;
    });

    mockMenuStore.mockImplementation((selector: (state: any) => unknown) => {
      const state = {
        searchQuery: '',
        selectedFoodType: 'VEG' as const,
        selectedTimeSlot: 'ALL' as const,
        selectedTab: 'menu' as const,
        bestsellerOnly: false,
        deliveryAddress: '',
        setSearchQuery: vi.fn(),
        setSelectedFoodType: vi.fn(),
        setSelectedTimeSlot: vi.fn(),
        setSelectedTab: vi.fn(),
        setDeliveryAddress: vi.fn(),
        setBestsellerOnly: vi.fn(),
      };
      return selector(state);
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });

    renderHook(() => useTomorrowMenu());

    await queryFn?.();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/menu/tomorrow?foodType=VEG');
  });

  it('builds URL with all params', async () => {
    let queryFn: (() => Promise<unknown>) | undefined;

    mockUseQuery.mockImplementation((options: any) => {
      queryFn = options.queryFn as () => Promise<unknown>;
      return {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any;
    });

    mockMenuStore.mockImplementation((selector: (state: any) => unknown) => {
      const state = {
        searchQuery: 'pizza',
        selectedFoodType: 'NONVEG' as const,
        selectedTimeSlot: 'DINNER' as const,
        selectedTab: 'menu' as const,
        bestsellerOnly: true,
        deliveryAddress: '',
        setSearchQuery: vi.fn(),
        setSelectedFoodType: vi.fn(),
        setSelectedTimeSlot: vi.fn(),
        setSelectedTab: vi.fn(),
        setDeliveryAddress: vi.fn(),
        setBestsellerOnly: vi.fn(),
      };
      return selector(state);
    });

    mockUseDebouncedValue.mockReturnValue('pizza');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });

    renderHook(() => useTomorrowMenu());

    await queryFn?.();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/menu/tomorrow?q=pizza&foodType=NONVEG&timeSlot=DINNER&bestseller=true',
    );
  });

  it('throws error on non-ok response', async () => {
    let queryFn: (() => Promise<unknown>) | undefined;

    mockUseQuery.mockImplementation((options: any) => {
      queryFn = options.queryFn as () => Promise<unknown>;
      return {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });

    renderHook(() => useTomorrowMenu());

    await expect(queryFn?.()).rejects.toThrow('Server error');
  });
});

describe('tomorrowMenuKeys', () => {
  it('has correct all key', () => {
    expect(tomorrowMenuKeys.all).toEqual(['tomorrow-menu']);
  });

  it('builds filtered key', () => {
    const key = tomorrowMenuKeys.filtered({
      q: 'pizza',
      foodType: 'VEG',
      timeSlot: 'LUNCH',
    });
    expect(key).toEqual([
      'tomorrow-menu',
      { q: 'pizza', foodType: 'VEG', timeSlot: 'LUNCH' },
    ]);
  });

  it('handles empty params in filtered key', () => {
    const key = tomorrowMenuKeys.filtered({});
    expect(key).toEqual(['tomorrow-menu', {}]);
  });
});
