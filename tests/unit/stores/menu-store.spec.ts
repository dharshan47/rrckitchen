import { beforeEach, describe, expect, it } from 'vitest';
import { menuStore, useMenuActions } from '@/stores/menuStore';

describe('menuStore', () => {
  beforeEach(() => {
    menuStore.setState({
      searchQuery: '',
      selectedFoodType: 'ALL',
      selectedTimeSlot: 'ALL',
      selectedTab: 'menu',
      deliveryAddress: '',
      bestsellerOnly: false,
    });
  });

  it('initializes with default values', () => {
    const state = menuStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.selectedFoodType).toBe('ALL');
    expect(state.selectedTimeSlot).toBe('ALL');
    expect(state.selectedTab).toBe('menu');
    expect(state.deliveryAddress).toBe('');
    expect(state.bestsellerOnly).toBe(false);
  });

  it('sets search query', () => {
    menuStore.getState().setSearchQuery('idli');
    expect(menuStore.getState().searchQuery).toBe('idli');
  });

  it('sets time slot', () => {
    menuStore.getState().setSelectedTimeSlot('LUNCH');
    expect(menuStore.getState().selectedTimeSlot).toBe('LUNCH');
  });

  it('sets food type', () => {
    menuStore.getState().setSelectedFoodType('VEG');
    expect(menuStore.getState().selectedFoodType).toBe('VEG');
  });

  it('sets sort / tab', () => {
    menuStore.getState().setSelectedTab('cart');
    expect(menuStore.getState().selectedTab).toBe('cart');
  });

  it('sets delivery address', () => {
    menuStore.getState().setDeliveryAddress('Chennai');
    expect(menuStore.getState().deliveryAddress).toBe('Chennai');
  });

  it('sets bestseller only', () => {
    menuStore.getState().setBestsellerOnly(true);
    expect(menuStore.getState().bestsellerOnly).toBe(true);
    menuStore.getState().setBestsellerOnly(false);
    expect(menuStore.getState().bestsellerOnly).toBe(false);
  });

  it('selectors return correct values', () => {
    menuStore.getState().setSearchQuery('dosa');
    menuStore.getState().setSelectedFoodType('NONVEG');
    menuStore.getState().setSelectedTimeSlot('DINNER');
    menuStore.getState().setSelectedTab('cart');
    menuStore.getState().setDeliveryAddress('Madurai');
    menuStore.getState().setBestsellerOnly(true);
    expect(menuStore.getState().searchQuery).toBe('dosa');
    expect(menuStore.getState().selectedFoodType).toBe('NONVEG');
    expect(menuStore.getState().selectedTimeSlot).toBe('DINNER');
    expect(menuStore.getState().selectedTab).toBe('cart');
    expect(menuStore.getState().deliveryAddress).toBe('Madurai');
    expect(menuStore.getState().bestsellerOnly).toBe(true);
  });

  it('useMenuActions returns all actions', () => {
    const actions = useMenuActions();
    expect(actions).toHaveProperty('setSearchQuery');
    expect(actions).toHaveProperty('setSelectedFoodType');
    expect(actions).toHaveProperty('setSelectedTimeSlot');
    expect(actions).toHaveProperty('setSelectedTab');
    expect(actions).toHaveProperty('setDeliveryAddress');
    expect(actions).toHaveProperty('setBestsellerOnly');
  });
});
