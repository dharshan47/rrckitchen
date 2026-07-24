import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  coupon: { findUnique: vi.fn() },
  couponRedemption: { count: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

import { validateCoupon } from "@/actions/cart-checkout/coupon"

describe("coupon validation", () => {
  beforeEach(() => { vi.clearAllMocks() })

  const validCoupon = {
    id: "c1", code: "SAVE10", discountType: "PERCENTAGE" as const, discountValue: 10,
    maxDiscount: 100, minOrderValue: 200, scope: "PLATFORM" as const, kitchenPartnerId: null,
    validFrom: new Date(Date.now() - 86400000), validTo: new Date(Date.now() + 86400000),
    usageLimitTotal: 100, usageLimitPerUser: 1, isActive: true,
  }

  it("validates a valid coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(validCoupon)
    mockPrisma.couponRedemption.count.mockResolvedValue(0)

    const result = await validateCoupon({ code: "SAVE10", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(50)
  })

  it("rejects non-existent coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null)

    const result = await validateCoupon({ code: "INVALID", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
    expect(result.error).toBe("Coupon not found")
  })

  it("rejects inactive coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ ...validCoupon, isActive: false })

    const result = await validateCoupon({ code: "INACTIVE", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
  })

  it("rejects expired coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...validCoupon, validFrom: new Date(Date.now() - 86400000 * 10), validTo: new Date(Date.now() - 86400000),
    })

    const result = await validateCoupon({ code: "EXPIRED", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
  })

  it("rejects coupon below min order", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ ...validCoupon, minOrderValue: 1000 })
    mockPrisma.couponRedemption.count.mockResolvedValue(0)

    const result = await validateCoupon({ code: "SAVE10", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
    expect(result.error).toContain("minimum order")
  })

  it("caps percentage discount to maxDiscount", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ ...validCoupon, maxDiscount: 30 })
    mockPrisma.couponRedemption.count.mockResolvedValue(0)

    const result = await validateCoupon({ code: "SAVE10", userId: "u-1", subtotal: 500 })

    expect(result.discountAmount).toBe(30)
  })

  it("applies flat discount directly", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ ...validCoupon, discountType: "FLAT", discountValue: 50, maxDiscount: null })
    mockPrisma.couponRedemption.count.mockResolvedValue(0)

    const result = await validateCoupon({ code: "FLAT50", userId: "u-1", subtotal: 500 })

    expect(result.discountAmount).toBe(50)
  })

  it("rejects when usage limit reached", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(validCoupon)
    mockPrisma.couponRedemption.count.mockResolvedValue(100)

    const result = await validateCoupon({ code: "SAVE10", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
    expect(result.error).toContain("usage limit")
  })

  it("rejects when per-user limit reached", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(validCoupon)
    mockPrisma.couponRedemption.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1)

    const result = await validateCoupon({ code: "SAVE10", userId: "u-1", subtotal: 500 })

    expect(result.valid).toBe(false)
  })
})
