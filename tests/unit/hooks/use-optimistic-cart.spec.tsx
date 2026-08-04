import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimisticCart } from '@/hooks/useOptimisticCart';
import type { CartItem } from '@/stores/cartStore';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockItem: CartItem = {
  id: '1',
  name: 'Idli Sambhar',
  price: 80,
  qty: 1,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

vi.mock('@/stores/cartStore', async () => {
  const actual = await vi.importActual('@/stores/cartStore');
  return {
    ...actual,
    cartStore: (await actual).cartStore,
  };
});

vi.mock('@/lib/patterns', () => ({
  executeCommand: vi.fn().mockResolvedValue(undefined),
  AddToCartCommand: vi.fn(),
  UpdateCartQuantityCommand: vi.fn(),
  ClearCartCommand: vi.fn(),
}));

describe('useOptimisticCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial empty cart', () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper: createWrapper() });
    expect(result.current.cart).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('adds item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.addToCart(mockItem);
    });
    await waitFor(() => {
      expect(result.current.cart).toHaveLength(1);
    });
    expect(result.current.cart[0].name).toBe('Idli Sambhar');
  });

  it('updates total after adding item', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.addToCart(mockItem);
    });
    await waitFor(() => {
      expect(result.current.total).toBe(80);
    });
    expect(result.current.itemCount).toBe(1);
  });

  it('updates quantity optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.addToCart(mockItem);
    });
    await waitFor(() => {
      expect(result.current.cart).toHaveLength(1);
    });
    await act(async () => {
      await result.current.updateQuantity('1', 5);
    });
    await waitFor(() => {
      expect(result.current.total).toBe(400);
    });
    expect(result.current.itemCount).toBe(5);
  });
});

