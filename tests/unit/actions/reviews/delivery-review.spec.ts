import { describe, it, expect, vi, beforeEach } from "vitest"

const mockTx = vi.hoisted(() => ({
  deliveryReview: { create: vi.fn() },
  deliveryPartner: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  order: { update: vi.fn() },
}))

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
  order: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockSession = { user: { id: "user-1" } }
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { createDeliveryReview } from "@/actions/reviews/delivery-review"

const RECENCY_WEIGHT = 0.15

describe("delivery-review", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.order.findUnique.mockResolvedValue({ userId: "user-1", deliveryReview: null })
  })

  it("creates delivery review and updates avgRating for new partner", async () => {
    mockTx.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
      id: "dp-1", avgRating: null, totalReviews: 0,
    })

    const result = await createDeliveryReview({
      orderId: "order-1", deliveryPartnerId: "dp-1", rating: 5, speedRating: 4, behaviorHygiene: true,
    })

    expect(result.success).toBe(true)
    expect(mockTx.deliveryPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "dp-1" },
        data: expect.objectContaining({ avgRating: 5, totalReviews: { increment: 1 } }),
      }),
    )
  })

  it("uses recency-weighted average for existing reviews", async () => {
    mockTx.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
      id: "dp-1", avgRating: 4.0, totalReviews: 10,
    })

    await createDeliveryReview({
      orderId: "order-1", deliveryPartnerId: "dp-1", rating: 3,
    })

    const expectedNewRating = 4.0 * (1 - RECENCY_WEIGHT) + 3 * RECENCY_WEIGHT
    expect(mockTx.deliveryPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          avgRating: expect.closeTo(expectedNewRating, 5),
          totalReviews: { increment: 1 },
        }),
      }),
    )
  })

  it("creates the review record for the order", async () => {
    mockTx.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
      id: "dp-1", avgRating: null, totalReviews: 0,
    })

    await createDeliveryReview({
      orderId: "order-1", deliveryPartnerId: "dp-1", rating: 4,
    })

    expect(mockTx.deliveryReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-1",
          userId: "user-1",
          deliveryPartnerId: "dp-1",
          rating: 4,
        }),
      }),
    )
  })
})
