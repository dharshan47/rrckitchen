import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  kitchenPartner: { findUnique: vi.fn() },
  menuItem: { findMany: vi.fn(), findUnique: vi.fn() },
  menuItemDailyStock: { findMany: vi.fn() },
  menu: { findMany: vi.fn() },
  category: { findFirst: vi.fn(), findMany: vi.fn() },
  kitchenCategory: { findMany: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

import { getKitchenBySlug, getMenuItemsByKitchen } from "@/actions/catalog/kitchen-data"

describe("kitchen-data", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getKitchenBySlug", () => {
    it("returns kitchen by slug", async () => {
      mockPrisma.kitchenPartner.findUnique.mockResolvedValue({
        id: "kp-1", name: "Tasty Kitchen", slug: "tasty-kitchen", avgRating: 4.5, totalReviews: 20, isActive: true,
        address: "123 Main St", lat: 12.34, lng: 56.78, phoneNumber: "9999999999",
        imageUrl: "/kitchen.jpg", coverImageUrl: "/cover.jpg", description: "Great food",
        deliveryFee: 20, minOrder: 100, estimatedPrepTime: 30,
      })

      const result = await getKitchenBySlug("tasty-kitchen")

      expect(result?.name).toBe("Tasty Kitchen")
      expect(result?.avgRating).toBe(4.5)
    })

    it("returns null for missing kitchen", async () => {
      mockPrisma.kitchenPartner.findUnique.mockResolvedValue(null)
      expect(await getKitchenBySlug("missing")).toBeNull()
    })
  })

  describe("getMenuItemsByKitchen", () => {
    it("returns menu items with stock info", async () => {
      const serviceDate = new Date()
      serviceDate.setDate(serviceDate.getDate() + 1)
      serviceDate.setHours(0, 0, 0, 0)

      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-1", name: "Dosa", price: 100, description: "Crispy", foodType: "VEG", timeSlot: "BREAKFAST",
          isAvailable: true, avgRating: 4.0, totalReviews: 10, imageUrl: "/dosa.jpg", menuId: "menu-1",
          menu: { id: "menu-1", name: "Breakfast Menu", kitchenPartnerId: "kp-1" },
          compareAtPrice: null,
        },
      ])
      mockPrisma.menuItemDailyStock.findMany.mockResolvedValue([
        { menuItemId: "mi-1", totalQuantity: 50, reservedQuantity: 10, soldQuantity: 5 },
      ])

      const result = await getMenuItemsByKitchen("kp-1")

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Dosa")
      expect(result[0].availableStock).toBe(35)
    })

    it("returns empty for kitchen with no items", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      expect(await getMenuItemsByKitchen("kp-2")).toEqual([])
    })
  })
})
