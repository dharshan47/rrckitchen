import { describe, it, expect, vi, beforeEach } from "vitest"
import { getSession } from "@/lib/auth-server"
import {
  getPendingTiffinPickups,
  getTiffinPickupByOrderId,
  assignTiffinPickup,
  updateTiffinPickupStatus,
  getMyTiffinPickups,
  getCustomerTiffinPickups
} from "@/actions/dispatch/tiffin-actions"

const mockPrisma = vi.hoisted(() => ({
  tiffinPickup: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  deliveryPartner: {
    findUnique: vi.fn(),
  }
}))
vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockSession = vi.hoisted(() => ({ user: { id: "user-1", role: "CUSTOMER" } }))
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

describe("tiffin-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSession).mockResolvedValue(mockSession as any)
  })

  describe("getPendingTiffinPickups", () => {
    it("returns scheduled pickups for today", async () => {
      mockPrisma.tiffinPickup.findMany.mockResolvedValue([{ id: "tiffin-1" }])
      const result = await getPendingTiffinPickups()
      expect(result).toEqual([{ id: "tiffin-1" }])
      expect(mockPrisma.tiffinPickup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "SCHEDULED"
          })
        })
      )
    })

    it("throws if unauthorized", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)
      await expect(getPendingTiffinPickups()).rejects.toThrow("Unauthorized")
    })
  })

  describe("getTiffinPickupByOrderId", () => {
    it("returns tiffin pickup by orderId", async () => {
      mockPrisma.tiffinPickup.findUnique.mockResolvedValue({ id: "tiffin-1" })
      const result = await getTiffinPickupByOrderId("order-1")
      expect(result).toEqual({ id: "tiffin-1" })
      expect(mockPrisma.tiffinPickup.findUnique).toHaveBeenCalledWith({
        where: { orderId: "order-1" },
        include: expect.any(Object)
      })
    })
  })

  describe("assignTiffinPickup", () => {
    it("assigns tiffin pickup to delivery partner", async () => {
      mockPrisma.tiffinPickup.update.mockResolvedValue({ id: "tiffin-1", status: "ASSIGNED" })
      const result = await assignTiffinPickup("tiffin-1", "dp-1")
      expect(result.status).toBe("ASSIGNED")
      expect(mockPrisma.tiffinPickup.update).toHaveBeenCalledWith({
        where: { id: "tiffin-1" },
        data: { deliveryPartnerId: "dp-1", status: "ASSIGNED" }
      })
    })

    it("throws if unauthorized", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)
      await expect(assignTiffinPickup("tiffin-1", "dp-1")).rejects.toThrow("Unauthorized")
    })
  })

  describe("updateTiffinPickupStatus", () => {
    it("updates status to STARTED", async () => {
      mockPrisma.tiffinPickup.update.mockResolvedValue({ id: "tiffin-1", status: "STARTED" })
      await updateTiffinPickupStatus("tiffin-1", "STARTED")
      expect(mockPrisma.tiffinPickup.update).toHaveBeenCalledWith({
        where: { id: "tiffin-1" },
        data: { status: "STARTED" }
      })
    })

    it("updates status to ARRIVED", async () => {
      mockPrisma.tiffinPickup.update.mockResolvedValue({ id: "tiffin-1", status: "ARRIVED" })
      await updateTiffinPickupStatus("tiffin-1", "ARRIVED")
      expect(mockPrisma.tiffinPickup.update).toHaveBeenCalledWith({
        where: { id: "tiffin-1" },
        data: { status: "ARRIVED" }
      })
    })

    it("updates status to COLLECTED", async () => {
      mockPrisma.tiffinPickup.update.mockResolvedValue({ id: "tiffin-1", status: "COLLECTED" })
      await updateTiffinPickupStatus("tiffin-1", "COLLECTED")
      expect(mockPrisma.tiffinPickup.update).toHaveBeenCalledWith({
        where: { id: "tiffin-1" },
        data: { status: "COLLECTED" }
      })
    })

    it("throws on invalid status", async () => {
      await expect(updateTiffinPickupStatus("tiffin-1", "INVALID")).rejects.toThrow("Invalid status")
    })

    it("throws if unauthorized", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)
      await expect(updateTiffinPickupStatus("tiffin-1", "COLLECTED")).rejects.toThrow("Unauthorized")
    })
  })

  describe("getMyTiffinPickups", () => {
    it("returns partner pickups", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue({ id: "dp-1" })
      mockPrisma.tiffinPickup.findMany.mockResolvedValue([{ id: "tiffin-1" }])
      
      const result = await getMyTiffinPickups()
      
      expect(result).toEqual([{ id: "tiffin-1" }])
      expect(mockPrisma.tiffinPickup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deliveryPartnerId: "dp-1" } })
      )
    })

    it("throws if not partner", async () => {
      mockPrisma.deliveryPartner.findUnique.mockResolvedValue(null)
      await expect(getMyTiffinPickups()).rejects.toThrow("Not a delivery partner")
    })
  })

  describe("getCustomerTiffinPickups", () => {
    it("returns customer pickups", async () => {
      mockPrisma.tiffinPickup.findMany.mockResolvedValue([{ id: "tiffin-1" }])
      const result = await getCustomerTiffinPickups()
      
      expect(result).toEqual([{ id: "tiffin-1" }])
      expect(mockPrisma.tiffinPickup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { customerId: "user-1" } })
      )
    })
  })
})
