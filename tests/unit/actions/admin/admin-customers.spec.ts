import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  user: {
    count: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  order: {
    groupBy: vi.fn(),
    findMany: vi.fn(),
  },
  payment: {
    groupBy: vi.fn(),
  },
  address: {
    groupBy: vi.fn(),
  },
  serviceZone: {
    findMany: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
  },
  pushSubscription: {
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  notificationLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  logAdminAction: vi.fn(),
}))
vi.mock("@/lib/phone", () => ({
  normalizePhone: (v: string) => {
    const digits = v.replace(/\D/g, "")
    if (digits.length === 10) return `+91${digits}`
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`
    return ""
  },
}))
vi.mock("@/lib/notification", () => ({
  sendPushNotification: vi.fn(),
}))

import {
  getAdminCustomers,
  adminDeleteCustomer,
  adminSendCustomerMessage,
} from "@/actions/admin/admin-customers"
import { requireAdmin, logAdminAction } from "@/lib/auth-guards"

const adminSession = { user: { id: "admin-1" } }

describe("admin-customers", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getAdminCustomers", () => {
    it("returns null when not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValue(new Error("notFound"))

      const result = await getAdminCustomers()
      expect(result).toBeNull()
    })

    it("aggregates stats and customers", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.user.count.mockImplementation(async () => 3)
      mockPrisma.order.groupBy.mockResolvedValue([{ userId: "u-1", _count: { id: 2 } }])
      mockPrisma.payment.groupBy.mockResolvedValue([])
      mockPrisma.address.groupBy.mockResolvedValue([])
      mockPrisma.serviceZone.findMany.mockResolvedValue([])
      const now = new Date()
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user0001",
          name: "John",
          fullName: null,
          phoneNumber: "+919999999999",
          email: "john@test.com",
          banned: false,
          image: null,
          emailVerified: true,
          phoneNumberVerified: false,
          role: "customer",
          createdAt: now,
          addresses: [],
          sessions: [{ createdAt: now }],
        },
      ])
      mockPrisma.order.findMany.mockResolvedValue([])

      const result = await getAdminCustomers()

      expect(result).not.toBeNull()
      expect(result!.stats.total).toBe(3)
      expect(result!.customers).toHaveLength(1)
      expect(result!.customers[0].id).toBe("CUS0001")
      expect(result!.customers[0].verified).toBe(true)
    })
  })

  describe("adminDeleteCustomer", () => {
    it("soft-deletes customer and revokes sessions", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.$transaction.mockResolvedValue([])
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const res = await adminDeleteCustomer("u-1")

      expect(res.ok).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
      const tx = mockPrisma.$transaction.mock.calls[0][0]
      expect(tx[0]).toEqual(mockPrisma.session.deleteMany({ where: { userId: "u-1" } }))
      expect(tx[1]).toEqual(
        mockPrisma.user.update({
          where: { id: "u-1" },
          data: { deletedAt: expect.any(Date), isActive: false, banned: true, banReason: "Deleted by admin" },
        }),
      )
    })
  })

  describe("adminSendCustomerMessage", () => {
    it("sends push to subscriptions", async () => {
      vi.mocked(requireAdmin).mockResolvedValue({ session: adminSession } as never)
      mockPrisma.pushSubscription.findMany.mockResolvedValue([
        { id: "sub-1", userId: "u-1", endpoint: "ep", p256dh: "p", auth: "a" },
      ])
      mockPrisma.notificationLog.create.mockResolvedValue({})
      vi.mocked(logAdminAction).mockResolvedValue(undefined as never)

      const res = await adminSendCustomerMessage("u-1", "Hello", "Body")

      expect(res.ok).toBe(true)
      expect(res.sent).toBe(1)
      expect(mockPrisma.notificationLog.create).toHaveBeenCalled()
    })
  })
})