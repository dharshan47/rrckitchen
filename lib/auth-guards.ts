import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) notFound();

  const adminProfile = await prisma.adminProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!adminProfile || !adminProfile.isActive) notFound();

  if (!session.user.twoFactorEnabled) {
    redirect("/admin/2fa-setup");
  }

  return { session, adminProfile };
}

export async function requirePermission(permission: AdminPermission) {
  const { session, adminProfile } = await requireAdmin();
  if (!adminProfile.permissions.includes(permission)) notFound();
  return { session, adminProfile };
}

export async function logAdminAction(params: {
  actorUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: object;
}) {
  await prisma.adminAuditLog.create({ data: params });
}

export async function getPostLoginRedirect(userId: string) {
  const adminProfile = await prisma.adminProfile.findUnique({
    where: { userId },
  });
  if (adminProfile?.isActive) return "/admin";

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId },
  });
  if (kitchenPartner && kitchenPartner.status !== "PENDINGAPPROVAL") {
    return "/kitchen/dashboard";
  }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId },
  });
  if (deliveryPartner && deliveryPartner.status !== "PENDINGAPPROVAL") {
    return "/delivery-partner/dashboard";
  }

  return "/";
}
