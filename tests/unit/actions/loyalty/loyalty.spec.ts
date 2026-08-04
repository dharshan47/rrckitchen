import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  loyaltyPoints: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  loyaltyTransaction: { create: vi.fn(), findMany: vi.fn() },
  order: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockSession = vi.hoisted(() => ({ user: { id: "user-1" } }))
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { awardPoints, redeemPoints, getLoyaltySummary, getLoyaltyHistory, computeTier } from "@/actions/loyalty/loyalty"

describe("loyalty", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("computeTier", () => {
    it("returns GOLD for 5000+ points", () => { expect(computeTier(5000)).toBe("GOLD") })
    it("returns GOLD for 10000 points", () => { expect(computeTier(10000)).toBe("GOLD") })
    it("returns SILVER for 2000-4999 points", () => { expect(computeTier(2000)).toBe("SILVER") })
    it("returns SILVER for 3000 points", () => { expect(computeTier(3000)).toBe("SILVER") })
    it("returns BRONZE for 1999 points", () => { expect(computeTier(1999)).toBe("BRONZE") })
    it("returns BRONZE for 0 points", () => { expect(computeTier(0)).toBe("BRONZE") })
  })

  describe("awardPoints", () => {
    it("awards points for an order", async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: "order-1", totalAmount: 500, orderItems: [{ id: "oi1" }, { id: "oi2" }, { id: "oi3" }],
      })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue(null)
      mockPrisma.loyaltyPoints.upsert.mockResolvedValue({})

      await awardPoints("order-1")

      expect(mockPrisma.loyaltyPoints.upsert).toHaveBeenCalled()
      expect(mockPrisma.loyaltyTransaction.create).toHaveBeenCalled()
    })

    it("skips silently if order not found", async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)
      await expect(awardPoints("missing")).resolves.not.toThrow()
    })
  })

  describe("redeemPoints", () => {
    it("redeems points", async () => {
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({ userId: "user-1", points: 500 })
      mockPrisma.loyaltyPoints.update.mockResolvedValue({})

      await redeemPoints("order-1", 200)

      expect(mockPrisma.loyaltyPoints.update).toHaveBeenCalledWith({
        where: { userId: "user-1" }, data: { points: { decrement: 200 } },
      })
      expect(mockPrisma.loyaltyTransaction.create).toHaveBeenCalled()
    })

    it("throws if insufficient points", async () => {
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({ userId: "user-1", points: 50 })
      await expect(redeemPoints("order-1", 200)).rejects.toThrow("Insufficient points")
    })
  })

  describe("getLoyaltySummary", () => {
    it("returns points record", async () => {
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({ userId: "user-1", points: 100, lifetimePoints: 500, tier: "SILVER" })
      const result = await getLoyaltySummary()
      expect(result?.points).toBe(100)
      expect(result?.tier).toBe("SILVER")
    })

    it("returns null if no record", async () => {
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue(null)
      expect(await getLoyaltySummary()).toBeNull()
    })
  })

  describe("getLoyaltyHistory", () => {
    it("returns last 50 transactions", async () => {
      mockPrisma.loyaltyTransaction.findMany.mockResolvedValue([{ id: "t1", points: 100, type: "EARNED", description: "Order", createdAt: new Date() }])
      const result = await getLoyaltyHistory()
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe("EARNED")
    })
  })
})
