import { requirePermission } from "@/lib/auth-guards";
import prisma from "@/lib/prisma";
import { CashReconciliationClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CashReconciliationPage() {
  await requirePermission("MANAGE_PAYOUTS");

  const ridersWithCash = await prisma.deliveryPartner.findMany({
    where: { cashInHand: { gt: 0 } },
    orderBy: { cashInHand: "desc" },
    include: { user: { select: { name: true, phoneNumber: true } } },
  });

  const openVariances = await prisma.codVariance.findMany({
    where: { resolvedAt: null },
    include: {
      order: { select: { id: true } },
      deliveryPartner: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const remittances = await prisma.cashRemittance.findMany({
    where: { status: "PENDING" },
    include: {
      deliveryPartner: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CashReconciliationClient
      ridersWithCash={ridersWithCash.map((r) => ({
        id: r.id,
        name: r.user?.name ?? "Unknown",
        phone: r.user?.phoneNumber ?? "-",
        cashInHand: Number(r.cashInHand),
        codEligible: r.codEligible,
      }))}
      openVariances={openVariances.map((v) => ({
        id: v.id,
        orderId: v.order.id,
        riderName: v.deliveryPartner.user?.name ?? "Unknown",
        expectedAmount: Number(v.expectedAmount),
        enteredAmount: Number(v.enteredAmount),
        varianceAmount: Number(v.varianceAmount),
        createdAt: v.createdAt.toISOString(),
      }))}
      remittances={remittances.map((r) => ({
        id: r.id,
        riderName: r.deliveryPartner.user?.name ?? "Unknown",
        amount: Number(r.amount),
        method: r.method,
        referenceId: r.referenceId,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}