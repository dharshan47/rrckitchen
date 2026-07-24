import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  paymentOffer: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({ requireAdmin: vi.fn() }))

import { getAllPaymentOffers, createPaymentOffer, updatePaymentOffer, deletePaymentOffer } from "@/actions/admin/admin-payment-offers"
import { requireAdmin } from "@/lib/auth-guards"

describe("admin-payment-offers", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAllPaymentOffers", () => {
    it("returns empty array when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await getAllPaymentOffers()
      expect(result).toEqual([])
    })

    it("returns mapped payment offers", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.findMany.mockResolvedValue([
        {
          id: "po-1",
          name: "UPI 10% Off",
          description: "Get 10% off on UPI",
          offerType: "UPI",
          discountType: "PERCENTAGE",
          discountValue: 10,
          maxDiscount: 200,
          minOrderValue: 500,
          validFrom: new Date("2025-01-01"),
          validTo: new Date("2025-12-31"),
          isActive: true,
          createdAt: new Date("2025-01-01"),
        },
      ])

      const result = await getAllPaymentOffers()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("UPI 10% Off")
      expect(result[0].discountValue).toBe(10)
      expect(result[0].maxDiscount).toBe(200)
      expect(result[0].minOrderValue).toBe(500)
      expect(result[0].validFrom).toBe(new Date("2025-01-01").toISOString())
      expect(result[0].isActive).toBe(true)
    })

    it("handles null optional fields", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.findMany.mockResolvedValue([
        {
          id: "po-2",
          name: "Flat 50",
          description: null,
          offerType: "ALL",
          discountType: "FLAT",
          discountValue: 50,
          maxDiscount: null,
          minOrderValue: null,
          validFrom: new Date("2025-06-01"),
          validTo: new Date("2025-06-30"),
          isActive: false,
          createdAt: new Date("2025-06-01"),
        },
      ])

      const result = await getAllPaymentOffers()
      expect(result[0].maxDiscount).toBeNull()
      expect(result[0].minOrderValue).toBeNull()
      expect(result[0].description).toBeNull()
    })
  })

  describe("createPaymentOffer", () => {
    it("returns unauthorized when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await createPaymentOffer({
        name: "Test",
        offerType: "UPI",
        discountType: "FLAT",
        discountValue: 100,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        isActive: true,
      })
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("creates offer successfully", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.create.mockResolvedValue({ id: "po-new" })

      const result = await createPaymentOffer({
        name: "New Offer",
        description: "Desc",
        offerType: "WALLET",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscount: 100,
        minOrderValue: 300,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        isActive: true,
      })

      expect(mockPrisma.paymentOffer.create).toHaveBeenCalledWith({
        data: {
          name: "New Offer",
          description: "Desc",
          offerType: "WALLET",
          discountType: "PERCENTAGE",
          discountValue: 15,
          maxDiscount: 100,
          minOrderValue: 300,
          validFrom: new Date("2025-01-01"),
          validTo: new Date("2025-12-31"),
          isActive: true,
        },
      })
      expect(result).toEqual({ success: true, id: "po-new" })
    })

    it("handles null description and optional fields", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.create.mockResolvedValue({ id: "po-2" })

      await createPaymentOffer({
        name: "Simple",
        offerType: "ALL",
        discountType: "FLAT",
        discountValue: 50,
        validFrom: "2025-06-01",
        validTo: "2025-06-30",
        isActive: false,
      })

      expect(mockPrisma.paymentOffer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: null,
          maxDiscount: null,
          minOrderValue: null,
        }),
      })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.create.mockRejectedValue(new Error("DB error"))

      const result = await createPaymentOffer({
        name: "Fail",
        offerType: "UPI",
        discountType: "FLAT",
        discountValue: 10,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        isActive: true,
      })
      expect(result).toEqual({ success: false, error: "Failed to create payment offer" })
    })
  })

  describe("updatePaymentOffer", () => {
    it("returns unauthorized when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await updatePaymentOffer("po-1", { name: "Updated" })
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("updates only provided fields", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.update.mockResolvedValue({})

      await updatePaymentOffer("po-1", { name: "New Name", discountValue: 20 })

      expect(mockPrisma.paymentOffer.update).toHaveBeenCalledWith({
        where: { id: "po-1" },
        data: { name: "New Name", discountValue: 20 },
      })
    })

    it("converts date strings to Date objects", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.update.mockResolvedValue({})

      await updatePaymentOffer("po-1", { validFrom: "2025-06-01", validTo: "2025-12-31" })

      expect(mockPrisma.paymentOffer.update).toHaveBeenCalledWith({
        where: { id: "po-1" },
        data: { validFrom: new Date("2025-06-01"), validTo: new Date("2025-12-31") },
      })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.update.mockRejectedValue(new Error("DB error"))

      const result = await updatePaymentOffer("po-1", { name: "X" })
      expect(result).toEqual({ success: false, error: "Failed to update payment offer" })
    })
  })

  describe("deletePaymentOffer", () => {
    it("returns unauthorized when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await deletePaymentOffer("po-1")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("deletes offer successfully", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.delete.mockResolvedValue({})

      const result = await deletePaymentOffer("po-1")

      expect(mockPrisma.paymentOffer.delete).toHaveBeenCalledWith({ where: { id: "po-1" } })
      expect(result).toEqual({ success: true })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.paymentOffer.delete.mockRejectedValue(new Error("DB error"))

      const result = await deletePaymentOffer("po-1")
      expect(result).toEqual({ success: false, error: "Failed to delete payment offer" })
    })
  })
})
