import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  cashRemittance: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  deliveryPartner: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  deliveryPartnerPayout: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  order: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  userCodEligibility: {
    update: vi.fn(),
  },
  $transaction: vi.fn((cb: (tx: Record<string, Record<string, ReturnType<typeof vi.fn>>>) => Promise<unknown>) => cb({
    cashRemittance: { update: vi.fn() },
    deliveryPartner: { update: vi.fn() },
    deliveryPartnerPayout: { update: vi.fn() },
  })),
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

import {
  recordCashRemittance,
  confirmRemittance,
  isEligibleForCodAssignment,
  reconcileOverdueCash,
  settleDeliveryPartnerPayout,
  recordCodRefusal,
} from "@/actions/delivery/remit-cash"

describe("remit-cash", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("recordCashRemittance", () => {
    it("creates a cash remittance record", async () => {
      mockPrisma.cashRemittance.create.mockResolvedValue({
        id: "rem-1",
        deliveryPartnerId: "rider-1",
        amount: 500,
        method: "UPI_TO_PLATFORM",
        referenceId: "ref-1",
        status: "PENDING",
      })

      const result = await recordCashRemittance("rider-1", 500, "ref-1", "UPI_TO_PLATFORM")

      expect(result.id).toBe("rem-1")
      expect(mockPrisma.cashRemittance.create).toHaveBeenCalledWith({
        data: {
          deliveryPartnerId: "rider-1",
          amount: 500,
          method: "UPI_TO_PLATFORM",
          referenceId: "ref-1",
          status: "PENDING",
        },
      })
    })

    it("creates remittance with ADMIN_COLLECTED_CASH method", async () => {
      mockPrisma.cashRemittance.create.mockResolvedValue({ id: "rem-2" })

      await recordCashRemittance("rider-1", 300, "ref-2", "ADMIN_COLLECTED_CASH")

      expect(mockPrisma.cashRemittance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ method: "ADMIN_COLLECTED_CASH" }),
        })
      )
    })
  })

  describe("confirmRemittance", () => {
    it("confirms remittance and decrements cashInHand", async () => {
      mockPrisma.cashRemittance.findUniqueOrThrow.mockResolvedValue({
        id: "rem-1",
        deliveryPartnerId: "rider-1",
        amount: 500,
      })

      const result = await confirmRemittance("rem-1", "admin-1")

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it("works without confirmedByUserId", async () => {
      mockPrisma.cashRemittance.findUniqueOrThrow.mockResolvedValue({
        id: "rem-1",
        deliveryPartnerId: "rider-1",
        amount: 500,
      })

      const result = await confirmRemittance("rem-1")

      expect(result.success).toBe(true)
    })
  })

  describe("isEligibleForCodAssignment", () => {
    it("returns true when codEligible and cashInHand < 3000", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        codEligible: true,
        cashInHand: 1000,
      })

      const result = await isEligibleForCodAssignment("rider-1")
      expect(result).toBe(true)
    })

    it("returns false when not codEligible", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        codEligible: false,
        cashInHand: 1000,
      })

      const result = await isEligibleForCodAssignment("rider-1")
      expect(result).toBe(false)
    })

    it("returns false when cashInHand >= 3000", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        codEligible: true,
        cashInHand: 3000,
      })

      const result = await isEligibleForCodAssignment("rider-1")
      expect(result).toBe(false)
    })
  })

  describe("reconcileOverdueCash", () => {
    it("reconciles riders with cashInHand > 500", async () => {
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([
        { id: "rider-1", cashInHand: 1000 },
      ])
      mockPrisma.deliveryPartnerPayout.findFirst.mockResolvedValue({
        id: "payout-1",
        amount: 800,
      })

      const result = await reconcileOverdueCash()

      expect(result.reconciled).toBe(1)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it("returns 0 reconciled when no overdue riders", async () => {
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([])

      const result = await reconcileOverdueCash()

      expect(result.reconciled).toBe(0)
    })

    it("skips riders without pending payout", async () => {
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([
        { id: "rider-1", cashInHand: 1000 },
      ])
      mockPrisma.deliveryPartnerPayout.findFirst.mockResolvedValue(null)

      const result = await reconcileOverdueCash()

      expect(result.reconciled).toBe(1)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe("settleDeliveryPartnerPayout", () => {
    it("offsets payout by cashInHand", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        cashInHand: 300,
      })

      const result = await settleDeliveryPartnerPayout("rider-1", 1000)

      expect(result).toBe(700)
      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "rider-1" },
          data: { cashInHand: { decrement: 300 } },
        })
      )
    })

    it("returns full payout when cashInHand is 0", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        cashInHand: 0,
      })

      const result = await settleDeliveryPartnerPayout("rider-1", 1000)

      expect(result).toBe(1000)
      expect(mockPrisma.deliveryPartner.update).not.toHaveBeenCalled()
    })

    it("caps offset to payout amount when cashInHand exceeds it", async () => {
      mockPrisma.deliveryPartner.findUniqueOrThrow.mockResolvedValue({
        id: "rider-1",
        cashInHand: 5000,
      })

      const result = await settleDeliveryPartnerPayout("rider-1", 200)

      expect(result).toBe(0)
      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { cashInHand: { decrement: 200 } },
        })
      )
    })
  })

  describe("recordCodRefusal", () => {
    it("increments codRefusalCount and blocks COD", async () => {
      mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
        id: "order-1",
        userId: "user-1",
      })

      const result = await recordCodRefusal("order-1")

      expect(result.success).toBe(true)
      expect(mockPrisma.userCodEligibility.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { codRefusalCount: { increment: 1 }, isCodBlocked: true },
      })
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: { status: "CANCELLED" },
      })
    })
  })
})
