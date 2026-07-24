import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  address: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  serviceZone: { findFirst: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

const mockSession = { user: { id: "user-1" } }
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn(() => mockSession) }))

import { getUserAddresses, addAddress, deleteAddress } from "@/actions/cart-checkout/address"
import { getSession } from "@/lib/auth-server"

describe("address", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getUserAddresses", () => {
    it("returns addresses for authenticated user", async () => {
      const addresses = [
        { id: "a1", lineOne: "123 Main St", pincode: "600001", isDefault: true, createdAt: new Date(), serviceZone: { name: "Zone A" } },
      ]
      mockPrisma.address.findMany.mockResolvedValue(addresses)

      const result = await getUserAddresses()

      expect(result).toEqual(addresses)
      expect(mockPrisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: { serviceZone: { select: { name: true } } },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(getUserAddresses()).rejects.toThrow("Not authenticated")
    })

    it("throws if session has no user id", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({ user: undefined } as any)

      await expect(getUserAddresses()).rejects.toThrow("Not authenticated")
    })
  })

  describe("addAddress", () => {
    const validAddress = { lineOne: "123 Main Street", pincode: "600001", label: "Home" }

    it("creates a new address and sets as default when first", async () => {
      mockPrisma.serviceZone.findFirst.mockResolvedValue({ id: "zone-1" })
      mockPrisma.address.count.mockResolvedValue(0)
      mockPrisma.address.create.mockResolvedValue({ id: "a1", ...validAddress, isDefault: true })

      const result = await addAddress(validAddress)

      expect(result.isDefault).toBe(true)
      expect(mockPrisma.address.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          label: "Home",
          lineOne: "123 Main Street",
          lineTwo: undefined,
          pincode: "600001",
          serviceZoneId: "zone-1",
          isDefault: true,
        },
      })
    })

    it("sets isDefault to false when user already has addresses", async () => {
      mockPrisma.serviceZone.findFirst.mockResolvedValue({ id: "zone-1" })
      mockPrisma.address.count.mockResolvedValue(2)
      mockPrisma.address.create.mockResolvedValue({ id: "a2", ...validAddress, isDefault: false })

      const result = await addAddress(validAddress)

      expect(result.isDefault).toBe(false)
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(addAddress(validAddress)).rejects.toThrow("Not authenticated")
    })

    it("throws if pincode not in any service zone", async () => {
      mockPrisma.serviceZone.findFirst.mockResolvedValue(null)

      await expect(addAddress(validAddress)).rejects.toThrow("Delivery not available in this pincode")
    })

    it("throws on invalid address data", async () => {
      await expect(addAddress({ lineOne: "ab", pincode: "123" })).rejects.toThrow()
    })

    it("handles address with optional fields omitted", async () => {
      const minimal = { lineOne: "456 Oak Avenue", pincode: "600002" }
      mockPrisma.serviceZone.findFirst.mockResolvedValue({ id: "zone-2" })
      mockPrisma.address.count.mockResolvedValue(1)
      mockPrisma.address.create.mockResolvedValue({ id: "a3", ...minimal, isDefault: false })

      await addAddress(minimal)

      expect(mockPrisma.address.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          label: undefined,
          lineTwo: undefined,
          isDefault: false,
        }),
      })
    })
  })

  describe("deleteAddress", () => {
    it("deletes an address belonging to the user", async () => {
      mockPrisma.address.deleteMany.mockResolvedValue({ count: 1 })

      await deleteAddress("a1")

      expect(mockPrisma.address.deleteMany).toHaveBeenCalledWith({
        where: { id: "a1", userId: "user-1" },
      })
    })

    it("does not throw even if no address was found", async () => {
      mockPrisma.address.deleteMany.mockResolvedValue({ count: 0 })

      await expect(deleteAddress("nonexistent")).resolves.not.toThrow()
    })

    it("throws if not authenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null)

      await expect(deleteAddress("a1")).rejects.toThrow("Not authenticated")
    })
  })
})
