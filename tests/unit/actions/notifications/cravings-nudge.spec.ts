import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  user: { findMany: vi.fn(), findUnique: vi.fn() },
  order: { findFirst: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/notification", () => ({
  sendPushNotification: vi.fn().mockResolvedValue(undefined),
}))

import { processCravingsNudge, getUserCravingBanner } from "@/actions/notifications/cravings-nudge"

describe("cravings-nudge", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("processCravingsNudge", () => {
    it("notifies users who have push subscriptions and no recent orders", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          orders: [
            {
              orderItems: [
                {
                  kitchenPartner: {
                    kitchenAlias: { displayName: "Tasty Kitchen" },
                  },
                },
              ],
            },
          ],
          pushSubscriptions: [{ endpoint: "https://push.example.com", p256dh: "key", auth: "auth" }],
        },
      ])

      const { sendPushNotification } = await import("@/lib/notification")
      const result = await processCravingsNudge(3)

      expect(result.notified).toBe(1)
      expect(result.skipped).toBe(0)
      expect(sendPushNotification).toHaveBeenCalled()
    })

    it("skips users when push notification fails", async () => {
      const { sendPushNotification } = await import("@/lib/notification")
      vi.mocked(sendPushNotification).mockRejectedValueOnce(new Error("Push failed"))

      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          orders: [],
          pushSubscriptions: [{ endpoint: "https://push.example.com", p256dh: "key", auth: "auth" }],
        },
      ])

      const result = await processCravingsNudge(3)

      expect(result.notified).toBe(0)
      expect(result.skipped).toBe(1)
    })

    it("returns zero counts when no candidates", async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const result = await processCravingsNudge(3)

      expect(result.notified).toBe(0)
      expect(result.skipped).toBe(0)
    })

    it("uses generic message when no kitchen name", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          orders: [{ orderItems: [] }],
          pushSubscriptions: [{ endpoint: "https://push.example.com", p256dh: "key", auth: "auth" }],
        },
      ])

      const result = await processCravingsNudge(3)

      expect(result.notified).toBe(1)
    })

    it("handles multiple push subscriptions per user", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          orders: [],
          pushSubscriptions: [
            { endpoint: "https://push1.example.com", p256dh: "key1", auth: "auth1" },
            { endpoint: "https://push2.example.com", p256dh: "key2", auth: "auth2" },
          ],
        },
      ])

      const { sendPushNotification } = await import("@/lib/notification")
      const result = await processCravingsNudge(3)

      expect(result.notified).toBe(1)
      expect(sendPushNotification).toHaveBeenCalledTimes(2)
    })
  })

  describe("getUserCravingBanner", () => {
    it("returns null when user has a recent order within 3 days", async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: "recent-order" })

      const result = await getUserCravingBanner("user-1")

      expect(result).toBeNull()
    })

    it("returns banner when no recent orders", async () => {
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "old-order",
          orderItems: [
            {
              kitchenPartnerId: "kp-1",
              kitchenPartner: {
                kitchenAlias: { displayName: "Home Kitchen" },
              },
            },
          ],
        })

      const result = await getUserCravingBanner("user-1")

      expect(result).not.toBeNull()
      expect(result?.show).toBe(true)
      expect(result?.message).toContain("Home Kitchen")
      expect(result?.kitchenId).toBe("kp-1")
    })

    it("returns null when no orders at all", async () => {
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const result = await getUserCravingBanner("user-1")

      expect(result).toBeNull()
    })

    it("returns generic message when no kitchen name in last order", async () => {
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "old-order",
          orderItems: [],
        })

      const result = await getUserCravingBanner("user-1")

      expect(result).not.toBeNull()
      expect(result?.message).toContain("check the menu")
    })

    it("includes timeSlot based on current hour", async () => {
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "old-order",
          orderItems: [
            {
              kitchenPartnerId: "kp-1",
              kitchenPartner: {
                kitchenAlias: { displayName: "Kitchen" },
              },
            },
          ],
        })

      const result = await getUserCravingBanner("user-1")

      expect(result?.timeSlot).toBeDefined()
      expect(["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"]).toContain(result?.timeSlot)
    })
  })
})
