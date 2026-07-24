import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  menuItem: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  menuItemPhoto: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
}))
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: { destroy: vi.fn() },
  },
}))

import { getAllMenuItems, updateMenuItem, addMenuItemPhoto, deleteMenuItemPhoto, deleteMenuItem } from "@/actions/admin/admin-menu"
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards"

const adminSession = { user: { id: "admin-1" } }

describe("admin-menu", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAllMenuItems", () => {
    it("returns empty array when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"))
      const result = await getAllMenuItems()
      expect(result).toEqual([])
    })

    it("returns mapped menu items", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-1",
          name: "Biryani",
          description: "Hyderabadi",
          price: 250,
          compareAtPrice: 300,
          foodType: "NONVEG",
          timeSlot: "LUNCH",
          isAvailable: true,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-02"),
          photos: [{ id: "p-1", imageUrl: "http://img.com/1.jpg" }],
          menu: {
            name: "Main Menu",
            kitchenPartner: {
              id: "k-1",
              kitchenAlias: { displayName: "Tasty Kitchen" },
            },
          },
        },
      ])

      const result = await getAllMenuItems()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Biryani")
      expect(result[0].price).toBe(250)
      expect(result[0].compareAtPrice).toBe(300)
      expect(result[0].kitchenName).toBe("Tasty Kitchen")
      expect(result[0].menuName).toBe("Main Menu")
      expect(result[0].photos).toEqual([{ id: "p-1", imageUrl: "http://img.com/1.jpg" }])
    })

    it("handles null compareAtPrice and null kitchenAlias", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({} as never)
      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-2",
          name: "Idli",
          description: null,
          price: 50,
          compareAtPrice: null,
          foodType: "VEG",
          timeSlot: "MORNING",
          isAvailable: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          photos: [],
          menu: {
            name: "Breakfast",
            kitchenPartner: { id: "k-2", kitchenAlias: null },
          },
        },
      ])

      const result = await getAllMenuItems()
      expect(result[0].compareAtPrice).toBeNull()
      expect(result[0].kitchenName).toBe("")
    })
  })

  describe("updateMenuItem", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await updateMenuItem("mi-1", { name: "New" })
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("updates menu item fields", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItem.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await updateMenuItem("mi-1", { name: "Updated", price: 300 })

      expect(mockPrisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: "mi-1" },
        data: { name: "Updated", price: 300 },
      })
      expect(result).toEqual({ success: true })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItem.update.mockRejectedValue(new Error("DB error"))

      const result = await updateMenuItem("mi-1", { name: "X" })
      expect(result).toEqual({ success: false, error: "Failed to update menu item" })
    })
  })

  describe("addMenuItemPhoto", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await addMenuItemPhoto("mi-1", "http://img.com/photo.jpg")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("creates photo and returns success", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.create.mockResolvedValue({ id: "photo-1", imageUrl: "http://img.com/photo.jpg" })
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await addMenuItemPhoto("mi-1", "http://img.com/photo.jpg", "cloud-id-1")

      expect(mockPrisma.menuItemPhoto.create).toHaveBeenCalledWith({
        data: { menuItemId: "mi-1", imageUrl: "http://img.com/photo.jpg", cloudinaryPublicId: "cloud-id-1" },
      })
      expect(result).toEqual({ success: true, photo: { id: "photo-1", imageUrl: "http://img.com/photo.jpg" } })
    })

    it("handles null cloudinaryPublicId", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.create.mockResolvedValue({ id: "photo-2", imageUrl: "http://img.com/2.jpg" })
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await addMenuItemPhoto("mi-1", "http://img.com/2.jpg")

      expect(mockPrisma.menuItemPhoto.create).toHaveBeenCalledWith({
        data: { menuItemId: "mi-1", imageUrl: "http://img.com/2.jpg", cloudinaryPublicId: null },
      })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.create.mockRejectedValue(new Error("DB error"))

      const result = await addMenuItemPhoto("mi-1", "http://img.com/photo.jpg")
      expect(result).toEqual({ success: false, error: "Failed to add photo" })
    })
  })

  describe("deleteMenuItemPhoto", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await deleteMenuItemPhoto("photo-1")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("returns error when photo not found", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.findUnique.mockResolvedValue(null)

      const result = await deleteMenuItemPhoto("photo-1")
      expect(result).toEqual({ success: false, error: "Photo not found" })
    })

    it("deletes photo and cloudinary asset", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.findUnique.mockResolvedValue({
        id: "photo-1",
        cloudinaryPublicId: "cld-123",
      })
      const { v2: cloudinary } = await import("cloudinary")
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({} as never)
      mockPrisma.menuItemPhoto.delete.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await deleteMenuItemPhoto("photo-1")

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("cld-123")
      expect(mockPrisma.menuItemPhoto.delete).toHaveBeenCalledWith({ where: { id: "photo-1" } })
      expect(result).toEqual({ success: true })
    })

    it("continues deletion even if cloudinary fails", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.findUnique.mockResolvedValue({
        id: "photo-1",
        cloudinaryPublicId: "cld-456",
      })
      const { v2: cloudinary } = await import("cloudinary")
      vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(new Error("Cloudinary error"))
      mockPrisma.menuItemPhoto.delete.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await deleteMenuItemPhoto("photo-1")

      expect(mockPrisma.menuItemPhoto.delete).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it("handles null cloudinaryPublicId by skipping cloudinary delete", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.findUnique.mockResolvedValue({
        id: "photo-1",
        cloudinaryPublicId: null,
      })
      const { v2: cloudinary } = await import("cloudinary")
      mockPrisma.menuItemPhoto.delete.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      await deleteMenuItemPhoto("photo-1")

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItemPhoto.findUnique.mockRejectedValue(new Error("DB error"))

      const result = await deleteMenuItemPhoto("photo-1")
      expect(result).toEqual({ success: false, error: "Failed to delete photo" })
    })
  })

  describe("deleteMenuItem", () => {
    it("returns unauthorized on permission failure", async () => {
      vi.mocked(requirePermission).mockRejectedValue(new Error("No access"))
      const result = await deleteMenuItem("mi-1")
      expect(result).toEqual({ success: false, error: "Unauthorized" })
    })

    it("soft-deletes menu item", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItem.update.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const result = await deleteMenuItem("mi-1")

      expect(mockPrisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: "mi-1" },
        data: { deletedAt: expect.any(Date) },
      })
      expect(result).toEqual({ success: true })
    })

    it("returns error on prisma failure", async () => {
      vi.mocked(requirePermission).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.menuItem.update.mockRejectedValue(new Error("DB error"))

      const result = await deleteMenuItem("mi-1")
      expect(result).toEqual({ success: false, error: "Failed to delete menu item" })
    })
  })
})
