import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  order: { findMany: vi.fn(), count: vi.fn() },
  kitchenPartner: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  deliveryPartner: { findUnique: vi.fn(), create: vi.fn() },
  orderItem: { count: vi.fn(), aggregate: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
  kitchenAvailability: { findUnique: vi.fn() },
  menu: { findMany: vi.fn() },
  menuItem: { count: vi.fn(), findMany: vi.fn() },
  kitchenPayout: { findMany: vi.fn() },
  supportTicket: { findMany: vi.fn() },
  review: { findMany: vi.fn() },
  deliveryPartnerPayout: { aggregate: vi.fn(), findMany: vi.fn() },
  deliveryReview: { groupBy: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => ({ user: { id: "u-1" } })),
}))

import { getKitchenDashboardData, getDeliveryDashboardData } from "@/actions/admin/dashboard"

const kitchenReviews = [
  {
    id: "r1", rating: 5, tasteRating: 5, packagingRating: 4, portionSizeRating: null, comment: "Great!",
    createdAt: new Date(), updatedAt: new Date(), userId: "u-2", orderId: "o-1", kitchenPartnerId: "kp-1",
    deliveryPartnerId: null, speedRating: null, behaviorHygiene: null, safetyContactless: null,
    order: { orderItems: [{ menuItem: { name: "Dosa" } }] },
    user: { name: "Customer A" },
  },
]

const deliveryReviews = [
  {
    id: "r2", rating: 5, speedRating: 4, behaviorHygiene: true, comment: "Fast!",
    createdAt: new Date(), updatedAt: new Date(), userId: "u-3", orderId: "o-1", kitchenPartnerId: null,
    deliveryPartnerId: "dp-1", tasteRating: null, packagingRating: null, portionSizeRating: null,
    safetyContactless: null,
    order: { id: "o-1", orderItems: [{ menuItem: { name: "Idli" } }] },
  },
]

function mockDefaultQueries() {
  mockPrisma.orderItem.count.mockResolvedValue(0)
  mockPrisma.orderItem.aggregate.mockResolvedValue({ _sum: { unitPrice: null } })
  mockPrisma.orderItem.groupBy.mockResolvedValue([])
  mockPrisma.orderItem.findMany.mockResolvedValue([])
  mockPrisma.kitchenAvailability.findUnique.mockResolvedValue(null)
  mockPrisma.menu.findMany.mockResolvedValue([])
  mockPrisma.menuItem.count.mockResolvedValue(0)
  mockPrisma.menuItem.findMany.mockResolvedValue([])
  mockPrisma.kitchenPayout.findMany.mockResolvedValue([])
  mockPrisma.supportTicket.findMany.mockResolvedValue([])
  mockPrisma.review.findMany.mockResolvedValue([])
  mockPrisma.deliveryPartnerPayout.aggregate.mockResolvedValue({ _sum: { amount: null } })
  mockPrisma.deliveryPartnerPayout.findMany.mockResolvedValue([])
  mockPrisma.deliveryReview.groupBy.mockResolvedValue([])
}

describe("dashboard-data", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDefaultQueries()
  })

  describe("getKitchenDashboardData", () => {
    it("returns kitchen dashboard data with reviews", async () => {
      mockPrisma.kitchenPartner.findUnique.mockResolvedValue({
        id: "kp-1", slug: "tasty-kitchen", name: "Tasty Kitchen", status: "ACTIVE", isActive: true,
        phoneNumber: null, imageUrl: null, coverImageUrl: null, description: null,
        deliveryFee: null, minOrder: null, estimatedPrepTime: null,
        avgRating: 4.2, totalReviews: 25,
        createdAt: new Date(), updatedAt: new Date(), totalRevenue: null, latitude: null, longitude: null,
        address: null, commissionRate: null,
        userId: "u-1", operatingHours: null, rejectedOrderIds: [],
        isPublished: false, currentOrderId: null, shiftEndTime: null, deletedAt: null,
        kitchenAlias: null, kitchenKyc: null, kitchenAddress: null,
        kitchenCategories: [],
        user: { name: "Test", email: "test@test.com" },
        orderItems: [],
        orders: [],
        reviews: kitchenReviews,
        _count: { orders: 50, reviews: 1, orderItems: 50 },
      })
      mockPrisma.review.findMany.mockResolvedValue(kitchenReviews)
      mockPrisma.order.findMany.mockResolvedValue([])
      mockPrisma.order.count.mockResolvedValue(0)

      const result = await getKitchenDashboardData()

      expect(result).not.toBeNull()
      if (result) {
        expect(result.reviews).toHaveLength(1)
        expect(result.reviews[0].rating).toBe(5)
        expect(result.reviews[0].itemName).toBe("Dosa")
        expect(result.reviews[0].customerName).toBe("Customer A")
        expect(result.settlements).toEqual([])
        expect(result.weeklySales).toHaveLength(7)
      }
    })

    it("creates kitchen partner if not found", async () => {
      const kitchen = {
        id: "kp-new", slug: "test-kitchen", name: "Test", status: "ACTIVE", isActive: true,
        phoneNumber: null, imageUrl: null, coverImageUrl: null, description: null,
        deliveryFee: null, minOrder: null, estimatedPrepTime: null,
        avgRating: null, totalReviews: 0,
        createdAt: new Date(), updatedAt: new Date(), totalRevenue: null, latitude: null, longitude: null,
        address: null, commissionRate: null,
        userId: "u-1", operatingHours: null, rejectedOrderIds: [],
        isPublished: false, currentOrderId: null, shiftEndTime: null, deletedAt: null,
        kitchenAlias: null, kitchenKyc: null, kitchenAddress: null,
        kitchenCategories: [],
        user: { name: "Test", email: "test@test.com" },
        orderItems: [], orders: [], reviews: [],
        _count: { orders: 0, reviews: 0, orderItems: 0 },
      }
      mockPrisma.kitchenPartner.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(kitchen)
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([])
      mockPrisma.kitchenPartner.create.mockResolvedValue(kitchen)

      const result = await getKitchenDashboardData()
      expect(result).not.toBeNull()
      expect(mockPrisma.kitchenPartner.create).toHaveBeenCalled()
    })
  })

  describe("getDeliveryDashboardData", () => {
    it("returns delivery dashboard data with reviews", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({
        id: "dp-1", userId: "u-2", status: "ACTIVE", isOnline: true,
        name: "Rider One", phoneNumber: "9999999999",
        avgRating: 4.5, totalReviews: 10,
        createdAt: new Date(), updatedAt: new Date(),
        currentOrderId: null, shiftEndTime: null,
        latitude: null, longitude: null, address: null, deletedAt: null,
        imageUrl: null, commissionRate: null,
        user: { name: "Rider One", phoneNumber: "9999999999", email: "rider@test.com" },
        kyc: null,
        kitchenAssignments: [],
        reviews: deliveryReviews,
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
