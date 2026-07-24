import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  adminProfile: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  user: { findMany: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({ requireAdmin: vi.fn(), logAdminAction: vi.fn() }))

const mockSession = { user: { id: "admin-1" } }
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { getActiveAdmins, deactivateAdmin, getCurrentAdminPermissions } from "@/actions/admin/admin-actions"

describe("admin-actions", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getCurrentAdminPermissions", () => {
    it("returns permissions for current admin", async () => {
      mockPrisma.adminProfile.findFirst.mockResolvedValue({ permissions: ["MANAGE_CMS", "MANAGE_COUPONS"] })

      const result = await getCurrentAdminPermissions()

      expect(result).toEqual(["MANAGE_CMS", "MANAGE_COUPONS"])
    })

    it("returns empty on error", async () => {
      mockPrisma.adminProfile.findFirst.mockRejectedValue(new Error("DB error"))
      const result = await getCurrentAdminPermissions()
      expect(result).toEqual([])
    })
  })

  describe("getActiveAdmins", () => {
    it("returns active admins with user info", async () => {
      mockPrisma.adminProfile.findMany.mockResolvedValue([
        { id: "ap-1", userId: "u-1", permissions: ["MANAGE_CMS"], isActive: true, invitedByUserId: "u-2", createdAt: new Date(), user: { name: "Admin One", email: "admin1@test.com", phoneNumber: null } },
        { id: "ap-2", userId: "u-2", permissions: ["MANAGE_ADMINS"], isActive: true, invitedByUserId: null, createdAt: new Date(), user: { name: "Super Admin", email: null, phoneNumber: "9999999999" } },
      ])

      const result = await getActiveAdmins()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("Admin One")
      expect(result[0].canDeactivate).toBe(true)
    })
  })

  describe("deactivateAdmin", () => {
    it("deactivates an admin", async () => {
      mockPrisma.adminProfile.findFirst.mockResolvedValue({ id: "ap-1" })

      await deactivateAdmin("u-3")

      expect(mockPrisma.adminProfile.update).toHaveBeenCalledWith({
        where: { userId: "u-3" },
        data: { isActive: false },
      })
    })
  })
})
