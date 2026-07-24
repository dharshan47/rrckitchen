import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  coupon: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  kitchenPartner: { findMany: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/auth-guards", () => ({ requireAdmin: vi.fn() }))

import { getAllCoupons, getSimpleKitchenPartners, createCoupon, updateCoupon, deleteCoupon, toggleCouponActive } from "@/actions/admin/admin-coupons"

describe("admin-coupons", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAllCoupons", () => {
    it("returns coupons with kitchen alias and redemption count", async () => {
      mockPrisma.coupon.findMany.mockResolvedValue([
        {
          id: "cp1", code: "SAVE10", description: "Save 10%", discountType: "PERCENTAGE", discountValue: 10,
          maxDiscount: 100, minOrderValue: 200, scope: "PLATFORM", kitchenPartnerId: null,
          validFrom: new Date("2025-01-01"), validTo: new Date("2025-12-31"),
          usageLimitTotal: 100, usageLimitPerUser: 1, isActive: true, createdAt: new Date("2025-01-01"),
          kitchenPartner: null, _count: { redemptions: 5 },
        },
      ])

      const result = await getAllCoupons()

      expect(result).toHaveLength(1)
      expect(result[0].code).toBe("SAVE10")
      expect(result[0].kitchenName).toBeNull()
      expect(result[0].redemptionCount).toBe(5)
    })

    it("returns kitchen alias for kitchen-specific coupons", async () => {
      mockPrisma.coupon.findMany.mockResolvedValue([
        {
          id: "cp2", code: "KITCHEN20", discountType: "FLAT", discountValue: 20,
          scope: "KITCHEN_SPECIFIC", kitchenPartnerId: "k1", isActive: true,
          kitchenPartner: { name: "Tasty Kitchen" },
          _count: { redemptions: 0 },
        },
      ])

      const result = await getAllCoupons()
      expect(result[0].kitchenName).toBe("Tasty Kitchen")
    })
  })

  describe("getSimpleKitchenPartners", () => {
    it("returns id and name for all kitchen partners", async () => {
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([
        { id: "k1", name: "Kitchen A" }, { id: "k2", name: "Kitchen B" },
      ])

      const result = await getSimpleKitchenPartners()
      expect(result).toEqual([{ id: "k1", name: "Kitchen A" }, { id: "k2", name: "Kitchen B" }])
    })
  })

  describe("createCoupon", () => {
    it("creates a coupon successfully", async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null)
      mockPrisma.coupon.create.mockResolvedValue({ id: "cp-new" })

      const result = await createCoupon({
        code: "NEW10", discountType: "PERCENTAGE", discountValue: 10,
        validFrom: new Date().toISOString(), validTo: new Date().toISOString(),
        scope: "PLATFORM", isActive: true,
      })

      expect(result).toEqual({ success: true, id: "cp-new" })
    })

    it("returns error for duplicate code", async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({ id: "cp1" })

      const result = await createCoupon({
        code: "DUPE", discountType: "FLAT", discountValue: 50,
        validFrom: new Date().toISOString(), validTo: new Date().toISOString(),
        scope: "PLATFORM", isActive: true,
      })

      expect(result).toEqual({ success: false, error: "Coupon code already exists" })
    })
  })

  describe("updateCoupon", () => {
    it("updates a coupon's fields", async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null)
      mockPrisma.coupon.update.mockResolvedValue({ id: "cp1" })

      await updateCoupon("cp1", { description: "Updated" })

      expect(mockPrisma.coupon.update).toHaveBeenCalledWith({
        where: { id: "cp1" }, data: { description: "Updated" },
      })
    })
  })

  describe("deleteCoupon", () => {
    it("deletes a coupon", async () => {
      await deleteCoupon("cp1")
      expect(mockPrisma.coupon.delete).toHaveBeenCalledWith({ where: { id: "cp1" } })
    })
  })

  describe("toggleCouponActive", () => {
    it("toggles coupon active status", async () => {
      await toggleCouponActive("cp1", false)
      expect(mockPrisma.coupon.update).toHaveBeenCalledWith({
        where: { id: "cp1" }, data: { isActive: false },
      })
    })
  })
})
