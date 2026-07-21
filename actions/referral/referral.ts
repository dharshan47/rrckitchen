"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { computeTier } from "@/actions/loyalty/loyalty"

const REFERRAL_POINTS = 100
const REFERRED_FIRST_ORDER_POINTS = 50

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function getOrCreateReferralCode(): Promise<string> {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const existing = await prisma.referral.findFirst({
    where: { referrerId: session.user.id },
    select: { referralCode: true },
  })
  if (existing) return existing.referralCode

  let code: string
  let attempts = 0
  do {
    code = generateReferralCode()
    const conflict = await prisma.referral.findUnique({ where: { referralCode: code } })
    if (!conflict) break
    attempts++
  } while (attempts < 10)

  await prisma.referral.create({
    data: {
      referrerId: session.user.id,
      referralCode: code,
    },
  })

  return code
}

export async function getReferrerByCode(code: string) {
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code },
    select: { referrerId: true },
  })
  return referral?.referrerId ?? null
}

export async function processReferralOnSignup(referralCode: string, newUserId: string) {
  const referrerId = await getReferrerByCode(referralCode)
  if (!referrerId) return null

  const existing = await prisma.referral.findFirst({
    where: { referralCode: referralCode, referredId: newUserId },
  })
  if (existing) return null

  const referral = await prisma.referral.update({
    where: { referralCode: referralCode },
    data: {
      referredId: newUserId,
      status: "COMPLETED",
      rewardAmount: REFERRAL_POINTS,
    },
  })

  await prisma.$transaction(async (tx) => {
    const current = await tx.loyaltyPoints.findUnique({ where: { userId: referrerId } })
    if (!current) {
      await tx.loyaltyPoints.create({
        data: {
          userId: referrerId,
          points: REFERRAL_POINTS,
          lifetimePoints: REFERRAL_POINTS,
          tier: await computeTier(REFERRAL_POINTS),
        },
      })
    } else {
      const newLifetime = current.lifetimePoints + REFERRAL_POINTS
      await tx.loyaltyPoints.update({
        where: { userId: referrerId },
        data: {
          points: { increment: REFERRAL_POINTS },
          lifetimePoints: { increment: REFERRAL_POINTS },
          tier: await computeTier(newLifetime),
        },
      })
    }

    await tx.loyaltyTransaction.create({
      data: {
        userId: referrerId,
        points: REFERRAL_POINTS,
        type: "EARNED",
        reference: `referral-${referral.id}`,
        description: `Referral bonus: you referred a new user! Earned ${REFERRAL_POINTS} points`,
      },
    })
  })

  return referral
}

export async function awardReferralFirstOrderPoints(referredUserId: string) {
  const referral = await prisma.referral.findFirst({
    where: { referredId: referredUserId, rewardPaid: false },
    select: { id: true, referrerId: true, rewardAmount: true },
  })
  if (!referral) return null

  const pointsToAward = REFERRED_FIRST_ORDER_POINTS

  await prisma.$transaction(async (tx) => {
    const current = await tx.loyaltyPoints.findUnique({ where: { userId: referral.referrerId } })

    if (!current) {
      await tx.loyaltyPoints.create({
        data: {
          userId: referral.referrerId,
          points: pointsToAward,
          lifetimePoints: pointsToAward,
          tier: await computeTier(pointsToAward),
        },
      })
    } else {
      const newLifetime = current.lifetimePoints + pointsToAward
      await tx.loyaltyPoints.update({
        where: { userId: referral.referrerId },
        data: {
          points: { increment: pointsToAward },
          lifetimePoints: { increment: pointsToAward },
          tier: await computeTier(newLifetime),
        },
      })
    }

    await tx.loyaltyTransaction.create({
      data: {
        userId: referral.referrerId,
        points: pointsToAward,
        type: "EARNED",
        reference: `referral-${referral.id}`,
        description: `Referral bonus: referred user placed their first order! Earned ${pointsToAward} points`,
      },
    })

    await tx.referral.update({
      where: { id: referral.id },
      data: { rewardPaid: true },
    })
  })

  return { referrerId: referral.referrerId }
}

export async function getReferralCode(): Promise<string | null> {
  const session = await getSession()
  if (!session?.user?.id) return null

  const referral = await prisma.referral.findFirst({
    where: { referrerId: session.user.id },
    select: { referralCode: true },
  })
  return referral?.referralCode ?? null
}

export async function getReferralStats() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const [referrals, totalEarned] = await Promise.all([
    prisma.referral.count({ where: { referrerId: session.user.id, referredId: { not: null } } }),
    prisma.loyaltyTransaction.aggregate({
      where: {
        userId: session.user.id,
        description: { contains: "Referral" },
      },
      _sum: { points: true },
    }),
  ])

  return {
    totalReferrals: referrals,
    totalPointsEarned: totalEarned._sum.points ?? 0,
  }
}