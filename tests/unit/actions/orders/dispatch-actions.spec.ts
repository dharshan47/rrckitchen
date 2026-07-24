import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  deliveryPartner: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  order: { findMany: vi.fn(), findUnique: vi.fn() },
  deliveryAssignment: { create: vi.fn(), findFirst: vi.fn() },
  deliveryLocation: { create: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/ably/server", () => ({ getAblyRest: () => ({ channels: { get: () => ({ publish: vi.fn() }) } }) }))

const mockSession = { user: { id: "dp-1", role: "DELIVERY_PARTNER" } }
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { goOnline, goOffline, getPendingOrders } from "@/actions/orders/dispatch-actions"

describe("dispatch-actions", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("goOnline", () => {
    it("updates partner status and clears rejected orders", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1", isOnline: false, currentOrderId: null, shiftEndTime: null })

      const result = await goOnline()

      expect(result.success).toBe(true)
      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dp-1" },
          data: expect.objectContaining({ isOnline: true, rejectedOrderIds: [] }),
        }),
      )
    })

    it("throws if not authenticated", async () => {
      const { getSession } = await import("@/lib/auth-server")
      vi.mocked(getSession).mockResolvedValueOnce(null)
      await expect(goOnline()).rejects.toThrow()
    })
  })

  describe("goOffline", () => {
    it("sets isOnline to false", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1", isOnline: true })

      const result = await goOffline()

      expect(result.success).toBe(true)
      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "dp-1" }, data: expect.objectContaining({ isOnline: false }) }),
      )
    })
  })

  describe("getPendingOrders", () => {
    it("returns pending orders with items", async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: "order-1", status: "READYFORPICKUP", totalAmount: 500, createdAt: new Date(),
          orderItems: [
            { id: "oi1", menuItem: { name: "Dosa", imageUrl: "/dosa.jpg" }, quantity: 2, unitPrice: 100, kitchenPartner: { name: "Tasty Kitchen", address: "Addr", lat: 12.34, lng: 56.78 } },
          ],
          user: { phoneNumber: "9999999999", address: [{ id: "a1", fullAddress: "Home", lat: 12.35, lng: 56.79 }] },
        },
      ])

      const result = await getPendingOrders()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("order-1")
      expect(result[0].items[0].kitchenName).toBe("Tasty Kitchen")
    })

    it("returns empty array when none", async () => {
      mockPrisma.order.findMany.mockResolvedValue([])
      expect(await getPendingOrders()).toEqual([])
    })
  })
})
