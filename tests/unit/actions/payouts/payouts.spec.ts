import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  kitchenPayout: { create: vi.fn(), findMany: vi.fn() },
  deliveryPartnerPayout: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  order: { findUnique: vi.fn() },
  kitchenPartner: { findUnique: vi.fn() },
  deliveryPartner: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockRazorpay = {
  payments: { refund: vi.fn() },
  fundAccount: { create: vi.fn() },
  contacts: { create: vi.fn() },
  payouts: { create: vi.fn() },
}
vi.mock("@/lib/razorpay", () => ({
  razorpayClient: mockRazorpay,
}))

import { createKitchenPayout } from "@/actions/payouts/kitchen-payout"
import { createDeliveryPayout } from "@/actions/payouts/delivery-payout"

describe("payouts", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("createKitchenPayout", () => {
    it("creates kitchen payout record", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: "order-1", totalAmount: 500, commissionAmount: 75,
        orderItems: [{ kitchenPartnerId: "kp-1" }],
      })

      await createKitchenPayout("order-1")

      expect(mockPrisma.kitchenPayout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: "order-1", kitchenPartnerId: "kp-1",
          }),
        }),
      )
    })

    it("skips if order not found", async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)
      await createKitchenPayout("missing")
      expect(mockPrisma.kitchenPayout.create).not.toHaveBeenCalled()
    })
  })

  describe("createDeliveryPayout", () => {
    it("creates delivery payout record", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({
        id: "dp-1", name: "Rider One", upiId: "rider@upi",
      })

      await createDeliveryPayout("dp-1", 100)

      expect(mockPrisma.deliveryPartnerPayout.create).toHaveBeenCalled()
    })
  })
})
