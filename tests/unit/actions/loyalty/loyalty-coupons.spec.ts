import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  loyaltyCoupon: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  loyaltyPoints: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  loyaltyTransaction: { create: vi.fn() },
  loyaltyCouponPurchase: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockSession = vi.hoisted(() => ({ user: { id: "user-1" } }))
vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => mockSession),
}))

import {
  getAllLoyaltyCoupons, getAvailableLoyaltyCoupons, createLoyaltyCoupon,
  updateLoyaltyCoupon, deleteLoyaltyCoupon, toggleLoyaltyCouponActive,
  purchaseCouponWithPoints, getLoyaltyCouponById, getUserPurchasedCoupons,
} from "@/actions/loyalty/loyalty-coupons"

describe("loyalty-coupons", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAllLoyaltyCoupons", () => {
    it("returns all coupons with purchaseCount", async () => {
      mockPrisma.loyaltyCoupon.findMany.mockResolvedValue([
        { id: "lc1", name: "₹50 Off", description: null, discountType: "FLAT", discountValue: 50, maxDiscount: null, minOrderValue: null, pointsCost: 200, isActive: true, createdAt: new Date("2025-01-01") },
      ])

      const result = await getAllLoyaltyCoupons()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("₹50 Off")
      expect(result[0].pointsCost).toBe(200)
      expect(result[0].purchaseCount).toBe(0)
    })

    it("returns empty array", async () => {
      mockPrisma.loyaltyCoupon.findMany.mockResolvedValue([])
      expect(await getAllLoyaltyCoupons()).toEqual([])
    })
  })

  describe("getAvailableLoyaltyCoupons", () => {
    it("returns only active coupons sorted by pointsCost", async () => {
      mockPrisma.loyaltyCoupon.findMany.mockResolvedValue([
        { id: "lc2", pointsCost: 100 }, { id: "lc1", pointsCost: 200 },
      ])

      const result = await getAvailableLoyaltyCoupons()

      expect(mockPrisma.loyaltyCoupon.findMany).toHaveBeenCalledWith({
        where: { isActive: true }, orderBy: { pointsCost: "asc" },
      })
      expect(result).toHaveLength(2)
    })
  })

  describe("createLoyaltyCoupon", () => {
    it("creates a loyalty coupon", async () => {
      mockPrisma.loyaltyCoupon.create.mockResolvedValue({ id: "lc-new" })

      await createLoyaltyCoupon({ name: "₹50 Off", discountType: "FLAT", discountValue: 50, pointsCost: 200 })

      expect(mockPrisma.loyaltyCoupon.create).toHaveBeenCalledWith({
        data: { name: "₹50 Off", discountType: "FLAT", discountValue: 50, pointsCost: 200, description: null, maxDiscount: null, minOrderValue: null },
      })
    })
  })

  describe("updateLoyaltyCoupon", () => {
    it("updates fields", async () => {
      await updateLoyaltyCoupon("lc1", { pointsCost: 300 })
      expect(mockPrisma.loyaltyCoupon.update).toHaveBeenCalledWith({
        where: { id: "lc1" }, data: { pointsCost: 300 },
      })
    })
  })

  describe("deleteLoyaltyCoupon", () => {
    it("deletes", async () => {
      await deleteLoyaltyCoupon("lc1")
      expect(mockPrisma.loyaltyCoupon.delete).toHaveBeenCalledWith({ where: { id: "lc1" } })
    })
  })

  describe("toggleLoyaltyCouponActive", () => {
    it("toggles", async () => {
      await toggleLoyaltyCouponActive("lc1", false)
      expect(mockPrisma.loyaltyCoupon.update).toHaveBeenCalledWith({
        where: { id: "lc1" }, data: { isActive: false },
      })
    })
  })

  describe("getLoyaltyCouponById", () => {
    it("returns single coupon", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue({ id: "lc1" })
      expect(await getLoyaltyCouponById("lc1")).toEqual({ id: "lc1" })
    })

    it("returns null for missing", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue(null)
      expect(await getLoyaltyCouponById("missing")).toBeNull()
    })
  })

  describe("getUserPurchasedCoupons", () => {
    it("returns user's purchased coupons with name", async () => {
      mockPrisma.loyaltyCouponPurchase.findMany.mockResolvedValue([
        { id: "p1", couponCode: "LOYALTY-TEST-CODE", loyaltyCoupon: { name: "₹50 Off" } },
      ])

      const result = await getUserPurchasedCoupons()

      expect(result).toHaveLength(1)
      expect(result[0].couponCode).toBe("LOYALTY-TEST-CODE")
    })

    it("returns empty when not logged in", async () => {
      const { getSession } = await import("@/lib/auth-server")
      vi.mocked(getSession).mockResolvedValueOnce(null)

      expect(await getUserPurchasedCoupons()).toEqual([])
    })
  })

  describe("purchaseCouponWithPoints", () => {
    it("purchases coupon deducting points", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue({
        id: "lc1", name: "₹50 Off", isActive: true, discountType: "FLAT", discountValue: 50,
        maxDiscount: null, minOrderValue: null, pointsCost: 200,
      })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({
        userId: "user-1", points: 500,
      })
      mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma))
      mockPrisma.loyaltyCouponPurchase.create.mockResolvedValue({ id: "p-new" })

      const result = await purchaseCouponWithPoints("lc1")

      expect(result.couponCode).toContain("LOYALTY-")
      expect(result.discountType).toBe("FLAT")
      expect(result.discountValue).toBe(50)
      expect(mockPrisma.loyaltyPoints.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { points: { decrement: 200 } },
      })
    })

    it("throws if coupon not found", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue(null)
      await expect(purchaseCouponWithPoints("missing")).rejects.toThrow("Coupon not available")
    })

    it("throws if coupon inactive", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue({ id: "lc1", isActive: false, pointsCost: 100 })
      await expect(purchaseCouponWithPoints("lc1")).rejects.toThrow("Coupon not available")
    })

    it("throws if insufficient points", async () => {
      mockPrisma.loyaltyCoupon.findUnique.mockResolvedValue({
        id: "lc1", isActive: true, pointsCost: 500, discountType: "FLAT", discountValue: 50,
      })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({ userId: "user-1", points: 100 })

      await expect(purchaseCouponWithPoints("lc1")).rejects.toThrow("Insufficient loyalty points")
    })

    it("throws if not authenticated", async () => {
      const { getSession } = await import("@/lib/auth-server")
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(purchaseCouponWithPoints("lc1")).rejects.toThrow("Not authenticated")
    })
  })
})
