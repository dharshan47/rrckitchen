import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRedis = {
  geosearch: vi.fn(),
  geoadd: vi.fn(),
  zrem: vi.fn(),
}

vi.mock("@/lib/redis", () => ({ redis: mockRedis }))

const mockPrisma = {
  kitchenAddress: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
  menuItem: { findMany: vi.fn(), count: vi.fn() },
  review: { aggregate: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

import {
  searchAcrossKitchens,
  indexKitchenInRedis,
  removeKitchenFromRedis,
  reindexAllKitchens,
} from "@/actions/catalog/cross-kitchen-search"

describe("cross-kitchen-search", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("searchAcrossKitchens", () => {
    const baseInput = { query: "dosa", latitude: 13.0, longitude: 80.2 }

    it("returns items from nearby kitchens via Redis geo", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      const result = await searchAcrossKitchens(baseInput)

      expect(result).toEqual({ items: [], total: 0 })
      expect(mockRedis.geosearch).toHaveBeenCalledWith(
        "kitchens:geo",
        { longitude: 80.2, latitude: 13.0 },
        { radius: 10, unit: "km" },
      )
    })

    it("falls back to prisma when Redis fails", async () => {
      mockRedis.geosearch.mockRejectedValue(new Error("redis down"))
      mockPrisma.kitchenAddress.findMany.mockResolvedValue([
        { kitchenPartner: { id: "kp-1", status: "ACTIVE" } },
      ])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      const result = await searchAcrossKitchens(baseInput)

      expect(result).toEqual({ items: [], total: 0 })
      expect(mockPrisma.kitchenAddress.findMany).toHaveBeenCalled()
    })

    it("returns empty when no nearby kitchens found", async () => {
      mockRedis.geosearch.mockResolvedValue([])

      const result = await searchAcrossKitchens(baseInput)

      expect(result).toEqual({ items: [], total: 0 })
    })

    it("applies query filter with OR on name and description", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      await searchAcrossKitchens({ ...baseInput, query: "masala" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: "masala", mode: "insensitive" } },
              { description: { contains: "masala", mode: "insensitive" } },
            ],
          }),
        }),
      )
    })

    it("applies timeSlot filter when provided", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      await searchAcrossKitchens({ ...baseInput, timeSlot: "BREAKFAST" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ timeSlot: "BREAKFAST" }),
        }),
      )
    })

    it("applies foodType filter when provided", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      await searchAcrossKitchens({ ...baseInput, foodType: "VEG" })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ foodType: "VEG" }),
        }),
      )
    })

    it("maps menu items to result format with rating and distance", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-1",
          name: "Masala Dosa",
          description: "Crispy dosa",
          price: 120,
          foodType: "VEG",
          timeSlot: "BREAKFAST",
          menu: {
            kitchenPartnerId: "kp-1",
            kitchenPartner: {
              kitchenAlias: { displayName: "Tasty Kitchen" },
            },
          },
          photos: [{ imageUrl: "/dosa.jpg" }],
        },
      ])
      mockPrisma.menuItem.count.mockResolvedValue(1)
      mockPrisma.kitchenAddress.findFirst.mockResolvedValue({
        latitude: 13.1,
        longitude: 80.3,
      })
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } })

      const result = await searchAcrossKitchens(baseInput)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe("Masala Dosa")
      expect(result.items[0].kitchenName).toBe("Tasty Kitchen")
      expect(result.items[0].price).toBe(120)
      expect(result.items[0].avgRating).toBe(4.5)
      expect(result.items[0].imageUrl).toBe("/dosa.jpg")
      expect(result.items[0].distanceKm).toBeTypeOf("number")
    })

    it("returns null avgRating when review aggregate returns null", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([
        {
          id: "mi-2",
          name: "Idli",
          description: "Soft idli",
          price: 80,
          foodType: "VEG",
          timeSlot: "BREAKFAST",
          menu: {
            kitchenPartnerId: "kp-1",
            kitchenPartner: { kitchenAlias: null },
          },
          photos: [],
        },
      ])
      mockPrisma.menuItem.count.mockResolvedValue(1)
      mockPrisma.kitchenAddress.findFirst.mockResolvedValue(null)
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } })

      const result = await searchAcrossKitchens(baseInput)

      expect(result.items[0].avgRating).toBeNull()
      expect(result.items[0].kitchenName).toBe("")
      expect(result.items[0].imageUrl).toBeNull()
      expect(result.items[0].distanceKm).toBeNull()
    })

    it("applies limit and offset", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      await searchAcrossKitchens({ ...baseInput, limit: 5, offset: 10 })

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5, skip: 10 }),
      )
    })

    it("uses custom maxDistanceKm", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
      mockPrisma.menuItem.findMany.mockResolvedValue([])
      mockPrisma.menuItem.count.mockResolvedValue(0)

      await searchAcrossKitchens({ ...baseInput, maxDistanceKm: 25 })

      expect(mockRedis.geosearch).toHaveBeenCalledWith(
        "kitchens:geo",
        { longitude: 80.2, latitude: 13.0 },
        { radius: 25, unit: "km" },
      )
    })
  })

  describe("indexKitchenInRedis", () => {
    it("indexes kitchen in Redis geo", async () => {
      mockPrisma.kitchenAddress.findUnique.mockResolvedValue({
        latitude: 13.0,
        longitude: 80.2,
      })
      mockRedis.geoadd.mockResolvedValue(1)

      await indexKitchenInRedis("kp-1")

      expect(mockRedis.geoadd).toHaveBeenCalledWith("kitchens:geo", {
        longitude: 80.2,
        latitude: 13.0,
        member: "kp-1",
      })
    })

    it("does nothing if address not found", async () => {
      mockPrisma.kitchenAddress.findUnique.mockResolvedValue(null)

      await indexKitchenInRedis("kp-missing")

      expect(mockRedis.geoadd).not.toHaveBeenCalled()
    })
  })

  describe("removeKitchenFromRedis", () => {
    it("removes kitchen from Redis geo", async () => {
      mockRedis.zrem.mockResolvedValue(1)

      await removeKitchenFromRedis("kp-1")

      expect(mockRedis.zrem).toHaveBeenCalledWith("kitchens:geo", "kp-1")
    })
  })

  describe("reindexAllKitchens", () => {
    it("reindexes all approved/active kitchens", async () => {
      mockPrisma.kitchenAddress.findMany.mockResolvedValue([
        { kitchenPartnerId: "kp-1", latitude: 13.0, longitude: 80.2 },
        { kitchenPartnerId: "kp-2", latitude: 13.1, longitude: 80.3 },
      ])
      mockRedis.geoadd.mockResolvedValue(1)

      const result = await reindexAllKitchens()

      expect(result.count).toBe(2)
      expect(mockRedis.geoadd).toHaveBeenCalledTimes(2)
    })

    it("returns count 0 when no kitchens to index", async () => {
      mockPrisma.kitchenAddress.findMany.mockResolvedValue([])

      const result = await reindexAllKitchens()

      expect(result.count).toBe(0)
      expect(mockRedis.geoadd).not.toHaveBeenCalled()
    })
  })
})
