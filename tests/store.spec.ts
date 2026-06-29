import { beforeEach, describe, expect, it } from 'vitest';
import { useMenuStore } from '@/stores';
import { useCartStore } from '@/stores';

const resetStores = () => {
  useMenuStore.setState({
    searchQuery: '',
    selectedFoodType: 'ALL',
    selectedTimeSlot: 'ALL',
    selectedTab: 'menu',
    deliveryAddress: '',
  });
  useCartStore.setState({ cart: [] });
};

describe('zustand slices', () => {
  beforeEach(() => {
    resetStores();
  });

  it('initializes with default values', () => {
    const menuState = useMenuStore.getState();

    expect(menuState.searchQuery).toBe('');
    expect(menuState.selectedFoodType).toBe('ALL');
    expect(menuState.selectedTimeSlot).toBe('ALL');
  });

  it('updates search query and selected food type', () => {
    const { setSearchQuery, setSelectedFoodType } = useMenuStore.getState();

    setSearchQuery('idli');
    setSelectedFoodType('VEG');

    const menuState = useMenuStore.getState();
    expect(menuState.searchQuery).toBe('idli');
    expect(menuState.selectedFoodType).toBe('VEG');
  });

  it('adds items to cart and merges duplicates', () => {
    const { addToCart } = useCartStore.getState();

    addToCart({
      id: '1',
      name: 'Idli Sambhar',
      price: 80,
      qty: 1,
      foodType: 'VEG',
      timeSlot: 'MORNING',
      kitchenName: 'Thanjavur Kitchen',
    });

    addToCart({
      id: '1',
      name: 'Idli Sambhar',
      price: 80,
      qty: 2,
      foodType: 'VEG',
      timeSlot: 'MORNING',
      kitchenName: 'Thanjavur Kitchen',
    });

    const state = useCartStore.getState();
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].qty).toBe(3);
  });
});
