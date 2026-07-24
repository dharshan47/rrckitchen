import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = {
  referral: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  loyaltyPoints: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  loyaltyTransaction: {
    create: vi.fn(),
    aggregate: vi.fn(),
  },
  $transaction: vi.fn(async (cbs: unknown) => {
    if (Array.isArray(cbs)) {
      for (const fn of cbs) await fn
    } else if (typeof cbs === "function") {
      const tx = {
        loyaltyPoints: { create: vi.fn(), update: vi.fn() },
        loyaltyTransaction: { create: vi.fn() },
        referral: { update: vi.fn() },
      }
      const result = await cbs(tx)
      return result ?? tx
    }
  }),
}

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }))
vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(() => ({ user: { id: "user-1" } })),
}))
vi.mock("@/actions/loyalty/loyalty", () => ({
  computeTier: vi.fn().mockReturnValue("BRONZE"),
}))

import {
  getOrCreateReferralCode,
  getReferrerByCode,
  processReferralOnSignup,
  awardReferralFirstOrderPoints,
  getReferralCode,
  getReferralStats,
} from "@/actions/referral/referral"

describe("referral", () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe("getOrCreateReferralCode", () => {
    it("returns existing referral code", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue({ referralCode: "EXISTING" })

      const code = await getOrCreateReferralCode()

      expect(code).toBe("EXISTING")
      expect(mockPrisma.referral.create).not.toHaveBeenCalled()
    })

    it("creates new code when none exists", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue(null)
      mockPrisma.referral.findUnique.mockResolvedValue(null)
      mockPrisma.referral.create.mockResolvedValue({})

      const code = await getOrCreateReferralCode()

      expect(code).toMatch(/^[A-Z0-9]{8}$/)
      expect(mockPrisma.referral.create).toHaveBeenCalled()
    })

    it("retries on code conflict", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue(null)
      mockPrisma.referral.findUnique
        .mockResolvedValueOnce({ referralCode: "TAKEN" })
        .mockResolvedValueOnce(null)
      mockPrisma.referral.create.mockResolvedValue({})

      const code = await getOrCreateReferralCode()

      expect(code).toMatch(/^[A-Z0-9]{8}$/)
      expect(mockPrisma.referral.findUnique).toHaveBeenCalledTimes(2)
    })
  })

  describe("getReferrerByCode", () => {
    it("returns referrerId for valid code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({ referrerId: "referrer-1" })

      const result = await getReferrerByCode("CODE123")

      expect(result).toBe("referrer-1")
    })

    it("returns null for invalid code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue(null)

      const result = await getReferrerByCode("INVALID")

      expect(result).toBeNull()
    })
  })

  describe("processReferralOnSignup", () => {
    it("processes referral and awards points to referrer", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({ referrerId: "referrer-1" })
      mockPrisma.referral.findFirst.mockResolvedValue(null)
      mockPrisma.referral.update.mockResolvedValue({ id: "ref-1" })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockImplementation(async (cbs: unknown) => {
        if (typeof cbs === "function") {
          const tx = {
            loyaltyPoints: { create: vi.fn(), update: vi.fn() },
            loyaltyTransaction: { create: vi.fn() },
            referral: { update: vi.fn() },
          }
          await cbs(tx)
          return tx
        }
      })

      const result = await processReferralOnSignup("CODE123", "new-user-1")

      expect(result).not.toBeNull()
      expect(result?.id).toBe("ref-1")
    })

    it("returns null for invalid referral code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue(null)

      const result = await processReferralOnSignup("INVALID", "new-user-1")

      expect(result).toBeNull()
    })

    it("returns null if user already referred", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({ referrerId: "referrer-1" })
      mockPrisma.referral.findFirst.mockResolvedValue({ id: "existing" })

      const result = await processReferralOnSignup("CODE123", "new-user-1")

      expect(result).toBeNull()
    })

    it("increments existing loyalty points", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({ referrerId: "referrer-1" })
      mockPrisma.referral.findFirst.mockResolvedValue(null)
      mockPrisma.referral.update.mockResolvedValue({ id: "ref-1" })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({
        userId: "referrer-1",
        points: 200,
        lifetimePoints: 500,
      })
      mockPrisma.$transaction.mockImplementation(async (cbs: unknown) => {
        if (typeof cbs === "function") {
          const tx = {
            loyaltyPoints: { create: vi.fn(), update: vi.fn() },
            loyaltyTransaction: { create: vi.fn() },
            referral: { update: vi.fn() },
          }
          await cbs(tx)
          return tx
        }
      })

      const result = await processReferralOnSignup("CODE123", "new-user-1")

      expect(result).not.toBeNull()
    })
  })

  describe("awardReferralFirstOrderPoints", () => {
    it("awards first order points to referrer", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue({
        id: "ref-1",
        referrerId: "referrer-1",
        rewardAmount: 100,
      })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockImplementation(async (cbs: unknown) => {
        if (typeof cbs === "function") {
          const tx = {
            loyaltyPoints: { create: vi.fn(), update: vi.fn() },
            loyaltyTransaction: { create: vi.fn() },
            referral: { update: vi.fn() },
          }
          await cbs(tx)
          return tx
        }
      })

      const result = await awardReferralFirstOrderPoints("new-user-1")

      expect(result).not.toBeNull()
      expect(result?.referrerId).toBe("referrer-1")
    })

    it("returns null when no pending referral", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue(null)

      const result = await awardReferralFirstOrderPoints("new-user-1")

      expect(result).toBeNull()
    })

    it("marks referral as rewardPaid", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue({
        id: "ref-1",
        referrerId: "referrer-1",
        rewardAmount: 100,
      })
      mockPrisma.loyaltyPoints.findUnique.mockResolvedValue({
        userId: "referrer-1",
        points: 200,
        lifetimePoints: 500,
      })
      const mockUpdate = vi.fn()
      mockPrisma.$transaction.mockImplementation(async (cbs: unknown) => {
        if (typeof cbs === "function") {
          const tx = {
            loyaltyPoints: { create: vi.fn(), update: vi.fn() },
            loyaltyTransaction: { create: vi.fn() },
            referral: { update: mockUpdate },
          }
          await cbs(tx)
          return tx
        }
      })

      await awardReferralFirstOrderPoints("new-user-1")

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ref-1" },
          data: { rewardPaid: true },
        })
      )
    })
  })

  describe("getReferralCode", () => {
    it("returns referral code for authenticated user", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue({ referralCode: "MYCODE1" })

      const code = await getReferralCode()

      expect(code).toBe("MYCODE1")
    })

    it("returns null when no code exists", async () => {
      mockPrisma.referral.findFirst.mockResolvedValue(null)

      const code = await getReferralCode()

      expect(code).toBeNull()
    })
  })

  describe("getReferralStats", () => {
    it("returns referral stats", async () => {
      mockPrisma.referral.count.mockResolvedValue(5)
      mockPrisma.loyaltyTransaction.aggregate.mockResolvedValue({
        _sum: { points: 500 },
      })

      const stats = await getReferralStats()

      expect(stats?.totalReferrals).toBe(5)
      expect(stats?.totalPointsEarned).toBe(500)
    })

    it("returns zero points when no transactions", async () => {
      mockPrisma.referral.count.mockResolvedValue(0)
      mockPrisma.loyaltyTransaction.aggregate.mockResolvedValue({
        _sum: { points: null },
      })

      const stats = await getReferralStats()

      expect(stats?.totalReferrals).toBe(0)
      expect(stats?.totalPointsEarned).toBe(0)
    })
  })
})
