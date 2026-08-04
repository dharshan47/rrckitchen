import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth-guards", () => ({
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
}))

const mockPrisma = vi.hoisted(() => ({
  adminInvite: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  adminProfile: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  userRole: { upsert: vi.fn() },
  role: { findUniqueOrThrow: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("crypto", () => ({
  default: { randomBytes: () => Buffer.from("abcdef1234567890abcdef1234567890", "hex") },
}))

const mockSession = { user: { id: "admin-1" } }

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => mockSession),
}))

import { createAdminInvite, acceptAdminInvite } from "@/actions/admin/invites-actions"
import { requirePermission, logAdminAction } from "@/lib/auth-guards"

describe("invites-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requirePermission).mockResolvedValue({ session: mockSession } as never)
    vi.mocked(logAdminAction).mockResolvedValue(undefined as never)
  })

  describe("createAdminInvite", () => {
    it("creates invite and returns full URL", async () => {
      mockPrisma.adminInvite.create.mockResolvedValue({ id: "inv-1" })

      const result = await createAdminInvite(["MANAGE_CMS", "MANAGE_COUPONS"])

      expect(result).toContain("/invite/")
      expect(mockPrisma.adminInvite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            permissions: ["MANAGE_CMS", "MANAGE_COUPONS"],
            createdByUserId: "admin-1",
          }),
        }),
      )
    })

    it("generates a hex token", async () => {
      mockPrisma.adminInvite.create.mockResolvedValue({ id: "inv-2" })

      await createAdminInvite(["MANAGE_ADMINS"])

      const call = mockPrisma.adminInvite.create.mock.calls[0][0]
      expect(call.data.token).toMatch(/^[0-9a-f]{32}$/)
    })

    it("sets 48 hour expiry", async () => {
      mockPrisma.adminInvite.create.mockResolvedValue({ id: "inv-3" })

      await createAdminInvite(["APPROVE_KYC"])

      const call = mockPrisma.adminInvite.create.mock.calls[0][0]
      const expiresAt = new Date(call.data.expiresAt)
      const now = new Date()
      const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      expect(diffHours).toBeGreaterThan(47)
      expect(diffHours).toBeLessThanOrEqual(48)
    })
  })

  describe("acceptAdminInvite", () => {
    it("accepts a valid invite", async () => {
      mockPrisma.adminInvite.findUnique.mockResolvedValue({
        id: "inv-1", token: "valid-token", permissions: ["MANAGE_CMS"],
        consumedAt: null, revokedAt: null, expiresAt: new Date(Date.now() + 86400000),
      })
      mockPrisma.adminProfile.findUnique.mockResolvedValue(null)
      mockPrisma.role.findUniqueOrThrow.mockResolvedValue({ id: "role-1", name: "ADMIN" })
      mockPrisma.$transaction.mockResolvedValue([])

      const result = await acceptAdminInvite("valid-token")

      expect(result).toBeUndefined()
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it("rejects already consumed invite", async () => {
      mockPrisma.adminInvite.findUnique.mockResolvedValue({
        id: "inv-1", token: "used-token", consumedAt: new Date(), revokedAt: null, expiresAt: new Date(Date.now() + 86400000),
      })

      await expect(acceptAdminInvite("used-token")).rejects.toThrow("This invite link is invalid or has expired")
    })

    it("rejects revoked invite", async () => {
      mockPrisma.adminInvite.findUnique.mockResolvedValue({
        id: "inv-2", token: "revoked", consumedAt: null, revokedAt: new Date(), expiresAt: new Date(Date.now() + 86400000),
      })

      await expect(acceptAdminInvite("revoked")).rejects.toThrow("This invite link is invalid or has expired")
    })

    it("rejects expired invite", async () => {
      mockPrisma.adminInvite.findUnique.mockResolvedValue({
        id: "inv-3", token: "expired", consumedAt: null, revokedAt: null, expiresAt: new Date(Date.now() - 86400000),
      })

      await expect(acceptAdminInvite("expired")).rejects.toThrow("This invite link is invalid or has expired")
    })

    it("rejects if user already has admin profile", async () => {
      mockPrisma.adminInvite.findUnique.mockResolvedValue({
        id: "inv-4", token: "valid", consumedAt: null, revokedAt: null, expiresAt: new Date(Date.now() + 86400000),
      })
      mockPrisma.adminProfile.findUnique.mockResolvedValue({ id: "ap-1" })

      await expect(acceptAdminInvite("valid")).rejects.toThrow("This account already has admin access")
    })
  })
})
