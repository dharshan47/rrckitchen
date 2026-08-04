import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  deliverySlot: { findFirst: vi.fn() },
  deliveryPartner: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/redis", () => ({ redis: { get: vi.fn(), set: vi.fn(), expire: vi.fn() } }))
vi.mock("@/lib/ably/server", () => ({ getAblyRest: () => ({ channels: { get: () => ({ publish: vi.fn() }) } }) }))

const mockSession = { user: { id: "user-1", role: "CUSTOMER" } }
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { getUserOrders, getOrderForTracking, updateOrderStatus } from "@/actions/orders/orders"

describe("orders", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getUserOrders", () => {
    it("returns orders with items, ratings, and delivery partner", async () => {
      const now = new Date()
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: "order-1", status: "CONFIRMED", totalAmount: 500, createdAt: now,
          serviceDate: now, timeSlot: "MORNING",
          orderItems: [
            {
              id: "oi1", quantity: 2, unitPrice: 100, kitchenPartnerId: "kp1",
              menuItem: { name: "Dosa", foodType: "VEG", photos: [] },
              kitchenPartner: {
                id: "kp1",
                kitchenAlias: { displayName: "Tasty Kitchen" },
                deliveryPartnerAssignments: [
                  { deliveryPartner: { id: "dp1", user: { name: "Rider One" } } },
                ],
              },
            },
          ],
          address: { lineOne: "Addr", lineTwo: null, pincode: "123" },
          payment: { status: "SUCCESS", provider: "RAZORPAY" },
          review: { id: "r1", rating: 4, tasteRating: 4, packagingRating: 5, portionSizeRating: 4, comment: "Good" },
          deliveryReview: { id: "dr1", rating: 5, speedRating: 5, behaviorHygiene: true, safetyContactless: true, comment: "Great" },
        },
      ])

      const result = await getUserOrders()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("order-1")
      expect(result[0].items).toHaveLength(1)
      expect(result[0].deliveryPartner?.name).toBe("Rider One")
      expect(result[0].kitchenReview?.tasteRating).toBe(4)
      expect(result[0].deliveryReview?.speedRating).toBe(5)
    })

    it("returns empty array when no orders", async () => {
      mockPrisma.order.findMany.mockResolvedValue([])
      expect(await getUserOrders()).toEqual([])
    })
  })

  describe("getOrderForTracking", () => {
    it("returns order with delivery partner and location data", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: "order-1", status: "READYFORPICKUP", totalAmount: 500,
        deliveryStatus: null,
        deliveryAssignment: { status: "ASSIGNED" },
        createdAt: new Date(),
        deliveryPartner: { id: "dp1", user: { name: "Rider One" } },
        deliveryLocations: [{ latitude: 12.36, longitude: 56.80, updatedAt: new Date() }],
        orderItems: [
          {
            quantity: 2, unitPrice: 100,
            menuItem: { name: "Dosa", photos: [] },
            kitchenPartner: {
              kitchenAddress: { latitude: 12.34, longitude: 56.78 },
              kitchenAlias: { displayName: "Tasty Kitchen" },
            },
          },
        ],
        address: { latitude: 12.35, longitude: 56.79, lineOne: "Addr", lineTwo: null, pincode: "123" },
        payment: { provider: "RAZORPAY", status: "SUCCESS" },
      })

      const result = await getOrderForTracking("order-1")

      expect(result?.id).toBe("order-1")
      expect(result?.deliveryPersonName).toBe("Rider One")
      expect(result?.kitchenLat).toBe(12.34)
      expect(result?.deliveryPartner?.name).toBe("Rider One")
      expect(result?.items).toHaveLength(1)
    })

    it("throws for non-existent order", async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)
      await expect(getOrderForTracking("missing")).rejects.toThrow("Order not found")
    })
  })

  describe("updateOrderStatus", () => {
    it("updates order status and creates history", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: "order-1", status: "CONFIRMED",
        orderItems: [{ id: "oi1", kitchenPartnerId: "kp1", menuItem: { name: "Dosa" }, quantity: 2 }],
        user: { phoneNumber: "8888888888" },
      })
      mockPrisma.deliverySlot.findFirst.mockResolvedValue({ id: "slot1", cutoffTime: "18:00" })
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([])

      const result = await updateOrderStatus("order-1", "PREPARING")

      expect(result.success).toBe(true)
      expect(mockPrisma.order.update).toHaveBeenCalled()
    })
  })
})
