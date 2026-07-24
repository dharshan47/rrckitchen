import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({ default: {} }))

import { createCodOrder } from "@/actions/payments/cod-checkout"

describe("cod-checkout", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("createCodOrder", () => {
    it("returns available true", async () => {
      const result = await createCodOrder()
      expect(result).toEqual({ available: true })
    })
  })
})
