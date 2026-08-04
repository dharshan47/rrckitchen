"use server";

import { requireAdmin, requirePermission } from "@/lib/auth-guards";
import prisma from "@/lib/prisma";
import { refundOrder } from "@/actions/payments/payment";
import type { AdminPermission } from "@/lib/generated/prisma/client";

const REFUND_APPROVAL_THRESHOLD = 2000;

export async function requestLargeRefund(orderId: string, amount: number, reason: string) {
  const { session } = await requirePermission("ISSUE_REFUNDS");

  if (amount < REFUND_APPROVAL_THRESHOLD) {
    await refundOrder(orderId, "OTHER");
    return { status: "processed" as const };
  }

  await prisma.adminApprovalRequest.create({
    data: { actionType: "LARGE_REFUND", targetId: orderId, payload: { amount, reason }, requestedByUserId: session.user.id },
  });
  return { status: "pending_approval" as const };
}

export async function decideApprovalRequest(requestId: string, approve: boolean) {
  const { session } = await requireAdmin();
  const request = await prisma.adminApprovalRequest.findUniqueOrThrow({ where: { id: requestId } });

  if (request.requestedByUserId === session.user.id) {
    throw new Error("You cannot approve your own request");
  }
  if (request.status !== "PENDING") throw new Error("Already decided");

  const requiredPermission = {
    REMOVE_ADMIN: "MANAGE_ADMINS", GRANT_PERMISSION: "MANAGE_ADMINS",
    LARGE_REFUND: "ISSUE_REFUNDS", PAYOUT_SETTLEMENT: "MANAGE_PAYOUTS", BAN_USER: "BAN_USERS",
  } as const;
  await requirePermission(requiredPermission[request.actionType]);

  await prisma.adminApprovalRequest.update({
    where: { id: requestId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedByUserId: session.user.id, decidedAt: new Date() },
  });

  if (!approve) return;

  const targetId = request.targetId;
  const payload = request.payload as Record<string, unknown> | null;

  switch (request.actionType) {
    case "LARGE_REFUND":
      if (targetId) {
        await refundOrder(targetId, "OTHER");
      }
      break;

    case "REMOVE_ADMIN":
      if (targetId) {
        await prisma.adminProfile.update({
          where: { userId: targetId },
          data: { isActive: false },
        });
      }
      break;

    case "GRANT_PERMISSION":
      if (targetId && payload?.permission) {
        const profile = await prisma.adminProfile.findUnique({ where: { userId: targetId } });
        if (profile && !profile.permissions.includes(payload.permission as AdminPermission)) {
          await prisma.adminProfile.update({
            where: { userId: targetId },
            data: { permissions: { push: payload.permission as AdminPermission } },
          });
        }
      }
      break;

    case "PAYOUT_SETTLEMENT":
      if (targetId) {
        await prisma.kitchenPayout
          .update({ where: { id: targetId }, data: { status: "SETTLED" } })
          .catch(() =>
            prisma.deliveryPartnerPayout.update({
              where: { id: targetId },
              data: { status: "SETTLED" },
            })
          );
      }
      break;

    case "BAN_USER":
      if (targetId) {
        await prisma.user.update({
          where: { id: targetId },
          data: { banned: true, banReason: (payload?.reason as string) ?? null },
        });
      }
      break;
  }
}