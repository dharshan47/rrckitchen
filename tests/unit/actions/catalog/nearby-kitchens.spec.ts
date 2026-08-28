import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRedis = vi.hoisted(() => ({
  geosearch: vi.fn(),
}))

vi.mock("@/lib/redis", () => ({ redis: mockRedis }))

const mockPrisma = vi.hoisted(() => ({
  kitchenPartner: { findMany: vi.fn() },
  kitchenAddress: { findMany: vi.fn(), findFirst: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/utils", () => ({
  toTitleCase: (s: string) => s.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
}))

import { getNearbyKitchens } from "@/actions/catalog/nearby-kitchens"

describe("nearby-kitchens", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns empty array when no nearby kitchens", async () => {
    mockRedis.geosearch.mockResolvedValue([])

    const result = await getNearbyKitchens(13.0, 80.2)

    expect(result).toEqual([])
  })

  it("returns empty when Redis geo returns empty", async () => {
    mockRedis.geosearch.mockResolvedValue([])

    const result = await getNearbyKitchens(13.0, 80.2, 10)

    expect(result).toEqual([])
  })

  it("returns kitchens with correct data", async () => {
    mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([
      {
        id: "kp-1",
        slug: "tasty-kitchen",
        kitchenAlias: { displayName: "tasty-kitchen" },
        kitchenAddress: { latitude: 13.1, longitude: 80.3 },
        kitchenCategories: [{ category: { name: "south-indian" } }],
        menus: [{
          menuItems: [{
            photos: [{ imageUrl: "/dosa.jpg" }],
          }],
        }],
        _count: { reviews: 10 },
        reviews: [{ rating: 4 }, { rating: 5 }],
      },
    ])

    const result = await getNearbyKitchens(13.0, 80.2)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("kp-1")
    expect(result[0].displayName).toBe("Tasty Kitchen")
    expect(result[0].avgRating).toBe(4.5)
    expect(result[0].totalReviews).toBe(10)
    expect(result[0].cuisineTags).toEqual(["South Indian"])
    expect(result[0].imageUrl).toBe("/dosa.jpg")
    expect(result[0].distanceKm).toBeTypeOf("number")
  })

  it("falls back to prisma when Redis fails", async () => {
    mockRedis.geosearch.mockRejectedValue(new Error("redis down"))
    mockPrisma.kitchenAddress.findMany.mockResolvedValue([
      { kitchenPartner: { id: "kp-1", status: "ACTIVE" } },
    ])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([
      {
        id: "kp-1",
        slug: "kitchen-1",
        kitchenAlias: null,
        kitchenCategories: [],
        menus: [],
        _count: { reviews: 0 },
        reviews: [],
      },
    ])
    mockPrisma.kitchenAddress.findFirst.mockResolvedValue(null)

    await getNearbyKitchens(13.0, 80.2)

    expect(mockPrisma.kitchenAddress.findMany).toHaveBeenCalled()
  })

  it("filters out non-active kitchens in fallback", async () => {
    mockRedis.geosearch.mockRejectedValue(new Error("redis down"))
    mockPrisma.kitchenAddress.findMany.mockResolvedValue([
      { kitchenPartner: { id: "kp-1", status: "ACTIVE" } },
      { kitchenPartner: { id: "kp-2", status: "PENDING" } },
      { kitchenPartner: { id: "kp-3", status: "APPROVED" } },
    ])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([])
    mockPrisma.kitchenAddress.findFirst.mockResolvedValue(null)

    await getNearbyKitchens(13.0, 80.2)

    expect(mockPrisma.kitchenPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["kp-1", "kp-3"] },
        }),
      }),
    )
  })

  it("sorts by distance ascending", async () => {
    mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }, { member: "kp-2" }])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([
      {
        id: "kp-1", slug: "k1", kitchenAlias: { displayName: "k1" },
        kitchenAddress: { latitude: 13.5, longitude: 80.5 }, // farther
        kitchenCategories: [], menus: [], _count: { reviews: 0 }, reviews: [],
      },
      {
        id: "kp-2", slug: "k2", kitchenAlias: { displayName: "k2" },
        kitchenAddress: { latitude: 13.01, longitude: 80.21 }, // closer
        kitchenCategories: [], menus: [], _count: { reviews: 0 }, reviews: [],
      },
    ])

    const result = await getNearbyKitchens(13.0, 80.2)

    expect(result[0].id).toBe("kp-2")
    expect(result[1].id).toBe("kp-1")
  })

  it("handles null distance when no address found", async () => {
    mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([
      {
        id: "kp-1", slug: "k1", kitchenAlias: null,
        kitchenCategories: [], menus: [], _count: { reviews: 0 }, reviews: [],
      },
    ])
    mockPrisma.kitchenAddress.findFirst.mockResolvedValue(null)

    const result = await getNearbyKitchens(13.0, 80.2)

    expect(result[0].distanceKm).toBeNull()
  })

  it("returns null avgRating when no reviews", async () => {
    mockRedis.geosearch.mockResolvedValue([{ member: "kp-1" }])
    mockPrisma.kitchenPartner.findMany.mockResolvedValue([
      {
        id: "kp-1", slug: "k1", kitchenAlias: null,
        kitchenCategories: [], menus: [], _count: { reviews: 0 }, reviews: [],
      },
    ])
    mockPrisma.kitchenAddress.findFirst.mockResolvedValue(null)

    const result = await getNearbyKitchens(13.0, 80.2)

    expect(result[0].avgRating).toBeNull()
  })

  it("uses default maxDistanceKm of 15", async () => {
    mockRedis.geosearch.mockResolvedValue([])

    await getNearbyKitchens(13.0, 80.2)

    expect(mockRedis.geosearch).toHaveBeenCalledWith(
      "kitchens:geo",
      { type: "FROMLONLAT", coordinate: { lon: 80.2, lat: 13.0 } },
      { type: "BYRADIUS", radius: 15, radiusType: "KM" },
      "ASC",
    )
  })
})
