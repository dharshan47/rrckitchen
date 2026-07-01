import crypto from "crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { confirmPayment, failPayment } from "@/actions/payment";

const mockPaymentFindFirst = vi.fn();
const mockPaymentUpdate = vi.fn();
const mockOrderUpdate = vi.fn();
const mockTransactionCreate = vi.fn();

vi.mock("@/lib/auth", () => ({ razorpayClient: { orders: { create: vi.fn() } } }));

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: {
      findFirst: (...args: unknown[]) => mockPaymentFindFirst(...args),
      update: (...args: unknown[]) => mockPaymentUpdate(...args),
    },
    order: { update: (...args: unknown[]) => mockOrderUpdate(...args) },
    transaction: { create: (...args: unknown[]) => mockTransactionCreate(...args) },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("confirmPayment (webhook)", () => {
  it("handles payment.captured for pending payment", async () => {
    mockPaymentFindFirst.mockResolvedValue({ id: "pay_1", orderId: "ord_1", amount: 160, status: "PENDING" });
    mockPaymentUpdate.mockResolvedValue({});
    mockOrderUpdate.mockResolvedValue({});
    mockTransactionCreate.mockResolvedValue({});

    const result = await confirmPayment("order_RZP123", "pay_RZP123");
    expect(result).toEqual({ orderId: "ord_1" });

    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "pay_1" },
      data: { status: "SUCCESS", providerPaymentId: "pay_RZP123", paidAt: expect.any(Date) },
    });

    expect(mockOrderUpdate).toHaveBeenCalledWith({
      where: { id: "ord_1" },
      data: { status: "CONFIRMED" },
    });

    expect(mockTransactionCreate).toHaveBeenCalledWith({
      data: { paymentId: "pay_1", type: "ORDERPAYMENT", amount: 160, direction: "CREDIT" },
    });
  });

  it("throws when payment not found", async () => {
    mockPaymentFindFirst.mockResolvedValue(null);
    await expect(confirmPayment("unknown", "pay_1")).rejects.toThrow("Payment record not found");
  });
});

describe("failPayment (webhook)", () => {
  it("handles payment.failed", async () => {
    mockPaymentFindFirst.mockResolvedValue({ id: "pay_1", orderId: "ord_1" });
    mockPaymentUpdate.mockResolvedValue({});
    mockOrderUpdate.mockResolvedValue({});

    await failPayment("order_RZP123");

    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "pay_1" },
      data: { status: "FAILED" },
    });

    expect(mockOrderUpdate).toHaveBeenCalledWith({
      where: { id: "ord_1" },
      data: { status: "CANCELLED" },
    });
  });

  it("throws when payment not found", async () => {
    mockPaymentFindFirst.mockResolvedValue(null);
    await expect(failPayment("unknown")).rejects.toThrow("Payment record not found");
  });
});
