"use server";
import crypto from "crypto";
import { requirePermission, logAdminAction } from "@/lib/auth-guards";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id";

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

/** Public validation for the invite accept page: no permission required. */
export async function validateAdminInvite(token: string) {
  const invite = await prisma.adminInvite.findUnique({ where: { token } });
  if (!invite) return { valid: false as const, reason: "not_found" as const };
  if (invite.consumedAt) return { valid: false as const, reason: "consumed" as const };
  if (invite.revokedAt) return { valid: false as const, reason: "revoked" as const };
  if (invite.expiresAt < new Date()) return { valid: false as const, reason: "expired" as const };
  return {
    valid: true as const,
    permissions: invite.permissions,
    expiresAt: invite.expiresAt.toISOString(),
  };
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

  await prisma.$transaction(async (tx) => {
    await tx.adminInvite.update({
      where: { id: invite.id },
      data: { consumedAt: new Date(), consumedByUserId: session.user.id },
    });
    await tx.adminProfile.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.ADMIN),
        userId: session.user.id,
        permissions: invite.permissions,
        invitedByUserId: invite.createdByUserId,
      },
    });
    await tx.userRole.upsert({
      where: { userId_roleId: { userId: session.user.id, roleId: adminRole.id } },
      create: { userId: session.user.id, roleId: adminRole.id },
      update: {},
    });
  });

  await logAdminAction({
    actorUserId: session.user.id,
    action: "ACCEPT_ADMIN_INVITE",
    metadata: { invitedByUserId: invite.createdByUserId },
  });
}

export async function getAdminInvites() {
  try { await requirePermission("MANAGE_ADMINS") } catch { return [] }

  const invites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "desc" },
  })

  const creatorNames = new Map<string, string | null>()
  const creatorUserIds = invites.map((inv) => inv.createdByUserId)
  if (creatorUserIds.length > 0) {
    const creators = await prisma.user.findMany({
      where: { id: { in: creatorUserIds } },
      select: { id: true, name: true, email: true },
    })
    for (const u of creators) creatorNames.set(u.id, u.name ?? u.email)
  }

  return invites.map((inv) => ({
    id: inv.id,
    token: inv.token,
    createdBy: creatorNames.get(inv.createdByUserId) ?? null,
    permissions: inv.permissions,
    createdAt: inv.createdAt.toISOString(),
    expiresAt: inv.expiresAt.toISOString(),
    consumedAt: inv.consumedAt?.toISOString() || null,
    revokedAt: inv.revokedAt?.toISOString() || null,
  }))
}

export async function getActiveAdmins() {
  try { await requirePermission("MANAGE_ADMINS") } catch { return [] }

  const admins = await prisma.adminProfile.findMany({
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" }
  })

  const invitedByName = new Map<string, string>()
  const invitedByUserIds = admins
    .map((a) => a.invitedByUserId)
    .filter((id): id is string => id != null)
  if (invitedByUserIds.length > 0) {
    const invitedByUsers = await prisma.user.findMany({
      where: { id: { in: invitedByUserIds } },
      select: { id: true, name: true, email: true },
    })
    for (const u of invitedByUsers) invitedByName.set(u.id, u.name ?? u.email ?? "")
  }

  const adminUserIds = admins.map((a) => a.userId)
  const lastSessionMap = new Map<string, string>()
  if (adminUserIds.length > 0) {
    const lastSessions = await prisma.session.findMany({
      where: { userId: { in: adminUserIds } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, createdAt: true },
    })
    for (const s of lastSessions) {
      if (!lastSessionMap.has(s.userId)) lastSessionMap.set(s.userId, s.createdAt.toISOString())
    }
  }

  return admins.map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.user.name ?? a.user.email ?? "",
    email: a.user.email ?? "",
    image: a.user.image,
    permissions: a.permissions,
    invitedBy: a.invitedByUserId ? (invitedByName.get(a.invitedByUserId) ?? null) : null,
    joinedOn: a.createdAt.toISOString(),
    lastActive: lastSessionMap.get(a.userId) ?? null,
    status: a.isActive ? "ACTIVE" : "INACTIVE",
  }))
}

/** Revoke a pending invite. */
export async function revokeAdminInvite(inviteId: string) {
  try {
    const { session } = await requirePermission("MANAGE_ADMINS")
    const invite = await prisma.adminInvite.findUnique({ where: { id: inviteId } })
    if (!invite) return { ok: false as const, error: "Invite not found" }
    if (invite.consumedAt) return { ok: false as const, error: "Invite already used" }
    if (invite.revokedAt) return { ok: false as const, error: "Invite already revoked" }

    await prisma.adminInvite.update({ where: { id: inviteId }, data: { revokedAt: new Date() } })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "REVOKE_ADMIN_INVITE",
      targetType: "AdminInvite",
      targetId: inviteId,
    })
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to revoke invite" }
  }
}

/** Permanently delete an invite (revoked/expired cleanup). */
export async function deleteAdminInvite(inviteId: string) {
  try {
    const { session } = await requirePermission("MANAGE_ADMINS")
    const invite = await prisma.adminInvite.findUnique({ where: { id: inviteId } })
    if (!invite) return { ok: false as const, error: "Invite not found" }
    if (invite.consumedAt) return { ok: false as const, error: "Invite already used" }

    await prisma.adminInvite.delete({ where: { id: inviteId } })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "DELETE_ADMIN_INVITE",
      targetType: "AdminInvite",
      targetId: inviteId,
    })
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to delete invite" }
  }
}

/** Deactivate an admin profile (removes access). */
export async function deactivateAdmin(profileId: string) {
  try {
    const { session } = await requirePermission("MANAGE_ADMINS")
    const profile = await prisma.adminProfile.findUnique({ where: { id: profileId } })
    if (!profile) return { ok: false as const, error: "Admin not found" }
    if (profile.userId === session.user.id) return { ok: false as const, error: "You cannot deactivate your own account" }

    await prisma.adminProfile.update({ where: { id: profileId }, data: { isActive: false } })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "DEACTIVATE_ADMIN",
      targetType: "AdminProfile",
      targetId: profileId,
    })
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to deactivate admin" }
  }
}

/** Reactivate a deactivated admin profile. */
export async function reactivateAdmin(profileId: string) {
  try {
    const { session } = await requirePermission("MANAGE_ADMINS")
    const profile = await prisma.adminProfile.findUnique({ where: { id: profileId } })
    if (!profile) return { ok: false as const, error: "Admin not found" }

    await prisma.adminProfile.update({ where: { id: profileId }, data: { isActive: true } })
    await logAdminAction({
      actorUserId: session.user.id,
      action: "REACTIVATE_ADMIN",
      targetType: "AdminProfile",
      targetId: profileId,
    })
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to reactivate admin" }
  }
}
