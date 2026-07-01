import { globalEventBus, AppEvents } from "./event-bus";

interface Command {
  execute(): Promise<void> | void;
  undo?(): Promise<void> | void;
}

class CommandHistory {
  private history: Command[] = [];
  private maxSize = 50;

  push(command: Command): void {
    this.history.push(command);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  pop(): Command | undefined {
    return this.history.pop();
  }

  clear(): void {
    this.history = [];
  }
}

export const commandHistory = new CommandHistory();

export class AddToCartCommand implements Command {
  constructor(
    private item: {
      id: string;
      name: string;
      price: number;
      qty: number;
      foodType: string;
      timeSlot: string;
      kitchenName: string;
    }
  ) {}

  async execute() {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().addToCart(this.item);
    globalEventBus.emit(AppEvents.CART_UPDATED, { action: "add", item: this.item });
  }

  async undo() {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().removeFromCart(this.item.id);
    globalEventBus.emit(AppEvents.CART_UPDATED, { action: "remove", id: this.item.id });
  }
}

export class UpdateCartQuantityCommand implements Command {
  constructor(
    private id: string,
    private prevQty: number,
    private newQty: number
  ) {}

  async execute() {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().updateQuantity(this.id, this.newQty);
    globalEventBus.emit(AppEvents.CART_UPDATED, { action: "update-qty", id: this.id, qty: this.newQty });
  }

  async undo() {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().updateQuantity(this.id, this.prevQty);
  }
}

export class ClearCartCommand implements Command {
  private snapshot: Array<{ id: string; name: string; price: number; qty: number; foodType: string; timeSlot: string; kitchenName: string }> = [];

  async execute() {
    const { cartStore } = await import("@/stores/cartStore");
    this.snapshot = [...cartStore.getState().cart];
    cartStore.getState().clearCart();
    globalEventBus.emit(AppEvents.CART_UPDATED, { action: "clear" });
  }

  async undo() {
    const { cartStore } = await import("@/stores/cartStore");
    for (const item of this.snapshot) {
      cartStore.getState().addToCart(item);
    }
  }
}

export async function executeCommand(command: Command): Promise<void> {
  await command.execute();
  commandHistory.push(command);
}

export async function undoLastCommand(): Promise<void> {
  const command = commandHistory.pop();
  if (command?.undo) {
    await command.undo();
  }
}
