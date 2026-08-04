"use server"

import prisma from "@/lib/prisma"
import { razorpayClient } from "@/lib/razorpay"

interface RazorpayXPayout {
  id: string
  fund_account_id?: string
  status: string
}

interface RazorpayXFundAccount {
  id: string
}

interface RazorpayXClient {
  payouts: {
    create(data: Record<string, unknown>): Promise<RazorpayXPayout>
    fetch(id: string): Promise<RazorpayXPayout>
  }
  fundAccounts: {
    create(data: Record<string, unknown>): Promise<RazorpayXFundAccount>
  }
}

const razorpayX = razorpayClient as unknown as RazorpayXClient

export async function createKitchenPayout(
  orderId: string,
  commissionRate = 0.15,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        where: { status: "CONFIRMED" },
        include: { menuItem: true },
      },
      couponRedemption: { include: { coupon: true } },
      payment: true,
    },
  })

  if (!order) throw new Error("Order not found")
  if (!order.payment || order.payment.status === "PENDING") throw new Error("Payment not completed")

  const fulfilledItems = order.orderItems.filter((i) => i.status === "CONFIRMED")
  if (fulfilledItems.length === 0) return { payouts: [] }

  const kitchenGroups = new Map<string, { gross: number; items: typeof fulfilledItems }>()
  for (const item of fulfilledItems) {
    const existing = kitchenGroups.get(item.kitchenPartnerId) ?? { gross: 0, items: [] }
    existing.gross += Number(item.unitPrice) * item.quantity + Number(item.packagingFee)
    existing.items = [...existing.items, item]
    kitchenGroups.set(item.kitchenPartnerId, existing)
  }

  const discountFraction = fulfilledItems.length > 0
    ? fulfilledItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0) /
      order.orderItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 1)
    : 0

  const couponBorneByKitchen = order.couponRedemption?.coupon.scope === "KITCHEN_SPECIFIC"
    ? Number(order.discountAmount) * discountFraction
    : 0

  const payouts = []
  for (const [kitchenPartnerId, group] of kitchenGroups) {
    const grossAmount = group.gross
    const commissionAmount = Math.round(grossAmount * commissionRate * 100) / 100
    const kitchenCouponShare = order.couponRedemption?.coupon.scope === "KITCHEN_SPECIFIC"
      ? Math.round(couponBorneByKitchen * (group.gross / [...kitchenGroups.values()].reduce((s, g) => s + g.gross, 0)) * 100) / 100
      : 0
    const netAmount = grossAmount - commissionAmount - kitchenCouponShare

    const payout = await prisma.kitchenPayout.upsert({
      where: { orderId: orderId },
      update: {
        grossAmount,
        commissionAmount,
        couponBorneByKitchen: kitchenCouponShare,
        netAmount,
      },
      create: {
        kitchenPartnerId,
        orderId,
        grossAmount,
        commissionAmount,
        couponBorneByKitchen: kitchenCouponShare,
        netAmount,
      },
    })

    payouts.push(payout)
  }

  return { payouts }
}

export async function settleKitchenPayout(kitchenPayoutId: string) {
  const payout = await prisma.kitchenPayout.findUnique({
    where: { id: kitchenPayoutId },
    include: {
      kitchenPartner: {
        include: { kitchenKyc: true },
      },
    },
  })

  if (!payout) throw new Error("Payout not found")
  if (payout.status !== "PENDING") throw new Error("Payout is not in PENDING state")

  const kyc = payout.kitchenPartner.kitchenKyc
  if (!kyc?.upiId && !kyc?.bankAccountNumber) {
    throw new Error("Kitchen partner has no UPI or bank account on file")
  }

  await prisma.kitchenPayout.update({
    where: { id: kitchenPayoutId },
    data: { status: "PROCESSING" },
  })

  try {
    const fundAccountId = kyc.upiId
      ? await getOrCreateUPIFundAccount(payout.kitchenPartnerId, kyc.upiId)
      : await getOrCreateBankFundAccount(
          payout.kitchenPartnerId,
          kyc.bankAccountNumber!,
          kyc.ifscCode!,
          kyc.accountHolderName ?? kyc.upiId ?? "",
        )

    const rzpPayout = await razorpayX.payouts.create({
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER!,
      fund_account_id: fundAccountId,
      amount: Math.round(Number(payout.netAmount) * 100),
      currency: "INR",
      mode: kyc.upiId ? "UPI" : "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      notes: { kitchenPartnerId: payout.kitchenPartnerId, payoutId: kitchenPayoutId },
    })

    await prisma.kitchenPayout.update({
      where: { id: kitchenPayoutId },
      data: {
        razorpayPayoutId: rzpPayout.id,
      },
    })

    return { success: true, razorpayPayoutId: rzpPayout.id }
  } catch (err) {
    console.error("RazorpayX payout failed:", err)
    await prisma.kitchenPayout.update({
      where: { id: kitchenPayoutId },
      data: { status: "FAILED" },
    })
    return { success: false, error: "Payout failed" }
  }
}

export async function processScheduledKitchenPayouts() {
  const pendingPayouts = await prisma.kitchenPayout.findMany({
    where: { status: "PENDING" },
    include: {
      kitchenPartner: {
        include: { kitchenKyc: true },
      },
    },
  })

  const results = []
  for (const payout of pendingPayouts) {
    try {
      const result = await settleKitchenPayout(payout.id)
      results.push({ payoutId: payout.id, ...result })
    } catch (err) {
      results.push({ payoutId: payout.id, success: false, error: String(err) })
    }
  }

  return results
}

async function getOrCreateUPIFundAccount(kitchenPartnerId: string, upiId: string) {
  const existing = await prisma.kitchenPayout.findFirst({
    where: { kitchenPartnerId, razorpayPayoutId: { not: null } },
    orderBy: { createdAt: "desc" },
  })

  if (existing?.razorpayPayoutId) {
    try {
      const payout = await razorpayX.payouts.fetch(existing.razorpayPayoutId)
      if (payout.fund_account_id) return payout.fund_account_id
    } catch {
      // ignore and create new
    }
  }

  const fundAccount = await razorpayX.fundAccounts.create({
    contact_id: await getOrCreateContact(kitchenPartnerId),
    account_type: "vpa",
    vpa: { address: upiId },
  })

  return fundAccount.id
}

async function getOrCreateBankFundAccount(
  kitchenPartnerId: string,
  accountNumber: string,
  ifsc: string,
  holderName: string,
) {
  const fundAccount = await razorpayX.fundAccounts.create({
    contact_id: await getOrCreateContact(kitchenPartnerId),
    account_type: "bank_account",
    bank_account: {
      name: holderName,
      ifsc,
      account_number: accountNumber,
    },
  })

  return fundAccount.id
}

async function getOrCreateContact(kitchenPartnerId: string) {
  return `contact_${kitchenPartnerId}`
}
