import { beforeEach, describe, expect, it } from 'vitest';
import {
  AddToCartCommand,
  UpdateCartQuantityCommand,
  ClearCartCommand,
  executeCommand,
  undoLastCommand,
  commandHistory,
} from '@/lib/patterns/command';
import { MenuFacade, menuFacade } from '@/lib/patterns/facade';
import { cartStore } from '@/stores';

const mockItem = {
  id: '1',
  name: 'Idli Sambhar',
  price: 80,
  qty: 1,
  foodType: 'VEG',
  timeSlot: 'MORNING',
  kitchenName: 'Thanjavur Kitchen',
};

beforeEach(() => {
  commandHistory.clear();
  cartStore.setState({ cart: [] });
});

describe('Command Pattern Integration', () => {
  it('AddToCartCommand adds item', async () => {
    const cmd = new AddToCartCommand(mockItem);
    await executeCommand(cmd);
    expect(cartStore.getState().cart).toHaveLength(1);
  });

  it('AddToCartCommand undo removes item', async () => {
    const cmd = new AddToCartCommand(mockItem);
    await executeCommand(cmd);
    await undoLastCommand();
    expect(cartStore.getState().cart).toHaveLength(0);
  });

  it('UpdateCartQuantityCommand updates qty', async () => {
    cartStore.getState().addToCart(mockItem);
    const cmd = new UpdateCartQuantityCommand('1', 1, 5);
    await executeCommand(cmd);
    expect(cartStore.getState().cart[0].qty).toBe(5);
  });

  it('UpdateCartQuantityCommand undo restores qty', async () => {
    cartStore.getState().addToCart(mockItem);
    const cmd = new UpdateCartQuantityCommand('1', 1, 5);
    await executeCommand(cmd);
    await undoLastCommand();
    expect(cartStore.getState().cart[0].qty).toBe(1);
  });

  it('ClearCartCommand clears cart', async () => {
    cartStore.getState().addToCart(mockItem);
    const cmd = new ClearCartCommand();
    await executeCommand(cmd);
    expect(cartStore.getState().cart).toHaveLength(0);
  });

  it('ClearCartCommand undo restores items', async () => {
    cartStore.getState().addToCart(mockItem);
    const cmd = new ClearCartCommand();
    await executeCommand(cmd);
    await undoLastCommand();
    expect(cartStore.getState().cart).toHaveLength(1);
  });
});

describe('Facade Pattern Integration', () => {
  it('MenuFacade addToCart works with cartStore', async () => {
    await menuFacade.addToCart(mockItem);
    expect(cartStore.getState().cart).toHaveLength(1);
  });

  it('MenuFacade removeFromCart works', async () => {
    cartStore.getState().addToCart(mockItem);
    await menuFacade.removeFromCart('1');
    expect(cartStore.getState().cart).toHaveLength(0);
  });

  it('MenuFacade clearCart works', async () => {
    cartStore.getState().addToCart(mockItem);
    await menuFacade.clearCart();
    expect(cartStore.getState().cart).toHaveLength(0);
  });

  it('MenuFacade getCartTotal returns sum', async () => {
    cartStore.getState().addToCart(mockItem);
    cartStore.getState().addToCart({ ...mockItem, id: '2', price: 60, qty: 2 });
    const total = await menuFacade.getCartTotal();
    expect(total).toBe(200);
  });

  it('MenuFacade checkout returns success', async () => {
    const result = await menuFacade.checkout({ items: [mockItem], address: 'Thanjavur', paymentMethod: 'razorpay' });
    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
  });
});
