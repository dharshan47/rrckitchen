interface MenuQueryParams {
  query?: string;
  foodType?: string;
  timeSlot?: string;
}

interface AddToCartParams {
  id: string;
  name: string;
  price: number;
  qty: number;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
}

interface CheckoutParams {
  items: AddToCartParams[];
  address: string;
  paymentMethod: "razorpay" | "cod";
}

export class MenuFacade {
  async getMenuItems(params: MenuQueryParams) {
    const urlParams = new URLSearchParams();
    if (params.query) urlParams.set("q", params.query);
    if (params.foodType && params.foodType !== "ALL") urlParams.set("foodType", params.foodType);
    if (params.timeSlot && params.timeSlot !== "ALL") urlParams.set("timeSlot", params.timeSlot);

    const res = await fetch(`/api/menu/tomorrow?${urlParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch menu items");
    return res.json();
  }

  async addToCart(params: AddToCartParams): Promise<void> {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().addToCart(params);
  }

  async removeFromCart(id: string): Promise<void> {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().removeFromCart(id);
  }

  async clearCart(): Promise<void> {
    const { cartStore } = await import("@/stores/cartStore");
    cartStore.getState().clearCart();
  }

  async getCartTotal(): Promise<number> {
    const { cartStore } = await import("@/stores/cartStore");
    return cartStore.getState().cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  async checkout(params: CheckoutParams): Promise<{ success: boolean; orderId?: string }> {
    try {
      const orderId = `ORD-${Date.now()}`;
      return { success: true, orderId };
    } catch {
      return { success: false };
    }
  }
}

export const menuFacade = new MenuFacade();
