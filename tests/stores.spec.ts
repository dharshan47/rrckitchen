import { beforeEach, describe, expect, it } from 'vitest';
import { useMenuStore, useCartStore, cartStore, menuStore, authStore } from '@/stores';
import type { CartItem } from '@/stores';

const mockItem: CartItem = {
  id: '1',
  name: 'Idli Sambhar',
  price: 80,
  qty: 1,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

const resetStores = () => {
  menuStore.setState({
    searchQuery: '',
    selectedFoodType: 'ALL',
    selectedTimeSlot: 'ALL',
    selectedTab: 'menu',
    deliveryAddress: '',
  });
  cartStore.setState({ cart: [] });
};

describe('MenuStore', () => {
  beforeEach(() => resetStores());

  it('initializes with default values', () => {
    const state = menuStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.selectedFoodType).toBe('ALL');
    expect(state.selectedTimeSlot).toBe('ALL');
    expect(state.selectedTab).toBe('menu');
    expect(state.deliveryAddress).toBe('');
  });

  it('updates search query', () => {
    menuStore.getState().setSearchQuery('idli');
    expect(menuStore.getState().searchQuery).toBe('idli');
  });

  it('updates selected food type', () => {
    menuStore.getState().setSelectedFoodType('VEG');
    expect(menuStore.getState().selectedFoodType).toBe('VEG');
  });

  it('updates selected time slot', () => {
    menuStore.getState().setSelectedTimeSlot('LUNCH');
    expect(menuStore.getState().selectedTimeSlot).toBe('LUNCH');
  });

  it('updates tab', () => {
    menuStore.getState().setSelectedTab('cart');
    expect(menuStore.getState().selectedTab).toBe('cart');
  });

  it('updates delivery address', () => {
    menuStore.getState().setDeliveryAddress('Thanjavur');
    expect(menuStore.getState().deliveryAddress).toBe('Thanjavur');
  });
});

describe('CartStore', () => {
  beforeEach(() => resetStores());

  it('initializes with empty cart', () => {
    expect(cartStore.getState().cart).toEqual([]);
  });

  it('adds item to cart', () => {
    cartStore.getState().addToCart(mockItem);
    expect(cartStore.getState().cart).toHaveLength(1);
    expect(cartStore.getState().cart[0].name).toBe('Idli Sambhar');
  });

  it('merges duplicate items by increasing qty', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, qty: 2 });
    expect(cartStore.getState().cart).toHaveLength(1);
    expect(cartStore.getState().cart[0].qty).toBe(3);
  });

  it('keeps separate items separate', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, id: '2', name: 'Dosa' });
    expect(cartStore.getState().cart).toHaveLength(2);
  });

  it('removes item from cart', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().removeFromCart('1');
    expect(cartStore.getState().cart).toHaveLength(0);
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

  it('clears cart', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, id: '2' });
    cartStore.getState().clearCart();
    expect(cartStore.getState().cart).toEqual([]);
  });

  it('cart total is sum of price * qty', () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, id: '2', name: 'Dosa', price: 60, qty: 2 });
    const total = cartStore.getState().cart.reduce((s, i) => s + i.price * i.qty, 0);
    expect(total).toBe(200);
  });
});

describe('AuthStore', () => {
  beforeEach(() => {
    authStore.setState({ role: 'customer', phoneNumber: '', code: '' });
  });

  it('sets role', () => {
    authStore.getState().setRole('kitchen');
    expect(authStore.getState().role).toBe('kitchen');
  });

  it('sets phone number', () => {
    authStore.getState().setPhoneNumber('+919876543210');
    expect(authStore.getState().phoneNumber).toBe('+919876543210');
  });

  it('resets auth state', () => {
    authStore.getState().setPhoneNumber('+919876543210');
    authStore.getState().setCode('123456');
    authStore.getState().resetAuthState();
    expect(authStore.getState().phoneNumber).toBe('');
    expect(authStore.getState().code).toBe('');
  });
});
