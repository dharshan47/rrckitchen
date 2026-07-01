import crypto from "crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { verifyPaymentSignature, confirmPayment } from "@/actions/payment";

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
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
});

function validSig(orderId: string, paymentId: string) {
  return crypto.createHmac("sha256", "test_secret").update(`${orderId}|${paymentId}`).digest("hex");
}

describe("verifyPaymentSignature", () => {
  it("returns true for valid signature", () => {
    const sig = validSig("order_1", "pay_1");
    expect(verifyPaymentSignature("order_1", "pay_1", sig)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    expect(verifyPaymentSignature("order_1", "pay_1", "bad_sig")).toBe(false);
  });

  it("returns false for wrong key", () => {
    const wrongSig = crypto.createHmac("sha256", "wrong_secret").update("order_1|pay_1").digest("hex");
    expect(verifyPaymentSignature("order_1", "pay_1", wrongSig)).toBe(false);
  });
});

describe("confirmPayment", () => {
  it("throws when payment not found", async () => {
    mockPaymentFindFirst.mockResolvedValue(null);
    await expect(confirmPayment("order_unknown", "pay_1")).rejects.toThrow("Payment record not found");
  });

  it("updates payment, order, and creates transaction", async () => {
    mockPaymentFindFirst.mockResolvedValue({ id: "pay_1", orderId: "ord_1", amount: 160 });
    mockPaymentUpdate.mockResolvedValue({});
    mockOrderUpdate.mockResolvedValue({});
    mockTransactionCreate.mockResolvedValue({});

    const result = await confirmPayment("order_1", "pay_RZP123");

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
});
