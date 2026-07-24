import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth-guards", () => ({
  requirePermission: vi.fn(),
}))

const mockPrisma = {
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}))

vi.mock("@/lib/category-images", () => ({
  getCategoryImageUrl: (name: string) => `https://images.example.com/${name.toLowerCase().replace(/\s+/g, "-")}.png`,
}))

import { getAllCategories, addCategory, updateCategory, toggleCategory } from "@/actions/admin/admin-cms"

describe("admin-cms", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getAllCategories", () => {
    it("returns categories with kitchen count and imageUrl", async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: "c1", name: "South Indian", description: "Dosa, idli", isActive: true, _count: { kitchenCategories: 5 } },
        { id: "c2", name: "Chinese", description: null, isActive: false, _count: { kitchenCategories: 3 } },
      ])

      const result = await getAllCategories()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: "c1", name: "South Indian", description: "Dosa, idli", isActive: true, kitchenCount: 5,
        imageUrl: "https://images.example.com/south-indian.png",
      })
      expect(result[1]).toEqual({
        id: "c2", name: "Chinese", description: null, isActive: false, kitchenCount: 3,
        imageUrl: "https://images.example.com/chinese.png",
      })
    })

    it("returns empty array when no categories", async () => {
      mockPrisma.category.findMany.mockResolvedValue([])
      expect(await getAllCategories()).toEqual([])
    })
  })

  describe("addCategory", () => {
    it("creates a new category", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)
      mockPrisma.category.create.mockResolvedValue({ id: "c-new", name: "Italian", description: "Pizza pasta" })

      const result = await addCategory({ name: "Italian", description: "Pizza pasta" })

      expect(result).toEqual({ success: true, id: "c-new" })
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: "Italian", description: "Pizza pasta" },
      })
    })

    it("reactivates existing disabled category", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: "c1", name: "Italian", isActive: false })

      const result = await addCategory({ name: "Italian" })

      expect(result).toEqual({ success: true, id: "c1" })
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { isActive: true },
      })
    })

    it("returns error if category already exists and active", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: "c1", name: "Italian", isActive: true })

      const result = await addCategory({ name: "Italian" })

      expect(result).toEqual({ success: false, error: "Category already exists" })
      expect(mockPrisma.category.create).not.toHaveBeenCalled()
    })

    it("creates category without description", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)
      mockPrisma.category.create.mockResolvedValue({ id: "c2" })

      await addCategory({ name: "Mexican" })

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: "Mexican", description: null },
      })
    })
  })

  describe("updateCategory", () => {
    it("updates category name", async () => {
      mockPrisma.category.update.mockResolvedValue({ id: "c1" })

      await updateCategory("c1", { name: "North Indian" })

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { name: "North Indian" },
      })
    })

    it("updates category description", async () => {
      mockPrisma.category.update.mockResolvedValue({ id: "c1" })

      await updateCategory("c1", { description: "Updated desc" })

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { description: "Updated desc" },
      })
    })

    it("does nothing when no fields provided", async () => {
      const result = await updateCategory("c1", {})

      expect(result).toEqual({ success: true })
      expect(mockPrisma.category.update).not.toHaveBeenCalled()
    })
  })

  describe("toggleCategory", () => {
    it("disables a category", async () => {
      await toggleCategory("c1", false)
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "c1" }, data: { isActive: false },
      })
    })

    it("enables a category", async () => {
      await toggleCategory("c1", true)
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "c1" }, data: { isActive: true },
      })
    })
  })
})
