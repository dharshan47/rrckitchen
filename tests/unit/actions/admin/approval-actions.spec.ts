import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  adminApprovalRequest: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  adminProfile: {
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  kitchenPayout: { update: vi.fn() },
  deliveryPartnerPayout: { update: vi.fn() },
  user: { update: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requirePermission: vi.fn(),
}))
vi.mock("@/actions/payments/payment", () => ({
  refundOrder: vi.fn(),
}))

import { requestLargeRefund, decideApprovalRequest } from "@/actions/admin/approval-actions"
import { requireAdmin, requirePermission } from "@/lib/auth-guards"
import { refundOrder } from "@/actions/payments/payment"

const adminSession = { user: { id: "admin-1" } }

describe("approval-actions", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("requestLargeRefund", () => {
    it("processes refund directly when below threshold", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      vi.mocked(refundOrder).mockResolvedValue({} as never)

      const result = await requestLargeRefund("order-1", 1000, "Small refund")

      expect(refundOrder).toHaveBeenCalledWith("order-1", "OTHER")
      expect(result).toEqual({ status: "processed" })
    })

    it("creates approval request when at or above threshold", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.create.mockResolvedValue({})

      const result = await requestLargeRefund("order-1", 5000, "Large refund")

      expect(mockPrisma.adminApprovalRequest.create).toHaveBeenCalledWith({
        data: {
          actionType: "LARGE_REFUND",
          targetId: "order-1",
          payload: { amount: 5000, reason: "Large refund" },
          requestedByUserId: "admin-1",
        },
      })
      expect(result).toEqual({ status: "pending_approval" })
    })

    it("processes refund when exactly at threshold", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      vi.mocked(refundOrder).mockResolvedValue({} as never)

      const result = await requestLargeRefund("order-1", 1999, "Just under")

      expect(refundOrder).toHaveBeenCalled()
      expect(result).toEqual({ status: "processed" })
    })
  })

  describe("decideApprovalRequest", () => {
    beforeEach(() => {
      vi.mocked(requireAdmin).mockResolvedValue({ session: adminSession } as never)
    })

    it("throws when user tries to approve their own request", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-1",
        requestedByUserId: "admin-1",
        status: "PENDING",
        actionType: "LARGE_REFUND",
      })

      await expect(decideApprovalRequest("req-1", true)).rejects.toThrow("You cannot approve your own request")
    })

    it("throws when request already decided", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-1",
        requestedByUserId: "admin-2",
        status: "APPROVED",
        actionType: "LARGE_REFUND",
      })

      await expect(decideApprovalRequest("req-1", true)).rejects.toThrow("Already decided")
    })

    it("rejects a pending request", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-1",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "LARGE_REFUND",
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})

      await decideApprovalRequest("req-1", false)

      expect(mockPrisma.adminApprovalRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { status: "REJECTED", decidedByUserId: "admin-1", decidedAt: expect.any(Date) },
      })
      expect(refundOrder).not.toHaveBeenCalled()
    })

    it("approves LARGE_REFUND and calls refundOrder", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-1",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "LARGE_REFUND",
        targetId: "order-1",
        payload: null,
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      vi.mocked(refundOrder).mockResolvedValue({} as never)

      await decideApprovalRequest("req-1", true)

      expect(refundOrder).toHaveBeenCalledWith("order-1", "OTHER")
    })

    it("approves REMOVE_ADMIN and deactivates profile", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-2",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "REMOVE_ADMIN",
        targetId: "user-to-remove",
        payload: null,
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.adminProfile.update.mockResolvedValue({})

      await decideApprovalRequest("req-2", true)

      expect(mockPrisma.adminProfile.update).toHaveBeenCalledWith({
        where: { userId: "user-to-remove" },
        data: { isActive: false },
      })
    })

    it("approves GRANT_PERMISSION and adds permission", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-3",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "GRANT_PERMISSION",
        targetId: "user-to-grant",
        payload: { permission: "MANAGE_CMS" },
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.adminProfile.findUnique.mockResolvedValue({ permissions: ["MANAGE_COUPONS"] })
      mockPrisma.adminProfile.update.mockResolvedValue({})

      await decideApprovalRequest("req-3", true)

      expect(mockPrisma.adminProfile.update).toHaveBeenCalledWith({
        where: { userId: "user-to-grant" },
        data: { permissions: { push: "MANAGE_CMS" } },
      })
    })

    it("approves GRANT_PERMISSION but skips if already has permission", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-3",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "GRANT_PERMISSION",
        targetId: "user-to-grant",
        payload: { permission: "MANAGE_CMS" },
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.adminProfile.findUnique.mockResolvedValue({ permissions: ["MANAGE_CMS"] })

      await decideApprovalRequest("req-3", true)

      expect(mockPrisma.adminProfile.update).not.toHaveBeenCalled()
    })

    it("approves PAYOUT_SETTLEMENT for kitchen payout", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-4",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "PAYOUT_SETTLEMENT",
        targetId: "payout-1",
        payload: null,
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.kitchenPayout.update.mockResolvedValue({})

      await decideApprovalRequest("req-4", true)

      expect(mockPrisma.kitchenPayout.update).toHaveBeenCalledWith({
        where: { id: "payout-1" },
        data: { status: "SETTLED" },
      })
    })

    it("approves PAYOUT_SETTLEMENT falls back to delivery partner payout", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-4",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "PAYOUT_SETTLEMENT",
        targetId: "payout-dp-1",
        payload: null,
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.kitchenPayout.update.mockRejectedValue(new Error("Not found"))
      mockPrisma.deliveryPartnerPayout.update.mockResolvedValue({})

      await decideApprovalRequest("req-4", true)

      expect(mockPrisma.deliveryPartnerPayout.update).toHaveBeenCalledWith({
        where: { id: "payout-dp-1" },
        data: { status: "SETTLED" },
      })
    })

    it("approves BAN_USER and bans the user", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-5",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "BAN_USER",
        targetId: "user-to-ban",
        payload: { reason: "Spam" },
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.user.update.mockResolvedValue({})

      await decideApprovalRequest("req-5", true)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-to-ban" },
        data: { banned: true, banReason: "Spam" },
      })
    })

    it("approves BAN_USER with null reason when payload has no reason", async () => {
      mockPrisma.adminApprovalRequest.findUniqueOrThrow.mockResolvedValue({
        id: "req-5",
        requestedByUserId: "admin-2",
        status: "PENDING",
        actionType: "BAN_USER",
        targetId: "user-to-ban",
        payload: null,
      })
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.adminApprovalRequest.update.mockResolvedValue({})
      mockPrisma.user.update.mockResolvedValue({})

      await decideApprovalRequest("req-5", true)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-to-ban" },
        data: { banned: true, banReason: null },
      })
    })
  })
})
