import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  role: { findUnique: vi.fn() },
  userRole: { upsert: vi.fn() },
  kitchenPartner: { findMany: vi.fn(), upsert: vi.fn() },
  deliveryPartner: { upsert: vi.fn() },
  user: { findFirst: vi.fn(), update: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/slug", () => ({ uniqueSlug: vi.fn(() => "test-kitchen") }))

const mockGetSession = vi.hoisted(() => vi.fn())
vi.mock("@/lib/auth-server", () => ({ getSession: mockGetSession }))

import { assignUserRole, checkPhoneRegistered, updateUserName } from "@/actions/onboarding/auth"
import { uniqueSlug } from "@/lib/slug"

const mockSession = { user: { id: "user-1", name: "Test User" } }

describe("onboarding/auth", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("assignUserRole", () => {
    it("throws when not authenticated", async () => {
      mockGetSession.mockResolvedValue(null)
      await expect(assignUserRole("CUSTOMER")).rejects.toThrow("Not authenticated")
    })

    it("throws when session has no user id", async () => {
      mockGetSession.mockResolvedValue({ user: null })
      await expect(assignUserRole("CUSTOMER")).rejects.toThrow("Not authenticated")
    })

    it("throws when role not found", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.role.findUnique.mockResolvedValue(null)
      await expect(assignUserRole("CUSTOMER")).rejects.toThrow("Role not found")
    })

    it("upserts user role for CUSTOMER", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.role.findUnique.mockResolvedValue({ id: "role-1", name: "CUSTOMER" })

      await assignUserRole("CUSTOMER")

      expect(mockPrisma.userRole.upsert).toHaveBeenCalledWith({
        where: { userId_roleId: { userId: "user-1", roleId: "role-1" } },
        create: { userId: "user-1", roleId: "role-1" },
        update: {},
      })
      expect(mockPrisma.kitchenPartner.upsert).not.toHaveBeenCalled()
      expect(mockPrisma.deliveryPartner.upsert).not.toHaveBeenCalled()
    })

    it("creates kitchen partner with unique slug for KITCHENPARTNER", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.role.findUnique.mockResolvedValue({ id: "role-2", name: "KITCHENPARTNER" })
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([{ slug: "existing" }])

      await assignUserRole("KITCHENPARTNER")

      expect(uniqueSlug).toHaveBeenCalledWith("Test User", expect.any(Set))
      expect(mockPrisma.kitchenPartner.upsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        create: { userId: "user-1", slug: "test-kitchen" },
        update: {},
      })
    })

    it("creates kitchen partner with default slug when user has no name", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "user-1", name: null } })
      mockPrisma.role.findUnique.mockResolvedValue({ id: "role-2", name: "KITCHENPARTNER" })
      mockPrisma.kitchenPartner.findMany.mockResolvedValue([])

      await assignUserRole("KITCHENPARTNER")

      expect(uniqueSlug).toHaveBeenCalledWith("user-1", expect.any(Set))
    })

    it("creates delivery partner for DELIVERYPARTNER role", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.role.findUnique.mockResolvedValue({ id: "role-3", name: "DELIVERYPARTNER" })

      await assignUserRole("DELIVERYPARTNER")

      expect(mockPrisma.deliveryPartner.upsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        create: { userId: "user-1" },
        update: {},
      })
      expect(mockPrisma.kitchenPartner.upsert).not.toHaveBeenCalled()
    })
  })

  describe("checkPhoneRegistered", () => {
    it("returns true when user found with exact number", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: "user-1" })
      const result = await checkPhoneRegistered("9876543210")
      expect(result).toBe(true)
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: { in: ["9876543210", "+919876543210"] } },
        select: { id: true },
      })
    })

    it("returns false when user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)
      const result = await checkPhoneRegistered("0000000000")
      expect(result).toBe(false)
    })

    it("handles 12-digit number with 91 prefix", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)
      await checkPhoneRegistered("919876543210")
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: { in: ["919876543210", "9876543210", "+919876543210"] } },
        select: { id: true },
      })
    })

    it("handles number with special characters", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)
      await checkPhoneRegistered("+91-9876543210")
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: { in: ["+91-9876543210", "9876543210", "+919876543210"] } },
        select: { id: true },
      })
    })
  })

  describe("updateUserName", () => {
    it("throws when not authenticated", async () => {
      mockGetSession.mockResolvedValue(null)
      await expect(updateUserName("New Name")).rejects.toThrow("Not authenticated")
    })

    it("updates name and fullName", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.user.update.mockResolvedValue({})

      await updateUserName("New Name")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { name: "New Name", fullName: "New Name" },
      })
    })

    it("includes email when provided", async () => {
      mockGetSession.mockResolvedValue(mockSession)
      mockPrisma.user.update.mockResolvedValue({})

      await updateUserName("New Name", "new@example.com")

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { name: "New Name", fullName: "New Name", email: "new@example.com" },
      })
    })
  })
})
