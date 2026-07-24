import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  user: {
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
}))

import { banUser, unbanUser, searchUsers, getUserBanStatus } from "@/actions/admin/ban-actions"
import { requirePermission, logAdminAction } from "@/lib/auth-guards"

const adminSession = { user: { id: "admin-1" } }

describe("ban-actions", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("banUser", () => {
    it("throws when trying to ban yourself", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)

      await expect(banUser("admin-1", "Self ban")).rejects.toThrow("You cannot ban yourself")
    })

    it("bans user with reason", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await banUser("user-1", "Spamming")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { banned: true, banReason: "Spamming", banExpires: null },
      })
    })

    it("bans user with expiry date", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await banUser("user-1", "Temporary", "2025-12-31")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { banned: true, banReason: "Temporary", banExpires: new Date("2025-12-31") },
      })
    })

    it("uses default reason when empty string", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await banUser("user-1", "")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { banned: true, banReason: "Banned by admin", banExpires: null },
      })
    })

    it("logs admin action", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await banUser("user-1", "Bad behavior", "2025-06-30")

      expect(logAdminAction).toHaveBeenCalledWith({
        actorUserId: "admin-1",
        action: "BAN_USER",
        targetType: "User",
        targetId: "user-1",
        metadata: { reason: "Bad behavior", banExpires: "2025-06-30" },
      })
    })
  })

  describe("unbanUser", () => {
    it("unbans user and clears ban fields", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await unbanUser("user-1")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { banned: false, banReason: null, banExpires: null },
      })
    })

    it("logs unban action", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await unbanUser("user-2")

      expect(logAdminAction).toHaveBeenCalledWith({
        actorUserId: "admin-1",
        action: "UNBAN_USER",
        targetType: "User",
        targetId: "user-2",
      })
    })
  })

  describe("searchUsers", () => {
    it("returns paginated users", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const now = new Date("2025-07-01")
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "u-1",
          name: "John",
          email: "john@test.com",
          phoneNumber: "99999",
          banned: false,
          banReason: null,
          banExpires: null,
          createdAt: now,
        },
      ])
      mockPrisma.user.count.mockResolvedValue(1)

      const result = await searchUsers("John")

      expect(result.users).toHaveLength(1)
      expect(result.users[0].createdAt).toBe(now.toISOString())
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(1)
    })

    it("searches with empty query returns all users", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      await searchUsers("")

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      )
    })

    it("handles pagination correctly", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(50)

      const result = await searchUsers("test", 2, 10)

      expect(result.totalPages).toBe(5)
      expect(result.page).toBe(2)
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      )
    })

    it("includes ban status in results", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      const banDate = new Date("2025-12-31")
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "u-2",
          name: "Banned User",
          email: null,
          phoneNumber: "88888",
          banned: true,
          banReason: "Spam",
          banExpires: banDate,
          createdAt: new Date("2025-01-01"),
        },
      ])
      mockPrisma.user.count.mockResolvedValue(1)

      const result = await searchUsers("Banned")

      expect(result.users[0].banned).toBe(true)
      expect(result.users[0].banReason).toBe("Spam")
      expect(result.users[0].banExpires).toBe(banDate.toISOString())
    })
  })

  describe("getUserBanStatus", () => {
    it("returns ban status", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        banned: true,
        banReason: "Spam",
        banExpires: new Date("2025-12-31"),
      })

      const result = await getUserBanStatus("user-1")
      expect(result).toEqual({
        banned: true,
        banReason: "Spam",
        banExpires: expect.any(Date),
      })
    })

    it("returns null when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await getUserBanStatus("nonexistent")
      expect(result).toBeNull()
    })
  })
})
