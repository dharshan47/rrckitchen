import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => ({ user: { id: "user-1", role: "CUSTOMER" } })),
}))

const mockTx = {
  review: { create: vi.fn() },
  deliveryReview: { create: vi.fn() },
  order: { update: vi.fn() },
  kitchenPartner: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  deliveryPartner: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({
  default: {
    $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
  },
}))

import { submitKitchenReview, submitDeliveryReview } from "@/actions/reviews/review-actions"

const RECENCY_WEIGHT = 0.15

describe("review.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("submitKitchenReview", () => {
    it("should update avgRating using recency-weighted formula", async () => {
      mockTx.kitchenPartner.findUniqueOrThrow.mockResolvedValue({
        id: "kitchen-1",
        avgRating: 4.0,
        totalReviews: 10,
      })

      const expectedNewRating = 4.0 * (1 - RECENCY_WEIGHT) + 5 * RECENCY_WEIGHT

      await submitKitchenReview({
        orderId: "order-1",
        kitchenPartnerId: "kitchen-1",
        rating: 5,
        tags: ["Delicious"],
      })

      expect(mockTx.kitchenPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "kitchen-1" },
          data: expect.objectContaining({
            avgRating: expect.closeTo(expectedNewRating, 5),
            totalReviews: { increment: 1 },
          }),
        })
      )
    })

    it("should set avgRating to new rating if no existing reviews", async () => {
      mockTx.kitchenPartner.findUniqueOrThrow.mockResolvedValue({
        id: "kitchen-1",
        avgRating: null,
        totalReviews: 0,
      })

      await submitKitchenReview({
        orderId: "order-1",
        kitchenPartnerId: "kitchen-1",
        rating: 4,
        tags: ["Fresh"],
      })

      expect(mockTx.kitchenPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "kitchen-1" },
          data: expect.objectContaining({
            avgRating: 4,
            totalReviews: { increment: 1 },
          }),
        })
      )
    })
  })

  describe("submitDeliveryReview", () => {
    it("should update delivery partner avgRating", async () => {
      mockTx.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "dp-1",
        avgRating: null,
        totalReviews: 0,
      })

      await submitDeliveryReview({
        orderId: "order-1",
        deliveryPartnerId: "dp-1",
        rating: 5,
        comment: "Great delivery",
      })

      expect(mockTx.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dp-1" },
          data: expect.objectContaining({
            avgRating: 5,
            totalReviews: { increment: 1 },
          }),
        })
      )
    })
  })
})
