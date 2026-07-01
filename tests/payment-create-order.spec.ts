import { describe, expect, it, vi, beforeEach } from "vitest";
import { createPaymentOrder } from "@/actions/payment";

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockRazorpayOrdersCreate = vi.fn();
const mockPaymentCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    menuItem: { findMany: (...args: unknown[]) => mockFindMany(...args) },
    payment: { create: (...args: unknown[]) => mockPaymentCreate(...args) },
    $transaction: async <T,>(fn: (tx: Record<string, unknown>) => Promise<T>) => {
      const tx = {
        order: { create: mockCreate },
      };
      return fn(tx as unknown as Record<string, unknown>);
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  razorpayClient: { orders: { create: (...args: unknown[]) => mockRazorpayOrdersCreate(...args) } },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPaymentOrder", () => {
  it("throws when cart is empty", async () => {
    await expect(createPaymentOrder({ userId: "u1", items: [] })).rejects.toThrow("Cart is empty");
  });

  it("throws when items missing", async () => {
    await expect(createPaymentOrder({ userId: "u1", items: [] })).rejects.toThrow("Cart is empty");
  });

  it("throws when menu items not found", async () => {
    mockFindMany.mockResolvedValue([]);
    await expect(
      createPaymentOrder({ userId: "u1", items: [{ id: "m1", qty: 2, price: 80 }] })
    ).rejects.toThrow("Some menu items not found");
  });

  it("creates order, razorpay order, and payment record", async () => {
    const mockMenuItem = {
      id: "m1",
      timeSlot: "MORNING",
      menu: { kitchenPartnerId: "kp_1" },
    };
    mockFindMany.mockResolvedValue([mockMenuItem]);
    mockCreate.mockResolvedValue({ id: "ord_1", totalAmount: 160 });
    mockRazorpayOrdersCreate.mockResolvedValue({ id: "order_RZP", amount: 16000, currency: "INR" });
    mockPaymentCreate.mockResolvedValue({ id: "pay_1" });

    const result = await createPaymentOrder({
      userId: "user_1",
      items: [{ id: "m1", qty: 2, price: 80 }],
    });

    expect(result).toMatchObject({
      orderId: "order_RZP",
      amount: 16000,
      currency: "INR",
      localOrderId: "ord_1",
    });

    expect(mockRazorpayOrdersCreate).toHaveBeenCalledWith({
      amount: 16000,
      currency: "INR",
      receipt: "ord_1",
      notes: { userId: "user_1", orderId: "ord_1" },
    });

    expect(mockPaymentCreate).toHaveBeenCalledWith({
      data: {
        orderId: "ord_1",
        provider: "RAZORPAY",
        providerOrderId: "order_RZP",
        amount: 160,
        status: "PENDING",
      },
    });
  });
});
