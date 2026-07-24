"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, requirePermission, logAdminAction } from "@/lib/auth-guards";

export async function getCurrentAdminPermissions() {
  try {
    const { adminProfile } = await requireAdmin();
    return adminProfile.permissions;
  } catch {
    return [];
  }
}

export async function getActiveAdmins() {
  try {
    const { adminProfile: caller } = await requireAdmin();
    const admins = await prisma.adminProfile.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true, banned: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const inviterIds = admins.map((a) => a.invitedByUserId).filter(Boolean) as string[];
    const inviters = inviterIds.length
      ? await prisma.user.findMany({
          where: { id: { in: inviterIds } },
          select: { id: true, name: true },
        })
      : [];
    const inviterMap = new Map(inviters.map((u) => [u.id, u.name]));

    return admins.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.user.name ?? "",
      email: a.user.email,
      phoneNumber: a.user.phoneNumber,
      permissions: a.permissions,
      isActive: a.isActive,
      banned: a.user.banned,
      invitedByName: a.invitedByUserId ? (inviterMap.get(a.invitedByUserId) ?? null) : null,
      createdAt: a.createdAt.toISOString(),
      canDeactivate: a.userId !== caller.userId,
    }));
  } catch {
    return [];
  }
}

export async function deactivateAdmin(userId: string) {
  const { session } = await requirePermission("MANAGE_ADMINS");

  if (userId === session.user.id) {
    throw new Error("You cannot deactivate yourself");
  }

  const target = await prisma.adminProfile.findUnique({ where: { userId } });
  if (!target) throw new Error("Admin not found");

  await prisma.adminProfile.update({
    where: { userId },
    data: { isActive: false },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    action: "REMOVE_ADMIN",
    targetType: "AdminProfile",
    targetId: target.id,
  });
}
