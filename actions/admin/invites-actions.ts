"use server";
import crypto from "crypto";
import { requirePermission, logAdminAction } from "@/lib/auth-guards";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";

export async function createAdminInvite(permissions: AdminPermission[]) {
  const { session } = await requirePermission("MANAGE_ADMINS");

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.adminInvite.create({
    data: {
      token,
      permissions,
      createdByUserId: session.user.id,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
    },
  });
  await logAdminAction({
    actorUserId: session.user.id,
    action: "INVITE_ADMIN",
    metadata: { permissions },
  });

  return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
}

export async function acceptAdminInvite(token: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("You must be signed in to accept this invite");
  }

  const invite = await prisma.adminInvite.findUnique({ where: { token } });
  if (!invite || invite.consumedAt || invite.revokedAt || invite.expiresAt < new Date()) {
    throw new Error("This invite link is invalid or has expired");
  }

  const alreadyAdmin = await prisma.adminProfile.findUnique({ where: { userId: session.user.id } });
  if (alreadyAdmin) {
    throw new Error("This account already has admin access");
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });

  await prisma.$transaction([
    prisma.adminInvite.update({
      where: { id: invite.id },
      data: { consumedAt: new Date(), consumedByUserId: session.user.id },
    }),
    prisma.adminProfile.create({
      data: {
        userId: session.user.id,
        permissions: invite.permissions,
        invitedByUserId: invite.createdByUserId,
      },
    }),
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: session.user.id, roleId: adminRole.id } },
      create: { userId: session.user.id, roleId: adminRole.id },
      update: {},
    }),
  ]);

  await logAdminAction({
    actorUserId: session.user.id,
    action: "ACCEPT_ADMIN_INVITE",
    metadata: { invitedByUserId: invite.createdByUserId },
  });
}
