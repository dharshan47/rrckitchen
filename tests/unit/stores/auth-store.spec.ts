import { beforeEach, describe, expect, it } from 'vitest';
import { authStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    authStore.setState({ role: 'customer', phoneNumber: '', code: '' });
  });

  it('initializes with default values', () => {
    const state = authStore.getState();
    expect(state.role).toBe('customer');
    expect(state.phoneNumber).toBe('');
    expect(state.code).toBe('');
  });

  it('sets role', () => {
    authStore.getState().setRole('kitchen');
    expect(authStore.getState().role).toBe('kitchen');
  });

  it('sets role to delivery-partner', () => {
    authStore.getState().setRole('delivery-partner');
    expect(authStore.getState().role).toBe('delivery-partner');
  });

  it('sets role to admin', () => {
    authStore.getState().setRole('admin');
    expect(authStore.getState().role).toBe('admin');
  });

  it('sets phone number', () => {
    authStore.getState().setPhoneNumber('+919876543210');
    expect(authStore.getState().phoneNumber).toBe('+919876543210');
  });

  it('sets code', () => {
    authStore.getState().setCode('123456');
    expect(authStore.getState().code).toBe('123456');
  });

  it('resets auth state', () => {
    authStore.getState().setPhoneNumber('+919876543210');
    authStore.getState().setCode('123456');
    authStore.getState().resetAuthState();
    expect(authStore.getState().phoneNumber).toBe('');
    expect(authStore.getState().code).toBe('');
  });

  it('resets auth state preserves role', () => {
    authStore.getState().setRole('kitchen');
    authStore.getState().setPhoneNumber('+919876543210');
    authStore.getState().resetAuthState();
    expect(authStore.getState().role).toBe('kitchen');
  });

  it('selectors return correct values', () => {
    authStore.getState().setRole('delivery-partner');
    authStore.getState().setPhoneNumber('+911234567890');
    authStore.getState().setCode('999999');
    expect(authStore.getState().role).toBe('delivery-partner');
    expect(authStore.getState().phoneNumber).toBe('+911234567890');
    expect(authStore.getState().code).toBe('999999');
  });
});
