import { describe, it, expect, vi, beforeEach } from "vitest"

describe("cod-eligibility", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("isCodAvailable returns available: true", async () => {
    const { isCodAvailable } = await import("@/actions/cart-checkout/cod-eligibility")

    const result = await isCodAvailable()

    expect(result).toEqual({ available: true })
  })

  it("isCodAvailable always returns the same shape", async () => {
    const { isCodAvailable } = await import("@/actions/cart-checkout/cod-eligibility")

    const result1 = await isCodAvailable()
    const result2 = await isCodAvailable()

    expect(result1).toEqual(result2)
    expect(result1).toHaveProperty("available")
  })
})
