/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/lib/prisma"
import { razorpayClient } from "@/lib/razorpay"

const razorpayX = razorpayClient as any

export async function createDeliveryPayout(
  orderId: string,
  deliveryAmount: number,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { deliveryPartnerId: true, payment: true },
  })

  if (!order) throw new Error("Order not found")
  if (!order.deliveryPartnerId) throw new Error("No delivery partner assigned")
  if (!order.payment || order.payment.status === "PENDING") throw new Error("Payment not completed")

  const payout = await prisma.deliveryPartnerPayout.upsert({
    where: { orderId },
    update: { amount: deliveryAmount },
    create: {
      deliveryPartnerId: order.deliveryPartnerId,
      orderId,
      amount: deliveryAmount,
    },
  })

  return payout
}

export async function settleDeliveryPayout(deliveryPayoutId: string) {
  const payout = await prisma.deliveryPartnerPayout.findUnique({
    where: { id: deliveryPayoutId },
    include: {
      deliveryPartner: {
        include: { kyc: true },
      },
    },
  })

  if (!payout) throw new Error("Payout not found")
  if (payout.status !== "PENDING") throw new Error("Payout not in PENDING state")

  const kyc = payout.deliveryPartner.kyc
  if (!kyc?.upiId && !kyc?.bankAccountNumber) {
    throw new Error("Delivery partner has no UPI or bank account on file")
  }

  await prisma.deliveryPartnerPayout.update({
    where: { id: deliveryPayoutId },
    data: { status: "PROCESSING" },
  })

  try {
    const fundAccountId = kyc.upiId
      ? await createUPIFundAccount(payout.deliveryPartnerId, kyc.upiId)
      : await createBankFundAccount(
          payout.deliveryPartnerId,
          kyc.bankAccountNumber!,
          kyc.ifscCode!,
          kyc.accountHolderName ?? "Delivery Partner",
        )

    const rzpPayout = await razorpayX.payouts.create({
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER!,
      fund_account_id: fundAccountId,
      amount: Math.round(Number(payout.amount) * 100),
      currency: "INR",
      mode: kyc.upiId ? "UPI" : "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      notes: { deliveryPartnerId: payout.deliveryPartnerId, payoutId: deliveryPayoutId },
    })

    await prisma.deliveryPartnerPayout.update({
      where: { id: deliveryPayoutId },
      data: { razorpayPayoutId: rzpPayout.id },
    })

    return { success: true, razorpayPayoutId: rzpPayout.id }
  } catch (err) {
    console.error("RazorpayX delivery payout failed:", err)
    await prisma.deliveryPartnerPayout.update({
      where: { id: deliveryPayoutId },
      data: { status: "FAILED" },
    })
    return { success: false, error: "Delivery payout failed" }
  }
}

export async function settleDeliveryPayouts() {
  const pendingPayouts = await prisma.deliveryPartnerPayout.findMany({
    where: { status: "PENDING" },
    include: {
      deliveryPartner: { include: { kyc: true } },
    },
  })

  const results = []
  for (const payout of pendingPayouts) {
    try {
      const result = await settleDeliveryPayout(payout.id)
      results.push({ payoutId: payout.id, ...result })
    } catch (err) {
      results.push({ payoutId: payout.id, success: false, error: String(err) })
    }
  }

  return results
}

async function createUPIFundAccount(deliveryPartnerId: string, upiId: string) {
  const fundAccount = await razorpayX.fundAccounts.create({
    contact_id: `contact_dp_${deliveryPartnerId}`,
    account_type: "vpa",
    vpa: { address: upiId },
  })
  return fundAccount.id
}

async function createBankFundAccount(
  deliveryPartnerId: string,
  accountNumber: string,
  ifsc: string,
  holderName: string,
) {
  const fundAccount = await razorpayX.fundAccounts.create({
    contact_id: `contact_dp_${deliveryPartnerId}`,
    account_type: "bank_account",
    bank_account: {
      name: holderName,
      ifsc,
      account_number: accountNumber,
    },
  })
  return fundAccount.id
}

export async function processWebhookPayout(razorpayPayoutId: string, status: "SETTLED" | "FAILED") {
  const kitchenPayout = await prisma.kitchenPayout.findFirst({
    where: { razorpayPayoutId },
  })

  if (kitchenPayout) {
    await prisma.kitchenPayout.update({
      where: { id: kitchenPayout.id },
      data: {
        status: status === "SETTLED" ? "SETTLED" : "FAILED",
        settledAt: status === "SETTLED" ? new Date() : undefined,
      },
    })
    return
  }

  const deliveryPayout = await prisma.deliveryPartnerPayout.findFirst({
    where: { razorpayPayoutId },
  })

  if (deliveryPayout) {
    await prisma.deliveryPartnerPayout.update({
      where: { id: deliveryPayout.id },
      data: {
        status: status === "SETTLED" ? "SETTLED" : "FAILED",
        settledAt: status === "SETTLED" ? new Date() : undefined,
      },
    })
  }
}
