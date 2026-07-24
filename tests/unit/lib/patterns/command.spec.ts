import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/stores/cartStore', () => ({
  cartStore: {
    getState: vi.fn(),
  },
}));

vi.mock('./event-bus', () => ({
  globalEventBus: {
    emit: vi.fn(),
  },
  AppEvents: {
    CART_UPDATED: 'cart:updated',
  },
}));

import {
  commandHistory,
  AddToCartCommand,
  UpdateCartQuantityCommand,
  ClearCartCommand,
  executeCommand,
  undoLastCommand,
} from '@/lib/patterns/command';
import { globalEventBus, AppEvents } from '@/lib/patterns/event-bus';

const mockCartState = {
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  cart: [
    { id: 'i1', name: 'Item 1', price: 100, qty: 2, foodType: 'VEG', timeSlot: 'LUNCH', kitchenName: 'K1' },
  ],
};

const mockCartStore = vi.mocked((await import('@/stores/cartStore')).cartStore);
mockCartStore.getState.mockReturnValue(mockCartState as any);

const mockEmit = vi.mocked(globalEventBus.emit);

describe('command pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandHistory.clear();
    mockCartStore.getState.mockReturnValue(mockCartState as any);
  });

  describe('commandHistory', () => {
    it('starts empty', () => {
      expect(commandHistory.pop()).toBeUndefined();
    });

    it('pushes and pops commands in LIFO order', () => {
      const cmd1 = { execute: vi.fn() } as any;
      const cmd2 = { execute: vi.fn() } as any;
      commandHistory.push(cmd1);
      commandHistory.push(cmd2);
      expect(commandHistory.pop()).toBe(cmd2);
      expect(commandHistory.pop()).toBe(cmd1);
    });

    it('clears all history', () => {
      commandHistory.push({ execute: vi.fn() } as any);
      commandHistory.push({ execute: vi.fn() } as any);
      commandHistory.clear();
      expect(commandHistory.pop()).toBeUndefined();
    });

    it('limits history to 50 entries', () => {
      for (let i = 0; i < 55; i++) {
        commandHistory.push({ execute: vi.fn() } as any);
      }
      let count = 0;
      while (commandHistory.pop()) count++;
      expect(count).toBe(50);
    });
  });

  describe('AddToCartCommand', () => {
    it('execute adds item to cart and emits event', async () => {
      const item = { id: 'i1', name: 'Idli', price: 50, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'K' };
      const cmd = new AddToCartCommand(item);
      await cmd.execute();
      expect(mockCartState.addToCart).toHaveBeenCalledWith(item);
      expect(mockEmit).toHaveBeenCalledWith(AppEvents.CART_UPDATED, { action: 'add', item });
    });

    it('undo removes item from cart and emits event', async () => {
      const item = { id: 'i1', name: 'Idli', price: 50, qty: 1, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'K' };
      const cmd = new AddToCartCommand(item);
      await cmd.undo();
      expect(mockCartState.removeFromCart).toHaveBeenCalledWith('i1');
      expect(mockEmit).toHaveBeenCalledWith(AppEvents.CART_UPDATED, { action: 'remove', id: 'i1' });
    });
  });

  describe('UpdateCartQuantityCommand', () => {
    it('execute updates quantity and emits event', async () => {
      const cmd = new UpdateCartQuantityCommand('i1', 1, 3);
      await cmd.execute();
      expect(mockCartState.updateQuantity).toHaveBeenCalledWith('i1', 3);
      expect(mockEmit).toHaveBeenCalledWith(AppEvents.CART_UPDATED, { action: 'update-qty', id: 'i1', qty: 3 });
    });

    it('undo restores previous quantity', async () => {
      const cmd = new UpdateCartQuantityCommand('i1', 3, 1);
      await cmd.undo();
      expect(mockCartState.updateQuantity).toHaveBeenCalledWith('i1', 3);
    });
  });

  describe('ClearCartCommand', () => {
    it('execute clears cart and emits event', async () => {
      const cmd = new ClearCartCommand();
      await cmd.execute();
      expect(mockCartState.clearCart).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith(AppEvents.CART_UPDATED, { action: 'clear' });
    });

    it('undo restores all cart items from snapshot', async () => {
      const cmd = new ClearCartCommand();
      await cmd.execute();
      await cmd.undo();
      expect(mockCartState.addToCart).toHaveBeenCalledTimes(1);
      expect(mockCartState.addToCart).toHaveBeenCalledWith(mockCartState.cart[0]);
    });
  });

  describe('executeCommand', () => {
    it('executes command and pushes to history', async () => {
      const cmd = { execute: vi.fn().mockResolvedValue(undefined) } as any;
      await executeCommand(cmd);
      expect(cmd.execute).toHaveBeenCalled();
      expect(commandHistory.pop()).toBe(cmd);
    });
  });

  describe('undoLastCommand', () => {
    it('pops and undoes the last command', async () => {
      const undoFn = vi.fn();
      commandHistory.push({ execute: vi.fn(), undo: undoFn } as any);
      await undoLastCommand();
      expect(undoFn).toHaveBeenCalled();
    });

    it('does nothing when history is empty', async () => {
      await expect(undoLastCommand()).resolves.toBeUndefined();
    });

    it('does nothing when command has no undo method', async () => {
      commandHistory.push({ execute: vi.fn() } as any);
      await expect(undoLastCommand()).resolves.toBeUndefined();
    });
  });
});
