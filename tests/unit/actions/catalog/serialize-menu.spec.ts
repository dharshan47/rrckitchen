import { describe, it, expect } from "vitest"

import { serializeMenuItems } from "@/actions/catalog/serialize-menu"

describe("serializeMenuItems", () => {
  it("converts prices to numbers", () => {
    const items = [
      {
        id: "mi-1", name: "Dosa", price: "120" as unknown as number,
        compareAtPrice: "150" as unknown as number,
        avgRating: "4.5" as unknown as number,
        totalReviews: 20,
        menu: { kitchenPartner: { kitchenAlias: { displayName: "Test Kitchen" } } },
        photos: [{ imageUrl: "/dosa.jpg", sortOrder: 0 }],
      },
    ]

    const result = serializeMenuItems(items as any)

    expect(result[0].price).toBe(120)
    expect(result[0].compareAtPrice).toBe(150)
    expect(result[0].avgRating).toBe(4.5)
  })

  it("handles null compareAtPrice", () => {
    const items = [
      {
        id: "mi-1", name: "Idli", price: "80" as unknown as number,
        compareAtPrice: null,
        avgRating: null,
        totalReviews: 0,
        menu: { kitchenPartner: { kitchenAlias: { displayName: "Test Kitchen" } } },
        photos: [],
      },
    ]

    const result = serializeMenuItems(items as any)

    expect(result[0].compareAtPrice).toBeNull()
    expect(result[0].avgRating).toBeNull()
  })

  it("handles null menu", () => {
    const items = [
      {
        id: "mi-1", name: "Vada", price: "60" as unknown as number,
        compareAtPrice: null,
        menu: null,
        photos: [],
      },
    ]

    const result = serializeMenuItems(items as any)

    expect(result[0].menu).toBeNull()
  })

  it("handles null kitchenPartner", () => {
    const items = [
      {
        id: "mi-1", name: "Sambar", price: "40" as unknown as number,
        compareAtPrice: null,
        menu: { kitchenPartner: null },
        photos: [],
      },
    ]

    const result = serializeMenuItems(items as any)

    expect(result[0].menu!.kitchenPartner).toBeNull()
  })

  it("maps photos correctly", () => {
    const items = [
      {
        id: "mi-1", name: "Dosa", price: "120" as unknown as number,
        compareAtPrice: null,
        menu: null,
        photos: [
          { imageUrl: "/dosa1.jpg", sortOrder: 0, id: "p1" },
          { imageUrl: "/dosa2.jpg", sortOrder: 1, id: "p2" },
        ],
      },
    ]

    const result = serializeMenuItems(items as any)

    expect(result[0].photos).toHaveLength(2)
    expect(result[0].photos[0]).toEqual({ imageUrl: "/dosa1.jpg", sortOrder: 0 })
    expect(result[0].photos[1]).toEqual({ imageUrl: "/dosa2.jpg", sortOrder: 1 })
  })

  it("returns empty array for empty input", () => {
    const result = serializeMenuItems([])
    expect(result).toEqual([])
  })
})
