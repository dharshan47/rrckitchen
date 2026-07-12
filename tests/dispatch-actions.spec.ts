import { describe, it, expect, vi, beforeEach } from "vitest"
import { redis } from "@/lib/redis"

vi.mock("@/lib/redis", () => ({
  redis: {
    zrange: vi.fn(),
    geoadd: vi.fn(),
    zrem: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock("@/lib/ably/server", () => ({
  getAblyRest: vi.fn(() => ({
    channels: {
      get: vi.fn(() => ({
        publish: vi.fn(),
      })),
    },
  })),
}))

vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => ({ user: { id: "user-1", role: "ADMIN" } })),
}))

vi.mock("@/lib/prisma", () => ({
  default: {
    deliveryPartner: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    deliveryAssignment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    order: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { setDeliveryPersonOnline } from "@/actions/dispatch/dispatch-actions"
import prisma from "@/lib/prisma"

describe("dispatch.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("setDeliveryPersonOnline", () => {
    it("should set online and add to Redis", async () => {
      vi.mocked(prisma.deliveryPartner.findUnique).mockResolvedValue({
        id: "dp-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      vi.mocked(prisma.deliveryPartner.update).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any
      )

      const result = await setDeliveryPersonOnline(true)

      expect(result.success).toBe(true)
      expect(result.isOnline).toBe(true)
      expect(prisma.deliveryPartner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dp-1" },
          data: { isOnline: true },
        })
      )
    })

    it("should remove from Redis when going offline", async () => {
      vi.mocked(prisma.deliveryPartner.findUnique).mockResolvedValue({
        id: "dp-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      vi.mocked(prisma.deliveryPartner.update).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any
      )

      await setDeliveryPersonOnline(false)

      expect(redis.zrem).toHaveBeenCalledWith("deliveryPersons:live", "dp-1")
    })

    it("should throw if delivery partner not found", async () => {
      vi.mocked(prisma.deliveryPartner.findUnique).mockResolvedValue(null)

      await expect(setDeliveryPersonOnline(true)).rejects.toThrow(
        "Delivery partner not found"
      )
    })
  })
})
