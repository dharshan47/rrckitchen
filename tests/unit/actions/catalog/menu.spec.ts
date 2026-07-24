import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  menuItem: { findMany: vi.fn(), findFirst: vi.fn() },
  review: { aggregate: vi.fn(), count: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/server-cache", () => ({
  cached: vi.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
}))

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }))

import { getTomorrowMenu, getMenuItemById, getMenuItemBySlug } from "@/actions/catalog/menu"

describe("menu", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getTomorrowMenu", () => {
    it("returns menu items with no filters", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-1", slug: "masala-dosa", name: "Masala Dosa", description: "Crispy",
          price: 120, compareAtPrice: 150, foodType: "VEG", timeSlot: "BREAKFAST",
          isAvailable: true, menuId: "m1",
          menu: { kitchenPartner: { kitchenAlias: { displayName: "Tasty Kitchen" }, avgRating: 4.5, totalReviews: 20 } },
          photos: [{ imageUrl: "/dosa.jpg", sortOrder: 0 }],
        },
      ])

      const result = await getTomorrowMenu()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Masala Dosa")
      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isAvailable: true, menu: { isActive: true } }),
          orderBy: [{ timeSlot: "asc" }, { foodType: "asc" }, { name: "asc" }],
        }),
      )
    })

    it("applies search query filter", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ query: "dosa" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: "dosa", mode: "insensitive" } },
              { description: { contains: "dosa", mode: "insensitive" } },
              { menu: { kitchenPartner: { kitchenAlias: { displayName: { contains: "dosa", mode: "insensitive" } } } } },
            ],
          }),
        }),
      )
    })

    it("applies foodType filter", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ foodType: "VEG" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ foodType: "VEG" }),
        }),
      )
    })

    it("ignores foodType ALL", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ foodType: "ALL" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ foodType: undefined }),
        }),
      )
    })

    it("applies timeSlot filter", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ timeSlot: "LUNCH" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ timeSlot: "LUNCH" }),
        }),
      )
    })

    it("ignores timeSlot ALL", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ timeSlot: "ALL" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ timeSlot: undefined }),
        }),
      )
    })

    it("returns bestseller items sorted by order count when bestseller is true", async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([])

      await getTomorrowMenu({ bestseller: true })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ orderItems: { _count: "desc" } }, { timeSlot: "asc" }],
          take: 30,
        }),
      )
    })
  })

  describe("getMenuItemById", () => {
    it("returns menu item with rating and reviews", async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValue({
        id: "mi-1", slug: "masala-dosa", name: "Masala Dosa", description: "Crispy",
        price: 120, compareAtPrice: 150, foodType: "VEG", timeSlot: "BREAKFAST",
        isAvailable: true,
        menu: {
          kitchenPartnerId: "kp-1",
          kitchenPartner: { kitchenAlias: { displayName: "Tasty Kitchen" } },
        },
        photos: [{ id: "p1", imageUrl: "/dosa.jpg", sortOrder: 0 }],
        _count: { orderItems: 10 },
      })
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } })
      mockPrisma.review.count.mockResolvedValue(20)

      const result = await getMenuItemById("mi-1")

      expect(result).not.toBeNull()
      expect(result!.name).toBe("Masala Dosa")
      expect(result!.price).toBe(120)
      expect(result!.compareAtPrice).toBe(150)
      expect(result!.avgRating).toBe(4.5)
      expect(result!.totalReviews).toBe(20)
      expect(result!.photos).toHaveLength(1)
    })

    it("returns null when item not found", async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValue(null)

      const result = await getMenuItemById("missing")

      expect(result).toBeNull()
    })

    it("returns null avgRating when no reviews", async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValue({
        id: "mi-1", slug: "idli", name: "Idli", description: "Soft",
        price: 80, compareAtPrice: null, foodType: "VEG", timeSlot: "BREAKFAST",
        isAvailable: true,
        menu: { kitchenPartnerId: "kp-1", kitchenPartner: { kitchenAlias: null } },
        photos: [],
        _count: { orderItems: 0 },
      })
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } })
      mockPrisma.review.count.mockResolvedValue(0)

      const result = await getMenuItemById("mi-1")

      expect(result!.avgRating).toBeNull()
      expect(result!.compareAtPrice).toBeNull()
      expect(result!.menu?.kitchenPartner?.kitchenAlias).toBeNull()
    })
  })

  describe("getMenuItemBySlug", () => {
    it("returns item by slug", async () => {
      mockPrisma.menuItem.findFirst
        .mockResolvedValueOnce({
          id: "mi-1", slug: "masala-dosa", name: "Masala Dosa", description: "Crispy",
          price: 120, compareAtPrice: null, foodType: "VEG", timeSlot: "BREAKFAST",
          isAvailable: true,
          menu: { kitchenPartnerId: "kp-1", kitchenPartner: { kitchenAlias: { displayName: "Tasty Kitchen" } } },
          photos: [{ id: "p1", imageUrl: "/dosa.jpg", sortOrder: 0 }],
          _count: { orderItems: 5 },
        })
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } })
      mockPrisma.review.count.mockResolvedValue(10)

      const result = await getMenuItemBySlug("masala-dosa")

      expect(result).not.toBeNull()
      expect(result!.name).toBe("Masala Dosa")
    })

    it("falls back to finding by id when slug not found", async () => {
      mockPrisma.menuItem.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "mi-1", slug: "mi-1", name: "Item", description: "Desc",
          price: 100, compareAtPrice: null, foodType: "VEG", timeSlot: "LUNCH",
          isAvailable: true,
          menu: { kitchenPartnerId: "kp-1", kitchenPartner: { kitchenAlias: null } },
          photos: [],
          _count: { orderItems: 0 },
        })
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } })
      mockPrisma.review.count.mockResolvedValue(0)

      const result = await getMenuItemBySlug("mi-1")

      expect(result).not.toBeNull()
      expect(mockPrisma.menuItem.findFirst).toHaveBeenCalledTimes(2)
    })

    it("returns null when neither slug nor id match", async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValue(null)

      const result = await getMenuItemBySlug("nonexistent")

      expect(result).toBeNull()
    })
  })
})
