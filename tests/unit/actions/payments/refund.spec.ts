import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  refund: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  order: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

import { getRefundStatus, processWebhookRefund, retryRefund } from "@/actions/payments/refund"

describe("refund", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getRefundStatus", () => {
    it("returns refunds for an order", async () => {
      mockPrisma.refund.findMany.mockResolvedValue([
        { id: "ref-1", amount: 500, status: "PROCESSED", reason: "QUALITY_ISSUE", createdAt: new Date(), razorpayRefundId: "rf_1", menuItemId: "mi-1", orderId: "order-1", initiatedById: "user-1", updatedAt: new Date(), initiatedAt: new Date(), processedAt: new Date(), failureReason: null },
      ])

      const result = await getRefundStatus("order-1")

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe("PROCESSED")
    })
  })

  describe("processWebhookRefund", () => {
    it("updates refund status to PROCESSED", async () => {
      mockPrisma.refund.findUnique.mockResolvedValue({ id: "ref-1", status: "INITIATED" })
      mockPrisma.refund.update.mockResolvedValue({})

      await processWebhookRefund("rf_1")

      expect(mockPrisma.refund.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ref-1" },
          data: expect.objectContaining({ status: "PROCESSED" }),
        }),
      )
    })

    it("does nothing if refund not found", async () => {
      mockPrisma.refund.findUnique.mockResolvedValue(null)
      await processWebhookRefund("missing")
      expect(mockPrisma.refund.update).not.toHaveBeenCalled()
    })
  })

  describe("retryRefund", () => {
    it("updates refund to INITIATED for retry", async () => {
      mockPrisma.refund.findUnique.mockResolvedValue({ id: "ref-1", status: "FAILED" })

      await retryRefund("ref-1")

      expect(mockPrisma.refund.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "ref-1" }, data: expect.objectContaining({ status: "INITIATED" }) }),
      )
    })
  })
})
