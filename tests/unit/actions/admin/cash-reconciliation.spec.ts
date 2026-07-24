import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  order: { findMany: vi.fn(), findFirst: vi.fn() },
  cashRemittance: { create: vi.fn(), findMany: vi.fn() },
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))

vi.mock("@/lib/auth-guards", () => ({ requirePermission: vi.fn() }))

import { getCodOrders } from "@/actions/admin/cash-reconciliation"

describe("cash-reconciliation", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns COD orders with delivery partner info", async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: "order-1", totalAmount: 500, codAmountExpected: 500, codAmountEntered: null,
        status: "READYFORPICKUP", createdAt: new Date(),
        deliveryPartner: { id: "dp-1", name: "Rider One", phone: "9999999999" },
        user: { name: "Customer A", phoneNumber: "8888888888" },
        payment: { id: "pay-1" },
      },
    ])

    const result = await getCodOrders()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("order-1")
    expect(result[0].deliveryPartner?.name).toBe("Rider One")
    expect(result[0].customerName).toBe("Customer A")
  })

  it("returns empty array when no COD orders", async () => {
    mockPrisma.order.findMany.mockResolvedValue([])
    expect(await getCodOrders()).toEqual([])
  })
})
