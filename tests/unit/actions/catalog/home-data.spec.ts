import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  kitchenPartner: { findMany: vi.fn(), findFirst: vi.fn() },
  order: { findMany: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/server-cache", () => ({
  cached: vi.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
}))

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }))

vi.mock("@/lib/utils", () => ({
  toTitleCase: (s: string) => s.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
}))

import {
  getRecentOrderKitchens,
} from "@/actions/catalog/home-data"

describe("home-data", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getRecentOrderKitchens", () => {
    it("returns empty array when userId is undefined", async () => {
      const result = await getRecentOrderKitchens(undefined)
      expect(result).toEqual([])
    })

    it("returns empty array when userId is empty string", async () => {
      const result = await getRecentOrderKitchens("")
      expect(result).toEqual([])
    })

    it("returns deduplicated kitchens from recent orders", async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: "order-1",
          orderItems: [{
            kitchenPartner: {
              id: "kp-1",
              slug: "tasty-kitchen",
              kitchenAlias: { displayName: "tasty-kitchen" },
            },
          }],
        },
        {
          id: "order-2",
          orderItems: [{
            kitchenPartner: {
              id: "kp-1",
              slug: "tasty-kitchen",
              kitchenAlias: { displayName: "tasty-kitchen" },
            },
          }],
        },
      ])

      const result = await getRecentOrderKitchens("user-1")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("kp-1")
      expect(result[0].displayName).toBe("Tasty Kitchen")
    })

    it("returns multiple different kitchens", async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: "order-1",
          orderItems: [{
            kitchenPartner: {
              id: "kp-1",
              slug: "kitchen-one",
              kitchenAlias: { displayName: "kitchen-one" },
            },
          }],
        },
        {
          id: "order-2",
          orderItems: [{
            kitchenPartner: {
              id: "kp-2",
              slug: "kitchen-two",
              kitchenAlias: { displayName: "kitchen-two" },
            },
          }],
        },
      ])

      const result = await getRecentOrderKitchens("user-1")

      expect(result).toHaveLength(2)
    })

    it("handles order with no orderItems", async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        { id: "order-1", orderItems: [] },
      ])

      const result = await getRecentOrderKitchens("user-1")

      expect(result).toEqual([])
    })

    it("uses slug as displayName fallback when no alias", async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: "order-1",
          orderItems: [{
            kitchenPartner: {
              id: "kp-1",
              slug: "my-kitchen",
              kitchenAlias: null,
            },
          }],
        },
      ])

      const result = await getRecentOrderKitchens("user-1")

      expect(result[0].displayName).toBe("My Kitchen")
    })

    it("queries with correct filters", async () => {
      mockPrisma.order.findMany.mockResolvedValue([])

      await getRecentOrderKitchens("user-1")

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", payment: { status: "SUCCESS" } },
        include: {
          orderItems: {
            include: { kitchenPartner: { include: { kitchenAlias: true } } },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        distinct: ["id"],
      })
    })
  })
})
