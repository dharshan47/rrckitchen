type Listener<T = unknown> = (payload: T) => void;

export class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();
  private onceListeners: Map<string, Set<Listener>> = new Map();

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
    return () => this.off(event, listener);
  }

  once<T>(event: string, listener: Listener<T>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(listener as Listener);
  }

  off<T>(event: string, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener as Listener);
    this.onceListeners.get(event)?.delete(listener as Listener);
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((listener) => {
      try { listener(payload); } catch { /* silent */ }
    });
    this.onceListeners.get(event)?.forEach((listener) => {
      try { listener(payload); } catch { /* silent */ }
    });
    this.onceListeners.delete(event);
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
}

export const globalEventBus = new EventBus();

export const AppEvents = {
  CART_UPDATED: "cart:updated",
  AUTH_CHANGED: "auth:changed",
  MENU_FILTER_CHANGED: "menu:filter-changed",
  ORDER_PLACED: "order:placed",
  NETWORK_STATUS_CHANGED: "network:status-changed",
} as const;
