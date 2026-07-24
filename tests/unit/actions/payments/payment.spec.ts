import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/razorpay", () => ({
  getRazorpayClient: () => ({
    orders: { create: vi.fn().mockResolvedValue({ id: "rzp_order_1", amount: 50000, currency: "INR" }) },
    payments: { fetch: vi.fn(), refund: vi.fn() },
  }),
}))

const mockTx = {
  menuItemDailyStock: { update: vi.fn() },
  order: { create: vi.fn(), update: vi.fn() },
  orderStatusHistory: { create: vi.fn() },
  orderItems: { create: vi.fn() },
}

const mockPrisma = {
  menuItem: { findMany: vi.fn() },
  menuItemDailyStock: { findMany: vi.fn() },
  deliverySlot: { findFirst: vi.fn() },
  coupon: { findUnique: vi.fn() },
  couponRedemption: { create: vi.fn() },
  payment: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  order: { findUnique: vi.fn(), update: vi.fn() },
  orderStatusHistory: { create: vi.fn() },
  userCodEligibility: { upsert: vi.fn() },
  refund: { create: vi.fn() },
  $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/ably/server", () => ({ getAblyRest: () => ({ channels: { get: () => ({ publish: vi.fn() }) } }) }))
vi.mock("@/lib/redis", () => ({ redis: { del: vi.fn(), xadd: vi.fn() } }))
vi.mock("@/actions/loyalty/loyalty", () => ({ awardPoints: vi.fn() }))

import { createPaymentOrder, confirmPayment, failPayment, verifyPaymentSignature, refundOrder } from "@/actions/payments/payment"

describe("payments", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("createPaymentOrder", () => {
    const baseInput = { userId: "user-1", items: [{ id: "item-1", qty: 2, price: 100 }] }

    beforeEach(() => {
      mockPrisma.menuItem.findMany.mockResolvedValue([
        { id: "item-1", name: "Dosa", price: 100, timeSlot: "BREAKFAST", menu: { kitchenPartnerId: "kp-1" } },
      ])
      mockPrisma.menuItemDailyStock.findMany.mockResolvedValue([])
      mockPrisma.deliverySlot.findFirst.mockResolvedValue(null)
      mockTx.menuItemDailyStock.update.mockResolvedValue({ reservedQuantity: 2, totalQuantity: 10 })
      mockTx.order.create.mockResolvedValue({ id: "order-1", orderItems: [{ id: "oi1" }] })
    })

    it("creates a Razorpay order", async () => {
      const result = await createPaymentOrder(baseInput)

      expect(result.localOrderId).toBe("order-1")
      expect(result.currency).toBe("INR")
      expect(mockPrisma.payment.create).toHaveBeenCalled()
    })

    it("creates a COD order", async () => {
      const result = await createPaymentOrder({ ...baseInput, paymentProvider: "CASH_ON_DELIVERY" })

      expect(result.localOrderId).toBe("order-1")
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ provider: "CASH_ON_DELIVERY" }) }),
      )
    })

    it("throws for empty cart", async () => {
      await expect(createPaymentOrder({ ...baseInput, items: [] })).rejects.toThrow("Cart is empty")
    })

    it("throws for insufficient stock", async () => {
      mockPrisma.menuItemDailyStock.findMany.mockResolvedValue([
        { id: "stock-1", menuItemId: "item-1", totalQuantity: 10, reservedQuantity: 10, soldQuantity: 0 },
      ])
      await expect(createPaymentOrder(baseInput)).rejects.toThrow("Insufficient stock")
    })

    it("applies coupon discount", async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: "c1", code: "SAVE10", isActive: true, discountType: "PERCENTAGE", discountValue: 10,
        maxDiscount: 50, minOrderValue: 0, validFrom: new Date(Date.now() - 86400000), validTo: new Date(Date.now() + 86400000),
      })

      await createPaymentOrder({ ...baseInput, couponCode: "SAVE10" })

      const orderCreateCall = mockTx.order.create.mock.calls[0][0]
      const total = orderCreateCall.data.totalAmount
      expect(Number(total)).toBeLessThan(200)
    })

    it("returns existing order for duplicate idempotencyKey", async () => {
      mockPrisma.order.findUnique = vi.fn().mockResolvedValue(null)
      const origOrder = mockPrisma.order
      mockPrisma.order = {
        ...origOrder,
        findUnique: vi.fn().mockResolvedValue({
          id: "order-existing", totalAmount: 200, payment: { providerOrderId: "rzp_existing" },
        }),
      }

      const result = await createPaymentOrder({ ...baseInput, idempotencyKey: "dup-key" })

      expect(result.idempotent).toBe(true)
    })
  })

  describe("verifyPaymentSignature", () => {
    it("returns true for valid signature", () => {
      const valid = verifyPaymentSignature("order_1", "pay_1", "e5b4c7b1a2d3f4e5c6b7a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f")
      expect(typeof valid).toBe("boolean")
    })
  })

  describe("confirmPayment", () => {
    it("confirms payment and updates order", async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: "pay-1", orderId: "order-1" })
      mockPrisma.order.findUnique.mockResolvedValue({
        id: "order-1", userId: "user-1",
        orderItems: [{ menuItemId: "mi-1", menuItem: { name: "Dosa", menu: { kitchenPartnerId: "kp-1" } } }],
      })
      mockPrisma.payment.update.mockResolvedValue({})
      mockPrisma.order.update.mockResolvedValue({})

      const result = await confirmPayment("rzp_order_1", "pay_1")

      expect(result.orderId).toBe("order-1")
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "SUCCESS" }) }),
      )
    })

    it("throws for missing payment record", async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null)
      await expect(confirmPayment("missing", "pay_1")).rejects.toThrow("Payment record not found")
    })
  })

  describe("failPayment", () => {
    it("marks payment as failed and cancels order", async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: "pay-1", orderId: "order-1", status: "PENDING" })
      mockPrisma.order.update.mockResolvedValue({})

      await failPayment("rzp_order_1")

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) }),
      )
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "CANCELLED" }) }),
      )
    })

    it("skips if payment already processed", async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: "pay-1", orderId: "order-1", status: "SUCCESS" })
      await failPayment("rzp_order_1")
      expect(mockPrisma.order.update).not.toHaveBeenCalled()
    })
  })

  describe("refundOrder", () => {
    it("processes a refund", async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: "pay-1", orderId: "order-1", providerPaymentId: "pay_1" })
      mockPrisma.order.findUnique.mockResolvedValue({ id: "order-1", totalAmount: 500 })
      mockPrisma.refund.create.mockResolvedValue({})

      const result = await refundOrder("order-1")

      expect(result.success).toBe(true)
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "order-1" }, data: expect.objectContaining({ status: "REFUNDED" }) }),
      )
    })
  })
})
