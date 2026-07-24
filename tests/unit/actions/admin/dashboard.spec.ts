import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  order: { findMany: vi.fn(), count: vi.fn() },
  kitchenPartner: { findUnique: vi.fn() },
  deliveryPartner: { findUnique: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => ({ user: { id: "u-1" } })),
}))

import { getKitchenDashboardData, getDeliveryDashboardData } from "@/actions/admin/dashboard"

describe("dashboard-data", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getKitchenDashboardData", () => {
    it("returns kitchen dashboard data with reviews", async () => {
      mockPrisma.kitchenPartner.findUnique.mockResolvedValue({
        id: "kp-1", slug: "tasty-kitchen", name: "Tasty Kitchen", status: "ACTIVE", isActive: true,
        phoneNumber: null, imageUrl: null, coverImageUrl: null, description: null,
        deliveryFee: null, minOrder: null, estimatedPrepTime: null,
        avgRating: 4.2, totalReviews: 25,
        createdAt: new Date(), updatedAt: new Date(), totalRevenue: null, latitude: null, longitude: null,
        address: null, codEligible: false, commissionRate: null,
        userId: "u-1", operatingHours: null, cashInHand: null, rejectedOrderIds: [],
        isPublished: false, currentOrderId: null, shiftEndTime: null, deletedAt: null,
        kitchenAlias: null, kitchenKyc: null, kitchenAddress: null,
        user: { name: "Test", email: "test@test.com" },
        orderItems: [],
        orders: [],
        reviews: [
          {
            id: "r1", rating: 5, tasteRating: 5, packagingRating: 4, portionSizeRating: null, comment: "Great!",
            createdAt: new Date(), updatedAt: new Date(), userId: "u-2", orderId: "o-1", kitchenPartnerId: "kp-1",
            deliveryPartnerId: null, speedRating: null, behaviorHygiene: null, safetyContactless: null,
            order: { orderItems: [{ menuItem: { name: "Dosa" } }] },
            user: { name: "Customer A" },
          },
        ],
        _count: { orders: 50, reviews: 1, orderItems: 50 },
      })
      mockPrisma.order.findMany.mockResolvedValue([])
      mockPrisma.order.count.mockResolvedValue(0)

      const result = await getKitchenDashboardData()

      expect(result).not.toBeNull()
      if (result) {
        expect(result.reviews).toHaveLength(1)
        expect(result.reviews[0].rating).toBe(5)
        expect(result.reviews[0].itemName).toBe("Dosa")
        expect(result.reviews[0].customerName).toBe("Customer A")
      }
    })

    it("creates kitchen partner if not found", async () => {
      mockPrisma.kitchenPartner.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "kp-new", slug: "test-kitchen", name: "Test", status: "ACTIVE", isActive: true,
          phoneNumber: null, imageUrl: null, coverImageUrl: null, description: null,
          deliveryFee: null, minOrder: null, estimatedPrepTime: null,
          avgRating: null, totalReviews: 0,
          createdAt: new Date(), updatedAt: new Date(), totalRevenue: null, latitude: null, longitude: null,
          address: null, codEligible: false, commissionRate: null,
          userId: "u-1", operatingHours: null, cashInHand: null, rejectedOrderIds: [],
          isPublished: false, currentOrderId: null, shiftEndTime: null, deletedAt: null,
          kitchenAlias: null, kitchenKyc: null, kitchenAddress: null,
          user: { name: "Test", email: "test@test.com" },
          orderItems: [], orders: [], reviews: [],
          _count: { orders: 0, reviews: 0, orderItems: 0 },
        })

      const result = await getKitchenDashboardData()
      expect(result).not.toBeNull()
    })
  })

  describe("getDeliveryDashboardData", () => {
    it("returns delivery dashboard data with reviews", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({
        id: "dp-1", userId: "u-2", status: "ACTIVE", isOnline: true,
        name: "Rider One", phoneNumber: "9999999999",
        avgRating: 4.5, totalReviews: 10,
        createdAt: new Date(), updatedAt: new Date(),
        codEligible: true, cashInHand: 0, currentOrderId: null, shiftEndTime: null,
        latitude: null, longitude: null, address: null, deletedAt: null,
        imageUrl: null, commissionRate: null,
        user: { name: "Rider One", phoneNumber: "9999999999", email: "rider@test.com" },
        kyc: null,
        kitchenAssignments: [],
        reviews: [
          {
            id: "r2", rating: 5, speedRating: 4, behaviorHygiene: true, comment: "Fast!",
            createdAt: new Date(), updatedAt: new Date(), userId: "u-3", orderId: "o-1", kitchenPartnerId: null,
            deliveryPartnerId: "dp-1", tasteRating: null, packagingRating: null, portionSizeRating: null,
            safetyContactless: null,
            order: { id: "o-1", orderItems: [{ menuItem: { name: "Idli" } }] },
          },
        ],
        _count: { kitchenAssignments: 100, reviews: 1 },
      })

      const result = await getDeliveryDashboardData()

      expect(result).not.toBeNull()
      if (result) {
        expect(result.reviews).toHaveLength(1)
        expect(result.reviews[0].rating).toBe(5)
        expect(result.reviews[0].itemName).toBe("Idli")
      }
    })
  })
})
