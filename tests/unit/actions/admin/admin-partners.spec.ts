import { describe, it, expect, vi, beforeEach } from "vitest"

type MockTx = { kitchenCategory: { deleteMany: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> } }

const mockPrisma = vi.hoisted(() => ({
  kitchenPartner: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  deliveryPartner: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((fns: unknown) => {
    const tx: MockTx = {
      kitchenCategory: { deleteMany: vi.fn(), createMany: vi.fn() },
    }
    return (fns as (tx: MockTx) => Promise<unknown>)(tx)
  }),
  kitchenCategory: {},
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
}))

import {
  getAdminKitchenPartners,
  getAdminDeliveryPartners,
  updateKitchenPartnerStatus,
  updateKitchenCuisines,
  updateDeliveryPartnerStatus,
} from "@/actions/admin/admin-partners"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"

const adminSession = { user: { id: "admin-1" } }

describe("admin-partners", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAdminKitchenPartners", () => {
    it("returns empty array when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await getAdminKitchenPartners()
      expect(result).toEqual([])
    })

    it("returns mapped kitchen partners", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([
        {
          id: "k-1",
          userId: "u-1",
          status: "ACTIVE",
          createdAt: new Date("2025-01-01"),
          kitchenAlias: { displayName: "Tasty Kitchen" },
          kitchenKyc: { bankName: "SBI", bankAccountNumber: "123", ifscCode: "SBIN000", accountHolderName: "User", upiId: null, gpayNumber: null, phoneNumber: "99999", aadhaarVerified: true },
          kitchenCategories: [{ category: { id: "cat-1", name: "Indian" } }],
          user: { name: "John", phoneNumber: "9999999999", email: "john@test.com" },
          _count: { orderItems: 10, menus: 3 },
          orderItems: [{ unitPrice: 100, quantity: 2 }, { unitPrice: 50, quantity: 1 }],
        },
      ])

      const result = await getAdminKitchenPartners()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Tasty Kitchen")
      expect(result[0].revenue).toBe(250)
      expect(result[0].orders).toBe(10)
      expect(result[0].cuisines).toEqual([{ id: "cat-1", name: "Indian" }])
      expect(result[0].kyc).not.toBeNull()
    })

    it("uses user name when no alias exists", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([
        {
          id: "k-2",
          userId: "u-2",
          status: "PENDINGAPPROVAL",
          createdAt: new Date(),
          kitchenAlias: null,
          kitchenKyc: null,
          kitchenCategories: [],
          user: { name: "Jane", phoneNumber: null, email: null },
          _count: { orderItems: 0, menus: 0 },
          orderItems: [],
        },
      ])

      const result = await getAdminKitchenPartners()
      expect(result[0].name).toBe("Jane")
      expect(result[0].kyc).toBeNull()
    })
  })

  describe("getAdminDeliveryPartners", () => {
    it("returns empty array when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await getAdminDeliveryPartners()
      expect(result).toEqual([])
    })

    it("returns mapped delivery partners", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([
        {
          id: "dp-1",
          userId: "u-3",
          status: "ACTIVE",
          createdAt: new Date("2025-06-01"),
          user: { name: "Delivery Guy", phoneNumber: "8888888888", email: "dp@test.com" },
          kyc: { bankName: "HDFC", bankAccountNumber: "456", ifscCode: "HDFC000", accountHolderName: "D Guy", upiId: "guy@upi", googlePayNumber: "111", phonePeNumber: "222", verifiedAt: new Date() },
          _count: { kitchenAssignments: 5 },
        },
      ])

      const result = await getAdminDeliveryPartners()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Delivery Guy")
      expect(result[0].orders).toBe(5)
      expect(result[0].kyc).not.toBeNull()
    })

    it("handles null kyc and null user", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([
        {
          id: "dp-2",
          userId: "u-4",
          status: "PENDINGAPPROVAL",
          createdAt: new Date(),
          user: null,
          kyc: null,
          _count: { kitchenAssignments: 0 },
        },
      ])

      const result = await getAdminDeliveryPartners()
      expect(result[0].name).toBe("")
      expect(result[0].phoneNumber).toBeNull()
      expect(result[0].kyc).toBeNull()
    })
  })

  describe("updateKitchenPartnerStatus", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await updateKitchenPartnerStatus("k-1", "ACTIVE")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("returns error for invalid status", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const result = await updateKitchenPartnerStatus("k-1", "INVALID")
      expect(result).toEqual({ success: false, error: "Invalid status" })
    })

    it("updates status successfully", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.kitchenPartner.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await updateKitchenPartnerStatus("k-1", "ACTIVE")

      expect(mockPrisma.kitchenPartner.update).toHaveBeenCalledWith({
        where: { id: "k-1" },
        data: { status: "ACTIVE", approvedAt: expect.any(Date) },
      })
      expect(result).toEqual({ success: true })
    })

    it("sets approvedAt for APPROVED status", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.kitchenPartner.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await updateKitchenPartnerStatus("k-1", "APPROVED")

      expect(mockPrisma.kitchenPartner.update).toHaveBeenCalledWith({
        where: { id: "k-1" },
        data: { status: "APPROVED", approvedAt: expect.any(Date) },
      })
    })

    it("does not set approvedAt for SUSPENDED", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.kitchenPartner.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await updateKitchenPartnerStatus("k-1", "SUSPENDED")

      expect(mockPrisma.kitchenPartner.update).toHaveBeenCalledWith({
        where: { id: "k-1" },
        data: { status: "SUSPENDED" },
      })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.kitchenPartner.update.mockRejectedValue(new Error("DB error"))

      const result = await updateKitchenPartnerStatus("k-1", "ACTIVE")
      expect(result).toEqual({ success: false, error: "Failed to update status" })
    })
  })

  describe("updateKitchenCuisines", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await updateKitchenCuisines("k-1", ["cat-1"])
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("replaces cuisines in transaction", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const mockTx = {
        kitchenCategory: { deleteMany: vi.fn(), createMany: vi.fn() },
      }
      mockPrisma.$transaction.mockImplementation(async (fn: unknown) => (fn as (tx: typeof mockTx) => Promise<unknown>)(mockTx))
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await updateKitchenCuisines("k-1", ["cat-1", "cat-2"])

      expect(mockTx.kitchenCategory.deleteMany).toHaveBeenCalledWith({ where: { kitchenPartnerId: "k-1" } })
      expect(mockTx.kitchenCategory.createMany).toHaveBeenCalledWith({
        data: [
          { kitchenPartnerId: "k-1", categoryId: "cat-1" },
          { kitchenPartnerId: "k-1", categoryId: "cat-2" },
        ],
      })
      expect(result).toEqual({ success: true })
    })

    it("deletes only when categoryIds is empty", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const mockTx = {
        kitchenCategory: { deleteMany: vi.fn(), createMany: vi.fn() },
      }
      mockPrisma.$transaction.mockImplementation(async (fn: unknown) => (fn as (tx: typeof mockTx) => Promise<unknown>)(mockTx))
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await updateKitchenCuisines("k-1", [])

      expect(mockTx.kitchenCategory.createMany).not.toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it("returns error on transaction failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.$transaction.mockRejectedValue(new Error("DB error"))

      const result = await updateKitchenCuisines("k-1", ["cat-1"])
      expect(result).toEqual({ success: false, error: "Failed to update cuisines" })
    })
  })

  describe("updateDeliveryPartnerStatus", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await updateDeliveryPartnerStatus("dp-1", "ACTIVE")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("returns error for invalid status", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const result = await updateDeliveryPartnerStatus("dp-1", "WRONG")
      expect(result).toEqual({ success: false, error: "Invalid status" })
    })

    it("updates status with approvedAt", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.deliveryPartner.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await updateDeliveryPartnerStatus("dp-1", "ACTIVE")

      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith({
        where: { id: "dp-1" },
        data: { status: "ACTIVE", approvedAt: expect.any(Date) },
      })
      expect(result).toEqual({ success: true })
    })

    it("does not set approvedAt for REJECTED", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.deliveryPartner.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await updateDeliveryPartnerStatus("dp-1", "REJECTED")

      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith({
        where: { id: "dp-1" },
        data: { status: "REJECTED" },
      })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.deliveryPartner.update.mockRejectedValue(new Error("DB error"))

      const result = await updateDeliveryPartnerStatus("dp-1", "ACTIVE")
      expect(result).toEqual({ success: false, error: "Failed to update status" })
    })
  })
})
