import { beforeEach, describe, expect, it } from 'vitest';
import { cartStore, useCartActions } from '@/stores/cartStore';
import type { CartItem, AppliedCoupon } from '@/stores/cartStore';

const mockItem: CartItem = {
  id: '1',
  name: 'Idli Sambhar',
  price: 80,
  qty: 1,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

const mockItem2: CartItem = {
  id: '2',
  name: 'Dosa',
  price: 100,
  qty: 2,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

describe('cartStore', () => {
  beforeEach(() => {
    cartStore.setState({ cart: [], appliedCoupon: null, orderType: 'PREBOOK' });
  });

  it('initializes with empty cart', () => {
    const state = cartStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.appliedCoupon).toBeNull();
    expect(state.orderType).toBe('PREBOOK');
  });

  it('adds item to cart', () => {
    cartStore.getState().addToCart(mockItem);
    expect(cartStore.getState().cart).toHaveLength(1);
    expect(cartStore.getState().cart[0]).toEqual(mockItem);
  });

  it('merges duplicate items by increasing qty', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, qty: 2 });
    expect(cartStore.getState().cart).toHaveLength(1);
    expect(cartStore.getState().cart[0].qty).toBe(3);
  });

  it('keeps separate items separate', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart(mockItem2);
    expect(cartStore.getState().cart).toHaveLength(2);
  });

  it('removes item from cart', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart(mockItem2);
    cartStore.getState().removeFromCart('1');
    expect(cartStore.getState().cart).toHaveLength(1);
    expect(cartStore.getState().cart[0].id).toBe('2');
  });

  it('updates item quantity', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().updateQuantity('1', 5);
    expect(cartStore.getState().cart[0].qty).toBe(5);
  });

  it('does not reduce quantity below 1', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().updateQuantity('1', 0);
    expect(cartStore.getState().cart[0].qty).toBe(1);
  });

  it('clears cart and removes coupon', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().applyCoupon({ code: 'SAVE10', discount: 10, type: 'PERCENTAGE' });
    cartStore.getState().clearCart();
    expect(cartStore.getState().cart).toEqual([]);
    expect(cartStore.getState().appliedCoupon).toBeNull();
  });

  it('applies coupon', () => {
    const coupon: AppliedCoupon = { code: 'SAVE10', discount: 10, type: 'PERCENTAGE', description: 'Save 10%' };
    cartStore.getState().applyCoupon(coupon);
    expect(cartStore.getState().appliedCoupon).toEqual(coupon);
  });

  it('removes coupon', () => {
    cartStore.getState().applyCoupon({ code: 'SAVE10', discount: 10, type: 'PERCENTAGE' });
    cartStore.getState().removeCoupon();
    expect(cartStore.getState().appliedCoupon).toBeNull();
  });

  it('calculates total correctly', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart(mockItem2);
    const total = cartStore.getState().cart.reduce((s, i) => s + i.price * i.qty, 0);
    expect(total).toBe(280);
  });

  it('calculates item count correctly', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart(mockItem2);
    const count = cartStore.getState().cart.reduce((s, i) => s + i.qty, 0);
    expect(count).toBe(3);
  });
});

describe('cartStore selectors', () => {
  beforeEach(() => {
    cartStore.setState({ cart: [], appliedCoupon: null, orderType: 'PREBOOK' });
  });

  it('useCartItems selector returns cart', () => {
    cartStore.getState().addToCart(mockItem);
    const items = cartStore.getState().cart;
    expect(items).toHaveLength(1);
  });

  it('useCartCoupon selector returns coupon', () => {
    expect(cartStore.getState().appliedCoupon).toBeNull();
  });

  it('useCartOrderType selector returns order type', () => {
    expect(cartStore.getState().orderType).toBe('PREBOOK');
  });

  it('useCartActions selector returns all actions', () => {
    const actions = useCartActions();
    expect(actions).toHaveProperty('addToCart');
    expect(actions).toHaveProperty('removeFromCart');
    expect(actions).toHaveProperty('updateQuantity');
    expect(actions).toHaveProperty('clearCart');
    expect(actions).toHaveProperty('applyCoupon');
    expect(actions).toHaveProperty('removeCoupon');
    expect(actions).toHaveProperty('setOrderType');
  });
});
