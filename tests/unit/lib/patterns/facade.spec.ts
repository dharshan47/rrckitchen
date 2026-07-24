import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/stores/cartStore', () => ({
  cartStore: {
    getState: vi.fn(),
  },
}));

import { MenuFacade, menuFacade } from '@/lib/patterns/facade';

const mockCartState = {
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
  cart: [
    { id: 'i1', name: 'Item 1', price: 100, qty: 2, foodType: 'VEG', timeSlot: 'LUNCH', kitchenName: 'K' },
    { id: 'i2', name: 'Item 2', price: 50, qty: 1, foodType: 'NONVEG', timeSlot: 'DINNER', kitchenName: 'K' },
  ],
};

const mockCartStore = vi.mocked((await import('@/stores/cartStore')).cartStore);
mockCartStore.getState.mockReturnValue(mockCartState as any);

describe('MenuFacade', () => {
  let facade: MenuFacade;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCartStore.getState.mockReturnValue(mockCartState as any);
    facade = new MenuFacade();
  });

  describe('getMenuItems', () => {
    it('fetches menu items with no params', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([{ id: '1', name: 'Idli' }]),
      });
      vi.stubGlobal('fetch', mockFetch);
      const result = await facade.getMenuItems({});
      expect(result).toEqual([{ id: '1', name: 'Idli' }]);
      vi.unstubAllGlobals();
    });

    it('builds URL with query params', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
      vi.stubGlobal('fetch', mockFetch);
      await facade.getMenuItems({ query: 'idli', foodType: 'VEG', timeSlot: 'LUNCH' });
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('q=idli');
      expect(url).toContain('foodType=VEG');
      expect(url).toContain('timeSlot=LUNCH');
      vi.unstubAllGlobals();
    });

    it('skips ALL values for foodType and timeSlot', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
      vi.stubGlobal('fetch', mockFetch);
      await facade.getMenuItems({ foodType: 'ALL', timeSlot: 'ALL' });
      const url = mockFetch.mock.calls[0][0];
      expect(url).not.toContain('foodType=');
      expect(url).not.toContain('timeSlot=');
      vi.unstubAllGlobals();
    });

    it('throws on non-ok response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
      await expect(facade.getMenuItems({})).rejects.toThrow('Failed to fetch menu items');
      vi.unstubAllGlobals();
    });
  });

  describe('addToCart', () => {
    it('delegates to cartStore addToCart', async () => {
      const item = { id: 'i1', name: 'Idli', price: 50, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'K' };
      await facade.addToCart(item);
      expect(mockCartState.addToCart).toHaveBeenCalledWith(item);
    });
  });

  describe('removeFromCart', () => {
    it('delegates to cartStore removeFromCart', async () => {
      await facade.removeFromCart('i1');
      expect(mockCartState.removeFromCart).toHaveBeenCalledWith('i1');
    });
  });

  describe('clearCart', () => {
    it('delegates to cartStore clearCart', async () => {
      await facade.clearCart();
      expect(mockCartState.clearCart).toHaveBeenCalled();
    });
  });

  describe('getCartTotal', () => {
    it('calculates total from cart items', async () => {
      const total = await facade.getCartTotal();
      expect(total).toBe(100 * 2 + 50 * 1);
    });

    it('returns 0 for empty cart', async () => {
      mockCartStore.getState.mockReturnValue({ ...mockCartState, cart: [] } as any);
      const total = await facade.getCartTotal();
      expect(total).toBe(0);
    });
  });

  describe('checkout', () => {
    it('returns success with orderId', async () => {
      const result = await facade.checkout({
        items: [],
        address: '123 Main St',
        paymentMethod: 'cod',
      });
      expect(result.success).toBe(true);
      expect(result.orderId).toMatch(/^ORD-/);
    });
  });

  describe('menuFacade', () => {
    it('is an instance of MenuFacade', () => {
      expect(menuFacade).toBeInstanceOf(MenuFacade);
    });
  });
});
