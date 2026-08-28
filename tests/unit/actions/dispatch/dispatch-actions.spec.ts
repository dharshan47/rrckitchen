import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn() },
  deliveryPartner: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  deliveryAssignment: { create: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockRedis = vi.hoisted(() => ({
  geosearch: vi.fn(),
  zrem: vi.fn(),
  geoadd: vi.fn(),
}))

vi.mock("@/lib/redis", () => ({ redis: mockRedis }))

const mockPublish = vi.fn().mockResolvedValue(undefined)
const mockChannelsGet = vi.fn(() => ({ publish: mockPublish }))
vi.mock("@/lib/ably/server", () => ({
  getAblyRest: () => ({ channels: { get: mockChannelsGet } }),
}))

const mockSession = vi.hoisted(() => ({ user: { id: "admin-1", role: "ADMIN" } }))
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import {
  assignNearestDeliveryPerson,
  acceptDeliveryOffer,
  updateDeliveryStatus,
  setDeliveryPersonOnline,
} from "@/actions/dispatch/dispatch-actions"
import { getSession } from "@/lib/auth-server"

describe("dispatch-actions", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("assignNearestDeliveryPerson", () => {
    it("assigns nearest available delivery person", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "dp-1" }])
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({
        id: "dp-1", isOnline: true,
      })
      mockPrisma.deliveryAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.deliveryAssignment.create.mockResolvedValue({ id: "assign-1" })

      const result = await assignNearestDeliveryPerson("order-1", 13.0, 80.2)

      expect(result.id).toBe("assign-1")
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: { deliveryPartnerId: "dp-1", deliveryStatus: "ASSIGNED" },
      })
      expect(mockPublish).toHaveBeenCalledTimes(2)
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(assignNearestDeliveryPerson("order-1", 13.0, 80.2)).rejects.toThrow("Unauthorized")
    })

    it("skips offline delivery persons", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "dp-1" }, { member: "dp-2" }])
      mockPrisma.deliveryPartner.findUnique
        .mockResolvedValueOnce({ id: "dp-1", isOnline: false })
        .mockResolvedValueOnce({ id: "dp-2", isOnline: true })
      mockPrisma.deliveryAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.deliveryAssignment.create.mockResolvedValue({ id: "assign-1" })

      await assignNearestDeliveryPerson("order-1", 13.0, 80.2)

      expect(mockPrisma.deliveryPartner.findUnique).toHaveBeenCalledTimes(2)
      expect(mockPrisma.deliveryAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deliveryPartnerId: "dp-2" }),
        }),
      )
    })

    it("skips delivery person with existing pending assignment", async () => {
      mockRedis.geosearch.mockResolvedValue([{ member: "dp-1" }, { member: "dp-2" }])
      mockPrisma.deliveryPartner.findUnique
        .mockResolvedValueOnce({ id: "dp-1", isOnline: true })
        .mockResolvedValueOnce({ id: "dp-2", isOnline: true })
      mockPrisma.deliveryAssignment.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "existing" })
        .mockResolvedValueOnce(null)
      mockPrisma.deliveryAssignment.create.mockResolvedValue({ id: "assign-1" })

      await assignNearestDeliveryPerson("order-1", 13.0, 80.2)

      expect(mockPrisma.deliveryAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deliveryPartnerId: "dp-2" }),
        }),
      )
    })

    it("throws when no delivery persons available", async () => {
      mockRedis.geosearch.mockResolvedValue([])
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([])

      await expect(assignNearestDeliveryPerson("order-1", 13.0, 80.2)).rejects.toThrow(
        "No delivery persons available nearby",
      )
    })

    it("falls back to any online partner when none are nearby", async () => {
      mockRedis.geosearch.mockResolvedValue([])
      mockPrisma.deliveryPartner.findMany.mockResolvedValue([{ id: "dp-9" }])
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({
        id: "dp-9", isOnline: true,
      })
      mockPrisma.deliveryAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.deliveryAssignment.create.mockResolvedValue({ id: "assign-9" })

      const result = await assignNearestDeliveryPerson("order-1", 13.0, 80.2)

      expect(result.id).toBe("assign-9")
      expect(mockPrisma.deliveryPartner.findMany).toHaveBeenCalledWith({
        where: { isOnline: true, status: { in: ["APPROVED", "ACTIVE"] } },
        select: { id: true },
      })
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: { deliveryPartnerId: "dp-9", deliveryStatus: "ASSIGNED" },
      })
    })
  })

  describe("acceptDeliveryOffer", () => {
    it("accepts delivery offer and publishes event", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1" })
      mockPrisma.deliveryAssignment.updateMany.mockResolvedValue({ count: 1 })

      await acceptDeliveryOffer("order-1")

      expect(mockPrisma.deliveryAssignment.updateMany).toHaveBeenCalledWith({
        where: { orderId: "order-1", deliveryPartnerId: "dp-1" },
        data: { acceptedAt: expect.any(Date) },
      })
      expect(mockChannelsGet).toHaveBeenCalledWith("order:order-1")
      expect(mockPublish).toHaveBeenCalledWith("delivery:status", { status: "ACCEPTED" })
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(acceptDeliveryOffer("order-1")).rejects.toThrow("Unauthorized")
    })

    it("throws if delivery partner not found", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue(null)

      await expect(acceptDeliveryOffer("order-1")).rejects.toThrow("Delivery partner not found")
    })
  })

  describe("updateDeliveryStatus", () => {
    it("updates to PICKEDUP", async () => {
      mockPrisma.deliveryAssignment.updateMany.mockResolvedValue({ count: 1 })

      await updateDeliveryStatus("order-1", "PICKEDUP")

      expect(mockPrisma.deliveryAssignment.updateMany).toHaveBeenCalledWith({
        where: { orderId: "order-1" },
        data: { pickedUpAt: expect.any(Date) },
      })
      expect(mockPublish).toHaveBeenCalledWith("delivery:status", { status: "PICKEDUP" })
    })

    it("updates to DELIVERED and marks order as COMPLETED", async () => {
      mockPrisma.deliveryAssignment.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.order.update.mockResolvedValue({})

      await updateDeliveryStatus("order-1", "DELIVERED")

      expect(mockPrisma.deliveryAssignment.updateMany).toHaveBeenCalledWith({
        where: { orderId: "order-1" },
        data: { deliveredAt: expect.any(Date) },
      })
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: { status: "COMPLETED" },
      })
    })

    it("updates to INTRANSIT without extra DB calls", async () => {
      mockPrisma.deliveryAssignment.updateMany.mockResolvedValue({ count: 1 })

      await updateDeliveryStatus("order-1", "INTRANSIT")

      expect(mockPrisma.deliveryAssignment.updateMany).not.toHaveBeenCalled()
      expect(mockPrisma.order.update).not.toHaveBeenCalled()
      expect(mockPublish).toHaveBeenCalledWith("delivery:status", { status: "INTRANSIT" })
    })

    it("updates to FAILED without extra DB calls", async () => {
      mockPrisma.deliveryAssignment.updateMany.mockResolvedValue({ count: 1 })

      await updateDeliveryStatus("order-1", "FAILED")

      expect(mockPrisma.deliveryAssignment.updateMany).not.toHaveBeenCalled()
      expect(mockPublish).toHaveBeenCalledWith("delivery:status", { status: "FAILED" })
    })

    it("throws on invalid status", async () => {
      await expect(updateDeliveryStatus("order-1", "INVALID")).rejects.toThrow("Invalid status")
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(updateDeliveryStatus("order-1", "PICKEDUP")).rejects.toThrow("Unauthorized")
    })
  })

  describe("setDeliveryPersonOnline", () => {
    it("sets delivery person online without adding placeholder geo coords", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1" })
      mockPrisma.deliveryPartner.update.mockResolvedValue({})
      mockRedis.geoadd.mockResolvedValue(1)

      const result = await setDeliveryPersonOnline(true)

      expect(result).toEqual({ success: true, isOnline: true })
      expect(mockPrisma.deliveryPartner.update).toHaveBeenCalledWith({
        where: { id: "dp-1" },
        data: { isOnline: true },
      })
      expect(mockRedis.geoadd).not.toHaveBeenCalled()
    })

    it("sets delivery person offline and removes from Redis", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1" })
      mockPrisma.deliveryPartner.update.mockResolvedValue({})
      mockRedis.zrem.mockResolvedValue(1)

      const result = await setDeliveryPersonOnline(false)

      expect(result).toEqual({ success: true, isOnline: false })
      expect(mockRedis.zrem).toHaveBeenCalledWith("deliveryPersons:live", "dp-1")
      expect(mockRedis.geoadd).not.toHaveBeenCalled()
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(setDeliveryPersonOnline(true)).rejects.toThrow("Unauthorized")
    })

    it("throws if delivery partner not found", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue(null)

      await expect(setDeliveryPersonOnline(true)).rejects.toThrow("Delivery partner not found")
    })
  })
})
