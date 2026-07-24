import { describe, it, expect, vi, beforeEach } from "vitest"

const mockTx = {
  order: { update: vi.fn().mockResolvedValue({}) },
  payment: { update: vi.fn().mockResolvedValue({}) },
  deliveryPartner: { update: vi.fn().mockResolvedValue({}) },
  codVariance: { create: vi.fn().mockResolvedValue({}) },
  orderStatusHistory: { create: vi.fn().mockResolvedValue({}) },
}

const mockPrisma = {
  order: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  payment: { update: vi.fn() },
  deliveryPartner: { update: vi.fn() },
  codVariance: { create: vi.fn() },
  orderStatusHistory: { create: vi.fn() },
  $transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) => {
    await cb(mockTx)
    return mockTx
  }),
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/ably/server", () => ({
  getAblyRest: () => ({ channels: { get: () => ({ publish: vi.fn() }) } }),
}))
vi.mock("@/actions/loyalty/loyalty", () => ({ awardPoints: vi.fn().mockResolvedValue(undefined) }))
vi.mock("@/actions/payouts/kitchen-payout", () => ({
  createKitchenPayout: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("@/actions/payouts/delivery-payout", () => ({
  createDeliveryPayout: vi.fn().mockResolvedValue(undefined),
}))

import { confirmCodDelivery } from "@/actions/delivery/confirm-cod-delivery"

describe("confirmCodDelivery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.update.mockResolvedValue({})
    mockTx.deliveryPartner.update.mockResolvedValue({})
    mockTx.codVariance.create.mockResolvedValue({})
    mockTx.orderStatusHistory.create.mockResolvedValue({})
  })

  it("confirms COD delivery with matching OTP", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    const result = await confirmCodDelivery("order-1", "1234", "rider-1", 200)

    expect(result.success).toBe(true)
    expect(result.variance).toBeUndefined()
    expect(mockPrisma.$transaction).toHaveBeenCalled()
  })

  it("throws on incorrect OTP", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    await expect(confirmCodDelivery("order-1", "9999", "rider-1", 200)).rejects.toThrow(
      "Incorrect delivery code"
    )
  })

  it("returns variance when cash entered differs from expected", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    const result = await confirmCodDelivery("order-1", "1234", "rider-1", 150)

    expect(result.success).toBe(true)
    expect(result.variance).toBe(50)
  })

  it("uses totalAmount as fallback when codAmountExpected is null", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: null,
      totalAmount: 300,
    })

    const result = await confirmCodDelivery("order-1", "1234", "rider-1", 300)

    expect(result.success).toBe(true)
    expect(result.variance).toBeUndefined()
  })

  it("creates codVariance when there is a difference", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    await confirmCodDelivery("order-1", "1234", "rider-1", 180)

    expect(mockTx.codVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-1",
          varianceAmount: 20,
        }),
      })
    )
  })

  it("does not create codVariance when amounts match", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    await confirmCodDelivery("order-1", "1234", "rider-1", 200)

    expect(mockTx.codVariance.create).not.toHaveBeenCalled()
  })

  it("increments rider cashInHand", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    await confirmCodDelivery("order-1", "1234", "rider-1", 200)

    expect(mockTx.deliveryPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rider-1" },
        data: { cashInHand: { increment: 200 } },
      })
    )
  })

  it("marks payment as SUCCESS", async () => {
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      deliveryOtp: "1234",
      codAmountExpected: 200,
      totalAmount: 200,
    })

    await confirmCodDelivery("order-1", "1234", "rider-1", 200)

    expect(mockTx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: "order-1" },
        data: expect.objectContaining({ status: "SUCCESS" }),
      })
    )
  })
})
